<h2>액션크리에이터</h2>
<p>Redux를 활용하여 상태와 액션을 보다 효과적으로 관리하기 위해 커스텀 훅을 만들어보았습니다.<br>이 훅을 사용하면 Redux 상태와 액션을 컴포넌트에서 간편하게 사용할 수 있습니다. </p>
<p>이 훅에서 사용되는 각 액션 크리에이터 (예: <code>selectMemo</code>, <code>createMemo</code>, <code>deleteMemo</code>, <code>updateMemo</code>)는 Redux에서 일반적으로 <strong>Action Creators</strong>로 불립니다.</p>
<h3>정의:</h3>
<ul>
<li><strong>Custom Hook</strong>: 리액트 훅을 사용하여 재사용 가능한 로직을 캡슐화한 함수. <code>useMemoApp</code>은 커스텀 훅입니다.</li>
<li><strong>Action Creator</strong>: 특정 액션을 생성하여 디스패치하는 함수. 예를 들어, <code>selectMemo</code>, <code>createMemo</code>, <code>deleteMemo</code>, <code>updateMemo</code>가 여기에 해당합니다.</li>
</ul>
<h3>코드 설명:</h3>
<ul>
<li><code>useMemoApp</code> 훅은 Redux 상태와 액션을 캡슐화하여 컴포넌트에서 간편하게 사용하도록 합니다.</li>
<li><code>useSelector</code>를 사용하여 Redux 상태를 선택합니다.</li>
<li><code>useDispatch</code>를 사용하여 액션을 디스패치합니다.</li>
<li>각 액션을 생성하는 함수 (<code>selectMemo</code>, <code>createMemo</code>, <code>deleteMemo</code>, <code>updateMemo</code>)를 정의하고 반환합니다.</li>
</ul>
<h3>개선된 코드 예시:</h3>
<pre><code class="language-typescript">import { AppDispatch, RootState } from &quot;@/redux/store&quot;;
import { CREATE, DELETE, SELECT, UPDATE } from &quot;@/types/d&quot;;
import { useDispatch, useSelector } from &quot;react-redux&quot;;
<p>const useMemoApp = () =&gt; {
const dispatch = useDispatch&lt;AppDispatch&gt;();
const memos = useSelector((state: RootState) =&gt; state.memoApp.memos);
const selected = useSelector((state: RootState) =&gt; state.memoApp.selected);</p>
<pre><code>const selectMemo = (memoId: string) =&amp;gt; dispatch({ type: SELECT, payload: memoId });
const createMemo = (text: string) =&amp;gt; dispatch({ type: CREATE, payload: text });
const deleteMemo = (memoId: string) =&amp;gt; dispatch({ type: DELETE, payload: memoId });
const updateMemo = (memo: { id: string, contents: string }) =&amp;gt; dispatch({ type: UPDATE, payload: memo });

return {
    memos,
    selected,
    selectMemo,
    createMemo,
    deleteMemo,
    updateMemo,
};
</code></pre>
<p>};</p>
<p>export default useMemoApp;</code></pre></p>
<h3>개선 사항:</h3>
<ol>
<li><strong>타입 정의</strong>: <code>updateMemo</code>에서 <code>memo</code>의 타입을 명확히 지정합니다. 여기서는 <code>{ id: string, contents: string }</code> 형태로 지정했습니다.</li>
<li><strong>함수 정의</strong>: 각 함수 (<code>selectMemo</code>, <code>createMemo</code>, <code>deleteMemo</code>, <code>updateMemo</code>)를 반환하여 컴포넌트에서 사용할 수 있도록 했습니다.</li>
</ol>
<h3>사용 예시:</h3>
<pre><code class="language-typescript">import React from &#39;react&#39;;
import useMemoApp from &#39;@/hooks/useMemoApp&#39;;
<p>const MemoComponent = () =&gt; {
const { memos, selected, selectMemo, createMemo, deleteMemo, updateMemo } = useMemoApp();</p>
<pre><code>return (
    &amp;lt;div&amp;gt;
        &amp;lt;button onClick={() =&amp;gt; createMemo(&amp;quot;New Memo&amp;quot;)}&amp;gt;Add Memo&amp;lt;/button&amp;gt;
        {memos.map(memo =&amp;gt; (
            &amp;lt;div key={memo.id}&amp;gt;
                &amp;lt;p&amp;gt;{memo.contents}&amp;lt;/p&amp;gt;
                &amp;lt;button onClick={() =&amp;gt; selectMemo(memo.id)}&amp;gt;Select&amp;lt;/button&amp;gt;
                &amp;lt;button onClick={() =&amp;gt; deleteMemo(memo.id)}&amp;gt;Delete&amp;lt;/button&amp;gt;
                &amp;lt;button onClick={() =&amp;gt; updateMemo({ id: memo.id, contents: &amp;quot;Updated Content&amp;quot; })}&amp;gt;Update&amp;lt;/button&amp;gt;
            &amp;lt;/div&amp;gt;
        ))}
    &amp;lt;/div&amp;gt;
);
</code></pre>
<p>};</p>
<p>export default MemoComponent;</code></pre></p>
<p>이 예시에서는 <code>useMemoApp</code> 커스텀 훅을 사용하여 메모 관련 상태와 액션을 쉽게 사용할 수 있습니다. 각 액션 크리에이터 함수는 Redux 상태를 업데이트하는 데 사용됩니다.</p>