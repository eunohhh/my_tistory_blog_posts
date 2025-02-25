<h3 data-ke-size="size23"><b>n8n이란?</b></h3>
<p data-ke-size="size16"><b>n8n</b>은 오픈 소스 기반의 <b>워크플로우 자동화(Workflow Automation) 도구</b>로, 다양한 API 및 서비스 간의 데이터 흐름을 자동화할 수 있도록 도와주는 <b>노코드(No-Code) / 로우코드(Low-Code) 플랫폼</b>입니다.</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>  주요 특징</b></h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>오픈 소스 &amp; 셀프 호스팅 가능</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>n8n은 오픈 소스이므로 무료로 사용할 수 있으며, 직접 서버에 배포하여 사용할 수도 있습니다.</li>
<li>SaaS(클라우드) 버전도 제공됨.</li>
</ul>
</li>
<li><b>직관적인 노드 기반 UI</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>플로우 차트처럼 노드를 연결하여 워크플로우를 구성할 수 있음.</li>
<li>개발자가 아니더라도 쉽게 자동화할 수 있음.</li>
</ul>
</li>
<li><b>150개 이상의 서비스 통합 지원</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Slack, GitHub, Notion, Google Sheets, Trello, PostgreSQL, MySQL, Stripe 등 다양한 API와 연동 가능.</li>
</ul>
</li>
<li><b>커스텀 코드 실행 가능</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>단순한 연결뿐만 아니라 JavaScript를 활용하여 복잡한 로직을 추가 가능.</li>
<li><code>Function Node</code>를 통해 자유롭게 코드 작성 가능.</li>
</ul>
</li>
<li><b>Webhook 및 배치 작업 지원</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>특정 이벤트(Webhook)가 발생하면 자동으로 실행되거나, 주기적으로 실행되도록 설정 가능.</li>
</ul>
</li>
<li><b>데이터 변환 및 분기 처리</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>JSON 데이터를 가공하거나, 조건에 따라 다른 작업을 실행하도록 설정 가능.</li>
</ul>
</li>
</ol>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>  n8n 활용 예시</b></h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Slack 알림 자동화</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>특정 GitHub 이슈가 생성되면 Slack 채널로 알림 전송.</li>
</ul>
</li>
<li><b>Google Sheets 데이터 처리</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>매일 오전 9시에 Google Sheets에서 데이터를 읽고, 특정 조건에 맞는 데이터를 필터링하여 이메일 전송.</li>
</ul>
</li>
<li><b>E-commerce 주문 처리 자동화</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Shopify에서 주문이 들어오면, 고객 정보 및 주문 내역을 Notion에 기록하고, 배송 추적을 위해 외부 API 호출.</li>
</ul>
</li>
<li><b>SNS 게시 자동화</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>RSS 피드에서 새 글이 감지되면 Twitter 및 LinkedIn에 자동으로 게시.</li>
</ul>
</li>
</ol>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>  기본적인 동작 방식</b></h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Trigger 설정</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Webhook, 크론 스케줄러, API 호출 등 특정 이벤트를 감지하는 트리거 설정.</li>
</ul>
</li>
<li><b>데이터 처리</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>여러 서비스(API)와 연동하여 데이터를 가공하고 저장.</li>
</ul>
</li>
<li><b>출력 및 후속 작업</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Slack 메시지 전송, 이메일 발송, DB 업데이트 등 원하는 액션을 실행.</li>
</ul>
</li>
</ol>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>  n8n vs 다른 자동화 도구</b></h3>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>기능</th>
<th>n8n (오픈 소스)</th>
<th>Zapier (유료)</th>
<th>Make (유료)</th>
</tr>
</thead>
<tbody>
<tr>
<td>가격</td>
<td>무료 (자체 호스팅)</td>
<td>유료 (무료 플랜 제한)</td>
<td>유료 (무료 플랜 제한)</td>
</tr>
<tr>
<td>셀프 호스팅</td>
<td>✅ 가능</td>
<td>❌ 불가능</td>
<td>❌ 불가능</td>
</tr>
<tr>
<td>코드 실행</td>
<td>✅ 가능 (JS)</td>
<td>❌ 제한적</td>
<td>✅ 가능</td>
</tr>
<tr>
<td>API 연동</td>
<td>✅ 150+ 개</td>
<td>✅ 5000+ 개</td>
<td>✅ 1000+ 개</td>
</tr>
<tr>
<td>복잡한 워크플로우</td>
<td>✅ 가능</td>
<td>❌ 제한적</td>
<td>✅ 가능</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">➡️ <b>n8n은 Zapier보다 유연하고 확장성이 뛰어나며, 자체 서버에서 실행 가능하다는 장점이 있음.</b></p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>  n8n 설치 방법 (Docker)</b></h3>
<pre class="livescript"><code>docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>실행 후 <code>http://localhost:5678</code> 에 접속하여 사용 가능.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>  결론</b></h3>
<p data-ke-size="size16">n8n은 <b>비개발자도 쉽게 자동화 가능하면서도, 개발자가 필요하면 코드로 확장할 수 있는 유연한 워크플로우 자동화 도구</b>입니다.<br /><b>Zapier보다 강력한 기능을 무료로 사용하고 싶다면 n8n이 좋은 선택!</b>  </p>