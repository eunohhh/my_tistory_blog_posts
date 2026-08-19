<h2 data-ke-size="size26">Effect-TS 개론: Parse, don't validate 에서 Effect 생태계까지</h2>
<h3 data-ke-size="size23">TL;DR</h3>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><code>Promise&lt;T&gt;</code> 는 성공 채널만 타입에 있고 실패 채널이 없다.<br />Effect 는 <b>성공&middot;실패&middot;의존성</b>을 전부 타입에 새긴다.<br />그 사상의 뿌리는 "검증(validate)이 아니라 파싱(parse)하라"에 있다.</p>
</blockquote>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">zod 로 충분하다고 느끼고 있었는데, <a href="https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/">Parse, don't validate</a> 계열의 글을 읽고</p>
<p data-ke-size="size16"><a href="https://github.com/Effect-TS/effect">Effect-TS</a> 생태계를 알게 되면서 사고방식 자체가 확장됐다.</p>
<p data-ke-size="size16">zod 도 사실 이 사상의 산물이라는 걸 뒤늦게 이해했다.<br />이 노트는 그 궤적과 실전 감각을 정리한 것.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">1. 사상의 궤적</h2>
<p data-ke-size="size16"><code>King 의 원칙 &rarr; fp-ts 학술적 구현 &rarr; zod 실용적 축약 &rarr; Effect 전방위 확장</code></p>
<h3 data-ke-size="size23">① Haskell 진영의 원전 (2019)</h3>
<p data-ke-size="size16">Alexis King, <a href="https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/">Parse, don't validate</a>.<br />핵심: <b>검증은 결과를 버리고, 파싱은 결과를 타입에 새긴다.</b></p>
<pre class="dts"><code>validate: T &rarr; boolean        // 정보 손실 (검사했다는 사실이 타입에 안 남음)
parse:    Raw &rarr; Parsed&lt;T&gt;    // 정보를 타입으로 승격</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">파싱한 순간 그 사실이 타입에 새겨지므로, 함수 시그니처만 보면 "이 값은 이미 검증됐다"가 컴파일러에 의해 보증된다.</p>
<p data-ke-size="size16"><code>if (user.email)</code> 같은 방어적 검사를 반복할 필요가 없어진다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>shotgun parsing</b><br />King 이 지적한 안티패턴. 검증이 여기저기 흩어져 있고 그중 어느 것도 타입에 기억되지 않는 상태.<br />서로 다른 세 파일에서 같은 걸 검사하는 세 번째 방어적 <code>if</code> 를 추가하고 있다면,<br /><b>파싱했어야 할 곳에서 검증한 것이다.</b></p>
</blockquote>
<h3 data-ke-size="size23">② fp-ts 시대 (2017~)</h3>
<p data-ke-size="size16">Giulio Canti 의 <a href="https://github.com/gcanti/fp-ts">fp-ts</a> / <a href="https://github.com/gcanti/io-ts">io-ts</a> 가 TS 진영에 <code>Either</code>, <code>Option</code>, <code>Task</code> 같은 ADT 를 본격 도입.<br />io-ts 의 <code>Codec</code> 은 사실상 "파서이자 타입 정의".<br />다만 <code>pipe</code>, <code>chain</code>, <code>Kleisli</code> 같은 학습 곡선 때문에 대중화엔 한계.</p>
<h3 data-ke-size="size23">③ zod 의 실용주의 (2020~)</h3>
<p data-ke-size="size16">Colin McDonnell 의 zod 는 fp-ts/io-ts 의 사고방식을 <b>FP 용어 없이</b> 풀어낸 것.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>safeParse</code> 가 반환하는 <code>{ success, data } | { success, error }</code> = 사실상 <code>Either</code> 의 변장</li>
<li><code>.brand()</code> = King 이 말한 phantom type 그대로</li>
</ul>
<p data-ke-size="size16">zod 가 폭발적으로 퍼진 이유: parse, don't validate 의 정수만 가져오고 FP 개념은 숨겼기 때문.</p>
<h3 data-ke-size="size23">④ Effect-TS 의 야망 (2023~)</h3>
<p data-ke-size="size16">fp-ts 핵심 기여자들이 fp-ts 를 흡수하며 만든 것.<br />Scala 의 ZIO 에서 영감. 파싱뿐 아니라 <b>비동기&middot;에러&middot;의존성 주입&middot;동시성&middot;리소스 관리&middot;옵저버빌리티</b>까지 전부 타입 시스템에 올리는 걸 목표로 한다.</p>
<p data-ke-size="size16">생태계 규모 (2026-08 기준, GitHub <code>Effect-TS/effect</code>):</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>⭐ 약 14.3k, 릴리스 1만 건 이상</li>
<li><code>@effect/sql</code>, <code>@effect/rpc</code>, <code>@effect/opentelemetry</code>, <code>@effect/cluster</code>, <code>@effect/workflow</code>, <code>@effect/ai</code> 등 생태계 자체를 지향</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">2. zod 로 "충분한" 영역과 "부족한" 영역</h2>
<p data-ke-size="size16">대부분의 프론트엔드 시나리오에서는 zod 가 정답이다. 하지만 경계가 있다.</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>zod 가 잘 다루는 것</th>
<th>zod 가 잘 못 다루는 것</th>
</tr>
</thead>
<tbody>
<tr>
<td>외부 입력(API 응답, form, URL params) 파싱</td>
<td>파싱 <i>이후</i> 비즈니스 로직 에러를 타입에 새기기</td>
</tr>
<tr>
<td>스키마 &rarr; 타입 추론 (<code>z.infer</code>)</td>
<td>비동기 작업의 실패 모드를 타입으로 추적</td>
</tr>
<tr>
<td>브랜딩으로 "검증된 값" 타입 분리</td>
<td>의존성(서비스&middot;로거&middot;DB)을 타입에 새기기</td>
</tr>
<tr>
<td>&nbsp;</td>
<td>재시도&middot;타임아웃&middot;동시성을 합성 가능하게 표현</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">우측 열이 필요해지는 순간 Effect 가 등장한다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">3. Effect 의 핵심: 세 채널을 가진 함수</h2>
<p data-ke-size="size16">가장 중요한 단일 개념은 <code>Effect&lt;A, E, R&gt;</code>.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>A</b> &mdash; 성공 시 반환 타입</li>
<li><b>E</b> &mdash; 실패 시 에러 타입 (열거된 union)</li>
<li><b>R</b> &mdash; 필요한 의존성 타입</li>
</ul>
<pre class="reasonml"><code>// Promise: 에러가 타입에 없음. 무엇이 throw되는지 시그니처만 봐선 모름
async function fetchUser(id: string): Promise&lt;User&gt;
<p>// Effect: 에러도, 의존성도 시그니처에 노출
const fetchUser: (id: string) =&gt;
Effect&lt;User, NotFoundError | NetworkError, HttpClient&gt;</code></pre></p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>"Promise 는 약속이 되지 못한다"</b><br /><code>Promise&lt;Reel&gt;</code> 은 "Reel 을 줄 수도 있고, <b>무언가</b>가 throw 될 수도 있다"인데 그 "무언가"가 타입에 없다. catch 가 <code>unknown</code> 인 게 그 증거.<br />이는 King 이 말한 *"검증기의 실패 모드는 예외이고, 예외는 타입 시스템에 보이지 않는다"* 와 정확히 같은 문제다.<br />Promise 는 성공 채널만 타입에 있고 실패 채널이 없다. Effect 의 <code>E</code> 채널이 이걸 메운다.</p>
</blockquote>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">4. 실전 예제 - 스크래퍼 파이프라인</h2>
<p data-ke-size="size16">"Instagram 트렌딩 릴 크롤링 &rarr; 파싱 &rarr; DB 적재 &rarr; 실패 시 재시도" 파이프라인.</p>
<h3 data-ke-size="size23">4-1. zod 로 충분한 케이스 (단순 검증)</h3>
<pre class="cs"><code>import { z } from "zod";
<p>const InstagramReelSchema = z.object({
id: z.string(),
shortcode: z.string(),
viewCount: z.number().int().nonnegative(),
ownerUsername: z.string(),
takenAt: z.coerce.date(),
});
type InstagramReel = z.infer&lt;typeof InstagramReelSchema&gt;;</p>
<p>// 이 정도면 Effect 를 끌어올 이유가 없다. zod 충분.
async function parseReelFromRaw(raw: unknown): Promise&lt;InstagramReel&gt; {
return InstagramReelSchema.parse(raw);
}</code></pre></p>
<h3 data-ke-size="size23">4-2. Effect 가 빛나는 케이스 (합성된 파이프라인)</h3>
<pre class="scala"><code>import { Effect, Schedule, Schema, Context, Duration } from "effect";
<p>// ── 1. 스키마 (zod 대체, 같은 사고방식)
const Reel = Schema.Struct({
id: Schema.String,
shortcode: Schema.String,
viewCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
ownerUsername: Schema.String,
takenAt: Schema.Date,
});
type Reel = Schema.Schema.Type&lt;typeof Reel&gt;;</p>
<p>// ── 2. 에러를 <em>타입으로</em> 정의 (zod 엔 없는 부분)
class ScrapeError extends Schema.TaggedError&lt;ScrapeError&gt;()(
&quot;ScrapeError&quot;, { reason: Schema.String }
) {}
class DbError extends Schema.TaggedError&lt;DbError&gt;()(
&quot;DbError&quot;, { code: Schema.String }
) {}</p>
<p>// ── 3. 의존성을 <em>타입으로</em> 정의 (NestJS DI 를 타입 레벨에서)
class Browser extends Context.Tag(&quot;Browser&quot;)&lt;
Browser, { scrape: (url: string) =&gt; Effect.Effect&lt;unknown, ScrapeError&gt; }
&gt;() {}
class Db extends Context.Tag(&quot;Db&quot;)&lt;
Db, { insert: (reel: Reel) =&gt; Effect.Effect&lt;void, DbError&gt; }
&gt;() {}</p>
<p>// ── 4. 파이프라인 자체 — 시그니처가 모든 걸 말해줌
const collectReel = (url: string) =&gt;
Effect.gen(function* () {          // ← 순차적 비즈니스 로직 (async/await 자리)
const browser = yield* Browser;
const db = yield* Db;</p>
<pre><code>const raw = yield* browser.scrape(url);
const reel = yield* Schema.decodeUnknown(Reel)(raw); // ParseError 자동 합성
yield* db.insert(reel);
return reel;
</code></pre>
<p>}).pipe(                           // ← Effect 값에 횡단 관심사를 선언적으로 덧붙임
Effect.retry({
schedule: Schedule.exponential(Duration.seconds(1)),
times: 3,
}),
Effect.timeout(Duration.seconds(30)),
);</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">추론되는 시그니처:</p>
<pre class="typescript" data-ke-language="typescript"><code>Effect&lt;Reel, ScrapeError | ParseError | DbError | TimeoutException, Browser | Db&gt;</code></pre>
<blockquote data-ke-style="style2">
<p data-ke-size="size16">자동 합성이 핵심</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>Schema.decodeUnknown</code> 이 <code>ParseError</code> 를,<br /><code>Effect.timeout</code> 이 <code>TimeoutException</code> 을 자동으로 <code>E</code> 에 합친다.</li>
<li>새 단계를 추가하면 컴파일러가 알아서 <code>E</code> union 을 키운다.</li>
<li>어딘가에서 <code>Effect.catchTag("ScrapeError", ...)</code> 로 처리하면 그 시점부터 <code>E</code> 에서 <code>ScrapeError</code> 가 빠진다. &rarr; <b>에러가 처리됐는지 안 됐는지가 타입으로 추적된다.</b></li>
<li><code>R = Browser | Db</code> 도 같은 식. <code>Layer</code> 로 의존성을 주입하면 <code>R</code> 이 <code>never</code> 로 줄고, <code>R</code> 이 <code>never</code> 인 Effect 만 실제로 실행 가능. "필요한 의존성이 다 채워졌다"가 타입으로 강제된다.</li>
</ul>
</blockquote>
<h3 data-ke-size="size23">4-3. 같은 코드의 Promise/zod 버전 (비교)</h3>
<pre class="typescript"><code>async function collectReel(url: string): Promise&lt;Reel&gt; {
  for (let attempt = 0; attempt &lt; 3; attempt++) {
    try {
      const raw = await Promise.race([
        browser.scrape(url),
        new Promise&lt;never&gt;((_, rej) =&gt;
          setTimeout(() =&gt; rej(new Error("timeout")), 30_000)
        ),
      ]);
      const reel = InstagramReelSchema.parse(raw);
      await db.insert(reel);
      return reel;
    } catch (err) {
      if (attempt === 2) throw err;     // err 의 타입은 unknown
      await new Promise(r =&gt; setTimeout(r, 1000 * 2 ** attempt));
    }
  }
  throw new Error("unreachable");
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">동작은 같지만:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>타입 시그니처 <code>Promise&lt;Reel&gt;</code> 이 <b>거짓말</b>을 한다. 실제로는 5가지 이유로 실패 가능한데 타입엔 없다.</li>
<li>재시도/타임아웃 로직이 비즈니스 로직과 <b>섞여</b> 있다.</li>
<li><code>browser</code>, <code>db</code> 가 외부 변수로 캡처돼 테스트가 까다롭다.</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">5. <code>Effect.gen</code> 과 <code>pipe</code> 의 역할 분리</h2>
<p data-ke-size="size16">둘은 다른 일을 한다. 헷갈리기 쉬우니 분리해서 기억.</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>&nbsp;</th>
<th>역할</th>
<th>대응하는 익숙한 것</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>Effect.gen</code> (제너레이터)</td>
<td>순차적 비즈니스 로직</td>
<td><code>async/await</code> (단, <code>await</code> &rarr; <code>yield*</code>)</td>
</tr>
<tr>
<td><code>pipe</code> (메서드)</td>
<td>Effect 값에 변환&middot;횡단 관심사 합성</td>
<td>RxJS <code>pipe</code>, lodash <code>_.flow</code></td>
</tr>
</tbody>
</table>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>왜 async 가 아니라 제너레이터일까?</b><br /><code>async</code> 는 항상 Promise 를 반환하도록 되어있으므로 Effect 를 못 끼워넣는다.<br />제너레이터는 런타임을 직접 통제할 수 있어서 Effect 가 자체 인터프리터로 실행한다.</p>
</blockquote>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">핵심 이점: <b>비즈니스 로직과 운영 로직(retry, timeout, 로깅, DI)이 섞이지 않는다.</b><br />Promise 버전에서 for 문과 setTimeout 이 비즈니스 로직 <i>안에</i> 들어왔던 것과 대조적.</p>
<p data-ke-size="size16">&nbsp;</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">6. 도입 판단과 순서</h2>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>솔직한 결론</b><br /><b>대부분 zod 로 충분하고, 도입한다면 신중하게.</b></p>
</blockquote>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>Effect 가 가치를 발휘하는 시나리오</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>백엔드 / 데이터 파이프라인 / 워커처럼 <i>합성</i>이 핵심인 코드</li>
<li>에러 종류가 많고 각 에러에 다른 핸들링이 필요한 경우</li>
<li>동시성&middot;재시도&middot;큐&middot;백프레셔 같은 런타임 관심사가 비즈니스 로직만큼 중요한 경우</li>
<li>팀이 함수형 사고방식에 익숙하거나 학습 의지가 있는 경우</li>
</ul>
<p data-ke-size="size16"><b>Effect 가 과한 시나리오 (대부분의 프론트엔드)</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>React + TanStack Query + zod 로 잘 굴러가는 경우</li>
<li>팀원이 1~2명이라 학습 곡선을 감당할 여유가 없을 때</li>
<li>Promise/async-await 가 충분히 표현력 있는 도메인</li>
</ul>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>NestJS 와의 충돌</b><br />NestJS 는 클래스 데코레이터 기반 DI, Effect 는 타입 레벨 Context 기반 DI.<br />둘을 섞으면 어느 쪽도 깔끔하지 않다.<br />Effect 를 진지하게 도입한다면 NestJS 를 빼고 <code>@effect/platform</code> + <code>@effect/sql</code> 로 가는 게 일관적.<br />큰 결정이므로 사이드 프로젝트에서 먼저 감을 잡을 것.</p>
</blockquote>
<h3 data-ke-size="size23">점진적 도입 4단계</h3>
<p data-ke-size="size16">각 단계에서 멈춰도 그 시점까지의 가치는 확보된다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Schema 만 zod 대체</b> &mdash; <code>effect</code> 의 <code>Schema</code> 만 써보기. 사고방식은 같고 API 모양만 다름. "Effect 글쓰기 스타일"(pipe, Schema 합성)에 익숙해지는 게 목표.</li>
<li><b>Effect 를 Promise 자리에</b> &mdash; 작은 함수 하나를 <code>async</code> &rarr; <code>Effect.gen</code> 으로. <code>Effect.runPromise</code> 로 기존 Promise 코드와 경계에서 호환. 점진적 도입 가능.</li>
<li><b>Layer 로 DI</b> &mdash; 의존성(DB&middot;HTTP 클라이언트)을 <code>Context.Tag</code> + <code>Layer</code> 로 분리. 여기서부터 진짜 Effect 스러워진다. NestJS DI 경험이 오히려 직관에 도움.</li>
<li><b>운영 관심사</b> &mdash; <code>retry</code>, <code>timeout</code>, <code>Schedule</code>, <code>Fiber</code>(동시성), <code>@effect/opentelemetry</code>(관측). OpenTelemetry 통합이 사실상 공짜로 따라온다.</li>
</ol>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">7. 더 읽을거리</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/">Parse, don't validate &mdash; Alexis King (원전)</a></li>
<li><a href="https://emewjin.github.io/parse-dont-validate-typescript/">(번역) 검증하지 말고 파싱하세요 &mdash; emewjin</a></li>
<li><a href="https://cekrem.github.io/posts/effect-without-effect-ts/">Effect-TS 없이 Effect 다루기 &mdash; cekrem</a> : 도입 전에 사고방식만 가져오기</li>
<li><a href="https://effect.website/">effect.website 공식 문서</a></li>
<li><a href="https://github.com/Effect-TS/effect">Effect-TS/effect GitHub</a></li>
</ul>