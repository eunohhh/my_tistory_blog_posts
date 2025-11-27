<h1>Next.js Image 최적화 정리&nbsp; Next.js 15+ 기준</h1>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">1. Next.js Image 최적화의 동작 원리</h2>
<h3 data-ke-size="size23">빌드 타임이 아닌 런타임 최적화</h3>
<p data-ke-size="size16">Next.js Image가 빌드 타임에 <code>.next</code> 폴더에 webp 이미지를 미리 생성해둔다고 생각하는 경우가 있습니다.<br />그게 바로 저입니다... <b>실제로는 런타임에 on-demand로 최적화가 이루어 진다고 하네요.</b></p>
<pre class="angelscript"><code>요청 흐름:
1. 브라우저 &rarr; /_next/image?url=...&amp;w=800&amp;q=75 요청
2. Next.js 서버 &rarr; 원본 이미지 fetch
3. Next.js 서버 &rarr; 리사이즈 + webp/avif 변환
4. .next/cache/images/ 에 캐시 저장
5. 이후 동일 요청 &rarr; 캐시에서 즉시 응답</code></pre>
<h3 data-ke-size="size23">동작 방식</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>동적 src도 최적화 가능</b>: 런타임 처리이므로 동적 이미지 URL도 혜택을 받음</li>
<li><b>정적 페이지 필수 아님</b>: SSR, ISR, CSR 모두에서 동작</li>
<li><b>캐시 기반</b>: 첫 요청만 느리고, 이후는 캐시 히트로 빠름</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">2. 제가 오해한 부분</h2>
<h3 data-ke-size="size23">오해: 이미 webp면 최적화를 건너뛴다</h3>
<p data-ke-size="size16"><b>아님.</b><br />Next.js는 원본 포맷과 관계없이 무조건 최적화 거침.<br />이미 최적화된 webp 이미지도 재처리됩니다.</p>
<h3 data-ke-size="size23">오해: <code>new Image()</code>로 프리로드하면 Next Image도 빨라진다</h3>
<p data-ke-size="size16"><b>아님.</b><br />URL이 다르기 때문에 브라우저 캐시가 공유되지 않습니다.</p>
<pre class="groovy"><code>프리로드 URL:    https://example.com/photo.jpg
Next Image URL: /_next/image?url=https://example.com/photo.jpg&amp;w=800&amp;q=75</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">3. 상황별 최적화 전략</h2>
<h3 data-ke-size="size23">케이스 1: <code>/public</code>에 이미 최적화된 이미지</h3>
<p data-ke-size="size16"><b>증상</b>: webp로 직접 최적화한 이미지인데 Next Image가 오히려 느림<br /><b>원인</b>: 불필요한 재처리 오버헤드<br /><b>해결</b>: <code>unoptimized={true}</code> 사용</p>
<pre class="arduino"><code>// 이미 최적화된 로컬 이미지
&lt;Image 
  src="/images/optimized-hero.webp"
  alt="Hero"
  width={1200}
  height={600}
  unoptimized
/&gt;</code></pre>
<h3 data-ke-size="size23">케이스 2: 외부 이미지 (CDN, 사용자 업로드 등)</h3>
<p data-ke-size="size16"><b>증상</b>: 첫 로드가 느리고, 두 번째부터 빠름<br /><b>원인</b>: 정상 동작. 첫 요청 시 서버에서 최적화 작업 수행<br /><b>해결</b>: 서버 캐시 워밍업 (아래 섹션 참고)</p>
<h3 data-ke-size="size23">케이스 3: LCP (Largest Contentful Paint) 이미지</h3>
<p data-ke-size="size16"><b>해결</b>: <code>priority</code> prop 필수</p>
<pre class="xml"><code>&lt;Image 
  src={heroImage}
  alt="Hero"
  priority  // preload 힌트 + fetchpriority="high"
