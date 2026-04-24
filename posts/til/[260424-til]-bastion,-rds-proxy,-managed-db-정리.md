<h1>Bastion / RDS Proxy / Managed DB 정리</h1>
<h2 data-ke-size="size26"><b>0. 한 줄 요약</b></h2>
<p data-ke-size="size16">Vercel의 Next.js가 DB에 직접 붙어야 한다면 RDS는 네트워크 보안 설계가 복잡해지고, Railway/Supabase/Neon 같은 외부 접속 친화형 Postgres가 더 단순할 수 있다.<br />RDS는 AWS 내부 백엔드, VPC, RDS Proxy와 함께 사용할 때 더 자연스럽다.</p>
<h2 data-ke-size="size26"><b>1. 오늘 헷갈렸던 핵심</b></h2>
<p data-ke-size="size16">처음에는 다음 개념들이 비슷하게 느껴졌다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Bastion</li>
<li>SSH Tunnel</li>
<li>RDS Proxy</li>
<li>Supabase / Railway의 DB URL</li>
<li>Vercel Static IP</li>
<li>AWS API Gateway / Lambda / ECS / App Runner</li>
<li>App Runner VPC Connector</li>
</ul>
<p data-ke-size="size16">겉으로 보면 전부 &ldquo;DB에 안전하게 접속하기 위한 중간 통로&rdquo;처럼 보이지만, 실제 역할은 다르다.</p>
<p data-ke-size="size16">가장 중요한 구분은 이것이다.</p>
<pre class="routeros"><code>네트워크 접근 경로를 만들어주는 것
vs
DB 커넥션을 효율적으로 관리해주는 것
---
<h2><strong>2. Bastion이란?</strong></h2>
<p>Bastion은 DB에 직접 접속하지 않고, 중간 서버를 거쳐서 DB에 접속하기 위한 관문 서버다.</p>
<p>보통 구조는 다음과 같다.</p>
<pre><code class="language-txt">내 PC
  &amp;darr; SSH
Bastion Server
  &amp;darr; Private Network
RDS / Database&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;RDS를 외부 인터넷에 직접 열지 않고, Bastion 서버만 외부에서 SSH 접속 가능하게 만든다.&lt;/p&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;예:&lt;/p&gt;
&lt;pre class=&quot;groovy&quot;&gt;&lt;code&gt;RDS public access: false
Bastion EC2: public subnet
RDS: private subnet&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;보안 그룹 예시:&lt;/p&gt;
&lt;pre class=&quot;armasm&quot;&gt;&lt;code&gt;Bastion SG
- 내 IP에서 22번 SSH 허용

RDS SG
- Bastion SG에서 오는 5432만 허용&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;즉 Bastion은 주로 &lt;b&gt;개발자가 로컬에서 private DB에 접속하기 위한 통로&lt;/b&gt;다.&lt;/p&gt;
&lt;hr data-ke-style=&quot;style1&quot; /&gt;
&lt;h2 data-ke-size=&quot;size26&quot;&gt;&lt;b&gt;2. SSH 터널링이란?&lt;/b&gt;&lt;/h2&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;SSH 터널링은 내 로컬 포트를 Bastion을 통해 DB 포트로 연결하는 방식이다.&lt;/p&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;예:&lt;/p&gt;
&lt;pre class=&quot;css&quot;&gt;&lt;code&gt;ssh -L 5433:my-db.internal:5432 ubuntu@bastion.example.com&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;이 명령의 의미:&lt;/p&gt;
&lt;pre class=&quot;routeros&quot;&gt;&lt;code&gt;localhost:5433
  &amp;darr; SSH Tunnel
Bastion Server
  &amp;darr;
