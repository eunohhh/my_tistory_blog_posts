<p><code>as const</code>는 TypeScript에서 <strong>리터럴 타입 추론</strong>을 위해 사용하는 구문입니다. 이를 통해 객체, 배열, 문자열 등의 값을 &quot;읽기 전용&quot;으로 설정하고, 그 값을 <strong>리터럴 타입</strong>으로 좁힐 수 있습니다.</p>
<hr>
<h3>1. <strong><code>as const</code>의 역할</strong></h3>
<p><code>as const</code>는 TypeScript에서 다음과 같은 역할을 합니다:</p>
<ol>
<li><strong>리터럴 타입 추론</strong>:<ul>
<li>기본적으로 TypeScript는 값을 더 일반적인 타입으로 추론합니다.</li>
<li><code>as const</code>를 사용하면 값을 리터럴 타입으로 추론하도록 강제합니다.</li>
</ul>
</li>
<li><strong>읽기 전용(<code>readonly</code>)로 설정</strong>:<ul>
<li><code>as const</code>를 사용하면 객체나 배열의 모든 속성을 읽기 전용(<code>readonly</code>)으로 설정합니다.</li>
</ul>
</li>
</ol>
<hr>
<h3>2. <strong>예제</strong></h3>
<h4>a) 기본 값 추론과의 차이</h4>
<pre><code class="language-typescript">const value = &quot;hello&quot;; // TypeScript는 value를 string 타입으로 추론
const literalValue = &quot;hello&quot; as const; // TypeScript는 value를 &quot;hello&quot; 리터럴 타입으로 추론</code></pre>
<ul>
<li><code>const value</code>는 <code>&quot;hello&quot;</code>를 문자열 타입 <code>string</code>으로 추론합니다.</li>
<li><code>const literalValue = &quot;hello&quot; as const</code>는 <code>&quot;hello&quot;</code> 리터럴 타입으로 좁힙니다.</li>
</ul>
<h4>b) 객체에서의 사용</h4>
<pre><code class="language-typescript">const obj = {
  name: &quot;Alice&quot;,
  age: 30,
}; // TypeScript는 obj를 { name: string; age: number } 타입으로 추론
<p>const objAsConst = {
name: &quot;Alice&quot;,
age: 30,
} as const; // TypeScript는 objAsConst를 { readonly name: &quot;Alice&quot;; readonly age: 30 } 타입으로 추론</code></pre></p>
<ul>
<li><code>obj</code>는 <code>name</code>과 <code>age</code>를 각각 <code>string</code>과 <code>number</code> 타입으로 추론합니다.</li>
<li><code>objAsConst</code>는 <code>as const</code> 덕분에 리터럴 타입으로 추론되며, <code>readonly</code>로 설정됩니다:<pre><code class="language-typescript">{
  readonly name: &quot;Alice&quot;;
  readonly age: 30;
}</code></pre>
</li>
</ul>
<h4>c) 배열에서의 사용</h4>
<pre><code class="language-typescript">const arr = [1, 2, 3]; // TypeScript는 arr를 number[] 타입으로 추론
const arrAsConst = [1, 2, 3] as const; // TypeScript는 arrAsConst를 readonly [1, 2, 3] 타입으로 추론</code></pre>
<ul>
<li><code>arr</code>는 배열 요소를 일반적인 <code>number[]</code>로 추론합니다.</li>
<li><code>arrAsConst</code>는 <code>[1, 2, 3]</code>을 읽기 전용으로 고정합니다:<pre><code class="language-typescript">readonly [1, 2, 3]</code></pre>
</li>
</ul>
<h4>d) 열거형 대체로 사용</h4>
<p><code>as const</code>는 TypeScript에서 <strong>열거형(enum)</strong>을 대체하거나 고정된 값 집합을 표현할 때 유용합니다.</p>
<pre><code class="language-typescript">const Colors = {
  RED: &quot;red&quot;,
  GREEN: &quot;green&quot;,
  BLUE: &quot;blue&quot;,
} as const;
<p>// 타입 추론
type Color = typeof Colors[keyof typeof Colors]; // &quot;red&quot; | &quot;green&quot; | &quot;blue&quot;</code></pre></p>
<hr>
<h3>3. <strong><code>as const</code>의 활용 사례</strong></h3>
<h4>a) TypeScript에서 상수 값 고정</h4>
<pre><code class="language-typescript">const BUTTON_TYPES = [&quot;primary&quot;, &quot;secondary&quot;, &quot;danger&quot;] as const;
<p>type ButtonType = typeof BUTTON_TYPES[number]; // &quot;primary&quot; | &quot;secondary&quot; | &quot;danger&quot;</code></pre></p>
<h4>b) 읽기 전용 데이터</h4>
<p><code>as const</code>를 사용하면 데이터를 수정하지 않도록 보장할 수 있습니다.</p>
<pre><code class="language-typescript">const config = {
  apiUrl: &quot;https://api.example.com&quot;,
  timeout: 5000,
} as const;
<p>config.apiUrl = &quot;https://another-api.com&quot;; // 오류: 읽기 전용 속성은 변경할 수 없습니다.</code></pre></p>
<hr>
<h3>4. <strong>주의사항</strong></h3>
<ul>
<li><code>as const</code>는 데이터가 변경되지 않는다고 가정할 때 사용해야 합니다.</li>
<li>값이 고정된 상수 집합을 표현할 때 매우 유용합니다.</li>
<li><code>readonly</code> 속성을 포함하므로, 수정이 필요한 경우 주의해야 합니다.</li>
</ul>
<hr>
<h3>5. <strong>결론</strong></h3>
<p><code>as const</code>는 TypeScript에서 값을 <strong>리터럴 타입으로 추론하고 읽기 전용으로 설정</strong>하는 간단하고 강력한 도구입니다. 이를 사용하면 코드의 안정성을 높이고, 타입 추론을 더욱 정밀하게 제어할 수 있습니다.</p>