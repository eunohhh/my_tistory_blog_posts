<p data-ke-size="size16">이번엔 tanstack query 의 공식문서 중 Server Rendering &amp; Hydration 항목을 공부하였습니다.<br />아래 내용을 정리합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b><i>중요! 이번 포스팅 내용은 페이지 라우터 버전입니다. 앱 라우터 버전은 다음 포스팅에 있습니다</i></b></p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">Server Rendering &amp; Hydration</h2>
<p data-ke-size="size16">이 가이드에서는 서버 렌더링에 React 쿼리를 사용하는 방법을 알아봅니다.</p>
<p data-ke-size="size16">배경 지식은 프리페칭 및 라우터 통합 가이드를 참조하세요. 그 전에 성능 및 request waterfall 가이드도 확인해 보세요.</p>
<p data-ke-size="size16">스트리밍, 서버 컴포넌트 및 새로운 Next.js 앱 라우터와 같은 고급 서버 렌더링 패턴에 대해서는 고급 서버 렌더링 가이드를 참조하세요.</p>
<h2 data-ke-size="size26">서버 렌더링 &amp; React 쿼리</h2>
<p data-ke-size="size16">그렇다면 서버 렌더링이란 무엇일까요?</p>
<p data-ke-size="size16"><br />이 가이드의 나머지 부분에서는 이 개념에 익숙하다고 가정하고, 서버 렌더링이 React Query와 어떻게 연관되는지 살펴보겠습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">서버 렌더링은 페이지가 로드되는 즉시 사용자가 볼 수 있는 콘텐츠를 제공하기 위해 서버에서 초기 HTML을 생성하는 작업입니다. 이는 페이지가 요청될 때 온디맨드(SSR)로 발생할 수 있습니다. 또한 이전 요청이 캐시되어 미리 발생하거나 빌드 시점에 발생할 수도 있습니다(SSG).</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">Request Waterfall 가이드를 읽어보셨다면 기억하실 것입니다:</p>
<pre class="1c"><code>1. |-&gt; Markup (without content)
2.   |-&gt; JS
3.     |-&gt; Query</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">클라이언트 렌더링 애플리케이션의 경우 사용자에게 콘텐츠를 화면에 표시하기 전에 최소 3번의 서버 회전을 수행해야 합니다. 서버 렌더링을 보는 한 가지 방법은 위의 내용을 이렇게 바꾸는 것입니다:</p>
<pre class="haskell"><code>1. |-&gt; Markup (with content AND initial data)
2.   |-&gt; JS</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">1단계가 완료되면 사용자는 콘텐츠를 볼 수 있고 2단계가 완료되면 페이지가 대화형이며 클릭할 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">마크업에는 필요한 초기 데이터도 포함되어 있으므로 적어도 어떤 이유로 데이터를 다시 유효성 검사할 때까지는 3단계는 클라이언트에서 전혀 실행할 필요가 없습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 모든 것은 클라이언트 관점에서 바라본 것입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">서버에서는 마크업을 생성/렌더링하기 전에 데이터를 미리 가져와야 하고, 마크업에 포함할 수 있는 직렬화 가능한 형식으로 데이터를 탈수화(dehydrate)해야 하며, 클라이언트에서는 클라이언트에서 새로 가져오는 것을 피할 수 있도록 데이터를 React 쿼리 캐시로 수화(hydrate)해야 합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 세 단계를 React Query로 구현하는 방법을 알아보려면 계속 읽어보세요.</p>
<h2 data-ke-size="size26"> Suspense에 대한 간단한 참고 사항</h2>
<p data-ke-size="size16">이 가이드에서는 일반적인 useQuery API를 사용합니다.</p>
<p data-ke-size="size16">반드시 권장하지는 않지만 항상 모든 쿼리를 미리 가져오기만 한다면 이 대신 useSuspenseQuery로 대체할 수 있습니다.</p>
<p data-ke-size="size16">장점은 클라이언트에서 상태를 로드할 때 <code>&lt;Suspense&gt;</code>를 사용할 수 있다는 것입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">useSuspenseQuery 를 사용할 때 쿼리를 프리페치하는 것을 잊어버리면 사용 중인 프레임워크에 따라 결과가 달라집니다.</p>
<p data-ke-size="size16">경우에&nbsp;따라&nbsp;데이터는&nbsp;Suspend&nbsp;상태로&nbsp;서버에서&nbsp;fetch&nbsp;하지만,&nbsp;다시&nbsp;fetch&nbsp;를&nbsp;해야하는&nbsp;클라이언트에&nbsp;수화(hydrate)되지&nbsp;못합니다.&nbsp;</p>
<p data-ke-size="size16">이러한 경우 서버와 클라이언트가 서로 다른 것을 렌더링하려고 시도했기 때문에 마크업 하이드레이션 불일치가 발생합니다.</p>
<h2 data-ke-size="size26">초기 설정</h2>
<p data-ke-size="size16">React Query를 사용하는 첫 단계는 항상 쿼리클라이언트를 생성하고 애플리케이션을 <code>&lt;QueryClientProvider&gt;</code>로 감싸는 것입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">서버 렌더링을 할 때는 앱 내부의 React 상태(인스턴스 참조도 잘 작동합니다)에서 queryClient 인스턴스를 생성하는 것이 중요합니다.</p>
<p data-ke-size="size16">이렇게 하면 다른 사용자와 요청 간에 데이터가 공유되지 않고 컴포넌트 수명 주기당 한 번만 queryClient를 생성할 수 있습니다.</p>
<h2 data-ke-size="size26">중요! 아래 예제는 page 라우터 버전임!</h2>
<p data-ke-size="size16">Next.js 페이지 라우터:</p>
<pre class="javascript"><code>// _app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
<p>// 절대 이렇게 하지 마세요:
// const queryClient = new QueryClient()
//
// 파일 루트 수준에서 쿼리클라이언트를 생성하면 캐시가 공유됩니다.
// 모든 요청 간에 캐시가 공유되고 <em>모든</em> 데이터가 <em>모든</em> 사용자에게 전달됩니다.
// 이는 성능에 좋지 않을 뿐만 아니라 민감한 데이터도 유출됩니다.</p>
<p>export default function MyApp({ Component, pageProps }) {
// 대신 이렇게 하면 각 요청이 자체 캐시를 갖도록 합니다:
const [queryClient] = React.useState(
() =&gt;
new QueryClient({
defaultOptions: {
queries: {
// SSR을 사용하면 일반적으로 기본 staleTime을<br>
// 0 이상으로 설정하여 클라이언트에서 즉시 리페칭되지 않도록 합니다.
staleTime: 60 * 1000,
},
},
}),
)</p>
<p>return (
&lt;QueryClientProvider client={queryClient}&gt;
&lt;Component {...pageProps} /&gt;
&lt;/QueryClientProvider&gt;
)
}</code></pre></p>
<h2 data-ke-size="size26">초기 데이터로 빠르게 시작하기</h2>
<p data-ke-size="size16">가장 빠르게 시작하는 방법은 프리페칭에 React Query를 사용하지 않고,&nbsp;<code>dehydrate/hydrate</code> API도 사용하지 않는 것입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">대신 원시 데이터를 initialData 옵션으로 전달하여 Query를 사용하면 됩니다. Next.js 페이지 라우터에서 getServerSideProps를 사용하는 예시를 살펴보겠습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">설정이 최소화되어 일부 경우 빠른 해결책이 될 수 있지만 전체 접근 방식과 비교할 때 고려해야 할 몇 가지 장단점이 있습니다:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>트리의 더 깊은 곳에 있는 컴포넌트에서 useQuery를 호출하는 경우 초기 데이터를 해당 지점까지 전달해야 합니다.</li>
<li>여러 위치에서 동일한 쿼리로 useQuery를 호출하는 경우 초기 데이터를 그 중 한 곳에만 전달하면 이후 앱이 변경될 때 깨지기 쉬우며 중단될 수 있습니다. 초기 데이터가 있고 사용 쿼리가 있는 컴포넌트를 제거하거나 이동하면 더 깊게 중첩된 사용 쿼리에는 더 이상 데이터가 없을 수 있습니다. 초기 데이터가 필요한 모든 쿼리에 초기 데이터를 전달하는 것도 번거로울 수 있습니다.</li>
<li>쿼리가 서버에서 언제 가져왔는지 알 수 있는 방법이 없으므로 dataUpdatedAt과 쿼리를 다시 가져와야 하는지 여부는 대신 페이지가 로드된 시점을 기준으로 결정합니다.</li>
<li>쿼리에 대한 데이터가 이미 캐시에 있는 경우, 새 데이터가 이전 데이터보다 최신 데이터일지라도 initialData는 이 데이터를 덮어쓰지 않습니다.</li>
<li>이것이 왜 특히 나쁜지 이해하려면 위의 getServerSideProps 예제를 생각해 보세요. 페이지를 여러 번 앞뒤로 이동하는 경우 매번 getServerSideProps가 호출되어 새 데이터를 가져오지만 초기Data 옵션을 사용하고 있기 때문에 클라이언트 캐시와 데이터는 업데이트되지 않습니다.</li>
</ul>
<p data-ke-size="size16">전체 하이드레이션 솔루션을 설정하는 것은 간단하며 이러한 단점이 없으므로 이 문서에서는 이 부분을 중점적으로 다룰 것입니다.</p>
<h2 data-ke-size="size26">Hydration API 사용</h2>
<p data-ke-size="size16">조금만 더 설정하면 사전 로드 단계에서 쿼리를 미리 가져오고, 해당 쿼리 클라이언트의 직렬화된 버전을 앱의 렌더링 부분으로 전달하여 재사용하는 데 queryClient를 사용할 수 있습니다. 이렇게 하면 위의 단점을 피할 수 있습니다. 전체 Next.js 페이지 라우터 및 리믹스 예제는 건너뛰셔도 좋지만, 일반적인 수준에서 추가 단계는 다음과 같습니다:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>프레임워크 로더 함수에서 const queryClient = new QueryClient(options)를 생성합니다.</li>
<li>로더 함수에서, 미리 가져오려는 각 쿼리에 대해 await queryClient.prefetchQuery(...)를 수행합니다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>가능한 경우 쿼리를 병렬로 가져오려면 await Promise.all(...)을 사용하고 싶을 것입니다.</li>
<li>프리페치되지 않은 쿼리가 있어도 괜찮습니다. 이러한 쿼리는 서버에서 렌더링되지 않고 애플리케이션이 인터랙티브한 후에 클라이언트에서 가져옵니다. 이는 사용자 상호 작용 후에만 표시되거나 더 중요한 콘텐츠를 차단하지 않기 위해 페이지에서 멀리 아래에 있는 콘텐츠에 유용할 수 있습니다.</li>
</ul>
</li>
<li>로더에서 dehydrate(queryClient)를 반환하는데, 이를 반환하는 정확한 구문은 프레임워크마다 다르다는 점에 유의하세요.</li>
<li>트리를 <code>&lt;HydrationBoundary state={dehydratedState}&gt;</code>로 감싸고, 여기서 dehydratedState는 프레임워크 로더에서 가져옵니다. 탈수 상태를 가져오는 방법도 프레임워크마다 다릅니다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>각 경로마다 또는 상용구를 피하기 위해 애플리케이션 상단에서 이 작업을 수행할 수 있습니다(예시 참조).</li>
</ul>
</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">흥미로운 세부 사항은 실제로 세 개의 쿼리 클라이언트가 관련되어 있다는 것입니다.</p>
<p data-ke-size="size16">프레임워크 로더는 렌더링 전에 발생하는 일종의 "프리로딩" 단계이며, 이 단계에는 프리페칭을 수행하는 자체 쿼리클라이언트가 있습니다. 이 단계의 탈수된 결과는 서버 렌더링 프로세스와 클라이언트 렌더링 프로세스 모두에 전달되며, 각각 자체 쿼리클라이언트를 가지고 있습니다. 이렇게 하면 두 프로세스가 동일한 데이터로 시작하여 동일한 마크업을 반환할 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">서버 컴포넌트는 또 다른 형태의 "프리로드" 단계로, React 컴포넌트 트리의 일부를 "프리로드"(사전 렌더링)할 수도 있습니다. 자세한 내용은 고급 서버 렌더링 가이드에서 읽어보세요.</p>
<h2 data-ke-size="size26">선택 사항 - 보일러플레이트 제거</h2>
<p data-ke-size="size16">모든 경로에 이 부분을 넣는 것은 많은 보일러플레이트처럼 보일 수 있습니다:</p>
<pre class="javascript"><code>export default function PostsRoute({ dehydratedState }) {
  return (
    &lt;HydrationBoundary state={dehydratedState}&gt;
      &lt;Posts /&gt;
    &lt;/HydrationBoundary&gt;
  )
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 접근 방식에 문제가 있는 것은 아니지만 이 상용구를 제거하려면 다음과 같이 Next.js에서 설정을 수정할 수 있습니다:</p>
<pre class="javascript"><code>// _app.tsx
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
<p>export default function MyApp({ Component, pageProps }) {
const [queryClient] = React.useState(() =&gt; new QueryClient())</p>
<p>return (
&lt;QueryClientProvider client={queryClient}&gt;
&lt;HydrationBoundary state={pageProps.dehydratedState}&gt;
&lt;Component {...pageProps} /&gt;
&lt;/HydrationBoundary&gt;
&lt;/QueryClientProvider&gt;
)
}</p>
<p>// pages/posts.tsx
// HydrationBoundary를 사용하여 PostsRoute를 제거하고 대신 게시물을 직접 내보냅니다:
export default function Posts() { ... }</code></pre></p>
<h2 data-ke-size="size26">의존적 쿼리(dependent query) 프리페칭</h2>
<p data-ke-size="size16">프리페칭 가이드에서 의존적 쿼리를 프리페칭하는 방법을 배웠는데, 프레임워크 로더에서는 어떻게 할 수 있을까요? 종속 쿼리 가이드에서 가져온 다음 코드를 살펴보세요:</p>
<pre class="kotlin"><code>// Get the user
const { data: user } = useQuery({
  queryKey: ['user', email],
  queryFn: getUserByEmail,
})
<p>const userId = user?.id</p>
<p>// Then get the user's projects
const {
status,
fetchStatus,
data: projects,
} = useQuery({
queryKey: ['projects', userId],
queryFn: getProjectsByUser,
// The query will not execute until the userId exists
enabled: !!userId,
})</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">서버에서 렌더링할 수 있도록 프리페칭하려면 어떻게 해야 할까요? 다음은 예시입니다:</p>
<pre class="javascript"><code>// For Remix, rename this to loader instead
export async function getServerSideProps() {
  const queryClient = new QueryClient()
<p>const user = await queryClient.fetchQuery({
queryKey: ['user', email],
queryFn: getUserByEmail,
})</p>
<p>if (user?.userId) {
await queryClient.prefetchQuery({
queryKey: ['projects', userId],
queryFn: getProjectsByUser,
})
}</p>
<p>// For Remix:
// return json({ dehydratedState: dehydrate(queryClient) })
return { props: { dehydratedState: dehydrate(queryClient) } }
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">물론 더 복잡해질 수 있지만 이러한 로더 함수는 자바스크립트이기 때문에 언어의 모든 기능을 사용하여 로직을 구축할 수 있습니다. 서버에서 렌더링할 모든 쿼리를 미리 가져와야 합니다.</p>
<h2 data-ke-size="size26">오류 처리</h2>
<p data-ke-size="size16">React Query는 기본적으로 점진적인 성능 저하 전략(graceful degradation strategy)을 사용합니다. 즉</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>queryClient.prefetchQuery(...)는 절대로 오류를 던지지 않습니다.</li>
<li>dehydrate(...)는 실패한 쿼리가 아닌 성공한 쿼리만 포함합니다.</li>
</ul>
<p data-ke-size="size16">이렇게 하면 실패한 쿼리는 클라이언트에서 다시 시도되고 서버에서 렌더링된 출력에는 전체 콘텐츠 대신 로딩 상태가 포함됩니다.</p>
<p data-ke-size="size16">좋은 기본값이지만 때로는 원하지 않는 경우가 있습니다. 중요한 콘텐츠가 누락된 경우 상황에 따라 404 또는 500 상태 코드로 응답하고 싶을 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이러한 경우에는 실패 시 오류를 발생시켜 적절한 방식으로 처리할 수 있도록 하는 queryClient.fetchQuery(...)를 대신 사용하세요.</p>
<pre class="smali"><code>let result
<p>try {
result = await queryClient.fetchQuery(...)
} catch (error) {
// Handle the error, refer to your framework documentation
}</p>
<p>// You might also want to check and handle any invalid <code>result</code> here</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">어떤 이유로 실패한 쿼리를 탈수화 상태(dehydrated state)에 포함시켜 재시도를 방지하려는 경우 shouldDehydrateQuery 옵션을 사용하여 기본 함수를 재정의하고 자신만의 로직을 구현할 수 있습니다:</p>
<pre class="arcade"><code>dehydrate(queryClient, {
  shouldDehydrateQuery: (query) =&gt; {
    // 여기에는 실패한 쿼리를 포함한 모든 쿼리가 포함됩니다,
    // 하지만 `query`를 검사하여 자신만의 로직을 구현할 수도 있습니다.
    return true
  },
})</code></pre>
<h2 data-ke-size="size26">직렬화(Serialization)</h2>
<p data-ke-size="size16">Next.js 에서 <code>return { props: { dehydratedState: dehydrate(queryClient) } }</code> 를 수행하면 쿼리 클라이언트의 dehydratedState 표현이 프레임워크에서 직렬화되어 마크업에 임베드되고 클라이언트로 전송될 수 있게 됩니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">기본적으로 이러한 프레임워크는 안전하게 직렬화/구문 분석할 수 있는 것만 반환을 지원하므로 정의되지 않음, 오류, 날짜, 맵, 세트, BigInt, 무한대, NaN, -0, 정규식 등은 지원하지 않습니다.</p>
<p data-ke-size="size16"><br />이는 또한 쿼리에서 이러한 것들을 반환할 수 없다는 의미이기도 합니다. 이러한 값을 반환하는 것이 필요한 경우 superjson 또는 이와 유사한 패키지를 확인해 보세요.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">사용자 정의 SSR 설정을 사용하는 경우 이 단계를 직접 처리해야 합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">가장 먼저 JSON.stringify(dehydratedState)를 사용할 수 있지만, 기본적으로 <code>&lt;script&gt;alert('Oh no...')&lt;/script&gt;</code>와 같은 값을 이스케이프 처리하지 않으므로 애플리케이션에서 XSS 취약점이 쉽게 발생할 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">또한 superjson은 값을 이스케이프 처리하지 않으므로 사용자 정의 SSR 설정에서 단독으로 사용하기에는 안전하지 않습니다(출력 이스케이프를 위한 추가 단계를 추가하지 않는 한). 대신 XSS 인젝션에 대해 기본적으로 안전한 Serialize JavaScript 또는 devalue와 같은 라이브러리를 사용하는 것이 좋습니다.</p>
<h2 data-ke-size="size26">팁, 요령 및 주의 사항</h2>
<h3 data-ke-size="size23">Staleness는 서버에서 쿼리를 가져온 시점부터 측정됩니다.</h3>
<p data-ke-size="size16">쿼리는 데이터 업데이트 시점에 따라 오래된 것으로 간주됩니다. 여기서 주의할 점은 이 기능이 제대로 작동하려면 서버의 시간이 정확해야 하지만 UTC 시간이 사용되므로 시간대는 여기에 고려되지 않는다는 것입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">staleTime의 기본값은 0이므로 기본적으로 페이지 로드 시 백그라운드에서 쿼리를 다시 가져옵니다.</p>
<p data-ke-size="size16">특히 마크업을 캐시하지 않는 경우 이 이중 가져오기를 방지하려면 더 높은 staleTime을 사용하는 것이 좋습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">오래된 쿼리의 리페칭은 CDN에서 마크업을 캐싱할 때 완벽하게 일치합니다! 페이지 자체의 캐시 시간을 적당히 높게 설정하여 서버에서 페이지를 다시 렌더링할 필요가 없도록 하되, 쿼리의 staleTime을 낮게 구성하여 사용자가 페이지를 방문하는 즉시 백그라운드에서 데이터가 리프레시되도록 할 수 있습니다. 일주일 동안 페이지를 캐시하고 하루 이상 지난 데이터는 페이지 로드 시 자동으로 리프레시하고 싶으신가요?</p>
<h3 data-ke-size="size23">서버의 높은 메모리 사용량</h3>
<p data-ke-size="size16">모든 요청에 대해 QueryClient를 생성하는 경우, React Query는 이 클라이언트에 대해 격리된 캐시를 생성하며, 이 캐시는 gcTime 기간 동안 메모리에 보존됩니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">따라서 해당 기간 동안 요청이 많은 경우 서버에서 높은 메모리 소비가 발생할 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">서버에서 gcTime의 기본값은 수동 가비지 수집을 비활성화하는 무한대이며 요청이 완료되면 자동으로 메모리를 지웁니다.</p>
<p data-ke-size="size16">무한대가 아닌 gcTime을 명시적으로 설정하는 경우 캐시를 조기에 지워야 할 책임이 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">수화 오류가 발생할 수 있으므로 gcTime을 0으로 설정하지 마세요. 이는 하이드레이션 바운더리가 렌더링을 위해 필요한 데이터를 캐시에 저장하지만 가비지 수집기가 렌더링이 완료되기 전에 데이터를 제거하면 문제가 발생할 수 있기 때문에 발생합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">더 짧은 gcTime이 필요한 경우 앱이 데이터를 참조할 수 있는 충분한 시간을 확보하기 위해 2 * 1000으로 설정하는 것이 좋습니다.</p>
<p data-ke-size="size16">캐시가 필요하지 않은 후 캐시를 지우고 메모리 소비를 줄이려면 요청이 처리되고 탈수 상태가 클라이언트에 전송된 후 queryClient.clear() 호출을 추가할 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">또는 더 작은 gcTime을 설정할 수도 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><a title="reference" href="https://tanstack.com/query/latest/docs/framework/react/guides/ssr" target="_blank" rel="noopener">https://tanstack.com/query/latest/docs/framework/react/guides/ssr</a></p>