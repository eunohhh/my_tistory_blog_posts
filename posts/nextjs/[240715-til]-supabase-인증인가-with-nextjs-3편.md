<h2 data-ke-size="size26">Step 7.  프로바이더 로그인 버튼 예시</h2>
<pre class="javascript"><code>"use client";
<p>import useAuth from &quot;@/hooks/useAuth&quot;;
import { showAlert } from &quot;@/lib/openCustomAlert&quot;;
import { usePathname } from &quot;next/navigation&quot;;
import { FcGoogle } from &quot;react-icons/fc&quot;;</p>
<p>function GoogleLogInButton() {
const { loginWithProvider } = useAuth();
const pathname = usePathname();</p>
<pre><code>const handleClickGoogle = async () =&amp;gt; {
    if (pathname === &quot;/recover&quot;) {
        return showAlert(&quot;caution&quot;, &quot;비밀번호 복구 페이지에서는 소셜로그인이 불가합니다&quot;);
    }
    loginWithProvider(&quot;google&quot;);
};

return 
&amp;lt;FcGoogle className=&quot;w-11 h-11 cursor-pointer&quot; onClick={handleClickGoogle} /&amp;gt;;
</code></pre>
<p>}</p>
<p>export default GoogleLogInButton;</code></pre></p>
<p data-ke-size="size16">대략 위처럼 만들면 됩니다.<br />그러면 loginWithProvider 를 봐야겠죠?</p>
<h2 data-ke-size="size26">Step 8. loginWithProvider 함수</h2>
<pre class="typescript"><code>
const loginWithProvider = async (provider: string) =&gt; {
    try {
        setIsPending(true);
        const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/provider?provider=${provider}`
        );
<pre><code>    if (!response.ok) {
        throw new Error(&quot;fetch 실패&quot;);
    }
    const data = await response.json();

    queryClient.invalidateQueries({ queryKey: [&quot;user&quot;] });
    router.replace(data.url);

    showAlert(&quot;success&quot;, &quot;로그인 성공&quot;);
} catch (error) {
    console.error(error);
}
</code></pre>
<p>};</code></pre></p>
<p data-ke-size="size16">대략 위처럼 생겼습니다.<br />/api/auth/provider 를 향해서 get 을 날리고 파라미터로 프로바이더 종류를 넘깁니다.</p>
<h2 data-ke-size="size26">Step 9. route handler(provider)</h2>
<pre class="javascript"><code>import { createClient } from "@/supabase/server";
import { Provider } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
<p>export async function GET(request: NextRequest) {
const { searchParams } = new URL(request.url);
const provider = searchParams.get(&quot;provider&quot;);</p>
<pre><code>const supabase = createClient();
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as Provider,
    options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
    },
});

if (error) {
    return NextResponse.json({ error: error?.message }, { status: 401 });
}

return NextResponse.json(data, { status: 200 });
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">역시 대략 위처럼 생겼읍니다.<br />포인트는 /api/auth/callback 여기로 리다이렉트 시킨다는 점입니다.<br />왜 그러한가? 수파베이스가 그렇게 하라고 했기때문입죠.</p>
<h2 data-ke-size="size26">Step 10. route handler(callback)</h2>
<pre class="typescript"><code>import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
<p>export async function GET(request: Request) {</p>
<pre><code>const { searchParams, origin } = new URL(request.url);
const code = searchParams.get(&quot;code&quot;);
const next = searchParams.get(&quot;next&quot;) ?? &quot;/&quot;;


if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.delete({ name, ...options });
                },
            },
        }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
    }
}
// 여기도 auth-code-error 이런 페이지가 있어야 리다이렉트 되니 미리 만들어놓아야함 
// 싫으면 다른데로 보내면 됨
return NextResponse.redirect(`${origin}/auth/auth-code-error`);
</code></pre>
<p>}</p>
<p>// 만일 소셜 로그인인데, 이메일이 같으면(깃헙로그인이든 구글이든) 수파베이스 auth 에는 그냥 업데이트만 됨</code></pre></p>
<p data-ke-size="size16">callback 은 위처럼 생겼습니다.<br />코드 내용물은 supabase 가이드와 똑같으니 참고 하면 될 것 같습니다.<br /><a href="https://supabase.com/docs/guides/auth/social-login/auth-github?queryGroups=environment&amp;environment=server">여기참고</a></p>
<figure id="og_1721043295074" contenteditable="false" data-ke-type="opengraph" data-ke-align="alignCenter" data-og-type="article" data-og-title="Login with GitHub | Supabase Docs" data-og-description="Add GitHub OAuth to your Supabase project" data-og-host="supabase.com" data-og-source-url="https://supabase.com/docs/guides/auth/social-login/auth-github?queryGroups=environment&amp;environment=server" data-og-url="https://supabase.com/docs/guides/auth/social-login/auth-github" data-og-image="https://scrap.kakaocdn.net/dn/bPYZbk/hyWCAbbOab/Q0R6oUkxdA0W33uKgNLYDK/img.png?width=1200&amp;height=630&amp;face=0_0_1200_630,https://scrap.kakaocdn.net/dn/c3IAL4/hyWzwVPbeW/4Kqut26zIwXPqsB0Vq5rIk/img.png?width=1200&amp;height=600&amp;face=0_0_1200_600,https://scrap.kakaocdn.net/dn/iRp8u/hyWzsslAMS/PzYuKA1Hm8mAChL5dhM030/img.png?width=1349&amp;height=814&amp;face=0_0_1349_814"><a href="https://supabase.com/docs/guides/auth/social-login/auth-github?queryGroups=environment&amp;environment=server" target="_blank" rel="noopener" data-source-url="https://supabase.com/docs/guides/auth/social-login/auth-github?queryGroups=environment&amp;environment=server">
<div class="og-image" style="background-image: url('https://scrap.kakaocdn.net/dn/bPYZbk/hyWCAbbOab/Q0R6oUkxdA0W33uKgNLYDK/img.png?width=1200&amp;height=630&amp;face=0_0_1200_630,https://scrap.kakaocdn.net/dn/c3IAL4/hyWzwVPbeW/4Kqut26zIwXPqsB0Vq5rIk/img.png?width=1200&amp;height=600&amp;face=0_0_1200_600,https://scrap.kakaocdn.net/dn/iRp8u/hyWzsslAMS/PzYuKA1Hm8mAChL5dhM030/img.png?width=1349&amp;height=814&amp;face=0_0_1349_814');">&nbsp;</div>
<div class="og-text">
<p class="og-title" data-ke-size="size16">Login with GitHub | Supabase Docs</p>
<p class="og-desc" data-ke-size="size16">Add GitHub OAuth to your Supabase project</p>
<p class="og-host" data-ke-size="size16">supabase.com</p>
</div>
</a></figure>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그런데 희한한 점은 소셜 로그인인데 이메일이 같을 경우...<br />예를들어 깃헙에 사용된 이메일이 gmail 이고 이것이 google 과 같은 아디라면,</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">provider가 다름에도 하나의 로우만 생기고,</p>
<p data-ke-size="size16">접속시간등도&nbsp; 수파베이스 auth 스키마에는 그냥 업데이트만 됩니다? 허허</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">때문에 프로필 수정등을 해도 아이디가 같다면 다른 provider 로 접속했어도</p>
<p data-ke-size="size16">똑같이 업데이트만 되므로 주의를 요합니다.</p>