<p data-ke-size="size16">이번 개인과제에서는 250개의 배열을 리턴하는 api 를 사용해야 했습니다.<br />그런데 이것을 한번에 화면에 렌더링 하자니 무언가 마음에 들지 않아서<br />react-intersection-observer 를 사용해보고 싶어졌습니다.</p>
<h2 data-ke-size="size26">1 ) 전체 배열을 부분 배열화 하여 2차원 배열 생성</h2>
<p data-ke-size="size16">이를 위해서 250 길이의 배열을 20개씩 나누기로 했습니다.<br />그래서 이를 수행하는 간단한 util 함수를 작성하였습니다.</p>
<pre class="typescript" data-ke-language="typescript"><code>// util 함수
function makeChunkArray&lt;T&gt;(array: T[], chunkSize: number): T[][] {
    const chunks = [];
    for (let i = 0; i &lt; array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}
// 컴포넌트 에서...
useEffect(() =&gt; {
    const fetchCountries: FetchCountries = async () =&gt; {
        const data = await api.getCountries();
        const chunks = makeChunkArray(data, chunkSize);
        setChunkCountries(chunks);
        // 요 부분(setDisplayedCountries)은 아래에 자세히...
        if (chunks.length &gt; 0) setDisplayedCountries(chunks[0]);
    };
    fetchCountries();
}, []);</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>+=chunkSize</code> 부분은 배열을 일정 크기 단위로 나누기 위한 루프의 인덱스를 증가시키는 역할을 합니다.<br />이 부분에 대한 gpt 쌤의 설명을 메모합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">예를 들어, <code>array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]</code>이고 <code>chunkSize = 3</code>일 때 함수의 동작은 다음과 같습니다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>초기 상태</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>i = 0</code></li>
<li><code>chunks = []</code></li>
</ul>
</li>
<li><b>첫 번째 반복</b> (<code>i = 0</code>):
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>array.slice(0, 3)</code>은 <code>[1, 2, 3]</code>을 반환합니다.</li>
<li><code>chunks</code>는 <code>[[1, 2, 3]]</code>이 됩니다.</li>
<li><code>i</code>는 <code>3</code>으로 증가합니다 (<code>i += chunkSize</code>).</li>
</ul>
</li>
<li><b>두 번째 반복</b> (<code>i = 3</code>):
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>array.slice(3, 6)</code>은 <code>[4, 5, 6]</code>을 반환합니다.</li>
<li><code>chunks</code>는 <code>[[1, 2, 3], [4, 5, 6]]</code>이 됩니다.</li>
<li><code>i</code>는 <code>6</code>으로 증가합니다.</li>
</ul>
</li>
<li><b>세 번째 반복</b> (<code>i = 6</code>):
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>array.slice(6, 9)</code>은 <code>[7, 8, 9]</code>을 반환합니다.</li>
<li><code>chunks</code>는 <code>[[1, 2, 3], [4, 5, 6], [7, 8, 9]]</code>이 됩니다.</li>
<li><code>i</code>는 <code>9</code>로 증가합니다.</li>
</ul>
</li>
<li><b>네 번째 반복</b> (<code>i = 9</code>):
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>array.slice(9, 12)</code>은 <code>[10]</code>을 반환합니다 (범위를 넘어가는 요소는 포함되지 않음).</li>
<li><code>chunks</code>는 <code>[[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]</code>이 됩니다.</li>
<li><code>i</code>는 <code>12</code>로 증가합니다.</li>
</ul>
</li>
<li><b>루프 종료</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이제 <code>i = 12</code>는 <code>array.length = 10</code>보다 크므로 루프가 종료됩니다.</li>
</ul>
</li>
</ol>
<p data-ke-size="size16">이렇게 <code>+=chunkSize</code> 부분은 각 반복마다 인덱스를 <code>chunkSize</code>만큼 증가시켜 배열을 일정 크기 단위로 나누도록 합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">2) 생성된 2차원 배열을 활용하여 렌더링</h2>
<p data-ke-size="size16">생성된 2차원 배열을 활용할 수 있도록 state 를 설정해주고 기본 렌더링을 적용합니다.</p>
<pre class="typescript" data-ke-language="typescript"><code>function CountryList() {
    const [chunkCountries, setChunkCountries] = useState&lt;Country[][]&gt;([]);
    const [displayedCountries, setDisplayedCountries] = useState&lt;Country[]&gt;([]);
    const [selectedCountries, setSelectedCountries] = useState&lt;Country[]&gt;([]);
    const [currentChunkIndex, setCurrentChunkIndex] = useState&lt;number&gt;(0);
<pre><code>// ...중략...
// intersection 되었을 때(inView)마다 수행할 함수 
const loadMoreCountries: LoadMoreCountries = useCallback(() =&amp;gt; {
    const nextIndex = currentChunkIndex + 1;
    setDisplayedCountries((prev) =&amp;gt; [...prev, ...chunkCountries[nextIndex]]);
    setCurrentChunkIndex(nextIndex);
}, [currentChunkIndex, chunkCountries]);

// ...중략...
return(
    // ...중략...
    // 렌더링 로직
    {displayedCountries.length === 0
        // 로드 전에 보여줄 스켈레톤 
        ? Array.from({ length: 20 }, (_, i) =&amp;gt; &amp;lt;CountryCardSkeleton key={i} /&amp;gt;)
        : displayedCountries.map((country) =&amp;gt; (
            &amp;lt;CountryCard
                key={country.cca2}
                country={country}
                isSelected={false}
                onClick={handleSelectCountry}
            /&amp;gt;
        )
    )}
    // ...중략...
    // 대략 마지막부분에 intersection-observer 로 사용할 div 하나 생성해놓기
    // ref 는 아래에 자세히...
    &amp;lt;div ref={ref} className=&quot;h-1 w-full&quot;&amp;gt;&amp;lt;/div&amp;gt;
);
</code></pre>
<p>}</code></pre></p>
<h2 data-ke-size="size26">3) react-intersection-observer 적용</h2>
<p data-ke-size="size16">이제 react-intersection-observer 를 적용하는 로직을 작성합니다.</p>
<p data-ke-size="size16"><br />react-intersection-observer 에서 제공하는 useInView 훅을 사용할 수 있습니다.</p>
<p data-ke-size="size16">intersectionOptions 객체를 인자로 받아서 기본적으로 ref, inView, entry 를 리턴합니다.</p>
<p data-ke-size="size16">(자세한 내용은 <a href="https://github.com/thebuilder/react-intersection-observer#readme">깃헙페이지</a> 를 참고할 수 있습니다.)</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">ref 를 감시할 대상에 적용하면, intersection 될 때 마다 inView 가 false 에서 true 로 변합니다.<br />이를 활용하여 로직을 작성합니다.</p>
<pre class="javascript" data-ke-language="javascript"><code>// ... 중략 ...
const { ref, inView } = useInView({
    threshold: 0,
});
// ... 중략 ...
useEffect(() =&gt; {
    // ref 가 화면에 들어왔고, 현재 보여줄 인덱스 state가 전체 250개 배열의 마지막보다 작을 때
    // 미리 작성해둔 loadMoreCountries 함수 호출
    if (inView &amp;&amp; currentChunkIndex &lt; chunkCountries.length - 1) loadMoreCountries();
}, [inView, currentChunkIndex, chunkCountries, loadMoreCountries]);</code></pre>
<h2 data-ke-size="size26">4) inView 값에 인한 함수 반복 호출 방지</h2>
<p data-ke-size="size16">그런데, 여기까지 적용하면 inView 가 약간 이상하게 동작합니다.</p>
<p data-ke-size="size16">아직 정확한 원인을 파악하지는 못했지만, 스크롤이 하단에 다다랐을 때 1회만 inView 가 true 가 되길 기대했는데,<br />반복적으로 true가 되면서 loadMoreCountries 함수가 불필요하게 반복 호출되는 문제를 만났습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이것을 해결하고자 useInView 의 옵션으로 <b>triggerOnce</b> 를 true 로 주어<br />한번만 실행되게 해보려고 시도했지만 잘 되지 않았습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">결국 임시방편으로(?) ref 를 사용하여 해결하였습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이전 inView 상태를 우선 초기 useRef 로 설정하고,<br />inView 값 변화를 useEffect 에서 감지할 때 마다 이 ref 의 값을 최신화하는 방법을 사용했습니다.</p>
<pre class="typescript" data-ke-language="typescript"><code>// ... 중략 ...
// inView 가 잘 안될 때 사용
// inView 가 의도치 않게 true 로 바뀌어서 무한 로딩 되는 것 방지하고자, 추적용 ref 설정
const prevInViewRef = useRef(inView);
<p>// ... 중략 ...
// useEffect 로직을 아래와 같이 변경
useEffect(() =&gt; {
// inView 가 true 이고
// 추적을 위한 prevInViewRef의 값이 false 이면서
// 마지막 인덱스 미만일 때 loadMoreCountries 호출
if (inView &amp;&amp; !prevInViewRef.current
&amp;&amp; currentChunkIndex &lt; chunkCountries.length - 1) loadMoreCountries();
// 여기서 prevInViewRef 를 업데이트 해줘야 함
prevInViewRef.current = inView;
}, [inView, currentChunkIndex, chunkCountries, loadMoreCountries]);</p>
<p>//... 하략 ...</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">5) 반복 호출 문제 해결 (240630)</h2>
<p data-ke-size="size16">스터디 여러분의 도움으로 위 4번의 문제를 해결하였습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">해결 하고 나니 참 바보같은 실수를 했던 것이었습니다 ㅜ.ㅜ</p>
<p data-ke-size="size16">단지 inView 를 추적하는 useEffect 의 의존성배열에 inView 만 남기면 되었던 것이었습니다...</p>
<p data-ke-size="size16">(다른 녀석들이 useEffect 를 트리거하지 않도록)</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 과정에서 두 개의 useState 도 useRef 로 변경하였습니다.&nbsp;</p>
<p data-ke-size="size16">무한스크롤을 위해 1) 에서 나눠진 2차원 배열 useState는 생각해보니 렌더링에 관여하지 않고 있었고,</p>
<p data-ke-size="size16">2차원 배열 안의 배열의 인덱스를 증가시키기 위한 useState 역시 렌더링에 관여하지 않고 있었습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 둘을 useRef 로 바꾸었습니다.</p>
<p data-ke-size="size16">아래는 해결한 코드 입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719755856017" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>const [displayedCountries, setDisplayedCountries] = useState&lt;Country[]&gt;([]);
const [selectedCountries, setSelectedCountries] = useState&lt;Country[]&gt;([]);
const { ref, inView }: InViewHookResponse = useInView({
    threshold: 0,
});
// 아래 두 항목을 useState 에서 useRef로 변경
// 모든 나라를 담을 배열
const chunkCountriesRef = useRef&lt;Country[][]&gt;([]);
// 현재 보여지는 배열의 인덱스
const currentChunkIndexRef = useRef&lt;number&gt;(0);
<p>// ... 중략 ...</p>
<p>// 의존성 배열에 inView만 적용하는 것으로 해결!
useEffect(() =&gt; {
if (inView &amp;&amp; currentChunkIndexRef.current &lt; chunkCountriesRef.current.length - 1) {
// 아래 콘솔 로그에서 하나씩 증가하는 것을 확인할 수 있음
// console.log(currentChunkIndexRef.current, chunkCountriesRef.current.length);
currentChunkIndexRef.current += 1;
setDisplayedCountries((prev) =&gt; [
...prev,
...chunkCountriesRef.current[currentChunkIndexRef.current],
]);
}
}, [inView]);</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>