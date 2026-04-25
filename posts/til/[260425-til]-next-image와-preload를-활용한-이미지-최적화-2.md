<h1>Next Image 컴포넌트와 Preload를 활용한 이미지 최적화 2</h1>
<p data-ke-size="size16"><a href="https://ifelseif.tistory.com/328">지난번</a> 에 이어서...</p>
<h2 data-ke-size="size26">원점 재검토</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>프리로드는 무슨 문제를 해결하는가?</li>
<li>왜 <code>new Image()</code>가 아니라 <code>&lt;link rel="preload"&gt;</code>인가?</li>
<li><code>IMAGE_SIZES</code>를 컨테이너별로 분리한 게 왜 중요한가?</li>
<li><code>img.decode()</code>는 왜 결국 안 쓰기로 했나?</li>
<li>첫 1장 high + 나머지 idle low로 나눈 이유는?</li>
</ol>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">1. 프리로드가 푸는 문제</h2>
<p data-ke-size="size16">next/image가 화면에 들어오면 그때서야 이미지를 받기 시작한다. 모달이나 캐러셀처럼 <b>유저 클릭 직후 즉시 큰 이미지가 떠야 하는 케이스</b>는 클릭 시점에 fetch가 시작되어 200~800ms 빈 화면이 보인다.</p>
<p data-ke-size="size16">해결: <b>유저가 클릭하기 전에 이미지를 미리 받아 놓기</b>. 두 가지 시점에서 프리로드한다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>그리드 카드 hover (ForesightJS가 마우스 궤적으로 클릭 의도 예측) &rarr; 모달 본문 이미지 프리로드</li>
<li>모달이 열리는 순간 useEffect &rarr; 본문 첫 6장 프리로드 (이미 첫 1장은 표시 시작, 나머지는 스크롤 대비)</li>
<li>oo 페이지 진입 시 &rarr; 첫 6장 프리로드</li>
</ul>
<p data-ke-size="size16"><code>next/image</code>가 응답을 캐시에 넣어 두므로, 실제 <code>&lt;img&gt;</code>가 마운트될 때 <b>새 fetch 없이 캐시 hit</b>으로 즉시 paint된다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">2. <code>new Image()</code> &rarr; <code>&lt;link rel="preload"&gt;</code>로 바꾼 이유</h2>
<h3 data-ke-size="size23">이전 방식 (<code>new Image()</code>)</h3>
<pre class="actionscript"><code>const img = new Image();
img.src = `https://yourdomain.com/_next/image?url=...&amp;w=1200&amp;q=75`;</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">브라우저는 <code>img.src</code>로 지정된 <b>단일 URL</b>을 fetch해서 메모리/디스크 캐시에 적재한다. 단순하고 동작은 한다.<br /><b>하지만 결정적 문제가 있다.</b></p>
<h3 data-ke-size="size23">문제: next/image는 srcset을 사용한다</h3>
<p data-ke-size="size16">next/image는 이렇게 렌더된다:</p>
<pre class="dts"><code>&lt;img
  srcset="
    /_next/image?url=...&amp;w=640&amp;q=75 640w,
    /_next/image?url=...&amp;w=750&amp;q=75 750w,
    /_next/image?url=...&amp;w=828&amp;q=75 828w,
    /_next/image?url=...&amp;w=1080&amp;q=75 1080w,
    /_next/image?url=...&amp;w=1200&amp;q=75 1200w,
    ..."
  sizes="(max-width: 768px) 100vw, 768px"
