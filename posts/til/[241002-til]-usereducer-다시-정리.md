<p data-ke-size="size16"><b><code>useReducer</code></b>는 React에서 상태 관리를 위해 사용하는 훅 중 하나로, <b>복잡한 상태 로직</b>을 보다 체계적으로 관리하고 싶을 때 유용합니다. 특히 상태 변경 로직이 여러 단계로 나누어져 있거나, 상태 업데이트가 명확한 액션에 의해 이루어져야 할 때 사용됩니다. <b>Redux</b>의 상태 관리 방식과 유사하게 <b>리듀서 패턴</b>을 사용하여 상태를 업데이트합니다.</p>
<h3 data-ke-size="size23"><b><code>useReducer</code>의 기본 구조</b></h3>
<p data-ke-size="size16"><code>useReducer</code>는 세 가지 요소를 인자로 받습니다:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>리듀서 함수</b>: 현재 상태와 액션을 받아서 새로운 상태를 반환하는 함수입니다.</li>
<li><b>초기 상태</b>: 상태의 초기 값입니다.</li>
<li><b>초기화 함수 (선택적)</b>: 초기 상태를 더 복잡한 방식으로 설정해야 할 경우에 사용할 수 있습니다.</li>
</ol>
<p data-ke-size="size16"><code>useReducer</code>는 <code>dispatch</code> 함수를 반환하며, 이 <code>dispatch</code> 함수는 상태를 변경하는 액션을 트리거할 때 사용됩니다.</p>
<h3 data-ke-size="size23"><b><code>useReducer</code> 기본 사용법</b></h3>
<pre class="typescript" data-ke-language="typescript"><code>import { useReducer } from 'react';
<p>// 1. 리듀서 함수 정의 (현재 상태와 액션을 받아 새로운 상태를 반환)
const reducer = (state, action) =&gt; {
switch (action.type) {
case 'increment':
return { count: state.count + 1 };
case 'decrement':
return { count: state.count - 1 };
default:
return state;
}
};</p>
<p>const Counter = () =&gt; {
// 2. useReducer 훅 사용 (리듀서 함수와 초기 상태를 전달)
const [state, dispatch] = useReducer(reducer, { count: 0 });</p>
<p>return (
&lt;div&gt;
&lt;p&gt;Count: {state.count}&lt;/p&gt;
{/* 3. dispatch를 통해 상태 업데이트 */}
&lt;button onClick={() =&gt; dispatch({ type: 'increment' })}&gt;Increment&lt;/button&gt;
&lt;button onClick={() =&gt; dispatch({ type: 'decrement' })}&gt;Decrement&lt;/button&gt;
&lt;/div&gt;
);
};</code></pre></p>
<h3 data-ke-size="size23"><b>구성 요소 설명</b>:</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>리듀서 함수</b>: <code>reducer(state, action)</code>는 상태 변경의 로직을 담고 있습니다. 주로 <b>switch 문</b>을 사용해 액션의 타입에 따라 상태를 어떻게 업데이트할지를 정의합니다.</li>
<li><b>초기 상태</b>: <code>useReducer(reducer, { count: 0 })</code>에서 <code>{ count: 0 }</code>는 초기 상태입니다.</li>
<li><b>dispatch 함수</b>: <code>dispatch({ type: 'increment' })</code>는 리듀서 함수에 정의된 액션을 실행하는 함수로, 상태 업데이트를 트리거합니다.</li>
</ol>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b><code>useReducer</code>를 사용하는 경우</b></h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>상태가 복잡한 경우</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>useState</code>로는 관리하기 어려울 정도로 <b>복잡한 상태</b>를 다뤄야 할 때 <code>useReducer</code>가 적합합니다. 예를 들어, 상태가 여러 속성을 포함하고 있거나, 상태 업데이트가 복잡한 규칙에 따라 이루어져야 하는 경우입니다.</li>
<li>여러 개의 상태 변수를 관리해야 하거나, 상태 전환이 명확한 액션에 의해 결정될 때도 유용합니다.</li>
</ul>
<b>예시</b>: 여러 필드를 가진 폼의 상태 관리</li>
</ol>
<pre id="code_1727857719654" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>const formReducer = (state, action) =&gt; {
     switch (action.type) {
       case 'update_name':
         return { ...state, name: action.payload };
       case 'update_email':
         return { ...state, email: action.payload };
       default:
         return state;
     }
   };
