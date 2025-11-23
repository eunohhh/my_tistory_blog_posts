<h2 data-ke-size="size26">OpenTelemetry 가이드  </h2>
<h3 data-ke-size="size23">  OpenTelemetry란?</h3>
<p data-ke-size="size16"><b>OpenTelemetry</b>(줄여서 OTel)는 앱의 <b>성능과 동작을 추적</b>하는 오픈소스 관측성(Observability) 프레임워크 입니다<br />즉, "내 앱이 어떻게 돌아가고 있는지" 실시간으로 들여다보는 도구입니다!</p>
<h3 data-ke-size="size23">  핵심 개념: 3대 Pillar</h3>
<h4 data-ke-size="size20">1. <b>Traces (추적)</b></h4>
<p data-ke-size="size16">사용자 요청이 시스템을 통과하는 전체 여정을 추적</p>
<pre class="angelscript"><code>// 예: 사용자가 상품 구매 버튼 클릭
[브라우저] 2ms &rarr; [API Gateway] 10ms &rarr; [주문 서비스] 50ms &rarr; [결제 서비스] 200ms &rarr; [DB] 30ms      
총 소요 시간: 292ms</code></pre>
<h4 data-ke-size="size20">2. <b>Metrics (지표)</b></h4>
<p data-ke-size="size16">시스템 상태를 숫자로 측정</p>
<pre class="angelscript"><code>// 예시 지표들
- 초당 요청 수: 1,234 req/s
- 평균 응답 시간: 145ms
- CPU 사용률: 67%
- 메모리 사용량: 2.3GB
- 에러율: 0.02%</code></pre>
<h4 data-ke-size="size20">3. <b>Logs (로그)</b></h4>
<p data-ke-size="size16">이벤트 기록 (하지만 구조화된 방식으로)</p>
<pre class="dts"><code>{
  timestamp: "2024-01-20T10:30:45Z",
  level: "ERROR",
  traceId: "abc123",  // Trace와 연결!
  spanId: "def456",
  message: "Payment failed",
  userId: "user_789",
  amount: 50000
}</code></pre>
<h3 data-ke-size="size23">  실제 사용 예시</h3>
<h4 data-ke-size="size20">Next.js에서 OpenTelemetry 설정</h4>
<pre class="javascript"><code>// instrumentation.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
<p>export async function register() {
if (process.env.NEXT_RUNTIME === 'nodejs') {
const sdk = new NodeSDK({
// 서비스 정보
resource: new Resource({
[SemanticResourceAttributes.SERVICE_NAME]: 'my-shop-frontend',
[SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
}),</p>
<pre><code>  // 자동 계측 (자동으로 추적!)
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // 파일 시스템은 제외
      },
    }),
  ],
});

sdk.start();
console.log('OpenTelemetry 시작!');
</code></pre>
<p>}
}</code></pre></p>
<h3 data-ke-size="size23">  실전 활용: 전자상거래 시나리오</h3>
<h4 data-ke-size="size20">1. <b>Distributed Tracing (분산 추적)</b></h4>
<pre class="reasonml"><code>// API Route: app/api/checkout/route.ts
import { trace } from '@opentelemetry/api';
<p>const tracer = trace.getTracer('checkout-service');</p>
<p>export async function POST(request: Request) {
// 전체 체크아웃 프로세스 추적 시작
return tracer.startActiveSpan('checkout', async (span) =&gt; {
try {
// 1. 재고 확인
await tracer.startActiveSpan('check-inventory', async (inventorySpan) =&gt; {
const hasStock = await checkInventory(items);
inventorySpan.setAttribute('items.count', items.length);
inventorySpan.setAttribute('has.stock', hasStock);
inventorySpan.end();
});</p>
<pre><code>  // 2. 결제 처리
  await tracer.startActiveSpan('process-payment', async (paymentSpan) =&amp;gt; {
    const result = await processPayment(amount);
    paymentSpan.setAttribute('payment.amount', amount);
    paymentSpan.setAttribute('payment.status', result.status);
    paymentSpan.end();
  });

  span.setStatus({ code: SpanStatusCode.OK });
  return NextResponse.json({ success: true });

} catch (error) {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR });
  throw error;
} finally {
  span.end();
}
</code></pre>
<p>});
}</code></pre></p>
<h4 data-ke-size="size20">2. <b>Custom Metrics (커스텀 지표)</b></h4>
<pre class="javascript"><code>import { metrics } from '@opentelemetry/api';
<p>// 미터 생성
const meter = metrics.getMeter('ecommerce-metrics');</p>
<p>// 카운터: 판매 수량
const salesCounter = meter.createCounter('sales_total', {
description: '총 판매 수량',
unit: 'items',
});</p>
<p>// 히스토그램: 결제 시간
const paymentDuration = meter.createHistogram('payment_duration', {
description: '결제 처리 시간',
unit: 'ms',
});</p>
<p>// 사용 예
export async function processOrder(order: Order) {
const startTime = Date.now();</p>
<p>try {
await processPayment(order);</p>
<pre><code>// 지표 기록
salesCounter.add(order.items.length, {
  category: order.category,
  paymentMethod: order.paymentMethod,
});

paymentDuration.record(Date.now() - startTime, {
  status: 'success',
});
</code></pre>
<p>} catch (error) {
paymentDuration.record(Date.now() - startTime, {
status: 'failed',
});
throw error;
}
}</code></pre></p>
<h3 data-ke-size="size23">  시각화: 실제로 보이는 것</h3>
<p data-ke-size="size16">OpenTelemetry 데이터는 다양한 백엔드로 전송되어 시각화됩니다:</p>
<h4 data-ke-size="size20"><b>Jaeger UI에서 보는 Trace</b></h4>
<pre class="angelscript"><code>[GET /api/products] ──────────────────── 245ms
  ├─[DB Query: products] ───── 89ms
  ├─[Cache Check] ─── 5ms
  ├─[Image CDN] ────────── 120ms
  └─[Response Format] ── 31ms</code></pre>