/&gt;</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">브라우저는 <b>현재 뷰포트 폭, DPR, sizes 힌트</b>를 종합해서 srcset 후보 중 <b>하나만</b> 골라 fetch한다. 어떤 후보가 뽑힐지는 디바이스마다 다르다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>iPhone (DPR 3, 폭 393px) &rarr; <code>1200w</code> 후보 선택</li>
<li>데스크톱 (DPR 2, 폭 1440px) &rarr; <code>1920w</code> 또는 <code>2048w</code> 후보 선택</li>
<li>데스크톱 (DPR 1, 폭 1440px) &rarr; <code>750w</code> 또는 <code>828w</code> 후보 선택</li>
</ul>
<p data-ke-size="size16"><code>new Image()</code>로는 <b>개발자가 미리 한 후보를 추측해서 강제로 받을</b> 수밖에 없다. 추측이 빗나가면:</p>
<pre class="angelscript"><code>프리로드:    1200w 후보 받음 (캐시에 적재)
실제 &lt;img&gt;:  1920w 후보 선택 &rarr; 캐시 미스 &rarr; 새 fetch &rarr; 프리로드는 헛수고</code></pre>
<h3 data-ke-size="size23">새 방식 (<code>&lt;link rel="preload" imagesrcset imagesizes&gt;</code>)</h3>
<pre class="sas"><code>const link = document.createElement("link");
link.rel = "preload";
link.as = "image";
link.setAttribute("imagesrcset", "/_next/image?url=...&amp;w=640&amp;q=75 640w, ... 3840w");
link.setAttribute("imagesizes", "(max-width: 768px) 100vw, 768px");
document.head.appendChild(link);</code></pre>
<p data-ke-size="size16">브라우저는 <b><code>&lt;img&gt;</code>와 동일한 srcset 알고리즘</b>으로 후보를 고른다.<br />뷰포트/DPR/sizes를 보고 자기 기준으로 1개를 선택해 fetch한다. 그래서 나중에 <code>&lt;img srcset=... sizes=...&gt;</code>가 마운트되면 <b>자기가 골랐던 그 URL이 이미 캐시에 있다</b>. 100% hit.</p>
<h3 data-ke-size="size23">핵심 통찰</h3>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">프리로드의 정답은 "어떤 URL을 받을지 정하는 것"이 아니라<br /><b>"브라우저에게 후보 목록과 결정 규칙을 통째로 넘기는 것"</b>이다.<br />그래야 실제 <code>&lt;img&gt;</code>와 같은 결정을 내린다.</p>
</blockquote>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이게 이번 작업의 가장 중요한 부분이었다!</p>
<h3 data-ke-size="size23"><code>imagesrcset</code> / <code>imagesizes</code>라는 속성</h3>
<p data-ke-size="size16">HTML 표준에 정식으로 있는 link preload 전용 속성.<br /><code>&lt;img&gt;</code>의 <code>srcset</code>/<code>sizes</code>와 동일한 문자열을 받는다.<br />브라우저가 link와 img의 매칭 규칙을 동일하게 적용하라고 만든 속성이다.<br />같은 문자열을 두 곳에 넣어주는 게 정합성의 핵심.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">3. <code>IMAGE_SIZES</code>를 컨테이너별로 분리한 이유</h2>
<p data-ke-size="size16"><code>sizes</code> 속성은 브라우저에게 <b>"이 이미지가 표시될 슬롯의 폭이 얼마인지"</b> 알려주는 힌트다.<br />부정확하면 브라우저가 잘못된 후보를 고른다.</p>
<h3 data-ke-size="size23">이전: 단일 <code>IMAGE_SIZES</code></h3>
<pre class="abnf"><code>const IMAGE_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이걸 그리드 썸네일/모달 본문/콘텐츠 상세 <b>모두에 똑같이</b> 사용했다. 문제:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>그리드 썸네일</b> (3, 6 열로 표시) 데탑에서 실제는 20vw인데 <code>33vw</code>로 알려줌 &rarr; 브라우저가 너무 큰 후보 fetch &rarr; 데이터 낭비 + 느림</li>
<li><b>모달 본문</b> (<code>max-w-3xl</code> = 768px 고정): 데스크톱 1440px에서 실제는 ~700px인데 <code>33vw</code> = 475px로 힌트 &rarr; 작아 보이게 만들고 있음. 브라우저가 작은 후보를 고르거나, DPR 2면 큰 거 고르거나... 일관성 없음</li>
<li>**콘텐츠 상세 (가로 스크롤 카드, 데스크톱에서 ~1109px): <code>33vw</code>로 힌트 &rarr; 매우 부정확</li>
</ul>
<h3 data-ke-size="size23">이후: 슬롯별 분리</h3>
<pre class="cpp"><code>// 그리드 카드: sm 3열, md 4열, lg 5열, xl 6열
export const IMAGE_SIZES_GRID =
  "(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw";