/&gt;</code></pre>
<h3 data-ke-size="size23">상황별 알아서 분기하는 래퍼 컴포넌트</h3>
<p data-ke-size="size16">상황별 자동 분기 처리:</p>
<pre class="actionscript"><code>import Image, { ImageProps } from 'next/image';
<p>interface SmartImageProps extends Omit&lt;ImageProps, 'unoptimized'&gt; {
src: string;
}</p>
<p>export function SmartImage({ src, width, ...props }: SmartImageProps) {
const isAlreadyOptimized =
src.endsWith('.webp') ||
src.endsWith('.avif') ||
src.includes('imagecdn.com') ||
src.includes('cloudinary.com');</p>
<p>const isSmallImage = typeof width === 'number' &amp;&amp; width &lt; 100;
const isSvg = src.endsWith('.svg');</p>
<p>const skipOptimization = isAlreadyOptimized || isSmallImage || isSvg;</p>
<p>return (
&lt;Image
src={src}
width={width}
unoptimized={skipOptimization}
{...props}
/&gt;
);
}</code></pre></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">4. 서버 캐시 워밍업으로 첫 방문자도 빠르게</h2>
<h3 data-ke-size="size23">문제 상황</h3>
<p data-ke-size="size16">외부 이미지의 경우 첫 방문자는 항상 최적화 대기 시간을 겪습니다.<br />브라우저 캐시는 같은 유저의 재방문에만 효과가 있고,<br />서버 캐시가 비어있으면 모든 신규 방문자가 느린 첫 로드를 경험합니다.</p>
<h3 data-ke-size="size23">해결: 배포 후 캐시 워밍업</h3>
<h4 data-ke-size="size20">워밍업 스크립트</h4>
<pre class="javascript"><code>// scripts/warmup-images.ts
<p>const BASE_URL = process.env.SITE_URL || 'http://localhost:3000';</p>
<p>// 워밍업할 이미지 목록
const IMAGES_TO_WARM = [
'https://external-cdn.com/hero-image.jpg',
'https://external-cdn.com/product-1.jpg',
'https://external-cdn.com/product-2.jpg',
// 동적으로 가져올 수도 있음
];</p>
<p>// Next.js 기본 deviceSizes + imageSizes
const WIDTHS = [640, 750, 828, 1080, 1200, 1920];
const QUALITY = 75;</p>
<p>async function warmupImage(src: string, width: number): Promise&lt;void&gt; {
const url = <code>${BASE_URL}/_next/image?url=${encodeURIComponent(src)}&amp;amp;w=${width}&amp;amp;q=${QUALITY}</code>;</p>
<p>try {
const response = await fetch(url);
if (response.ok) {
console.log(<code>✓ Warmed: ${src} @ ${width}w</code>);
} else {
console.error(<code>✗ Failed: ${src} @ ${width}w - ${response.status}</code>);
}
} catch (error) {
console.error(<code>✗ Error: ${src} @ ${width}w -</code>, error);
}
}</p>
<p>async function warmup(): Promise&lt;void&gt; {
console.log('  Starting image cache warmup...\n');</p>
<p>const tasks: Promise&lt;void&gt;[] = [];</p>
<p>for (const src of IMAGES_TO_WARM) {
for (const width of WIDTHS) {
tasks.push(warmupImage(src, width));
}
}</p>
<p>// 동시 요청 제한 (서버 부하 방지)
const CONCURRENCY = 5;
for (let i = 0; i &lt; tasks.length; i += CONCURRENCY) {
await Promise.all(tasks.slice(i, i + CONCURRENCY));
}</p>
<p>console.log('\n✅ Warmup complete!');
}</p>
<p>warmup();</code></pre></p>
<h4 data-ke-size="size20">실행 방법</h4>
<pre class="mipsasm"><code># 로컬 테스트
pnpm build &amp;&amp; pnpm start &amp;
sleep 5  # 서버 시작 대기
npx tsx scripts/warmup-images.ts
<h1>또는 package.json에 추가</code></pre></h1>
<pre class="json"><code>{
  "scripts": {
    "warmup": "tsx scripts/warmup-images.ts",
    "start:warmed": "next start &amp; sleep 5 &amp;&amp; npm run warmup"
  }
}</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">5. 배포 환경별 설정</h2>
<h3 data-ke-size="size23">Vercel</h3>
<p data-ke-size="size16">Vercel은 이미지 최적화가 Edge에서 자동 처리되고 글로벌 CDN 캐시가 포함됨.<br />별도 설정 없이 최적의 성능을 얻을 수 있음.</p>
<p data-ke-size="size16">필요한 경우 수동으로 배포시 워밍업 로직을 실행하게 할 수는 있음...</p>
<p data-ke-size="size16"><b>GitHub Actions</b></p>
<pre class="yaml"><code># .github/workflows/warmup.yml
name: Image Cache Warmup
<p>on:
deployment_status:</p>
<p>jobs:
warmup:
if: github.event.deployment_status.state == 'success'
runs-on: ubuntu-latest
steps:
- uses: actions/checkout@v4</p>
<pre><code>  - name: Setup Node
    uses: actions/setup-node@v4
    with:
      node-version: '20'

  - name: Install dependencies
    run: npm install

  - name: Wait for deployment to stabilize
    run: sleep 30

  - name: Run warmup script
    env:
      SITE_URL: ${{ github.event.deployment_status.target_url }}
    run: npx tsx scripts/warmup-images.ts&lt;/code&gt;&lt;/pre&gt;
