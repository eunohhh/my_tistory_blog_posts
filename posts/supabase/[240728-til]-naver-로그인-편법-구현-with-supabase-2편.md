<h2 data-ke-size="size26">5. useMutation 을 위한 세팅</h2>
<p data-ke-size="size16">route handler 를 향해 fetch 를 날릴건데,<br />이것을 useMutation 으로 처리하고자합니다.</p>
<p data-ke-size="size16">먼저 mutationFn 에 들어갈 함수를 만듭니다.</p>
<pre class="qml"><code>export async function postNaverLogIn(): Promise&lt;Buddy | null&gt; {
    if (!window.location.hash) return null;
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
<pre><code>const url = '/api/auth/callback/naver';

try {
    const data = await fetchWrapper&amp;lt;Buddy&amp;gt;(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
    });
    return data;
} catch (error: any) {
    throw error;
}
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그냥 이 함수 내부에서 해시값을 추출한 뒤 body에 담아서<br />api/auth/callback/naver 를 향해서 fetch POST 를 날립니다.</p>
<p data-ke-size="size16">useMutation 도 그냥 훅으로 만들었습니다.</p>
<pre class="javascript"><code>export function useNaverLogInMutation() {
    const queryClient = useQueryClient();
<pre><code>return useMutation&amp;lt;Buddy | null, Error, void&amp;gt;({
    mutationFn: () =&amp;gt; postNaverLogIn(),
    onSuccess: () =&amp;gt; {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY_BUDDY] });
    },
});
</code></pre>
<p>}</code></pre></p>
<h2 data-ke-size="size26">6. auth.context.tsx 의 naverLogIn 함수</h2>
<p data-ke-size="size16">우리는 auth 관련한 로직들을 auth.context.tsx 에서 contextAPI로 관리합니다.<br />여기에 쓰기편하게 naverLogIn 을 만들어서 내보냅니다.</p>
<pre class="javascript"><code>export const AuthContext = createContext&lt;AuthContextValue&gt;(initialValue);
<p>export function AuthProvider({ children }: PropsWithChildren) {
// ...중략...
const { mutateAsync: naverLogInMutation, isPending: isNaverLogInPending } =
useNaverLogInMutation();</p>
<p>// ...중략...
const naverLogIn: AuthContextValue['naverLogIn'] = useCallback(async () =&gt; {
try {
const buddy = await naverLogInMutation();
if (!buddy)
return showAlert('caution', '알 수 없는 오류가 발생했어요');
showAlert('success', <code>${buddy.buddy_email}님 환영합니다!</code>, {
onConfirm: () =&gt; router.replace('/'),
});
} catch (error) {
const errorMessage =
error instanceof Error ? error.message : 'Unknown error';
return showAlert('error', errorMessage, {
onConfirm: () =&gt; router.refresh(),
});
}
}, [naverLogInMutation, router]);</p>
<p>// ...중략...
const value: AuthContextValue = {
// 기타등등
naverLogIn,
};</p>
<pre><code>return (
    &amp;lt;AuthContext.Provider value={value}&amp;gt;{children}&amp;lt;/AuthContext.Provider&amp;gt;
);
</code></pre>
<p>}</code></pre></p>
<h2 data-ke-size="size26">7. /api/callback/naver/route.ts 라우트핸들러</h2>
<p data-ke-size="size16">이제 라우트 핸들러를 만들어줍니다.</p>
<pre class="typescript" data-ke-language="typescript"><code>const FIXED_PASSWORD = process.env.NAVER_PROVIDER_LOGIN_SECRET;
<p>export async function POST(request: Request) {
const { accessToken } = await request.json();</p>
<pre><code>if (!FIXED_PASSWORD) {
    return NextResponse.json(
        { error: 'NAVER_PROVIDER_LOGIN_SECRET is not set' },
        { status: 400 },
    );
}

if (!accessToken) {
    return NextResponse.json(
        { error: 'Access token not found' },
        { status: 400 },
    );
}

try {
    // 네이버 API를 사용하여 사용자 정보 가져오기
    const response = await fetch('https://openapi.naver.com/v1/nid/me', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        return NextResponse.json(
            { error: 'Failed to fetch user info from Naver' },
            { status: 400 },
        );
    }

    const userData = await response.json();
    const userEmail = userData.response.email;

    const supabase = createClient();

    // signInWithPassword로 로그인 시도
    const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
            email: userEmail,
            password: FIXED_PASSWORD,
        });

    if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
            // 사용자 존재하지 않음, 새로 가입 시도
            const { data: signUpData, error: signUpError } =
                await supabase.auth.signUp({
                    email: userEmail,
                    password: FIXED_PASSWORD,
                    options: {
                        data: {
                            avatar_url: userData.response.profile_image,
                        },
                    },
                });

            if (signUpError) {
                throw signUpError;
            }

            if (!signUpData.user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 401 },
                );
            }

            const buddy = await getBuddy(supabase, signUpData.user.id);
            return NextResponse.json(buddy, { status: 200 });
        } else {
            throw signInError;
        }
    } else {
        const buddy = await getBuddy(supabase, signInData.user.id);
        // 로그인 성공
        return NextResponse.json(buddy, { status: 200 });
    }
} catch (error) {
    console.error('Error during Naver login callback:', error);
    return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 },
    );
}
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">여기서 좀 걸리는 부분은 supabase 가 naver를 지원하지 않아서<br />어쩔 수 없이 우회하느라 supabase email 기반 계정을 하나 생성해버리고,<br />이때 비밀번호를 그냥 다 고정값으로 했다는 점 입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그런데 뭐 딱히 방법이 없기도 하고 저희가 필요한 것은 buddies 테이블의 buddy 이지<br />supabase auth 스키마의 user 가 아니기 때문에 그냥 적용했습니다!</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">대강 로직은 <code>https://openapi.naver.com/v1/nid/me</code> 여기로 받은 토큰을 같이 보내면<br />네이버에 로그인된 네이버 아이디 정보를 리턴해주는데<br />여기에서 이메일과 프로필사진 두 가지만 씁니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 두가지를 사용해서 supabase auth 에 가입시켜버리는데,<br />먼저 로그인 시도를 해보고 없으면 가입시킵니다.</p>
<p data-ke-size="size16">supabase 로그인이 만약 된다면 이미 한번 네이버로<br />로그인 한 적이 있다는 뜻이니 그냥 로그인이 진행 될 것입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">아니라면 신규 가입이 되겠습니다!</p>
<h2 data-ke-size="size26">남은 문제들...</h2>
<p data-ke-size="size16">결국 이 방법은 그냥 편법일 뿐인 것 같습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">어떤 사람이 네이버에서 인증된 메일을 변경하고<br />저희 사이트에서 다시 네이버로그인을 시도하게되면<br />저희 테이블에 기록된 이메일은 이전의 이메일이기 때문에<br />새로 가입이 될 것이고, 그러면 서비스 이용에 장애가 생깁니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">극복하는 방법은 네이버에서 리턴해주는 고유 id 를<br />컬럼하나 만들어서 기록해놓으면 될 것 같긴 합니다!</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">고민해 봐야겠습니다!</p>