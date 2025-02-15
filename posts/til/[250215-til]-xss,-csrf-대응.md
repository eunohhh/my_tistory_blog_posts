<h3 data-ke-size="size23"><b>1. XSS(Cross-Site Scripting) 방어</b></h3>
<p data-ke-size="size16">  <b>문제</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>사용자가 입력한 HTML 태그를 그대로 렌더링하는 취약점 발견 (Stored XSS)</li>
<li>URL 파라미터에서 자바스크립트 실행이 가능한 이슈 발견 (Reflected XSS)</li>
</ul>
<p data-ke-size="size16">✅ <b>해결 방법</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>React에서 기본적으로 <code>dangerouslySetInnerHTML</code>을 사용하지 않도록 하고, <code>DOMPurify</code>를 적용해 안전한 HTML만 허용</li>
<li>서버에서 <code>Content-Security-Policy (CSP)</code> 헤더를 추가하여 악성 스크립트 실행 방지</li>
<li><code>escape()</code>를 적용해 HTML 인코딩 처리</li>
</ul>
<p data-ke-size="size16">  <b>예제 코드 (DOMPurify 적용)</b></p>
<pre class="javascript"><code>import DOMPurify from "dompurify";
<p>const sanitizedHTML = DOMPurify.sanitize(userInput);
&lt;div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} /&gt;;</code></pre></p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>2. CSRF(Cross-Site Request Forgery) 방어</b></h3>
<p data-ke-size="size16">  <b>문제</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>로그인된 사용자의 세션을 악용해, 악성 사이트에서 서버에 요청을 보내는 공격 가능성</li>
</ul>
<p data-ke-size="size16">✅ <b>해결 방법</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>CSRF 토큰 적용</b>: API 요청 시 CSRF 토큰을 포함하도록 설정</li>
<li><b>SameSite 쿠키 적용</b>: <code>SameSite=Strict</code> 또는 <code>SameSite=Lax</code>를 설정하여 외부 도메인에서 쿠키를 사용하지 못하게 설정</li>
</ul>
<p data-ke-size="size16">  <b>예제 코드 (CSRF 토큰 적용 예시 - Express.js)</b></p>
<pre class="less"><code>app.use(csrf({ cookie: true }));
app.post("/transfer", (req, res) =&gt; {
  if (req.body._csrf !== req.cookies["XSRF-TOKEN"]) {
    return res.status(403).json({ error: "CSRF validation failed" });
  }
  res.send("Transfer success");
});</code></pre>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>OWASP Top 10이란?</b></h3>
<p data-ke-size="size16">OWASP(Open Web Application Security Project) Top 10은 <b>웹 애플리케이션에서 가장 흔하게 발생하는 보안 취약점 10가지</b>를 정리한 목록입니다. 주기적으로 업데이트되며, 보안 점검 및 예방을 위한 가이드라인 역할을 합니다.</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>2021년 OWASP Top 10 목록&nbsp;</b></h3>
<table style="height: 315px; width: 857px;" data-ke-align="alignLeft" data-ke-style="style4">
<thead>
<tr style="height: 20px;">
<th style="height: 20px; width: 50px;">순위</th>
<th style="height: 20px; width: 247px;">취약점</th>
<th style="height: 20px; width: 307px;">설명</th>
<th style="height: 20px; width: 253px;">예방 방법</th>
</tr>
</thead>
<tbody>
<tr style="height: 19px;">
<td style="height: 19px; width: 50px;"><b>1</b></td>
<td style="height: 19px; width: 247px;">Broken Access Control</td>
<td style="height: 19px; width: 307px;">권한이 없는 사용자가 제한된 기능에 접근 가능</td>
<td style="height: 19px; width: 253px;">권한 검증 철저히, ACL 적용</td>
</tr>
<tr style="height: 19px;">
<td style="height: 19px; width: 50px;"><b>2</b></td>
<td style="height: 19px; width: 247px;">Cryptographic Failures</td>
<td style="height: 19px; width: 307px;">암호화 미흡으로 데이터 유출 가능</td>
<td style="height: 19px; width: 253px;">HTTPS 적용, 안전한 암호화 사용</td>
</tr>
<tr style="height: 38px;">
<td style="height: 38px; width: 50px;"><b>3</b></td>
<td style="height: 38px; width: 247px;">Injection (SQLi, XSS 등)</td>
<td style="height: 38px; width: 307px;">악성 코드가 입력 필드나 쿼리를 통해 실행됨</td>
<td style="height: 38px; width: 253px;">입력값 검증, SQL 바인딩, <code>escape()</code> 처리</td>
</tr>
<tr style="height: 19px;">
<td style="height: 19px; width: 50px;"><b>4</b></td>
<td style="height: 19px; width: 247px;">Insecure Design</td>
<td style="height: 19px; width: 307px;">설계 단계에서 보안 고려 부족</td>
<td style="height: 19px; width: 253px;">보안 리뷰 수행, 안전한 설계 패턴 적용</td>
</tr>
<tr style="height: 38px;">
<td style="height: 38px; width: 50px;"><b>5</b></td>
<td style="height: 38px; width: 247px;">Security Misconfiguration</td>
<td style="height: 38px; width: 307px;">잘못된 설정으로 인한 보안 문제 (디버그 모드 활성화 등)</td>
<td style="height: 38px; width: 253px;">안전한 기본 설정 적용, 자동화된 보안 점검</td>
</tr>
<tr style="height: 35px;">
<td style="height: 35px; width: 50px;"><b>6</b></td>
<td style="height: 35px; width: 247px;">Vulnerable and Outdated Components</td>
<td style="height: 35px; width: 307px;">취약한 라이브러리, 프레임워크 사용</td>
<td style="height: 35px; width: 253px;">최신 버전 유지, 정기적 패치 적용</td>
</tr>
<tr style="height: 35px;">
<td style="height: 35px; width: 50px;"><b>7</b></td>
<td style="height: 35px; width: 247px;">Identification and Authentication Failures</td>
<td style="height: 35px; width: 307px;">취약한 로그인 방식 (약한 비밀번호, 인증 미흡)</td>
<td style="height: 35px; width: 253px;">강력한 패스워드 정책, MFA 적용</td>
</tr>
<tr style="height: 19px;">
<td style="height: 19px; width: 50px;"><b>8</b></td>
<td style="height: 19px; width: 247px;">Software and Data Integrity Failures</td>
<td style="height: 19px; width: 307px;">코드, 데이터 변조 가능 (서명 없는 업데이트 등)</td>
<td style="height: 19px; width: 253px;">코드 서명, CI/CD 보안 강화</td>
</tr>
<tr style="height: 35px;">
<td style="height: 35px; width: 50px;"><b>9</b></td>
<td style="height: 35px; width: 247px;">Security Logging and Monitoring Failures</td>
<td style="height: 35px; width: 307px;">보안 이벤트 감지가 어려움</td>
<td style="height: 35px; width: 253px;">로그 기록 및 모니터링 강화</td>
</tr>
<tr style="height: 38px;">
<td style="height: 38px; width: 50px;"><b>10</b></td>
<td style="height: 38px; width: 247px;">Server-Side Request Forgery (SSRF)</td>
<td style="height: 38px; width: 307px;">서버가 악성 URL을 요청하도록 유도</td>
<td style="height: 38px; width: 253px;">외부 요청 검증, 허용 목록(allowlist) 설정</td>
</tr>
</tbody>
</table>