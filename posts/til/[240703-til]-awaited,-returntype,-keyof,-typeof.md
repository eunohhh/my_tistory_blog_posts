<h2 data-ke-size="size26">Awaited, ReturnType</h2>
<p data-ke-size="size16">타입스크립트에서 Awaited 와 ReturtnType 에 대해 공부하였습니다.</p>
<p data-ke-size="size16">타입스크립트에서 <code>Awaited&lt;ReturnType&lt;typeof foo&gt;&gt;</code>를 사용하여 타입을 지정하는 방식은 함수 <code>foo</code>의 반환 타입이 <code>Promise</code>일 때 유용합니다. 이를 통해 <code>foo</code> 함수의 비동기 작업이 완료된 후의 결과 타입을 추론할 수 있습니다.</p>
<h3 data-ke-size="size23"><code>Awaited</code> 타입 유틸리티</h3>
<p data-ke-size="size16"><code>Awaited&lt;T&gt;</code>는 타입스크립트에서 비동기 함수의 결과 타입을 추론하는 데 사용되는 유틸리티 타입입니다. <code>Promise</code>가 반환하는 값의 타입을 추출합니다.</p>
<h3 data-ke-size="size23"><code>ReturnType</code> 타입 유틸리티</h3>
<p data-ke-size="size16"><code>ReturnType&lt;T&gt;</code>는 주어진 함수 타입 <code>T</code>의 반환 타입을 추출하는 유틸리티 타입입니다.</p>
<h3 data-ke-size="size23"><code>typeof</code> 연산자</h3>
<p data-ke-size="size16"><code>typeof</code> 연산자는 변수나 함수의 타입을 가져오는 데 사용됩니다.</p>
<h4 data-ke-size="size20">예제</h4>
<pre class="javascript"><code>// 비동기 함수 foo 정의
async function foo() {
  return 42;
}
<p>// foo의 반환 타입은 Promise&lt;number&gt;입니다.
// 따라서 Awaited&lt;ReturnType&lt;typeof foo&gt;&gt;는 number입니다.</p>
<p>type ResultType = Awaited&lt;ReturnType&lt;typeof foo&gt;&gt;;</p>
<p>// ResultType은 number가 됩니다.
const result: ResultType = 42;</p>
<p>console.log(result); // 42</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위 예제에서, <code>foo</code> 함수는 <code>Promise&lt;number&gt;</code>를 반환합니다.</p>
<p data-ke-size="size16"><code>ReturnType&lt;typeof foo&gt;</code>는 <code>Promise&lt;number&gt;</code> 타입을 가져오고, <code>Awaited&lt;ReturnType&lt;typeof foo&gt;&gt;</code>는 이 <code>Promise</code>가 해제된 후의 값을 추출하여 <code>number</code> 타입을 얻게 됩니다.</p>
<h4 data-ke-size="size20">또 다른 예제</h4>
<p data-ke-size="size16">비동기 함수가 객체를 반환하는 경우:</p>
<pre class="xquery"><code>// 비동기 함수 getUser 정의
async function getUser() {
  return {
    id: 1,
    name: "John Doe",
  };
}
<p>// getUser의 반환 타입은 Promise&lt;{ id: number; name: string; }&gt;입니다.
// 따라서 Awaited&lt;ReturnType&lt;typeof getUser&gt;&gt;는 { id: number; name: string; }입니다.</p>
<p>type UserType = Awaited&lt;ReturnType&lt;typeof getUser&gt;&gt;;</p>
<p>// UserType은 { id: number; name: string; } 타입이 됩니다.
const user: UserType = {
id: 1,
name: &quot;John Doe&quot;,
};</p>
<p>console.log(user); // { id: 1, name: &quot;John Doe&quot; }</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 예제에서도 <code>getUser</code> 함수는 <code>Promise&lt;{ id: number; name: string; }&gt;</code> 타입을 반환하며, <code>Awaited&lt;ReturnType&lt;typeof getUser&gt;&gt;</code>를 통해 비동기 작업이 완료된 후의 객체 타입을 추출합니다.</p>
<h3 data-ke-size="size23">요약</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>ReturnType&lt;T&gt;</code>: 함수 <code>T</code>의 반환 타입을 추출합니다.</li>
<li><code>Awaited&lt;T&gt;</code>: <code>Promise</code> 타입 <code>T</code>가 해제된 후의 값을 추출합니다.</li>
<li><code>typeof</code>: 변수나 함수의 타입을 가져옵니다.</li>
</ul>
<p data-ke-size="size16">이 세 가지를 조합하여 비동기 함수의 결과 타입을 추론하는 데 사용할 수 있습니다.</p>
<h1>&nbsp;</h1>
<h2 data-ke-size="size26">keyof typeof</h2>
<p data-ke-size="size16"><code>keyof typeof</code>는 TypeScript에서 주로 객체의 키(key)를 타입으로 추출하고자 할 때 사용하는 구문입니다. 이 구문은 객체의 키를 문자열 리터럴 타입으로 변환하여 타입 수준에서 사용할 수 있게 합니다.</p>
<h3 data-ke-size="size23"><code>typeof</code> 연산자</h3>
<p data-ke-size="size16"><code>typeof</code> 연산자는 객체나 변수의 타입을 가져오는 데 사용됩니다.</p>
<h3 data-ke-size="size23"><code>keyof</code> 연산자</h3>
<p data-ke-size="size16"><code>keyof</code> 연산자는 객체 타입의 키들을 문자열 리터럴 타입으로 변환합니다.</p>
<h3 data-ke-size="size23"><code>keyof typeof</code>의 조합</h3>
<p data-ke-size="size16"><code>keyof typeof</code>의 조합은 객체의 키를 타입으로 추출할 때 매우 유용합니다. 예를 들어, 객체가 선언된 위치에서 그 객체의 키들을 타입으로 사용할 수 있습니다.</p>
<h4 data-ke-size="size20">예제</h4>
<p data-ke-size="size16">다음은 <code>keyof typeof</code>를 사용하는 예제입니다:</p>
<pre class="typescript" data-ke-language="typescript"><code>// 객체 선언
const colors = {
  red: "#FF0000",
  green: "#00FF00",
  blue: "#0000FF",
};
<p>// typeof colors는 { red: string; green: string; blue: string; } 타입입니다.
// keyof typeof colors는 &quot;red&quot; | &quot;green&quot; | &quot;blue&quot; 타입입니다.</p>
<p>type ColorKeys = keyof typeof colors;</p>
<p>// ColorKeys 타입은 &quot;red&quot; | &quot;green&quot; | &quot;blue&quot;입니다.
function printColorName(color: ColorKeys) {
console.log(color);
}</p>
<p>printColorName(&quot;red&quot;);   // 유효
printColorName(&quot;green&quot;); // 유효
printColorName(&quot;blue&quot;);  // 유효</p>
<p>// printColorName(&quot;yellow&quot;); // 컴파일 오류: Argument of type '&quot;yellow&quot;' is not assignable to parameter of type 'ColorKeys'.</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위 예제에서:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><code>const colors</code>는 객체를 정의합니다.</li>
<li><code>typeof colors</code>는 객체의 타입을 추출합니다: <code>{ red: string; green: string; blue: string; }</code>.</li>
<li><code>keyof typeof colors</code>는 이 객체 타입의 키들을 추출하여 유니온 타입 <code>"red" | "green" | "blue"</code>를 만듭니다.</li>
<li><code>ColorKeys</code> 타입은 <code>"red" | "green" | "blue"</code>가 됩니다.</li>
<li><code>printColorName</code> 함수는 <code>ColorKeys</code> 타입을 파라미터로 받아, <code>colors</code> 객체의 유효한 키들만 허용하게 됩니다.</li>
</ol>
<h4 data-ke-size="size20">또 다른 예제</h4>
<p data-ke-size="size16">다른 객체를 사용한 예제:</p>
<pre class="typescript" data-ke-language="typescript"><code>// 객체 선언
const userRoles = {
  admin: 1,
  editor: 2,
  viewer: 3,
};
<p>// typeof userRoles는 { admin: number; editor: number; viewer: number; } 타입입니다.
// keyof typeof userRoles는 &quot;admin&quot; | &quot;editor&quot; | &quot;viewer&quot; 타입입니다.</p>
<p>type RoleKeys = keyof typeof userRoles;</p>
<p>// RoleKeys 타입은 &quot;admin&quot; | &quot;editor&quot; | &quot;viewer&quot;입니다.
function getRoleId(role: RoleKeys): number {
return userRoles[role];
}</p>
<p>console.log(getRoleId(&quot;admin&quot;));  // 1
console.log(getRoleId(&quot;editor&quot;)); // 2
console.log(getRoleId(&quot;viewer&quot;)); // 3</p>
<p>// console.log(getRoleId(&quot;guest&quot;)); // 컴파일 오류: Argument of type '&quot;guest&quot;' is not assignable to parameter of type 'RoleKeys'.</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 예제에서는 <code>userRoles</code> 객체를 사용하여 객체의 키를 타입으로 추출하고, 이를 함수의 파라미터 타입으로 사용하여 안전한 타입 검사를 수행합니다.</p>
<h3 data-ke-size="size23">요약</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>typeof</code> 연산자는 객체나 변수의 타입을 추출합니다.</li>
<li><code>keyof</code> 연산자는 객체 타입의 키들을 문자열 리터럴 타입으로 변환합니다.</li>
<li><code>keyof typeof</code>는 객체의 키를 타입으로 추출하여 타입 안전성을 높이고, 코드의 가독성을 높이는 데 유용합니다.</li>
</ul>
<p data-ke-size="size16">이 조합을 사용하면 객체의 키들을 타입으로 안전하게 다룰 수 있으며, 함수나 변수에서 해당 키들만 사용하도록 제한할 수 있습니다.</p>