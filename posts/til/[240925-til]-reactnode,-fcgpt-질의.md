<p data-ke-size="size16"><b>React.FC</b>와 <b>React.ReactNode</b>는 React에서 각각 다른 목적을 가진 타입입니다. 두 타입의 차이를 이해하면 타입스크립트로 React 애플리케이션을 개발할 때 보다 명확하게 타입을 지정할 수 있습니다.</p>
<h3 data-ke-size="size23"><b>React.FC (React.FunctionComponent)</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>설명</b>: <code>React.FC</code>는 함수형 컴포넌트를 정의할 때 사용하는 타입입니다.</li>
<li><b>용도</b>: 컴포넌트의 <b>props</b> 타입을 지정하고, 해당 컴포넌트가 <b>React 요소</b>를 반환한다는 것을 명시합니다.</li>
<li><b>특징</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>제네릭 타입으로 <b>Props의 타입</b>을 지정할 수 있습니다.</li>
<li>기본적으로 <code>children</code> 프로퍼티를 포함하고 있습니다.</li>
<li>컴포넌트의 반환 타입이 <code>ReactElement</code>임을 명시합니다.</li>
</ul>
</li>
<li><b>예시</b>:</li>
</ul>
<pre id="code_1727338156509" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>import React from 'react'; 
<p>interface MyComponentProps {
title: string;
}</p>
<p>const MyComponent: React.FC&lt;MyComponentProps&gt; = ({ title, children }) =&gt; (
&lt;div&gt;
&lt;h1&gt;{title}&lt;/h1&gt;
{children}
&lt;/div&gt;
);</code></pre></p>
<h3 data-ke-size="size23"><b>React.ReactNode</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>설명</b>: <code>React.ReactNode</code>는 React에서 <b>렌더링 가능한 모든 요소</b>를 나타내는 타입입니다.</li>
<li><b>용도</b>: 컴포넌트의 <b>반환 값</b>이나 <b>props의 타입</b>을 지정할 때 사용합니다.</li>
<li><b>특징</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>문자열, 숫자, React 요소, 배열, Fragment, Portal, <code>null</code>, <code>undefined</code> 등을 포함합니다.</li>
<li>즉, <b>React에서 렌더링할 수 있는 모든 것</b>의 합집합입니다.</li>
</ul>
</li>
<li><b>예시</b>:</li>
</ul>
<pre id="code_1727338192195" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>import React from 'react'; 
<p>interface MyComponentProps {
content: React.ReactNode;
}</p>
<p>const MyComponent = ({ content }: MyComponentProps) =&gt; (
&lt;div&gt; {content} &lt;/div&gt;
);</code></pre></p>
<h3 data-ke-size="size23"><b>주요 차이점 요약</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>타입의 목적</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>React.FC</code>는 <b>컴포넌트 자체의 타입</b>을 정의하는 데 사용됩니다.</li>
<li><code>React.ReactNode</code>는 <b>컴포넌트가 반환하거나 렌더링할 수 있는 값의 타입</b>을 나타냅니다.</li>
</ul>
</li>
<li><b>사용 위치</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>React.FC</code>는 컴포넌트를 선언할 때 타입으로 지정합니다.</li>
<li><code>React.ReactNode</code>는 props나 state의 타입으로 지정하여 해당 값이 무엇이든 렌더링될 수 있음을 나타냅니다.</li>
</ul>
</li>
<li><b>예시 비교</b>:</li>
</ul>
<pre id="code_1727338248099" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>//React.FC를 사용하는 컴포넌트 정의
<p>const ComponentWithFC: React.FC = () =&gt; {
return &lt;div&gt;Hello World&lt;/div&gt;;
};</p>
<p>// React.ReactNode를 props로 받는 컴포넌트 정의</p>
<p>interface Props {
footer: React.ReactNode;
}</p>
<p>const ComponentWithNode = ({ footer }: Props) =&gt; {
return (
&lt;div&gt;
{footer}
&lt;/div&gt;
);
};</code></pre></p>
<h3 data-ke-size="size23"><b>추가 참고 사항</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>React.FC</code> 사용에 대한 고려사항</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>React.FC</code>를 사용하면 자동으로 <code>children</code> prop이 포함되므로, 의도치 않게 <code>children</code>이 사용될 수 있습니다.</li>
<li>최근에는 <code>React.FC</code> 사용을 지양하고, 함수형 컴포넌트를 직접 작성하면서 반환 타입을 추론하도록 하는 경우도 많습니다.</li>
</ul>
</li>
<li><b>실제 사용 예시</b>: 이 경우 타입스크립트는 함수의 반환 타입을 자동으로 추론합니다<b></b></li>
</ul>
<pre id="code_1727338352395" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// React.FC를 사용하지 않고 컴포넌트 정의 
<p>interface ButtonProps {
onClick: () =&gt; void;
label: string;
}</p>
<p>const Button = ({ onClick, label }: ButtonProps) =&gt; (
&lt;button onClick={onClick}&gt;{label}&lt;/button&gt;
);</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>결론적으로</b><span style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Apple SD Gothic Neo', Arial, sans-serif; letter-spacing: 0px;">, </span><code style="letter-spacing: 0px;">React.FC</code><span style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Apple SD Gothic Neo', Arial, sans-serif; letter-spacing: 0px;">는 </span><b>컴포넌트의 타입</b><span style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Apple SD Gothic Neo', Arial, sans-serif; letter-spacing: 0px;">을 정의하는 데 사용되며, </span><code style="letter-spacing: 0px;">React.ReactNode</code><span style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Apple SD Gothic Neo', Arial, sans-serif; letter-spacing: 0px;">는 </span><b>컴포넌트가 렌더링할 수 있는 모든 종류의 값</b><span style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Apple SD Gothic Neo', Arial, sans-serif; letter-spacing: 0px;">을 나타내는 타입입니다. 상황에 맞게 적절한 타입을 사용하여 타입 안정성과 코드의 명확성을 높일 수 있습니다.</span></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><a href="https://yceffort.kr/2022/03/dont-use-react-fc">참고링크</a></p>