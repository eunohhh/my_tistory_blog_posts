<h2 data-ke-size="size26">Auth session missing!</h2>
<p data-ke-size="size16">수파베이스 auth 사용중에<br />자꾸만 마주치는 auth session missing!</p>
<p data-ke-size="size16">이것을 해결하기 위해 별 방법을 다 써보고 했지만</p>
<p data-ke-size="size16"><br />레딧이나 깃헙이슈에도 같은 문제를 겪는 사람들이 많은 걸 보니<br />뭔가 수파베이스에 문제가 있는 것 같기도 합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">아무튼 서버측에서 날리는 fetch 의 결과가<br />tanstack query 의 prefetch query 와 함께 쓸 때</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">미들웨어서는 getUser 가 잡히지만<br />prefetch query에서는 안 잡힌다거나</p>
<p data-ke-size="size16">혹은 자꾸 있었다 없었다 하는 문제를 해결해보고자</p>
<p data-ke-size="size16">(십중팔구 auth session missing...)</p>
<p data-ke-size="size16"><br />안되면 fetch를 할 때 쿠키를 직접 같이 배달해보자라고 생각했습니다.</p>
<p data-ke-size="size16">그래서 fetch 함수를 다음과 같이 작성했습니다.</p>
<h2 data-ke-size="size26">fetch</h2>
<pre class="typescript"><code>export async function getBuddyServer(
    userId: string | null,
): Promise&lt;Buddy | null&gt; {
    const cookieStore = cookies();
    const cookiesArray = cookieStore.getAll();
<pre><code>if (cookiesArray.length === 0) {
    return null;
}

const url = `/api/auth/buddy`;
try {
    if (!userId) return null;
    const data = await fetchWrapper&amp;lt;Buddy&amp;gt;(url, {
        method: 'POST',
        body: JSON.stringify({ userId }),
        cache: 'no-store',
        headers: {
            Cookie: cookiesArray
                .map(cookie =&amp;gt; `${cookie.name}=${cookie.value}`)
                .join(';'),
        },
        next: { tags: ['buddy'] },
    });
    return data;
} catch (error: any) {
    if (error.message === 'Auth session missing!') {
        return null;
    }
    throw error;
}
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">nextjs 가 지원하는 cookies 를 사용해서<br />현재 쿠키를 전부 가져온다음<br />headers에 cookie에 넣어버립니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그러고도 catch 되는 에러가 'Auth session missing!'<br />이면 그냥 null 리턴하게 일단 처리했는데<br />이것이 맞는 방법인지는 모르겠습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">어쨌거나 이 방법을 통해 툭하면 나타나는</p>
<p data-ke-size="size16">Auth session missing! 문제는 해결이 되었습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">하지만 여전히 찝찝한 이 기분은...??</p>