<p>const Form = () =&gt; {
const [state, dispatch] = useReducer(formReducer, { name: '', email: '' });</p>
<pre><code> return (
   &amp;lt;form&amp;gt;
     &amp;lt;input
       type=&quot;text&quot;
       value={state.name}
       onChange={(e) =&amp;gt; dispatch({ type: 'update_name', payload: e.target.value })}
     /&amp;gt;
     &amp;lt;input
       type=&quot;email&quot;
       value={state.email}
       onChange={(e) =&amp;gt; dispatch({ type: 'update_email', payload: e.target.value })}
     /&amp;gt;
   &amp;lt;/form&amp;gt;
 );
</code></pre>
<p>};</code></pre></p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>상태 업데이트 로직이 여러 액션을 처리해야 할 때</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>상태를 업데이트하는 <b>액션의 종류가 많거나 복잡한 경우</b>, <code>useReducer</code>를 사용하면 각각의 액션을 명확하게 정의하고 상태 전환을 쉽게 관리할 수 있습니다.</li>
<li>액션의 타입을 명시적으로 구분함으로써 코드 가독성도 높아집니다.</li>
</ul>
</li>
<li><b>상태 전환 로직이 복잡한 경우</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>상태가 단순히 증가, 감소하는 것이 아니라 특정 조건이나 로직에 의해 변경되는 경우에도 <code>useReducer</code>가 도움이 됩니다. 예를 들어, 상태가 여러 단계로 전환되거나 조건에 따라 변화해야 한다면 <code>useReducer</code>로 상태 전환을 명확하게 정의할 수 있습니다. 복잡한 로직이 포함된 상태 관리는 <code>useState</code>로 처리하면 코드가 분산될 수 있는데, <code>useReducer</code>는 이런 복잡성을 중앙에서 관리하게 해줍니다.</li>
</ul>
</li>
</ol>
<h3 data-ke-size="size23"><b>복잡한 상태 전환 로직 예시</b>:</h3>
<pre class="typescript" data-ke-language="typescript"><code>const reducer = (state, action) =&gt; {
  switch (action.type) {
    case 'start_loading':
      return { ...state, loading: true, error: null };
    case 'success':
      return { ...state, loading: false, data: action.payload };
    case 'error':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
<p>const DataFetcher = () =&gt; {
const [state, dispatch] = useReducer(reducer, {
loading: false,
data: null,
error: null,
});</p>
<p>const fetchData = async () =&gt; {
dispatch({ type: 'start_loading' });
try {
const response = await fetch('/api/data');
const result = await response.json();
dispatch({ type: 'success', payload: result });
} catch (error) {
dispatch({ type: 'error', payload: error.message });
}
};</p>
<p>return (
&lt;div&gt;
{state.loading ? &lt;p&gt;Loading...&lt;/p&gt; : &lt;p&gt;Data: {JSON.stringify(state.data)}&lt;/p&gt;}
{state.error &amp;&amp; &lt;p&gt;Error: {state.error}&lt;/p&gt;}
&lt;button onClick={fetchData}&gt;Fetch Data&lt;/button&gt;
&lt;/div&gt;
);
};</code></pre></p>
<h3 data-ke-size="size23"><b>상황별로 <code>useReducer</code>를 사용하는 이유</b>:</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>복잡한 상태 업데이트 관리</b>: 여러 상태가 복잡한 전환 로직에 따라 업데이트되어야 할 때 <code>useReducer</code>를 사용하면 액션 타입에 따라 각기 다른 상태 전환을 관리하기 쉽습니다. 위 예시에서, 데이터 로딩, 성공, 에러 등의 상태를 하나의 리듀서 함수에서 관리하므로 코드가 간결해지고 유지보수가 쉬워집니다.</li>
<li><b>상태와 액션의 명확한 매핑</b>: 리듀서 함수는 상태와 액션의 관계를 명확히 보여줍니다. 상태 변경의 로직이 단일 함수 내에서 처리되므로, 상태 전환 로직이 분산되지 않고 한 곳에 모여 있어 디버깅과 테스트가 용이합니다.</li>
<li><b>상태 전환에 대한 예측 가능성</b>: <code>useReducer</code>는 상태 전환이 항상 <b>액션에 의해 명시적으로 발생</b>하도록 보장합니다. 이를 통해 상태 업데이트가 예측 가능해지고, 상태 변화의 흐름을 쉽게 추적할 수 있습니다.</li>
<li><b>초기 상태 설정이 복잡한 경우</b>: <code>useReducer</code>는 복잡한 초기 상태 설정이 필요할 때도 유용합니다. <code>useReducer</code>의 세 번째 인자로 <b>초기화 함수</b>를 제공하면, 초기 상태를 좀 더 복잡한 방식으로 계산하거나 설정할 수 있습니다.</li>
</ol>
<h3 data-ke-size="size23"><b><code>useState</code>와의 차이점</b>:</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>useState</code>는 <b>간단한 상태 관리</b>에 적합합니다. 단일 상태 값이나 간단한 상태 로직을 다룰 때 주로 사용됩니다.</li>
<li><code>useReducer</code>는 <b>복잡한 상태 관리</b>와 여러 액션에 의해 상태가 전환되는 경우에 적합합니다. 여러 상태가 서로 의존하거나, 액션의 타입에 따라 상태가 다르게 변화해야 할 때 사용됩니다.</li>
</ul>
<h3 data-ke-size="size23"><b>언제 <code>useReducer</code>를 사용해야 하는가?</b>:</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>상태 전환 로직이 복잡할 때</b>: 여러 개의 상태가 상호 연관되어 있고, 상태를 변경하는 액션이 복잡하거나 다양할 때.</li>
<li><b>Redux와 유사한 상태 관리 패턴이 필요할 때</b>: 컴포넌트 수준에서 Redux와 비슷한 상태 관리 패턴을 구현하고 싶을 때 <code>useReducer</code>가 유용합니다.</li>
<li><b>복잡한 초기 상태 설정이 필요할 때</b>: <code>useReducer</code>는 초기 상태를 복잡하게 설정해야 하거나 상태 변경 로직이 많을 때 적합합니다.</li>
</ul>
<h3 data-ke-size="size23"><b>결론</b>:</h3>
<p data-ke-size="size16"><code>useReducer</code>는 복잡한 상태 전환을 다루는 상황에서 매우 유용한 도구입니다. 다양한 액션을 처리하고, 상태 전환이 복잡한 경우, 또는 Redux와 같은 패턴으로 상태를 관리하고 싶을 때 <code>useReducer</code>를 사용하는 것이 적절합니다. 간단한 상태 관리는 <code>useState</code>로 충분하지만, 상태 전환 로직이 많거나 명확한 상태 관리가 필요한 경우 <code>useReducer</code>를 사용하는 것이 좋습니다.</p>