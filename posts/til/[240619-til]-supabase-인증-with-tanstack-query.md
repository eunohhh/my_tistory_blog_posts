<p>리액트에서 Context API를 사용하지 않고 Tanstack Query를 사용하여 Supabase의 인증 상태를 관리하고 확인하는 방법은 다음과 같습니다.</p>
<h3>1. Tanstack Query 설정</h3>
<pre><code class="language-javascript">import { QueryClient, QueryClientProvider, useQuery } from &#39;react-query&#39;;
import { supabase } from &#39;./supabaseClient&#39;;
<p>const queryClient = new QueryClient();</p>
<p>function App() {
return (
&lt;QueryClientProvider client={queryClient}&gt;
&lt;AuthChecker /&gt;
&lt;/QueryClientProvider&gt;
);
}</code></pre></p>
<h3>2. 인증 상태 확인</h3>
<pre><code class="language-javascript">const fetchSession = async () =&gt; {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return session;
};
<p>const AuthChecker = () =&gt; {
const { data: session, error, isLoading } = useQuery('authSession', fetchSession);</p>
<p>if (isLoading) return &lt;div&gt;Loading...&lt;/div&gt;;
if (error) return &lt;div&gt;Error: {error.message}&lt;/div&gt;;</p>
<p>return (
&lt;div&gt;
{session ? 'Logged in' : 'Logged out'}
&lt;/div&gt;
);
};</code></pre></p>
<h3>3. 인증 상태 변화 감지</h3>
<pre><code class="language-javascript">import { useEffect } from &#39;react&#39;;
import { useQueryClient } from &#39;react-query&#39;;
<p>const AuthListener = () =&gt; {
const queryClient = useQueryClient();</p>
<p>useEffect(() =&gt; {
const { data: authListener } = supabase.auth.onAuthStateChange(() =&gt; {
queryClient.invalidateQueries('authSession');
});</p>
<pre><code>return () =&amp;gt; {
  authListener.subscription.unsubscribe();
};
</code></pre>
<p>}, [queryClient]);</p>
<p>return null;
};</p>
<p>const App = () =&gt; (
&lt;QueryClientProvider client={queryClient}&gt;
&lt;AuthChecker /&gt;
&lt;AuthListener /&gt;
&lt;/QueryClientProvider&gt;
);</code></pre></p>
<p>이 코드는 Tanstack Query를 사용하여 Supabase의 인증 상태를 관리하고, 인증 상태 변화 시 UI를 업데이트하는 방법을 보여줍니다.</p>
<h3>예제추가</h3>
<pre><code class="language-javascript">// 세션 변화에 따라 상세한 분기 처리 필요할 때
const { data } = supabase.auth.onAuthStateChange((event, session) =&gt; {
  console.log(event, session)
<p>if (event === 'INITIAL_SESSION') {
// handle initial session
} else if (event === 'SIGNED_IN') {
// handle sign in event
} else if (event === 'SIGNED_OUT') {
// handle sign out event
} else if (event === 'PASSWORD_RECOVERY') {
// handle password recovery event
} else if (event === 'TOKEN_REFRESHED') {
// handle token refreshed event
} else if (event === 'USER_UPDATED') {
// handle user updated event
}
})</p>
<p>// 단순히 로그인 여부에 따른 분기 처리가 필요할 때
const { data } = supabase.auth.onAuthStateChange((event, session) =&gt; {
console.log(event, session)</p>
<p>if (session) {
// 로그인 상태로 변경
} else {
// 로그아웃 상태로 변경
}
})</code></pre></p>
<pre><code class="language-javascript">// 리액트에서 많이 쓰는 패턴
// src/context/AuthProvider.jsx
import { useEffect } from &quot;react&quot;;
import { useState } from &quot;react&quot;;
import { createContext } from &quot;react&quot;;
import { supabase } from &quot;../supabase/supabaseClient&quot;;

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() =&gt; {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) =&gt; {
      console.log(event, session);

      if (session) {
                setIsLogin(true);
      } else {
        setIsLogin(false);
      }
    });

    // 전역적으로 사용될 경우 구독해제가 필요한 코드는 아님.
    return () =&gt; subscription.unsubscribe();
  }, []);
  return (
    &lt;AuthContext.Provider value={{ isLogin, setIsLogin }}&gt;
      {children}
    &lt;/AuthContext.Provider&gt;
  );
}</code></pre>