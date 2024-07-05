<h3 data-ke-size="size23">initializeUser 등의 메서드는 필요없다</h3>
<p data-ke-size="size16">Tanstack Query 로 Auth 를 구성 할 때, 로그인 등의 경우,<br />initializeUser 등을 따로 실행할 필요가 없습니다.</p>
<p data-ke-size="size16">staleTime을 infinity 로 설정하고 로그인 등의 함수에 invalidateQueries 를 해주는 것이 더 좋습니다!</p>
<pre class="typescript"><code>class AuthAPI {
    private axios: Axios;
    private token: string | null;
<pre><code>constructor(axios: Axios) {
    const accessToken: string | null = localStorage.getItem(&quot;accessToken&quot;);
    this.axios = axios;
    this.token = accessToken;
}
</code></pre>
<p>public async initializeUser(accessToken: string | null = this.token) {
try {
const user = await this.getUser(accessToken);
if (user &amp;&amp; user.id &amp;&amp; user.nickname) {
useAuthStore.getState().setUser({
userId: user.id,
avatar: user.avatar ? user.avatar : null,
nickname: user.nickname,
});
useAuthStore.getState().setLoggedIn(true);
} else {
console.log(&quot;토큰 만료, 다시 로그인 하세요&quot;);
}
} catch (error) {
console.log(&quot;유저 데이터 가져오기 실패 =&gt; &quot;, error);
}
}
// ... 하략 ...</code></pre></p>
<p style="color: #333333; text-align: start;" data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이런 형식의 intializeUser 메서드를 만들고 매번 호출하여 쓰는 것보다</p>
<h3 data-ke-size="size23">useQuery 해주고, useEffect 에서 initializeUser(zustand), invalidateQueries</h3>
<pre class="typescript" data-ke-language="typescript"><code>function useAuth() {
    const queryClient = useQueryClient();
    const accessToken: string | null = localStorage.getItem("accessToken");
<pre><code>const { user, isLoggedIn, logOut, setUser, setLoggedIn } = useAuthStore(
    useShallow((state) =&amp;gt; ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        logOut: state.logOut,
        setUser: state.setUser,
        setLoggedIn: state.setLoggedIn,
    }))
);
</code></pre>
<p>// 쿼리 날리고, staleTime : Infinity, retry: 0<br>
const { data: userData, isLoading: userLoading } = useQuery({
queryKey: [&quot;user&quot;, accessToken ?? &quot;&quot;],
queryFn: () =&gt; api.auth.getUser(accessToken),
staleTime: Infinity,
retry: 0,
});</p>
<p>// userData 가 바뀔때, 값이 있으면
// initializeUser 에서 하던 동작 수행
useEffect(() =&gt; {
if (userData) {
try {
if (userData &amp;&amp; userData.id &amp;&amp; userData.nickname) {
setUser({
userId: userData.id,
avatar: userData.avatar ? userData.avatar : null,
nickname: userData.nickname,
});
setLoggedIn(true);
} else {
console.log(&quot;토큰 만료, 다시 로그인 하세요&quot;);
}
} catch (error) {
console.log(&quot;유저 데이터 가져오기 실패 =&gt; &quot;, error);
}
}
}, [userData, setUser, setLoggedIn]);</p>
<p>const { mutateAsync: signUp } = useMutation({
mutationFn: (data: AuthData) =&gt; api.auth.signUp(data),
});</p>
<p>// onSuccess 시 invalidateQueries 로 다시 쿼리 날림
const { mutateAsync: logIn } = useMutation({
mutationFn: (data: AuthData) =&gt; api.auth.logIn(data),
onSuccess: () =&gt; {
queryClient.invalidateQueries({ queryKey: [&quot;user&quot;] });
},
});</p>
<p>const { mutateAsync: getUser } = useMutation({
mutationFn: (accessToken: string | null) =&gt;
api.auth.getUser(accessToken),
});</p>
<p>// onSuccess 시 invalidateQueries 로 다시 쿼리 날림
const { mutateAsync: changeProfile } = useMutation({
mutationFn: ({ accessToken, data }: ChangeProfileParams) =&gt;
api.auth.changeProfile(accessToken, data),
onSuccess: () =&gt; {
queryClient.invalidateQueries({ queryKey: [&quot;user&quot;] });
},
});</p>
<pre><code>return {
    user,
    isLoggedIn,
    signUp,
    logIn,
    getUser,
    changeProfile,
    logOut,
    userLoading,
};
</code></pre>
<p>}</p>
<p>export default useAuth;</code></pre></p>
<p data-ke-size="size16">이렇게 엮어서 쓰는 편이 훨씬 좋습니다~!</p>