my-db.internal:5432&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;그 후 로컬 DB 툴에서는 이렇게 접속한다.&lt;/p&gt;
&lt;pre class=&quot;yaml&quot;&gt;&lt;code&gt;Host: localhost
Port: 5433
User: db_user
Password: db_password
Database: my_db&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;하지만 실제로는 Bastion을 거쳐 private RDS에 접속하는 것이다.&lt;/p&gt;
&lt;hr data-ke-style=&quot;style1&quot; /&gt;
&lt;h2 data-ke-size=&quot;size26&quot;&gt;&lt;b&gt;3. Bastion은 주로 개발자 로컬 접속용&lt;/b&gt;&lt;/h2&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;Bastion은 보통 다음 용도에 적합하다.&lt;/p&gt;
&lt;pre class=&quot;groovy&quot;&gt;&lt;code&gt;개발자 로컬 PC &amp;rarr; private RDS 접속
DBeaver / TablePlus / DataGrip / psql 접속
운영 DB 긴급 확인
마이그레이션 수동 실행&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;하지만 Vercel에 배포된 Next.js 앱이 Bastion을 통해 RDS에 접속하는 구조는 일반적이지 않다.&lt;/p&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;즉:&lt;/p&gt;
&lt;pre class=&quot;armasm&quot;&gt;&lt;code&gt;개발자 로컬 &amp;rarr; Bastion &amp;rarr; RDS&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;는 자연스럽지만,&lt;/p&gt;
&lt;pre class=&quot;armasm&quot;&gt;&lt;code&gt;Vercel App &amp;rarr; Bastion &amp;rarr; RDS&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;는 일반적인 프로덕션 구조가 아니다.&lt;/p&gt;
&lt;hr data-ke-style=&quot;style1&quot; /&gt;
&lt;h2 data-ke-size=&quot;size26&quot;&gt;&lt;b&gt;4. RDS Proxy란?&lt;/b&gt;&lt;/h2&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;RDS Proxy는 DB에 접근하기 위한 public gateway가 아니다.&lt;/p&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;RDS Proxy의 주요 목적은 다음이다.&lt;/p&gt;
&lt;pre class=&quot;properties&quot;&gt;&lt;code&gt;DB 커넥션 풀링
커넥션 재사용
Lambda/ECS 같은 앱의 DB 연결 폭증 완화
RDS 장애/failover 대응 개선
Secrets Manager 연동&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;구조는 보통 다음과 같다.&lt;/p&gt;
&lt;pre class=&quot;routeros&quot;&gt;&lt;code&gt;AWS VPC 내부 App
예: Lambda / ECS / EC2 / App Runner
  &amp;darr;
RDS Proxy
  &amp;darr;
RDS&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;중요한 점:&lt;/p&gt;
&lt;pre class=&quot;angelscript&quot;&gt;&lt;code&gt;RDS Proxy는 기본적으로 VPC 내부에서 사용하는 리소스다.
public internet에서 직접 접근하는 endpoint가 아니다.&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;따라서 다음 구조는 일반적으로 기대한 대로 동작하지 않는다.&lt;/p&gt;
&lt;pre class=&quot;routeros&quot;&gt;&lt;code&gt;Vercel
  &amp;darr; public internet
RDS Proxy
  &amp;darr;
Private RDS&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;RDS Proxy는 &amp;ldquo;Vercel이 private RDS에 접속할 수 있게 해주는 터널&amp;rdquo;이 아니다.&lt;/p&gt;
&lt;hr data-ke-style=&quot;style1&quot; /&gt;
&lt;h2 data-ke-size=&quot;size26&quot;&gt;&lt;b&gt;5. RDS Proxy와 Bastion의 차이&lt;/b&gt;&lt;/h2&gt;
&lt;pre class=&quot;routeros&quot;&gt;&lt;code&gt;Bastion
&amp;rarr; 네트워크 접근 경로
&amp;rarr; 개발자 로컬 접속용
&amp;rarr; SSH 터널링에 사용

RDS Proxy
&amp;rarr; DB 커넥션 풀링
&amp;rarr; AWS 내부 앱용
&amp;rarr; Lambda/ECS/App Runner 등이 RDS를 효율적으로 사용하게 함&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;핵심:&lt;/p&gt;
&lt;pre class=&quot;armasm&quot;&gt;&lt;code&gt;Bastion은 길을 열어주는 것
RDS Proxy는 연결을 관리해주는 것&lt;/code&gt;&lt;/pre&gt;
&lt;hr data-ke-style=&quot;style1&quot; /&gt;
&lt;h2 data-ke-size=&quot;size26&quot;&gt;&lt;b&gt;6. Vercel에서 private RDS에 직접 붙기 어려운 이유&lt;/b&gt;&lt;/h2&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;Vercel에 배포된 Next.js가 Prisma나 adapter-pg로 RDS에 직접 붙는 구조는 편하다.&lt;/p&gt;
&lt;pre class=&quot;applescript&quot;&gt;&lt;code&gt;Next.js on Vercel
  &amp;darr;
