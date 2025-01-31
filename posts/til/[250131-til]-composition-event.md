<h3 data-ke-size="size23"><b>문제 정의</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>목표</b>: 사용자가 최대 3개의 태그를 입력할 수 있는 UI 구현해야 했습니다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>처음엔 인풋 하나만 보이고, 사용자가 <code>Tab</code> 또는 <code>Enter</code>로 다음 인풋을 추가하는 방식입니다.</li>
</ul>
</li>
<li><b>문제</b>: 한글 입력 중(<code>IME</code> 조합 상태) <code>Tab</code> 또는 <code>Enter</code>를 누르면,
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>새 인풋이 <b>빈 값</b>이 아니라 <b>마지막에 조합되던 한글</b>이 남은 채로 생성되었습니다.</li>
</ul>
</li>
<li><b>의문</b>: 영문 입력에서는 멀쩡한데 <b>왜 한글에서만</b> 이런 문제가 발생하는 것인지 의문이었습니다.</li>
</ul>
<h3 data-ke-size="size23"><b>해결 과정</b></h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>useFieldArray 오류 의심</b><br />처음에는 React Hook Form의 <code>useFieldArray</code> 사용 방식이 잘못됐다고 생각해, <code>append</code> 시 ID 중복 문제, <code>setValue</code> 강제 초기화 등 여러 시도를 했으나 실패하였습니다.</li>
<li><b>한글 입력 시 IME(입력기) 조합중</b> 이벤트<br />문제를 검색해보다가 <b>Composition Event</b>(<code>onCompositionStart</code>, <code>onCompositionEnd</code>)가 있다는 사실을 알게 되었습니다. 한글은 자모음 조합이 완전히 끝나기 전에(글자가 확정되기 전) <code>onKeyDown</code>이 먼저 호출되고 Enter<code>/</code>Tab 입력을 처리해버려서 &ldquo;조합 중인 문자가 그대로 넘어가&rdquo; 버리는 것이 문제의 원인이었습니다.</li>
<li><b>조합 중임을 판단해 무시하기</b></li>
</ol>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>onCompositionStart</code>/<code>onCompositionEnd</code>에서 <code>isComposing</code>을 true/false로 저장하기로 하였습니다.</li>
<li>다음은 <code>onKeyDown</code>에서 isComposing이 true면(조합 중이면) Tab, Enter 처리를 막았습니다.</li>
<li>이렇게 하면 한글 조합이 <b>완전히 완료된 뒤</b>에만 새 태그 인풋을 생성하게 됩니다.</li>
</ul>
<pre class="javascript"><code>function ExampleComponent() {
  const [isComposing, setIsComposing] = useState(false);
<p>// 한글 IME 조합 시작/종료
// onCompositionStart / onCompositionEnd 이벤트 핸들러
const handleComposition = (e: React.CompositionEvent&lt;HTMLInputElement&gt;) =&gt; {
if (e.type === 'compositionstart') {
setIsComposing(true);
} else if (e.type === 'compositionend') {
setIsComposing(false);
}
};</p>
<p>const handleKeyDown = (e: React.KeyboardEvent&lt;HTMLInputElement&gt;) =&gt; {
// 한글 조합 중이라면 조합 완료 후에만 Enter/Tab 동작 처리
if ((e.nativeEvent as any).isComposing || isComposing) return;
// ... 나머지 로직
};</p>
<p>return (
&lt;input
onKeyDown={handleKeyDown}
onCompositionStart={handleComposition}
onCompositionEnd={handleComposition}
/&gt;
)
}</code></pre></p>
<h3 data-ke-size="size23"><b>결과</b></h3>
<p data-ke-size="size16">한글/영문 상관없이, 입력 중에 특정 조건으로 새 인풋을 생성해도 <b>마지막 조합 중인 글자</b>가 새 인풋에 남지 않게 할 수 있었습니다. 이를 통해 이전처럼 임의로 setValue 등을 통해 문자열을 강제로 지우는 편법 로직을 제거할 수 있었습니다.</p>
<h3 data-ke-size="size23"><b>배운 점 (인사이트)</b></h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>IME(입력기) 특성</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>한글, 일본어, 중국어 등 조합형 언어는 키보드 입력 과정에서 자모음(문자)이 &ldquo;완전히 확정&rdquo;되기 전까지, 브라우저가 <b>Composition Event</b>를 통해 조합 상태를 관리한다는 점을 알게 되었습니다.</li>
<li>와 동시에 onKeyDown 등의 이벤트도 발생할 수 있으므로, <b>조합 중인 상태는 무시</b>하도록 처리해야 합니다.</li>
</ul>
</li>
<li><b>에러 발생의 범위</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>영문 입력만 테스트하면 문제를 못 찾을 수 있으므로, <b>다국어(특히 IME 사용 언어)</b> 입력 시에도 제대로 동작하는지 체크하는 습관이 중요하다는 것을 깨닳았습니다.</li>
</ul>
</li>
<li><b>React, React Hook Form 문제 X</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이런 이슈가 발생하면 우선 <b>브라우저 이벤트 흐름</b>을 의심해볼 수 있다는 것을 알게되었습니다.</li>
<li>프레임워크나 라이브러리가 아니라 <b>브라우저 입력 방식</b>이 핵심 요인이었습니다.</li>
</ul>
</li>
<li><b>CompositionEvent의 활용</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>onCompositionStart, onCompositionUpdate, onCompositionEnd를 통해 조합 상태를 세밀하게 제어 가능 하다는 것도 알게 되었습니다.</li>
<li>주로 한글, 일본어, 중국어 입력 시 발생하며, <b>서버 사이드 렌더링(SSR)</b> 환경이나 <b>Edge 케이스</b>에서는 또 다른 주의가 필요할 수 있다고 합니다!</li>
</ul>
</li>
</ol>