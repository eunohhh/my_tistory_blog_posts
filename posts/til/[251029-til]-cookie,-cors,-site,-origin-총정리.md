<h1>  Cookie, CORS, Site/Origin 총정리</h1>
<h2 data-ke-size="size26">1. TL;DR</h2>
<p data-ke-size="size16"><code>example.com</code>(프론트엔드)에서 <code>api.example.com</code>(백엔드)으로 인증 요청을 보낼 때:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Same-Site이지만 Cross-Origin</b>입니다</li>
<li>쿠키에 <code>domain: ".example.com"</code> 설정 필요</li>
<li><code>sameSite: "lax"</code> 충분 (Cross-Site 아니므로)</li>
<li>백엔드 CORS 설정 <b>필수</b> (별개 정책!)</li>
<li>Apollo Client 등 라이브러리&nbsp;<code>credentials: "include"</code> 필수</li>
</ul>
<p data-ke-size="size16"><b>핵심</b>: 쿠키 정책(브라우저)과 CORS(서버) <b>둘 다</b> 맞춰야 성공..</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">2. Site vs Origin 개념</h2>
<h3 data-ke-size="size23">  정의</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Origin</b> = Protocol + Domain + Port (모두 일치해야 Same-Origin)</li>
<li><b>Site</b> = 루트 도메인(<a href="https://developer.mozilla.org/ko/docs/Glossary/eTLD">eTLD+1</a>)이 같으면 Same-Site</li>
</ul>
<h3 data-ke-size="size23">  관계도</h3>
<pre class="routeros"><code>Same-Site
├── Same-Origin
│   └── example.com &rarr; example.com
│       (protocol, domain, port 모두 일치)
│
└── Cross-Origin
    └── example.com &rarr; api.example.com
        (subdomain이 다름)
<p>Cross-Site (무조건 Cross-Origin)
└── Cross-Origin
└── example.com → google.com
(완전히 다른 도메인)</code></pre></p>
<h3 data-ke-size="size23">논리 관계</h3>
<pre class="mipsasm"><code>IF Same-Site:
  ├─ Same-Origin 가능
  └─ Cross-Origin 가능
