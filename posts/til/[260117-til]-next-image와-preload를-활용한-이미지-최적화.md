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
<pre class="angelscript"><code>// Next.js 기본 deviceSizes
export const NEXT_IMAGE_DEVICE_SIZES = [
  640, 750, 828, 1080, 1200, 1920, 2048, 3840,
] as const;
<p>export const PRELOAD_DEFAULT_QUALITY = 75;</code></pre></p>
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