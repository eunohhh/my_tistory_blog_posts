<p data-ke-size="size16">한주가 또 지나갔습니다. 이번 주는 리액트 입문 첫번째 개인과제 주차로<br />목표는 todo list 만들기 였습니다. react의 주요 기본 기능이 많이 사용되는 프로젝트 인만큼<br />잘 공부해 두면 추후의 프로젝트에도 많은 도음이 될 것이라 생각되었습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이번 주에 학습한 내들용들을 복습하다가 custom hook 의 사용이유와 사용하는 상황에 대해<br />한번 정리하고 넘어가는 것이 좋겠다고 생각하여 wil 을 작성해 봅니다</p>
<h3 data-ke-size="size23">커스텀 훅을 사용하는 이유</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>코드 재사용성</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>동일한 로직을 여러 컴포넌트에서 사용할 때, 커스텀 훅을 만들어서 로직을 재사용할 수 있습니다. 이를 통해 코드 중복을 줄이고 유지보수성을 높일 수 있습니다.</li>
</ul>
</li>
<li><b>로직 분리</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>UI 로직과 비즈니스 로직을 분리하여 컴포넌트를 더욱 간결하고 이해하기 쉽게 만듭니다. 컴포넌트는 UI에 집중하고, 커스텀 훅은 상태 관리나 비즈니스 로직을 담당합니다.</li>
</ul>
</li>
<li><b>가독성 향상</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>복잡한 로직을 커스텀 훅으로 분리하여 컴포넌트 내부의 코드가 간결해지고 가독성이 향상됩니다. 훅 이름만으로도 어떤 기능을 수행하는지 쉽게 알 수 있습니다.</li>
</ul>
</li>
<li><b>추상화</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>커스텀 훅을 사용하면 특정 기능을 추상화하여 구현 세부 사항을 숨길 수 있습니다. 이는 코드의 모듈화를 돕고, 다른 개발자들이 훅의 내부 구현을 신경 쓰지 않고 사용할 수 있게 합니다.</li>
</ul>
</li>
</ol>
<h3 data-ke-size="size23">커스텀 훅을 사용하는 주요 상황</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>데이터 페칭</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>API 호출과 같은 데이터 페칭 로직을 커스텀 훅으로 분리하여 사용합니다. 예를 들어, 데이터를 가져오는 <code>useFetch</code> 훅을 만들어 사용할 수 있습니다.</li>
</ul>
<pre class="javascript"><code>import { useState, useEffect } from 'react';
<p>const useFetch = (url) =&gt; {
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);</p>
<p>useEffect(() =&gt; {
const fetchData = async () =&gt; {
try {
const response = await fetch(url);
const result = await response.json();
setData(result);
} catch (error) {
setError(error);
} finally {
setLoading(false);
}
};</p>
<pre><code>fetchData();
</code></pre>
<p>}, [url]);</p>
<p>return { data, loading, error };
};</p>
<p>export default useFetch;</code></pre></p>
</li>
<li><b>폼 핸들링</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>입력 폼의 상태 관리와 유효성 검사 로직을 커스텀 훅으로 분리합니다. 예를 들어, <code>useForm</code> 훅을 만들어 사용할 수 있습니다.</li>
</ul>
<pre class="routeros"><code>import { useState } from 'react';
<p>const useForm = (initialValues) =&gt; {
const [values, setValues] = useState(initialValues);</p>
<p>const handleChange = (event) =&gt; {
const { name, value } = event.target;
setValues({
...values,
[name]: value,
});
};</p>
<p>return { values, handleChange };
};</p>
<p>export default useForm;</code></pre></p>
</li>
<li><b>공통 상태 관리</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>여러 컴포넌트에서 공유하는 상태 관리 로직을 커스텀 훅으로 분리합니다. 예를 들어, 모달의 열림/닫힘 상태를 관리하는 <code>useModal</code> 훅을 만들어 사용할 수 있습니다.</li>
</ul>
<pre class="javascript"><code>import { useState } from 'react';
<p>const useModal = () =&gt; {
const [isOpen, setIsOpen] = useState(false);</p>
<p>const openModal = () =&gt; setIsOpen(true);
const closeModal = () =&gt; setIsOpen(false);</p>
<p>return { isOpen, openModal, closeModal };
};</p>
<p>export default useModal;</code></pre></p>
</li>
<li><b>애니메이션 및 이벤트 핸들링</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>스크롤, 윈도우 크기 변경 등의 이벤트 핸들링 로직을 커스텀 훅으로 분리합니다. 예를 들어, 윈도우 크기를 추적하는 <code>useWindowSize</code> 훅을 만들어 사용할 수 있습니다.</li>
</ul>
<pre class="javascript"><code>import { useState, useEffect } from 'react';
<p>const useWindowSize = () =&gt; {
const [windowSize, setWindowSize] = useState({
width: window.innerWidth,
height: window.innerHeight,
});</p>
<p>useEffect(() =&gt; {
const handleResize = () =&gt; {
setWindowSize({
width: window.innerWidth,
height: window.innerHeight,
});
};</p>
<pre><code>window.addEventListener('resize', handleResize);
return () =&amp;gt; window.removeEventListener('resize', handleResize);
</code></pre>
<p>}, []);</p>
<p>return windowSize;
};</p>
<p>export default useWindowSize;</code></pre></p>
</li>
</ol>
<h3 data-ke-size="size23">결론</h3>
<p data-ke-size="size16">커스텀 훅은 코드 재사용성을 높이고, 로직을 분리하여 컴포넌트를 간결하게 만들며, 가독성과 유지보수성을 향상시킵니다. 데이터 페칭, 폼 핸들링, 공통 상태 관리, 이벤트 핸들링 등 다양한 상황에서 커스텀 훅을 활용할 수 있습니다.</p>