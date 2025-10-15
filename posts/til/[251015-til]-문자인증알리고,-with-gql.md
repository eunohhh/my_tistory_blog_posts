<h3>0. 아래와 같은 Auth.js 기본 세팅 + apollo 세팅은 되어있다는 가정</h3>
<pre><code class="language-tsx">// lib/auth.ts
import NextAuth from &quot;next-auth&quot;;
import Google from &quot;next-auth/providers/google&quot;;
import { HasuraAdapter } from &quot;@auth/hasura-adapter&quot;;
import { JWT } from &quot;next-auth/jwt&quot;;
<p>declare module &quot;next-auth/jwt&quot; {
interface JWT {
id: string;
role: string;
}
}</p>
<p>export const { handlers, signIn, signOut, auth } = NextAuth({
adapter: HasuraAdapter({
endpoint: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL!,
adminSecret: process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
}),
providers: [
Google({
clientId: process.env.AUTH_GOOGLE_ID!,
clientSecret: process.env.AUTH_GOOGLE_SECRET!,
}),
],
session: {
strategy: &quot;jwt&quot;,
maxAge: 30 * 24 * 60 * 60, // 30일
},
callbacks: {
async jwt({ token, user, account }) {
// 초기 로그인 시
if (user) {
token.id = user.id;
token.email = user.email;
token.role = &quot;user&quot;; // 기본 역할
// Hasura에 사용자 정보 저장
await createOrUpdateUser({
id: user.id,
email: user.email!,
name: user.name,
image: user.image,
});
}
return token;
},
async session({ session, token }) {
if (token &amp;&amp; session.user) {
session.user.id = token.id;
session.user.role = token.role;
session.user.email = token.email!;
}
return session;
},
},
});</p>
<p>// app/api/auth/[...nextauth]/route.ts
import { handlers } from &quot;@/lib/auth&quot;;</p>
<p>export const { GET, POST } = handlers;</code></pre></p>
<h3>1. 릴레이션 테이블 필요할 듯? 대략 이런 느낌</h3>
<pre><code class="language-sql">-- SMS 인증 코드 테이블
CREATE TABLE sms_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_phone_code (phone, code),
  INDEX idx_expires (expires_at)
);</code></pre>
<h3>2. 알리고 가입하고, 키 받기, 환경변수</h3>
<pre><code class="language-bash"># SMS 서비스 (알리고 예시)
ALIGO_API_KEY=your-aligo-api-key
ALIGO_USER_ID=your-aligo-user-id
ALIGO_SENDER=01012345678  # 발신번호</code></pre>
<h3>3. 6자리 인증번호 생성 유틸 함수 작성</h3>
<pre><code class="language-tsx">import crypto from &quot;crypto&quot;;
<p>// 6자리 인증번호 생성
export function generateVerificationCode(): string {
return crypto.randomInt(100000, 999999).toString();
}</code></pre></p>
<h3>4. 알리고 api 사용한 문자 전송 함수 작성(<a href="https://apis.aligo.in/send/">https://apis.aligo.in/send/</a>) <a href="https://smartsms.aligo.in/smsapi.html">https://smartsms.aligo.in/smsapi.html</a></h3>
<pre><code class="language-tsx">// 알리고 SMS 발송
export async function sendSMS(phone: string, message: string) {
  const formData = new URLSearchParams({
    key: process.env.ALIGO_API_KEY!,
    user_id: process.env.ALIGO_USER_ID!,
    sender: process.env.ALIGO_SENDER!,
    receiver: phone,
    msg: message,
    testmode_yn: process.env.NODE_ENV === &quot;development&quot; ? &quot;Y&quot; : &quot;N&quot;,
  });
<pre><code>// 발송 api POST 요청
</code></pre>
<p>try {
const response = await fetch(&quot;&lt;https://apis.aligo.in/send/&gt;&quot;, {
method: &quot;POST&quot;,
headers: {
&quot;Content-Type&quot;: &quot;application/x-www-form-urlencoded&quot;,
},
body: formData,
});</p>
<pre><code>const result = await response.json();

if (result.result_code !== &amp;quot;1&amp;quot;) {
  throw new Error(`SMS 발송 실패: ${result.message}`);
}

return result;
</code></pre>
<p>} catch (error) {
console.error(&quot;SMS 발송 에러:&quot;, error);
throw error;
}
}</code></pre></p>
<h3>5. send 라우트 핸들러 작성(코드, 만료시간, 알리고 api 호출 부분)</h3>
<pre><code class="language-tsx">import { gql } from &#39;@apollo/client&#39;;
<p>// 이런 식의 뮤테이션이 있다고 가정
const INSERT_VERIFICATION = gql<code>  mutation InsertVerification($phone: String!, $code: String!, $expiresAt: timestamptz!) {     insert_sms_verifications_one(object: {       phone: $phone,       code: $code,       expires_at: $expiresAt     }) {       id     }   }</code>;
// 최근 요청 확인
const CHECK_RECENT_REQUEST = gql<code>  query CheckRecentRequest($phone: String!, $since: timestamptz!) {     sms_verifications(       where: {         phone: { _eq: $phone },         created_at: { _gt: $since }       },       limit: 1     ) {       id       created_at     }   }</code>;</p>
<p>// app/api/auth/sms/send/route.ts
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { auth } from &quot;@/lib/auth&quot;;
import { generateVerificationCode, sendSMS } from &quot;@/lib/sms&quot;;
import { getClient } from '@/lib/apollo/server-client'
import { ApolloError } from '@apollo/client';</p>
<p>export async function POST(req: NextRequest) {
try {
// 1. 세션 확인
const session = await auth();</p>
<pre><code>if (!session) {
  return NextResponse.json(
    { error: &amp;quot;로그인이 필요합니다&amp;quot; },
    { status: 401 }
  );
}

// 2. 요청 데이터 파싱
const { phone } = await req.json();

// 3. 전화번호 형식 검증
const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
if (!phoneRegex.test(phone)) {
  return NextResponse.json(
    { error: &amp;quot;올바른 전화번호 형식이 아닙니다&amp;quot; },
    { status: 400 }
  );
}

// 4. 하이픈 제거
const cleanPhone = phone.replace(/-/g, &amp;quot;&amp;quot;);

// 5. Apollo Client 가져오기
const client = getClient();

// 6. ⭐⭐ 레이트 리미팅: 1분 내 중복 요청 확인
const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

try {
  const { data: recentData } = await client.query({
    query: CHECK_RECENT_REQUEST,
    variables: { phone: cleanPhone, since: oneMinuteAgo },
    fetchPolicy: &amp;#39;network-only&amp;#39; // 캐시 사용 안 함
  });

  if (recentData.sms_verifications.length &amp;gt; 0) {
    const lastRequest = new Date(recentData.sms_verifications[0].created_at);
    const waitSeconds = Math.ceil((60000 - (Date.now() - lastRequest.getTime())) / 1000);

    return NextResponse.json(
      { error: `${waitSeconds}초 후에 다시 시도해주세요` },
      { status: 429 } // Too Many Requests
    );
  }
// ⭐⭐ 명확한 에러 응답을 바로 반환 - 중복 확인 실패는 바로 리턴해서 사용자에게 명확히 알리는게 좋음
    } catch (error) {
      console.error(&amp;quot;중복 요청 확인 에러:&amp;quot;, error);

      return NextResponse.json(
        { error: &amp;quot;요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.&amp;quot; },
        { status: 500 }
      );
    }

// 7. 인증번호 생성
const code = generateVerificationCode();
const expiresAt = new Date(Date.now() + 3 * 60 * 1000).toISOString(); // 3분

// 8. DB에 저장
try {
  await client.mutate({
    mutation: INSERT_VERIFICATION,
    variables: { phone: cleanPhone, code, expiresAt }
  });
} catch (error) {
  console.error(&amp;quot;인증번호 저장 에러:&amp;quot;, error);

  if (error instanceof ApolloError) {
    console.error(&amp;quot;GraphQL 에러:&amp;quot;, error.graphQLErrors);
    return NextResponse.json(
      { error: &amp;quot;인증번호 저장에 실패했습니다&amp;quot; },
      { status: 500 }
    );
  }

  throw error; // 예상치 못한 에러는 외부 catch로
}

// 9. SMS 발송
try {
  const message = `[서비스명] 인증번호는 [${code}]입니다. 3분 이내에 입력해주세요.`;
  await sendSMS(cleanPhone, message);
} catch (error) {
  // ⭐⭐ SMS 발송 실패했지만 DB에는 저장되어 있으므로
      // 인증번호는 유효 =&amp;gt; 재발송 API 로~~
      // 이후 클라이언트에서 적절한 재시도 UI 제공 필수
      return NextResponse.json(
        { 
          error: &amp;quot;SMS 발송에 실패했습니다&amp;quot;,
          canResend: true, // ⭐⭐ 재시도 가능 플래그
          retryEndpoint: &amp;quot;/api/auth/sms/resend&amp;quot; // ⭐⭐ 재발송 API 경로
        },
        { status: 503 }
      );
}

// 10. 성공 응답
return NextResponse.json({
  success: true,
  message: &amp;quot;인증번호가 발송되었습니다&amp;quot;,
});
</code></pre>
<p>} catch (error) {
console.error(&quot;SMS 발송 에러:&quot;, error);</p>
<pre><code>let errorMsg = &amp;quot;인증번호 발송에 실패했습니다&amp;quot;;
let statusCode = 500;

if (error instanceof ApolloError) {
  console.error(&amp;quot;GraphQL 에러:&amp;quot;, error.graphQLErrors);
  console.error(&amp;quot;Network 에러:&amp;quot;, error.networkError);

  if (error.graphQLErrors.length &amp;gt; 0) {
    errorMsg = &amp;quot;데이터베이스 오류가 발생했습니다&amp;quot;;
  }

  if (error.networkError) {
    errorMsg = &amp;quot;네트워크 오류가 발생했습니다&amp;quot;;
    statusCode = 503;
  }
}

return NextResponse.json(
  { error: errorMsg },
  { status: statusCode }
);
</code></pre>
<p>}
}</code></pre></p>
<h3>6. verify 라우트 핸들러 작성(인증)</h3>
<pre><code class="language-tsx">import { gql } from &#39;@apollo/client&#39;;
<p>// 이런식의 쿼리, 뮤테이션이 있다고 가정
// 인증번호 확인
const VERIFY_CODE_QUERY = gql<code>  query VerifyCode($phone: String!, $code: String!, $now: timestamptz!) {     sms_verifications(       where: {         phone: { _eq: $phone },         code: { _eq: $code },         verified: { _eq: false },         expires_at: { _gt: $now }  # ⭐ &amp;quot;now()&amp;quot;는 변수로 전달       },       order_by: { created_at: desc },       limit: 1     ) {       id     }   }</code>;</p>
<p>// 인증 완료 처리
const UPDATE_VERIFICATION_AND_USER = gql<code>  mutation UpdateVerificationAndUser($verificationId: uuid!, $userId: uuid!, $phone: String!) {     update_sms_verifications_by_pk(       pk_columns: { id: $verificationId },       _set: { verified: true }     ) {       id     }     update_users_by_pk(       pk_columns: { id: $userId },       _set: { phone: $phone, phone_verified: true }     ) {       id     }   }</code>;</p>
<p>// app/api/auth/sms/verify/route.ts
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { auth } from &quot;@/lib/auth&quot;;
import { ApolloError } from '@apollo/client';
import { getClient } from '@/lib/apollo/server-client'</p>
<p>export async function POST(req: NextRequest) {
try {
// 1. 세션 확인
const session = await auth();</p>
<pre><code>if (!session) {
  return NextResponse.json(
    { error: &amp;quot;로그인이 필요합니다&amp;quot; },
    { status: 401 }
  );
}

// 2. 요청 데이터 파싱
const { phone, code } = await req.json();

// 3. 입력값 검증
if (!phone || !code) {
  return NextResponse.json(
    { error: &amp;quot;전화번호와 인증번호를 입력해주세요&amp;quot; },
    { status: 400 }
  );
}

if (code.length !== 6 || !/^\\d+$/.test(code)) {
  return NextResponse.json(
    { error: &amp;quot;인증번호는 6자리 숫자여야 합니다&amp;quot; },
    { status: 400 }
  );
}

const cleanPhone = phone.replace(/-/g, &amp;quot;&amp;quot;);

// 4. Apollo Client 가져오기
const client = getClient();

// 5. 인증번호 확인
const now = new Date().toISOString();

let queryData;
try {
  const result = await client.query({
    query: VERIFY_CODE_QUERY,
    variables: { phone: cleanPhone, code, now },
    fetchPolicy: &amp;#39;network-only&amp;#39; // 캐시 무시
  });
  queryData = result.data;
} catch (error) {
  console.error(&amp;quot;인증번호 조회 에러:&amp;quot;, error);

  if (error instanceof ApolloError) {
    console.error(&amp;quot;GraphQL 에러:&amp;quot;, error.graphQLErrors);
    return NextResponse.json(
      { error: &amp;quot;인증번호 확인 중 오류가 발생했습니다&amp;quot; },
      { status: 500 }
    );
  }

  throw error;
}

// 6. 인증번호 검증
if (queryData.sms_verifications.length === 0) {
  return NextResponse.json(
    { error: &amp;quot;인증번호가 올바르지 않거나 만료되었습니다&amp;quot; },
    { status: 400 }
  );
}

const verificationId = queryData.sms_verifications[0].id;

// 7. 인증 완료 처리
try {
  await client.mutate({
    mutation: UPDATE_VERIFICATION_AND_USER,
    variables: {
      verificationId,
      userId: session.user.id,
      phone: cleanPhone,
    },
  });
} catch (error) {
  console.error(&amp;quot;인증 완료 처리 에러:&amp;quot;, error);

  if (error instanceof ApolloError) {
    console.error(&amp;quot;GraphQL 에러:&amp;quot;, error.graphQLErrors);
    return NextResponse.json(
      { error: &amp;quot;인증 처리 중 오류가 발생했습니다&amp;quot; },
      { status: 500 }
    );
  }

  throw error;
}

// 8. 성공 응답
return NextResponse.json({
  success: true,
  message: &amp;quot;인증이 완료되었습니다&amp;quot;,
});
</code></pre>
<p>} catch (error) {
console.error(&quot;인증 확인 에러:&quot;, error);</p>
<pre><code>let errorMsg = &amp;quot;인증 확인에 실패했습니다&amp;quot;;
let statusCode = 500;

if (error instanceof ApolloError) {
  console.error(&amp;quot;GraphQL 에러:&amp;quot;, error.graphQLErrors);
  console.error(&amp;quot;Network 에러:&amp;quot;, error.networkError);

  if (error.graphQLErrors.length &amp;gt; 0) {
    errorMsg = &amp;quot;데이터베이스 오류가 발생했습니다&amp;quot;;
  }

  if (error.networkError) {
    errorMsg = &amp;quot;네트워크 오류가 발생했습니다&amp;quot;;
    statusCode = 503;
  }
}

return NextResponse.json(
  { error: errorMsg },
  { status: statusCode }
);
</code></pre>
<p>}
}</code></pre></p>
<h3>7. resend 재발송 라우트 핸들러 (5. send 에서 sms 발송 실패시 클라이언트에서 retryEndpoint로 호출)</h3>
<pre><code class="language-tsx">import { gql } from &#39;@apollo/client&#39;;
<p>const GET_LATEST_CODE = gql<code>  query GetLatestCode($phone: String!, $since: timestamptz!) {     sms_verifications(       where: {         phone: { _eq: $phone },         verified: { _eq: false },         expires_at: { _gt: &amp;quot;now()&amp;quot; },         created_at: { _gt: $since }       },       order_by: { created_at: desc },       limit: 1     ) {       id       code       expires_at     }   }</code>;</p>
<p>// app/api/auth/sms/resend/route.ts
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { auth } from &quot;@/lib/auth&quot;;
import { sendSMS } from &quot;@/lib/sms&quot;;
import { getClient } from '@/lib/apollo/server-client';
import { ApolloError } from '@apollo/client';</p>
<p>export async function POST(req: NextRequest) {
try {
const session = await auth();</p>
<pre><code>if (!session) {
  return NextResponse.json(
    { error: &amp;quot;로그인이 필요합니다&amp;quot; },
    { status: 401 }
  );
}

const { phone } = await req.json();
const cleanPhone = phone.replace(/-/g, &amp;quot;&amp;quot;);

const client = getClient();

// ⭐ 최근 5분 내 생성된 인증번호 조회
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

const { data } = await client.query({
  query: GET_LATEST_CODE,
  variables: { phone: cleanPhone, since: fiveMinutesAgo },
  fetchPolicy: &amp;#39;network-only&amp;#39;
});

if (data.sms_verifications.length === 0) {
  return NextResponse.json(
    { error: &amp;quot;유효한 인증번호가 없습니다. 처음부터 다시 시도해주세요.&amp;quot; },
    { status: 404 }
  );
}

const { code, expires_at } = data.sms_verifications[0];

// ⭐ 기존 인증번호로 SMS 재발송
const message = `[서비스명] 인증번호는 [${code}]입니다. 3분 이내에 입력해주세요.`;

try {
  await sendSMS(cleanPhone, message);
} catch (error) {
  console.error(&amp;quot;SMS 재발송 에러:&amp;quot;, error);
  return NextResponse.json(
    { error: &amp;quot;SMS 재발송에 실패했습니다&amp;quot; },
    { status: 503 }
  );
}

return NextResponse.json({
  success: true,
  message: &amp;quot;인증번호가 재발송되었습니다&amp;quot;,
  expiresAt: expires_at
});
</code></pre>
<p>} catch (error) {
console.error(&quot;재발송 에러:&quot;, error);</p>
<pre><code>let errorMsg = &amp;quot;재발송에 실패했습니다&amp;quot;;
let statusCode = 500;

if (error instanceof ApolloError) {
  console.error(&amp;quot;GraphQL 에러:&amp;quot;, error.graphQLErrors);
  console.error(&amp;quot;Network 에러:&amp;quot;, error.networkError);

  if (error.graphQLErrors.length &amp;gt; 0) {
    errorMsg = &amp;quot;데이터베이스 오류가 발생했습니다&amp;quot;;
  }

  if (error.networkError) {
    errorMsg = &amp;quot;네트워크 오류가 발생했습니다&amp;quot;;
    statusCode = 503;
  }
}

return NextResponse.json(
  { error: errorMsg },
  { status: statusCode }
);
</code></pre>
<p>}
}</code></pre></p>
