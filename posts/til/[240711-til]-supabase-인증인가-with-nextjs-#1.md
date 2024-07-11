<p data-ke-size="size16">수파베이스를 사용한 인증/인가를 구현하면서 애를 많이 먹었습니다.<br />특히나 자료들이 대부분 조금 오래된 버전들이 많아서 더욱 힘들었습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">예를들어 나름 1년~6개월 전쯤에 작성된 자료임에도 Page 라우터를 사용하는 자료라거나,<br />혹은 use client 를 사용해서 처리해야만 하는 클라이언트 사이드 로직을 알려주는 경우가 많았습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">하지만 공식홈페이지 자료에는 불친절하긴해도 어찌저찌 방법이 거의 다 나와있긴했고<br />이를 참고하여 이메일 로그인, 비밀번호 찾기, 소셜로그인(깃헙, 구글, 카카오)을 구현하는데 성공했습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">과정을 복기하며 하나하나 메모해두려고 합니다.</p>
<h2 data-ke-size="size26">Step 1. Supabase client</h2>
<p data-ke-size="size16">Next.js 에서 Supabase 를 최적으로 사용하기 위해서는,<br />이제Supabase Client 를 두 가지 버전으로 만듭니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">하나는 서버사이드 용, 하나는 클라이언트 사이드 용 입니다.</p>
<p data-ke-size="size16">우선, 패키지를 설치합니다.</p>
<pre class="coffeescript"><code>npm install @supabase/supabase-js @supabase/ssr</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">.env 는 각자에 맞게 설정하면 되고,</p>
<p data-ke-size="size16">서버용 클라이언트와 클라이언트용 클라이언트를 생성하기 위한 두 개의 파일을 만듭니다.</p>
<pre class="javascript"><code>// 클라이언트용
import { createBrowserClient } from '@supabase/ssr'
<p>export function createClient() {
return createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
}
const supabase = createClient();
export default supabase;</code></pre></p>
<pre class="javascript"><code>// 서버용
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =&gt;
              cookieStore.set(name, value, options)
            )
          } catch {
            // 여기는 의도적으로 비워둔다고 되어 있습니다.
          }
        },
      },
    }
  )
}</code></pre>
<h2 data-ke-size="size26">Step 2. middleware</h2>
<p data-ke-size="size16">위의 두 파일을 만들었으면, 미들웨어 설정을 해야합니다.<br />역시 두개의 파일이 필요합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">src 레벨에 Next.js 에서 흔히 생성하는 middleware 파일 한개와<br />그 안에서 사용될 함수가 들어있는 수파베이스 전용 middleware 파일 한개입니다.</p>
<pre class="javascript"><code>// src 레벨에 생성하는 nextjs 레이어 middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
<p>export async function middleware(request: NextRequest) {
return await updateSession(request)
}</p>
<p>export const config = {
matcher: [
// 여기에 다른 미들웨어 설정을 넣어도 됩니다
'/((?!_next/static|_next/image|favicon.ico|.<em>\.(?:svg|png|jpg|jpeg|gif|webp)$).</em>)',
],
}</code></pre></p>
<pre class="javascript"><code>// 위 middleware 안에서 동작하는 함수, supabase 레이어 middleware 
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =&gt; request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =&gt;
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 여기에는 다른 코드를 작성하지 말라고 되어 있네요.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &amp;&amp;
    !request.nextUrl.pathname.startsWith('/login') &amp;&amp;
    !request.nextUrl.pathname.startsWith('/auth')
    // 여기에 원하는 다른 옵션들을 넣으면 됩니다.
  ) {
    // user 가 없고, login 혹은 auth 라우트가 아니면 login 으로 보내버립니다.
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
    // 중요: 반드시 supabaseResponse 객체를 그대로 반환해야 합니다. 
    // NextResponse.next()를 사용하여 새 응답 객체를 생성하는 경우 다음을 수행하세요: 
    // 1.다음과 같이 요청을 전달합니다: 
    // const myNewResponse = NextResponse.next({ request })     
    // 2. 다음과 같이 쿠키를 복사합니다: 
    //myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll()) 55 
    // 3. myNewResponse 객체를 필요에 맞게 변경하되 쿠키를 변경하지 마세요! 
    // 4. 마지막으로: myNewResponse 반환 
    // 이렇게 하지 않으면 브라우저와 서버가 동기화되지 않고 사용자 세션이 조기에 종료될 수 있습니다!
  return supabaseResponse
}</code></pre>
<h2 data-ke-size="size26">Step 3.  confirm route handler</h2>
<p data-ke-size="size16">이 부분은 이메일을 통한 비번 변경 혹은 첫 회원가입시 이메일 인증을<br />거쳐야 하는 경우에 꼭 세팅해야 하는 부분입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">우선 api/auth/confirm (주소는 자유) 에 route handler 를 하나 만듭니다.</p>
<pre class="typescript"><code>import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
<p>import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'</p>
<p>export async function GET(request: NextRequest) {
const { searchParams } = new URL(request.url)
const token_hash = searchParams.get('token_hash')
const type = searchParams.get('type') as EmailOtpType | null
const next = searchParams.get('next') ?? '/'</p>
<p>if (token_hash &amp;&amp; type) {
const supabase = createClient()</p>
<pre><code>const { error } = await supabase.auth.verifyOtp({
  type,
  token_hash,
})
if (!error) {
  // 사용자를 지정된 리디렉션 URL 또는 앱의 루트로 리디렉션합니다.
  redirect(next)
}
</code></pre>
<p>}</p>
<p>// 오류 페이지로 사용자를 리디렉션합니다.
// error 라는 페이지를 미리 만들어두어야 합니다.
redirect('/error')
}</code></pre></p>
<h2 data-ke-size="size26">Step 4.  Supabase 대시보드에서 설정 변경</h2>
<p data-ke-size="size16">여기가 참 애를 먹은 부분인데...<br />그냥 아래 처럼 하면 됩니다!!</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-filename="스크린샷 2024-07-10 오후 2.54.19.png" data-origin-width="3166" data-origin-height="1718"><span data-url="https://blog.kakaocdn.net/dn/cJMDNZ/btsIuQm6Tlh/KMkGUfhoNIXJkKgmLLYSY1/img.png" data-phocus="https://blog.kakaocdn.net/dn/cJMDNZ/btsIuQm6Tlh/KMkGUfhoNIXJkKgmLLYSY1/img.png"><img src="https://blog.kakaocdn.net/dn/cJMDNZ/btsIuQm6Tlh/KMkGUfhoNIXJkKgmLLYSY1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcJMDNZ%2FbtsIuQm6Tlh%2FKMkGUfhoNIXJkKgmLLYSY1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-filename="스크린샷 2024-07-10 오후 2.54.19.png" data-origin-width="3166" data-origin-height="1718"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">수파베이스 대시보드에서 Authentication 탭의 Email Templates 로 이동한 뒤<br />Reset Password 를 선택하신 뒤에</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">하단의 Source 부분에서 a 태그 부분을 아래처럼 수정합니다.</p>
<pre class="django"><code>&lt;a href="{{ .RedirectTo }}/api/auth/confirm?token_hash={{ .TokenHash }}&amp;type=email&amp;next=/recover"&gt;Reset Password&lt;/a&gt;</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">핵심은 <b><i>type 은 email 이어야 하고 next 에는 리다이렉션 시킬 주소를 입력해야 한다는 것</i></b> 입니다.<br />저는 /recover 로 가기를 원해서 그렇게 했습니다.</p>
<p data-ke-size="size16">1편은 일단 여기까지 정리하고, 2편에서 이어가겠습니다.</p>