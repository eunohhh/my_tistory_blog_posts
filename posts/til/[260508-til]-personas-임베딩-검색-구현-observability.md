<h1>관측성 처음 세팅해본 회고</h1>
<h2 data-ke-size="size26">0. 시작 vs 끝 시점의 멘탈 모델</h2>
<h2 data-ke-size="size26">시작 시점의 멘탈 모델</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>"관측성 = 슬랙으로 알림 받는 것"</li>
<li>"알림 받으면 로그는 어디서 보지...?"<br />&rarr; 알림은 단편적이고 컨텍스트가 없었음. 서버 SSH 들어가서 journalctl, docker logs 뒤지는 게 일과.</li>
<li>메트릭/로그/트레이스의 차이를 모름. 그냥 "로그"가 전부였음.</li>
<li>OTel이라는 단어는 들어봤지만 "텔레메트리가 대체 어디로 어떻게 가는지" 감이 없었음.</li>
</ul>
<h2 data-ke-size="size26">끝 시점의 멘탈 모델</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>관측성은 "<b>증상을 보고 &rarr; 원인을 파고들 수 있는</b> 환경"이다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>증상: request rate, error rate, latency p95/p99 같은 메트릭</li>
<li>원인: 그 시점 로그, 그 요청의 trace</li>
</ul>
</li>
<li>알림은 "심각도와 맥락을 담아" 받는 것. 단순 에러 발생이 아니라 "5분간 에러율이 임계치 초과" 같은 신호.</li>
<li>OTel은 "내 앱이 메트릭/로그/트레이스를 만드는 표준".<br />데이터를 어디로 보낼지(Prometheus/Loki/Tempo)는 OTel Collector가 라우팅.</li>
<li>메트릭 / 로그 / 트레이스 &mdash; 이 셋의 역할이 다르고, 같이 봐야 한다는 걸 체감.</li>
</ul>
<h2 data-ke-size="size26">1. LGTM 스택 구성 (Loki/Grafana/Tempo/Prometheus)</h2>
<p data-ke-size="size16">LGTM은 한 도구가 아니라 4개 도구의 조합이다.<br />각자 다른 데이터를 다루고, Grafana가 그것들을 한 화면에 모은다.</p>
<h3 data-ke-size="size23">L &mdash; Loki (로그)</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>역할: 로그를 받아서 저장하고 검색 가능하게 만든다</li>
<li>왜 이걸 쓰나
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>ELK 스택처럼 "로그를 풀텍스트 인덱싱"하는 게 아니라 <b>레이블 기반 인덱싱</b> + 본문은 압축 저장.</li>
<li>운영 비용이 훨씬 가볍다 (디스크/메모리 적게 씀)</li>
<li>같은 회사(Grafana Labs) 도구라 Grafana와 통합이 매끄러움</li>
</ul>
</li>
<li>멘탈 모델: "Prometheus처럼 동작하는데 메트릭이 아니라 로그를 저장"</li>
</ul>
<h3 data-ke-size="size23">G &mdash; Grafana (시각화 + 통합 UI)</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>역할: Loki/Tempo/Prometheus 데이터를 한 화면에 모아서 보여준다</li>
<li>왜 이걸 쓰나
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>데이터 소스 4종 모두 1급 지원</li>
<li>패널 하나에서 클릭으로 메트릭 &rarr; 로그 &rarr; 트레이스로 점프 가능</li>
<li>알림 라우팅(Slack/이메일/PagerDuty)도 Grafana에서 통합</li>
</ul>
</li>
<li>멘탈 모델: "관측성의 단일 진입점(single pane of glass)"</li>
</ul>
<h3 data-ke-size="size23">T &mdash; Tempo (트레이스)</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>역할: 분산 트레이스를 받아서 저장하고 검색 가능하게 만든다</li>
<li>왜 이걸 쓰나
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>트레이스도 Loki처럼 풀텍스트 인덱싱 안 함 &rarr; 운영 비용 낮음</li>
<li>"이 trace ID로 검색"이 기본 워크플로우<br />(메트릭/로그에서 trace ID 클릭으로 점프)</li>
</ul>
</li>
<li>멘탈 모델: "한 요청이 어떤 함수/서비스를 거쳐갔는지의 타임라인 저장소"</li>
</ul>
<h3 data-ke-size="size23">M &mdash; Mimir 또는 Prometheus (메트릭)</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>역할: 시계열 메트릭을 저장하고 PromQL로 쿼리 가능하게 만든다</li>
<li>Prometheus: 단일 노드, 단순, 대부분 케이스에 충분 &lt; 이번에 사용!</li>
<li>Mimir: Prometheus 호환 + 수평 확장 가능 (대규모 운영용)</li>
<li>왜 이걸 쓰나
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>사실상 메트릭의 표준 (PromQL 생태계)</li>
<li>exporters/instrumentation 라이브러리가 거의 다 Prometheus 호환</li>
</ul>
</li>
<li>멘탈 모델: "시간에 따라 변하는 숫자(요청 수, 에러율, 메모리 등)의 저장소"</li>
</ul>
<h3 data-ke-size="size23">이번 프로젝트의 구성</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>메트릭: Prometheus (단일 노드로 충분)</li>
<li>로그: Loki</li>
<li>트레이스: Tempo</li>
<li>UI/알림: Grafana</li>
<li>수집: OTel Collector &rarr; 위 3개로 라우팅</li>
</ul>
<h3 data-ke-size="size23">왜 LGTM인가 (다른 옵션 대비)</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>ELK (Elasticsearch + Kibana): 로그 풀텍스트 검색이 강력하지만 운영 비용 큼</li>
<li>Datadog/New Relic: 다 자동이지만 비용 있음</li>
<li>LGTM: 셀프호스팅 가능 + 운영 비용 적당 + Grafana 생태계 = 학습 자산</li>
</ul>
<h2 data-ke-size="size26">2. 관측성의 3축: Metrics / Logs / Traces</h2>
<h3 data-ke-size="size23">왜 3축이 필요한가</h3>
<p data-ke-size="size16">같은 데이터를 다른 모양으로 본다고 생각하면 안 된다. <b>서로 답하는 질문이 다르다.</b></p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>&nbsp;</th>
<th>Metrics</th>
<th>Logs</th>
<th>Traces</th>
</tr>
</thead>
<tbody>
<tr>
<td>답하는 질문</td>
<td>"지금 시스템이 건강한가?"</td>
<td>"왜 이 일이 일어났나?"</td>
<td>"이 요청이 어디서 느렸나?"</td>
</tr>
<tr>
<td>데이터 모양</td>
<td>시계열 숫자</td>
<td>시간 + 메시지 텍스트</td>
<td>요청별 함수 호출 트리</td>
</tr>
<tr>
<td>양</td>
<td>적음 (집계됨)</td>
<td>많음 (이벤트 단위)</td>
<td>많음 (요청 단위)</td>
</tr>
<tr>
<td>보존 비용</td>
<td>낮음</td>
<td>중간</td>
<td>중간~높음</td>
</tr>
<tr>
<td>주요 도구</td>
<td>Prometheus</td>
<td>Loki</td>
<td>Tempo</td>
</tr>
<tr>
<td>알림 적합성</td>
<td>높음 (임계치)</td>
<td>낮음 (노이즈 많음)</td>
<td>낮음 (개별 분석용)</td>
</tr>
</tbody>
</table>
<h3 data-ke-size="size23">워크플로우: 셋이 어떻게 협업할까?</h3>
<p data-ke-size="size16">전형적인 장애 대응 흐름:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Metrics가 알린다</b>: "API 에러율이 5분간 5% 초과"</li>
<li><b>Logs로 원인 추정</b>: 그 시간대의 에러 로그 검색<br />&rarr; "DB connection timeout 다수 발생"</li>
<li><b>Traces로 정밀 진단</b>: 특정 trace ID 열어보기<br />&rarr; "요청의 어느 단계에서 몇 초 걸렸는지" 정확히 파악</li>
</ol>
<p data-ke-size="size16">&rarr; 메트릭에서 "수상한 시점"을 발견하고, 로그/트레이스로 "그 순간"을 들여다보는 흐름.</p>
<h3 data-ke-size="size23">각 축의 모델</h3>
<p data-ke-size="size16"><b>Metrics = 대시보드의 그래프들</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>분 단위(또는 초 단위)로 집계된 시계열 숫자</li>
<li>예: 요청 수, 에러율, p95 latency, 메모리 사용률, DB 커넥션 풀 사용량</li>
<li>항상 보고 있는 게 아니라 "임계치 넘으면 알림"의 트리거 역할</li>
</ul>
<p data-ke-size="size16"><b>Logs = 사건 기록부</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>시간 + 컨텍스트가 담긴 텍스트 이벤트</li>
<li>예: <code>2026-05-09 10:23:45 [ERROR] embedding API 504 timeout</code></li>
<li>"왜 이게 일어났는지"의 가장 풍부한 정보. 다만 양이 많아 검색 도구 필수.</li>
</ul>
<p data-ke-size="size16"><b>Traces = 한 요청의 X-ray</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>요청 1건이 시스템 내부에서 어떤 경로로 어떤 시간에 흘렀는지</li>
<li>예: 검색 요청 &rarr; HyDE LLM 호출 (700ms) &rarr; 임베딩 호출 (200ms)<br />&rarr; pgvector 검색 (180ms) &rarr; 응답 직렬화 (10ms)</li>
<li>분산 시스템(여러 서비스 호출)에선 거의 필수.</li>
</ul>
<h2 data-ke-size="size26">3. 메트릭 확장 계획</h2>
<h3 data-ke-size="size23">원칙</h3>
<p data-ke-size="size16">"있어야 좋을 것 같다"가 아니라<br />"장애가 났을 때 가장 답답했던 곳"부터 확장한다.</p>
<h3 data-ke-size="size23">현재: API 메트릭</h3>
<p data-ke-size="size16">표준 4 골든 시그널:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>request rate (요청 수)</li>
<li>error rate (에러율, 4xx/5xx 분리)</li>
<li>latency (p50/p95/p99)</li>
<li>saturation (동시 처리 중인 요청 수, 큐 대기 등)</li>
</ul>
<p data-ke-size="size16">이걸로 "API가 건강한가" 1차 판단 가능.</p>
<h3 data-ke-size="size23">다음 우선순위 &mdash; 의존성 메트릭</h3>
<p data-ke-size="size16">API가 호출하는 외부 의존성 각각에 같은 4 골든 시그널.<br />이번 프로젝트에선:</p>
<h4 data-ke-size="size20">1단계: DB (PostgreSQL)</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>왜 1순위: API 응답 지연의 가장 흔한 원인</li>
<li>무엇을 보나
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>커넥션 풀 사용률 (Prisma + pg.Pool 양쪽)</li>
<li>쿼리 latency p95 (특히 벡터 검색 쿼리)</li>
<li>DB 자체 메트릭: active connections, cache hit ratio, deadlocks</li>
</ul>
</li>
<li>도구: postgres_exporter</li>
</ul>
<h4 data-ke-size="size20">2단계: 임베딩 / LLM API</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>왜 2순위: HyDE 도입으로 외부 API 호출이 응답 시간의 큰 비중</li>
<li>무엇을 보나
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>OpenAI 호출 수, 에러율 (특히 504, rate limit)</li>
<li>호출 latency (HyDE p95, 임베딩 p95 분리)</li>
<li>비용 추적 (호출당 토큰 수 &rarr; 일/월 비용 추정)</li>
</ul>
</li>
<li>캐시 hit율도 같이: 미스가 곧 비용</li>
</ul>
<h4 data-ke-size="size20">3단계: Redis (캐시)</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>왜 3순위: HyDE 2단 캐시의 효과를 측정해야 함</li>
<li>무엇을 보나
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>hit/miss 비율 (L1, L2 분리)</li>
<li>메모리 사용률</li>
<li>eviction 발생 여부 (TTL 30d인데 메모리 부족으로 밀려나면 캐시 효과 떨어짐)</li>
</ul>
</li>
<li>도구: redis_exporter</li>
</ul>
<h4 data-ke-size="size20">4단계: 비즈니스 메트릭</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>왜 4순위: 시스템이 건강하더라도 "검색 품질"은 별개 문제</li>
<li>무엇을 보나
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>검색 결과 매칭 점수 분포 (p50, p95)</li>
<li>결과 0건 또는 LIMIT 못 채운 쿼리의 비율</li>
<li>HyDE 적용 vs 미적용의 매칭 점수 차이 (지속적 A/B)</li>
<li>자주 검색되는 쿼리 패턴</li>
</ul>
</li>
<li>이게 가장 "프로젝트 고유" 메트릭. 표준 도구 없음, 직접 계측.</li>
</ul>
<h3 data-ke-size="size23">확장 시 주의</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>한 번에 하나씩. 패널/알림이 한꺼번에 늘면 노이즈만 됨.</li>
<li>새 메트릭 추가할 때마다 "어떤 임계치에서 어떤 알림"인지 같이 정의.</li>
<li>알림 없는 메트릭은 "있으면 좋은 것"일 뿐 운영 자산이 아님.</li>
</ul>
<h3 data-ke-size="size23">확장 시 자문할 질문</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이 메트릭이 알리는 문제를, 지금 발견하는 데 얼마나 걸렸는가?</li>
<li>이 메트릭이 있었으면 그 시간이 줄었을까?</li>
</ul>
<h2 data-ke-size="size26">4. Cloudflare Tunnel + Zero Trust로 Grafana만 인증</h2>
<h3 data-ke-size="size23">문제</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>홈서버에서 Grafana를 외부에서 보고 싶음</li>
<li>그러나 포트 포워딩으로 그냥 노출하면 인증 안 된 외부 트래픽이 닿음</li>
<li>VPN(Tailscale)도 옵션이지만, 동료에게 임시 접근 줄 때마다 디바이스 등록 필요</li>
</ul>
<h3 data-ke-size="size23">Cloudflare Tunnel + Zero Trust의 매력</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>포트 포워딩 없음: 홈서버에서 Cloudflare로 outbound 터널만 열림.<br />외부 인터넷에서 직접 닿는 포트가 아예 없음. &rarr; 보안 표면 최소화</li>
<li>DNS + TLS 자동: 서브도메인에 자동 매핑, HTTPS 자동</li>
<li>Zero Trust로 인증: 이메일 OTP 또는 Google SSO로 게이트.<br />인증된 사용자만 Grafana에 도달</li>
<li>라우트별 정책: 같은 도메인 안에서 /admin은 특정 이메일만,<br />나머지는 도메인 단위로 허용 같은 세분화 가능</li>
</ul>
<h3 data-ke-size="size23">이번 프로젝트의 설정</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>grafana.(도메인) &rarr; Cloudflare Tunnel &rarr; 홈서버 Grafana 컨테이너</li>
<li>Zero Trust Application 정책: 특정 이메일 도메인만 허용</li>
</ul>
<h3 data-ke-size="size23">편.하.다.</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>인증을 Grafana 자체 사용자 관리에 의존하지 않아도 됨</li>
<li>VPN 없이도 안전한 외부 접근</li>
<li>회사 동료에게 임시 접근을 이메일 추가만으로 줄 수 있음</li>
<li>서비스 추가될 때마다 같은 패턴 재사용 (Loki API, 파일 서버 등)</li>
<li>이번 프로젝트에선 SSH는 Tailscale, 웹 UI는 Cloudflare로 분리 운영</li>
</ul>
<h2 data-ke-size="size26">5. 운영 갈증 해소 &mdash; Before / After</h2>
<h3 data-ke-size="size23">Before</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>알림: Slack에 "에러 발생" 메시지가 떨어짐</li>
<li>그 다음: SSH로 홈서버 들어가 &rarr; docker logs 뒤짐<br />&rarr; 어느 컨테이너인지부터 추적</li>
<li>같은 시점의 다른 신호(부하? DB? 외부 API?)를 같이 볼 방법이 없음</li>
<li>"알림은 와도 무력감"</li>
</ul>
<h3 data-ke-size="size23">After</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>알림: "5분간 에러율 5% 초과" 같이 임계치 기반, 컨텍스트 포함</li>
<li>그 다음: Slack 메시지의 링크 클릭 &rarr; Grafana 대시보드<br />&rarr; 같은 시점의 메트릭/로그를 한 화면에서 검토</li>
<li>메트릭 그래프에서 의심 시점 클릭 &rarr; 그 시간 로그/트레이스로 점프</li>
<li>"알림 &rarr; 진단 &rarr; 원인"의 흐름이 1분 안에 가능</li>
</ul>
<h3 data-ke-size="size23">아직 부족한 것</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>트레이스 인스트루멘테이션이 일부 경로에만 들어가 있어서, HyDE 호출 내부의 세부 단계는 아직 안 보임</li>
<li>비즈니스 메트릭(매칭 점수 분포)은 아직 계측 안 함</li>
</ul>
<h2 data-ke-size="size26">6. 트래픽 0일 때 패널이 비어 보이는 문제</h2>
<p data-ke-size="size16">관측성 1&middot;2단계(API 메트릭 + Slack 라우팅)를 막 끝낸 직후 받은 두 가지 보고:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>"Request rate by route" 패널이 비어 보인다 &mdash; 어제 트래픽이 분명 있었는데 0 라인조차 안 그려짐. 그런데 같은 화면의 Error rate 패널은 0%로 잘 보임.</li>
<li>Slack에 "10분간 요청 없음" firing/resolved만 반복해서 옴. 다른 알림은 한 번도 안 옴.</li>
</ol>
<p data-ke-size="size16">증상이 비대칭이라는 게 첫 단서였다. 같은 시점, 같은 데이터 소스인데 어떤 패널은 보이고 어떤 패널은 비어있다.</p>
<h3 data-ke-size="size23">진단 &mdash; 메트릭은 정상이다, 표현이 문제다</h3>
<p data-ke-size="size16">먼저 "메트릭 자체가 안 들어오는 건가?" 의심부터 풀어야 했다.<br />Prometheus에 직접 물어봤다.</p>
<p data-ke-size="size16"><code>http_server_duration_milliseconds_count{service_name="personas-backend"}[24h]</code></p>
<p data-ke-size="size16">&rarr; series는 정상. http_route, http_status_code 라벨까지 다 잡혀 있음.<br />&rarr; 그런데 <b>instant query</b>(지금 시점)는 빈 배열.</p>
<p data-ke-size="size16">여기서 세 가지가 맞물려 있다는 걸 알게 됐다:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>OTel export interval</b>: PeriodicExportingMetricReader 기본값이 60초. 즉 메트릭은 1분에 한 번만 Prometheus로 push됨.</li>
<li><b>rate window</b>: 대시보드의 Request rate 쿼리는 <code>[1m]</code> 윈도우. 그런데 rate()는 윈도우 안에 sample이 <b>최소 2개</b> 있어야 값을 계산함. 60초 push 간격 + 60초 윈도우면 sample이 1개일 때가 자주 생김.</li>
<li><b>fallback 유무</b>: Error rate 패널은 <code>or vector(0)</code> fallback이 이미 있어서 빈 결과여도 0으로 보임. Request rate 패널은 그게 없어서 그냥 비어 보임.</li>
</ul>
<p data-ke-size="size16">즉 시스템은 정상이고, <b>"sample 부족 &rarr; 빈 결과 &rarr; 패널이 비어 보임"이라는 표현 문제</b>였다.</p>
<p data-ke-size="size16">같은 원리로 Slack도 설명됐다. dev/idle 환경에서 트래픽 자체가 적으니, 비율 기반 알림(에러율 5%, latency p95)은 trigger 조건을 못 채움. 반면 <code>personas_no_traffic</code> 알림은 noDataState: Alerting 설정이라 트래픽 없는 dev에선 자주 fire. &rarr; "다른 알림 다 조용한데 no_traffic만 시끄러운" 비대칭이 만들어짐.</p>
<h3 data-ke-size="size23">알게 된 세 가지 개념</h3>
<p data-ke-size="size16">진단 과정에서 처음 또렷해진 개념들이다.<br /><br /></p>
<p data-ke-size="size16"><b>1. <code>$__rate_interval</code> &mdash; Grafana가 자동 계산해주는 윈도우</b></p>
<p data-ke-size="size16"><code>[1m]</code>을 직접 쓰면 push 간격에 따라 sample 부족이 일상이 됨. Grafana는 이 문제를 알고 있어서 <code>$__rate_interval</code>이라는 변수를 제공한다. <b>scrape/push 간격 기반으로 sample &ge; 2를 보장하도록 자동 산정</b>. push 간격 60s면 보통 <code>[4m]</code> 정도로 풀림.</p>
<p data-ke-size="size16">다음부터는 rate 쿼리에서 <code>[1m]</code>, <code>[5m]</code>을 직접 쓰지 말고 <code>$__rate_interval</code>을 기본으로. 직접 쓰는 건 "이 윈도우여야만 하는 명확한 이유가 있을 때"만.<br /><br /></p>
<p data-ke-size="size16"><b>2. <code>or vector(0)</code> fallback &mdash; 빈 결과 vs 0</b></p>
<p data-ke-size="size16">PromQL에서 "결과가 없음"과 "0"은 다르다. 패널 입장에선 둘이 시각적으로 같아 보일 거 같지만, 실은 전자는 <b>선이 안 그려지고</b>, 후자는 <b>0 라인이 그려진다.</b> 사용자가 보기엔 "비어 보이는 패널" vs "0이 보이는 패널"의 큰 차이.</p>
<p data-ke-size="size16">해결 패턴:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>라벨 없는 단일 결과
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>sum(rate(...)) or vector(0)</code></li>
</ul>
</li>
<li>라벨 있는 그룹화 (by http_route 같은)
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>sum by (http_route) (rate(...))
or
label_replace(vector(0), "http_route", "no traffic", "", "")</code></li>
</ul>
</li>
</ul>
<p data-ke-size="size16">label_replace를 같이 써야 하는 이유: vector(0)은 라벨이 없어서, by절 결과와 형태가 안 맞음. 인공적으로 라벨 하나 만들어줘야 union이 됨.<br /><br /></p>
<p data-ke-size="size16"><b>3. 저트래픽 환경에서 비율 기반 알림의 한계</b></p>
<p data-ke-size="size16">분당 1요청 환경에서, 그 1요청이 5xx면 에러율 100%. 비율 기반 알림은 발화하지만 <b>의미 없는 false positive</b>. 반대로 트래픽이 충분한 prod에선 비율 기반이 정확한 신호.</p>
<p data-ke-size="size16">&rarr; 비율 기반 룰엔 <b>트래픽 가드</b>가 필요하고, 저트래픽에서 의미 있는 incident 신호는 <b>절대 빈도</b> 룰로 따로 둬야 한다.</p>
<h3 data-ke-size="size23">처치 &mdash; 패널 / 알림 / 라우팅 세 층에서</h3>
<p data-ke-size="size16">같은 문제의 세 가지 층이라 한 번에 다뤘다.<br /><br /></p>
<p data-ke-size="size16"><b>1) 패널 층 (대시보드)</b></p>
<p data-ke-size="size16">Request rate by route 패널의 PromQL 교체:</p>
<pre class="lisp"><code>sum by (http_route) (
  rate(http_server_duration_milliseconds_count{service_name="personas-backend"}[$__rate_interval])
)
or
label_replace(vector(0), "http_route", "no traffic", "", "")</code></pre>
<p data-ke-size="size16"><br />fieldConfig.defaults에 <code>min: 0</code>, <code>noValue: "0"</code>, <code>spanNulls: true</code> 추가.</p>
<p data-ke-size="size16">Latency p50/p95/p99 패널의 [5m]도 <code>$__rate_interval</code>로 통일.<br />spanNulls: 60000으로 60s push 갭을 시각적으로 이음.<br /><br /></p>
<p data-ke-size="size16"><b>2) 알림 층 &mdash; 비율 룰에 트래픽 가드, 절대 빈도 룰 신설</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>기존 5xx rate 룰에 가드:</li>
<li>에러율 계산 ...</li>
<li><code>and
sum(rate(http_server_duration_milliseconds_count{service_name="personas-backend"}[5m])) &gt; 0.05</code></li>
<li>5분에 15요청 미만이면 발화 안 함</li>
</ul>
<p data-ke-size="size16">p95 latency 룰에도 같은 패턴. histogram_quantile은 라벨 없는 vector라 <code>and on()</code>을 써야 함.<br />저트래픽 dev에서 5xx 감지를 잃지 않도록 <b>절대 빈도 룰 신설</b>: 10분 안에 5xx 3건 이상이면 발화. 비율 0%여도 문제 자체는 잡힘.<br /><br /></p>
<p data-ke-size="size16"><b>3) 라우팅 층 &mdash; severity별 채널 분리</b></p>
<p data-ke-size="size16"><code>personas_no_traffic</code> 룰은 살리되(prod 가서 의미 보존), Slack 잡음 분리:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>severity: info로 라벨링</li>
<li>라우팅 정책에서 severity=info &rarr; SlackQuiet receiver로 격리</li>
<li>SlackQuiet은 webhook URL 환경변수가 비면 무음, 나중에 #personas-info 같은 별도 채널로 분리하고 싶으면 env만 추가</li>
</ul>
<p data-ke-size="size16">룰 자체는 history에 남으니까, 환경 따라 라우팅만 갈아끼우면 됨.</p>
<p data-ke-size="size16">또한 <code>noDataState: Alerting &rarr; NoData</code>로 변경.<br />for도 10m &rarr; 30m. dev의 일상적 idle에서 노이즈가 안 나오게.</p>
<h3 data-ke-size="size23">메타 인사이트</h3>
<p data-ke-size="size16">이 한 건에서 세 가지를 가져갔다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>"패널이 비어 보인다"는 데이터 부재가 아니라 표현의 문제일 때가 많다.</b> 의심 순서를 외워두기: 메트릭 emit 확인 &rarr; instant query 확인 &rarr; rate window vs push interval 검토 &rarr; fallback 유무.</li>
<li><b>비율과 절대 빈도는 보완재.</b> prod 트래픽이 충분할 땐 비율이 정확하고, 저트래픽 dev에선 절대 빈도가 정확하다. 둘 다 두면 환경에 따라 자동으로 적절한 신호가 나옴.</li>
<li><b>알림 룰을 끄는 게 아니라 라우팅으로 격리한다.</b> "이 알림은 노이즈니까 비활성화"가 아니라 "severity로 분류 &rarr; 채널 분리". 룰은 history에 남고, 환경/시점에 따라 어디로 보낼지만 바꾸면 됨. 룰을 끄면 prod 가서 다시 만들어야 하지만, 라우팅만 바꾸면 그대로 이관됨.</li>
</ol>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><a href="https://ifelseif.tistory.com/343" target="_blank" rel="noopener">overview보기</a></p>