</code></pre>
<h3 data-ke-size="size23">Docker (Cloud Run, ECS, etc.)</h3>
<p data-ke-size="size16">컨테이너 환경에서는 추가 고려사항이 있습니다.</p>
<h4 data-ke-size="size20">1. 캐시 영속성 문제</h4>
<p data-ke-size="size16">컨테이너 재시작 시 <code>.next/cache/images/</code> 캐시가 사라집니다.</p>
<p data-ke-size="size16"><b>해결</b>: 볼륨 마운트 또는 외부 캐시</p>
<pre class="dts"><code># docker-compose.yml
services:
  web:
    image: your-nextjs-app
    volumes:
      - image-cache:/app/.next/cache/images
<p>volumes:
image-cache:</code></pre></p>
<h4 data-ke-size="size20">2. 스케일아웃 시 캐시 분산</h4>
<p data-ke-size="size16">여러 인스턴스가 각자 캐시를 갖게 됩니다.</p>
<p data-ke-size="size16"><b>해결</b>: CDN을 앞에 배치</p>
<pre class="sqf"><code>사용자 &rarr; CloudFront/Cloud CDN &rarr; Container
         (/_next/image/* 캐시)</code></pre>
<h4 data-ke-size="size20">3. Dockerfile에 워밍업 포함</h4>
<pre class="dockerfile"><code>FROM node:20-alpine AS runner
<p>WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY scripts/warmup-images.ts ./scripts/</p>
<h1>헬스체크 + 워밍업 엔트리포인트</h1>
<p>COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh</p>
<p>EXPOSE 3000
ENTRYPOINT [&quot;./docker-entrypoint.sh&quot;]</code></pre></p>
<pre class="bash"><code>#!/bin/bash
# docker-entrypoint.sh

# Next.js 서버 시작 (백그라운드)
node server.js &amp;

# 서버 준비 대기
until curl -s http://localhost:3000/api/health &gt; /dev/null; do
  sleep 1
done

# 캐시 워밍업
npx tsx scripts/warmup-images.ts

# 포그라운드로 전환
wait</code></pre>
<h3 data-ke-size="size23">외부 이미지 최적화 서비스 활용</h3>
<p data-ke-size="size16">Next.js 내장 최적화 대신 전문 서비스를 사용하면 인프라 복잡도를 줄일 수 있다는데,, 아직 해보질 못했네</p>
<pre class="typescript"><code>// next.config.ts
import type { NextConfig } from 'next';
<p>const config: NextConfig = {
images: {
loader: 'custom',
loaderFile: './lib/image-loader.ts',
},
};</p>
<p>export default config;</code></pre></p>
<pre class="typescript"><code>// lib/image-loader.ts
interface ImageLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudinaryLoader({ 
  src, 
  width, 
  quality = 75 
}: ImageLoaderParams): string {
  // Cloudinary 예시
  const params = [
    'f_auto',
    'c_limit',
    `w_${width}`,
    `q_${quality}`,
  ];
  return `https://res.cloudinary.com/your-cloud/image/fetch/${params.join(',')}/${encodeURIComponent(src)}`;
}</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">정리: 상황별 체크리스트</h2>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>상황</th>
<th>권장 설정</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>/public</code> 폴더의 이미 최적화된 이미지</td>
<td><code>unoptimized={true}</code></td>
</tr>
<tr>
<td>외부 이미지, 성능 중요</td>
<td>서버 캐시 워밍업 적용</td>
</tr>
<tr>
<td>LCP 이미지 (Hero, 메인 배너 등)</td>
<td><code>priority</code> prop 추가</td>
</tr>
<tr>
<td>아이콘, 작은 이미지 (&lt; 100px)</td>
<td><code>unoptimized={true}</code></td>
</tr>
<tr>
<td>SVG 이미지</td>
<td><code>unoptimized={true}</code></td>
</tr>
<tr>
<td>Vercel 배포</td>
<td>GitHub Actions 워밍업</td>
</tr>
<tr>
<td>Docker 배포</td>
<td>CDN + 볼륨 마운트 + 엔트리포인트 워밍업</td>
</tr>
</tbody>
</table>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">참고 자료</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://nextjs.org/docs/app/building-your-application/optimizing/images">Next.js Image Optimization 공식 문서</a></li>
<li><a href="https://nextjs.org/docs/app/api-reference/components/image">next/image API Reference</a></li>
<li><a href="https://vercel.com/docs/image-optimization">Vercel Image Optimization</a></li>
</ul>