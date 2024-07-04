<p>오늘은 과제 주차 중 가계부 props drilling 버전을 Context API 버전으로 리팩토링 해보았습니다.</p>
<p>이 과정에서 Context API에 익숙치 않아 살짝 어려움도 겪었습니다.<br>Context API 의 정확한 사용법에 대해 정리해 보려고 합니다.</p>
<p>Context API는 전역 상태를 관리하기 위한 강력한 도구입니다.<br>Context를 사용하면 prop drilling을 피하고, 여러 컴포넌트 계층에 데이터를 전달할 수 있습니다. </p>
<h3>1. Context 생성하기</h3>
<p>먼저, Context를 생성합니다. 일반적으로 Context를 정의하는 파일을 따로 만들어 관리합니다.</p>
<pre><code class="language-jsx">// context.js
import React from &#39;react&#39;;
<p>const MyContext = React.createContext();</p>
<p>export default MyContext;</code></pre></p>
<h3>2. Provider 설정하기</h3>
<p>Context Provider를 사용하여 Context 값을 설정하고 하위 컴포넌트에 전달합니다.<br>Provider는 트리의 하위 컴포넌트들이 해당 Context를 구독할 수 있도록 해줍니다.</p>
<pre><code class="language-jsx">// App.js
import React, { useState } from &#39;react&#39;;
import MyContext from &#39;./context&#39;;
<p>function App() {
const [value, setValue] = useState('Hello, Context!');</p>
<p>return (
&lt;MyContext.Provider value={{ value, setValue }}&gt;
&lt;ChildComponent /&gt;
&lt;/MyContext.Provider&gt;
);
}</p>
<p>export default App;</code></pre></p>
<h3>3. useContext 훅 사용하기</h3>
<p>하위 컴포넌트에서 Context의 값을 소비할 수 있습니다. 이를 위해 <code>useContext</code> 훅을 사용합니다.<br>(<code>Context.Consumer</code>도 사용할 수 있지만, <code>useContext</code> 훅이 더 간편하고 좋습니다.)</p>
<pre><code class="language-jsx">// ChildComponent.js
import React, { useContext } from &#39;react&#39;;
import MyContext from &#39;./context&#39;;
<p>function ChildComponent() {
const { value, setValue } = useContext(MyContext);</p>
<p>return (
&lt;div&gt;
&lt;p&gt;{value}&lt;/p&gt;
&lt;button onClick={() =&gt; setValue('New Value!')}&gt;Change Value&lt;/button&gt;
&lt;/div&gt;
);
}</p>
<p>export default ChildComponent;</code></pre></p>
<h3>전체 코드 예시</h3>
<h4>context.js</h4>
<pre><code class="language-jsx">import React from &#39;react&#39;;
<p>const MyContext = React.createContext();</p>
<p>export default MyContext;</code></pre></p>
<h4>App.js</h4>
<pre><code class="language-jsx">import React, { useState } from &#39;react&#39;;
import MyContext from &#39;./context&#39;;
import ChildComponent from &#39;./ChildComponent&#39;;
<p>function App() {
const [value, setValue] = useState('Hello, Context!');</p>
<p>return (
&lt;MyContext.Provider value={{ value, setValue }}&gt;
&lt;ChildComponent /&gt;
&lt;/MyContext.Provider&gt;
);
}</p>
<p>export default App;</code></pre></p>
<h4>ChildComponent.js</h4>
<pre><code class="language-jsx">import React, { useContext } from &#39;react&#39;;
import MyContext from &#39;./context&#39;;
<p>function ChildComponent() {
const { value, setValue } = useContext(MyContext);</p>
<p>return (
&lt;div&gt;
&lt;p&gt;{value}&lt;/p&gt;
&lt;button onClick={() =&gt; setValue('New Value!')}&gt;Change Value&lt;/button&gt;
&lt;/div&gt;
);
}</p>
<p>export default ChildComponent;</code></pre></p>
<h3>요약</h3>
<ol>
<li><strong>Context 생성</strong>: <code>React.createContext()</code>를 사용하여 Context를 생성합니다.</li>
<li><strong>Provider 설정</strong>: <code>Context.Provider</code>를 사용하여 하위 컴포넌트에 값을 제공합니다.</li>
<li><strong>Consumer 사용</strong>: <code>useContext</code> 훅이나 <code>Context.Consumer</code>를 사용하여 Context의 값을 사용합니다.</li>
</ol>
<p><code>Context.Consumer</code>는 리액트의 Context API를 사용할 때 Context의 값을 접근하는 또 다른 방법입니다. <code>useContext</code> 훅을 사용하지 않는 경우, 클래스형 컴포넌트에서 주로 사용되거나, 함수형 컴포넌트에서도 사용될 수 있습니다.</p>
<h3>추가 : <code>Context.Consumer</code>의 사용법</h3>
<p><code>Context.Consumer</code>는 함수 컴포넌트를 통해 값을 접근하며, 자식 컴포넌트에 함수 형태의 자식을 전달합니다.<br>이 함수는 Context의 현재 값을 인수로 받아 그 값을 이용해 JSX를 반환합니다.</p>
<h3>예제</h3>
<h4>context.js</h4>
<pre><code class="language-jsx">import React from &#39;react&#39;;
<p>const MyContext = React.createContext();</p>
<p>export default MyContext;</code></pre></p>
<h4>App.js</h4>
<pre><code class="language-jsx">import React, { useState } from &#39;react&#39;;
import MyContext from &#39;./context&#39;;
import ChildComponent from &#39;./ChildComponent&#39;;
<p>function App() {
const [value, setValue] = useState('Hello, Context!');</p>
<p>return (
&lt;MyContext.Provider value={{ value, setValue }}&gt;
&lt;ChildComponent /&gt;
&lt;/MyContext.Provider&gt;
);
}</p>
<p>export default App;</code></pre></p>
<h4>ChildComponent.js</h4>
<pre><code class="language-jsx">import React from &#39;react&#39;;
import MyContext from &#39;./context&#39;;
<p>function ChildComponent() {
return (
&lt;MyContext.Consumer&gt;
{({ value, setValue }) =&gt; (
&lt;div&gt;
&lt;p&gt;{value}&lt;/p&gt;
&lt;button onClick={() =&gt; setValue('New Value!')}&gt;Change Value&lt;/button&gt;
&lt;/div&gt;
)}
&lt;/MyContext.Consumer&gt;
);
}</p>
<p>export default ChildComponent;</code></pre></p>
<h3>주요 특징</h3>
<ol>
<li><strong>함수형 자식</strong>: <code>Consumer</code>는 반드시 함수형 자식을 받아야 하며 이 함수는 Context의 값을 인수로 받습니다.</li>
<li><strong>클래스형 컴포넌트 호환</strong>: <code>useContext</code> 훅과 달리 클래스형 컴포넌트에서도 사용할 수 있습니다.</li>
</ol>
<h3>요약</h3>
<ul>
<li><code>Context.Consumer</code>를 사용하면 함수형 자식을 통해 Context 값을 접근할 수 있습니다.</li>
<li>함수형 컴포넌트뿐만 아니라 클래스형 컴포넌트에서도 유용하게 사용할 수 있습니다.</li>
<li><code>useContext</code> 훅이 더 간편하고 많이 사용되지만, <code>Context.Consumer</code>는 유연성과 가독성을 제공하는 경우가 있습니다.</li>
</ul>