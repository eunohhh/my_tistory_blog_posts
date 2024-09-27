<h2 data-ke-size="size26">cn : tailwind-merge 와 clsx를 결합한 유틸리티 함수</h2>
<pre class="javascript" data-ke-language="javascript"><code>import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
<p>export function cn(...inputs: ClassValue[]) {
return twMerge(clsx(inputs));
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이런 유틸리티 함수를 찾았는데<br />아주 유용해 보였습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그런데 이전 프로젝트에서 twMerge 함수만으로도<br />clsx 없이 유사하게 썼던 기억이 있어서<br />차이점에 대해 다시 짚어봤습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">결론은<br /><b><i>위처럼 cn (이름이야뭐,,,) 함수를 쓰는 것이<br />clsx 의 여러 기능도 사용하면서 tailwind 유틸리티 클래스들을<br />효과적으로 병합할 수 있는 좋은 방법이다</i></b><br />였습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">제가 헷갈렸던 내용은</p>
<pre class="javascript" data-ke-language="javascript"><code>className={twMerge(
  'w-6 h-6',
  pathname === href ? 'text-primary-color-400' : 'text-grayscale-color-300',
)}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이런식으로 twMerge 만으로도 clsx 와 비슷하게 썼었던 기억 때문이었는데,<br />이건 생각해보니 그냥 당연한 것이었습니다..</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">twMerge 는 다음과 같은데</p>
<pre class="javascript" data-ke-language="javascript"><code>declare const twMerge: (...classLists: ClassNameValue[]) =&gt; string;</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">classList 를 위처럼 받고 있기에 삼항연산자 부분은 그냥 배열화 되어서 인자로 넘어가는 것일 뿐이었습니다.<br />결과적으로 twMerge 는 단순히 병합만 해주는 친구였는데,</p>
<pre class="javascript" data-ke-language="javascript"><code>clsx('btn', { 'btn-primary': isPrimary, 'btn-disabled': isDisabled });</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">예를들어 clsx에서 위처럼 객체나 배열로 여러 옵션을 주는 등의 기능은 tailwind-merge에는 없습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">gpt 질의응답 내역도 첨부합니다.</p>
<h2 data-ke-size="size26">Q1</h2>
<p data-ke-size="size16">이렇게 함수를 만들어서 쓰면(cn), tailwind-merge 나 clsx 만 썻을때 보다 무엇이 좋은가요?</p>
<h2 data-ke-size="size26">A1</h2>
<p data-ke-size="size16">이 함수는 <b><code>clsx</code></b>와 <b><code>tailwind-merge</code></b>를 결합하여 각각의 장점을 동시에 활용하는 방식입니다. <b>단일 라이브러리를 사용하는 것보다</b> 두 라이브러리를 함께 사용할 때 얻을 수 있는 이점이 몇 가지 있습니다.</p>
<h3 data-ke-size="size23">1. <b><code>clsx</code>의 장점: 조건부 클래스 병합</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>clsx</code></b>는 <b>조건부로 클래스명을 적용</b>할 수 있는 기능을 제공합니다. 객체나 배열을 전달하여 <b>조건에 따라</b> 클래스를 추가하거나 제외할 수 있습니다.</li>
</ul>
<p data-ke-size="size16">예를 들어, 특정 클래스가 조건에 따라 동적으로 추가되어야 할 때 <b><code>clsx</code></b>를 사용하면 가독성과 관리가 용이해집니다.</p>
<pre class="javascript" data-ke-language="javascript"><code>clsx('btn', { 'btn-primary': isPrimary, 'btn-disabled': isDisabled });</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">2. <b><code>tailwind-merge</code>의 장점: Tailwind 클래스 중복 제거</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>tailwind-merge</code></b>는 <b>중복되거나 상충되는 Tailwind 클래스</b>를 병합하여 가장 우선되는 클래스를 남깁니다.</li>
</ul>
<p data-ke-size="size16">예를 들어, 같은 스타일의 클래스가 중복될 경우 <b>가장 오른쪽 클래스</b>만 유지하는 방식으로 충돌을 방지합니다.</p>
<pre class="javascript" data-ke-language="javascript"><code>twMerge('p-4 p-6'); 
// 결과: 'p-6' (p-4는 제거됨)</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">결합했을 때의 장점:</h3>
<p data-ke-size="size16"><b><code>clsx</code></b>와 <b><code>tailwind-merge</code></b>를 결합하면, <b>조건부 클래스 관리</b>와 <b>Tailwind 클래스 병합</b>의 이점을 모두 얻을 수 있습니다.</p>
<h4 data-ke-size="size20">함수로 결합했을 때 얻을 수 있는 이점:</h4>
<p data-ke-size="size16"><b>조건부 클래스 적용과 중복 제거 동시 해결</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>clsx</code></b>는 조건부로 클래스를 추가하는 데 탁월하고, <b><code>tailwind-merge</code></b>는 중복되는 Tailwind 클래스들을 효율적으로 제거합니다.</li>
<li>두 기능을 결합하면, <b>조건부로 클래스를 추가하면서도 중복된 Tailwind 클래스가 제거</b>됩니다.</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<pre class="javascript" data-ke-language="javascript"><code>// 예시: 조건부 클래스와 중복 제거 동시 처리
const className = cn('p-4', isPrimary &amp;&amp; 'p-6', 'text-center', isDisabled &amp;&amp; 'opacity-50');
// 결과: 'p-6 text-center opacity-50' (중복된 p-4는 제거)</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>가독성</b>과 <b>유연성</b> 증가:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>단일 함수</b>에서 <b>조건부 클래스 로직</b>과 <b>중복 제거</b>를 처리하므로, 코드가 더 간결하고 읽기 쉬워집니다.</li>
<li>프로젝트 규모가 커질수록 이 패턴은 <b>유연성</b>을 제공하며, 다양한 상황에서 <b>효율적인 클래스 관리를</b> 가능하게 합니다.</li>
</ul>
</li>
<li><b>유지보수성 향상</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이 함수는 <b>조건부 논리와 중복 제거</b>라는 두 가지 중요한 기능을 <b>한곳에서 관리</b>하므로, 유지보수가 더 쉬워집니다.</li>
<li>코드의 일관성을 유지하면서 <b>실수를 줄이는 데</b>도 도움이 됩니다.</li>
</ul>
</li>
</ol>
<h3 data-ke-size="size23">결론:</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>clsx</code></b>는 <b>조건부 클래스 적용</b>에 강점이 있고, <b><code>tailwind-merge</code></b>는 <b>Tailwind 클래스의 중복 제거</b>에 탁월합니다.</li>
<li>이 둘을 결합하면 <b>조건부 클래스 적용</b>과 <b>중복 제거</b>를 동시에 처리할 수 있어 <b>가독성</b>, <b>유연성</b>, <b>유지보수성</b>이 향상됩니다.</li>
<li><b>특히 Tailwind CSS</b>와 같이 클래스가 동적으로 추가되는 상황에서는 <b>더 직관적인 코드 작성</b>이 가능합니다.</li>
</ul>
<h2 data-ke-size="size26">Q2</h2>
<p data-ke-size="size16">그런데 제 예전 프로젝트에서 아래처럼 써도 동작했었던 기억이 있어요.(twMerge 에 삼항연산자로 넘긴 내용)</p>
<h2 data-ke-size="size26">A2</h2>
<p data-ke-size="size16">네, <b><code>tailwind-merge</code></b> 자체는 <b>문자열들을 병합</b>하고 중복되는 Tailwind 클래스를 처리하는 역할을 하지만, <b>조건부로 클래스명을 전달</b>하는 방식도 지원합니다. 즉, <b>조건부 연산(삼항 연산자)</b>를 사용해 문자열을 동적으로 전달하면, <b><code>twMerge</code></b>가 그 결과로 나온 문자열들을 병합하여 처리합니다.</p>
<p data-ke-size="size16"><b>삼항 연산자</b>를 사용한 조건부 클래스 명 전달은 <b>자바스크립트 로직</b>이므로, <b><code>twMerge</code></b> 내부에서 해당 로직을 직접적으로 처리하는 게 아니라, <b>결과적으로 전달된 문자열</b>을 병합합니다. <b>이 점에서 <code>clsx</code></b>와의 차이점이 있습니다.</p>
<h3 data-ke-size="size23">예시:</h3>
<pre class="javascript" data-ke-language="javascript"><code>className={twMerge(
  'w-6 h-6',
  pathname === href ? 'text-primary-color-400' : 'text-grayscale-color-300'
)}</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>pathname === href ? 'text-primary-color-400' : 'text-grayscale-color-300'</code></b>: 삼항 연산자를 통해 <b>조건부로 클래스를 적용</b>.</li>
<li><b><code>twMerge</code></b>는 <b>문자열을 병합</b>하는 역할만 수행하므로, 삼항 연산자의 결과를 그대로 병합합니다.</li>
</ul>
<p data-ke-size="size16">이 방식은 자바스크립트의 조건부 연산을 <b>사전에 처리</b>한 뒤, <b><code>twMerge</code></b>로 넘기기 때문에 <b><code>twMerge</code></b>만 사용해도 <b>조건부 클래스 적용</b>이 가능해 보이는 것입니다.</p>
<h3 data-ke-size="size23">차이점:</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>clsx</code></b>는 <b>조건부 클래스 적용</b>을 위해 객체와 배열 형태로 다양한 상황을 처리할 수 있는 추가 기능을 제공합니다.</li>
<li><b><code>twMerge</code></b>는 단순히 전달된 문자열을 병합할 뿐이며, 조건부 로직을 자체적으로 처리하지는 않습니다. 대신, 자바스크립트 연산 결과를 병합합니다.</li>
</ul>
<h3 data-ke-size="size23">결론:</h3>
<p data-ke-size="size16"><b><code>twMerge</code></b>는 자체적으로 <b>조건부 클래스 적용</b> 기능을 제공하지 않지만, <b>삼항 연산자</b>나 다른 자바스크립트 연산을 통해 조건부로 <b>문자열을 전달</b>하면 그 결과를 병합할 수 있습니다.</p>