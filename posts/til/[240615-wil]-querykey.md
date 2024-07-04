<h2 data-ke-size="size26">useQuery 의 queryKey 배열에 대해 설명해주세요</h2>
<p data-ke-size="size16"><code>useQuery</code>의 <code>queryKey</code>는 React Query에서 캐싱 및 상태 관리의 핵심 요소입니다. <code>queryKey</code>는 쿼리의 고유한 식별자로 사용되며, React Query는 이를 기반으로 데이터 캐싱, 데이터 무효화, 리패칭 등을 관리합니다.</p>
<h3 data-ke-size="size23"><code>queryKey</code>의 역할</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>데이터 캐싱 및 식별</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>queryKey</code>는 쿼리의 고유 식별자입니다. 동일한 <code>queryKey</code>를 가진 쿼리는 동일한 데이터 캐시를 공유합니다.</li>
<li>React Query는 <code>queryKey</code>를 사용하여 캐시된 데이터를 저장하고 검색합니다.</li>
</ul>
</li>
<li><b>쿼리 무효화 및 리패칭</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>특정 <code>queryKey</code>를 가진 쿼리를 무효화하면, React Query는 해당 <code>queryKey</code>에 대한 데이터를 무효화하고, 필요에 따라 다시 패칭할 수 있습니다.</li>
<li>예를 들어, <code>queryClient.invalidateQueries(['todos'])</code>를 호출하면 <code>['todos']</code> 키를 가진 모든 쿼리가 무효화됩니다.</li>
</ul>
</li>
<li><b>조건부 쿼리 실행</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>queryKey</code> 배열의 요소를 사용하여 조건부로 쿼리를 실행할 수 있습니다.</li>
<li>예를 들어, 특정 사용자의 데이터를 가져올 때 사용자 ID를 <code>queryKey</code>에 포함하여 해당 사용자의 데이터만 가져올 수 있습니다.</li>
</ul>
</li>
</ol>
<h3 data-ke-size="size23"><code>queryKey</code>의 구성</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>기본 키</b>: 주로 문자열로 구성된 고유 식별자입니다. 예: <code>['todos']</code>, <code>['user', userId]</code>.</li>
<li><b>다중 요소 키</b>: 배열 형태로, 여러 요소를 포함할 수 있습니다. 예: <code>['user', userId, { filter: 'active' }]</code>.</li>
</ul>
<h3 data-ke-size="size23">예제</h3>
<h4 data-ke-size="size20">단일 요소 <code>queryKey</code></h4>
<pre class="javascript"><code>import { useQuery } from '@tanstack/react-query';
<p>const fetchTodos = async () =&gt; {
const response = await fetch('/api/todos');
return response.json();
};</p>
<p>function Todos() {
const { data, isLoading, error } = useQuery(['todos'], fetchTodos);</p>
<p>if (isLoading) return &lt;div&gt;Loading...&lt;/div&gt;;
if (error) return &lt;div&gt;Error: {error.message}&lt;/div&gt;;</p>
<p>return (
&lt;ul&gt;
{data.map(todo =&gt; (
&lt;li key={todo.id}&gt;{todo.title}&lt;/li&gt;
))}
&lt;/ul&gt;
);
}</code></pre></p>
<h4 data-ke-size="size20">다중 요소 <code>queryKey</code></h4>
<pre class="javascript"><code>import { useQuery } from '@tanstack/react-query';
<p>const fetchUser = async ({ queryKey }) =&gt; {
const [_key, userId] = queryKey;
const response = await fetch(<code>/api/users/${userId}</code>);
return response.json();
};</p>
<p>function User({ userId }) {
const { data, isLoading, error } = useQuery(['user', userId], fetchUser);</p>
<p>if (isLoading) return &lt;div&gt;Loading...&lt;/div&gt;;
if (error) return &lt;div&gt;Error: {error.message}&lt;/div&gt;;</p>
<p>return (
&lt;div&gt;
&lt;h1&gt;{data.name}&lt;/h1&gt;
&lt;p&gt;{data.email}&lt;/p&gt;
&lt;/div&gt;
);
}</code></pre></p>
<h3 data-ke-size="size23">조건부 쿼리 실행</h3>
<pre class="javascript"><code>import { useQuery } from '@tanstack/react-query';
<p>const fetchUser = async ({ queryKey }) =&gt; {
const [_key, userId] = queryKey;
if (!userId) throw new Error('No user ID provided');
const response = await fetch(<code>/api/users/${userId}</code>);
return response.json();
};</p>
<p>function User({ userId }) {
const { data, isLoading, error } = useQuery(['user', userId], fetchUser, {
enabled: !!userId, // userId가 있을 때만 쿼리 실행
});</p>
<p>if (!userId) return &lt;div&gt;Please provide a user ID&lt;/div&gt;;
if (isLoading) return &lt;div&gt;Loading...&lt;/div&gt;;
if (error) return &lt;div&gt;Error: {error.message}&lt;/div&gt;;</p>
<p>return (
&lt;div&gt;
&lt;h1&gt;{data.name}&lt;/h1&gt;
&lt;p&gt;{data.email}&lt;/p&gt;
&lt;/div&gt;
);
}</code></pre></p>
<h3 data-ke-size="size23">요약</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>고유 식별자</b>: <code>queryKey</code>는 쿼리의 고유한 식별자로 사용되어 데이터 캐싱, 검색, 무효화 등을 관리합니다.</li>
<li><b>다중 요소</b>: 배열 형태로 여러 요소를 포함할 수 있어 조건부 쿼리 실행, 고유한 데이터 관리 등에 유용합니다.</li>
<li><b>조건부 실행</b>: <code>queryKey</code>의 요소를 사용하여 쿼리를 조건부로 실행할 수 있습니다.</li>
</ul>
<p data-ke-size="size16">React Query에서 <code>queryKey</code>는 데이터의 고유성을 보장하고, 상태 관리 및 캐싱 메커니즘을 효율적으로 처리하는 데 중요한 역할을 합니다.</p>
<h2 data-ke-size="size26">queryKey 배열의 두번째 요소로 accessToken 을 넣는 경우?</h2>
<p data-ke-size="size16"><code>queryKey</code> 배열에 <code>accessToken</code>을 두 번째 요소로 넣는 이유는 React Query의 캐시 키를 더 구체적으로 만들어주기 위해서입니다. 이를 통해 여러 사용자 또는 여러 세션에서 서로 다른 데이터를 관리하고, 캐시를 효과적으로 분리할 수 있습니다.</p>
<h3 data-ke-size="size23">이유 및 효과</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>캐시 분리</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>queryKey</code> 배열의 각 요소는 캐시 키의 일부로 사용됩니다. <code>["user", accessToken]</code>을 사용하면, 각 <code>accessToken</code>에 대해 고유한 캐시 엔트리가 생성됩니다.</li>
<li>예를 들어, 사용자 A와 사용자 B의 <code>accessToken</code>이 다르기 때문에, 두 사용자에 대해 고유한 캐시가 생성됩니다. 따라서 사용자 A의 데이터는 사용자 B의 데이터와 섞이지 않습니다.</li>
</ul>
</li>
<li><b>데이터 무효화</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>queryKey</code>는 쿼리를 무효화할 때도 사용됩니다. <code>invalidateQueries(["user", accessToken])</code>을 호출하면 특정 <code>accessToken</code>에 대한 데이터만 무효화됩니다.</li>
<li>이 방식으로 특정 사용자의 데이터만 무효화하거나 새로고침할 수 있습니다.</li>
</ul>
</li>
</ol>
<h3 data-ke-size="size23">예시 코드</h3>
<p data-ke-size="size16">아래 예시에서는 <code>accessToken</code>이 쿼리 키의 일부로 사용됩니다. 이를 통해 사용자별로 고유한 데이터를 관리합니다.</p>
<pre class="pf"><code>import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useAuthStore } from "@/zustand/auth.store";
import api from "@/api/api";
import { AuthData, AxiosReturn } from "@/types/d";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { AxiosError } from "axios";
<p>interface ChangeProfileParams {
accessToken: string | null;
data: AuthData;
}</p>
<p>function useAuth() {
const queryClient = useQueryClient();
const { user, isLoggedIn, logOut, setUser, setLoggedIn } = useAuthStore(
useShallow((state) =&gt; ({
user: state.user,
isLoggedIn: state.isLoggedIn,
logOut: state.logOut,
setUser: state.setUser,
setLoggedIn: state.setLoggedIn,
}))
);</p>
<pre><code>const accessToken = localStorage.getItem(&quot;accessToken&quot;);

const { data: userData, isLoading: userLoading } = useQuery&amp;lt;AxiosReturn, AxiosError&amp;gt;({
    queryKey: [&quot;user&quot;, accessToken ?? &quot;&quot;],
    queryFn: () =&amp;gt; api.auth.getUser(accessToken!),
    staleTime: Infinity,
    retry: 0,
    onError: (error) =&amp;gt; {
        if (error instanceof AxiosError) {
            console.log(&quot;유저 데이터 가져오기 실패 =&amp;gt; &quot;, error.response?.data.message);
        } else {
            console.log(&quot;유저 데이터 가져오기 실패&quot;);
        }
    },
});

// 이 효과를 사용하여 쿼리가 성공적으로 완료된 후 데이터를 설정합니다.
useEffect(() =&amp;gt; {
    if (userData &amp;amp;&amp;amp; userData.id &amp;amp;&amp;amp; userData.nickname) {
        setUser({
            userId: userData.id,
            avatar: userData.avatar ? userData.avatar : null,
            nickname: userData.nickname,
        });
        setLoggedIn(true);
    }
}, [userData, setUser, setLoggedIn]);

const { mutateAsync: signUp } = useMutation({
    mutationFn: (data: AuthData) =&amp;gt; api.auth.signUp(data),
});

const { mutateAsync: logIn } = useMutation({
    mutationFn: (data: AuthData) =&amp;gt; api.auth.logIn(data),
});

const { mutateAsync: changeProfile } = useMutation({
    mutationFn: ({ accessToken, data }: ChangeProfileParams) =&amp;gt;
        api.auth.changeProfile(accessToken, data),
    onSuccess: () =&amp;gt; {
        queryClient.invalidateQueries({ queryKey: [&quot;user&quot;, accessToken ?? &quot;&quot;] });
    },
});

return { user, isLoggedIn, signUp, logIn, changeProfile, logOut, userLoading };
</code></pre>
<p>}</p>
<p>export default useAuth;</code></pre></p>
<h3 data-ke-size="size23">요약</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>캐시 분리</b>: <code>queryKey</code>에 <code>accessToken</code>을 포함하여 각 사용자의 데이터를 별도로 관리합니다.</li>
<li><b>데이터 무효화</b>: 특정 사용자의 데이터를 무효화하거나 새로고침할 때 <code>accessToken</code>을 사용하여 정확한 데이터를 타겟팅할 수 있습니다.</li>
<li><b>보안</b>: 각 사용자의 데이터를 별도로 관리함으로써 보안을 강화하고 데이터의 혼합을 방지합니다.</li>
</ul>
<p data-ke-size="size16">이 방식은 React Query의 강력한 캐싱 및 데이터 관리 기능을 활용하여 응용 프로그램의 성능과 유연성을 향상시키는 데 매우 유용합니다.</p>