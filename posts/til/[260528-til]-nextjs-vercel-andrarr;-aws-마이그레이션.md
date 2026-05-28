<h1>Vercel &rarr; AWS 마이그레이션 마스터 플랜</h1>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">Next.js 앱을 Vercel에서 AWS(ECS Fargate)로 옮기는 작업을,<br />처음부터 끝까지 어떻게 설계하고 진행했는지의 압축 기록.<br />다음에 같은 일을 할 때 코드 디테일이 아니라 <b>순서&middot;결정&middot;함정</b> 중심으로 펼쳐보기 위한 노트.</p>
</blockquote>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">1. 무엇을, 왜</h2>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">Next.js Vercel 배포시, RDS 와 직접 붙어야 할 경우 any-open을 피할 수 없다.<br />RDS any-open 하지 않으려면 돈내고 Vercel static ip를 쓰거나 aws 이전이 필요하다.<br /><br /></p>
</blockquote>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>대상</b>: Next.js 16 앱 (App Router, RSC, Better Auth, Prisma 7)</li>
<li><b>출발</b>: Vercel (Edge + Vercel Build, 환경변수 UI 입력)</li>
<li><b>도착</b>: AWS ECS Fargate + ALB + ECR + Route 53 + Secrets Manager/SSM</li>
<li><b>DB</b>: 기존 RDS Postgres <b>재사용</b> (dev/prod 1개 공유 사용한 상황)</li>
<li><b>트래픽 전환</b>: 도메인 NS 이전을 단 한 번의 컷오버로 - 그 전까지 Vercel은 계속 운영</li>
<li><b>컷오버 후</b>: 1~2주 안정 운행 확인 후 Vercel 프로젝트 정리</li>
</ul>
<h2 data-ke-size="size26">2. 목표 아키텍처 한눈에</h2>
<pre class="routeros"><code>사용자
  │  HTTPS
  ▼
Route 53 (hosted zone: yourdomain.com)
  │  ALIAS A
  ▼
ALB (per env, TLS 1.3, HSTS, HTTP&rarr;HTTPS 301)
  │  443 &rarr; TG(3000)
  ▼
ECS Service (Fargate, env별 cluster, desired_count 운영자 관리)
  │  Task = Next.js standalone (Node 22 Alpine)
  ├──► Secrets Manager : DATABASE_URL, BETTER_AUTH_SECRET, GOOGLE_CLIENT_SECRET
  ├──► SSM SecureString : GOOGLE_CLIENT_ID
  ├──► SSM Standard    : BETTER_AUTH_URL, ALLOWED_EMAIL_DOMAIN, ...
  ├──► CloudWatch Logs : /ecs/lens-web-{env}
  └──► RDS (5432)      : 전용 SG, ECS SG로부터 ingress만
<p>CI/CD (GitHub Actions, OIDC)</p>
<ul>
<li>dev push → deploy-dev.yml → ECR push + ECS update</li>
<li>main push → deploy-prod.yml → manual approval → ECR push + ECS update</code></pre></li>
</ul>
<h2 data-ke-size="size26">3. 사이클 순서와 의존성</h2>
<pre class="routeros"><code>F  컨테이너화           ──► (코드를 빌드 가능한 이미지로)
   │
A  VPC/네트워킹/SG      ──► (모든 인프라의 기반)
   │
B  ECS 클러스터+ECR     ──► (이미지 &rarr; 실행)
   │
C  ALB + ACM + Route 53 ──► (트래픽 입구)
   │
E  Secrets/SSM          ──► (Task Def이 마지막에 secrets 매핑)
   │
D  CI/CD                ──► (자동 배포 + image_tag 갱신)
   │
H  백로그/잔손질        ──► (운영 안정성)
   │
