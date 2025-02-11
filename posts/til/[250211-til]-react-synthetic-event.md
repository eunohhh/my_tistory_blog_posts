<h3 data-ke-size="size23"><b>React의 Synthetic Event란?</b></h3>
<p data-ke-size="size16"><b>Synthetic Event(합성 이벤트)</b>는 <b>React가 브라우저의 기본 이벤트를 감싸서 제공하는 래퍼(wrapper) 객체</b>입니다.<br />즉, <b>브라우저 이벤트를 추상화한 React만의 이벤트 시스템</b>입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">React에서 이벤트 핸들러를 사용할 때 <code>onClick</code>, <code>onChange</code> 같은 속성을 JSX에서 작성하면, 내부적으로 Synthetic Event가 생성되어 브라우저의 native event를 감싸게 됩니다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>1. Synthetic Event가 필요한 이유</b></h2>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">✅ <b>브라우저 간 호환성 유지</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>React는 모든 이벤트를 자체적으로 관리하므로, 브라우저마다 이벤트 동작이 다르게 구현되는 문제를 해결할 수 있습니다.</li>
</ul>
<p data-ke-size="size16">✅ <b>성능 최적화</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이벤트 리스너를 개별 DOM 요소에 붙이는 것이 아니라, <b>이벤트 위임(Event Delegation)</b>을 활용하여 루트(root) 요소에서 한 번만 관리하여 성능을 향상시킵니다.</li>
</ul>
<p data-ke-size="size16">✅ <b>일관된 이벤트 인터페이스 제공</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>브라우저마다 다르게 동작하는 native event를 React에서 일관되게 처리할 수 있도록 통일된 API를 제공합니다.</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>2. Synthetic Event 사용 예제</b></h2>
<pre class="javascript"><code>import React from "react";
<p>function App() {
const handleClick = (event) =&gt; {
console.log(event); // SyntheticBaseEvent 객체 출력
console.log(event.nativeEvent); // 브라우저의 native event 객체 출력
console.log(event.target); // 클릭된 요소
console.log(event.currentTarget); // 이벤트 핸들러가 부착된 요소
};</p>
<p>return &lt;button onClick={handleClick}&gt;Click Me&lt;/button&gt;;
}</p>
<p>export default App;</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>event</code>는 <b>Synthetic Event 객체</b>이며, <code>event.nativeEvent</code>를 통해 원래 브라우저 이벤트 객체에 접근할 수 있습니다.</li>
<li><code>event.target</code>: 이벤트가 발생한 실제 요소.</li>
<li><code>event.currentTarget</code>: 이벤트 핸들러가 부착된 요소.</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>3. Synthetic Event의 특징</b></h2>
<h3 data-ke-size="size23"><b>1) 이벤트 풀링(Event Pooling)</b></h3>
<p data-ke-size="size16">Synthetic Event는 성능 최적화를 위해 이벤트 객체를 <b>재사용(Pooling)</b>합니다.<br />즉, 이벤트가 끝나면 초기화되어 속성 값을 더 이상 읽을 수 없습니다.</p>
<h4 data-ke-size="size20"><b>예제: 이벤트 객체가 초기화되는 경우</b></h4>
<pre class="javascript"><code>function App() {
  const handleClick = (event) =&gt; {
    console.log(event.type); // "click"
    setTimeout(() =&gt; {
      console.log(event.type); // 여기서는 이미 초기화되어 "null"이 됨
    }, 1000);
  };
<p>return &lt;button onClick={handleClick}&gt;Click&lt;/button&gt;;
}</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>setTimeout</code> 내에서 <code>event.type</code>을 출력하려고 하면 <b>"null"</b>이 되어버립니다.</li>
<li>이는 Synthetic Event가 <b>재사용되면서 초기화</b>되었기 때문입니다.</li>
</ul>
<h4 data-ke-size="size20"><b>해결 방법</b></h4>
<p data-ke-size="size16">React에서는 이벤트를 비동기적으로 사용할 때, <b>event.persist()</b> 메서드를 호출하여 이벤트 객체를 유지할 수 있습니다.</p>
<pre class="javascript"><code>function App() {
  const handleClick = (event) =&gt; {
    event.persist(); // 이벤트 풀링을 방지하여 이벤트 객체 유지
    setTimeout(() =&gt; {
      console.log(event.type); // "click"
    }, 1000);
  };
<p>return &lt;button onClick={handleClick}&gt;Click&lt;/button&gt;;
}</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>event.persist()</code>를 호출하면, 해당 이벤트 객체가 풀링되지 않고 메모리에 유지됩니다.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>2) 이벤트 위임(Event Delegation)</b></h3>
<p data-ke-size="size16">React의 Synthetic Event는 <b>이벤트를 개별 DOM 요소가 아닌, 최상위(root) 요소에서 한 번만 관리</b>하는 방식으로 동작합니다.<br />이 방식은 DOM 요소가 많아질 때 <b>메모리 사용량을 줄이고 성능을 향상</b>시키는 효과가 있습니다.</p>
<h4 data-ke-size="size20"><b>예제: React의 이벤트 위임</b></h4>
<pre class="javascript"><code>function List() {
  const handleClick = (event) =&gt; {
    console.log("Clicked:", event.target.innerText);
  };
<p>return (
&lt;ul onClick={handleClick}&gt;
&lt;li&gt;Item 1&lt;/li&gt;
&lt;li&gt;Item 2&lt;/li&gt;
&lt;li&gt;Item 3&lt;/li&gt;
&lt;/ul&gt;
);
}</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>ul</code> 요소에 <code>onClick</code> 이벤트를 추가했지만, 개별 <code>li</code> 요소를 클릭해도 이벤트가 정상적으로 실행됨.</li>
<li>React는 모든 이벤트를 <code>document</code> 또는 <code>root</code>에서 한 번만 관리하는 방식으로 <b>이벤트 위임</b>을 구현.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>3) Native Event와의 차이점</b></h3>
<table data-ke-align="alignLeft" data-ke-style="style4">
<thead>
<tr>
<th>&nbsp;</th>
<th><b>Synthetic Event</b></th>
<th><b>Native Event</b></th>
</tr>
</thead>
<tbody>
<tr>
<td><b>관리 주체</b></td>
<td>React에서 감싸서 제공</td>
<td>브라우저가 직접 제공</td>
</tr>
<tr>
<td><b>이벤트 풀링</b></td>
<td>기본적으로 활성화됨 (<code>event.persist()</code> 필요)</td>
<td>풀링 없음</td>
</tr>
<tr>
<td><b>이벤트 위임</b></td>
<td>자동으로 최상위에서 관리</td>
<td>직접 구현 필요</td>
</tr>
<tr>
<td><b>호환성</b></td>
<td>브라우저 간 일관된 동작 제공</td>
<td>브라우저마다 차이 가능</td>
</tr>
</tbody>
</table>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>4. Synthetic Event가 아닌 Native Event를 써야 하는 경우</b></h2>
<p data-ke-size="size16">Synthetic Event는 성능 최적화를 위해 설계되었지만, 특정한 상황에서는 브라우저의 Native Event를 직접 사용하는 것이 필요할 수도 있습니다.</p>
<h3 data-ke-size="size23"><b>1) <code>useEffect</code>에서 <code>addEventListener</code>를 사용할 때</b></h3>
<pre class="javascript"><code>useEffect(() =&gt; {
  const handleScroll = (event) =&gt; {
    console.log("스크롤 중", event);
  };
<p>window.addEventListener(&quot;scroll&quot;, handleScroll);</p>
<p>return () =&gt; {
window.removeEventListener(&quot;scroll&quot;, handleScroll);
};
}, []);</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>React의 Synthetic Event는 <b>DOM 요소에서 발생하는 이벤트에만 적용</b>되므로, <code>window</code>나 <code>document</code> 이벤트에는 적용되지 않습니다.</li>
<li>이 경우, <code>addEventListener</code>를 사용하여 <b>Native Event 리스너</b>를 등록해야 합니다.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>2) 이벤트 성능을 극대화해야 할 때</b></h3>
<p data-ke-size="size16">Synthetic Event는 React 내부에서 여러 최적화가 이루어지지만,<br /><b>매우 빠른 응답 속도가 필요한 경우 (예: 마우스 드래그, 고속 키 입력 감지 등)</b><br />Native Event를 직접 사용하는 것이 성능적으로 유리할 수도 있습니다.</p>
<pre class="coffeescript"><code>document.addEventListener("mousemove", (event) =&gt; {
  console.log(event.clientX, event.clientY);
});</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>5. 결론</b></h2>
<h3 data-ke-size="size23">✅ <b>Synthetic Event의 핵심 요약</b></h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>React가 브라우저 이벤트를 감싸서 제공하는 래퍼 객체</b></li>
<li>브라우저 간 <b>이벤트 동작을 통일</b>하고, <b>성능 최적화</b>를 위해 활용</li>
<li><b>이벤트 풀링(Event Pooling)이 적용됨</b> &rarr; <code>event.persist()</code>를 호출하면 유지 가능</li>
<li><b>이벤트 위임(Event Delegation) 방식</b>으로 동작하여 <b>메모리 효율이 높음</b></li>
<li>특정 경우 (예: <code>window</code> 이벤트, 성능 극대화 필요)에는 <b>Native Event를 직접 사용</b>하는 것이 유리</li>
</ol>