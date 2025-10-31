<h1>naver 로그인 구현 with Supabase 3편</h1>
<h2 data-ke-size="size26">TL; DR: admin 권한 쓰면 끝</h2>
<p data-ke-size="size16">작년 7월에 supabase에서 편법(?) naver 로그인 기능을 구현했었습니다.<br />1년 넘게 지났는데 갑자기 편법 말고 진짜로 구현이 되겠잖아? 생각이 들었어요.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">supabase 어드민 권한을 쓰면 auth 스키마에도 입력이 될 것 같았고<br />해봤더니 역시 아주 잘 되었습니다... 이 생각을 왜 작년엔 못했을까요?</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">한가지 문제는 네이버 OAuth 를 프로덕션으로 쓰려면<br />네이버 개발자센터 &gt; 내 애플리케이션 &gt; 네이버 로그인 검수 상태<br />에서 검수가 완료되어야 합니다. <a href="https://developers.naver.com/docs/login/verify/verify.md">검수가이드</a></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">보면 대단한 걸 요구하는건 아닌데 귀찮습니다.<br />카카오는 검수 없이도 기본적인 정보들은 그냥 받을 수 있는데<br />네이버는 아무튼간 안되는 것 같습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">결론은,</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">Supabase Auth 와 함께 사용하기 &gt; 문제 없음<br />프로덕션에서 사용 &gt; 문제 있음. 네이버 검수 통과 필요</p>
</blockquote>
<p data-ke-size="size16">입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<hr contenteditable="false" data-ke-type="horizontalRule" data-ke-style="style1" />
<h2 data-ke-size="size26">1. naver-login-button.tsx</h2>
<p data-ke-size="size16">네이버 로그인 버튼 컴포넌트 입니다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>global.d.ts 등에 naver 설정</li>
<li>네이버 스크립트를 그냥 버튼 컴포넌트에 next/script 로 포함시키고 버튼 보일때 로딩</li>
<li>스크립트 onLoad 시 네이버 로그인 버튼 초기화(hidden 으로 숨기고 ref 달기)</li>
<li>버튼 커스텀 하고, 이 버튼 클릭시 숨겨놓은 네이버 로그인 버튼 클릭시키기</li>
</ol>
<pre class="typescript" data-ke-language="typescript"><code>"use client";
<p>import Script from &quot;next/script&quot;;
import { useCallback, useRef, useState } from &quot;react&quot;;
import { SiNaver } from &quot;react-icons/si&quot;;
import { PUBLIC_URL } from &quot;@/constants/common.constants&quot;;</p>
<p>function NaverLogInButton() {
// 귀찮으니까 any ㅋㅋ
const [naverObj, setNaverObj] = useState&lt;any&gt;(null);
const naverRef = useRef&lt;HTMLButtonElement&gt;(null);</p>
<pre><code>const handleNaverInit = useCallback(() =&amp;gt; {
    const naver = window.naver;
    setNaverObj(naver);

    const naverLogin = new naver.LoginWithNaverId({
        clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID, //ClientID
        callbackUrl: `${PUBLIC_URL}/loading`, // Callback URL
        callbackHandle: true,
        isPopup: false, // 팝업 형태로 인증 여부
        loginButton: {
        color: &quot;green&quot;, // 색상
        type: 1, // 버튼 크기
        height: &quot;60&quot;, // 버튼 높이
        }, // 로그인 버튼 설정
    });
    naverLogin.init();
}, []);

const handleNaverLoginClick = () =&amp;gt; {
    if (!naverRef.current?.children[0].children) return;
    (naverRef.current.children[0].children[0] as HTMLImageElement).click();
};

return (
    &amp;lt;&amp;gt;
        &amp;lt;Script
            src=&quot;https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js&quot;
            onLoad={handleNaverInit}
        /&amp;gt;
        &amp;lt;button
            type=&quot;button&quot;
            ref={naverRef}
            id=&quot;naverIdLogin&quot;
            className=&quot;hidden&quot;
        /&amp;gt;
        {!naverObj ? (
            &amp;lt;SiNaver className=&quot;h-10 w-10 text-green-500&quot; /&amp;gt;
        ) : (
            &amp;lt;SiNaver 
                className=&quot;h-10 w-10 cursor-pointer text-green-500&quot;
                onClick={handleNaverLoginClick}
            /&amp;gt;
        )}
    &amp;lt;/&amp;gt;
);
</code></pre>
<p>};</p>
<p>export default NaverLogInButton;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<hr contenteditable="false" data-ke-type="horizontalRule" data-ke-style="style1" />
<h2 data-ke-size="size26">2. /loading/page.tsx (이 방법 별로인듯...)</h2>
<p data-ke-size="size16">작년에 이런식으로 해놨길래 귀찮아서 그냥 이어서 했습니다.<br />근데 별로 좋은 방법은 아니에요.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">왜 이렇게 했었는지 모르겠지만 ㅋㅋ<br />현재 상황은 다음과 같은데요.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>코드가 해시로 &gt; 네이버 SDK Implicit Flow를 사용(위에서 그렇게 하고 있음.. Script 부분)</li>
<li>즉 Route Handler로 직접 처리 불가 &gt; 해시는 서버로 전송되지 않기 때문</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">안전하게 하고 싶으면 네이버 OAuth의 Authorization Code Flow를 사용하는게 좋습니다. <a href="https://developers.naver.com/docs/login/devguide/devguide.md">참고</a><br />할게 좀 더 많긴한데 <a href="https://nid.naver.com/oauth2.0/token">https://nid.naver.com/oauth2.0/token</a><br />여기로 요청해서 PKCE 도 적용하는게 좋습니다.. (OAuth2 구현기는 나중에...)</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">아무튼, 지금 상태로는 해시로 오기 때문에 이렇게 할 수 밖에 없습니다.</p>
<p data-ke-size="size16">네이버 개발자센터에서 callback URL 을 /loading 으로 설정해두면<br />네이버 로그인 버튼 클릭시 여기로 오게 됩니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">여기서 하는 일은</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>화면에 로더를 표시하면서</li>
<li>해쉬로 오는 네이버 토큰을 API route 로 전달</li>
</ol>
<p data-ke-size="size16">이게 끝입니다</p>
<pre class="typescript" data-ke-language="typescript"><code>"use client";
<p>import { useEffect } from &quot;react&quot;;
import DefaultLoader from &quot;@/components/atoms/common/DefaultLoader&quot;;
import { useAuth } from &quot;@/hooks&quot;;</p>
<p>function LoadingPage() {
const { naverLogIn } = useAuth();</p>
<pre><code>useEffect(() =&amp;gt; {
    if (window.location.hash) {
        const hash = window.location.hash.substring(1); // 해시로 오고
        const params = new URLSearchParams(hash);
        const token = params.get(&quot;access_token&quot;); // 정직한 이름...
        // 이건 왜 이렇게 했는지...
        // 아무튼 naverLogIn 이 하는 일은
        // /api/auth/callback/naver 여기로
        // 헤더에 토큰 실어서 보내는 겁니다..
        if (token) naverLogIn(token);
        // token 없을 때 처리도 당연히 해줘야 합니다... 
    }
}, [naverLogIn]);

return &amp;lt;DefaultLoader /&amp;gt;;
</code></pre>
<p>};</p>
<p>export default LoadingPage;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<hr contenteditable="false" data-ke-type="horizontalRule" data-ke-style="style1" />
<h2 data-ke-size="size26">3. supabase-admin-client.ts</h2>
<p data-ke-size="size16">이게 핵심입니다.<br />어드민용 클라이언트가 하나 필요해요.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">어드민용 클라이언트를 위해선<br />service_role_key 가 필요한데<br />이건 수파베이스 대시보드에서 받을 수 있습니다.<br />(최근 이름이 그냥 SECRET_KEY 로 바뀐듯... 저는 그거 썼습니다)</p>
<p data-ke-size="size16">&nbsp;</p>
<pre class="javascript"><code>import { createClient } from "@supabase/supabase-js";
<p>/**</p>
<ul>
<li>
<p>서버 사이드에서 어드민 권한으로 Supabase 클라이언트를 생성합니다.</p>
</li>
<li>
<p>auth.admin API를 사용하기 위해 service_role 키가 필요합니다.</p>
</li>
<li>
<p>⚠️ 주의: 이 클라이언트는 서버 사이드에서만 사용해야 하며, 절대 클라이언트에 노출되면 안 됩니다.
*/
export function createAdminClient() {
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// 시크릿키 써도 됨...
const supabaseServiceRoleKey = process.env.SUPABASE_SECRET_KEY;</p>
<p>if (!supabaseUrl || !supabaseServiceRoleKey) {
throw new Error(
&quot;Missing Supabase environment variables&quot;,
);
}</p>
<p>return createClient(supabaseUrl, supabaseServiceRoleKey, {
auth: {
autoRefreshToken: false,
persistSession: false,
},
});
}</code></pre></p>
</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<hr contenteditable="false" data-ke-type="horizontalRule" data-ke-style="style1" />
<h2 data-ke-size="size26">4. api/callback/naver/route.ts</h2>
<p data-ke-size="size16">테이블명이 public.buddies 인데<br />그냥 users 로 하지 뭐 이렇게 했나 싶지만?</p>
<p data-ke-size="size16"><br />1년 전의 나니까... 그냥 넘어갑니다...</p>
<p data-ke-size="size16"><code>getBuddy</code> 이런건 그냥 public.users 에서<br />user 가져오는 거라고 봐주시면 됩니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">일단 필요한 함수들 부터</p>
<h3 data-ke-size="size23">getBuddy</h3>
<pre class="cs"><code>/**
* buddy_id로 buddies 테이블에서 사용자 정보를 가져옵니다.
*/
async function getBuddy(
    supabase: SupabaseClient,
    id: string,
): Promise&lt;Buddy | null&gt; {
    const { data: buddy, error } = await supabase
        .from("buddies")
        .select("*")
        .eq("buddy_id", id)
        .single();
<pre><code>if (error) {
    console.error(&quot;Error fetching buddy by id:&quot;, error);
    return null;
}

return buddy;
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">getBuddyByEmail</h3>
<pre class="cs"><code>/**
* 이메일로 buddies 테이블에서 사용자 정보를 가져옵니다.
*/
async function getBuddyByEmail(
    supabase: SupabaseClient,
    email: string,
): Promise&lt;Buddy | null&gt; {
    const { data: buddy, error } = await supabase
        .from("buddies")
        .select("*")
        .eq("buddy_email", email)
        .single();
<pre><code>if (error) {
    return null;
}

return buddy;
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">findUserByEmail</h3>
<pre class="javascript"><code>/**
* 이메일로 auth.users에서 사용자를 찾습니다.
*/
async function findUserByEmail(supabaseAdmin: SupabaseClient, email: string) {
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    return users?.users.find((user) =&gt; user.email === email) ?? null;
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">getRedirectUrl</h3>
<pre class="typescript"><code>/**
* 리다이렉트 URL을 생성합니다.
*/
function getRedirectUrl(
    origin: string,
    forwardedHost: string | null,
    isLocalEnv: boolean,
    path: string,
): string {
    if (isLocalEnv) {
        return `${origin}${path}`;
    }
    if (forwardedHost) {
        return `https://${forwardedHost}${path}`;
    }
    return `${origin}${path}`;
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">signInUser</h3>
<pre class="aspectj"><code>/**
* 사용자 로그인 처리를 수행합니다 (세션 생성).
* 로그인도 직접 시켜줘야 함...
*/
async function signInUser(
    email: string,
    password: string,
): Promise&lt;{ success: boolean; error?: string }&gt; {
    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
<pre><code>    if (error) {
        console.error(&quot;Error signing in user:&quot;, error);
        return { success: false, error: error.message };
    }

    return { success: true };
} catch (error) {
    console.error(&quot;Error during sign in:&quot;, error);
    return {
        success: false,
        error: error instanceof Error ? error.message : &quot;Unknown error&quot;,
    };
}
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">isNewUser</h3>
<pre class="reasonml"><code>const ONE_HOUR_MS = 60 * 60 * 1000;
/**
* 최초 로그인 여부를 확인합니다 (1시간 이내 생성된 사용자).
* 입맛대로...
*/
function isNewUser(createdAt: string): boolean {
    return new Date(createdAt).getTime() &gt; Date.now() - ONE_HOUR_MS;
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">handleExistingUser</h3>
<pre class="typescript"><code>/**
* 기존 사용자 처리를 수행합니다.
* 필요한 경우 여기서 auth.users 대신
* public의 커스텀 유저 테이블을 사용할 수도 있어요...
* 파라미터도 입맛대로...
*/
<p>async function handleExistingUser(
buddy: Buddy,
userEmail: string,
password: string,
origin: string,
forwardedHost: string | null,
isLocalEnv: boolean,
next: string,
): Promise&lt;NextResponse&gt; {
// 기존 사용자도 로그인 처리 필요
const signInResult = await signInUser(userEmail, password);</p>
<pre><code>if (!signInResult.success) {
    console.error(&quot;Failed to sign in existing user:&quot;, signInResult.error);
    return NextResponse.json(
        { error: &quot;Failed to sign in user&quot; },
        { status: 500 },
    );
}

const newUser = isNewUser(buddy.buddy_created_at);

// 최초 로그인이면 온보딩으로 리다이렉트
if (newUser) {
    const redirectUrl = `${origin}/onboarding?funnel=0&amp;amp;mode=first`;
    return NextResponse.json({ redirectUrl, buddy }, { status: 200 });
}

// 기존 사용자는 x-forwarded-host가 있으면 그것을 사용하고, 
// 없으면 origin을 사용하여 리다이렉트인데...
// NextResponse.redirect 안하는 이유는
// 그냥 제 프로젝트가 이상하게 되어 있어서 그렇습니다...
// 리턴은 입맛대로 수정하면 됩니다...
const redirectUrl = getRedirectUrl(origin, forwardedHost, isLocalEnv, next);
return NextResponse.json({ redirectUrl, buddy }, { status: 200 });
</code></pre>
<p>}
</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">다 되었으면 마지막 route handler 작성!</p>
<h3 data-ke-size="size23">POST (GET 이어도 상관없을듯...)</h3>
<p data-ke-size="size16">아무튼 이렇게 하면 되는데,</p>
<p data-ke-size="size16">참말로 보기 불편하니 리팩토링 해야 합니다...</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그리고 리다이렉트 시킬거면 전부 리다이렉트로 처리해야 하고<br />아니면 그냥 아래처럼 해도 될지도?</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>!전부 어드민 클라이언트 사용!</b></p>
<p data-ke-size="size16"><br />순서는</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>네이버 API를 사용하여 사용자 정보 가져오기</li>
<li>기존 사용자 있는지 체크 -&gt; auth.user, public.buddies 두 개라 헷갈리지만 잘.. 처리...</li>
<li>없으면 createUser</li>
<li>3 까지 잘 되었으면 signInWithPassword, 위에서 만든 signInUser 사용</li>
<li>리다이렉트 하든지, 결과 리턴하든지..</li>
</ol>
<p data-ke-size="size16">끝!</p>
<pre class="typescript" data-ke-language="typescript"><code>export async function POST(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    // 배포 환경이 vercel 이든 뭐든...
    // 로드밸런서일 확률 높으니 그냥 이걸로 하면 됨...
    const forwardedHost = request.headers.get("x-forwarded-host"); 
    const isLocalEnv = process.env.NODE_ENV === "development";
    const next = searchParams.get("next") ?? "/";
    const headersList = await headers();
    const accessToken = headersList.get("Authorization")?.split(" ")[1];
<pre><code>if (!FIXED_PASSWORD) {
    return NextResponse.json(
        { error: &quot;NAVER_PROVIDER_LOGIN_SECRET is not set&quot; },
        { status: 400 },
    );
}

if (!accessToken) {
    return NextResponse.json(
        { error: &quot;Access token not found&quot; },
        { status: 400 },
    );
}

try {
    // 네이버 API를 사용하여 사용자 정보 가져오기
    const response = await fetch(&quot;https://openapi.naver.com/v1/nid/me&quot;, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        return NextResponse.json(
            { error: &quot;Failed to fetch user info from Naver&quot; },
            { status: 400 },
        );
    }

    const userData = await response.json();
    const userEmail: string = userData.response?.email;

    if (!userEmail) {
        return NextResponse.json(
            { error: &quot;Email not found in Naver user data&quot; },
            { status: 400 },
        );
    }

    // ⭐️ 여기서 위에서 만든 어드민클라이언트 사용! ⭐️
    const supabaseAdmin = createAdminClient();

    // 먼저 buddies 테이블에서 이메일로 기존 사용자 확인
    // buddies 테이블의 buddy_email unique constraint 위반을 방지하기 위함
    const existingBuddy = await getBuddyByEmail(supabaseAdmin, userEmail);

    // 기존 사용자가 있는 경우
    if (existingBuddy) {
        const existingUser = await findUserByEmail(supabaseAdmin, userEmail);

        // 커스텀 테이블에는 있는데, auth.users에서 찾을 수 없는 경우 - 그러니까 망한 상황임
        // 이런 상황이 발생하면 커스텀 테이블과 auth.users 간의 데이터 일관성이 깨진 것임
        // 그냥 이럴땐 커스텀 테이블에 있는 유저 지우고 다시 하던지 하면 될 듯
        if (!existingUser) {
            console.error(&quot;Buddy exists but auth user not found&quot;);
            return NextResponse.json(
                { error: &quot;Auth user not found for existing buddy&quot; },
                { status: 500 },
            );
        }

        // 기존 사용자 처리
        return handleExistingUser(
            existingBuddy,
            userEmail,
            FIXED_PASSWORD,
            origin,
            forwardedHost,
            isLocalEnv,
            next,
        );
    }

    // 새 사용자 생성
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        password: FIXED_PASSWORD, // 지금 그냥 고정값 쓰는데, 안전하게 처리해야겠죠...
        email_confirm: true, // 네이버 OAuth 사용자는 이메일이 이미 확인된 상태
        app_metadata: {
            provider: &quot;naver&quot;,
            providers: [&quot;naver&quot;],
        },
        user_metadata: { // 입맛대로 하면 됩니다...
            iss: &quot;https://nid.naver.com&quot;,
            sub: userData.response.id,
            name: userData.response.name,
            email: userEmail,
            picture: userData.response.profile_image,
            full_name: userData.response.name,
            avatar_url: userData.response.profile_image,
            provider_id: userData.response.id,
            email_verified: true,
            phone_verified: false,
        },
    });

    // auth.users에 이미 존재하는 경우 (buddies는 없지만 auth.users는 있는 경우)
    if (error?.message.includes(&quot;A user with this email already exists&quot;)) {
        const existingUser = await findUserByEmail(supabaseAdmin, userEmail);

        // 이미 auth.users 에 존재해서 에러가 발생한 상황인데
        // email 로는 못찾는 상황임 - 사실 발생하지 않을듯?
        // 엄청 이상한 상황이므로 에러 메시지 수정.. 해서 쓰든지 추가 보완 필요
        if (!existingUser) {
            console.error(&quot;odd situation: user exists but could not be found&quot;);
            return NextResponse.json(
                { error: &quot;odd situation: user exists but could not be found&quot; },
                { status: 500 },
            );
        }

        // 이미 auth.user에는 존재하는 상황이고
        // public.buddies 에서 찾아보기
        const buddy = await getBuddy(supabaseAdmin, existingUser.id);

        // auth.user에는 있고, public.buddies 에는 없는.. 망한 상황
        if (!buddy) {
            console.error(&quot;Buddy not found for existing user&quot;);
            return NextResponse.json(
                { error: &quot;Buddy profile not found&quot; },
                { status: 404 },
            );
        }

        // 안 망했으면 유저 있는 경우니까
        return handleExistingUser(
            buddy,
            userEmail,
            FIXED_PASSWORD,
            origin,
            forwardedHost,
            isLocalEnv,
            next,
        );
    }

    // 사용자 생성 에러 처리
    if (error) {
        console.error(&quot;Error creating user:&quot;, error);
        return NextResponse.json({ error: error?.message }, { status: 400 });
    }

    // 사용자 생성 실패 시
    if (!user) {
        console.error(&quot;Creating user(Admin) failed?:&quot;, error);
        return NextResponse.json({ error: &quot;User not found&quot; }, { status: 404 });
    }

    // 새로 생성된 사용자 로그인 처리 (세션 생성)
    // 이거 꼭 필요합니다. 안그러면 생성만되고 로그인은 안된 상태임...
    const signInResult = await signInUser(userEmail, FIXED_PASSWORD);
    if (!signInResult.success) {
        console.error(&quot;Failed to sign in new user:&quot;, signInResult.error);
        return NextResponse.json(
            { error: &quot;User created but failed to sign in&quot; },
            { status: 500 },
        );
    }

    const buddy = await getBuddy(supabaseAdmin, user.user.id);

    if (!buddy) {
        console.error(&quot;Buddy not found for new user&quot;);
        return NextResponse.json(
            { error: &quot;Buddy profile not found&quot; },
            { status: 404 },
        );
    }

    // 최초 로그인 여부 확인 (생성된 사용자는 항상 새 사용자)
    const redirectUrl = getRedirectUrl(origin, forwardedHost, isLocalEnv, next);
    // 역시 여기도 입맛대로... 리턴
    return NextResponse.json({ redirectUrl, buddy }, { status: 200 });
} catch (error) {
    console.error(&quot;Error during Naver login callback ====&amp;gt;&quot;, error);
    return NextResponse.json(
        { error: &quot;Internal Server Error&quot; },
        { status: 500 },
    );
}
</code></pre>
<p>}</code></pre></p>