Prisma / adapter-pg
  &amp;darr;
AWS RDS&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;하지만 RDS가 private이면 Vercel이 접근할 수 없다.&lt;/p&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;그래서 선택지가 생긴다.&lt;/p&gt;
&lt;pre class=&quot;angelscript&quot;&gt;&lt;code&gt;1. RDS public access를 열기
2. Vercel Static IP를 구매하고 해당 IP만 허용하기
3. AWS 안에 API 계층을 두기
4. Next.js 앱 자체를 AWS로 옮기기
5. Supabase / Railway / Neon 같은 외부 접속 친화형 DB를 쓰기&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;현재 회사에서는 Static IP가 비싸다고 판단했고, 그래서 RDS inbound를 &lt;code&gt;0.0.0.0/0&lt;/code&gt;으로 열고 쓰는 상황이었다.&lt;/p&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;이 방식은 동작은 하지만 보안상 부담이 있다.&lt;/p&gt;
&lt;hr data-ke-style=&quot;style1&quot; /&gt;
&lt;h2 data-ke-size=&quot;size26&quot;&gt;&lt;b&gt;7. AWS API 계층을 두는 방식&lt;/b&gt;&lt;/h2&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;Vercel이 RDS에 직접 붙지 않게 하고, AWS 내부의 백엔드가 RDS에 접근하게 만드는 방식이다.&lt;/p&gt;
&lt;pre class=&quot;routeros&quot;&gt;&lt;code&gt;Vercel / Next.js
  &amp;darr; HTTPS
AWS API Gateway / ALB
  &amp;darr;
Lambda / ECS / App Runner
  &amp;darr; VPC 내부
RDS Proxy
  &amp;darr;
RDS&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;이 경우 RDS는 외부에 열 필요가 없다.&lt;/p&gt;
&lt;pre class=&quot;angelscript&quot;&gt;&lt;code&gt;RDS public access: false
RDS inbound 0.0.0.0/0: 필요 없음
RDS inbound: Lambda/ECS/App Runner의 Security Group만 허용&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;즉 Vercel은 DB가 아니라 API만 바라본다.&lt;/p&gt;
&lt;pre class=&quot;nginx&quot;&gt;&lt;code&gt;Vercel &amp;rarr; AWS API &amp;rarr; RDS&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;이 구조에서는 Vercel Static IP가 필요 없다.&lt;/p&gt;
&lt;hr data-ke-style=&quot;style1&quot; /&gt;
&lt;h2 data-ke-size=&quot;size26&quot;&gt;&lt;b&gt;8. 하지만 Next.js가 DB adapter로 직접 붙어야 하는 경우&lt;/b&gt;&lt;/h2&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;문제는 다음과 같은 경우다.&lt;/p&gt;
&lt;pre class=&quot;reasonml&quot;&gt;&lt;code&gt;Next.js on Vercel
  &amp;darr;
Auth.js Prisma Adapter / adapter-pg / Prisma
  &amp;darr;
RDS&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;이 경우 DB 접근 코드가 Next.js 서버 안에 있다.&lt;/p&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;따라서 단순히 AWS API를 따로 둔다고 해결되지 않을 수 있다.&lt;/p&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;특히 Auth.js adapter처럼 Next.js 서버 런타임에서 직접 DB에 붙어야 하는 구조라면, 다음 중 하나를 선택해야 한다.&lt;/p&gt;
&lt;pre class=&quot;routeros&quot;&gt;&lt;code&gt;1. Vercel에서 RDS에 직접 붙도록 public RDS를 허용
2. Vercel Static IP 구매
3. Auth/API를 AWS 백엔드로 분리
4. Next.js 전체를 AWS 쪽으로 이동
5. DB를 Railway/Supabase/Neon 등으로 변경&lt;/code&gt;&lt;/pre&gt;
&lt;hr data-ke-style=&quot;style1&quot; /&gt;
&lt;h2 data-ke-size=&quot;size26&quot;&gt;&lt;b&gt;9. App Runner + VPC Connector란?&lt;/b&gt;&lt;/h2&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;App Runner는 AWS에서 컨테이너 앱을 비교적 쉽게 배포할 수 있는 서비스다.&lt;/p&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;VPC Connector를 붙이면 App Runner 서비스가 VPC 내부 리소스에 접근할 수 있다.&lt;/p&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;예:&lt;/p&gt;
&lt;pre class=&quot;gradle&quot;&gt;&lt;code&gt;사용자
  &amp;darr; HTTPS
