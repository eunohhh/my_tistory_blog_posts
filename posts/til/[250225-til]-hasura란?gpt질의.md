<h3 data-ke-size="size23"><b>Hasura란?</b></h3>
<p data-ke-size="size16"><b>Hasura</b>는 <b>GraphQL 기반의 실시간 API 생성 엔진</b>으로, 데이터베이스에서 <b>자동으로 GraphQL API를 생성</b>해주는 도구입니다. 특히 <b>PostgreSQL</b>과 잘 연동되며, 최소한의 설정만으로 강력한 <b>CRUD API 및 실시간 데이터 쿼리</b> 기능을 제공할 수 있습니다.</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>  주요 특징</b></h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>자동 GraphQL API 생성</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>PostgreSQL, MySQL, SQL Server 등의 데이터베이스에서 자동으로 GraphQL API를 생성함.</li>
<li>REST API를 따로 개발할 필요 없이 빠르게 백엔드 구축 가능.</li>
</ul>
</li>
<li><b>실시간 데이터 처리 (Subscriptions)</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>GraphQL의 <code>subscriptions</code> 기능을 기본적으로 지원하여, 데이터 변경 시 자동으로 프론트엔드에 반영됨.</li>
<li>WebSocket을 활용하여 실시간 데이터 업데이트 가능.</li>
</ul>
</li>
<li><b>권한 및 인증 관리</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Role 기반의 권한 시스템 제공 (RBAC, JWT, Webhook 인증 지원).</li>
<li>특정 사용자에게만 특정 데이터 접근 권한을 설정할 수 있음.</li>
</ul>
</li>
<li><b>REST API 변환 지원</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>기존 REST API를 GraphQL로 변환하여 사용할 수 있음.</li>
</ul>
</li>
<li><b>서버리스(Serverless) 및 확장성</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>클라우드 기반 서비스 (Hasura Cloud) 또는 온프레미스(자체 서버)에 설치 가능.</li>
<li>AWS Lambda, Firebase Functions, Supabase 등과 쉽게 연동 가능.</li>
</ul>
</li>
<li><b>Low-Code/No-Code 개발 지원</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>별도의 API 개발 없이, 웹 UI에서 간단한 설정만으로 빠르게 GraphQL API를 생성할 수 있음.</li>
</ul>
</li>
</ol>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>  기본 사용법</b></h3>
<h4 data-ke-size="size20"><b>1. Docker로 Hasura 실행하기</b></h4>
<pre class="properties"><code>docker run -d --name hasura \
  -p 8080:8080 \
  -e HASURA_GRAPHQL_DATABASE_URL=postgres://user:password@host:port/dbname \
  hasura/graphql-engine:latest</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>http://localhost:8080</code>에서 Hasura 콘솔 UI 사용 가능.</li>
</ul>
<h4 data-ke-size="size20"><b>2. GraphQL 쿼리 예제</b></h4>
<pre class="routeros"><code>query {
  users {
    id
    name
    email
  }
}</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>users</code> 테이블의 모든 데이터를 조회하는 GraphQL 쿼리.</li>
</ul>
<h4 data-ke-size="size20"><b>3. 실시간 구독 (Subscription)</b></h4>
<pre class="nginx"><code>subscription {
  messages {
    id
    text
    created_at
  }
}</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>messages</code> 테이블에서 새로운 메시지가 추가되면 실시간으로 반영.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>  Hasura vs 기존 백엔드 개발 방식</b></h3>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>비교 항목</th>
<th>Hasura</th>
<th>기존 REST API 개발</th>
</tr>
</thead>
<tbody>
<tr>
<td>개발 속도</td>
<td>빠름 (자동 API 생성)</td>
<td>느림 (수동 개발 필요)</td>
</tr>
<tr>
<td>실시간 데이터</td>
<td>기본 제공</td>
<td>WebSocket 직접 구현</td>
</tr>
<tr>
<td>보안 및 권한</td>
<td>UI에서 간단히 설정</td>
<td>API마다 수동 설정</td>
</tr>
<tr>
<td>확장성</td>
<td>서버리스 지원</td>
<td>서버 부하 관리 필요</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">➡️ <b>Hasura는 빠른 API 개발과 실시간 데이터 처리가 필요한 프로젝트에 적합!</b>  </p>