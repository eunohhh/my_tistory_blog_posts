<p>오늘은 PrivateRoute / ProtectedRoute 의 구현 방법을 정리해 보려고 합니다.</p>
<p> PrivateRoute / ProtectedRoute 는 사용자 인증 상태를 확인하여 인증된 사용자만 특정 경로에 접근할 수 있도록 하는 것입니다. 이를 위해 리액트 라우터를 사용하여 인증 로직을 추가할 수 있습니다. </p>
<h3>1. React Router 설치</h3>
<p>먼저, 리액트 라우터가 설치되어 있는지 확인합니다. 설치되어 있지 않다면 아래 명령어를 사용하여 설치합니다.</p>
<pre><code class="language-sh">npm install react-router-dom</code></pre>
<h3>2. Auth 설정</h3>
<p>인증 상태 관리는 Context API, Redux, Zustand 무엇이 되었든 user 정보나 isLoggedIn 등의 상태를 받을 수 있으면 됩니다. 여기서는 Zustand 와 Tanstack Query를 사용하여 api 를 구성하고 useAuth 훅을 만들었다고 가정해 보겠습니다.</p>
<pre><code class="language-tsx">// useAuth.tsx
import api from &quot;@/api/api&quot;;
import { AuthData } from &quot;@/types/d&quot;;
import { useAuthStore } from &quot;@/zustand/auth.store&quot;;
import { useMutation } from &quot;@tanstack/react-query&quot;;
import { useShallow } from &quot;zustand/react/shallow&quot;;
<p>interface ChangeProfileParams {
accessToken: string | null;
data: AuthData;
}</p>
<p>function useAuth() {
const { user, isLoggedIn, logOut } = useAuthStore(
useShallow((state) =&gt; ({
user: state.user,
isLoggedIn: state.isLoggedIn,
logOut: state.logOut,
}))
);</p>
<pre><code>const { mutateAsync: signUp } = useMutation({
    mutationFn: (data: AuthData) =&amp;gt; api.auth.signUp(data),
});

const { mutateAsync: logIn } = useMutation({
    mutationFn: (data: AuthData) =&amp;gt; api.auth.logIn(data),
});

const { mutateAsync: getUser } = useMutation({
    mutationFn: (accessToken: string | null) =&amp;gt;
    api.auth.getUser(accessToken),
});

const { mutateAsync: changeProfile } = useMutation({
    mutationFn: ({ accessToken, data }: ChangeProfileParams) =&amp;gt;
    api.auth.changeProfile(accessToken, data),
});

return { 
    user, 
    isLoggedIn, 
    signUp, 
    logIn, 
    getUser, 
    changeProfile, 
    logOut 
};
</code></pre>
<p>}</p>
<p>export default useAuth;</code></pre></p>
<h3>3. PrivateRoute 컴포넌트 구현</h3>
<p><code>PrivateRoute</code> 컴포넌트를 구현하여 인증 상태를 확인합니다.</p>
<pre><code class="language-tsx">// ProtectedRoute
import useAuth from &quot;@/hooks/useAuth&quot;;
import { Navigate, Outlet } from &quot;react-router-dom&quot;;
<p>const ProtectedRoute: React.FC = () =&gt; {
const { isLoggedIn } = useAuth();</p>
<pre><code>if (!isLoggedIn) {
    // 유저 정보가 없다면 홈으로! 혹은 로그인페이지로 가게 할 수 있음
    return &amp;lt;Navigate to=&amp;quot;/&amp;quot; replace={true} /&amp;gt;;
}

// 유저 정보가 있다면 자식 컴포넌트를 보여줌
return &amp;lt;Outlet /&amp;gt;;
</code></pre>
<p>};</p>
<p>export default ProtectedRoute;</code></pre></p>
<h3>4. router.tsx 설정</h3>
<p><code>App.js</code>에서 <code>PrivateRoute</code>를 사용하여 특정 경로를 보호합니다.</p>
<pre><code class="language-tsx">// router.tsx
import Detail from &quot;@/components/Detail&quot;;
import DefaultLayout from &quot;@/components/Layouts/DefaultLayout&quot;;
import SignIn from &quot;@/components/SignIn&quot;;
import SignUp from &quot;@/components/SignUp&quot;;
import LedgerPage from &quot;@/components/pages/LedgerPage&quot;;
import MyPage from &quot;@/components/pages/MyPage&quot;;
import { createBrowserRouter } from &quot;react-router-dom&quot;;
import ProtectedRoute from &quot;./ProtectedRoute&quot;;
<p>const router = createBrowserRouter([
{
element: &lt;DefaultLayout /&gt;,
children: [
{
path: &quot;/&quot;,
element: &lt;SignIn /&gt;,
},
{
path: &quot;/sign-up&quot;,
element: &lt;SignUp /&gt;,
},
{
element: &lt;ProtectedRoute /&gt;,
children: [
{
path: &quot;/ledger&quot;,
element: &lt;LedgerPage /&gt;,
},
{
path: &quot;/mypage&quot;,
element: &lt;MyPage /&gt;,
},
{
path: &quot;detail/:id&quot;,
element: &lt;Detail /&gt;,
},
],
},
],
},
]);</p>
<p>export default router;</code></pre></p>
<h3>5. LoginPage 구현</h3>
<p>로그인 페이지에서 사용자 인증을 처리하고, 인증이 완료되면 navigate 시킵니다.</p>
<pre><code class="language-tsx">// SignIn.tsx
import useAuth from &quot;@/hooks/useAuth&quot;;
import { ChangeEvent, useEffect, useId, useState } from &quot;react&quot;;
import { useNavigate } from &quot;react-router-dom&quot;;
import Swal from &quot;sweetalert2&quot;;
<p>function SignIn() {
const navigate = useNavigate();
const idId = useId();
const passwordId = useId();</p>
<pre><code>const { isLoggedIn, logIn } = useAuth();
const [input, setInput] = useState({
    id: &amp;quot;&amp;quot;,
    password: &amp;quot;&amp;quot;,
});

const handleInputChange = (e: ChangeEvent&amp;lt;HTMLInputElement&amp;gt;) =&amp;gt; {
    const id = e.target.id;
    const value = e.target.value;

    switch (id) {
        case idId:
            setInput({ ...input, id: value });
        break;
        case passwordId:
            setInput({ ...input, password: value });
        break;
    }
};

const handleLogInClick = async () =&amp;gt; {
    const data = {
        id: input.id,
        password: input.password,
    };

    try {
        const result = await logIn(data);
        if (result.success) {
            Swal.fire({
                title: &amp;quot;로그인 성공&amp;quot;,
                text: `${result.userId}님 환영합니다`,
                icon: &amp;quot;success&amp;quot;,
            });

            navigate(&amp;quot;/ledger&amp;quot;);
        }
    } catch (error) {
        Swal.fire({
            title: &amp;quot;로그인 에러&amp;quot;,
            text: `에러가 발생했습니다! ${error}`,
            icon: &amp;quot;error&amp;quot;,
        });
    }
};

const handleSignUpClick = () =&amp;gt; {
    navigate(&amp;quot;/sign-up&amp;quot;);
};

useEffect(() =&amp;gt; {
    if (isLoggedIn) {
        navigate(&amp;quot;/ledger&amp;quot;);
    }
}, [isLoggedIn, navigate]);

return (
    &amp;lt;div className=&amp;quot;grid grid-cols-1 gap-y-6&amp;quot;&amp;gt;
        &amp;lt;h1 className=&amp;quot;text-2xl font-semibold text-center&amp;quot;&amp;gt;로그인&amp;lt;/h1&amp;gt;
        &amp;lt;div className=&amp;quot;flex flex-col gap-y-4&amp;quot;&amp;gt;
            &amp;lt;div className=&amp;quot;flex flex-col gap-y-1.5 items-start&amp;quot;&amp;gt;
                &amp;lt;label htmlFor={idId} className=&amp;quot;text-sm font-medium&amp;quot;&amp;gt;
                {&amp;quot;아이디&amp;quot;}
                &amp;lt;/label&amp;gt;
                &amp;lt;input
                    id={idId}
                    className=&amp;quot;border px-4 py-2.5 rounded-md w-80&amp;quot;
                    type=&amp;quot;text&amp;quot;
                    value={input.id}
                    onChange={handleInputChange}
                /&amp;gt;
            &amp;lt;/div&amp;gt;
            &amp;lt;div className=&amp;quot;flex flex-col gap-y-1.5 items-start&amp;quot;&amp;gt;
                &amp;lt;label htmlFor={passwordId} className=&amp;quot;text-sm font-medium&amp;quot;&amp;gt;
                {&amp;quot;비밀번호&amp;quot;}
                &amp;lt;/label&amp;gt;
                &amp;lt;input
                    id={passwordId}
                    className=&amp;quot;border px-4 py-2.5 rounded-md w-80&amp;quot;
                    type=&amp;quot;password&amp;quot;
                    value={input.password}
                    onChange={handleInputChange}
                /&amp;gt;            
            &amp;lt;/div&amp;gt;
        &amp;lt;/div&amp;gt;
        &amp;lt;button
            onClick={handleLogInClick}
            className=&amp;quot;bg-black text-white py-3 text-[15px] rounded-md font-medium hover:bg-black/80 transition active:bg-black/70&amp;quot;
</code></pre>
<p>&gt;<br>
로그인
&lt;/button&gt;
&lt;button
onClick={handleSignUpClick}
className=&quot;bg-black text-white py-3 text-[15px] rounded-md font-medium hover:bg-black/80 transition active:bg-black/70&quot;
&gt;<br>
회원가입
&lt;/button&gt;
&lt;/div&gt;
);
}</p>
<p>export default SignIn;</code></pre></p>