AWS App Runner - Next.js 서버
  &amp;darr; VPC Connector
Private RDS&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;이 경우:&lt;/p&gt;
&lt;pre class=&quot;groovy&quot;&gt;&lt;code&gt;RDS public access: false
RDS inbound: App Runner VPC Connector SG만 허용
Vercel static IP: 필요 없음&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;즉 Next.js를 Vercel이 아니라 App Runner에 올리면, private RDS에 직접 접근할 수 있다.&lt;/p&gt;
&lt;hr data-ke-style=&quot;style1&quot; /&gt;
&lt;h2 data-ke-size=&quot;size26&quot;&gt;&lt;b&gt;10. App Runner가 해결하는 것과 해결하지 않는 것&lt;/b&gt;&lt;/h2&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;App Runner는 다음을 해결한다.&lt;/p&gt;
&lt;pre class=&quot;routeros&quot;&gt;&lt;code&gt;Next.js 앱을 AWS 안에 배포
VPC Connector를 통해 private RDS 접근
RDS를 public으로 열 필요 없음
Vercel Static IP 필요 없음&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;하지만 다음을 해결하는 것은 아니다.&lt;/p&gt;
&lt;pre class=&quot;reasonml&quot;&gt;&lt;code&gt;Vercel에 있는 Next.js가 App Runner VPC Connector를 빌려서 private RDS에 접근&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;즉 이건 안 된다.&lt;/p&gt;
&lt;pre class=&quot;vbnet&quot;&gt;&lt;code&gt;Next.js on Vercel
  &amp;darr;
App Runner VPC Connector
  &amp;darr;
Private RDS&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;가능한 구조는 이쪽이다.&lt;/p&gt;
&lt;pre class=&quot;vbnet&quot;&gt;&lt;code&gt;Next.js on App Runner
  &amp;darr;
VPC Connector
  &amp;darr;
Private RDS&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;또는:&lt;/p&gt;
&lt;pre class=&quot;applescript&quot;&gt;&lt;code&gt;Next.js on Vercel
  &amp;darr; HTTPS
API on App Runner
  &amp;darr; VPC Connector
  &amp;darr;
Private RDS&lt;/code&gt;&lt;/pre&gt;
&lt;hr data-ke-style=&quot;style1&quot; /&gt;
&lt;h2 data-ke-size=&quot;size26&quot;&gt;&lt;b&gt;11. Supabase / Railway / Neon의 DB URL은 RDS Proxy와 같은가?&lt;/b&gt;&lt;/h2&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;일부 역할은 비슷하지만 같은 개념은 아니다.&lt;/p&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;Supabase / Railway / Neon은 보통 외부 앱에서 접속할 수 있는 managed database endpoint를 제공한다.&lt;/p&gt;
&lt;pre class=&quot;livecodeserver&quot;&gt;&lt;code&gt;Vercel
  &amp;darr;
Managed Postgres URL
  &amp;darr;
Postgres&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;또한 Supabase 같은 경우 connection pooler URL도 제공한다.&lt;/p&gt;
&lt;pre class=&quot;routeros&quot;&gt;&lt;code&gt;Direct connection URL
&amp;rarr; DB에 직접 연결

Pooler URL
&amp;rarr; Supavisor 같은 pooler를 통해 DB 연결&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;RDS Proxy와 비슷한 점:&lt;/p&gt;
&lt;pre class=&quot;excel&quot;&gt;&lt;code&gt;DB 커넥션 풀링을 제공할 수 있음
앱의 DB 연결을 관리해줌&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;다른 점:&lt;/p&gt;
&lt;pre class=&quot;routeros&quot;&gt;&lt;code&gt;Supabase / Railway / Neon
&amp;rarr; 외부 앱에서 접속하기 좋은 public managed endpoint를 제공

