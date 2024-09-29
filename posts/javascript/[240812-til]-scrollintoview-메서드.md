<h2 data-ke-size="size26">scrollIntoView</h2>
<p data-ke-size="size16">이 좋은 걸 몰랐다니..<br />요소를 뷰포트 내에 보이도록 자동 스크롤해주는 기능이라고 합니다..</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">아래 예시에서는 div 의 아래에 버튼들이 있고<br />인덱스를 state 로 관리하는 상황인데요.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">인덱스가 변할 때 마다 useEffect 가 실행되고<br />자동으로 인덱스에 해당하는 버튼이 화면의 중앙에 오게 됩니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">많이 써먹을 것 같습니다!</p>
<pre class="lisp"><code>useEffect(() =&gt; {
    if (scrollRef.current) {
        const selectedButton = scrollRef.current.children[
                selectedIndex
            ] as HTMLElement;
        if (selectedButton) {
            selectedButton.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }
    }
}, [selectedIndex]);</code></pre>
<h2 data-ke-size="size26">참고: GPT 쌤의 설명</h2>
<p data-ke-size="size16"><code>scrollIntoView</code> 메서드는 JavaScript에서 DOM 요소를 뷰포트(Viewport) 내에서 보이도록 자동으로 스크롤하는 데 사용되는 메서드입니다. 이 메서드는 해당 요소가 현재 화면에 보이지 않는 경우, 화면에 나타나도록 스크롤 위치를 조정합니다. 이때 스크롤이 발생하는 방식은 여러 옵션으로 제어할 수 있습니다.</p>
<h3 data-ke-size="size23">기본 문법</h3>
<pre class="css"><code>element.scrollIntoView([options]);</code></pre>
<p data-ke-size="size16">또는</p>
<pre class="reasonml"><code>element.scrollIntoView(alignToTop);</code></pre>
<h3 data-ke-size="size23">파라미터</h3>
<p data-ke-size="size16"><code>scrollIntoView</code>는 두 가지 방식으로 호출될 수 있습니다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Boolean 방식 (Deprecated)</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>alignToTop</code>: 선택적 <code>Boolean</code> 값입니다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>true</code>: 요소가 화면의 상단에 위치하도록 스크롤합니다.</li>
<li><code>false</code>: 요소가 화면의 하단에 위치하도록 스크롤합니다.</li>
</ul>
</li>
<li>이 방식은 현재 거의 사용되지 않으며, 옵션 객체를 사용하는 방식으로 대체되었습니다.</li>
</ul>
</li>
<li><b>옵션 객체 방식 (권장)</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>options</code>: <code>Object</code> 형태로, 스크롤 동작을 더욱 세밀하게 제어할 수 있는 여러 속성을 포함합니다.</li>
</ul>
</li>
</ol>
<h4 data-ke-size="size20">옵션 객체 속성</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>behavior</b>: 스크롤 애니메이션의 동작 방식을 정의합니다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>"auto"</code>: 기본 동작으로, 애니메이션 없이 즉시 스크롤합니다. (기본값)</li>
<li><code>"smooth"</code>: 부드러운 스크롤 애니메이션을 적용합니다.</li>
</ul>
</li>
<li><b>block</b>: 요소가 수직 방향에서 어떻게 정렬될지를 정의합니다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>"start"</code>: 요소의 상단이 뷰포트의 상단에 맞춰집니다.</li>
<li><code>"center"</code>: 요소가 뷰포트의 중앙에 위치합니다.</li>
<li><code>"end"</code>: 요소의 하단이 뷰포트의 하단에 맞춰집니다.</li>
<li><code>"nearest"</code>: 현재 뷰포트와 가장 가까운 위치에 맞춰집니다.</li>
</ul>
</li>
<li><b>inline</b>: 요소가 수평 방향에서 어떻게 정렬될지를 정의합니다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>"start"</code>: 요소의 좌측이 뷰포트의 좌측에 맞춰집니다.</li>
<li><code>"center"</code>: 요소가 뷰포트의 중앙에 위치합니다.</li>
<li><code>"end"</code>: 요소의 우측이 뷰포트의 우측에 맞춰집니다.</li>
<li><code>"nearest"</code>: 현재 뷰포트와 가장 가까운 위치에 맞춰집니다.</li>
</ul>
</li>
</ul>
<h3 data-ke-size="size23">예제</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>기본 사용법 (Deprecated 방식)</b>:</li>
<li><code class="language-javascript">// 요소를 뷰포트의 상단에 위치시키며, 부드러운 스크롤 없이 즉시 이동
element.scrollIntoView(true);</code></li>
<li><b>권장 사용법 (옵션 객체 사용)</b>:이 예제에서는 요소가 부드럽게 스크롤되며, 화면의 중앙에 위치하게 됩니다.</li>
<li><code class="language-javascript">element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center'
});</code></li>
</ol>
<h3 data-ke-size="size23">실생활 예시</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>네비게이션 메뉴</b>: 긴 목록에서 특정 항목이 선택되었을 때, 해당 항목이 화면에 보이도록 스크롤됩니다.</li>
<li><b>이미지 갤러리</b>: 썸네일 목록에서 특정 이미지가 선택될 때, 선택된 이미지가 뷰포트 중앙에 오도록 스크롤됩니다.</li>
<li><b>폼 검증</b>: 사용자가 잘못된 입력을 했을 때, 에러 메시지나 해당 폼 필드로 자동 스크롤됩니다.</li>
</ul>
<p data-ke-size="size16"><code>scrollIntoView</code>는 이런 인터랙션을 구현하는 데 매우 유용하며, 사용자 경험을 크게 향상시킬 수 있는 기능입니다.</p>