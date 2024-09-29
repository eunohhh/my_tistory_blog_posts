<p data-ke-size="size16"><code>Suspense</code> 컴포넌트를 <code>Provider</code> 또는 <code>Layout</code>처럼 분리하여 재사용하는 법을 알아보았습니다.<br />이렇게 하면 코드를 더 깔끔하게 유지하고, 여러 곳에서 <code>Suspense</code> 기능을 쉽게 사용할 수 있을 것 같습니다..</p>
<h3 data-ke-size="size23">Step-by-Step Guide</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>SuspenseProvider 컴포넌트 생성</b>:<br /><code>Suspense</code> 컴포넌트를 감싸는 <code>SuspenseProvider</code> 컴포넌트를 생성하여, <code>fallback</code> UI를 중앙에서 관리할 수 있습니다.</li>
<li><b>App.js에서 SuspenseProvider 사용</b>:<br /><code>SuspenseProvider</code> 컴포넌트를 <code>App</code> 컴포넌트에서 사용하여, 하위 컴포넌트들이 지연 로딩되는 동안 보여줄 UI를 지정할 수 있습니다.</li>
</ol>
<h3 data-ke-size="size23">예제 코드</h3>
<h4 data-ke-size="size20">SuspenseProvider.js</h4>
<pre class="javascript"><code>import React, { Suspense } from 'react';
<p>const SuspenseProvider = ({ children }) =&gt; {
return (
&lt;Suspense fallback={&lt;div&gt;Loading...&lt;/div&gt;}&gt;
{children}
&lt;/Suspense&gt;
);
};</p>
<p>export default SuspenseProvider;</code></pre></p>
<h4 data-ke-size="size20">ExternalComponent.js</h4>
<pre class="javascript"><code>import React, { lazy } from 'react';
<p>const ExternalComponent = lazy(() =&gt; {
return new Promise((resolve) =&gt; {
const script = document.createElement('script');
script.src = 'https://example.com/external-script.js';
script.async = true;
script.onload = () =&gt; {
resolve({
default: () =&gt; &lt;div&gt;External Component Loaded&lt;/div&gt;,
});
};
document.body.appendChild(script);
});
});</p>
<p>export default ExternalComponent;</code></pre></p>
<h4 data-ke-size="size20">App.js</h4>
<pre class="javascript"><code>import React from 'react';
import SuspenseProvider from './SuspenseProvider';
import ExternalComponent from './ExternalComponent';
<p>const App = () =&gt; {
return (
&lt;div&gt;
&lt;h1&gt;My React App&lt;/h1&gt;
&lt;SuspenseProvider&gt;
&lt;ExternalComponent /&gt;
&lt;/SuspenseProvider&gt;
&lt;/div&gt;
);
};</p>
<p>export default App;</code></pre></p>
<h3 data-ke-size="size23">코드 설명</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>SuspenseProvider.js</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>Suspense</code> 컴포넌트를 감싸는 <code>SuspenseProvider</code> 컴포넌트를 정의합니다.</li>
<li><code>fallback</code> 속성으로 로딩 중 표시할 UI를 지정합니다.</li>
<li><code>children</code>을 받아서 <code>Suspense</code> 컴포넌트로 감쌉니다.</li>
</ul>
</li>
<li><b>ExternalComponent.js</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>외부 스크립트를 로드하고, 스크립트가 로드된 후에 컴포넌트를 반환하는 동적 컴포넌트를 정의합니다.</li>
<li><code>lazy</code>와 <code>Promise</code>를 사용하여 스크립트를 로드하고 컴포넌트를 반환합니다.</li>
</ul>
</li>
<li><b>App.js</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>App</code> 컴포넌트에서 <code>SuspenseProvider</code>를 사용하여 하위 컴포넌트를 감쌉니다.</li>
<li><code>SuspenseProvider</code> 안에 <code>ExternalComponent</code>를 포함시킵니다.</li>
</ul>
</li>
</ol>
<h3 data-ke-size="size23">장점</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>재사용성</b>: <code>SuspenseProvider</code>를 생성함으로써, 여러 곳에서 동일한 <code>fallback</code> UI를 재사용할 수 있습니다.</li>
<li><b>중앙화된 관리</b>: 로딩 상태 UI를 중앙에서 관리할 수 있어, 코드 유지보수가 쉬워집니다.</li>
<li><b>깔끔한 코드</b>: <code>Suspense</code>와 <code>fallback</code>을 각 컴포넌트에서 정의하는 대신, 하나의 컴포넌트에서 관리함으로써 코드를 더 깔끔하게 유지할 수 있습니다.</li>
</ul>
<p data-ke-size="size16">이 접근 방식은 코드의 재사용성과 유지보수성을 높여줍니다. <code>SuspenseProvider</code>를 사용하여 다양한 컴포넌트에서 지연 로딩 상태를 쉽게 관리할 수 있습니다.</p>