<h1>Hasura(GQL) 사용시 3rd-Party 쿠키 정책 문제</h1>
<h2 data-ke-size="size26">Q) credentials: "include" 라면 알아서 쿠키 전송 Ok?</h2>
<p data-ke-size="size16">제가 cookie 기반에서 httponly, secured, domain, samesite 설명을 여러가지로 변주해서 시도해봤지만 결론은 브라우저의 third-party cookie 정책으로 인해 쿠키가 자동 전송되지 않는데 이게 맞나요?(심지어 서브도메인 - api.myapp.com &lt;&gt; myapp.com 이더라도)</p>
<h2 data-ke-size="size26">A) 맞다.</h2>
<p data-ke-size="size16">맞아요. 결론부터 말하면: 브라우저가 Hasura로 쿠키를 보내주지 못하면(3rd‑party 쿠키 차단), Remote Schema를 써도 Hasura가 JWT를 검증할 수 없고, 따라서 <code>x-hasura-user-id</code> 같은 세션 변수도 생성되지 않습니다. 그래서 yoga 리졸버에서 userId를 받을 수 없어요.</p>
<h3 data-ke-size="size23">왜 credentials: 'include'로는 부족한가</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>credentials: 'include'</code>는 &ldquo;보낼 수 있는 쿠키는 보내라&rdquo;는 의미일 뿐, 브라우저의 3rd‑party 쿠키 정책을 우회하지 못합니다.</li>
<li>다른 도메인(혹은 크로스‑사이트로 판정되는 서브도메인)으로 요청하면 최신 브라우저는 쿠키를 기본 차단합니다. 그래서 Hasura는 쿠키(JWT)를 못 받습니다.</li>
</ul>
<pre class="qml"><code>const authLink = new SetContextLink(async (prevContext, _operation) =&gt; {
  let token: string | null | undefined;
<p>const headers = {
...prevContext.headers,
...(token &amp;&amp; { authorization: <code>Bearer ${token}</code> }),
&quot;x-request-from&quot;: isServer ? &quot;server&quot; : &quot;client&quot;,
};
return { headers };
});</code></pre></p>
<pre class="dts"><code>const httpLink = new HttpLink({
  uri: endpoint,
  credentials: "include",
  ...(!!hasuraAdminSecret &amp;&amp; {
    headers: { "x-hasura-admin-secret": hasuraAdminSecret },
  }),
});</code></pre>
<h3 data-ke-size="size23">한줄 요약</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Hasura Remote Schema는 &ldquo;Hasura가 인증을 끝내고 나서&rdquo; 우리 yoga로 세션 변수를 넘겨줍니다. 브라우저의 3rd‑party 쿠키 차단으로 Hasura가 쿠키(JWT)를 못 받으면 인증 불가이므로, 같은 사이트 프록시나 BFF로 Authorization 헤더 전달이 필요합니다.</li>
</ul>