<p>// 모달 본문: 모바일 풀폭, 데스크톱은 max-w-3xl=768px 고정
export const IMAGE_SIZES_MODAL =
&quot;(max-width: 768px) 100vw, 768px&quot;;</p>
<p>// 콘텐츠 상세: 모바일은 95vw, 데스크톱은 ~1109px이라 1100px로 힌트해서 1200w 후보 노림
export const IMAGE_SIZES_POOLSOOP =
&quot;(max-width: 768px) 95vw, 1100px&quot;;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">각 컨테이너가 자기에 맞는 sizes를 가지면:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>브라우저가 <b>딱 필요한 만큼</b>의 해상도를 고름 &rarr; 데이터 절약</li>
<li>같은 sizes 문자열을 <b>link preload와 <code>&lt;img&gt;</code> 양쪽에 넘김</b> &rarr; 캐시 hit 정확성 보장</li>
</ul>
<h3 data-ke-size="size23">디테일 &mdash; 그리드 카드 hover preload</h3>
<p data-ke-size="size16">그리드 카드에서 hover 시 프리로드할 때, sizes를 <code>IMAGE_SIZES_GRID</code>가 아니라 <code>IMAGE_SIZES_MODAL</code>로 줘야 한다.</p>
<p data-ke-size="size16">그리드 카드 자체의 썸네일은 이미 <code>priority</code>로 처리되어 별도 프리로드가 필요 없다.</p>
<p data-ke-size="size16"><br /><b>hover 프리로드의 진짜 의도는 "다음에 열릴 모달의 본문 이미지를 미리 받는 것"</b> 이다.<br />모달 sizes로 받아야 모달 마운트 시점에 캐시 hit이 일어난다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">코드 한 줄 차이지만, 의도와 sizes를 일치시키지 않으면 모든 노력이 무의미해진다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">4. <code>img.decode()</code>를 결국 안 쓴 이유</h2>
<h3 data-ke-size="size23"><code>decode()</code>가 뭔지</h3>
<p data-ke-size="size16">이미지가 표시되려면 두 단계가 필요하다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>다운로드</b>: 네트워크에서 바이트를 받음 (캐시에 적재)</li>
<li><b>디코드</b>: 압축된 바이트(WebP/JPEG)를 픽셀 비트맵으로 변환 (CPU 작업)</li>
</ol>
<p data-ke-size="size16"><code>&lt;img&gt;</code>가 페인트될 때 디코드가 발생하는데, 큰 이미지면 메인 스레드 블로킹이 생겨 화면이 튄다.<br /><code>img.decode()</code>는 <b>디코드를 사전에 백그라운드에서 끝내 두는 메서드</b>다.</p>
<pre class="qml"><code>const img = new Image();
img.src = url;
await img.decode(); // 디코드까지 끝나고 resolve</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이론적으로는 프리로드 시 decode까지 같이 해 두면 paint 시 디코드 비용도 0이 되어 더 빠르다.</p>
<h3 data-ke-size="size23">그런데 안쓴 이유?</h3>
<p data-ke-size="size16">문제는 <code>&lt;link rel=preload imagesrcset&gt;</code>와 <code>Image() + decode()</code>의 <b>매칭이 보장되지 않는다</b>는 것.</p>
<pre class="dart"><code>// 시나리오:
const link = document.createElement("link");
link.rel = "preload";
link.as = "image";
link.imageSrcset = "...640w, ...828w, ...1200w";
link.imageSizes = "(max-width: 768px) 100vw, 768px";
// &rarr; 브라우저가 srcset 알고리즘으로 1200w 후보 선택해 캐시에 적재
<p>const img = new Image();
img.srcset = &quot;...640w, ...828w, ...1200w&quot;;
img.sizes = &quot;(max-width: 768px) 100vw, 768px&quot;;
await img.decode();
// → 이 Image() 인스턴스도 srcset 알고리즘 적용.
// 그러나 link과 다른 currentSrc를 고를 수 있다 (스펙 차이, 타이밍 차이)
// → 만약 1080w를 골랐다면 → 새로 fetch → 캐시 미스 → 프리로드 두 배</code></pre></p>
<p data-ke-size="size16"><code>link</code>와 <code>Image()</code>의 후보 선택이 어긋나면:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>link</code>로 받은 1200w는 캐시에 들어갔지만 미사용 (낭비)</li>
<li><code>Image()</code>가 새로 1080w를 fetch (추가 egress)</li>
<li>정작 실제 <code>&lt;img&gt;</code>가 마운트될 때 또 다른 후보를 골라 또 캐시 미스 가능</li>
</ul>
<p data-ke-size="size16">&rarr; <b>decode 한 번 끼워넣으려다가 fetch가 두세 번 일어날 위험</b>.</p>
<h3 data-ke-size="size23">절충안의 결론</h3>
<p data-ke-size="size16">decode가 가져오는 이득(메인 스레드 디코드 비용 100~200ms)보다,<br />매칭 미스로 인한 추가 fetch 손실이 훨씬 크다. 게다가:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>현재 우리 케이스에서 link의 <code>onload</code>만으로 충분히 빠름 (브라우저가 이미 디스크 캐시에 넣음)</li>
<li>실제 LCP를 측정해 봐도 link.onload 이후 paint는 충분히 매끄럽다</li>
</ul>
<p data-ke-size="size16"><b>결정: link.onload를 "성공" 신호로만 사용. decode는 안 쓴다.</b></p>
<p data-ke-size="size16">향후 진짜로 첫 1장의 LCP가 더 중요해지면,<br /><b>첫 1장에 한해서만</b> Image+decode를 옵션으로 켤 여지를 남겨 뒀다<br />(<code>PreloadImagesOptions</code>에 <code>decodeFirst?: boolean</code> 추가 가능). 지금은 끔.</p>
<h3 data-ke-size="size23">이 결정의 일반론</h3>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">"더 좋아 보이는 최적화"가 시스템 다른 부분과 매칭되는지 검증하는 것이 더 중요하다.<br />두 메커니즘이 같은 기준으로 결정을 내리지 않으면, 각각 잘 동작해도 합쳤을 때 깨진다. 통합 정합성 &gt; 개별 최적화.</p>
</blockquote>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">5. 첫 1장 high + 나머지 idle low로 나눈 이유</h2>
<p data-ke-size="size16">프리로드는 무료가 아니다. 6장을 동시에 받으면:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>네트워크 큐가 막혀 다른 중요 자원(JS, CSS) 로딩이 늦어짐</li>
<li>메인 스레드도 onload/onerror 콜백으로 점유됨</li>
</ul>
<p data-ke-size="size16">특히 모달이 열린 직후처럼 <b>인터랙션 직후</b>에 6개 fetch가 동시에 시작되면 모달 자체의 첫 paint가 늦어진다.</p>
<h3 data-ke-size="size23">분기 전략</h3>
<pre class="reasonml"><code>preloadImages(srcs, options)
  ├─ srcs[0]: 즉시 시작 + fetchpriority="high"
  └─ srcs[1..N-1]: requestIdleCallback로 미루고 fetchpriority="low"</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>첫 1장</b>: LCP 후보 또는 화면에 가장 먼저 보일 이미지. high priority로 다른 자원과 경쟁할 때도 우선.</li>