AWS RDS Proxy
&amp;rarr; AWS VPC 내부 앱이 RDS를 효율적으로 쓰기 위한 proxy
&amp;rarr; public internet에서 접근하는 endpoint가 아님&lt;/code&gt;&lt;/pre&gt;
&lt;hr data-ke-style=&quot;style1&quot; /&gt;
&lt;h2 data-ke-size=&quot;size26&quot;&gt;&lt;b&gt;12. 그래서 Railway를 쓰는 게 나을 수 있는 이유&lt;/b&gt;&lt;/h2&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;현재 문제는 다음이다.&lt;/p&gt;
&lt;pre class=&quot;angelscript&quot;&gt;&lt;code&gt;Next.js on Vercel이 DB에 직접 붙어야 함
Vercel Static IP는 비쌈
RDS를 0.0.0.0/0으로 열기는 부담스러움
AWS API 계층을 두면 구조가 복잡해짐&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;이 경우 Railway / Supabase / Neon 같은 managed Postgres가 더 현실적일 수 있다.&lt;/p&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;구조:&lt;/p&gt;
&lt;pre class=&quot;reasonml&quot;&gt;&lt;code&gt;Next.js on Vercel
  &amp;darr;
Prisma / Auth.js adapter / adapter-pg
  &amp;darr;
Railway Postgres / Supabase Postgres / Neon Postgres&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;장점:&lt;/p&gt;
&lt;pre class=&quot;properties&quot;&gt;&lt;code&gt;Vercel과 연결하기 쉬움
DB URL 제공
SSL 연결 지원
pooler 제공하는 경우도 있음
RDS보다 초기 비용과 운영 부담이 낮을 수 있음
private VPC 네트워크 설계 고민이 줄어듦&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;특히 작은 서비스, 내부툴, MVP, Auth.js/Prisma adapter를 Next.js에서 바로 써야 하는 프로젝트에는 더 적합할 수 있다.&lt;/p&gt;
&lt;hr data-ke-style=&quot;style1&quot; /&gt;
&lt;h2 data-ke-size=&quot;size26&quot;&gt;&lt;b&gt;13. RDS가 더 적합한 경우&lt;/b&gt;&lt;/h2&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;반대로 RDS가 더 맞는 경우도 있다.&lt;/p&gt;
&lt;pre class=&quot;groovy&quot;&gt;&lt;code&gt;이미 AWS 안에 백엔드가 있음
ECS/Lambda/App Runner와 묶을 예정
VPC/private subnet 보안 구조가 중요함
조직의 보안 정책상 AWS 내부망이 필요함
RDS 백업/파라미터 그룹/모니터링/권한 체계가 필요함
장기적으로 인프라를 AWS 중심으로 운영할 계획&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;이 경우에는 다음 구조가 더 자연스럽다.&lt;/p&gt;
&lt;pre class=&quot;routeros&quot;&gt;&lt;code&gt;Frontend
  &amp;darr;
AWS Backend
  &amp;darr;
RDS Proxy
  &amp;darr;
Private RDS&lt;/code&gt;&lt;/pre&gt;
&lt;p data-ke-size=&quot;size16&quot;&gt;또는:&lt;/p&gt;
&lt;pre class=&quot;vbnet&quot;&gt;&lt;code&gt;Next.js on AWS App Runner / ECS
  &amp;darr;