<p>IF Cross-Site:
└─ Cross-Origin 무조건</p>
<p>IF Same-Origin:
└─ Same-Site 무조건</p>
<p>IF Cross-Origin:
├─ Same-Site 가능 (subdomain만 다를 때)
└─ Cross-Site 가능 (완전히 다른 도메인)</code></pre></p>
<h3 data-ke-size="size23">실제 예시</h3>
<table data-ke-align="alignLeft" data-ke-style="style4">
<thead>
<tr>
<th>From</th>
<th>To</th>
<th>Site</th>
<th>Origin</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>example.com</code></td>
<td><code>example.com</code></td>
<td>Same-Site</td>
<td>Same-Origin</td>
</tr>
<tr>
<td><code>example.com</code></td>
<td><code>api.example.com</code></td>
<td>Same-Site</td>
<td>Cross-Origin</td>
</tr>
<tr>
<td><code>https://example.com</code></td>
<td><code>http://example.com</code></td>
<td>Same-Site</td>
<td>Cross-Origin</td>
</tr>
<tr>
<td><code>example.com</code></td>
<td><code>google.com</code></td>
<td>Cross-Site</td>
<td>Cross-Origin</td>
</tr>
</tbody>
</table>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">3. 쿠키 Domain 옵션</h2>
<h3 data-ke-size="size23">핵심 원칙</h3>
<p data-ke-size="size16">쿠키에 <code>domain</code> 옵션을 <b>명시하지 않으면</b>, 쿠키는 <b>주소 완전히 같을때</b>에만 유효!!</p>
<h3 data-ke-size="size23">설정별 동작</h3>
<h4 data-ke-size="size20">1️⃣ Same-Origin (domain 옵션 불필요)</h4>
<pre class="less"><code>// example.com &rarr; example.com
cookieStore.set('token', jwt, {
  // domain 생략 가능
  path: "/",
  sameSite: "strict", // 가장 엄격한 보안
  secure: true,
  httpOnly: true,
});</code></pre>
<p data-ke-size="size16"><b>쿠키 전송 범위</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>✅ <code>example.com</code> &rarr; <code>example.com</code></li>
</ul>
<p data-ke-size="size16"><b>사용 사례</b>: Next.js API Routes, 모놀리식 아키텍처</p>
<hr data-ke-style="style1" />
<h4 data-ke-size="size20">2️⃣ Same-Site/Cross-Origin (domain 옵션 필수!) ⭐</h4>
<pre class="typescript" data-ke-language="typescript"><code>// example.com &rarr; api.example.com
<p>cookieStore.set('token', jwt, {
domain: &quot;.example.com&quot;, // ⭐ 점(.) 필수! 모든 subdomain 공유
path: &quot;/&quot;,
sameSite: &quot;lax&quot;, // Same-Site이므로 충분
secure: true,
httpOnly: true,
maxAge: 30 * 24 * 60 * 60, // 30일
});</code></pre></p>
<p data-ke-size="size16"><b>쿠키 전송 범위</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>✅ <code>example.com</code> &rarr; <code>example.com</code></li>
<li>✅ <code>example.com</code> &rarr; <code>api.example.com</code> (전송됨!)</li>
<li>✅ <code>example.com</code> &rarr; <code>admin.example.com</code></li>
</ul>
<p data-ke-size="size16"><b>사용 사례</b>: 마이크로서비스, API 서버 분리, SSO</p>
<hr data-ke-style="style1" />
<h4 data-ke-size="size20">3️⃣ Cross-Site (점점 불가능해지는 중) !!</h4>
<pre class="less"><code>// example.com &rarr; external.com
cookieStore.set('token', jwt, {
  domain: ".example.com",
  sameSite: "none", // ⚠️ 필수!
  secure: true,      // ⚠️ 필수!
  httpOnly: true,
});</code></pre>
<p data-ke-size="size16"><b>주의사항</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Chrome 등 주요 브라우저에서 3rd party 쿠키 차단 중</li>
<li>2024년부터 기본적으로 차단</li>
<li>대안: <b>JWT를 Authorization 헤더로 전송</b></li>
</ul>
<p data-ke-size="size16"><b>사용 사례</b>: 외부 인증 제공자</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">4. 백엔드 CORS는 별개 정책!</h2>
<h3 data-ke-size="size23">  두 가지 독립적인 보안 레이어</h3>
<p data-ke-size="size16">1️⃣ CORS (서버 측 정책) &rarr; 서버: "이 origin 요청 받을까?"<br />2️⃣ Cookie Policy (브라우저 정책) &rarr; 브라우저: "이 쿠키를 보낼까?"</p>
<p data-ke-size="size16">둘 다 통과해야 성공임..!</p>
<h3 data-ke-size="size23">✅ 성공 케이스 (모두 OK)</h3>
<pre class="cs"><code>// 프론트엔드: example.com
// 백엔드: api.example.com
<p>// 1️⃣ 쿠키 설정 (브라우저 정책)
cookieStore.set('token', jwt, {
domain: &quot;.example.com&quot;, // ✅
sameSite: &quot;lax&quot;,         // ✅
secure: true,
httpOnly: true,
});</p>
<p>// 2️⃣ Apollo Client 설정
const httpLink = createHttpLink({
uri: 'https://api.example.com/v1/graphql',
credentials: 'include', // ✅ 필수!
});</p>
<p>// 3️⃣ 백엔드 CORS 설정 (서버 정책)
// api.example.com 환경 변수
CORS_ORIGIN: &quot;https://example.com&quot; // ✅
// 또는 Hasura의 경우
HASURA_GRAPHQL_CORS_DOMAIN: &quot;https://example.com&quot;</code></pre></p>
<p data-ke-size="size16"><b>결과</b>:   요청 성공! 인증 성공!</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">❌ 실패 케이스 1: CORS 차단</h3>
<pre class="typescript" data-ke-language="typescript"><code>// 1️⃣ 쿠키 설정: ✅ OK
cookieStore.set('token', jwt, {
  domain: ".example.com",
  sameSite: "lax",
});
<p>// 2️⃣ CORS 설정: ❌ 없음
// api.example.com에 CORS 설정 안 함</code></pre></p>
<p data-ke-size="size16"><b>브라우저 콘솔 에러</b>:</p>
<pre class="oxygene"><code>Access to fetch at 'https://api.example.com/v1/graphql' 
from origin 'https://example.com' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present.</code></pre>
<p data-ke-size="size16"><b>결과</b>:   요청 자체가 차단됨</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">⚠️ 실패 케이스 2: 쿠키 정책 실패</h3>
<pre class="gams"><code>// 1️⃣ 쿠키 설정: ❌ domain 없음
cookieStore.set('token', jwt, {
  // domain 없음 &rarr; example.com만
  sameSite: "lax",
});
<p>// 2️⃣ CORS 설정: ✅ OK
HASURA_GRAPHQL_CORS_DOMAIN: &quot;https://example.com&quot;</code></pre></p>
<p data-ke-size="size16"><b>Network 탭</b>:</p>
<pre class="yaml"><code>Request Headers:
  (Cookie 헤더 없음) ❌