<h4 data-ke-size="size20"><b>Grafana에서 보는 Metrics</b></h4>
<pre class="angelscript"><code>┌─────────────────────────────────┐
│   Response Time (p99)           
│     145ms &rarr; 189ms &rarr; 134ms      
└─────────────────────────────────┘
<p>┌─────────────────────────────────┐
│   Error Rate<br>
│     0.1% ═══════════<br>
└─────────────────────────────────┘</code></pre></p>
<h3 data-ke-size="size23">  Next.js 전용 설정 예시</h3>
<pre class="javascript"><code>// lib/telemetry.ts
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerOTel } from '@vercel/otel';
<p>export function initTelemetry() {
// Vercel의 OpenTelemetry 헬퍼 사용
registerOTel({
serviceName: 'my-nextjs-app',</p>
<pre><code>// Trace를 어디로 보낼지
traceExporter: new OTLPTraceExporter({
  url: 'https://api.honeycomb.io/v1/traces',
  headers: {
    'x-honeycomb-team': process.env.HONEYCOMB_API_KEY,
  },
}),

// 샘플링 (모든 요청 추적하면 비용&amp;uarr;)
tracesSampleRate: process.env.NODE_ENV === 'production' 
  ? 0.1  // 프로덕션: 10%만
  : 1.0, // 개발: 전부
</code></pre>
<p>});
}</code></pre></p>
<h3 data-ke-size="size23">  왜 OpenTelemetry를 쓰는가?</h3>
<h4 data-ke-size="size20"><b>문제 상황</b></h4>
<pre class="awk"><code>// 사용자: "결제가 너무 느려요!"  
<p>// 개발자: &quot;어디가 느린거지?&quot;<br>
// - Next.js API Route?
// - 외부 결제 API?
// - 데이터베이스 쿼리?
// - Redis 캐시?</code></pre></p>
<h4 data-ke-size="size20"><b>OpenTelemetry로 해결</b></h4>
<pre class="angelscript"><code>// Trace 결과:
checkout-process (총 3.2초)  
  ├─ validate-cart: 50ms ✅
  ├─ check-inventory: 200ms ✅
  ├─ payment-api-call: 2,800ms ❌ (여기가 문제!)
  └─ send-confirmation: 150ms ✅</code></pre>
