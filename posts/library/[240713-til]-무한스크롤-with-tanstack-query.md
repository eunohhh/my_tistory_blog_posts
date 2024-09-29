<h2 data-ke-size="size26">1. 라이브러리 설치</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>리액트 인터섹션 옵저버 설치</li>
</ul>
<pre class="angelscript"><code>npm install react-intersection-observer</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>탠스택쿼리 설치</li>
</ul>
<pre class="coffeescript"><code>npm install @tanstack/react-query @tanstack/react-query-devtools</code></pre>
<h2 data-ke-size="size26">2. 탠스택쿼리 프로바이더 설정</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>프로바이더 만들기</li>
</ul>
<pre class="javascript"><code>"use client";
import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
<p>function makeQueryClient() {
return new QueryClient({
defaultOptions: {
queries: {
// SSR을 사용하면 일반적으로 기본 staleTime을
// 0 이상으로 설정하여 클라이언트에서 즉시 리프레시되지 않도록 합니다.
refetchOnWindowFocus: false,
retry: false,
staleTime: 60 * 1000,
},
},
});
}</p>
<p>// undefined 로 초기값 설정
let browserQueryClient: QueryClient | undefined = undefined;</p>
<p>function getQueryClient() {
if (isServer) {
// 서버: 항상 새 쿼리 클라이언트 만들기
return makeQueryClient();
} else {
if (!browserQueryClient) browserQueryClient = makeQueryClient();
return browserQueryClient;
}
}</p>
<p>function QueryProvider({ children }: { children: React.ReactNode }) {</p>
<pre><code>const queryClient = getQueryClient();

// 데브툴즈 initialIsOpen 꼭 아래처럼 설정해야 서버 오류 안남
return (
    &amp;lt;QueryClientProvider client={queryClient}&amp;gt;
    {children}
    &amp;lt;ReactQueryDevtools initialIsOpen={process.env.NEXT_PUBLIC_RUN_MODE === &quot;local&quot;} /&amp;gt;
    &amp;lt;/QueryClientProvider&amp;gt;
);
</code></pre>
<p>}</p>
<p>export default QueryProvider;</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>프로바이더로 감싸기</li>
</ul>
<pre class="dust"><code>&lt;QueryProvider&gt;{children}&lt;/QueryProvider&gt;</code></pre>
<h2 data-ke-size="size26">3. Route handler 작성</h2>
<pre class="javascript"><code>// constants.ts
export const ITEMS_PER_PAGE = 5;
<p>// api/posts
import { ITEMS_PER_PAGE } from &quot;@/constants/constants&quot;;
import createClient from &quot;@/supabase/supabaseServer&quot;;
import { Post } from &quot;@/types/typs&quot;;
import { QueryError } from &quot;@supabase/supabase-js&quot;;
import { NextRequest } from &quot;next/server&quot;;</p>
<p>export async function GET(req: NextRequest) {
const { searchParams } = new URL(req.url);
const pageString = searchParams.get(&quot;page&quot;);</p>
<pre><code>if(pageString) {
    const supabase = createClient();
    const page = Number(pageString);
    const start = page * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    const { data, error }: { data: Post[]; error: QueryError } = 
    await supabaseClient
        .from(&quot;posts&quot;)
        .select(&quot;*&quot;)
        .order(&quot;created_at&quot;, { ascending: false }) // 생성일 정렬
        .range(start, end); // 데이터 범위 설정

    if (error) {
        return new Response(JSON.stringify(error.message), { status: 401 });
    }

    return new Response(JSON.stringify(data), { status : 200 });
}

return new Response(JSON.stringify({data : &quot;파라미터 누락&quot;}, { status : 401 }));
</code></pre>
<p>}</code></pre></p>
<h2 data-ke-size="size26">4. fetch 함수 작성</h2>
<pre class="typescript"><code>// getInfinitePosts.tsx
import { Post } from "@/types/typs";
import { QueryFunctionContext } from "@tanstack/react-query";
<p>export async function getInfinitePosts({
pageParam = 0,
}: QueryFunctionContext&lt;string[], number&gt;): Promise&lt;Place[]&gt; {</p>
<pre><code>const response = await fetch(
`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts?page=${pageParam}`, {
    method: &quot;GET&quot;,
    next: {
        tags: [&quot;postsInfinite&quot;],
    },
    cache: &quot;no-store&quot;,
});

if (!response.ok) {
    throw new Error(&quot;fetch 실패&quot;);
}

const data = await response.json();
return data;
</code></pre>
<p>}</code></pre></p>
<h2 data-ke-size="size26">5. 서버컴포넌트</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>page.tsx</li>
</ul>
<pre class="javascript"><code>export default function Home() {
    return (
        &lt;Suspense fallback={&lt;Loading /&gt;}&gt;
            &lt;PostListSuspense /&gt;
            &lt;TopButton /&gt;
        &lt;/Suspense&gt;
    );
}</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>PostListSuspense</li>
</ul>
<pre class="javascript"><code>import { getInfinitePosts } from "@/api/getInfinitePosts";
import { Place } from "@/types/typs";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
<p>export default async function PostListSuspense() {
const queryClient = new QueryClient();
await queryClient.prefetchInfiniteQuery({
queryKey: [&quot;postsInfinite&quot;],
initialPageParam: 0,
getNextPageParam: (lastPage: Post[], allPages: Post[][]) =&gt; {
if (lastPage.length === 0) return null;
return allPages.length;
},
queryFn: getInfinitePosts,
pages: 1, // 설정한 페이지 단위 중 첫 1페이지만 가져옴
});</p>
<pre><code>const dehydratedState = dehydrate(queryClient);

return (
    &amp;lt;HydrationBoundary state={dehydratedState}&amp;gt;
        &amp;lt;Component /&amp;gt;
    &amp;lt;/HydrationBoundary&amp;gt;
);
</code></pre>
<p>}</code></pre></p>
<h2 data-ke-size="size26">6. 클라이언트 컴포넌트</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Blabla.tsx</li>
</ul>
<pre class="javascript"><code>"use client";
import { getInfinitePosts } from "@/api/getInfinitePosts";
import { Place } from "@/types/typs";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "./InfiniteScroll";
import PostCard from "./PostCard";
<p>function  컴포넌트명() {
const {
data: posts = [],
isFetching,
fetchNextPage,
hasNextPage,
} = useInfiniteQuery({
queryKey: [&quot;postsInfinite&quot;],
initialPageParam: 5,
getNextPageParam: (lastPage: Post[], allPages: Post[][]) =&gt; {
if (lastPage.length === 0) return null;
return allPages.length;
},
queryFn: getInfinitePosts,
select: (data) =&gt; data.pages.flat(),
});</p>
<pre><code>return (
&amp;lt;InfiniteScroll fetchNextPage={fetchNextPage} hasNextPage={hasNextPage}&amp;gt;
    &amp;lt;ul&amp;gt;
    {posts.map((post) =&amp;gt; post &amp;amp;&amp;amp; &amp;lt;PostCard key={post.id} place={post} /&amp;gt;)}
    {isFetching &amp;amp;&amp;amp; &amp;lt;li className=&quot;text-center&quot;&amp;gt;Loading...&amp;lt;/li&amp;gt;}
    &amp;lt;/ul&amp;gt;
&amp;lt;/InfiniteScroll&amp;gt;
);
</code></pre>
<p>}</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>InfiniteScroll.tsx</li>
</ul>
<pre class="routeros"><code>"use client";
<p>import { useEffect } from &quot;react&quot;;
import { useInView } from &quot;react-intersection-observer&quot;;</p>
<p>const InfiniteScroll = ({
fetchNextPage,
hasNextPage,
children,
}: {
fetchNextPage: () =&gt; void;
hasNextPage: boolean;
children: React.ReactNode;
}) =&gt; {</p>
<pre><code>const { ref, inView } = useInView({ threshold: 0 });

useEffect(() =&amp;gt; {
    if (!(inView &amp;amp;&amp;amp; hasNextPage)) return;
    fetchNextPage();
}, [inView, hasNextPage, fetchNextPage]);

return (
    &amp;lt;&amp;gt;
        {children}
        &amp;lt;div className=&quot;h-[20px]&quot; ref={ref} /&amp;gt;
    &amp;lt;/&amp;gt;
);
</code></pre>
<p>};</p>
<p>export default InfiniteScroll;</code></pre></p>