<p>Response:
200 OK ✅
{ &quot;x-hasura-role&quot;: &quot;guest&quot; } ⚠️ 인증 실패</code></pre></p>
<p data-ke-size="size16"><b>결과</b>: 요청은 성공하지만 인증 실패 ㅜㅜ</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">완전한 체크리스트</h3>
<p data-ke-size="size16">Cross-Origin 인증 요청이 성공하려면:</p>
<pre class="groovy"><code>백엔드 (api.example.com)
  ✅ CORS 설정
    ├─ Access-Control-Allow-Origin: https://example.com
    ├─ Access-Control-Allow-Credentials: true
    ├─ Access-Control-Allow-Methods: POST, GET, OPTIONS
    └─ Access-Control-Allow-Headers: Content-Type, Authorization
<p>프론트엔드 (example.com)
✅ 쿠키 설정
├─ domain: &quot;.example.com&quot;
├─ sameSite: &quot;lax&quot;
├─ secure: true
└─ httpOnly: true</p>
<p>✅ HTTP Client 설정
└─ credentials: &quot;include&quot; (fetch API)
└─ credentials: &quot;include&quot; (Apollo Client)</code></pre></p>
<p data-ke-size="size16"><b>하나라도 빠지면 실패입니다..</b></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">5. 교훈</h2>
<h3 data-ke-size="size23">핵심 정리</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Site &ne; Origin</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Same-Site: 루트 도메인만 같으면 OK</li>
<li>Same-Origin: Protocol + Domain + Port 모두 같아야 함</li>
</ul>
</li>
<li><b>쿠키는 domain 옵션이 핵심</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>domain: ".example.com"</code> &rarr; 모든 subdomain 공유</li>
<li>옵션 없음 &rarr; 정확한 호스트만</li>
</ul>
</li>
<li><b>CORS는 별개 정책</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>쿠키 정책(브라우저) &ne; CORS(서버)</li>
<li>둘 다 맞춰야 성공!</li>
</ul>
</li>
<li><b>실무에서는 Same-Site/Cross-Origin이 일반적</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>프론트엔드와 API를 subdomain으로 분리</li>
<li><code>domain: ".example.com"</code> + <code>sameSite: "lax"</code> + CORS 설정</li>
</ul>
</li>
</ol>
<h3 data-ke-size="size23">⚡⚡⚡⚡ 명확히 이해하자..!</h3>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>CORS, Site, Origin, 쿠키 정책은 각각 다른 보안 레이어!<br />개념을 명확히 이해하고, 각 레이어를 올바르게 설정해야 Cross-Origin 인증이 성공!</b></p>
</blockquote>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">참고 자료</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies">MDN - HTTP Cookies</a></li>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS">MDN - CORS</a></li>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy">MDN - Same-origin policy</a></li>
<li><a href="https://web.dev/samesite-cookies-explained/">web.dev - SameSite cookies explained</a></li>
</ul>