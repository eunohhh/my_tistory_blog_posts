<h3 data-ke-size="size23"><b>XSS와 SQL Injection: 왜 실행될까?</b></h3>
<p data-ke-size="size16">  <b>핵심 질문:</b><br /><i>"유저 입력에 JavaScript 코드나 SQL 문을 넣는다고 해서, 이게 클라이언트나 서버에서 실행될 수 있는가?"</i></p>
<p data-ke-size="size16">✅ <b>답변:</b> 실행될 수 있음.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>XSS는 <b>클라이언트(브라우저)에서 실행</b>되는 문제</li>
<li>SQL Injection은 <b>서버(DB)에서 실행</b>되는 문제<br />둘 다 <b>입력값을 제대로 처리하지 않으면 악성 코드가 실행될 수 있음</b>.</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>1️⃣ XSS (Cross-Site Scripting) &rarr; 클라이언트에서 실행됨</b></h2>
<h3 data-ke-size="size23"><b>XSS가 발생하는 이유:</b></h3>
<p data-ke-size="size16">브라우저는 HTML을 렌더링할 때, <b>스크립트(<code>&lt;script&gt;</code> 태그 등)가 있으면 실행</b>하도록 설계되어 있음.<br />  즉, <b>입력값을 필터링하지 않으면 유저가 삽입한 스크립트도 브라우저가 정상적인 코드로 인식하고 실행함</b>.</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>  XSS 공격 예시</b></h3>
<h4 data-ke-size="size20">✅ <b>1. Stored XSS (저장형 XSS)</b></h4>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>공격자가 댓글 입력 필드에 악성 스크립트를 입력</li>
<li><code class="language-html"> &lt;script&gt;alert('해킹됨!');&lt;/script&gt;</code></li>
<li>이 값이 그대로 데이터베이스에 저장됨</li>
<li>이후, 다른 사용자가 이 페이지를 방문할 때 <b>저장된 악성 스크립트가 브라우저에서 실행됨</b></li>
</ol>
<p data-ke-size="size16">  <b>왜 실행될까?</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>서버가 입력값을 필터링 없이 그대로 HTML로 반환하기 때문</li>
<li>브라우저는 <code>&lt;script&gt;</code> 태그를 만나면 실행하도록 설계되어 있음</li>
</ul>
<p data-ke-size="size16">✅ <b>방어 방법:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>입력값 필터링 (<code>DOMPurify</code>, <code>escape()</code>)</b></li>
<li><b><code>Content-Security-Policy (CSP)</code> 적용하여 외부 스크립트 차단</b></li>
<li><b><code>innerHTML</code> 대신 <code>textContent</code> 사용</b></li>
</ul>
<pre class="capnproto"><code>import DOMPurify from "dompurify";
const safeContent = DOMPurify.sanitize(userInput);</code></pre>
<hr data-ke-style="style1" />
<h4 data-ke-size="size20">✅ <b>2. Reflected XSS (반사형 XSS)</b></h4>
<ol style="list-style-type: decimal;" start="4" data-ke-list-type="decimal">
<li>공격자가 URL에 악성 스크립트를 포함한 링크를 보냄</li>
<li><code> https://example.com/search?q=&lt;script&gt;alert('XSS')&lt;/script&gt;</code></li>
<li>서버가 <code>q</code> 값을 필터링 없이 HTML에 포함하여 응답</li>
<li><code class="language-html"> &lt;h1&gt;검색 결과: &lt;script&gt;alert('XSS')&lt;/script&gt;&lt;/h1&gt;</code></li>
<li>사용자가 링크를 클릭하면 <b>즉시 브라우저에서 스크립트가 실행됨</b></li>
</ol>
<p data-ke-size="size16">✅ <b>방어 방법:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>입력값을 HTML 인코딩 (<code>&lt;script&gt;</code> &rarr; <code>&amp;lt;script&amp;gt;</code>)</b></li>
<li><b>입력값을 직접 HTML에 삽입하지 않고, 안전한 렌더링 방식 사용</b></li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>2️⃣ SQL Injection &rarr; 서버(DB)에서 실행됨</b></h2>
<h3 data-ke-size="size23"><b>SQL Injection이 발생하는 이유:</b></h3>
<p data-ke-size="size16">SQL 쿼리를 만들 때, <b>유저 입력값을 직접 문자열로 삽입하면</b>, 공격자가 SQL 문법을 조작할 수 있음.<br />  즉, <b>서버가 입력값을 검증 없이 SQL 쿼리에 직접 포함하면, 데이터베이스가 이를 SQL 코드로 해석함</b>.</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>  SQL Injection 공격 예시</b></h3>
<h4 data-ke-size="size20">✅ <b>1. 로그인 우회 공격</b></h4>
<pre class="routeros"><code>const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">✔️ 정상 입력:</p>
<pre class="ini"><code>username = "admin"
password = "1234"</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">  실행되는 쿼리:</p>
<pre class="routeros"><code>SELECT * FROM users WHERE username = 'admin' AND password = '1234';</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">✔️ 공격자 입력 (SQL 문 삽입):</p>
<pre class="ini"><code>username = "admin"
password = "' OR '1'='1"</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">  실행되는 쿼리 (항상 참이 됨 &rarr; 로그인 성공):</p>
<pre class="routeros"><code>SELECT * FROM users WHERE username = 'admin' AND password = '' OR '1'='1';</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">✅ <b>방어 방법:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Prepared Statements (프리페어드 스테이트먼트) 사용</b></li>
<li><b>ORM(Prisma, Sequelize 등) 사용하여 SQL 직접 실행 방지</b></li>
</ul>
<p data-ke-size="size16">  <b>SQL Injection 방어 코드 예시 (프리페어드 스테이트먼트 사용)</b></p>
<pre class="sql"><code>const query = "SELECT * FROM users WHERE username = ? AND password = ?";
db.execute(query, [username, password]);</code></pre>
<p data-ke-size="size16">  <b>프리페어드 스테이트먼트를 사용하면, 입력값이 SQL 코드로 해석되지 않고 안전하게 처리됨.</b></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>3️⃣ XSS vs SQL Injection 차이점 정리</b></h2>
<table style="height: 115px;" data-ke-align="alignLeft" data-ke-style="style4">
<thead>
<tr style="height: 20px;">
<th style="height: 20px;">구분</th>
<th style="height: 20px;">XSS (Cross-Site Scripting)</th>
<th style="height: 20px;">SQL Injection</th>
</tr>
</thead>
<tbody>
<tr style="height: 19px;">
<td style="height: 19px;"><b>공격 대상</b></td>
<td style="height: 19px;">클라이언트(브라우저)</td>
<td style="height: 19px;">서버(DB)</td>
</tr>
<tr style="height: 19px;">
<td style="height: 19px;"><b>공격 방식</b></td>
<td style="height: 19px;">HTML에 악성 스크립트 삽입</td>
<td style="height: 19px;">SQL 쿼리 조작</td>
</tr>
<tr style="height: 19px;">
<td style="height: 19px;"><b>실행 위치</b></td>
<td style="height: 19px;">브라우저에서 실행</td>
<td style="height: 19px;">데이터베이스에서 실행</td>
</tr>
<tr style="height: 19px;">
<td style="height: 19px;"><b>주요 원인</b></td>
<td style="height: 19px;">사용자 입력을 HTML에 그대로 삽입</td>
<td style="height: 19px;">사용자 입력을 SQL에 그대로 삽입</td>
</tr>
<tr style="height: 19px;">
<td style="height: 19px;"><b>방어 방법</b></td>
<td style="height: 19px;"><code>escape()</code>, <code>DOMPurify</code>, CSP 적용</td>
<td style="height: 19px;">Prepared Statements 사용</td>
</tr>
</tbody>
</table>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>  요약</b></h2>
<p data-ke-size="size16">XSS와 SQL Injection은 둘 다 사용자 입력값을 제대로 처리하지 않으면 발생하는 보안 취약점입니다.<br />XSS는 <b>클라이언트에서 실행되는 스크립트를 삽입하는 공격</b>으로, 브라우저가 <code>&lt;script&gt;</code> 태그를 그대로 실행하기 때문에 발생합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이를 방지하려면 <b>입력값을 인코딩하거나, <code>DOMPurify</code> 같은 라이브러리를 사용해 안전한 HTML만 렌더링하는 것이 중요합니다.</b></p>
<p data-ke-size="size16">SQL Injection은 <b>서버에서 실행되는 SQL 쿼리를 조작하는 공격</b>으로, 사용자가 입력한 값을 SQL에 직접 삽입하면 발생할 수 있습니다. 이를 방지하기 위해서는 <b>Prepared Statements를 사용하여 입력값이 SQL 코드로 해석되지 않도록 해야 합니다.</b></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">둘 다 입력값 검증이 핵심이며, 실제 프로젝트에서도 프론트엔드(XSS 방어)와 백엔드(SQL Injection 방어)를 모두 고려하는 것이 중요합니다.</p>