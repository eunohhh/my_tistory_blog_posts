<h2 data-ke-size="size26">Next.js에서 Gmail SMTP + nodemailer로 메일 발송하기</h2>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">1. 이 접근법의 핵심</h2>
<p data-ke-size="size16"><b>Gmail 계정 하나 + 앱 비밀번호 하나로 SMTP 발송이 끝난다.</b><br />EmailJS 같은 서드파티 SDK도, 자체 SMTP 서버 구축도, SendGrid/Resend 같은 외부 서비스 가입도 필요 없다.</p>
<p data-ke-size="size16">성립하는 이유는 세 가지다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Gmail은 그 자체가 완성된 SMTP 서버다.</b> <code>smtp.gmail.com</code>은 이미 SPF/DKIM/DMARC가 잡혀 있고 IP 평판도 확보돼 있다. 자체 SMTP를 띄웠을 때 가장 고통스러운 "메일이 스팸함으로 간다" 문제를 Google이 대신 해결해 준 상태에서 시작한다.</li>
<li><b>앱 비밀번호가 OAuth를 대체한다.</b> Gmail API를 쓰면 OAuth 동의 화면, 리프레시 토큰 관리, 토큰 만료 처리가 따라온다. 앱 비밀번호는 그냥 16자리 문자열이라 <code>.env</code>에 넣으면 끝이다.</li>
<li><b>Next.js Server Action / Route Handler는 Node.js 런타임이다.</b> 브라우저에서 SMTP를 열 수는 없지만 서버 코드에서는 그냥 TCP 소켓을 연다. 별도 백엔드 서버를 세울 이유가 없다.</li>
</ol>
<p data-ke-size="size16">즉 <b>"백엔드 없는 백엔드 메일 발송"</b> 이고, 발송량이 하루 수백 통 수준인 신청폼/문의폼/알림 메일에는 이 조합이 사실상 최적이다.</p>
<h3 data-ke-size="size23">언제 이걸 쓰면 안 되는가</h3>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>상황</th>
<th>판단</th>
</tr>
</thead>
<tbody>
<tr>
<td>신청폼, 문의폼, 관리자 알림 (하루 수십~수백 통)</td>
<td>✅ 최적</td>
</tr>
<tr>
<td>발신 도메인이 Gmail/Workspace 계정 도메인</td>
<td>✅ 최적</td>
</tr>
<tr>
<td>뉴스레터, 마케팅 대량 발송</td>
<td>❌ 일일 한도에 걸린다</td>
</tr>
<tr>
<td>발송 로그&middot;오픈율&middot;바운스 추적이 제품 요구사항</td>
<td>❌ 전용 서비스(Resend, SES 등)로</td>
</tr>
<tr>
<td>임의의 <code>from</code> 주소로 위장 발송</td>
<td>❌ Gmail이 계정 주소로 덮어쓴다</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>일일 한도(2026 기준):</b> 무료 Gmail 계정 약 500 수신자/일, Google Workspace 약 2,000 수신자/일.<br />초과하면 그날 남은 시간 동안 발송이 막힌다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">2. 사전 준비 (5분)</h2>
<h3 data-ke-size="size23">2-1. 2단계 인증 활성화</h3>
<p data-ke-size="size16">발송에 쓸 Google 계정(<a href="https://myaccount.google.com/security">https://myaccount.google.com/security</a>)에서 2단계 인증을 켠다.<br /><b>앱 비밀번호는 2단계 인증이 켜져 있어야만 메뉴가 나타난다.</b> 이게 유일한 귀찮은 단계다.</p>
<h3 data-ke-size="size23">2-2. 앱 비밀번호 발급</h3>
<p data-ke-size="size16"><a href="https://myaccount.google.com/apppasswords">https://myaccount.google.com/apppasswords</a> 에서 앱 이름을 적고<br />생성하면 <code>abcd efgh ijkl mnop</code> 형태의 16자리가 나온다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>공백은 제거하고</b> 환경변수에 넣는다 &rarr; <code>abcdefghijklmnop</code></li>
<li>화면을 닫으면 다시 볼 수 없다. 바로 <code>.env.local</code>에 붙여넣을 것</li>
<li>계정 비밀번호가 아니다. 유출돼도 앱 비밀번호만 폐기하면 계정은 안전하다</li>
</ul>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">조직 계정(Workspace)이라면 관리자가 "보안 수준이 낮은 앱" 정책이나 앱 비밀번호를 막아뒀을 수 있다.<br />메뉴 자체가 안 보이면 관리 콘솔 설정을 먼저 확인한다.</p>
</blockquote>
<h3 data-ke-size="size23">2-3. 패키지</h3>
<pre class="dockerfile"><code>pnpm add nodemailer
pnpm add -D @types/nodemailer</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">3. 환경변수 &mdash; 타입 검증까지 묶기</h2>
<pre class="arduino"><code>// src/lib/common/env.ts
export const env = createEnv({
  server: {
    GMAIL_SMTP_USER: z.email(),          // 발송 계정 주소
    GMAIL_SMTP_APP_PASSWORD: z.string().min(1), // 앱 비밀번호 16자리(공백 제거)
  },
  // ...
  emptyStringAsUndefined: true,
});</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>@t3-oss/env-nextjs</code>로 감싸는 이유는 단순 편의가 아니다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>부팅 시점에 터진다.</b> 값이 빠진 채 배포되면 첫 메일 발송에서 런타임 500이 나는 대신, 앱이 뜰 때 검증 에러로 잡힌다.</li>
<li><b><code>env.GMAIL_SMTP_USER</code>는 <code>string</code> 타입이다.</b> <code>process.env.X</code>는 <code>string | undefined</code>라 논옵셔널 단언(<code>!</code>)이 곳곳에 박히게 되는데, 그 단언들이 전부 사라진다.</li>
<li><b>클라이언트 번들 유출을 막는다.</b> <code>server</code> 블록의 값은 클라이언트 코드에서 import하면 빌드가 실패한다.</li>
</ul>
<p data-ke-size="size16"><code>.env.local</code> (절대 커밋 금지, <code>.gitignore</code> 확인):</p>
<pre class="ini"><code>GMAIL_SMTP_USER=yourmail@gmail.com
GMAIL_SMTP_APP_PASSWORD=abcdefghijklmnop</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">Vercel 배포 시에는 Project Settings &rarr; Environment Variables에 동일하게 등록한다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">4. Transporter &mdash; 싱글턴 + 타임아웃</h2>
<pre class="javascript"><code>// src/lib/register/mail.ts
import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/common/env";
<p>let transporter: Transporter | null = null;</p>
<p>function getTransporter(): Transporter {
if (!transporter) {
transporter = nodemailer.createTransport({
host: &quot;smtp.gmail.com&quot;,
port: 465,
secure: true,
auth: {
user: env.GMAIL_SMTP_USER,
pass: env.GMAIL_SMTP_APP_PASSWORD,
},
connectionTimeout: 10_000,
greetingTimeout: 10_000,
socketTimeout: 20_000,
});
}
return transporter;
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">여기 담긴 결정 네 가지.</p>
<h3 data-ke-size="size23"><code>import "server-only"</code></h3>
<p data-ke-size="size16">이 모듈이 클라이언트 컴포넌트 트리로 실수로 딸려 들어가면 <b>빌드 타임에 에러</b>가 난다.<br />SMTP 자격증명이 들어 있는 파일에는 반드시 붙인다.<br />이 한 줄이 자격증명 유출에 대한 가장 값싼 보험이다.</p>
<h3 data-ke-size="size23">모듈 스코프 싱글턴 (lazy)</h3>
<p data-ke-size="size16"><code>createTransport</code>는 커넥션 풀을 들고 있다.<br />요청마다 새로 만들면 매번 TCP + TLS 핸드셰이크를 다시 한다.<br />다만 모듈 최상단에서 즉시 생성하지 않고 <b>lazy</b>로 두는 게 중요한데,<br />그래야 이 모듈을 import하는 것만으로 SMTP 설정이 평가되지 않는다(테스트에서 특히 편하다).</p>
<h3 data-ke-size="size23"><code>port: 465, secure: true</code></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>465 / SSL(implicit TLS)</b> &mdash; 연결 순간부터 암호화. <code>secure: true</code>와 짝</li>
<li><b>587 / STARTTLS</b> &mdash; 평문으로 연결 후 업그레이드. <code>secure: false</code>와 짝</li>
</ul>
<p data-ke-size="size16">둘 다 동작한다. 465는 "평문 구간이 아예 없다"는 점에서 서버 환경 기본값으로 두기 편하다.<br />만약 호스팅 환경이 465를 막고 있다면 587 + <code>secure: false</code>로 바꾼다.</p>
<h3 data-ke-size="size23">타임아웃 3종 &mdash; 이게 진짜 핵심</h3>
<p data-ke-size="size16">기본값 상태로 두면 SMTP가 멎었을 때 nodemailer가 <b>몇 분씩 매달린다.</b></p>
<p data-ke-size="size16">10초/10초/20초로 끊으면 최악의 경우에도 20초 안에 실패로 떨어지고,<br /><code>email_log</code>에 <code>failed</code>로 남은 채 신청은 성공 응답을 받는다. **<br />매달리는 것보다 실패하는 게 낫다**는 판단이다.</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>옵션</th>
<th>의미</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>connectionTimeout</code></td>
<td>TCP 연결 수립까지</td>
</tr>
<tr>
<td><code>greetingTimeout</code></td>
<td>연결 후 서버 인사(220) 수신까지</td>
</tr>
<tr>
<td><code>socketTimeout</code></td>
<td>연결 후 소켓 무응답 허용 시간</td>
</tr>
</tbody>
</table>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">5. 발송 - 레이어 나누기</h2>
<p data-ke-size="size16">여기서부터가 "그냥 <code>sendMail</code> 호출"과 실제로 쓸 만한 코드를 가르는 부분이다. 4개 레이어로 나눈다.</p>
<pre class="isbl"><code>본문 빌더(순수함수)  &rarr;  buildMail(페이로드 조립)  &rarr;  sendAndLog(발송+기록)  &rarr;  오케스트레이터(정책)</code></pre>
<h3 data-ke-size="size23">5-1. 본문 빌더는 순수함수로</h3>
<pre class="javascript"><code>export function buildHqMailText(app: Application, openSessionDateLabel: string): string {
  return [
    `신규 신청이 접수되었습니다.`,
    ``,
    `타입: ${sessionLabel(app)}`,
    `일자: ${dateLabel(app, openSessionDateLabel)}`,
    // ...
  ].join("\n");
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">DB도 SMTP도 건드리지 않고 <b>인자만 받아 문자열을 내놓는다.</b><br />덕분에 테스트가 <code>expect(text).toContain("브랜드A")</code> 한 줄로 끝난다.</p>
<p data-ke-size="size16">특히 <b>DB에서 읽어오는 값(<code>openSessionDateLabel</code>)을 함수 안에서 조회하지 않고 인자로 주입</b>받는 점에 주목. 빌더 안에서 <code>getSetting</code>을 부르면 이 함수는 더 이상 순수하지 않고, 테스트마다 DB 목이 필요해진다.</p>
<h3 data-ke-size="size23">5-2. 페이로드 조립은 단 한 곳에서</h3>
<pre class="qml"><code>function buildMail(app, kind, openSessionDateLabel): {
  to: string; subject: string; text: string; replyTo?: string;
} {
  if (kind === "hq_notify") {
    return {
      to: HQ_MAIL_TO,
      subject: `${sessionLabel(app)} 신청 &mdash; ${app.company}`,
      text: buildHqMailText(app, openSessionDateLabel),
      replyTo: app.managerEmail,
    };
  }
  return { to: app.managerEmail, /* ... */ };
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">최초 발송 경로와 <b>어드민 수동 재발송 경로</b>가 각자 제목&middot;수신처를 만들면,<br />재발송이 원본과 미묘하게 다른 메일이 된다.<br />두 경로 모두 <code>buildMail</code>만 거치게 해서 갈라질 여지를 구조적으로 없앤다.<br />테스트로도 못 박아 둔다.</p>
<pre class="lisp"><code>it("재발송 메일은 최초 발송과 완전히 동일하다", async () =&gt; {
  expect(hqResent).toEqual(hqFirst);
});</code></pre>
<h3 data-ke-size="size23">5-3. <code>replyTo</code> 트릭</h3>
<p data-ke-size="size16"><code>from</code>과 <code>to</code>가 둘 다 자기자신인 알림 메일에서, 담당자가 그냥 "답장"을 누르면 <b>자기 자신에게 메일이 간다.</b> <code>replyTo</code>를 신청자 주소로 돌려두면 답장 버튼이 곧바로 신청자에게 연결된다.</p>
<p data-ke-size="size16">반대로 신청자에게 가는 접수확인 메일에는 <code>replyTo</code>를 넣지 않는다.<br />넣으면 신청자가 자기 자신에게 답장하게 되기 때문. <b>어느 방향의 메일이냐에 따라 다르다</b>는 게 요점이다.</p>
<h3 data-ke-size="size23">5-4. 발송 + 로깅</h3>
<pre class="javascript"><code>async function sendAndLog(db, app, kind, label): Promise&lt;boolean&gt; {
  try {
    await getTransporter().sendMail({
      from: `&lt;${env.GMAIL_SMTP_USER}&gt;`,
      ...buildMail(app, kind, label),
    });
    await logEmail(db, { applicationId: app.id, kind, status: "sent" });
    return true;
  } catch (e) {
    await logEmail(db, { applicationId: app.id, kind, status: "failed", error: String(e) });
    return false;
  }
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">두 가지가 중요하다.</p>
<p data-ke-size="size16"><b><code>from</code>은 반드시 인증 계정과 같은 주소여야 한다.</b><br /><code>"표시이름" &lt;주소&gt;</code> 형식으로 표시 이름은 자유롭게 붙일 수 있지만, 주소 자체를 다른 걸로 바꾸면 Gmail이 인증 계정 주소로 덮어쓰거나 거부한다. (Workspace에서 별칭을 "다른 주소로 메일 보내기"에 등록해 뒀다면 그 별칭은 가능하다.)</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b><code>logEmail</code>이 내부에서 예외를 삼키기 때문에</b>, <code>catch</code> 블록에 도달하는 건 오직 발송 실패뿐이다.<br />로그 기록이 실패했다고 해서 이미 나간 메일이 <code>failed</code>로 잘못 기록되는 일이 없다.</p>
<h3 data-ke-size="size23">5-5. 오케스트레이터 - 절대 throw하지 않는다</h3>
<pre class="javascript"><code>export async function sendApplicationMails(db, app): Promise&lt;void&gt; {
  try {
    const label = await readOpenSessionDateLabel(db);
    await sendAndLog(db, app, "hq_notify", label);
<pre><code>const confirmOn = (await readSettingSafely(db, SETTING_KEYS.applicantConfirmEnabled)) === &quot;true&quot;;
if (confirmOn) {
  await sendAndLog(db, app, &quot;applicant_confirm&quot;, label);
}
</code></pre>
<p>} catch (e) {
console.error(<code>[mail] 발송 오케스트레이션 실패 (application ${app.id})</code>, e);
}
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">호출부는 이렇게 생겼다.</p>
<pre class="aspectj"><code>// src/app/register/actions.ts
const outcome = await submitApplicationService(db, input);   // DB 커밋
if (!outcome.ok) return { ok: false, error: outcome.error };
<p>await sendApplicationMails(db, outcome.application);          // 메일
return { ok: true };</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>설계 원칙: DB가 source of truth이고 메일은 알림일 뿐이다.</b></p>
<p data-ke-size="size16">신청 데이터는 이미 커밋됐다.<br />이 시점에 메일이 실패했다고 사용자에게 "신청 실패"를 돌려주면 거짓말이 된다.</p>
<p data-ke-size="size16"><br />그래서 이 함수는 어떤 경로에서도 예외를 밖으로 내보내지 않는다. 방어선이 3겹이다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><code>logEmail</code> 내부 try &mdash; 로그 기록 실패 흡수</li>
<li><code>sendAndLog</code> 내부 try &mdash; 발송 실패 + <b>본문 빌더가 던지는 경우까지</b> 흡수 (예: <code>attendees</code>가 배열이 아닌 JSON이면 <code>.map</code>이 <code>TypeError</code>)</li>
<li>오케스트레이터 바깥 try &mdash; 그 밖에서 새는 모든 것</li>
</ol>
<p data-ke-size="size16"><code>readSettingSafely</code>도 같은 정신이다.<br />설정 조회는 메일 <b>문구를 고르는 부수 정보</b>일 뿐이라, DB가 흔들려도 시드 기본값으로 흡수하고 발송은 계속한다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">6. <code>email_log</code> &mdash; 실패를 보이게 만들기</h2>
<p data-ke-size="size16">메일 실패를 삼키기로 했다면, 삼킨 것이 어딘가에는 남아야 한다.</p>
<pre class="kotlin"><code>enum EmailKind   { hq_notify  applicant_confirm  @@map("email_kind") }
enum EmailStatus { sent       failed             @@map("email_status") }
<p>model EmailLog {
id            String      @id @default(dbgenerated(&quot;gen_random_uuid()&quot;)) @db.Uuid
applicationId String      @map(&quot;application_id&quot;) @db.Uuid
application   Application @relation(fields: [applicationId], references: [id])
kind          EmailKind
status        EmailStatus
error         String?
createdAt     DateTime    @default(now()) @map(&quot;created_at&quot;) @db.Timestamptz(6)</p>
<p>@@map(&quot;email_log&quot;)
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 테이블이 있으면 어드민 화면에서 "이 신청, 메일 나갔나?"를 확인할 수 있고,<br /><code>failed</code> 행에 대해 <b>수동 재발송 버튼</b>을 붙일 수 있다.</p>
<pre class="reasonml"><code>export async function resendApplicationMail(db, applicationId, kind): Promise&lt;boolean&gt; {
  const app = await db.application.findUnique({ where: { id: applicationId } });
  if (!app) return false;
  return await sendAndLog(db, app, kind, await readOpenSessionDateLabel(db));
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">재발송은 <b>토글 설정과 무관하게</b> 보낸다.<br />어드민이 그 버튼을 직접 누른 것 자체가 발송 의사이기 때문이다.<br /><code>boolean</code>을 반환하는 이유도 여기 있다.<br />자동 발송과 달리 재발송은 결과를 화면에 알려줘야 한다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><code>error</code> 컬럼에 <code>String(e)</code>를 넣어도 자격증명은 담기지 않는다.<br />nodemailer 에러 메시지는 SMTP 서버 응답 문자열이다.<br />다만 커스텀 로깅을 추가할 때는 transporter 설정 객체를 통째로 덤프하지 않도록 주의.</p>
</blockquote>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">7. 테스트 - SMTP 없이 전부 검증하기</h2>
<p data-ke-size="size16"><code>vi.mock</code>으로 nodemailer 자체를 갈아끼우면 실제 메일 발송 없이 페이로드를 전량 검증할 수 있다.</p>
<pre class="coffeescript"><code>// vi.mock은 파일 최상단으로 호이스팅된다 &mdash; 팩토리가 참조하는 변수는 vi.hoisted로 함께 끌어올린다
const { sendMailMock } = vi.hoisted(() =&gt; ({ sendMailMock: vi.fn() }));
vi.mock("nodemailer", () =&gt; ({
  default: { createTransport: vi.fn(() =&gt; ({ sendMail: sendMailMock })) },
}));</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b><code>vi.hoisted</code>가 포인트다.</b><br /><code>vi.mock</code>의 팩토리는 파일 최상단으로 끌어올려지기 때문에,<br />평범하게 선언한 <code>const sendMailMock</code>을 참조하면 TDZ 에러가 난다.<br /><code>vi.hoisted</code>로 감싸면 변수 선언도 같이 올라간다.</p>
<p data-ke-size="size16">DB는 fake 객체로 대체한다.</p>
<pre class="rust"><code>function makeFakeDb(settings, fail = {}, found = null) {
  const logs: unknown[] = [];
  const db = {
    application: { findUnique: vi.fn(async () =&gt; found) },
    appSetting: { findUnique: vi.fn(async ({ where }) =&gt; { 
        /* settings 조회 or throw */ }) },
    emailLog: { create: 
        vi.fn(async ({ data }) =&gt; { 
            logs.push(data); return data; 
            }) 
        },
  };
  return { db: db as never, logs };
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 세팅으로 커버되는 것들:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>페이로드 검증 &mdash; <code>sendMailMock.mock.calls[0][0].to</code>, <code>.subject</code>, <code>.replyTo</code>, <code>.text</code></li>
<li>토글 정책 &mdash; 접수확인 on/off에 따른 발송 횟수</li>
<li><b>실패 경로 전부</b> &mdash; SMTP 다운, <code>email_log</code> 쓰기 실패, 설정 조회 실패, 둘 다 실패, 깨진 JSON 입력. 전부 <code>resolves.not.toThrow()</code>로 못 박는다</li>
<li>최초 발송 &equiv; 재발송 동치성</li>
</ul>
<p data-ke-size="size16">실패 경로 테스트는 <code>console.error</code>를 뿜으므로 출력을 삼켜준다.</p>
<pre class="javascript"><code>function silenceConsoleError() {
  return vi.spyOn(console, "error").mockImplementation(() =&gt; {});
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">호출부(Server Action) 테스트에서는 메일 모듈 자체를 목으로 대체해,<br />"메일이 호출됐는가"만 확인하고 SMTP 관심사를 완전히 격리한다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">8. 체크리스트</h2>
<p data-ke-size="size16">새 프로젝트에 옮겨 심을 때 순서대로:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><input disabled="disabled" type="checkbox" /> 발송 계정에 2단계 인증 켜기</li>
<li><input disabled="disabled" type="checkbox" /> 앱 비밀번호 발급 &rarr; 공백 제거해서 보관</li>
<li><input disabled="disabled" type="checkbox" /> <code>pnpm add nodemailer</code> + <code>@types/nodemailer</code></li>
<li><input disabled="disabled" type="checkbox" /> <code>.env.local</code>에 <code>GMAIL_SMTP_USER</code>, <code>GMAIL_SMTP_APP_PASSWORD</code> (+ <code>.gitignore</code> 확인)</li>
<li><input disabled="disabled" type="checkbox" /> env 스키마에 두 값 추가 (t3-env 등)</li>
<li><input disabled="disabled" type="checkbox" /> 배포 플랫폼 환경변수에도 등록</li>
<li><input disabled="disabled" type="checkbox" /> 메일 모듈 최상단에 <code>import "server-only"</code></li>
<li><input disabled="disabled" type="checkbox" /> transporter는 lazy 싱글턴 + 타임아웃 3종</li>
<li><input disabled="disabled" type="checkbox" /> <code>from</code>은 인증 계정 주소로 (표시 이름만 커스텀)</li>
<li><input disabled="disabled" type="checkbox" /> 본문 빌더는 순수함수, 외부 값은 인자로 주입</li>
<li><input disabled="disabled" type="checkbox" /> 페이로드 조립은 <code>buildMail</code> 한 곳에서</li>
<li><input disabled="disabled" type="checkbox" /> 발송 실패가 사용자 요청을 죽이지 않게 (throw 금지)</li>
<li><input disabled="disabled" type="checkbox" /> 발송 결과를 <code>email_log</code>에 기록 + 재발송 경로 확보</li>
<li><input disabled="disabled" type="checkbox" /> <code>vi.mock("nodemailer")</code> + <code>vi.hoisted</code>로 테스트</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">9. 알아둘 함정</h2>
<p data-ke-size="size16"><b>서버리스 콜드 스타트.</b> 인스턴스가 새로 뜰 때마다 transporter도 새로 만들어진다.<br />싱글턴의 이득은 같은 인스턴스가 살아있는 동안만 유효하다.<br />하하 그래도 만드는 게 낫다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>Edge Runtime에서는 안 된다.</b><br />nodemailer는 Node.js <code>net</code>/<code>tls</code> 모듈이 필요하다.<br />해당 Route Handler / Server Action이 Edge로 가지 않도록 주의한다<br />(Next.js Server Action 기본값은 이제 Node.js 런타임이므로 보통 문제없다).</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b><code>await</code>를 빠뜨리지 말 것.</b><br />서버리스에서 <code>sendMail</code>을 <code>await</code> 없이 호출하면 응답 반환과 함께 인스턴스가 얼어붙어 메일이 그냥 안 나간다.<br />"가끔 안 가요"의 대부분이 이 문제다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>앱 비밀번호는 계정 비밀번호 변경 시 무효화된다.</b><br />발송이 갑자기 <code>Invalid login</code>으로 죽으면 이걸 먼저 의심한다.</p>
<p data-ke-size="size16"><b>HTML 메일이 필요하면</b> <code>sendMail</code>에 <code>html</code> 필드를 추가하되 <code>text</code>도 같이 넣는다.</p>
<p data-ke-size="size16"><br />텍스트 대체본이 없으면 스팸 점수가 올라간다.</p>
<p data-ke-size="size16"><b>첫 발송 전 <code>transporter.verify()</code></b> 로 자격증명을 확인해볼 수 있다.<br />운영 코드에 매번 넣을 필요는 없고, 로컬에서 설정을 확인할 때 유용하다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">참고</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://nitrosend.com/transactional-email/smtp-ports/gmail-smtp-settings">Gmail SMTP Settings (2026): Host, Port, App Passwords, and Limits &mdash; Nitrosend</a></li>
<li><a href="https://serversmtp.com/limits-of-gmail-smtp-server/">Gmail SMTP 2026: Sending Limits, Restrictions &amp; Auth Changes</a></li>
<li>Google 앱 비밀번호 발급: <a href="https://myaccount.google.com/apppasswords">https://myaccount.google.com/apppasswords</a></li>
</ul>