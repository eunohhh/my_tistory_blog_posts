<h1>Next Image 컴포넌트와 Preload를 활용한 이미지 최적화</h1>
<h2 data-ke-size="size26">TL;DR</h2>
<p data-ke-size="size16">Next.js Image 컴포넌트는 <code>srcset</code>을 통해 디바이스에 맞는 이미지를 제공하지만, 동적 src의 경우 체감 속도 향상이 크지 않다. 사용자 환경(뷰포트, DPR)에 맞는 정확한 이미지 URL을 계산해서 preload하면 브라우저 캐시 히트를 통해 실질적인 로딩 속도 개선을 얻을 수 있다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">개요</h2>
<p data-ke-size="size16">이미지 최적화의 가장 좋은 방법은 업로드 시점에 sharp 등으로 avif/webp 변환과 적절한 압축을 적용하는 것이다. 하지만 이미 외부 스토리지(S3, Supabase 등)에 저장된 대용량 이미지를 다뤄야 하는 경우, Next.js Image 컴포넌트의 최적화 기능과 preload 전략을 조합하면 사용자 체감 속도를 개선할 수 있다.</p>
<p data-ke-size="size16">이 글에서는 Next.js Image 컴포넌트가 생성하는 srcset의 원리를 이해하고, 이를 활용해 효과적인 preload를 구현하는 방법을 다룬다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">목표</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>Next.js Image의 srcset 동작 원리 이해</li>
<li>사용자 디바이스 환경에 맞는 이미지 URL 계산</li>
<li>계산된 URL로 preload하여 캐시 히트 달성</li>
<li>모달, 캐러셀 등에서 이미지 로딩 지연 최소화</li>
</ol>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">방법</h2>
<h3 data-ke-size="size23">문제 인식: Next.js Image만으로는 부족한 이유</h3>
<p data-ke-size="size16">Next.js Image 컴포넌트를 사용한다고 해서 무조건 빨라지는 것은 아니다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>동적 src</b>: src 값이 런타임에 결정되면 최적화 효과가 제한적</li>
<li><b>외부 이미지</b>: 원본이 S3 등 외부에 있고 크기가 크면 첫 요청 시 warm-up 지연 발생</li>
<li><b>정적 src</b>: <code>public</code> 폴더의 정적 이미지라면 효과적</li>
</ul>
<h3 data-ke-size="size23">핵심 아이디어: srcset과 동일한 URL로 preload</h3>
<p data-ke-size="size16">Next.js Image는 srcset을 통해 다양한 해상도 옵션을 제공한다:</p>
<pre class="angelscript"><code>/_next/image?url=원본URL&amp;w=3840&amp;q=75</code></pre>
<p data-ke-size="size16">브라우저는 뷰포트와 DPR을 고려해 적절한 w 값을 선택한다. <b>preload 시에도 동일한 URL을 사용해야 캐시 히트가 발생</b>한다.</p>
<h3 data-ke-size="size23">구현</h3>
<h4 data-ke-size="size20">1. 상수 정의</h4>
<pre class="typescript" data-ke-language="typescript"><code>// Next.js 기본 deviceSizes
export const NEXT_IMAGE_DEVICE_SIZES = [
  640, 750, 828, 1080, 1200, 1920, 2048, 3840,
] as const;
<p>/**</p>
<ul>
<li>프리로드 시 사용할 기본 품질 (next.config.ts 의 images.qualities 범위 내)
*/
export const PRELOAD_DEFAULT_QUALITY = 75;</li>
</ul>
<p>/**</p>
<ul>
<li>sizes 프롭을 모든 이미지에 대해 고정할 경우 사용
*/
export const IMAGE_SIZES = &quot;(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw&quot;;</code></pre></li>
</ul>
<h4 data-ke-size="size20">2. 적정 width 계산 함수</h4>
<pre class="typescript"><code>type PreloadParamsOptions = {
  viewportWidth: number;
  dpr?: number;
  scale?: number;  // 모달=1.0, 썸네일=더 낮게
  quality?: number;
};
<p>export function getPreloadImageParams({
viewportWidth,
dpr = 1,
scale = 1,
quality = PRELOAD_DEFAULT_QUALITY,
}: PreloadParamsOptions) {
const safeViewportWidth = Math.max(1, viewportWidth);
const safeDpr = clamp(dpr, 1, 3);  // DPR 3 이상은 대역폭 낭비 방지
const targetWidth = Math.ceil(safeViewportWidth * safeDpr * scale);</p>
<p>const width = pickClosestGreaterOrEqual(targetWidth, NEXT_IMAGE_DEVICE_SIZES);
return { width, quality };
}</p>
<p>function pickClosestGreaterOrEqual(
targetWidth: number,
candidates: readonly number[],
) {
for (const candidateW of candidates) {
if (candidateW &gt;= targetWidth) return candidateW;
}
return candidates[candidates.length - 1] ?? targetWidth;
}</p>
<p>function clamp(number: number, min: number, max: number) {
return Math.min(max, Math.max(min, number));
}</code></pre></p>
<h4 data-ke-size="size20">3. Next.js Image Optimization URL 생성</h4>
<pre class="typescript"><code>export function buildImageUrl(src: string, width: number, quality: number) {
  const encodedUrl = encodeURIComponent(src);
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : "http://localhost:3000";
<p>return <code>${baseUrl}/_next/image?url=${encodedUrl}&amp;amp;w=${width}&amp;amp;q=${quality}</code>;
}</code></pre></p>
<h4 data-ke-size="size20">4. Preload 실행 함수</h4>
<pre class="javascript"><code>export async function preloadImages(srcs: string[]): Promise&lt;number&gt; {
  if (srcs.length === 0) return 0;
<p>const viewportWidth =
typeof window !== &quot;undefined&quot; ? window.innerWidth : 1200;
const dpr = typeof window !== &quot;undefined&quot; ? window.devicePixelRatio : 1;
const { width, quality } = getPreloadImageParams({
viewportWidth,
dpr,
scale: 1,
});</p>
<p>const promises = srcs.map((src) =&gt; {
const url = buildImageUrl(src, width, quality);
return imagePromise(url);
});</p>
<p>const results = await Promise.allSettled(promises);
return results.filter((r) =&gt; r.status === &quot;fulfilled&quot;).length;
}</p>
<p>function imagePromise(src: string): Promise&lt;void&gt; {
return new Promise((resolve, reject) =&gt; {
const img = new Image();
img.src = src;
img.onload = () =&gt; resolve();
img.onerror = () =&gt; reject();
});
}</code></pre></p>
<h3 data-ke-size="size23">사용 예시</h3>
<h4 data-ke-size="size20">onMouseEnter로 preload</h4>
<pre class="javascript"><code>const handlePreloadImage = async () =&gt; {
  const successCount = await preloadImages(IMAGE_SRCS.slice(9, 12));
  console.log(`Preloaded: ${successCount} images`);
};
<p>&lt;a
href=&quot;/gallery&quot;
onMouseEnter={handlePreloadImage}
&gt;
갤러리 보기
&lt;/a&gt;</code></pre></p>
<h4 data-ke-size="size20">Hook으로 사용</h4>
<pre class="typescript"><code>export function usePreloadImage({
  srcs,
  isActive,
}: {
  srcs: string[];
  isActive: boolean;
}) {
  const [successCount, setSuccessCount] = useState(0);
<p>useEffect(() =&gt; {
if (!isActive) return;
preloadImages(srcs).then(setSuccessCount);
}, [srcs, isActive]);</p>
<p>return successCount;
}</p>
<p>// 사용
const successCount = usePreloadImage({
srcs: IMAGE_SRCS.slice(3, 6),
isActive: true,
});</code></pre></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">결과</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>캐시 히트 달성</b>: 사용자 환경에 맞는 정확한 URL을 preload하므로 Next.js Image가 요청할 이미지와 일치</li>
<li><b>체감 속도 향상</b>: 모달 열기, 캐러셀 넘기기 등에서 이미지가 즉시 표시됨</li>
<li><b>대역폭 효율</b>: 모든 srcset을 preload하지 않고 필요한 해상도만 preload</li>
</ul>
<p data-ke-size="size16"><b><span style="color: #ee2323;">배포&nbsp;후&nbsp;여러&nbsp;번&nbsp;테스트하면&nbsp;/_next/image&nbsp;CDN&nbsp;캐시가&nbsp;이미&nbsp;워밍되어&nbsp;차이가&nbsp;거의&nbsp;안&nbsp;보일&nbsp;수&nbsp;있습니다.</span></b></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">참고: DPR(Device Pixel Ratio)</h2>
<h3 data-ke-size="size23">DPR이란?</h3>
<p data-ke-size="size16">DPR은 CSS 픽셀 1개가 실제 물리적 픽셀 몇 개에 해당하는지를 나타내는 비율이다.</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>기기</th>
<th>DPR</th>
<th>설명</th>
</tr>
</thead>
<tbody>
<tr>
<td>일반 모니터</td>
<td>1</td>
<td>CSS 1px = 물리 1px</td>
</tr>
<tr>
<td>Retina 디스플레이</td>
<td>2</td>
<td>CSS 1px = 물리 4px (2&times;2)</td>
</tr>
<tr>
<td>iPhone Pro Max 등</td>
<td>3</td>
<td>CSS 1px = 물리 9px (3&times;3)</td>
</tr>
</tbody>
</table>
<h3 data-ke-size="size23">코드에서의 역할</h3>
<pre class="processing"><code>const targetWidth = Math.ceil(safeViewportWidth * safeDpr * scale);</code></pre>
<p data-ke-size="size16"><b>예시: iPhone 14 Pro (뷰포트 393px, DPR 3)</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>DPR 미적용: <code>393px</code> &rarr; 후보 중 <code>640</code> 선택</li>
<li>DPR 적용: <code>393 &times; 3 = 1179px</code> &rarr; 후보 중 <code>1200</code> 선택</li>
</ul>
<h3 data-ke-size="size23">왜 DPR을 고려해야 하나?</h3>
<p data-ke-size="size16"><b>1. 선명한 이미지를 위해</b></p>
<p data-ke-size="size16">DPR 3인 기기에서 393px 이미지를 보여주면, 물리적으로 1179개의 픽셀에 393개의 정보만 있어서 이미지가 흐릿하게 보인다.</p>
<p data-ke-size="size16"><b>2. next/image가 실제로 요청하는 이미지와 일치시키기 위해</b></p>
<p data-ke-size="size16">브라우저는 srcset에서 이미지를 고를 때 자동으로 DPR을 고려한다:</p>
<pre class="xml"><code>&lt;img srcset="/_next/image?w=640 640w, /_next/image?w=750 750w, ..." /&gt;</code></pre>
<p data-ke-size="size16">뷰포트 393px + DPR 3인 경우 브라우저는 자동으로 1200w 이미지를 요청한다.</p>
<p data-ke-size="size16"><b>3. 프리로드 효과를 얻기 위해</b></p>
<p data-ke-size="size16">DPR을 고려하지 않으면:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>프리로드: 640px 이미지</li>
<li>실제 요청: 1200px 이미지</li>
</ul>
<p data-ke-size="size16">&rarr; 캐시 히트 실패로 프리로드가 무의미해진다.</p>
<h3 data-ke-size="size23">DPR 클램프 (1~3 제한)</h3>
<pre class="angelscript"><code>const safeDpr = clamp(dpr, 1, 3);</code></pre>
<p data-ke-size="size16">일부 기기는 DPR이 3.5나 4인 경우도 있는데, 너무 큰 이미지를 프리로드하면 대역폭 낭비가 될 수 있어서 3으로 상한선을 둔다.</p>
<hr data-ke-style="style1" />
<p data-ke-size="size16"><b>요약</b>: DPR을 고려해야 next/image가 실제로 요청할 이미지와 동일한 이미지를 프리로드할 수 있고, 그래야 브라우저 캐시 히트가 발생해서 프리로드의 효과를 볼 수 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<hr contenteditable="false" data-ke-type="horizontalRule" data-ke-style="style1" />
<h2 data-ke-size="size26"><b>전체 코드 예시</b></h2>
<pre id="code_1768708364089" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>type PreloadParamsOptions = {
  // CSS 픽셀 기준 뷰포트 폭 (window.innerWidth)
  viewportWidth: number;
  // 디바이스 픽셀 비율 (window.devicePixelRatio)
  dpr?: number;
  // 기본 1.0. 모달처럼 거의 풀폭인 경우 1.0, 썸네일/그리드처럼 작으면 더 낮춰도 됨.
  scale?: number;
  // next/image 품질(0-100). next.config.ts images.qualities 에 포함되어야 함.
  quality?: number;
};
<p>/**</p>
<ul>
<li>preloadImages 함수의 옵션 타입</li>
<li></li>
<li>@property sizes - CSS sizes 속성. 미디어 조건에 따라 scale을 자동 계산합니다.</li>
<li>예: &quot;(max-width: 768px) 100vw, 50vw&quot;</li>
<li>@property scale - 이미지가 차지하는 뷰포트 비율 (0~1). sizes보다 우선 적용됩니다.</li>
<li>@property quality - 이미지 품질 (0-100). 기본값: 75</li>
<li>@property viewportWidth - 뷰포트 너비 (CSS 픽셀). 기본값: window.innerWidth</li>
<li>@property dpr - 디바이스 픽셀 비율. 기본값: window.devicePixelRatio
*/
type PreloadImagesOptions = {
sizes?: string;
scale?: number;
quality?: number;
viewportWidth?: number;
dpr?: number;
};</li>
</ul>
<p>/**</p>
<ul>
<li>주어진 숫자를 최소값과 최대값 사이로 제한합니다.</li>
<li></li>
<li>@param number - 제한할 숫자</li>
<li>@param min - 허용되는 최소값</li>
<li>@param max - 허용되는 최대값</li>
<li>@returns min과 max 사이로 제한된 숫자</li>
<li></li>
<li>@example</li>
<li>clamp(5, 0, 10) // =&gt; 5 (범위 내)</li>
<li>clamp(-5, 0, 10) // =&gt; 0 (최소값으로 제한)</li>
<li>clamp(15, 0, 10) // =&gt; 10 (최대값으로 제한)
*/
function clamp(number: number, min: number, max: number) {
return Math.min(max, Math.max(min, number));
}</li>
</ul>
<p>/**</p>
<ul>
<li>CSS sizes 속성 문자열을 개별 조건-값 쌍으로 분리합니다.</li>
<li></li>
<li>sizes 속성은 쉼표로 구분된 미디어 조건과 크기 값의 목록입니다.</li>
<li>이 함수는 각 항목을 트림하고 빈 항목을 필터링합니다.</li>
<li></li>
<li>@param sizes - CSS sizes 속성 문자열 (예: &quot;(max-width: 768px) 100vw, 50vw&quot;)</li>
<li>@returns 분리된 sizes 항목 배열</li>
<li></li>
<li>@example</li>
<li>splitSizes(&quot;(max-width: 768px) 100vw, 50vw&quot;)</li>
<li>// =&gt; [&quot;(max-width: 768px) 100vw&quot;, &quot;50vw&quot;]
*/</li>
</ul>
<p>function splitSizes(sizes: string) {
return sizes
.split(&quot;,&quot;)
.map((part) =&gt; part.trim())
.filter(Boolean);
}</p>
<p>/**</p>
<ul>
<li>주어진 미디어 조건이 현재 뷰포트 너비에 맞는지 확인합니다.</li>
<li></li>
<li>현재 지원하는 미디어 조건:</li>
<li>
<ul>
<li><code>(max-width: Npx)</code>: 뷰포트가 N 이하일 때 true</li>
</ul>
</li>
<li>
<ul>
<li><code>(min-width: Npx)</code>: 뷰포트가 N 이상일 때 true</li>
</ul>
</li>
<li></li>
<li>@param media - 미디어 조건 문자열 (예: &quot;(max-width: 768px)&quot;)</li>
<li>@param viewportWidth - 현재 뷰포트 너비 (CSS 픽셀)</li>
<li>@returns 미디어 조건이 일치하면 true, 아니면 false</li>
<li></li>
<li>@example</li>
<li>matchesMediaCondition(&quot;(max-width: 768px)&quot;, 500) // =&gt; true (500 &lt;= 768)</li>
<li>matchesMediaCondition(&quot;(max-width: 768px)&quot;, 1024) // =&gt; false (1024 &gt; 768)</li>
<li>matchesMediaCondition(&quot;(min-width: 768px)&quot;, 1024) // =&gt; true (1024 &gt;= 768)
<em>/
function matchesMediaCondition(media: string, viewportWidth: number) {
const normalized = media.trim().replace(/^(/, &quot;&quot;).replace(/)$/, &quot;&quot;);
const match = normalized.match(/^(max|min)-width\s</em>:\s*(\d+)px$/);</li>
</ul>
<p>if (!match) return false;</p>
<p>const [, type, value] = match;
const width = Number(value);</p>
<p>if (Number.isNaN(width)) return false;</p>
<p>return type === &quot;max&quot; ? viewportWidth &lt;= width : viewportWidth &gt;= width;
}</p>
<p>/**</p>
<ul>
<li>CSS 크기 값을 뷰포트 대비 비율(scale)로 변환합니다.</li>
<li></li>
<li>지원하는 단위:</li>
<li>
<ul>
<li><code>vw</code>: 뷰포트 너비의 백분율 (예: &quot;50vw&quot; → 0.5)</li>
</ul>
</li>
<li>
<ul>
<li><code>px</code>: 고정 픽셀 값을 뷰포트 대비 비율로 변환 (예: 뷰포트 1000px에서 &quot;500px&quot; → 0.5)</li>
</ul>
</li>
<li>
<ul>
<li><code>100%</code>: 전체 너비 (→ 1)</li>
</ul>
</li>
<li></li>
<li>@param size - CSS 크기 값 문자열 (예: &quot;50vw&quot;, &quot;500px&quot;, &quot;100%&quot;)</li>
<li>@param viewportWidth - 현재 뷰포트 너비 (CSS 픽셀, px 단위 계산에 사용)</li>
<li>@returns 뷰포트 대비 비율 (0~1). 파싱 실패 시 null</li>
<li></li>
<li>@example</li>
<li>parseSizeToScale(&quot;50vw&quot;, 1000) // =&gt; 0.5</li>
<li>parseSizeToScale(&quot;500px&quot;, 1000) // =&gt; 0.5 (500 / 1000)</li>
<li>parseSizeToScale(&quot;100%&quot;, 1000) // =&gt; 1</li>
<li>parseSizeToScale(&quot;invalid&quot;, 1000) // =&gt; null
*/
function parseSizeToScale(size: string, viewportWidth: number) {
const trimmed = size.trim();
if (trimmed.endsWith(&quot;vw&quot;)) {
const value = Number(trimmed.replace(&quot;vw&quot;, &quot;&quot;));
if (Number.isNaN(value)) return null;
return value / 100;
}
if (trimmed.endsWith(&quot;px&quot;)) {
const value = Number(trimmed.replace(&quot;px&quot;, &quot;&quot;));
if (Number.isNaN(value)) return null;
return value / viewportWidth;
}
if (trimmed === &quot;100%&quot;) return 1;
return null;
}</li>
</ul>
<p>/**</p>
<ul>
<li>CSS sizes 속성을 파싱하여 현재 뷰포트에 맞는 scale 값을 계산합니다.</li>
<li></li>
<li>next/image의 sizes 속성과 동일한 로직으로, 현재 뷰포트 너비에 맞는</li>
<li>미디어 조건을 찾아 해당하는 크기 값을 scale로 변환합니다.</li>
<li></li>
<li>동작 방식:</li>
<li>
<ol>
<li>sizes 문자열을 쉼표로 분리</li>
</ol>
</li>
<li>
<ol start="2">
<li>각 항목에 대해 미디어 조건이 있으면 조건 매칭 확인</li>
</ol>
</li>
<li>
<ol start="3">
<li>조건이 맞는 첫 번째 항목의 크기 값을 scale로 변환</li>
</ol>
</li>
<li>
<ol start="4">
<li>미디어 조건 없는 항목은 기본값으로 사용</li>
</ol>
</li>
<li></li>
<li>@param sizes - CSS sizes 속성 문자열 (예: &quot;(max-width: 768px) 100vw, 50vw&quot;)</li>
<li>@param viewportWidth - 현재 뷰포트 너비 (CSS 픽셀)</li>
<li>@returns 뷰포트 대비 비율 (0.05~1, 기본값 1)</li>
<li></li>
<li>@example</li>
<li>// 뷰포트 500px에서 &quot;(max-width: 768px) 100vw, 50vw&quot;</li>
<li>getScaleFromSizes(&quot;(max-width: 768px) 100vw, 50vw&quot;, 500)</li>
<li>// =&gt; 1 (500 &lt;= 768이므로 &quot;100vw&quot; 적용 → 1.0)</li>
<li></li>
<li>@example</li>
<li>// 뷰포트 1024px에서 &quot;(max-width: 768px) 100vw, 50vw&quot;</li>
<li>getScaleFromSizes(&quot;(max-width: 768px) 100vw, 50vw&quot;, 1024)</li>
<li>// =&gt; 0.5 (1024 &gt; 768이므로 &quot;50vw&quot; 적용 → 0.5)
*/
export function getScaleFromSizes(
sizes: string | undefined,
viewportWidth: number,
) {
if (!sizes) return 1;
const safeViewportWidth = Math.max(1, viewportWidth);</li>
</ul>
<p>for (const part of splitSizes(sizes)) {
const match = part.match(/^(([^)]+))\s+(.+)$/);
if (match) {
const [, media, size] = match;
if (!matchesMediaCondition(<code>(${media})</code>, safeViewportWidth)) continue;
const scale = parseSizeToScale(size, safeViewportWidth);
if (scale !== null) return clamp(scale, 0.05, 1);
continue;
}</p>
<pre><code>const scale = parseSizeToScale(part, safeViewportWidth);
if (scale !== null) return clamp(scale, 0.05, 1);
</code></pre>
<p>}</p>
<p>return 1;
}</p>
<p>/**</p>
<ul>
<li>정렬된 후보 배열에서 targetWidth보다 크거나 같은 가장 작은 값을 반환합니다.</li>
<li></li>
<li>@param targetWidth - 필요한 최소 너비 (viewportWidth × DPR × scale)</li>
<li>@param candidates - 오름차순으로 정렬된 후보 너비 배열 (예: NEXT_IMAGE_DEVICE_SIZES)</li>
<li>@returns targetWidth 이상인 가장 작은 후보 값. 모든 후보보다 크면 마지막(가장 큰) 후보 반환.</li>
<li></li>
<li>@example</li>
<li>// targetWidth가 1179일 때</li>
<li>pickClosestGreaterOrEqual(1179, [640, 750, 828, 1080, 1200, 1920, 2048, 3840])</li>
<li>// =&gt; 1200 (1179보다 크거나 같은 가장 작은 값)</li>
<li></li>
<li>@example</li>
<li>// targetWidth가 5000일 때 (모든 후보보다 큼)</li>
<li>pickClosestGreaterOrEqual(5000, [640, 750, 828, 1080, 1200, 1920, 2048, 3840])</li>
<li>// =&gt; 3840 (가장 큰 후보 반환)
*/
function pickClosestGreaterOrEqual(
targetWidth: number,
candidates: readonly number[],
) {
for (const w of candidates) {
if (w &gt;= targetWidth) return w;
}
return candidates[candidates.length - 1] ?? targetWidth;
}</li>
</ul>
<p>/**</p>
<ul>
<li>현재 뷰포트와 기기 특성을 기반으로 next/image가 선택할 이미지 파라미터를 계산합니다.</li>
<li></li>
<li>next/image는 srcset에서 이미지를 선택할 때 뷰포트 너비 × DPR을 기준으로 합니다.</li>
<li>이 함수는 동일한 로직으로 프리로드할 이미지의 width를 결정하여,</li>
<li>프리로드한 이미지가 실제 next/image 요청과 일치하도록 합니다.</li>
<li></li>
<li>계산 과정:</li>
<li>
<ol>
<li>targetWidth = viewportWidth × DPR × scale</li>
</ol>
</li>
<li>
<ol start="2">
<li>NEXT_IMAGE_DEVICE_SIZES 중 targetWidth 이상인 가장 작은 값 선택</li>
</ol>
</li>
<li></li>
<li>@param options - 프리로드 파라미터 옵션</li>
<li>@param options.viewportWidth - CSS 픽셀 기준 뷰포트 너비 (window.innerWidth)</li>
<li>@param options.dpr - 디바이스 픽셀 비율 (window.devicePixelRatio). 1~3으로 제한됨. 기본값: 1</li>
<li>@param options.scale - 이미지가 차지하는 뷰포트 비율 (0~1). 기본값: 1</li>
<li>@param options.quality - 이미지 품질 (0-100). 기본값: 75</li>
<li>@returns { width, quality } - next/image API에 전달할 파라미터</li>
<li></li>
<li>@example</li>
<li>// iPhone 14 Pro: 뷰포트 393px, DPR 3, 풀스크린 이미지</li>
<li>getPreloadImageParams({ viewportWidth: 393, dpr: 3, scale: 1 })</li>
<li>// =&gt; { width: 1200, quality: 75 }</li>
<li>// 계산: 393 × 3 × 1 = 1179 → 1200 선택</li>
<li></li>
<li>@example</li>
<li>// 데스크톱: 뷰포트 1920px, DPR 1, 50% 너비 이미지</li>
<li>getPreloadImageParams({ viewportWidth: 1920, dpr: 1, scale: 0.5 })</li>
<li>// =&gt; { width: 1080, quality: 75 }</li>
<li>// 계산: 1920 × 1 × 0.5 = 960 → 1080 선택
*/
export function getPreloadImageParams({
viewportWidth,
dpr = 1,
scale = 1,
quality = PRELOAD_DEFAULT_QUALITY,
}: PreloadParamsOptions) {
const safeViewportWidth = Math.max(1, viewportWidth);
const safeDpr = clamp(dpr, 1, 3);
const targetWidth = Math.ceil(safeViewportWidth * safeDpr * scale);</li>
</ul>
<p>const width = pickClosestGreaterOrEqual(targetWidth, NEXT_IMAGE_DEVICE_SIZES);
return { width, quality };
}</p>
<p>/**</p>
<ul>
<li>Next.js Image Optimization API URL을 생성합니다.</li>
<li>@param src - 원본 이미지 URL</li>
<li>@param width - 이미지 너비 (px)</li>
<li>@param quality - 이미지 품질 (0-100)</li>
<li>@returns Next.js Image Optimization API URL</li>
<li>@example</li>
<li>buildImageUrl(&quot;https://example.com/image.jpg&quot;, 750, 50)</li>
<li>=&gt; &quot;https://yourdomain.com/_next/image?url=https%3A%2F%2Fexample.com%2Fimage.jpg&amp;w=750&amp;q=50&quot;
*/
export function buildImageUrl(src: string, width: number, quality: number) {
const encodedUrl = encodeURIComponent(src);
// 클라이언트 사이드에서는 현재 origin을 사용하여 정확한 도메인을 가져옵니다
const baseUrl =
typeof window !== &quot;undefined&quot;
? window.location.origin
: process.env.NEXT_PUBLIC_VERCEL_URL
? <code>https://${process.env.NEXT_PUBLIC_VERCEL_URL}</code>
: &quot;http://localhost:3000&quot;;</li>
</ul>
<p>const url = <code>${baseUrl}/_next/image?url=${encodedUrl}&amp;amp;w=${width}&amp;amp;q=${quality}</code>;
return url;
}</p>
<p>/**</p>
<ul>
<li>이미지 로딩을 Promise로 래핑하여 비동기적으로 처리합니다.</li>
<li></li>
<li>브라우저의 Image 객체를 사용하여 이미지를 로드하고,</li>
<li>로딩 완료/실패를 Promise로 반환합니다.</li>
<li>이를 통해 이미지 프리로드 시 async/await 또는 Promise.all 등을 사용할 수 있습니다.</li>
<li></li>
<li>@param src - 로드할 이미지의 URL</li>
<li>@returns 이미지 로딩 완료 시 resolve, 실패 시 reject되는 Promise</li>
<li></li>
<li>@example</li>
<li>// 단일 이미지 로드</li>
<li>await imagePromise(&quot;https://example.com/image.jpg&quot;);</li>
<li></li>
<li>@example</li>
<li>// 여러 이미지 병렬 로드</li>
<li>await Promise.all([</li>
<li>imagePromise(&quot;https://example.com/image1.jpg&quot;),</li>
<li>imagePromise(&quot;https://example.com/image2.jpg&quot;),</li>
<li>]);
*/
export function imagePromise(src: string): Promise&lt;void&gt; {
return new Promise((resolve, reject) =&gt; {
const img = new Image();
img.src = src;
img.onload = () =&gt; resolve();
img.onerror = () =&gt; reject();
});
}</li>
</ul>
<p>/**</p>
<ul>
<li>여러 이미지를 Next.js Image Optimization API를 통해 프리로드합니다.</li>
<li></li>
<li>이 함수는 다음 과정을 수행합니다:</li>
<li>
<ol>
<li>현재 뷰포트와 DPR을 기반으로 최적의 이미지 크기 결정</li>
</ol>
</li>
<li>
<ol start="2">
<li>sizes 속성이 제공되면 해당 scale 값 계산</li>
</ol>
</li>
<li>
<ol start="3">
<li>Next.js Image Optimization API URL 생성</li>
</ol>
</li>
<li>
<ol start="4">
<li>모든 이미지를 병렬로 로드</li>
</ol>
</li>
<li>
<ol start="5">
<li>성공한 이미지 개수 반환 (실패한 이미지는 무시)</li>
</ol>
</li>
<li></li>
<li>프리로드된 이미지는 브라우저 캐시에 저장되어,</li>
<li>이후 next/image가 동일한 URL을 요청할 때 캐시 히트됩니다.</li>
<li></li>
<li>@param srcs - 프리로드할 원본 이미지 URL 배열</li>
<li>@param options - 프리로드 옵션</li>
<li>@param options.sizes - CSS sizes 속성 (예: &quot;(max-width: 768px) 100vw, 50vw&quot;)</li>
<li>@param options.scale - 이미지가 차지하는 뷰포트 비율 (sizes보다 우선)</li>
<li>@param options.quality - 이미지 품질 (0-100)</li>
<li>@param options.viewportWidth - 뷰포트 너비 (기본값: window.innerWidth)</li>
<li>@param options.dpr - 디바이스 픽셀 비율 (기본값: window.devicePixelRatio)</li>
<li>@returns 성공적으로 프리로드된 이미지 개수</li>
<li></li>
<li>@example</li>
<li>// 기본 사용 (현재 기기 설정 자동 감지)</li>
<li>const count = await preloadImages([</li>
<li>&quot;https://example.com/image1.jpg&quot;,</li>
<li>&quot;https://example.com/image2.jpg&quot;,</li>
<li>]);</li>
<li>console.log(<code>${count}개 이미지 프리로드 완료</code>);</li>
<li></li>
<li>@example</li>
<li>// sizes 속성과 함께 사용</li>
<li>await preloadImages(imageUrls, {</li>
<li>sizes: &quot;(max-width: 768px) 100vw, 50vw&quot;,</li>
<li>quality: 80,</li>
<li>});</li>
<li></li>
<li>@example</li>
<li>// 명시적 scale 지정 (썸네일 그리드 등)</li>
<li>await preloadImages(thumbnailUrls, {</li>
<li>scale: 0.25, // 뷰포트의 25%</li>
<li>});
*/
export async function preloadImages(
srcs: string[],
options: PreloadImagesOptions = {},
): Promise&lt;number&gt; {
if (srcs.length === 0) return 0;</li>
</ul>
<p>const viewportWidth =
options.viewportWidth ??
(typeof window !== &quot;undefined&quot; ? window.innerWidth : 1200);
const dpr =
options.dpr ??
(typeof window !== &quot;undefined&quot; ? window.devicePixelRatio : 1);
const scale =
options.scale ?? getScaleFromSizes(options.sizes, viewportWidth);</p>
<p>const { width, quality } = getPreloadImageParams({
viewportWidth,
dpr,
scale,
quality: options.quality,
});</p>
<p>const promises = srcs.map((src) =&gt; {
const url = buildImageUrl(src, width, quality);
return imagePromise(url);
});</p>
<p>const results = await Promise.allSettled(promises);
return results.filter((r) =&gt; r.status === &quot;fulfilled&quot;).length;
}</code></pre></p>