Private RDS&lt;/code&gt;&lt;/pre&gt;
&lt;hr data-ke-style=&quot;style1&quot; /&gt;
&lt;h2 data-ke-size=&quot;size26&quot;&gt;&lt;b&gt;14. 오늘 명확히 알게 된 결론&lt;/b&gt;&lt;/h2&gt;
&lt;h3 data-ke-size=&quot;size23&quot;&gt;&lt;b&gt;Bastion&lt;/b&gt;&lt;/h3&gt;
&lt;pre class=&quot;excel&quot;&gt;&lt;code&gt;개발자 로컬에서 private DB에 접속하기 위한 관문 서버
주로 SSH 터널링에 사용
프로덕션 앱이 DB에 붙기 위한 일반적인 구조는 아님&lt;/code&gt;&lt;/pre&gt;
&lt;h3 data-ke-size=&quot;size23&quot;&gt;&lt;b&gt;SSH Tunnel&lt;/b&gt;&lt;/h3&gt;
&lt;pre class=&quot;excel&quot;&gt;&lt;code&gt;로컬 포트를 Bastion을 통해 DB 포트로 연결하는 방식
DBeaver, TablePlus, psql 등 로컬 툴에서 private DB 접속 가능&lt;/code&gt;&lt;/pre&gt;
&lt;h3 data-ke-size=&quot;size23&quot;&gt;&lt;b&gt;RDS Proxy&lt;/b&gt;&lt;/h3&gt;
&lt;pre class=&quot;actionscript&quot;&gt;&lt;code&gt;DB 커넥션 풀링용
AWS VPC 내부 앱을 위한 프록시
Vercel이 private RDS에 접속하게 해주는 public gateway가 아님&lt;/code&gt;&lt;/pre&gt;
&lt;h3 data-ke-size=&quot;size23&quot;&gt;&lt;b&gt;Vercel Static IP&lt;/b&gt;&lt;/h3&gt;
&lt;pre class=&quot;x86asm&quot;&gt;&lt;code&gt;Vercel에서 RDS public endpoint에 직접 붙을 때
RDS 보안그룹을 특정 IP로 제한하기 위한 옵션
하지만 비용이 부담될 수 있음&lt;/code&gt;&lt;/pre&gt;
&lt;h3 data-ke-size=&quot;size23&quot;&gt;&lt;b&gt;AWS API Gateway / Lambda / ECS / App Runner&lt;/b&gt;&lt;/h3&gt;
&lt;pre class=&quot;actionscript&quot;&gt;&lt;code&gt;Vercel이 DB에 직접 붙지 않고
AWS 내부 API가 private RDS에 접근하게 만드는 방식&lt;/code&gt;&lt;/pre&gt;
&lt;h3 data-ke-size=&quot;size23&quot;&gt;&lt;b&gt;App Runner + VPC Connector&lt;/b&gt;&lt;/h3&gt;
&lt;pre class=&quot;reasonml&quot;&gt;&lt;code&gt;Next.js나 API 서버를 AWS App Runner에 올리고
VPC Connector로 private RDS에 접근하는 방식
Vercel 앱이 VPC Connector를 빌려 쓰는 구조는 아님&lt;/code&gt;&lt;/pre&gt;
&lt;h3 data-ke-size=&quot;size23&quot;&gt;&lt;b&gt;Supabase / Railway / Neon&lt;/b&gt;&lt;/h3&gt;
&lt;pre class=&quot;reasonml&quot;&gt;&lt;code&gt;Vercel 같은 외부 플랫폼에서 직접 연결하기 좋은 managed Postgres
Next.js가 Prisma/Auth.js adapter로 직접 DB에 붙어야 하는 경우 현실적인 선택지&lt;/code&gt;&lt;/pre&gt;
&lt;hr data-ke-style=&quot;style1&quot; /&gt;
&lt;h2 data-ke-size=&quot;size26&quot;&gt;&lt;b&gt;15. 최종 판단 기준&lt;/b&gt;&lt;/h2&gt;
&lt;pre class=&quot;routeros&quot;&gt;&lt;code&gt;Next.js가 Vercel에 있고 DB에 직접 붙어야 한다
&amp;rarr; Railway / Supabase / Neon 검토

Next.js는 Vercel에 두고 DB 접근만 분리 가능하다
&amp;rarr; AWS API Gateway + Lambda / ECS / App Runner API

Next.js 전체를 AWS로 옮겨도 된다
&amp;rarr; App Runner + VPC Connector or ECS + RDS

개발자가 로컬에서 private DB에 접속해야 한다
&amp;rarr; Bastion or SSM Session Manager

AWS 내부 앱의 DB 커넥션을 효율화하고 싶다
&amp;rarr; RDS Proxy

RDS를 public으로 열어야 한다
&amp;rarr; 가능하면 0.0.0.0/0 대신 고정 IP 제한, SSL, 강한 인증, 최소 권한 적용&lt;/code&gt;&lt;/pre&gt;</code></pre>
