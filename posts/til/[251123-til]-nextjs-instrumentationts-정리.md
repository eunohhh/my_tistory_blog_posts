<h2 data-ke-size="size26">Next.js Instrumentation 정리</h2>
<h3 data-ke-size="size23">  Instrumentation이란?</h3>
<p data-ke-size="size16"><b>Instrumentation</b>은 Next.js 13.2부터 도입된 기능으로, 앱이 <b>시작될 때 딱 한 번</b> 실행되는 초기화 코드를 위한 특별한 파일입니다.</p>
<pre class="javascript"><code>// app/instrumentation.ts 또는 src/instrumentation.ts
export async function register() {
  // 서버가 부팅될 때 실행되는 코드
  console.log('Next.js 앱이 시작됩니다!');
}</code></pre>
<h3 data-ke-size="size23">  주요 특징</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>실행 시점</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>서버가 처음 시작될 때</li>
<li>Cold start 시 (서버리스 환경)</li>
<li>모든 환경(Node.js, Edge, Client)에서 각각 한 번씩</li>
</ul>
</li>
<li><b>실행 환경 구분</b></li>
</ol>
<pre id="code_1763892268658" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// instrumentation.ts - 서버용
// instrumentation-client.ts - 브라우저용 (별도 파일!)
export async function register() {
      // 서버 사이드 (Node.js)
      if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('Node.js 서버 시작!');
      }
<pre><code>  // Edge Runtime (Middleware, Edge API)
  if (process.env.NEXT_RUNTIME === 'edge') {
    console.log('Edge Runtime 시작!');
  }
</code></pre>
<p>}</code></pre></p>
<h3 data-ke-size="size23">  활용 사례</h3>
<h4 data-ke-size="size20">1. <b>모니터링 도구 초기화</b> (가장 일반적)</h4>
<pre class="javascript"><code>// instrumentation.ts
import * as Sentry from '@sentry/nextjs';
<p>export async function register() {
if (process.env.NEXT_RUNTIME === 'nodejs') {
Sentry.init({
dsn: process.env.SENTRY_DSN,
// Node.js 특화 설정
});
}
}</code></pre></p>
<h4 data-ke-size="size20">2. <b>데이터베이스 연결 풀 설정</b></h4>
<pre class="javascript"><code>import { PrismaClient } from '@prisma/client';
<p>let prisma: PrismaClient;</p>
<p>export async function register() {
if (process.env.NEXT_RUNTIME === 'nodejs') {
// 글로벌 Prisma 인스턴스 생성
globalThis.prisma = new PrismaClient();
await globalThis.prisma.$connect();
console.log('DB 연결 완료');
}
}</code></pre></p>
<h4 data-ke-size="size20">3. <b>OpenTelemetry 설정</b></h4>
<pre class="javascript"><code>import { NodeSDK } from '@opentelemetry/sdk-node';
<p>export async function register() {
if (process.env.NEXT_RUNTIME === 'nodejs') {
const sdk = new NodeSDK({
serviceName: 'my-nextjs-app',
// 트레이싱 설정
});</p>
<pre><code>sdk.start();
</code></pre>
<p>}
}</code></pre></p>
<h4 data-ke-size="size20">4. <b>환경 변수 검증</b></h4>
<pre class="javascript"><code>export async function register() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'API_SECRET_KEY',
    'REDIS_URL'
  ];
<p>for (const envVar of requiredEnvVars) {
if (!process.env[envVar]) {
throw new Error(<code>필수 환경 변수 누락: ${envVar}</code>);
}
}</p>
<p>console.log('✅ 환경 변수 검증 완료');
}</code></pre></p>
<h3 data-ke-size="size23">⚙️ 설정 방법</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>next.config.js에서 활성화</b></li>
</ol>
<pre class="java"><code>// next.config.js
module.exports = {
  experimental: {
    instrumentationHook: true, // 활성화!
  },
};</code></pre>
<ol style="list-style-type: decimal;" start="2" data-ke-list-type="decimal">
<li><b>파일 생성 위치</b></li>
</ol>
<pre class="stylus"><code>프로젝트/
├── app/
│   └── instrumentation.ts        // App Router
├── src/
│   ├── instrumentation.ts        // 서버/Edge
│   └── instrumentation-client.ts // 클라이언트
└── instrumentation.ts            // Pages Router</code></pre>
<h3 data-ke-size="size23">  일반 초기화와의 차이</h3>
<h4 data-ke-size="size20">❌ 기존 방법의 문제점</h4>
<pre class="javascript"><code>// app/layout.tsx
import { initSentry } from './sentry';
<p>// 문제: 모든 요청마다 실행됨!
initSentry();</p>
<p>export default function RootLayout() {
// ...
}</code></pre></p>
<h4 data-ke-size="size20">✅ Instrumentation 장점</h4>
<pre class="javascript"><code>// instrumentation.ts
export async function register() {
  // 서버 생명주기당 한 번만 실행!
  await initSentry();
  await connectDatabase();
  await warmupCache();
}</code></pre>
<h3 data-ke-size="size23">  실행 흐름 다이어그램</h3>
<pre class="isbl"><code>서버 시작
    &darr;
instrumentation.ts register() 실행
    &darr;
런타임 체크 (nodejs/edge)
    &darr;
해당 환경 초기화 코드 실행
    &darr;
서버 준비 완료
    &darr;
요청 처리 시작
<p>브라우저 로드
↓
instrumentation-client.ts 실행
↓
클라이언트 초기화</code></pre></p>
<h3 data-ke-size="size23">  실전 팁</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>무거운 작업은 비동기로</b></li>
</ol>
<pre class="javascript"><code>export async function register() {
  // 병렬 처리로 부팅 시간 단축
  await Promise.all([
    initDatabase(),
    initCache(),
    initMonitoring(),
  ]);
}</code></pre>
<ol style="list-style-type: decimal;" start="2" data-ke-list-type="decimal">
<li><b>에러 처리 필수</b></li>
</ol>
<pre class="awk"><code>export async function register() {
  try {
    await riskyInitialization();
  } catch (error) {
    console.error('초기화 실패:', error);
    // 앱이 시작되지 않도록 할 수도 있음
    process.exit(1);
  }
}</code></pre>
<ol style="list-style-type: decimal;" start="3" data-ke-list-type="decimal">
<li><b>개발/프로덕션 분기</b></li>
</ol>
<pre class="javascript"><code>export async function register() {
  if (process.env.NODE_ENV === 'development') {
    // 개발 전용 도구
    const { setupDevTools } = await import('./dev-tools');
    setupDevTools();
  }
}</code></pre>