<li><b>나머지</b>: 어차피 스크롤해야 보이는 것들. 메인 스레드가 idle일 때 천천히 받아도 충분.</li>
</ul>
<h3 data-ke-size="size23"><code>requestIdleCallback</code>의 의미</h3>
<p data-ke-size="size16">브라우저가 "지금 한가하다(다음 paint 전 여유 시간이 있다)"고 판단할 때만 콜백을 실행한다.<br />인터랙션이 진행 중이면 미뤄지므로 <b>유저가 체감하는 반응성을 해치지 않는다</b>.<br />Safari/iOS는 미지원이라 <code>setTimeout(cb, 1)</code>로 폴백 &mdash; 약하지만 micro-task 큐에 양보 정도는 됨.</p>
<h3 data-ke-size="size23"><code>fetchpriority</code>의 의미</h3>
<p data-ke-size="size16">브라우저에게 네트워크 큐 우선순위 힌트.<br />high는 다른 low/auto 자원보다 먼저 받음.<br />low는 늦게. 우리는 "첫 1장만 진짜 중요" 사실을 브라우저에 정확히 알려준다.</p>
<h3 data-ke-size="size23">프리로드는 너무 많이 하면 페널티가 된다.</h3>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">프리로드는 도움이 되지만 <b>너무 많이 하면 페널티</b>가 된다.<br />"필요한 만큼만, 적절한 우선순위로."<br />메인 스레드와 네트워크 큐를 자원으로 인식하고 budgeting하는 게 프론트 퍼포먼스의 본질.</p>
</blockquote>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">6. 부록</h2>
<h3 data-ke-size="size23"><code>linkRegistry</code> (모듈 스코프 Map)</h3>
<pre class="lasso"><code>const linkRegistry = new Map&lt;string, { element: HTMLLinkElement; refCount: number; ... }&gt;();</code></pre>
<p data-ke-size="size16">같은 이미지를 여러 곳에서 프리로드 시도해도 link element는 한 번만 생성하고 refCount로 관리.<br />cleanup 시 refCount=0이면 link 제거.<br /><b>React StrictMode</b>(dev에서 effect를 두 번 실행)에서도 link 중복 없이 동작하게 하려는 안전장치.</p>
<h3 data-ke-size="size23"><code>PreloadHandle { done, cleanup }</code> API</h3>
<pre class="reasonml"><code>const handle = preloadImages(srcs, options);
useEffect(() =&gt; handle.cleanup, [handle]);
// 컴포넌트 unmount 시 진행 중인 idle 콜백 취소 + link 제거(refCount 감소)</code></pre>
<p data-ke-size="size16">unmount 후에도 link가 head에 남아 있거나 idle 콜백이 살아 있으면 누수.<br />cleanup으로 명시적 회수.</p>
<h3 data-ke-size="size23">SSR 가드</h3>
<pre class="coffeescript"><code>if (typeof document === "undefined") {
  return { done: Promise.resolve(0), cleanup: () =&gt; {} };
}</code></pre>
<p data-ke-size="size16">서버 렌더에서 호출되어도 안전하게.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">7.&nbsp; 표로 요약</h2>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>결정</th>
<th>이유</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>new Image()</code> &rarr; <code>&lt;link rel=preload imagesrcset&gt;</code></td>
<td>next/image의 srcset과 동일 매칭 알고리즘 &rarr; 캐시 hit 100% 보장</td>
</tr>
<tr>
<td><code>IMAGE_SIZES</code> &rarr; 컨테이너별 분리</td>
<td>브라우저에게 정확한 슬롯 폭을 알려서 딱 맞는 후보 선택</td>
</tr>
<tr>
<td>그리드 hover preload는 모달 sizes 사용</td>
<td>hover의 의도는 모달 본문 캐시 적재이므로</td>
</tr>
<tr>
<td><code>img.decode()</code> 비활성</td>
<td>link와 Image의 매칭 미스 위험이 decode 이득보다 큼</td>
</tr>
<tr>
<td>첫 1장 high 즉시 + 나머지 idle low</td>
<td>메인 스레드/네트워크 budgeting. 인터랙션 우선</td>
</tr>
<tr>
<td><code>linkRegistry</code> refCount + cleanup</td>
<td>중복 link 방지, 메모리/누수 방지, StrictMode 안전</td>
</tr>
</tbody>
</table>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">8. 참조</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>HTML 표준: <a href="https://html.spec.whatwg.org/multipage/links.html#link-type-preload">Preload &mdash; Fetch Spec</a></li>
<li>responsive images: <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#responsive_images">srcset and sizes &mdash; MDN</a></li>
<li>next/image 내부: <a href="https://nextjs.org/docs/app/api-reference/components/image">Next.js Image &mdash; Vercel docs</a></li>
<li>Web Vitals (LCP): <a href="https://web.dev/articles/lcp">web.dev/lcp</a></li>
<li>fetchpriority: <a href="https://web.dev/articles/fetch-priority">Priority Hints &mdash; web.dev</a></li>
<li>requestIdleCallback: <a href="https://developer.mozilla.org/en-US/docs/Web/API/Background_Tasks_API">Cooperative scheduling &mdash; MDN</a></li>
</ul>
<p data-ke-size="size16">특히 <code>srcset</code>+<code>sizes</code>의 알고리즘은 한 번 정독하면.. 이 아니라, 두 번 세 번 보고있다 ㅠㅠ</p>