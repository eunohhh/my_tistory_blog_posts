<p data-ke-size="size16">tanstack query 의 공식문서 중 Prefetching &amp; Router Integration 항목을 공부하였습니다.<br />아래 내용을 정리합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">Prefetching &amp; Router Integration</h2>
<p data-ke-size="size16">특정 데이터가 필요할 것으로 예상되는 경우 미리 가져오기를 사용하여 캐시를 해당 데이터로 미리 채우면 더 빠른 환경을 제공할 수 있습니다.</p>
<p data-ke-size="size16">몇 가지 다른 프리페칭 패턴이 있습니다:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>이벤트 핸들러에서</li>
<li>컴포넌트에서</li>
<li>라우터 통합을 통해</li>
<li>서버 렌더링 중(라우터 통합의 또 다른 형태)</li>
</ol>
<p data-ke-size="size16">이 가이드에서는 처음 세 가지를 살펴보고, 네 번째는 서버 렌더링 및 수화 가이드와 고급 서버 렌더링 가이드에서 자세히 다룰 것입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">프리페칭의 구체적인 용도 중 하나는 요청 워터폴을 피하는 것인데, 이에 대한 자세한 배경과 설명은 성능 및 요청 워터폴 가이드를 참조하세요.</p>
<h2 data-ke-size="size26">prefetchQuery &amp; prefetchInfiniteQuery</h2>
<p data-ke-size="size16">다양한 특정 프리페치 패턴을 살펴보기 전에 prefetchQuery 및 prefetchInfiniteQuery 함수에 대해 살펴보겠습니다. 먼저 몇 가지 기본 사항부터 살펴보겠습니다:</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">기본적으로 이 함수는 queryClient에 대해 구성된 기본 staleTime을 사용하여 캐시에 있는 기존 데이터가 최신 데이터인지 아니면 다시 가져와야 하는지 여부를 결정합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">다음과 같이 특정 staleTime을 전달할 수도 있습니다:<br /><code>prefetchQuery({ queryKey: ['todos'], queryFn: fn, staleTime: 5000 })</code></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 staleTime은 프리페치에만 사용되며, 모든 useQuery 호출에 대해서도 설정해야 합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">staleTime을 무시하고 대신 캐시에서 데이터를 사용할 수 있는 경우 항상 데이터를 반환하려면 ensureQueryData 함수를 사용하면 됩니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">팁: 서버에서 프리페칭하는 경우, 각 프리페칭 호출에 특정 staleTime을 전달할 필요가 없도록 해당 queryClient에 대해 0보다 큰 기본 staleTime을 설정하세요.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">프리페치된 쿼리에 대해 useQuery의 인스턴스가 나타나지 않으면, gcTime에 지정된 시간 후에 쿼리가 삭제되고 가비지 수집됩니다.</p>
<p data-ke-size="size16">이 함수는 <code>Promise&lt;void&gt;</code>를 반환하므로 쿼리 데이터를 반환하지 않습니다.</p>
<p data-ke-size="size16"><br />이러한 기능이 필요한 경우 대신 fetchQuery/fetchInfiniteQuery를 사용하세요.</p>
<p data-ke-size="size16">프리페치 함수는 일반적으로 사용 쿼리에서 다시 페치를 시도하기 때문에 오류가 발생하지 않습니다.</p>
<p data-ke-size="size16"><br />오류를 잡아야 하는 경우 대신 fetchQuery/fetchInfiniteQuery를 사용하세요.</p>
<pre class="dart"><code>const prefetchTodos = async () =&gt; {
  // 이 쿼리의 결과는 일반 쿼리처럼 캐시됩니다.
  await queryClient.prefetchQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">무한 쿼리는 일반 쿼리처럼 프리페치할 수 있습니다.</p>
<p data-ke-size="size16">기본적으로 쿼리의 첫 페이지만 프리페치되며 지정된 QueryKey 아래에 저장됩니다.</p>
<p data-ke-size="size16">두 개 이상의 페이지를 프리페치하려면 pages 옵션을 사용할 수 있으며, 이 경우 getNextPageParam 함수도 제공해야 합니다:</p>
<pre class="dart"><code>const prefetchProjects = async () =&gt; {
  // 이 쿼리의 결과는 일반 쿼리처럼 캐시됩니다.
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =&gt; lastPage.nextCursor,
    pages: 3, // prefetch the first 3 pages
  })
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">다음으로 다양한 상황에서 이러한 방법과 다른 방법으로 프리페칭을 사용하는 방법을 살펴보겠습니다.</p>
<h2 data-ke-size="size26">이벤트 핸들러에서 prefetch</h2>
<p data-ke-size="size16">프리페칭의 가장 간단한 형태는 사용자가 무언가와 상호작용할 때 프리페칭을 수행하는 것입니다.</p>
<p data-ke-size="size16">이 예제에서는 queryClient.prefetchQuery를 사용하여 onMouseEnter 또는 onFocus에서 프리페칭을 시작하겠습니다.</p>
<pre class="javascript"><code>function ShowDetailsButton() {
  const queryClient = useQueryClient()
<p>const prefetch = () =&gt; {
queryClient.prefetchQuery({
queryKey: ['details'],
queryFn: getDetailsData,
// Prefetch only fires when data is older than the staleTime,
// so in a case like this you definitely want to set one
staleTime: 60000,
})
}</p>
<p>return (
&lt;button onMouseEnter={prefetch} onFocus={prefetch} onClick={...}&gt;
Show Details
&lt;/button&gt;
)
}</code></pre></p>
<h2 data-ke-size="size26">컴포넌트에서 prefetch</h2>
<p data-ke-size="size16">컴포넌트 수명 주기 중 프리페칭은 일부 자식이나 하위 컴포넌트에 특정 데이터가 필요하지만 다른 쿼리의 로드가 완료될 때까지 렌더링할 수 없을 때 유용합니다. 요청 워터폴 가이드(request waterfall guide)의 예를 빌려 설명해 보겠습니다:</p>
<pre class="dust"><code>function Article({ id }) {
  const { data: articleData, isPending } = useQuery({
    queryKey: ['article', id],
    queryFn: getArticleById,
  })
<p>if (isPending) {
return 'Loading article...'
}</p>
<p>return (
&lt;&gt;
&lt;ArticleHeader articleData={articleData} /&gt;
&lt;ArticleBody articleData={articleData} /&gt;
&lt;Comments id={id} /&gt;
&lt;/&gt;
)
}</p>
<p>function Comments({ id }) {
const { data, isPending } = useQuery({
queryKey: ['article-comments', id],
queryFn: getArticleCommentsById,
})</p>
<p>...
}</code></pre></p>
<p data-ke-size="size16">이렇게 하면 request waterfall이 다음과 같이 표시됩니다:</p>
<pre class="isbl"><code>1. |&gt; getArticleById()
2.   |&gt; getArticleCommentsById()</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">해당 가이드에서 언급했듯이 이 워터폴을 평평하게 하고 성능을 개선하는 한 가지 방법은 getArticleCommentsById 쿼리를 부모로 올리고 결과를 소품으로 전달하는 것이지만, 구성 요소가 서로 관련이 없고 그 사이에 여러 수준이 있는 경우와 같이 이것이 가능하지 않거나 바람직하지 않은 경우에는 어떻게 해야 할까요?</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 경우 대신 부모에서 쿼리를 프리페치할 수 있습니다. 가장 간단한 방법은 쿼리를 사용하되 결과를 무시하는 것입니다:</p>
<pre class="xquery"><code>function Article({ id }) {
  const { data: articleData, isPending } = useQuery({
    queryKey: ['article', id],
    queryFn: getArticleById,
  })
<p>// Prefetch
useQuery({
queryKey: ['article-comments', id],
queryFn: getArticleCommentsById,
// Optional optimization to avoid rerenders when this query changes:
notifyOnChangeProps: [],
})</p>
<p>if (isPending) {
return 'Loading article...'
}</p>
<p>return (
&lt;&gt;
&lt;ArticleHeader articleData={articleData} /&gt;
&lt;ArticleBody articleData={articleData} /&gt;
&lt;Comments id={id} /&gt;
&lt;/&gt;
)
}</p>
<p>function Comments({ id }) {
const { data, isPending } = useQuery({
queryKey: ['article-comments', id],
queryFn: getArticleCommentsById,
})</p>
<p>...
}</code></pre></p>
<p data-ke-size="size16">이렇게 하면 '기사 댓글'을 즉시 가져오기 시작하고 워터폴이 평평해집니다:</p>
<pre class="isbl"><code>1. |&gt; getArticleById()
1. |&gt; getArticleCommentsById()</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">Suspense와 함께 프리페칭하려면 조금 다르게 처리해야 합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">프리페치가 컴포넌트의 렌더링을 차단하기 때문에 프리페치에 useSuspenseQueries를 사용할 수 없습니다.</p>
<p data-ke-size="size16">또한 프리페치에 useQuery를 사용할 수 없는데, 이는 서스펜스 쿼리가 해결될 때까지 프리페치가 시작되지 않기 때문입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 시나리오의 경우 라이브러리에서 사용 가능한 usePrefetchQuery 또는 usePrefetchInfiniteQuery 훅을 사용할 수 있습니다.</p>
<p data-ke-size="size16">이제 실제로 데이터가 필요한 컴포넌트에서 useSuspenseQuery를 사용할 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">프리페칭 중인 "secondary" 쿼리가 "primary" 데이터의 렌더링을 차단하지 않도록 이 이후 컴포넌트를 자체 <code>&lt;Suspense&gt;</code> boundary 로 감싸는 것이 좋습니다.</p>
<pre class="javascript"><code>function App() {
  usePrefetchQuery({
    queryKey: ['articles'],
    queryFn: (...args) =&gt; {
      return getArticles(...args)
    },
  })
<p>return (
&lt;Suspense fallback=&quot;Loading articles...&quot;&gt;
&lt;Articles /&gt;
&lt;/Suspense&gt;
)
}</p>
<p>function Articles() {
const { data: articles } = useSuspenseQuery({
queryKey: ['articles'],
queryFn: (...args) =&gt; {
return getArticles(...args)
},
})</p>
<p>return articles.map((article) =&gt; (
&lt;div key={articleData.id}&gt;
&lt;ArticleHeader article={article} /&gt;
&lt;ArticleBody article={article} /&gt;
&lt;/div&gt;
))
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">또 다른 방법은 쿼리 함수 내부에서 미리 가져오는 것입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 방법은 문서를 가져올 때마다 댓글도 필요할 가능성이 높다는 것을 알고 있는 경우에 적합합니다.<br />이를 위해 queryClient.prefetchQuery를 사용하겠습니다:</p>
<pre class="javascript"><code>const queryClient = useQueryClient()
const { data: articleData, isPending } = useQuery({
  queryKey: ['article', id],
  queryFn: (...args) =&gt; {
    queryClient.prefetchQuery({
      queryKey: ['article-comments', id],
      queryFn: getArticleCommentsById,
    })
<pre><code>return getArticleById(...args)
</code></pre>
<p>},
})</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이펙트의 프리페칭도 작동하지만, 같은 컴포넌트에서 useSuspenseQuery를 사용하는 경우 쿼리가 완료될 때까지 이 효과가 실행되지 않으므로 원하는 것과 다를 수 있다는 점에 유의하세요.</p>
<pre class="lisp"><code>const queryClient = useQueryClient()
<p>useEffect(() =&gt; {
queryClient.prefetchQuery({
queryKey: ['article-comments', id],
queryFn: getArticleCommentsById,
})
}, [queryClient, id])</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">다시 정리하자면, 컴포넌트 수명 주기 동안 쿼리를 미리 가져오려면 몇 가지 다른 방법이 있으므로 상황에 가장 적합한 방법을 선택하세요:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>usePrefetchQuery 또는 usePrefetchInfiniteQuery 훅을 사용하여 서스펜스 경계 전에 프리페치하기</li>
<li>사용 쿼리 또는 사용 서스펜스 쿼리를 사용하고 결과를 무시합니다.</li>
<li>쿼리 함수 내부에서 프리페치</li>
<li>효과에서 프리페치</li>
</ul>
<p data-ke-size="size16">다음으로 조금 더 고급 사례를 살펴보겠습니다.</p>
<h2 data-ke-size="size26">종속 쿼리(Dependant Queries) 및 코드 분할(Code Splitting)</h2>
<p data-ke-size="size16">때로는 다른 가져오기 결과에 따라 조건부로 미리 가져오기를 하고 싶을 때가 있습니다.</p>
<pre class="kotlin"><code>// GraphFeedItem 컴포넌트를 지연 로드합니다.
// 렌더링이 시작되기 전에는 로딩을 시작하지 않습니다.
const GraphFeedItem = React.lazy(() =&gt; import('./GraphFeedItem'))
<p>function Feed() {
const { data, isPending } = useQuery({
queryKey: ['feed'],
queryFn: getFeed,
})</p>
<p>if (isPending) {
return 'Loading feed...'
}</p>
<p>return (
&lt;&gt;
{data.map((feedItem) =&gt; {
if (feedItem.type === 'GRAPH') {
return &lt;GraphFeedItem key={feedItem.id} feedItem={feedItem} /&gt;
}</p>
<pre><code>    return &amp;lt;StandardFeedItem key={feedItem.id} feedItem={feedItem} /&amp;gt;
  })}
&amp;lt;/&amp;gt;
</code></pre>
<p>)
}</p>
<p>// GraphFeedItem.tsx
function GraphFeedItem({ feedItem }) {
const { data, isPending } = useQuery({
queryKey: ['graph', feedItem.id],
queryFn: getGraphDataById,
})</p>
<p>...
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">해당 가이드에서 언급했듯이 이 예제에서는 다음과 같은 이중 요청 워터폴이 발생합니다:</p>
<pre class="isbl"><code>1. |&gt; getFeed()
2.   |&gt; JS for &lt;GraphFeedItem&gt;
3.     |&gt; getGraphDataById()</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">API를 재구성하여 getFeed()가 필요할 때 getGraphDataById() 데이터도 반환하도록 할 수 없다면 getFeed-&gt;getGraphDataById 워터폴을 없앨 방법은 없지만 조건부 프리페칭을 활용하면 최소한 코드와 데이터를 병렬로 로드할 수는 있습니다. 위에서 설명한 것처럼 여러 가지 방법이 있지만 이 예제에서는 쿼리 함수에서 이를 수행하겠습니다:</p>
<pre class="javascript"><code>function Feed() {
  const queryClient = useQueryClient()
  const { data, isPending } = useQuery({
    queryKey: ['feed'],
    queryFn: async (...args) =&gt; {
      const feed = await getFeed(...args)
<pre><code>  for (const feedItem of feed) {
    if (feedItem.type === 'GRAPH') {
      queryClient.prefetchQuery({
        queryKey: ['graph', feedItem.id],
        queryFn: getGraphDataById,
      })
    }
  }

  return feed
}
</code></pre>
<p>})
...
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이렇게 하면 코드와 데이터가 병렬로 로드됩니다:</p>
<pre class="isbl"><code>1. |&gt; getFeed()
2.   |&gt; JS for &lt;GraphFeedItem&gt;
2.   |&gt; getGraphDataById()</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그러나 getGraphDataById에 대한 코드가 이제 <code>&lt;GraphFeedItem&gt;</code>의 JS가 아닌 상위 번들에 포함되므로 사례별로 최적의 성능 절충안이 무엇인지 결정해야 한다는 단점이 있습니다. 그래프 피드 항목이 발생할 가능성이 높다면 부모에 코드를 포함하는 것이 좋습니다. 극히 드문 경우라면 그렇지 않을 수도 있습니다.</p>
<h2 data-ke-size="size26">쿼리 수동으로 프라이밍하기(Manually Priming a Query)</h2>
<p data-ke-size="size16">쿼리에 대한 데이터를 이미 동기적으로 사용할 수 있는 경우 데이터를 미리 가져올 필요가 없습니다.<br />쿼리 클라이언트의 setQueryData 메서드를 사용하여 쿼리의 캐시된 결과를 키별로 직접 추가하거나 업데이트하면 됩니다.</p>
<pre class="reasonml"><code>queryClient.setQueryData(['todos'], todos)</code></pre>
<p data-ke-size="size16"><a href="https://tanstack.com/query/latest/docs/framework/react/guides/prefetching">reference</a></p>
<figure id="og_1719620823183" contenteditable="false" data-ke-type="opengraph" data-ke-align="alignCenter" data-og-type="website" data-og-title="Prefetching &amp; Router Integration | TanStack Query React Docs" data-og-description="When you know or suspect that a certain piece of data will be needed, you can use prefetching to populate the cache with that data ahead of time, leading to a faster experience. There are a few different prefetching patterns: In event handlers In component" data-og-host="tanstack.com" data-og-source-url="https://tanstack.com/query/latest/docs/framework/react/guides/prefetching" data-og-url="https://tanstack.com/query/latest/docs/framework/react/guides/prefetching" data-og-image="https://scrap.kakaocdn.net/dn/bqKTQS/hyWrNpxWza/UaTtIPSvr5FIZbrKxoiPn1/img.png?width=3000&amp;height=1704&amp;face=0_0_3000_1704"><a href="https://tanstack.com/query/latest/docs/framework/react/guides/prefetching" target="_blank" rel="noopener" data-source-url="https://tanstack.com/query/latest/docs/framework/react/guides/prefetching">
<div class="og-image" style="background-image: url('https://scrap.kakaocdn.net/dn/bqKTQS/hyWrNpxWza/UaTtIPSvr5FIZbrKxoiPn1/img.png?width=3000&amp;height=1704&amp;face=0_0_3000_1704');">&nbsp;</div>
<div class="og-text">
<p class="og-title" data-ke-size="size16">Prefetching &amp; Router Integration | TanStack Query React Docs</p>
<p class="og-desc" data-ke-size="size16">When you know or suspect that a certain piece of data will be needed, you can use prefetching to populate the cache with that data ahead of time, leading to a faster experience. There are a few different prefetching patterns: In event handlers In component</p>
<p class="og-host" data-ke-size="size16">tanstack.com</p>
</div>
</a></figure>
<p data-ke-size="size16">&nbsp;</p>