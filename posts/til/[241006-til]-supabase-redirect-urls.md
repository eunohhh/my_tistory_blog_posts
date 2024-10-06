<h2 data-ke-size="size26">supabase 하나의 프로젝트에 여러 배포사이트 OAuth 연결하기</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>supabase 대시보드 &gt; Authentication &gt; URL Configuration 으로 이동</li>
<li>Site URL 에는 대표 주소든 뭐든 아무거나 하나 입력</li>
<li>하단 Redirect URLs 에 위 Site URL 과 다른, 원하는 주소를 <code>주소/**</code> 형식으로 입력</li>
<li>OAuth provider login 코드에 아래 내용 추가</li>
</ol>
<pre class="qml"><code>const getURL = () =&gt; {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // 변수명 이거 아니어도 되고 암튼 env에 있는 걸로
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // vercel 에서 자동으로 생성
    'http://localhost:3000/';
  //  http 로 시작하지 않을 때(로컬호스트 아닐 때) https 로 시작하게 처리
  url = url.startsWith('http') ? url : `https://${url}`
  // 주소 끝에 / 추가
  url = url.endsWith('/') ? url : `${url}/`
  return url
}
<p>const { data, error } = await supabase.auth.signInWithOAuth({
provider: 'github',
options: {
redirectTo: getURL(), // <code>${getURL()}api/auth/callback</code> 등 원하는대로 사용..
},
})
</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">redirectTo 의 값이 Redirect URLs 에 있다면 잘 리다이렉트 됩니다!</p>
<h3 data-ke-size="size23">vercel preview 에서도 작동하게 하고 싶으면</h3>
<p data-ke-size="size16">Redirect URLs 에 <code>https://*-버셀팀혹은계정명.vercel.app/**</code> 추가</p>