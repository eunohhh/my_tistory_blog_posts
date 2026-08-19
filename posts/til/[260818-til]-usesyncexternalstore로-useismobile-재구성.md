<h1>useSyncExternalStore로 useIsMobile 재구성</h1>
<p data-ke-size="size16">뷰포트가 모바일 폭인지 알려주는 흔한 훅 하나를 리팩토링했다.<br />결과만 보면 코드 줄 수는 비슷한데, 고쳐진 문제가 네 개쯤 된다. 정리해둔다.</p>
<h2 data-ke-size="size26">Before</h2>
<pre class="javascript"><code>"use client";
import * as React from "react";
<p>const MOBILE_BREAKPOINT = 550;</p>
<p>export function useIsMobile() {
const [isMobile, setIsMobile] = React.useState(
() =&gt; window.innerWidth &lt; MOBILE_BREAKPOINT
);</p>
<p>React.useEffect(() =&gt; {
if (typeof window === &quot;undefined&quot;) return;
const onResize = () =&gt; {
setIsMobile(window.innerWidth &lt; MOBILE_BREAKPOINT);
};
window.addEventListener(&quot;resize&quot;, onResize);
onResize();
return () =&gt; window.removeEventListener(&quot;resize&quot;, onResize);
}, []);</p>
<p>return isMobile;
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">동작은 한다. 다만 몇 가지 이유로 동작한다.</p>
<h2 data-ke-size="size26">이 코드의 문제 네 가지</h2>
<h3 data-ke-size="size23">1. SSR 가드가 엉뚱한 곳에 있음</h3>
<p data-ke-size="size16"><code>useEffect</code> 안에 <code>typeof window === "undefined"</code> 체크가 있다.<br />그런데 <b>effect는 서버에서 아예 실행되지 않는다.</b><br />이 가드는 영원히 <code>false</code>인 조건문이다.</p>
<p data-ke-size="size16">정작 서버에서 터지는 건 가드가 없는 쪽이다.</p>
<pre class="coffeescript"><code>React.useState(() =&gt; window.innerWidth &lt; MOBILE_BREAKPOINT)
//               ^^^^^^ 렌더 중 실행 &rarr; 서버에서 ReferenceError</code></pre>
<p data-ke-size="size16"><code>useState</code>의 초기화 함수는 "지연 실행"이라 안전해 보이지만,<br />지연되는 건 <b>첫 렌더 이후로가 아니라 첫 렌더 시점까지</b>다.<br />렌더 자체는 서버에서 일어나므로 그대로 터진다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이게 드러나지 않았던 건 이 훅을 쓰는 컴포넌트가 전부 <code>dynamic(..., { ssr: false })</code>로 로드되고 있기 때문이었다. 즉 <b>런타임 설정에 의존해 우연히 살아 있는 코드</b>다.<br />누가 나중에 <code>ssr: false</code>를 떼는 순간 빌드가 깨진다.</p>
<h3 data-ke-size="size23">2. 구독 등록 전의 변경을 한번 놓침</h3>
<p data-ke-size="size16"><code>useState + useEffect</code> 패턴의 타임라인은 이렇다.</p>
<pre class="armasm"><code>렌더 &rarr; 커밋 &rarr; 페인트 &rarr; effect 실행 &rarr; addEventListener
                       &uarr;
                  여기까지 구독 없음</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 갭 사이에 뷰포트가 바뀌면 그 변경은 이벤트로 잡히지 않는다.<br />원래 코드가 <code>addEventListener</code> 직후에 <code>onResize()</code>를 한 번 더 부르는 게 바로 이 갭을 메우려는 시도다.<br />필요해서 넣은 코드지만, <b>패턴 자체가 갭을 만들기 때문에 생긴 땜질</b>이다.</p>
<h3 data-ke-size="size23">3. 초기 프레임이 깜빡임 가능성</h3>
<p data-ke-size="size16"><code>ssr: false</code> 덕분에 지금은 초기값이 실제 폭이라 괜찮다.<br />하지만 SSR을 켜는 순간 흔한 대안인 "초기값 <code>false</code>로 두고 effect에서 맞추기" 방식으로 가게 되고, 그러면 모바일에서 데스크톱 레이아웃이 한 프레임 그려진 뒤 모바일로 바뀐다.<br />페인트 이후에 effect가 돌기 때문이다.</p>
<h3 data-ke-size="size23">4. Tearing 가능성</h3>
<p data-ke-size="size16">React 18의 동시성 렌더링에서는 렌더가 중간에 <b>중단되고 나중에 재개</b>될 수 있다.<br />React state는 React가 소유하니 렌더 도중 안 바뀐다고 보장되지만, <code>window.innerWidth</code> 같은 외부 값은 아니다.</p>
<p data-ke-size="size16">중단된 사이에 뷰포트가 바뀌면 같은 트리 안에서 컴포넌트 A는 옛날 값,<br />B는 새 값을 읽어 화면이 찢어(tearing)질 수 있다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">After</h2>
<pre class="javascript"><code>"use client";
import { useSyncExternalStore } from "react";
<p>const MOBILE_BREAKPOINT = 550;</p>
<p>/** 렌더마다 재구독하지 않도록 모듈 스코프에 고정한다 */
function subscribe(onChange: () =&gt; void) {
window.addEventListener(&quot;resize&quot;, onChange);
return () =&gt; window.removeEventListener(&quot;resize&quot;, onChange);
}</p>
<p>const getSnapshot = () =&gt; window.innerWidth &lt; MOBILE_BREAKPOINT;</p>
<p>/** 서버는 뷰포트를 알 수 없다 — 데스크톱으로 가정한다 */
const getServerSnapshot = () =&gt; false;</p>
<p>export function useIsMobile() {
return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}</code></pre></p>
<h2 data-ke-size="size26">useSyncExternalStore 동작 원리</h2>
<h3 data-ke-size="size23">기원</h3>
<p data-ke-size="size16">React 18의 동시성 렌더링이 도입되면서, "React 바깥의 값을 안전하게 읽는" 공식 창구가 필요해졌다.<br />계보는 대략 아래와 같다.</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>단계</th>
<th>설명</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>use-subscription</code></td>
<td>Facebook 내부 라이브러리. 사실상 전신</td>
</tr>
<tr>
<td><code>useMutableSource</code> RFC</td>
<td>너무 복잡해서 폐기</td>
</tr>
<tr>
<td><b><code>useSyncExternalStore</code></b></td>
<td>React 18 working group에서 확정, 2022년 정식 출시</td>
</tr>
<tr>
<td><code>use-sync-external-store</code> shim</td>
<td>React 16.8/17용 백포트. Redux 8, Zustand, Jotai 등이 이걸로 마이그레이션</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">이름의 <code>Sync</code>가 중요.<br />외부 스토어를 구독하는게 아니라 <b>외부스토어를 동기적으로 읽는다</b>는 뜻</p>
<h3 data-ke-size="size23">세 개의 인자</h3>
<pre class="reasonml"><code>useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b><code>subscribe(onStoreChange)</code></b></p>
<p data-ke-size="size16">React가 마운트 시 호출하고 정리 함수를 돌려받는다.<br />스토어가 바뀔 때 <code>onStoreChange()</code>를 부르면, React가 <code>getSnapshot()</code>을 다시 읽어 이전 값과 <code>Object.is</code>로 비교하고 다를 때만 리렌더를 예약한다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>주의:</b> <code>subscribe</code>의 <b>참조가 바뀌면 React는 기존 구독을 해제하고 재구독</b>한다.<br />컴포넌트 안에 인라인으로 두면 매 렌더마다 unsubscribe/subscribe가 반복된다.<br />모듈 스코프로 빼거나 <code>useCallback</code>으로 고정해야 한다.</p>
</blockquote>
<p data-ke-size="size16"><b><code>getSnapshot()</code></b></p>
<p data-ke-size="size16">단순한 "초기값 읽기"가 아니고, <b>렌더링 도중 React가 여러 번 호출</b>한다.<br />이게 tearing 방지의 실제 메커니즘이라고 할 수 있다.</p>
<p data-ke-size="size16"><br />React는 커밋 직전에 스냅샷을 다시 읽어 렌더 시작 시점과 달라졌는지 확인하고, 달라졌으면 진행 중이던 렌더를 버리고 <b>동기 우선순위로 다시 렌더</b>한다. 그래서 트리 전체가 반드시 같은 값을 본다.</p>
<p data-ke-size="size16">여기서 두 가지 제약이 발생한다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>렌더 중 호출되므로 <b>부수효과 금지</b></li>
<li>값이 같으면 <b>반드시 같은 참조</b>를 반환해야 함</li>
</ul>
<p data-ke-size="size16">두 번째가 실무에서 자주 밟을 만한 지뢰...<br />매번 새 객체나 배열을 만들면 <code>Object.is</code> 비교가 항상 실패해서 무한 렌더 루프에 빠지고,<br /><code>The result of getSnapshot should be cached</code> 경고가 뜬다.<br />이 훅은 boolean 원시값이라 안전하다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b><code>getServerSnapshot()</code></b></p>
<p data-ke-size="size16">SSR <b>그리고 하이드레이션 렌더</b>에서 쓰인다.</p>
<p data-ke-size="size16"><br />주의! 이 부분이 오해하기 쉽다!<br />클라이언트도 하이드레이션 중에는 <code>getSnapshot</code>이 아니라 <code>getServerSnapshot</code>을 읽는다.</p>
<p data-ke-size="size16">이건 Next.js 등 써보면 흔히 만날 수 있는 Hydration Miss 관련이다.</p>
<p data-ke-size="size16">서버 HTML과 첫 클라이언트 렌더 결과가 일치해야 하이드레이션 미스가 없는것..<br />하이드레이션이 끝난 직후 React가 실제 스토어를 다시 읽어 다르면 리렌더한다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">즉 <b>"클라이언트 첫 렌더부터 실제 폭"은 <code>ssr: false</code>일 때만 참</b>이다.<br />SSR되는 컴포넌트에서는 하이드레이션 렌더가 <code>false</code>로 시작하고 한 번 더 렌더가 돈다.<br />다만 이건 <b>하이드레이션 커밋과 같은 사이클에서 동기적으로 처리</b>되므로, 페인트 이후에 도는 <code>useEffect</code> 방식보다 깜빡임이 훨씬 덜하다.</p>
<h3 data-ke-size="size23">문제별 대응 정리</h3>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>문제</th>
<th>useSyncExternalStore의 해결</th>
</tr>
</thead>
<tbody>
<tr>
<td>SSR 크래시</td>
<td><code>getServerSnapshot</code>이 서버 경로를 API 레벨에서 강제 분리</td>
</tr>
<tr>
<td>구독 갭</td>
<td>구독 등록 <b>직후 스냅샷을 재검사</b>해 갭을 메움 (<code>onResize()</code> 땜질 불필요)</td>
</tr>
<tr>
<td>초기 깜빡임</td>
<td>클라이언트 전용이면 첫 렌더부터 실제 값, SSR이어도 동기 처리</td>
</tr>
<tr>
<td>Tearing</td>
<td>커밋 직전 스냅샷 재검증 &rarr; 트리 전체 일관성 보장</td>
</tr>
<tr>
<td>보일러플레이트</td>
<td>예전엔 각 라이브러리가 <code>forceUpdate</code> / <code>useReducer</code> 해킹으로 각자 구현</td>
</tr>
</tbody>
</table>
<h3 data-ke-size="size23">트레이드오프</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>startTransition</code>의 이점을 잃는다.</b> 외부 스토어 업데이트는 정의상 동기로 처리되므로 논블로킹 트랜지션으로 낮출 수 없다. React 공식 문서도 "가능하면 React state를 쓰고, 이 훅은 외부 소스와 통합할 때만"이라고 권한다.</li>
<li>파생 객체를 반환해야 한다면 <code>useSyncExternalStoreWithSelector</code>(shim 패키지 제공)를 쓰거나 직접 메모이즈해야 한다.</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">여담: <code>resize</code> vs <code>matchMedia</code></h2>
<h3 data-ke-size="size23">일반적으로는 <code>matchMedia</code>가 낫다(shadcn 기본 훅도 mql 사용)</h3>
<p data-ke-size="size16"><code>resize</code>는 브레이크포인트와 무관한 1px 변화에도 계속 발화한다. 필요한 건 임계값을 넘나드는 순간뿐인데.</p>
<pre class="typescript"><code>const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 0.02}px)`);
<p>function subscribe(onChange: () =&gt; void) {
mql.addEventListener(&quot;change&quot;, onChange);
return () =&gt; mql.removeEventListener(&quot;change&quot;, onChange);
}</p>
<p>const getSnapshot = () =&gt; mql.matches;</code></pre></p>
<p data-ke-size="size16">장점:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>브라우저가 임계값 판정을 대신 해준다 &rarr; <b>콜백이 실제로 넘나들 때만 발화</b></li>
<li><code>getSnapshot</code>이 <code>mql.matches</code>라는 <b>캐시된 boolean</b>을 읽는다. <code>window.innerWidth</code>는 경우에 따라 스타일/레이아웃 계산을 강제할 수 있다</li>
<li>CSS 미디어 쿼리와 <b>같은 엔진으로 판정</b>되므로 CSS와 JS의 경계가 어긋나지 않는다</li>
</ul>
<h3 data-ke-size="size23">하지만 lazy init이 필요하다</h3>
<p data-ke-size="size16">위 코드에는 함정이 있다. <code>mql</code>을 모듈 스코프에서 만들면 <b>모듈이 import되는 순간 <code>window</code>를 건드린다.</b><br /><code>"use client"</code>가 붙어 있어도 SSR에서 모듈 평가는 일어나므로 그대로 터진다.</p>
<pre class="javascript"><code>let mql: MediaQueryList | null = null;
<p>function getMql() {
if (mql === null) {
mql = window.matchMedia(<code>(max-width: ${MOBILE_BREAKPOINT - 0.02}px)</code>);
}
return mql;
}</p>
<p>function subscribe(onChange: () =&gt; void) {
const m = getMql();
m.addEventListener(&quot;change&quot;, onChange);
return () =&gt; m.removeEventListener(&quot;change&quot;, onChange);
}</p>
<p>const getSnapshot = () =&gt; getMql().matches;
const getServerSnapshot = () =&gt; false;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>subscribe</code>와 <code>getSnapshot</code>은 클라이언트에서만 호출되고 <code>getServerSnapshot</code>은 <code>window</code>를 안 건드리므로, 이 구조면 서버에서 <code>matchMedia</code>가 한 번도 평가되지 않는다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>꿀팁:</b> <code>- 0.02</code>는 CSS의 <code>max-width</code> 경계 관례.<br /><code>min-width: 550px</code>와 <code>max-width: 550px</code>는 정확히 550px에서 둘 다 참이 되어 겹치므로,<br />소수점 뷰포트까지 고려해 <code>549.98px</code>로 잡는 게 부트스트랩 등에서 쓰는 방식이다.</p>
<h3 data-ke-size="size23">그런데 우리 팀은 <code>resize</code>를 쓴다</h3>
<p data-ke-size="size16">QA 방식이 특이하다. 개발자도구 responsive 뷰에서 <b>폭을 실시간으로 드래그하며</b> 확인하고, 레이아웃에 <code>clamp()</code>를 아주 많이 쓴다.</p>
<p data-ke-size="size16"><code>matchMedia</code>의 <code>change</code> 이벤트는 responsive 뷰 드래그 중에도 임계값을 넘으면 정상 발화한다.<br />그러니 "동작하지 않는다"는 이유는 아니다. 실제 이유는 두 가지다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>JS 경계와 CSS 경계의 미묘한 불일치.</b> <code>clamp()</code>가 깔린 레이아웃을 실시간으로 늘렸다 줄였다 하면서 보면, <code>&lt; 550</code>(JS 숫자 비교)과 <code>max-width: 549.98px</code>(CSS 판정)이 소수점 뷰포트 폭&middot;브라우저 줌 상황에서 한 틱 어긋나 보이는 구간이 생긴다. 디버깅할 때 "이게 훅 문제인가 CSS 문제인가"를 가르는 데 시간이 든다. <code>window.innerWidth</code> 직접 비교는 최소한 <b>눈에 보이는 숫자와 코드가 1:1로 대응</b>한다.</li>
<li><b>훅이 나중에 실제 폭을 필요로 할 가능성.</b> <code>mql.matches</code>는 boolean뿐이라 확장 시 결국 <code>innerWidth</code>를 다시 읽게 된다.</li>
</ol>
<p data-ke-size="size16">성능 걱정은 생각보다 작다. <code>resize</code>가 초당 수십 번 발화해도, <code>getSnapshot</code>이 반환하는 boolean이 그대로면 <b><code>Object.is</code> 비교에서 걸러져 리렌더가 일어나지 않는다.</b> 비용은 리스너 호출과 <code>innerWidth</code> 읽기뿐이다. 다만 이건 "이 훅이 boolean만 반환하기 때문"이고, 나중에 실제 폭 숫자를 반환하도록 바꾸면 매 프레임 리렌더가 되니 그때는 rAF 스로틀링이 필요해진다.</p>
<h2 data-ke-size="size26">정리</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>useState</code> 초기화 함수는 <b>렌더 중</b> 실행된다. <code>window</code> 접근 금지.</li>
<li><code>useEffect</code> 안의 <code>typeof window</code> 가드는 무의미하다. effect는 서버에서 안 돈다.</li>
<li><code>useSyncExternalStore</code>는 SSR 분리 &middot; 구독 갭 &middot; tearing을 API 형태로 강제해서 막는다.</li>
<li><code>subscribe</code>는 참조를 고정할 것. <code>getSnapshot</code>은 순수하고 참조 안정적일 것.</li>
<li>브라우저 API를 모듈 스코프에서 즉시 평가하지 말 것. lazy init으로 감쌀 것.</li>
<li>일반적으로는 <code>matchMedia</code>, 다만 팀의 검증 방식에 따라 <code>resize</code>가 합리적일 수 있다. <b>선택 이유를 주석으로 남길 것.</b></li>
</ul>