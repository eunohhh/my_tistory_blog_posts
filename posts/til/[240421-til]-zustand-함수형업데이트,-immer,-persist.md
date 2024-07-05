<h2 data-ke-size="size26">함수형 업데이트</h2>
<p data-ke-size="size16">Zustand의 set 함수에서 상태를 업데이트할 때, 두 가지 방식 모두 사용할 수 있습니다:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>단순한 상태 업데이트</b>:이 방식은 상태를 직접적으로 업데이트합니다. <code>set</code> 함수에 객체를 전달하면 Zustand는 해당 객체를 기존 상태에 병합(merge)합니다.</li>
<li><code class="language-javascript">setUser: (user) =&gt; set({ user }),
setLoggedIn: (isLoggedIn) =&gt; set({ isLoggedIn }),</code></li>
<li><b>함수형 상태 업데이트</b>:이 방식은 함수형 업데이트를 사용하여 상태를 업데이트합니다. 이 패턴은 주로 이전 상태에 의존하는 상태 업데이트가 필요할 때 사용됩니다. 예를 들어, 상태의 특정 부분을 변경할 때 이전 상태를 참조해야 할 경우에 유용합니다.</li>
<li><code class="language-javascript">setUser: (user) =&gt; set(() =&gt; ({ user })),
setLoggedIn: (isLoggedIn) =&gt; set(() =&gt; ({ isLoggedIn }))</code></li>
</ol>
<p data-ke-size="size16">주어진 예제에서 상태를 업데이트할 때 이전 상태를 참조할 필요가 없기 때문에, 두 가지 방식 모두 유효합니다. 따라서 두 가지 방식 중 어느 것을 사용해도 문제가 없습니다. 주어진 경우에는 함수형 업데이트가 불필요하므로 단순한 상태 업데이트 방식을 사용해도 괜찮습니다.</p>
<p data-ke-size="size16">그러나 함수형 업데이트를 사용하는 것이 더 익숙하거나, 일관성을 위해 항상 함수형 업데이트를 사용하는 것을 선호할 수도 있습니다. 이 경우 다음과 같이 사용할 수 있습니다:</p>
<pre class="coffeescript"><code>export const useAuthStore = create&lt;AuthState&gt;((set) =&gt; ({
    user: null,
    isLoggedIn: false,
    setUser: (user) =&gt; set(() =&gt; ({ user })),
    setLoggedIn: (isLoggedIn) =&gt; set(() =&gt; ({ isLoggedIn })),
}));</code></pre>
<p data-ke-size="size16">이 두 가지 방식의 차이를 요약하면 다음과 같습니다:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>단순한 상태 업데이트</b>: 상태를 직접적으로 업데이트합니다. 이전 상태를 참조할 필요가 없을 때 간단하고 사용하기 쉽습니다.</li>
<li><b>함수형 상태 업데이트</b>: 이전 상태를 참조하여 상태를 업데이트합니다. 이전 상태에 의존적인 업데이트가 필요할 때 사용합니다.</li>
</ul>
<p data-ke-size="size16">두 방식 모두 사용해도 되지만, 상황에 맞게 적절히 선택하는 것이 좋습니다. 이 경우, 상태를 단순히 설정하는 것이므로 더 간단한 첫 번째 방법을 사용해도 충분합니다.</p>
<h2 data-ke-size="size26">immer &amp;&amp; persist</h2>
<p data-ke-size="size16"><code>immer</code>와 <code>zustand</code>를 함께 사용하여 상태를 불변하게 관리하고, <code>zustand-persist</code>를 사용하여 상태를 로컬 스토리지에 저장할 수 있습니다. 아래는 <code>immer</code>와 <code>zustand-persist</code>를 함께 사용하는 예제입니다.</p>
<h3 data-ke-size="size23">설치</h3>
<p data-ke-size="size16">먼저 필요한 패키지를 설치해야 합니다:</p>
<pre class="cmake"><code>npm install zustand immer zustand-persist</code></pre>
<h3 data-ke-size="size23">설정 및 사용 예제</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>스토어 설정</b></li>
</ol>
<pre class="typescript"><code>import create from 'zustand';
import { persist } from 'zustand/middleware';
import produce from 'immer';
<p>// 스토어 생성
const useStore = create(persist(
(set) =&gt; ({
count: 0,
increase: () =&gt; set((state) =&gt; produce(state, draft =&gt; { draft.count += 1; })),
decrease: () =&gt; set((state) =&gt; produce(state, draft =&gt; { draft.count -= 1; }))
}),
{
name: 'count-storage', // 로컬 스토리지 키 이름
}
));</p>
<p>export default useStore;</code></pre></p>
<ol style="list-style-type: decimal;" start="2" data-ke-list-type="decimal">
<li><b>컴포넌트에서 사용</b></li>
</ol>
<pre class="javascript"><code>import React from 'react';
import useStore from './store'; // 스토어 불러오기
<p>function Counter() {
const { count, increase, decrease } = useStore();</p>
<p>return (
&lt;div&gt;
&lt;h1&gt;Count: {count}&lt;/h1&gt;
&lt;button onClick={increase}&gt;Increase&lt;/button&gt;
&lt;button onClick={decrease}&gt;Decrease&lt;/button&gt;
&lt;/div&gt;
);
}</p>
<p>export default Counter;</code></pre></p>
<h3 data-ke-size="size23">설명</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>zustand</code>와 <code>zustand/middleware</code>에서 <code>persist</code>를 가져와 스토어를 생성합니다. <code>persist</code>는 상태를 로컬 스토리지에 저장하는 기능을 제공합니다.</li>
<li><code>immer</code>의 <code>produce</code> 함수를 사용하여 상태 변경 시 불변성을 유지합니다.</li>
<li><code>increase</code>와 <code>decrease</code> 함수는 상태를 불변으로 관리하면서 값을 증가시키고 감소시킵니다.</li>
<li><code>name</code> 옵션을 통해 로컬 스토리지에 저장될 키 이름을 지정합니다.</li>
</ul>
<p data-ke-size="size16">이 예제를 통해 <code>immer</code>와 <code>zustand</code>를 함께 사용하여 상태를 불변하게 관리하고, <code>zustand-persist</code>를 사용하여 상태를 로컬 스토리지에 저장할 수 있습니다.</p>