<h3 data-ke-size="size23">  인기 있는 백엔드 서비스</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>오픈소스 (무료)</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Jaeger</li>
<li>Zipkin</li>
<li>Grafana Tempo</li>
</ul>
</li>
<li><b>상용 서비스</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Datadog</li>
<li>New Relic</li>
<li>Honeycomb</li>
<li>AWS X-Ray</li>
</ul>
</li>
</ol>
<h3 data-ke-size="size23">  Sentry vs OpenTelemetry</h3>
<pre class="protobuf"><code>// Sentry: 에러 중심
"앱이 터졌어요!" &rarr; 에러 추적, 스택트레이스
<p>// OpenTelemetry: 성능 중심
&quot;앱이 느려요!&quot; → 병목 구간 찾기, 성능 최적화</p>
<p>// 함께 사용하면 최고!
Sentry + OpenTelemetry = 완벽한 모니터링</code></pre></p>
<h2 data-ke-size="size26">Vercel의 OpenTelemetry 통합</h2>
<p data-ke-size="size16">Vercel이 <code>@vercel/otel</code> 패키지로 Next.js 전용 OpenTelemetry 설정을 쉽게 해줌<br />Vercel이 이렇게 간편한 통합을 제공하는 이유는 <b>서버리스 환경의 복잡성</b>을 숨기고, 개발자가 비즈니스 로직에 집중할 수 있게 하기 위해서이다.<br />특히 Edge Functions, ISR, 동적 렌더링 등 Next.js의 다양한 기능을 모두 추적할 수 있는 것이 장점!</p>
<h3 data-ke-size="size23">  @vercel/otel 패키지</h3>
<h4 data-ke-size="size20">기본 설정 (공식 문서 예시)</h4>
<pre class="javascript"><code>// instrumentation.ts
import { registerOTel } from '@vercel/otel';
<p>export function register() {
registerOTel({
serviceName: 'my-nextjs-app'
});
}</code></pre></p>
<p data-ke-size="size16">이 한 줄이면 자동으로:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>✅ Next.js 라우트 추적</li>
<li>✅ fetch 요청 추적</li>
<li>✅ 데이터베이스 쿼리 추적</li>
<li>✅ 서버/클라이언트 컴포넌트 구분</li>
</ul>
<h3 data-ke-size="size23">  실제 프로덕션 설정</h3>
<pre class="javascript"><code>// instrumentation.ts
import { registerOTel } from '@vercel/otel';
<p>export function register() {
registerOTel({
serviceName: 'ecommerce-frontend',</p>
<pre><code>// 1. 어디로 데이터를 보낼까?
traceExporter: process.env.VERCEL_ENV === 'production'
  ? 'auto' // Vercel 자동 감지 (Datadog, New Relic 등)
  : 'console', // 개발 환경: 콘솔 출력

// 2. 얼마나 추적할까? (비용 관리!)
tracesSampleRate: process.env.VERCEL_ENV === 'production'
  ? 0.1  // 프로덕션: 10%만 (비용 절감)
  : 1.0, // 개발/프리뷰: 100%

// 3. 추가 정보 포함
resourceAttributes: {
  'environment': process.env.VERCEL_ENV || 'development',
  'region': process.env.VERCEL_REGION || 'unknown',
  'deployment.id': process.env.VERCEL_DEPLOYMENT_ID,
},
</code></pre>
<p>});
}</code></pre></p>
<h3 data-ke-size="size23">  Vercel 플랫폼 특화 기능</h3>
<h4 data-ke-size="size20">1. <b>자동 환경 감지</b></h4>
<pre class="less"><code>registerOTel({
  serviceName: 'my-app',
  // Vercel이 자동으로 감지!
  // - Development: 콘솔 출력
  // - Preview: Vercel 대시보드
  // - Production: 연결된 APM 서비스
});</code></pre>
<h4 data-ke-size="size20">2. <b>Edge Runtime 지원</b></h4>
<pre class="javascript"><code>export function register() {
  // Edge와 Node.js 모두 지원!
  if (process.env.NEXT_RUNTIME === 'edge') {
    registerOTel({
      serviceName: 'edge-api',
      // Edge Runtime에서도 작동!
    });
  }
}</code></pre>
<h3 data-ke-size="size23">  실전 활용 예시</h3>
<h4 data-ke-size="size20">1. <b>App Router 성능 추적</b></h4>
<pre class="javascript"><code>// app/products/[id]/page.tsx
import { trace } from '@opentelemetry/api';
<p>const tracer = trace.getTracer('product-page');</p>
<p>export default async function ProductPage({ params }) {
return tracer.startActiveSpan('render-product-page', async (span) =&gt; {
try {
// 자동으로 추적되는 것들:
const product = await fetch(<code>/api/products/${params.id}</code>); // ← 자동 추적!</p>
<pre><code>  // 커스텀 속성 추가
  span.setAttribute('product.id', params.id);
  span.setAttribute('product.category', product.category);

  return &amp;lt;ProductView product={product} /&amp;gt;;

} finally {
  span.end();
}
</code></pre>
<p>});
}</code></pre></p>
<h4 data-ke-size="size20">2. <b>API Route 모니터링</b></h4>
<pre class="javascript"><code>// app/api/checkout/route.ts
export async function POST(request: Request) {
  // @vercel/otel이 자동으로:
  // - 요청 시작/종료 시간 기록
  // - HTTP 상태 코드 추적
  // - 에러 자동 캡처
<p>const data = await request.json();</p>
<p>// 커스텀 이벤트 추가
const span = trace.getActiveSpan();
span?.addEvent('checkout-started', {
userId: data.userId,
cartValue: data.total,
});</p>
<p>// DB, 외부 API 호출도 자동 추적됨
const result = await processCheckout(data);</p>
<p>return NextResponse.json(result);
}</code></pre></p>
<h3 data-ke-size="size23">  Vercel 대시보드 통합</h3>
<pre class="less"><code>// Vercel 프로젝트 설정에서 연결 가능한 서비스들:
<p>registerOTel({
serviceName: 'my-app',
// VERCEL_OBSERVABILITY_PROVIDER 환경 변수로 자동 설정
});</p>
<p>// 지원하는 Providers:
// - Datadog (자동 연동!)
// - New Relic
// - Axiom
// - Honeycomb
// - Grafana Cloud</code></pre></p>
<h3 data-ke-size="size23">  고급 설정: 멀티 서비스 추적</h3>
<pre class="javascript"><code>// instrumentation.ts - 마이크로서비스 아키텍처
import { registerOTel } from '@vercel/otel';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
<p>export function register() {
registerOTel({
serviceName: 'frontend-gateway',</p>
<pre><code>// 다른 서비스로 전파
propagators: [new W3CTraceContextPropagator()],

// 서비스 간 추적을 위한 헤더
instrumentationConfig: {
  fetch: {
    propagateTraceHeaderCorsUrls: [
      'https://api.myapp.com/*',
      'https://auth.myapp.com/*',
    ],
  },
},
</code></pre>
<p>});
}</p>
<p>// API 호출 시 자동으로 trace 전파
const response = await fetch('https://api.myapp.com/orders', {
// traceparent 헤더가 자동 추가됨!
});</code></pre></p>
<h3 data-ke-size="size23">  실제 Trace 시각화 예시</h3>
<pre class="angelscript"><code>[Vercel Dashboard / Datadog APM에서 보이는 모습]
<p>GET /products/123 ────────────────────── 312ms
├─ getServerSideProps ──────────────── 287ms
│   ├─ fetch: GET /api/products/123 ── 145ms
│   │   └─ Prisma: findUnique ──────── 89ms
│   ├─ fetch: GET /api/reviews ─────── 98ms
│   └─ generateMetadata ────────────── 44ms
└─ React SSR ───────────────────────── 25ms</code></pre></p>
<h3 data-ke-size="size23">  비용 최적화 팁</h3>
<pre class="kotlin"><code>registerOTel({
  serviceName: 'my-app',
<p>// 1. 스마트 샘플링
tracesSampler: (samplingContext) =&gt; {
// 에러는 항상 추적
if (samplingContext.attributes?.['http.status_code'] &gt;= 500) {
return 1.0;
}
// 느린 요청 추적
if (samplingContext.attributes?.['http.duration'] &gt; 1000) {
return 0.5;
}
// 나머지는 1%만
return 0.01;
},</p>
<p>// 2. 불필요한 span 제외
instrumentationConfig: {
'@opentelemetry/instrumentation-fs': {
enabled: false, // 파일 시스템 제외
},
},
});</code></pre></p>
<h3 data-ke-size="size23">  Vercel + OpenTelemetry 베스트 프랙티스</h3>
<pre class="javascript"><code>// instrumentation.ts - 완벽한 설정
import { registerOTel } from '@vercel/otel';
<p>export function register() {
// 개발/프로덕션 자동 구분
const isDev = process.env.NODE_ENV === 'development';</p>
<p>registerOTel({
serviceName: <code>${process.env.VERCEL_PROJECT_NAME || 'nextjs-app'}</code>,</p>
<pre><code>// 환경별 설정
traceExporter: isDev ? 'console' : 'auto',
metricsExporter: isDev ? 'console' : 'auto',

// 샘플링 전략
tracesSampleRate: isDev ? 1.0 : 
  parseFloat(process.env.OTEL_SAMPLE_RATE || '0.1'),

// Vercel 메타데이터 자동 포함
resourceAttributes: {
  'vercel.env': process.env.VERCEL_ENV,
  'vercel.region': process.env.VERCEL_REGION,
  'vercel.git.commit': process.env.VERCEL_GIT_COMMIT_SHA,
  'vercel.git.branch': process.env.VERCEL_GIT_COMMIT_REF,
},
</code></pre>
<p>});</p>
<p>console.log('  OpenTelemetry 초기화 완료');
}</code></pre></p>