I  RDS 전용 SG (사후)   ──► (default SG 의존 해소)</code></pre>
<p data-ke-size="size16"><br />순서의 핵심: <b>A 없이 B 없고, B 없이 C 없다</b>.<br />C까지는 신규 인프라를 짓는 단계라 <b>운영 영향 0</b>.<br />E는 어디든 끼울 수 있지만 D 전에는 들어가야 자동 배포가 의미 있음.</p>
<h2 data-ke-size="size26">4. 단계별 핵심 결정</h2>
<h3 data-ke-size="size23">F. 컨테이너화</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>output: 'standalone'</code></b> + 3-stage Dockerfile (deps &rarr; builder &rarr; runner)</li>
<li><b>Node 22 + Alpine</b> (musl 호환 라이브러리 주의)</li>
<li><b>Prisma 7 driver adapter (<code>adapter-pg</code>)</b> - binaryTargets/native binary 불필요. Prisma 6 이전 가이드와 다름</li>
<li><b>builder stage placeholder env</b> (<code>CI=1</code> + dummy DATABASE_URL) &mdash; t3-env validation을 빌드 시점에 통과시키기 위한 우회. final stage에는 누출 안 되도록 sanity check</li>
<li><b>sharp 명시적 dependency + outputFileTracingIncludes</b> (Image Optimization 안정화)</li>
<li><b><code>--platform linux/amd64</code></b> &mdash; 로컬 ARM Mac에서 빌드 시 Fargate(x86_64)와 어긋남 회피</li>
</ul>
<h3 data-ke-size="size23">A. VPC/네트워킹</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>기존 VPC 재사용</b>, subnet/SG는 신규 생성</li>
<li><b>환경 격리 단위는 prefix(<code>lens-{env}-*</code>)</b>, VPC는 공유. 별도 VPC로 가면 RDS 공유 정책상 VPC Peering 필요</li>
<li><b>Subnet CIDR 패턴</b>을 명시적 인덱스로 설정 (dev=120/121/130/131, prod=100/101/110/111) - 기존 subnet과 충돌 회피</li>
<li><b>2-AZ 분산</b> 강제 (ALB 요구)</li>
</ul>
<h3 data-ke-size="size23">B. ECS + ECR</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>ECR 1개 공유 repository (<code>lens-web</code>)</b> + <code>image_tag_mutability=MUTABLE</code> (<code>:latest</code> alias)</li>
<li><b>Cluster는 env별 분리</b> (<code>lens-dev</code>, <code>lens-prod</code>) - IAM Role naming unique 보장 + 운영 가시화</li>
<li><b>Service <code>desired_count=0</code> Day 1</b> - 첫 apply 직후 image_pull_failure로 죽는 걸 회피. <b>부트스트랩 후 CLI로 N으로 올림</b></li>
<li><b>Task sizing 환경별 차등</b>: dev 256/512, prod 512/1024</li>
<li><b>Service <code>lifecycle.ignore_changes=[desired_count, task_definition]</code></b> - Actions가 갱신하는 영역은 Terraform이 안 건드림</li>
<li><b>Log retention 환경별</b>: dev 7일, prod 30일</li>
</ul>
<h3 data-ke-size="size23">C. ALB + ACM + Route 53 + HSTS</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>환경별 ALB + 환경별 ACM cert</b> (인증서 갱신/관리 영향 분리)</li>
<li><b>Hosted zone은 단일</b> (<code>yourdomain.com</code>). prod env가 관리하고 dev env는 <code>data.aws_route53_zone</code>으로 참조. dev 서브도메인 레코드도 같은 zone 안에</li>
<li><b>CAA 레코드 필수</b>: 도메인 등록업체에 letsencrypt CAA가 박혀있으면 ACM이 발급 실패. amazon.com/amazontrust.com/awstrust.com/amazonaws.com 4개 추가. &rarr; 이건 Vercel 에 Domain 이 묶여 있어서 필요했던 과정. Vercel 이 인증서 넣어주니까.</li>
<li><b>HTTP 80 &rarr; HTTPS 443 301 redirect</b></li>
<li><b>TLS 1.3</b> (<code>ELBSecurityPolicy-TLS13-1-2-2021-06</code>)</li>
<li><b>HSTS</b> <code>max-age=31536000; includeSubDomains; preload</code> (ALB Listener 응답 헤더)</li>
<li><b>prod hosted zone <code>lifecycle.prevent_destroy=true</code></b> - 컷오버 후 사라지면 모든 DNS 깨짐</li>
<li><b>prod cert validation은 변수 토글 (<code>enable_cert_validation</code>)</b>: NS 미이전 상태에선 ACM polling이 hang하므로 부트스트랩 시 false, 컷오버 시 true</li>
</ul>
<h3 data-ke-size="size23">E. Secrets / SSM 환경변수 분류</h3>
<p data-ke-size="size16">5가지 카테고리로 명확히 나눔:</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>분류</th>
<th>저장소</th>
<th>주입 시점</th>
<th>예시</th>
</tr>
</thead>
<tbody>
<tr>
<td>비민감 빌드타임</td>
<td>Task Def <code>environment</code> (Terraform 박힘)</td>
<td>컨테이너 시작</td>
<td><code>NODE_ENV</code>, <code>PORT</code>, <code>APP_ENV</code>, <code>LOG_LEVEL</code></td>
</tr>
<tr>
<td>비민감 런타임</td>
<td>SSM Standard</td>
<td>컨테이너 시작 (ECS <code>secrets</code>)</td>
<td><code>BETTER_AUTH_URL</code>, <code>ALLOWED_EMAIL_DOMAIN</code></td>
</tr>
<tr>
<td>보안 중간</td>
<td>SSM SecureString</td>
<td>컨테이너 시작</td>
<td><code>GOOGLE_CLIENT_ID</code></td>
</tr>
<tr>
<td>시크릿 (회전 가치)</td>
<td>Secrets Manager</td>
<td>컨테이너 시작</td>
<td><code>DATABASE_URL</code>, <code>BETTER_AUTH_SECRET</code>, <code>GOOGLE_CLIENT_SECRET</code></td>
</tr>
<tr>
<td>클라이언트 번들</td>
<td>SSM Standard &rarr; Docker <code>--build-arg</code></td>
<td>빌드 타임</td>
<td><code>NEXT_PUBLIC_RUN_MODE</code></td>
</tr>
</tbody>
</table>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>명명</b>: Secrets Manager <code>lens/{env}/{name}</code>, SSM <code>/lens/{env}/{VAR}</code> - IAM ARN을 env별 narrow하기 좋게</li>
<li><b>실값은 Console 수동</b>: Terraform code/state/tfvars/git/PR 어디에도 0건. ARN만 코드에 등장</li>
<li><b>DATABASE_URL placeholder</b> (<code>postgresql://REPLACE_USER:REPLACE_PASS@host:port/db</code>)를 Terraform이 만들고, <code>lifecycle.ignore_changes=[secret_string]</code>로 Console 입력값 덮어쓰지 않게</li>
<li><b>IAM 정책 narrow</b>: <code>secretsmanager:GetSecretValue</code> resource = <code>secret:lens/{env}/*</code>, <code>ssm:GetParameter*</code> = <code>parameter/lens/{env}/*</code></li>
<li><b>KMS Decrypt는 wildcard</b> (Phase 2에서 CMK 분리)</li>
</ul>
<h3 data-ke-size="size23">D. CI/CD</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>GitHub OIDC</b> - 장기 IAM Access Key 폐지. account 1개당 OIDC Provider 1개라 shared state로 관리</li>
<li><b>Workflow 2개 분리</b> (<code>deploy-dev.yml</code> / <code>deploy-prod.yml</code>) - 단일 workflow보다 권한 분리 명확</li>
<li><b>IAM Role trust policy sub condition</b>: <code>repo:org/repo:environment:{env}</code> - environment 기반이 branch 기반보다 안전 (PR 합치는 사람이 trust 조건 우회 어려움)</li>
<li><b>GitHub Environment</b>: prod는 Required reviewers 설정 (manual approval gate)</li>
<li><b>Image tag</b>: <code>{env}-{sha}</code> + <code>{env}-latest</code> (env별 latest 분리로 dev/prod 충돌 방지)</li>
<li><b><code>aws-actions/amazon-ecs-render-task-definition@v1</code></b> + describe + jq strip 7 read-only fields &rarr; register-task-definition. secrets/env는 base에서 carry-over</li>
<li><b><code>wait-for-service-stability=true</code>, <code>wait-for-minutes=10</code></b></li>
</ul>
<h3 data-ke-size="size23">H. 백로그/잔손질</h3>
<p data-ke-size="size16">대형 변경은 아니지만 운영 안정성에 영향:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>README 운영 규약 섹션 (APP_ENV/LOG_LEVEL 값 강제, desired_count는 CLI로)</li>
<li><code>normalizeRequestId</code> 헬퍼 (로그 인젝션 방지)</li>
<li><code>--platform linux/amd64</code> 명시</li>
<li>Commit 전 dummy URL grep sanity step</li>
</ul>
<h3 data-ke-size="size23">I. RDS 전용 SG 분리 (사후 보강)</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>운영 중 발견: default VPC SG에 RDS + lens dev/prod ECS Fargate inbound rule이 모두 들어가 default가 사실상 RDS 전용으로 굳어가던 상태</li>
<li><b><code>lens-rds-sg</code>를 shared Terraform으로 신설</b>, dev/prod env가 <code>terraform_remote_state.outputs.rds_security_group_id</code>로 참조</li>
<li><b>swap 절차</b>: shared apply &rarr; Console에서 RDS에 default + 새 SG 양쪽 멤버 attach &rarr; dev apply &rarr; 검증 &rarr; prod apply &rarr; 검증 &rarr; Console에서 default 제거. 통신 끊김 없이 진행</li>
</ul>
<h2 data-ke-size="size26">5. 운영 영향 0 원칙</h2>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>시점</th>
<th>운영 영향</th>
</tr>
</thead>
<tbody>
<tr>
<td>F~D 모든 코드/Terraform 작업</td>
<td>0 (Vercel은 그대로)</td>
</tr>
<tr>
<td>dev 환경 검증 (<code>dev.yourdomain.com</code>)</td>
<td>0 (별도 도메인)</td>
</tr>
<tr>
<td>ECR/ECS/ALB 신규 자원 생성</td>
<td>0 (기존 도메인은 Vercel)</td>
</tr>
<tr>
<td><b>NS 이전 (Route 53 위임)</b></td>
<td><b>유일한 트래픽 전환</b> &mdash; 1~2시간 내 완료, 롤백은 NS 되돌리기</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">핵심은 <b>컷오버를 마지막 한 번에 몰기</b>. 부분 전환 없음~!</p>
<h2 data-ke-size="size26">6. 컷오버 순서 (요약)</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>dev 환경에서 며칠 운영해 안정성 확인</li>
<li>Vercel Ignored Build Step에 <code>exit 1</code> 적용하여 자동 배포 차단</li>
<li>main에 PR 머지 &rarr; Actions가 prod 배포</li>
<li>Manual approval &rarr; ECR push + ECS update</li>
<li><code>aws ecs update-service --desired-count 2</code>로 prod Task 띄움</li>
<li>ALB 직접 도메인으로 헬스체크 (Route 53 ALIAS A 미적용 상태)</li>
<li>도메인 등록업체 콘솔에서 NS를 Route 53 hosted zone NS로 이전</li>
<li>전파 확인 (<code>dig NS yourdomain.com @8.8.8.8</code>)</li>
<li>1~2주 안정 운행 후 Vercel 프로젝트 정리</li>
</ol>
<h2 data-ke-size="size26">7. 함정 모음 (다음엔 피하기)</h2>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>함정</th>
<th>증상</th>
<th>해소</th>
</tr>
</thead>
<tbody>
<tr>
<td>부모 zone에 letsencrypt CAA만 있음</td>
<td>ACM이 <code>CAA_ERROR</code>로 발급 거부</td>
<td>amazon.com 등 4개 CAA 추가</td>
</tr>
<tr>
<td><code>DATABASE_URL</code>에 <code>?sslmode=no-verify</code> 누락</td>
<td>ECS Task가 <code>P1010 connection refused</code></td>
<td>연결 문자열에 <code>?sslmode=no-verify</code> 추가</td>
</tr>
<tr>
<td><code>desired_count=2</code> Day 1</td>
<td>image_pull_failure 5회 후 Task 죽음</td>
<td>Day 1은 0, 부트스트랩 후 N으로</td>
</tr>
<tr>
<td>AWS SSO profile이 다른 계정</td>
<td>S3 backend 403 (state bucket)</td>
<td><code>aws sts get-caller-identity</code>로 사전 확인</td>
</tr>
<tr>
<td>Vercel root NS 변경 시도</td>
<td>"Cannot set NS records at the root level"</td>
<td>Vercel은 DNS 호스트, 레지스트라 콘솔(가비아 등)에서 변경</td>
</tr>
<tr>
<td><code>lifecycle.ignore_changes=[container_definitions]</code></td>
<td>secrets/env 추가가 사일런트 누락</td>
<td>머지 직후 <code>terraform apply -replace=module.ecs.aws_ecs_task_definition.app</code></td>
</tr>
<tr>
<td>RDS instance 외부 자원이라 Terraform이 SG 멤버십 못 만짐</td>
<td>SG swap 시 Console 수동 필요</td>
<td>양쪽 멤버 일시 유지 &rarr; 새것만 남김</td>
</tr>
<tr>
<td>Hosted zone NS가 시간차로 이전</td>
<td>dev/prod cert 발급 타이밍 어긋남</td>
<td>dev는 prod zone 안에 서브로 넣고 단일 zone 운영</td>
</tr>
<tr>
<td>ECS Task Def <code>secrets</code> 변경 누락 (재발 가능)</td>
<td>새 env가 컨테이너에 안 들어감</td>
<td>위 -replace 룰 + PR 체크리스트</td>
</tr>
</tbody>
</table>
<h2 data-ke-size="size26">8. 다음에 또 한다면 &mdash; 권장 변경</h2>
<p data-ke-size="size16">다 잘 됐지만 시간이 더 있었다면 다르게 했을 것들:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Task Def SSOT를 Terraform으로</b>: 현재는 Actions가 매 배포마다 새 revision register &rarr; Terraform이 <code>ignore_changes</code>로 따라감. Actions가 image push만 하고 <code>terraform apply -var="image_tag=..."</code>로 deploy하면 SSOT 일원화 + <code>-replace</code> 함정 자체가 사라짐. Trade-off: Actions runner에서 terraform 실행 &rarr; state lock/권한/시간 증가</li>
<li><b>NAT Gateway를 처음부터</b>: Public subnet + assign_public_ip는 비용 낮지만 보안 표면 넓음. NAT + Private subnet 패턴이 일반적 권장</li>
<li><b>WAF / Auto Scaling을 D 사이클에 포함</b>: 컷오버 후 별도로 처리하면 운영 부담</li>
<li><b>observability 강화</b>: CloudWatch만으론 부족. Datadog/Sentry 같은 외부 도구 초기 통합</li>
</ul>
<h2 data-ke-size="size26">9. 도구/버전 선택 (재사용 권장)</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Terraform 1.10+</b> + <b>AWS provider <code>~&gt; 6.0</code></b> + <b>S3 native <code>use_lockfile=true</code></b> (DynamoDB lock 테이블 불필요)</li>
<li><b><code>infra/{shared,modules,envs}</code> 구조</b> &mdash; shared는 account-wide 단일 자원(ECR/OIDC/RDS data/RDS SG), envs는 env별 자원</li>
<li><b>tfvars는 <code>.gitignore</code></b> (실값 + Account ID 노출 방지), <code>.example</code>만 커밋</li>
<li><b>pnpm + corepack</b> + <b>Node 22</b></li>
<li><b>Better Auth + Prisma 7 driver adapter</b> (Edge 호환성/native binary 회피)</li>
<li><b>Pino + AsyncLocalStorage</b>로 requestId 전파 (구조화 로그)</li>
</ul>
<h2 data-ke-size="size26">10. 의사결정 기록 패턴 (ADR)</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>각 사이클의 <b>결정</b>은 모두 <code>ADR-{사이클}{번호}</code> 형식으로 짧게 기록 (예: <code>ADR-C07</code>)</li>
<li>코드 옆 주석 + <code>decisions.md</code> 색인 + <code>_workspace/{cycle}/02_plan.md</code> 상세</li>
<li>spec과 실제 결정 간 차이도 ADR로 남김 &rarr; 감사 추적 가능</li>
<li>이 패턴이 컷오버 트러블슈팅에서 "왜 이렇게 만들었지?" 5분 안에 답 가능하게 해줌</li>
</ul>
<h2 data-ke-size="size26">11. 4-agent harness가 도움이 된 지점</h2>
<p data-ke-size="size16">작업을 researcher &rarr; planner &rarr; implementer &rarr; reviewer 4-agent로 분담했을 때 효과가 컸던 지점:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Researcher</b>가 라이브러리/AWS 동작 정확히 확인 후 Planner에 넘김 &rarr; Implementer가 추측 안 함</li>
<li><b>Planner</b>가 ADR 형식으로 결정과 대안 기각 사유 기록 &rarr; 나중에 회귀 추적 용이</li>
<li><b>Reviewer</b>가 매 사이클 직후 별도 패스로 감사 &rarr; 사일런트 회귀 조기 발견 (E의 H1 회귀 등)</li>
<li>사이클별 <code>_workspace/{cycle}/{01_research,02_plan,03_implementation_log,04_review}.md</code> 4종 산출물 보존 &rarr; 다음 사이클이 이전 컨텍스트 참조 가능</li>
</ul>
<p data-ke-size="size16">하네스 <a href="https://github.com/revfactory/harness">제작자</a>님께 감사!</p>