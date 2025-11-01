<h1>React Query에서 클래스 메서드를 queryFn으로 사용할 때 주의사항</h1><h2 data-ke-size="size26">문제 상황</h2><p data-ke-size="size16">React Query를 사용하다가 다음과 같은 에러를 만났습니다:</p><pre class="lisp"><code>Cannot read properties of undefined (reading 'get')</code></pre><p data-ke-size="size16">코드는 다음과 같았습니다:</p><pre class="scala"><code>// queries.ts
export const useUserQuery = () =&gt; {
  return useQuery({
    queryKey: ['user'],
    queryFn: api.getUser, // 이 부분이 문제!
  });
};
<p>// apis.ts
class ApiClient extends BaseApiClient {
public getUser() {
return this.get&lt;User&gt;(&quot;/api/auth/user&quot;);
}
}</code></pre><p data-ke-size="size16">기본적인 문제죠..? 바로 this, 화살표함수 문제가 딱 떠올라야 하겠죠..?<br>하지만 저는 오늘도 바로 생각해내지 못했답니다. 헛공부...</p><h2 data-ke-size="size26">원인: JavaScript의 this 바인딩 손실</h2><p data-ke-size="size16">JavaScript에서 메서드를 다른 곳에 전달할 때, <b>this 컨텍스트가 손실</b>됩니다.</p><pre class="reasonml"><code>const api = new ApiClient();</p>
<p>// 직접 호출: this가 api 인스턴스를 가리킴
api.getUser(); // ✅ 정상 작동</p>
<p>// 메서드를 변수에 할당: this 컨텍스트 손실
const getUserFn = api.getUser;
getUserFn(); // ❌ this는 undefined</code></pre><p data-ke-size="size16">React Query의 <code>queryFn</code>에 메서드를 전달하면, React Query가 나중에 그 함수를 호출할 때 원래의 인스턴스 컨텍스트 없이 호출하게 됩니다. 따라서 <code>this.get</code>을 찾을 수 없게 되는 것입니다.</p><h2 data-ke-size="size26">해결 방법 1: 화살표 함수로 변경 (그냥 이걸로 하면 되는 것...)</h2><p data-ke-size="size16"><b>화살표 함수는 렉시컬 스코프를 사용</b>하여 정의될 당시의 <code>this</code>를 영구적으로 바인딩합니다.</p><pre class="scala"><code>// apis.ts
class ApiClient extends BaseApiClient {
// 일반 메서드 대신 화살표 함수로 정의
public getUser = () =&gt; {
return this.get&lt;User&gt;(&quot;/api/auth/user&quot;);
};</p>
<p>public logOut = () =&gt; {
return this.get(&quot;/api/auth/logout&quot;);
};
}</p>
<p>const api = new ApiClient();
export default api;</code></pre><pre class="javascript"><code>// queries.ts
export const useUserQuery = () =&gt; {
return useQuery({
queryKey: ['user'],
queryFn: api.getUser, // ✅ 이제 안전하게 사용 가능!
});
};</code></pre><h2 data-ke-size="size26">해결 방법 2: 래퍼 함수 사용</h2><p data-ke-size="size16">화살표 함수로 감싸서 명시적으로 컨텍스트를 유지할 수도 있습니다:</p><pre class="coffeescript"><code>export const useUserQuery = () =&gt; {
return useQuery({
queryKey: ['user'],
queryFn: () =&gt; api.getUser(), // 화살표 함수로 감싸기
});
};</code></pre><p data-ke-size="size16">하지만 이 방법은 모든 사용처에서 매번 래핑해야 하므로 번거롭습니다.<br>그리구.. tanstack 의 client 측 공식 가이드와도 다름</p><h2 data-ke-size="size26">해결 방법 3: bind 사용</h2><p data-ke-size="size16">생성자에서 메서드를 바인딩할 수도 있습니다:</p><pre class="kotlin"><code>class ApiClient extends BaseApiClient {
constructor() {
super(config);
this.getUser = this.getUser.bind(this);
this.logOut = this.logOut.bind(this);
}</p>
<p>public getUser() {
return this.get&lt;User&gt;(&quot;/api/auth/user&quot;);
}
}</code></pre><p data-ke-size="size16">하지만 메서드가 많아질수록 관리가 어려워집니다.</p><h2 data-ke-size="size26">결론</h2><p data-ke-size="size16">React Query의 <code>queryFn</code>이나 콜백으로 클래스 메서드를 전달할 때는 <b>화살표 함수로 정의</b>하는 것이 가장 안전하고 깔끔한 방법입니다. 화살표 함수는 정의 시점의 <code>this</code>를 영구적으로 캡처하므로, 어디서 호출되든 항상 올바른 컨텍스트를 유지합니다.</p><h3 data-ke-size="size23">일반 메서드 vs 화살표 함수</h3><pre class="kotlin"><code>class Example {
// ❌ 일반 메서드: this 컨텍스트가 호출 시점에 결정
public method() {
return this.something;
}</p>
<p>// ✅ 화살표 함수: this 컨텍스트가 정의 시점에 고정
public arrowMethod = () =&gt; {
return this.something;
}
}</code></pre><p data-ke-size="size16">이 패턴은 React Query뿐만 아니라 이벤트 핸들러, setTimeout, Promise 콜백 등 메서드를 전달하는 모든 상황에서 유용하게 사용할 수 있습니다.</p></p>
