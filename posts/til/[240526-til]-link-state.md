<p data-ke-size="size16">오늘은 React Router를 이용해 Link 컴포넌트를 통해 라우트 이동시 Props를 전송할 수 있는지가 궁금했습니다.<br />공부해보니 역시 가능했고, 이를 위해<span>&nbsp;</span>state<span>&nbsp;</span>속성을 사용할 수 있습니다.</p>
<p style="text-align: left;" data-ke-size="size16">&nbsp;</p>
<p style="text-align: left;" data-ke-size="size16">React Router 의<span>&nbsp;</span>Link<span>&nbsp;</span>컴포넌트는<span>&nbsp;</span>state<span>&nbsp;</span>속성을 통해 데이터를 전달할 수 있으며,<br />전달된 데이터는 도착한 컴포넌트에서<span>&nbsp;</span>useLocation<span>&nbsp;</span>훅을 통해 접근할 수 있습니다.</p>
<p style="color: #333333; text-align: start;" data-ke-size="size16">&nbsp;</p>
<h3 style="color: #000000; text-align: start;" data-ke-size="size23">코드 예시</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>데이터를 전달하는<span>&nbsp;</span>Link<span>&nbsp;</span>설정:</b></li>
</ol>
<pre id="code_1716678463063" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code> // List.js
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Expend } from "../../types/d";
import Card from "../Card";
<p>const StyledSection = styled.section<code>    position: relative;     display: flex;     flex-direction: column;     justify-content: center;     align-items: center;     gap: 0.6rem;     width: 100%;     padding: 1rem 0;     height: auto;     background-color: white;     border-radius: 5px;</code>;</p>
<p>const StyledLink = styled(Link)<code>    width: 100%;</code>;</p>
<p>type ListProps = {
monthlyExpends: Expend[];
deleteExpend: (arg: string) =&gt; void;
updateExpend: (arg: Expend) =&gt; void;
};</p>
<p>function List({ monthlyExpends }: ListProps) {
return (
&lt;StyledSection&gt;
{monthlyExpends.map((expend) =&gt; (
&lt;StyledLink
key={expend.id}
to={<code>/detail/${expend.id}</code>}
state={{ expend }}
&gt;
&lt;Card expend={expend} /&gt;
&lt;/StyledLink&gt;
))}
&lt;/StyledSection&gt;
);
}</p>
<p>export default List;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>전달된 데이터를 받는 컴포넌트</b>:</li>
</ol>
<pre id="code_1716678558912" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// Detail.js
import { useLocation } from "react-router-dom";
import { Expend } from "../../types/d";
<p>function Detail() {
const location = useLocation();
const { expend } = location.state as { expend: Expend };</p>
<pre><code>return (
    &amp;lt;div&amp;gt;
        &amp;lt;h1&amp;gt;Detail Page&amp;lt;/h1&amp;gt;
        &amp;lt;p&amp;gt;ID: {expend.id}&amp;lt;/p&amp;gt;
        &amp;lt;p&amp;gt;Amount: {expend.amount}&amp;lt;/p&amp;gt;
        &amp;lt;p&amp;gt;Description: {expend.description}&amp;lt;/p&amp;gt;
    &amp;lt;/div&amp;gt;
);
</code></pre>
<p>}</p>
<p>export default Detail;</code></pre></p>
<h3 data-ke-size="size23">설명</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b><code>List</code> 컴포넌트</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>Link</code> 컴포넌트에 <code>state</code> 속성을 추가하고, 이 속성에 전달할 데이터를 설정합니다.</li>
<li>예를 들어, <code>state={{ expend }}</code>는 <code>expend</code> 객체를 <code>state</code>로 전달합니다.</li>
</ul>
</li>
<li><b><code>Detail</code> 컴포넌트</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>useLocation</code> 훅을 사용하여 현재 위치 객체를 가져옵니다.</li>
<li><code>location.state</code>를 통해 전달된 데이터를 접근할 수 있습니다.</li>
<li><code>location.state</code>는 <code>Link</code>에서 전달된 <code>state</code> 객체를 포함합니다. 타입스크립트를 사용하여 타입을 명시적으로 지정할 수 있습니다.</li>
</ul>
</li>
</ol>
<p data-ke-size="size16">이 방법을 사용하면 <code>Link</code> 컴포넌트를 통해 라우트 이동 시 데이터를 전달할 수 있으며, 도착한 컴포넌트에서 이를 받아 사용할 수 있습니다.</p>