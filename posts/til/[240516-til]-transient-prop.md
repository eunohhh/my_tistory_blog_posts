<p data-ke-size="size16">오늘은 tsx 에서 styled-components 사용시 발생한 경고를 해결한 벙법을 정리해보겠습니다.<br />상황은 조건부로 styled-components 를 처리하려고 styled div 에 prop을 전송하는 상황입니다.</p>
<h3 data-ke-size="size23">unknown prop?</h3>
<pre class="javascript"><code>import styled from "styled-components";
import { ToDo } from "../types/d";
<p>// 아래와 같이 적용하면,
// it looks like an unknown prop &quot;one&quot; is being sent through to the DOM, which will likely trigger a React console error.
// 위와 같은 에러가 발생합니다!
const StyledDiv = styled.div&lt;{ one: ToDo }&gt;<code>    background-color: ${props =&amp;gt; props.one.completed ? 'green' : 'red'};     width: 600px;     display: flex;     justify-content: center;     align-items: center;     margin: 0 auto;</code>;</p>
<p>const About = ({ data }: { data: ToDo[] | null }) =&gt; {
return (
&lt;section className=&quot;wrapper&quot;&gt;
{data &amp;&amp; data.length &gt; 0 ? (
&lt;StyledDiv one={data[0]}&gt;얌마 어바웃이다&lt;/StyledDiv&gt;
) : (
&lt;p&gt;데이터가 없습니다.&lt;/p&gt;
)}
&lt;/section&gt;
);
};</p>
<p>export default About;</code></pre></p>
<p data-ke-size="size16">위의 예에서 one 이라는 이름으로 넘겨준 prop이 DOM 으로 전달되었으므로 리액트 콘솔 에러를 발생시킨답니다.<br />여기서 'DOM 에 직접 전달 되는 unknown prop' 이라는 것이 잘 이해가 되지 않았습니다.</p>
<p data-ke-size="size16">그런데 생각해보니 StyledDiv 는 어떤 prop을 받아서 무슨 일을 처리하는 리액트 컴포넌트가 아니라,<br />그냥 style 이 적용된 div 일 뿐이었습니다. 따라서 html 표준 속성 attribute 가 아닌 prop 들을<br />전달하려고 하면 에러가 발생하는게 당연하다고 생각되었습니다.</p>
<h3 data-ke-size="size23">transient prop</h3>
<p data-ke-size="size16">이 문제를 해결하기 위해 <code>styled-components</code>에서는 transient props라는 개념을 도입했다고 합니다.<br />transient props는 <code>$</code> 기호로 시작하며, styled-components는 이러한 props를 DOM 요소에<br />달하지 않고 오로지 스타일링에만 사용합니다.</p>
<pre class="javascript"><code>import styled from "styled-components";
import { ToDo } from "../types/d";
<p>// Transient prop으로 $one을 사용하여 스타일링
const StyledDiv = styled.div&lt;{ $one: ToDo }&gt;<code>    background-color: ${props =&amp;gt; props.$one.completed ? 'green' : 'red'};     width: 600px;     display: flex;     justify-content: center;     align-items: center;     margin: 0 auto;</code>;</p>
<p>const About = ({ data }: { data: ToDo[] | null }) =&gt; {
const firstToDo = data ? data[0] : null;</p>
<pre><code>if (!firstToDo) {
    return &amp;lt;p&amp;gt;데이터가 없습니다.&amp;lt;/p&amp;gt;;
}
</code></pre>
<p>// 여기서도 $one 으로 보내기
return (
&lt;section className=&quot;wrapper&quot;&gt;
&lt;StyledDiv $one={firstToDo}&gt;얌마 어바웃이다&lt;/StyledDiv&gt;
&lt;/section&gt;
);
};</p>
<p>export default About;
</code></pre></p>
<p data-ke-size="size16">문제 해결!</p>