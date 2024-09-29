<p data-ke-size="size16"><a href="https://ifelseif.tistory.com/174">여기</a>에서 이어집니다.</p>
<h2 data-ke-size="size26">Step 4.  signup &amp; login &amp; logout 라우트 핸들러 작성</h2>
<p data-ke-size="size16">이메일회원가입 / 로그인 / 로그아웃 용 라우트 핸들러를 작성합니다.</p>
<p data-ke-size="size16">회원가입 / 로그인 로그아웃시에는 여기로 요청날리면 됩니다.(3편 콘텍스트api 활용 에서 자세히 설명)</p>
<pre class="typescript"><code>// api/auth/signup/route.ts
import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";
<p>export async function POST(request: NextRequest) {
const data = await request.json();
const name = data.name as string;
const email = data.email as string;
const password = data.password as string;</p>
<pre><code>const supabase = createClient();

const {
    data: { user },
    error,
} = await supabase.auth.signUp({ email, password,
        options: { 
            data: { user_name: name } 
        } 
    });

if (error) {
    return NextResponse.json({ user: null, error: error?.message }, 
    { status: 401 });
}

return NextResponse.json({ user }, { status: 200 });
</code></pre>
<p>}</code></pre></p>
<pre class="javascript"><code>// api/auth/login/route.ts
import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email, password } = await req.json();
    const supabase = createClient();

    const {
        data: { user },
        error,
    } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
            return NextResponse.json({ user: null, error: error.message }, 
            { status: 500 });
    }

    return NextResponse.json({ user });
}</code></pre>
<pre class="javascript"><code>// api/auth/logout/route.ts
import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE() {
    const supabase = createClient();

    await supabase.auth.signOut();

    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
}</code></pre>
<h2 data-ke-size="size26">Step 5.  Recover-redirect 라우트 핸들러 작성</h2>
<p data-ke-size="size16">비밀번호 변경을 위해서는 2개의 route handler 가 필요합니다.</p>
<p data-ke-size="size16">그 중 먼저 필요한 것은 recover-redirect 로 이것은 비번 변경을 할때 요청되는데,</p>
<p data-ke-size="size16"><br />비번 변경을 요청하면 먼저 이메일로 링크를 보내줍니다.</p>
<p data-ke-size="size16">다음은 api/auth/recover-redirect 의 구성입니다.</p>
<pre class="javascript"><code>// api/auth/recover-redirect/route.ts
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
<p>export async function POST(req: Request) {
if (!req.body) redirect(&quot;/login&quot;);</p>
<pre><code>const { email } = await req.json();
const supabase = createClient();

const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}`,
});

if (error) {
    redirect(&quot;/&quot;); // 에러 페이지 등으로 보내도 됩니다
}
redirect(&quot;/login&quot;);
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">구조를 보면, 리셋 이메일을 보내는게 이 핸들러의 목적입니다.<br />여기서 에러가 발생하지 않았다면 /login 로 다시 보내버립니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">근데 사실 여기서 보내버리는것은 큰 의미가 없긴 합니다..<br />어차피 메일 받으면 새탭에서 열리기 때문이죠...</p>
<h2 data-ke-size="size26">Step 6.  Recover 라우트 핸들러 작성</h2>
<p data-ke-size="size16"><b><i>이 이메일 링크에는 token_hash, type, next 라는 쿼리스트링이 포함됩니다</i></b></p>
<pre class="django"><code>&lt;a href="{{ .RedirectTo }}/api/auth/confirm?token_hash={{ .TokenHash }}&amp;type=email&amp;next=/recover"&gt;Reset Password&lt;/a&gt;</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그래서 전편의 마지막 대시보드 설정을 변경 할때 위처럼 type 을 email 로 next 를 /recover 로 설정한 것입니다.<br />token_hash 는 알아서 담겨져서 갑니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이메일 링크를 클릭하면, 위에 보이듯이 api/auth/confirm 으로 요청이 먼저 가는 구조입니다.<br />api/auth/confirm 에서는, 전편에 기록했듯이</p>
<pre class="gauss"><code>if (!error) {
  // 사용자를 지정된 리디렉션 URL 또는 앱의 루트로 리디렉션합니다.
  redirect(next)
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이런 부분이 있는데, 여기서 next 가 곧 위의 /recover 로 설정한 부분입니다.<br />따라서 api/auth/confirm 을 성공적으로 거치면 next에 해당하는 주소(여기서는 /recover)로 넘어가게 됩니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">휴 복잡합니다...<br />그래서 /recover 에 해당하는 페이지가 반드시 있어야 합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">app/....자신의 경로.../recover/page.tsx 를 만들고<br />거기에 비번을 변경할 수 있는 form 도 만들어 줍니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그리고, recover 페이지에서 submit 시 api/auth/recover 로 fetch를 날리면 됩니다!<br />api/auth/recover는 다음과 같이 구성합니다.</p>
<pre class="javascript"><code>// api/auth/recover/route.ts
import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";
<p>export async function POST(req: Request) {
const { password } = await req.json();
const supabase = createClient();</p>
<pre><code>const {
    data: { user },
    error,
} = await supabase.auth.updateUser({
    password: password,
});

if (error) {
    // 변경하는 비밀번호가 기존과 동일할 경우의 에러를 처리하기위해 아래와 같이 했습니다.
    return NextResponse.json({ error: error.message }, { status: 400 });
}

return NextResponse.json({ user }, { status: 200 });
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">구조를 보면, 여기서 진짜로 유저를 업데이트합니다.</p>
<p data-ke-size="size16">이번편은 여기까지 하고 다음편에서는 Provider 로그인 방법에 대해서 정리해보겠습니다.</p>