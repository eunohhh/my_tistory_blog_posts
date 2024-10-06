<h2 data-ke-size="size26">supabase OAuth 는 naver provider 미지원!!</h2>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">상황은 이러합니다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>supabase auth 를 쓰고 있다.</li>
<li>그런데 supabase auth 는 naver Provider 를 지원하지 않는다...</li>
<li>하지만 naver login 구현도 하고 싶다!</li>
</ol>
<p data-ke-size="size16">여기에 더해 우리는 기본 auth 스키마만 쓰는 것이 아니라<br />유저를 커스텀하기 위한 buddies 테이블도 public 에 두고 있습니다.</p>
<p data-ke-size="size16">따라서 아래와 같이 되는 것이 가장 좋겠죠</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>네이버 로그인시 auth 스키마에 insert 될 수 있다면</li>
<li>sql trigger 에 따라 자동으로 buddies 테이블에는 insert된다.</li>
</ol>
<p data-ke-size="size16">하지만 역시 쉽지않습니다. auth 스키마에 직접 insert 하는 방법은<br />supabase 문서 어디에도 없습니다. 공식적으로 없는 것 같습니다.</p>
<p data-ke-size="size16">그래서 생각해낸 방법은 다음과 같았습니다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>네이버 로그인 api 를 통해 일단 네이버 로그인을 구현한다.</li>
<li>1번이 성공하면 네이버 개발자센터에서 지정한 인증정보들을 받을 수 있다(이메일, 플필사진, 이름, 고유id)</li>
<li>이 정보들을 바탕으로 supabase.auth.signUp 을 진행하여 email로 가입을 시켜버린다.</li>
<li>3번이 성공하면 trigger 에 따라 buddies 에는 자동 입력</li>
<li>자동입력되므로 getUser() 후 id를 기준으로 buddies 테이블에서 buddy_id 가 일치하는 로우 찾아서</li>
<li>이 로우가 곧 현재 로그인 된 사용자의 최종적인 정보이므로 해당 데이터 리턴</li>
<li>재로그인시에 또 signUp 되면 안되므로, signInWithPassword 를 먼저 해보고 중복일 경우에만 signUp하게 수정</li>
<li>그런데 signUp 하려면 고유 비번이 필요하다..</li>
<li>소셜로그인인데 비번 입력하라고 할 수는 없으니 그냥 복잡한 비번하나 만들어서  env 에 넣고 고정적으로 사용</li>
</ol>
<p data-ke-size="size16">이런 플로우를 생각하고 gpt 한테 물어보면서 약간의 검증을 거쳤습니다.<br />좋은 해결책이 아닌 부분도 있지만, 이 정도면 타협점으로 괜찮다고 하네요.</p>
<p data-ke-size="size16">그래서 이렇게 진행해보았습니다.</p>
<h2 data-ke-size="size26">1. Script 태그 삽입</h2>
<p data-ke-size="size16">먼저 root layout.tsx 에 nextjs의 Script 컴포넌트를 활용해 외부 네이버 script 를 삽입해줍니다.</p>
<pre class="javascript"><code>const RootLayout: React.FC&lt;PropsWithChildren&gt; = ({ children }) =&gt; {
    return (
        &lt;html lang="en"&gt;
            &lt;body className={inter.className}&gt;
                &lt;Script
            src="https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js"
                strategy="beforeInteractive"
                /&gt;
                &lt;QueryProvider&gt;{children}&lt;/QueryProvider&gt;
            &lt;/body&gt;
        &lt;/html&gt;
    );
};</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">2. global.d.ts 생성</h2>
<p data-ke-size="size16">전역적으로 네이버 객체를 참조해야하는데 타입스크립트 에러가 나기때문에 루트경로에 다음을 추가합니다</p>
<pre class="typescript"><code>// global.d.ts
declare global {
    interface Window {
        naver: any;
    }
}
<p>export {};</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">3. 네이버 로그인 버튼 컴포넌트</h2>
<p data-ke-size="size16">다음으로 네이버 로그인 버튼 클라이언트 컴포넌트를 작성합니다.<br />여기서 그냥 naver 초기화를 진행해버립니다.<br />방법은 handleNaverInit 함수가 전부입니다.</p>
<pre class="javascript"><code>const NaverLogInButton: React.FC = () =&gt; {
    const naverRef = useRef&lt;HTMLButtonElement&gt;(null);
<pre><code>const handleNaverInit = useCallback(() =&amp;gt; {
    const naver = window.naver;
    const naverLogin = new naver.LoginWithNaverId({
        clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID, //ClientID
        callbackUrl: `${PUBLIC_URL}/loading`, // Callback URL
        callbackHandle: true,
        isPopup: false, // 팝업 형태로 인증 여부
            loginButton: {
            color: 'green', // 색상
            type: 1, // 버튼 크기
            height: '60', // 버튼 높이
        }, // 로그인 버튼 설정
    });
    naverLogin.init();
}, []);


const handleNaverLoginClick = () =&amp;gt; {
    if (
    !naverRef ||
    !naverRef.current ||
    !naverRef.current.children ||
    !naverRef.current.children[0].children
    )
    return;

(naverRef.current.children[0].children[0] as HTMLImageElement).click();
};


useEffect(() =&amp;gt; {
    handleNaverInit();
}, [handleNaverInit]);

return (
    &amp;lt;&amp;gt;
        &amp;lt;button ref={naverRef} id=&quot;naverIdLogin&quot; className=&quot;hidden&quot; /&amp;gt;
        &amp;lt;SiNaver
            className=&quot;w-10 h-10 text-green-500 cursor-pointer&quot;
            onClick={handleNaverLoginClick}
        /&amp;gt;
    &amp;lt;/&amp;gt;
);
</code></pre>
<p>};</p>
<p>export default NaverLogInButton;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">4. /loading 같은 경로 하나 만들기</h2>
<p data-ke-size="size16">네이버 로그인은 callback url 을 필요로 합니다.<br /><a href="https://developers.naver.com/apps/#/list">https://developers.naver.com/apps/#/list</a><br />여기서 설정하면 됩니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그리고 여기서 설정한 값과 코드에서 설정한 값이 일치해야 합니다.<br />저는 버튼 컴포넌트에서 init 할 때 /loading 으로 일치하게 설정했습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이렇게 하게 되면, 사용자가 네이버 로그인 버튼을 눌렀을때 네이버로 이동했다가<br />설정한 주소로 오게 됩니다. 이 경우에는 /loading 으로 오겠죠.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그래서 결국 여길 거쳐서 다시 메인으로 가든지 해야 합니다.<br />따라서 주소가 생각이 안나서 그냥 loading 이라고 한 것입니다.</p>
<p data-ke-size="size16"><br />맘대로 바꿔도 됩니다.</p>
<p data-ke-size="size16">/app/.../loading/page.tsx 의 스타일링은 입맛대로 ...</p>
<pre class="javascript"><code>'use client';
<p>import { useAuth } from '@/hooks/auth';
import React, { useEffect } from 'react';</p>
<p>const LoadingPage: React.FC = () =&gt; {
const { naverLogIn } = useAuth();</p>
<pre><code>useEffect(() =&amp;gt; {
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        if (accessToken) naverLogIn();
    }
// naverLogIn 은 반드시 useCallback 처리되어 있어야 함
}, [naverLogIn]);

return &amp;lt;div&amp;gt;Loading...&amp;lt;/div&amp;gt;;
</code></pre>
<p>};</p>
<p>export default LoadingPage;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위 구조를 보면 /loading 으로 콜백될 때 주소에 토큰 값을 가지고 오게 됩니다.<br /><code>/loading#access_token=어쩌구저쩌구</code> 같은 식입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그래서 토큰이 있을때만 naverLogIn 함수를 호출합니다.<br />naverLogIn 함수 안에서도 토큰값이 필요한데, 그냥 파라미터로 넘기진 않았습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이제 이 토큰을 서버쪽 route handler로 넘겨야 합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">2부로 계속...</p>