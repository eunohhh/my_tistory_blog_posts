<p data-ke-size="size16">이번엔 tanstack query 의 공식문서 중 Advanced Server Rendering 항목을 공부하였습니다.<br />아래 내용을 정리합니다. 이번 포스팅 내용이 app router 에 해당합니다.</p>
<h2 data-ke-size="size26">Advanced Server Rendering</h2>
<p data-ke-size="size16">이 가이드에서는 스트리밍, 서버 컴포넌트 및 Next.js 앱 라우터와 함께 React 쿼리를 사용하는 모든 것을 배울 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 가이드에 앞서 서버 렌더링 및 하이드레이션 가이드를 읽어보시는 것이 좋으며, 이 가이드에서는 SSR과 함께 React Query를 사용하기 위한 기본 사항을 설명하고 성능 및 요청 워터폴과 프리페칭 및 라우터 통합에 대해서도 유용한 배경 지식을 담고 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">시작하기 전에 SSR 가이드에 설명된 초기데이터 접근 방식은 서버 컴포넌트에서도 작동하지만, 이 가이드에서는 하이드레이션 API에 초점을 맞출 것입니다.</p>
<h2 data-ke-size="size26">서버 컴포넌트 및 Next.js 앱 라우터</h2>
<p data-ke-size="size16">여기서는 서버 컴포넌트에 대해 자세히 다루지는 않겠지만,</p>
<p data-ke-size="size16">간단히 설명하자면 초기 페이지 보기와 페이지 전환 모두에서 서버에서만 실행되도록 보장되는 컴포넌트라고 할 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이는 Next.js getServerSideProps/getStaticProps 및 Remix 로더의 작동 방식과 유사합니다.</p>
<p data-ke-size="size16">이들 역시 항상 서버에서 실행되지만 데이터만 반환할 수 있는 반면, 서버 컴포넌트는 훨씬 더 많은 일을 할 수 있기 때문입니다.</p>
<p data-ke-size="size16">하지만 데이터 부분은 React Query의 핵심이므로 여기서는 데이터에 집중해 보겠습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">서버 렌더링 가이드에서 프레임워크 로더에서 미리 가져온 데이터를 앱에 전달하는 것에 대해 배운 내용을 어떻게 서버 컴포넌트와 Next.js 앱 라우터에 적용할 수 있을까요?</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이에 대해 생각하는 가장 좋은 방법은 서버 컴포넌트를 그냥 또 다른 프레임워크 로더로 간주하는 것입니다.</p>
<h2 data-ke-size="size26">용어에 대한 간단한 참고 사항</h2>
<p data-ke-size="size16">지금까지 이 가이드에서는 서버와 클라이언트에 대해 이야기했습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">혼동하기 쉽지만 서버 컴포넌트와 클라이언트 컴포넌트는 1:1로 일치하지 않는다는 점에 유의하세요.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">서버 컴포넌트는 서버에서만 실행되도록 보장되지만 클라이언트 컴포넌트는 실제로 두 곳 모두에서 실행될 수 있습니다.</p>
<p data-ke-size="size16">그 이유는 초기 서버 렌더링 패스 중에도 렌더링할 수 있기 때문입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이를 한 가지 방법으로 생각하면 서버 컴포넌트도 렌더링하지만 "로더 단계"(항상 서버에서 발생)에서 발생하는 반면 클라이언트 컴포넌트는 "애플리케이션 단계" 중에 실행된다고 생각할 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">해당 애플리케이션은 SSR 중에 서버에서 실행될 수도 있고 브라우저에서 실행될 수도 있습니다.</p>
<p data-ke-size="size16">애플리케이션이 정확히 어디에서 실행되는지, SSR 중에 실행되는지 여부는 프레임워크마다 다를 수 있습니다.</p>
<h2 data-ke-size="size26">초기 설정</h2>
<p data-ke-size="size16">모든 React Query 설정의 첫 번째 단계는 항상 queryClient를 생성하고 애플리케이션을 QueryClientProvider로 감싸는 것입니다.</p>
<p data-ke-size="size16">서버&nbsp;컴포넌트는&nbsp;대부분의&nbsp;프레임워크에서&nbsp;비슷한&nbsp;형태이지만,&nbsp;한&nbsp;가지&nbsp;차이점은&nbsp;파일&nbsp;이름&nbsp;규칙입니다:</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b><i>(참고 : 특정 인프런 강의의 가이드와 공식페이지 가이드가 다름! 아래 방법으로 할 것)</i></b></p>
<pre class="javascript"><code>// In Next.js, this file would be called: app/providers.jsx
'use client'
// QueryClientProvider는 내부적으로 ContextAPI에 의존하기 때문에, 
// 'use client'를 넣어야 합니다.
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
<p>function makeQueryClient() {
return new QueryClient({
defaultOptions: {
queries: {
// SSR을 사용하면 일반적으로 기본 staleTime을
// 0 이상으로 설정하여 클라이언트에서 즉시 리프레시되지 않도록 합니다.
staleTime: 60 * 1000,
},
},
})
}</p>
<p>// undefined 로 초기값 설정
// 하단 참조
let browserQueryClient: QueryClient | undefined = undefined</p>
<p>function getQueryClient() {
if (isServer) {
// 서버: 항상 새 쿼리 클라이언트 만들기
return makeQueryClient()
} else {
// 브라우저: 아직 클라이언트가 없는 경우 새 쿼리 클라이언트를 만듭니다.
// 이것은 중요한 사항입니다. 초기 렌더링 중에 일시 중단되면 새 클라이언트를 다시 만들지 않습니다.
// 다음과 같은 경우에는 필요하지 않을 수 있습니다.
// 쿼리 클라이언트 생성 아래에 서스펜스 경계가 있는 경우입니다.
if (!browserQueryClient) browserQueryClient = makeQueryClient()
return browserQueryClient
}
}</p>
<p>export default function Providers({ children }) {
// 이 코드와 일시 중단될 수 있는 코드 사이에 suspends boundary가 없는 경우
// 쿼리 클라이언트를 초기화할 때 useState 사용을 피하세요.
// 왜냐하면 React는 초기 렌더링에서 suspends 발생시
// suspends boundary가 없으면 클라이언트를 버릴 것이기 때문입니다.??
// 아무튼 app router 에서는 useState 안에서 생성하지 말라는 소리같음
const queryClient = getQueryClient()</p>
<p>return (
&lt;QueryClientProvider client={queryClient}&gt;{children}&lt;/QueryClientProvider&gt;
)
}</code></pre></p>
<pre class="javascript"><code>// In Next.js, this file would be called: app/layout.jsx
import Providers from './providers'

export default function RootLayout({ children }) {
  return (
    &lt;html lang="en"&gt;
      &lt;head /&gt;
      &lt;body&gt;
        &lt;Providers&gt;{children}&lt;/Providers&gt;
      &lt;/body&gt;
    &lt;/html&gt;
  )
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 부분은 SSR 가이드에서 했던 것과 매우 유사하며, 두 개의 다른 파일로 나누기만 하면 됩니다.</p>
<h2 data-ke-size="size26">데이터 프리페칭 및 de/hydrating하기</h2>
<p data-ke-size="size16">이제 실제로 데이터를 프리페치하고 데이터를 탈수화 및 수화시키는 방법을 살펴보겠습니다.</p>
<p data-ke-size="size16">다음은 Next.js 앱 라우터를 사용한 모습입니다:</p>
<pre class="javascript"><code>// app/posts/page.jsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import Posts from './posts'
<p>export default async function PostsPage() {
const queryClient = new QueryClient()</p>
<p>await queryClient.prefetchQuery({
queryKey: ['posts'],
queryFn: getPosts,
})</p>
<p>return (
// 깔끔해졌어요! 이제 소품을 전달하는 것만큼이나 직렬화가 쉬워졌습니다.
// 수화 바운더리는 클라이언트 컴포넌트이므로 수화는 거기서 이루어집니다.
&lt;HydrationBoundary state={dehydrate(queryClient)}&gt;
&lt;Posts /&gt;
&lt;/HydrationBoundary&gt;
)
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위의 예제에서 한 가지 깔끔한 점은 여기서 Next.js와 관련된 것은 파일 이름뿐이며,</p>
<p data-ke-size="size16">다른 모든 것은 서버 컴포넌트를 지원하는 다른 프레임워크에서 동일하게 보인다는 점입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">SSR 가이드에서 모든 경로에 <code>&lt;HydrationBoundary&gt;</code>가 있어야 하는 상용구를 없앨 수 있다고 언급했습니다.</p>
<p data-ke-size="size16"><br /><b><i>서버 컴포넌트에서는 이것이 불가능합니다.</i></b></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">참고: TypeScript 버전 5.1.3 미만 및 @types/react 버전 18.2.8 미만에서 비동기 서버 컴포넌트를 사용하는 동안 유형 오류가 발생하면 두 가지 모두 최신 버전으로 업데이트하는 것이 좋습니다. 또는 다른 컴포넌트 내에서 이 컴포넌트를 호출할 때 {/* @ts-expect-error 서버 컴포넌트 */}를 추가하는 임시 해결 방법을 사용할 수 있습니다. 자세한 내용은 Next.js 13 문서에서 비동기 서버 컴포넌트 타입스크립트 오류를 참조하세요.</p>
<h3 data-ke-size="size23"><b><i>!!! 아래 중요 !!!</i></b></h3>
<p data-ke-size="size16"><code>Only plain objects, and a few built-ins, can be passed to Server Actions. Classes or null prototypes are not supported.</code> 오류가 발생하는 경우 queryFn에 함수 참조를 전달하지 않고 대신 함수를 호출하는지 확인합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">queryFn에 함수 참조를 전달하지 말고, queryFn 인수에 많은 속성이 있고 모두 직렬화할 수 있는 것은 아니므로 함수를 호출하세요.</p>
<p data-ke-size="size16">서버 액션은 queryFn이 참조가 아닐 때만 작동합니다! <a href="https://github.com/TanStack/query/issues/6264">여기</a>를 참조하세요.</p>
<pre class="coffeescript"><code>queryFn : () =&gt; 실행할함수()</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><span style="color: #ee2323;"><b>서버에서는 위처럼 하라는 것임!!</b></span></p>
<h2 data-ke-size="size26">서버 컴포넌트 중첩하기</h2>
<p data-ke-size="size16">서버 컴포넌트의 좋은 점은 중첩될 수 있고 React 트리의 여러 레벨에 존재할 수 있기 때문에 애플리케이션의 최상단이 아닌 실제로 데이터가 사용되는 위치에 더 가깝게 데이터를 프리페치할 수 있다는 점입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이는 서버 컴포넌트가 다른 서버 컴포넌트를 렌더링하는 것처럼 간단할 수 있습니다(이 예제에서는 간결함을 위해 클라이언트 컴포넌트는 생략하겠습니다):</p>
<pre class="javascript"><code>// app/posts/page.jsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import Posts from './posts'
import CommentsServerComponent from './comments-server'
<p>export default async function PostsPage() {
const queryClient = new QueryClient()</p>
<p>await queryClient.prefetchQuery({
queryKey: ['posts'],
queryFn: getPosts,
})</p>
<p>return (
&lt;HydrationBoundary state={dehydrate(queryClient)}&gt;
&lt;Posts /&gt;
&lt;CommentsServerComponent /&gt;
&lt;/HydrationBoundary&gt;
)
}</p>
<p>// app/posts/comments-server.jsx
import {
dehydrate,
HydrationBoundary,
QueryClient,
} from '@tanstack/react-query'
import Comments from './comments'</p>
<p>export default async function CommentsServerComponent() {
const queryClient = new QueryClient()</p>
<p>await queryClient.prefetchQuery({
queryKey: ['posts-comments'],
queryFn: getComments,
})</p>
<p>return (
&lt;HydrationBoundary state={dehydrate(queryClient)}&gt;
&lt;Comments /&gt;
&lt;/HydrationBoundary&gt;
)
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">보시다시피, 여러 곳에서 <code>&lt;HydrationBoundary&gt;</code>를 사용하고 프리페칭을 위해 여러 쿼리 클라이언트를 생성하고dehydrate하는 것은 완벽하게 괜찮습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">CommentsServerComponent를 렌더링하기 전에 getPosts를 기다리기 때문에 서버 측 워터폴이 발생할 수 있다는 점에 유의하세요:</p>
<pre class="isbl"><code>1. |&gt; getPosts()
2.   |&gt; getComments()</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">데이터에 대한 서버 지연 시간이 짧다면 큰 문제가 되지 않을 수 있지만 여전히 지적할 가치가 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">Next.js에서는 page.tsx에서 데이터를 프리페칭하는 것 외에도 layout.tsx와 병렬 라우트에서도 프리페칭을 수행할 수 있습니다.</p>
<p data-ke-size="size16">이 모든 것이 라우팅의 일부이기 때문에 Next.js는 이 모든 것을 병렬로 가져오는 방법을 알고 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">따라서 위의 CommentsServerComponent를 병렬 경로로 대신 표현하면 워터폴이 자동으로 평탄화됩니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">더 많은 프레임워크가 서버 컴포넌트를 지원하기 시작하면 다른 라우팅 규칙을 가질 수 있습니다.</p>
<p data-ke-size="size16">자세한 내용은 프레임워크 문서를 참조하세요.</p>
<h2 data-ke-size="size26">대안: 프리페칭에 단일 쿼리클라이언트 사용</h2>
<p data-ke-size="size16">위의 예에서는 데이터를 가져오는 각 서버 컴포넌트에 대해 새로운 queryClient를 생성합니다.</p>
<p data-ke-size="size16">이것이 권장되는 접근 방식이지만 원하는 경우 모든 서버 컴포넌트에서 재사용되는 단일 컴포넌트를 만들 수도 있습니다:</p>
<pre class="javascript"><code>// app/getQueryClient.jsx
import { QueryClient } from '@tanstack/react-query'
import { cache } from 'react'
<p>// cache() is scoped per request, so we don't leak data between requests
const getQueryClient = cache(() =&gt; new QueryClient())
export default getQueryClient</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 방법의 장점은 유틸리티 함수를 포함하여 서버 컴포넌트에서 호출되는 모든 곳에서 getQueryClient()를 호출하여 이 클라이언트를 가져올 수 있다는 것입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">단점은 dehydrate(getQueryClient())를 호출할 때마다 이전에 이미 직렬화된 적이 있고 현재 서버 컴포넌트와 관련이 없는 쿼리를 포함하여 전체 쿼리 클라이언트를 직렬화하므로 불필요한 오버헤드가 발생한다는 것입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">Next.js는 이미 fetch()를 사용하는 요청을 중복 제거하지만, 쿼리Fn에서 다른 것을 사용하거나 이러한 요청을 자동으로 중복 제거하지 않는 프레임워크를 사용하는 경우 위에서 설명한 대로 단일 queryClient를 사용하면 중복 직렬화에도 불구하고 의미가 있을 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">향후 개선 사항으로, 마지막으로 dehydrateNew()를 호출한 이후 새로 생성된 쿼리만 삭제하는 dehydrateNew() 함수(이름 보류 중)를 만드는 것을 검토할 수 있습니다. 이 기능이 흥미롭고 도움을 주고 싶으시다면 언제든지 연락주세요!</p>
<h2 data-ke-size="size26">데이터 소유권 및 재검증(revalidation)</h2>
<p data-ke-size="size16">서버 컴포넌트에서는 데이터 소유권 및 재검증에 대해 생각해 보는 것이 중요합니다.<br />그 이유를 설명하기 위해 위의 수정된 예제를 살펴보겠습니다:</p>
<pre class="javascript"><code>// app/posts/page.jsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import Posts from './posts'
<p>export default async function PostsPage() {
const queryClient = new QueryClient()</p>
<p>// Note we are now using fetchQuery()
const posts = await queryClient.fetchQuery({
queryKey: ['posts'],
queryFn: getPosts,
})</p>
<p>return (
&lt;HydrationBoundary state={dehydrate(queryClient)}&gt;
{/* This is the new part */}
&lt;div&gt;Nr of posts: {posts.length}&lt;/div&gt;
&lt;Posts /&gt;
&lt;/HydrationBoundary&gt;
)
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이제 서버 컴포넌트와 클라이언트 컴포넌트 모두에서 getPosts 쿼리의 데이터를 렌더링하고 있습니다.</p>
<p data-ke-size="size16">초기 페이지 렌더링에는 문제가 없지만 만약 클라이언트에서 staleTime이 전달되었을 때 쿼리의 유효성을 다시 검사하면 어떻게 될까요?</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">React 쿼리는 서버 컴포넌트의 유효성을 재검증하는 방법을 모르기 때문에 클라이언트에서 데이터를 다시 가져와서 React가 게시물 목록을 다시 렌더링하게 되면 게시물 수(Nr)가 달라집니다: {posts.length}가 동기화되지 않게 됩니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">staleTime: 무한대로 설정하여 React Query가 재검증하지 않도록 하면 괜찮지만, 애초에 React Query를 사용하려는 목적이 아니라면 이 문제를 원하지 않을 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">서버 컴포넌트와 함께 React Query를 사용하는 것이 가장 합리적입니다:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>React Query를 사용하는 앱이 있고 모든 데이터 불러오기를 다시 작성하지 않고 서버 컴포넌트로 마이그레이션하려는 경우.</li>
<li>익숙한 프로그래밍 패러다임을 원하지만 서버 컴포넌트의 이점을 가장 적합한 곳에 뿌리고 싶은 경우.</li>
<li>React Query가 다루지만 선택한 프레임워크가 다루지 않는 사용 사례가 있습니다.</li>
</ul>
<p data-ke-size="size16">React Query를 서버 컴포넌트와 함께 사용하는 것이 합당한 경우와 그렇지 않은 경우에 대한 일반적인 조언을 하기는 어렵습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><i><b>새로운 서버 컴포넌트 앱을 막 시작하는 경우, 프레임워크에서 제공하는 데이터 불러오기 도구로 시작하고</b></i></p>
<p data-ke-size="size16"><b><i>실제로 필요할 때까지 React Query를 도입하지 않는 것이 좋습니다. 작업에 적합한 도구를 사용하는 것이 좋습니다!</i></b></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 함수를 사용하는 경우 오류를 잡아야 하는 경우가 아니라면 queryClient.fetchQuery를 사용하지 않는 것이 좋습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">사용해야 한다면 서버에서 결과를 렌더링하거나 다른 컴포넌트, 심지어 클라이언트 컴포넌트로 결과를 전달하지 마세요.</p>
<p data-ke-size="size16">React 쿼리 관점에서 서버 컴포넌트는 데이터를 프리페치하는 장소로 취급하세요.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">물론 서버 컴포넌트가 일부 데이터를 소유하고 클라이언트 컴포넌트가 다른 데이터를 소유하는 것도 괜찮지만, 두 현실이 동기화되지 않도록 하세요.</p>
<h2 data-ke-size="size26">서버컴포넌트의 Streaming</h2>
<p data-ke-size="size16">Next.js 앱 라우터는 애플리케이션에서 표시할 준비가 된 모든 부분을 가능한 한 빨리 브라우저로 자동 스트리밍하므로 아직 보류 중인 콘텐츠를 기다릴 필요 없이 완성된 콘텐츠를 즉시 표시할 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 작업은 &lt;서스펜스&gt; 경계선을 따라 수행됩니다. loading.tsx 파일을 만들면 자동으로 &lt;서스펜스&gt; 경계가 생성됩니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위에서 설명한 프리페칭 패턴을 사용하면 React Query는 이러한 형태의 스트리밍과 완벽하게 호환됩니다. 각 Suspense 경계에 대한 데이터가 해결되면 Next.js는 완성된 콘텐츠를 렌더링하여 브라우저로 스트리밍할 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이는 위에서 설명한 대로 useQuery를 사용하는 경우에도 작동하는데, 프리페치를 기다릴 때 실제로 일시 중단이 발생하기 때문입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">React Query v5.40.0부터는 보류 중인 쿼리도 탈수화되어(dehydrated) 클라이언트로 전송될 수 있으므로 모든 프리페치를 기다릴 필요는 없습니다. 이렇게 하면 전체 서스펜스 경계를 차단하지 않고 가능한 한 빨리 프리페치를 시작하고 쿼리가 완료되면 데이터를 클라이언트로 스트리밍할 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">예를 들어 일부 사용자 상호 작용 후에만 표시되는 일부 콘텐츠를 프리페치하거나 무한 쿼리의 첫 페이지를 기다렸다가 렌더링하되 렌더링을 차단하지 않고 2페이지부터 프리페치를 시작하려는 경우에 유용할 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 작업을 수행하려면 보류 중인 쿼리도 삭제하도록 쿼리클라이언트에 지시해야 합니다. 이 작업은 전역적으로 수행하거나 해당 옵션을 직접 전달하여 수화(hydrate)할 수 있습니다:</p>
<pre class="javascript"><code>// app/get-query-client.ts
import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query'
<p>function makeQueryClient() {
return new QueryClient({
defaultOptions: {
queries: {
staleTime: 60 * 1000,
},
dehydrate: {
// 기본적으로 성공한 쿼리만 포함됩니다,
// 여기에는 보류 중인 쿼리도 포함됩니다.
shouldDehydrateQuery: (query) =&gt;
defaultShouldDehydrateQuery(query) ||
query.state.status === 'pending',
},
},
})
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">참고: 이 기능은 클라이언트 컴포넌트로 전달할 때 React가 유선을 통해 프로미스를 직렬화할 수 있기 때문에 NextJs와 서버 컴포넌트에서 작동합니다(This works in NextJs and Server Components because React can serialize Promises over the wire when you pass them down to Client Components)</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그러면 더 이상 프리페치를 기다릴 필요 없이 HydrationBoundary를 제공하기만 하면 됩니다:</p>
<pre class="javascript"><code>// app/posts/page.jsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from './get-query-client'
import Posts from './posts'
<p>// 함수는 아무것도 '대기'하지 않기 때문에 '비동기'일 필요가 없습니다.
export default function PostsPage() {
const queryClient = getQueryClient()</p>
<p>// no await &gt; await 안붙여도 됨!!!!
queryClient.prefetchQuery({
queryKey: ['posts'],
queryFn: getPosts,
})</p>
<p>return (
&lt;HydrationBoundary state={dehydrate(queryClient)}&gt;
&lt;Posts /&gt;
&lt;/HydrationBoundary&gt;
)
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">클라이언트에서 프로미스는 우리를 위해 쿼리 캐시에 저장됩니다. 즉, 이제 (서버에서 생성된) 해당 프로미스를 '사용'하기 위해 게시 컴포넌트 내에서 useSuspenseQuery를 호출할 수 있습니다:</p>
<pre class="javascript"><code>// app/posts/posts.tsx
'use client'
<p>export default function Posts() {
const { data } = useSuspenseQuery({ queryKey: ['posts'], queryFn: getPosts })
// ...
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">참고 : useSuspenseQuery 대신 useQuery를 사용할 수도 있으며, 이 경우에도 Promise가 올바르게 선택됩니다. 그러나 이 경우 NextJs는 일시 중단되지 않으며 컴포넌트는 보류(pending) 중 상태로 렌더링되어 서버가 콘텐츠를 렌더링하지 않습니다.(SSR 안한다는 뜻 같음)</p>
<p data-ke-size="size16">Note that you could also useQuery instead of useSuspenseQuery, and the Promise would still be picked up correctly. However, NextJs won't suspend in that case and the component will render in the pending status, which also opts out of server rendering the content.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">JSON이 아닌 데이터 유형을 사용하고 서버에서 쿼리 결과를 직렬화하는 경우, 경계의 각 측에서 데이터를 직렬화(serialize) 및 역직렬화(deserialize)하여 캐시의 데이터가 서버와 클라이언트에서 모두 동일한 형식이 되도록 하기 위해 dehydrate.serializeData 및 hydrate.deserializeData 옵션을 지정할 수 있습니다:</p>
<pre class="javascript"><code>// app/get-query-client.ts
import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query'
import { deserialize, serialize } from './transformer'
<p>export function makeQueryClient() {
return new QueryClient({
defaultOptions: {
// ...
hydrate: {
deserializeData: deserialize,
},
dehydrate: {
serializeData: serialize,
},
},
})
}</code></pre></p>
<pre class="javascript"><code>// app/posts/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { serialize } from './transformer'
import Posts from './posts'

export default function PostsPage() {
  const queryClient = new QueryClient()

  // no await
  queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: () =&gt; getPosts().then(serialize), 
    // &lt;-- serialize the data on the server
  })

  return (
    &lt;HydrationBoundary state={dehydrate(queryClient)}&gt;
      &lt;Posts /&gt;
    &lt;/HydrationBoundary&gt;
  )
}</code></pre>
<pre class="javascript"><code>// app/posts/posts.tsx
'use client'

export default function Posts() {
  const { data } = useSuspenseQuery({ queryKey: ['posts'], queryFn: getPosts })
  // ...
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이제 변환기가 해당 데이터 유형을 직렬화 및 역직렬화할 수 있다고 가정하면, getPosts 함수는 예를 들어 임시 날짜/시간 객체를 반환할 수 있으며 데이터는 클라이언트에서 직렬화 및 역직렬화됩니다.</p>
<h2 data-ke-size="size26">Next.js에서 프리페칭 없이 스트리밍하기(experimental)</h2>
<p data-ke-size="size16">위에서 설명한 프리페칭 솔루션은 초기 페이지 로드와 이후 페이지 탐색 모두에서 요청 워터폴을 평탄화하므로 권장하지만,</p>
<p data-ke-size="size16">프리페칭을 완전히 건너뛰고 스트리밍 SSR을 계속 작동시키는 실험적인 방법이 있습니다:</p>
<p data-ke-size="size16"><br /><b>tanstack/react-query-next-experimental</b></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 패키지를 사용하면 컴포넌트에서 useSuspenseQuery를 호출하여 서버(클라이언트 컴포넌트)에서 데이터를 가져올 수 있습니다.</p>
<p data-ke-size="size16">그러면 SuspenseBoundaries가 해결되면서 결과가 서버에서 클라이언트로 스트리밍됩니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>&lt;Suspense&gt;</code> 바운더리로 래핑하지 않고 useSuspenseQuery를 호출하면 가져오기가 해결될 때까지 HTML 응답이 시작되지 않습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">상황에 따라 원하는 경우 이 방법을 사용할 수 있지만 TTFB가 손상될 수 있다는 점에 유의하세요.</p>
<p data-ke-size="size16">이를 위해 앱을 ReactQueryStreamedHydration 컴포넌트로 래핑하세요:</p>
<pre class="javascript"><code>// app/providers.tsx
'use client'
<p>import {
isServer,
QueryClient,
QueryClientProvider,
} from '@tanstack/react-query'
import * as React from 'react'
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental'</p>
<p>function makeQueryClient() {
return new QueryClient({
defaultOptions: {
queries: {
// SSR을 사용하면 일반적으로 기본 staleTime을
// 0 이상으로 설정하여 클라이언트에서 즉시 리프레시되지 않도록 합니다.
staleTime: 60 * 1000,
},
},
})
}</p>
<p>let browserQueryClient: QueryClient | undefined = undefined</p>
<p>function getQueryClient() {
if (isServer) {
// Server: always make a new query client
return makeQueryClient()
} else {
// 브라우저: 아직 클라이언트가 없는 경우 새 쿼리 클라이언트를 만듭니다.
// 이것은 매우 중요하므로 초기 렌더링 중에 React
// 초기 렌더링 중에 일시 중단되면 새 클라이언트를 다시 만들지 않습니다.
// 다음과 같은 경우에는 필요하지 않을 수 있습니다.
// 쿼리 클라이언트 생성 아래에 서스펜스 경계가 있는 경우입니다.
if (!browserQueryClient) browserQueryClient = makeQueryClient()
return browserQueryClient
}
}</p>
<p>export function Providers(props: { children: React.ReactNode }) {
// 참고: 쿼리 클라이언트를 초기화할 때 사용State를 사용하지 마십시오.
// 이것과 코드 사이에 서스펜스 경계가 있을 수 있습니다.
// 왜냐하면 React는 초기 렌더링에서 클라이언트를 버릴 것이기 때문입니다.
// 렌더링할 때 클라이언트를 버릴 것이기 때문에 경계가 없습니다.
const queryClient = getQueryClient()</p>
<p>return (
&lt;QueryClientProvider client={queryClient}&gt;
&lt;ReactQueryStreamedHydration&gt;
{props.children}
&lt;/ReactQueryStreamedHydration&gt;
&lt;/QueryClientProvider&gt;
)
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">자세한 내용은 NextJs 서스펜스 스트리밍 예시를 확인하세요.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">가장 큰 장점은 더 이상 수동으로 쿼리를 프리페치할 필요가 없으며, 결과도 스트리밍된다는 점입니다!</p>
<p data-ke-size="size16">이를 통해 경이로운 DX와 코드 복잡성을 줄일 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">성능 및 요청 워터폴(Request Waterfall) 가이드의 복잡한 요청 워터폴 예시를 다시 살펴보면 단점을 가장 쉽게 설명할 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">프리페칭을 사용하는 서버 컴포넌트는 초기 페이지 로드와 이후의 탐색 모두에서 요청 워터폴을 효과적으로 제거합니다. 그러나 프리페칭을 사용하지 않는 접근 방식은 초기 페이지 로드 시 워터폴을 평평하게 만들 뿐, 페이지 탐색 시에는 원래 예시와 마찬가지로 깊은 워터폴이 됩니다:</p>
<pre class="1c"><code>1. |&gt; JS for &lt;Feed&gt;
2.   |&gt; getFeed()
3.     |&gt; JS for &lt;GraphFeedItem&gt;
4.       |&gt; getGraphDataById()</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">최소한 데이터 및 코드 가져오기를 병렬화할 수 있기 때문에 getServerSideProps/getStaticProps를 사용하는 것보다 훨씬 더 나쁩니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">성능보다 코드 복잡성이 낮은 DX/이터레이션/배송 속도를 중요하게 생각하거나, 쿼리가 깊게 중첩되어 있지 않거나, useSuspenseQueries와 같은 도구를 사용하여 병렬 가져오기로 요청 워터폴을 처리하는 경우라면 이 방법이 좋은 절충안이 될 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">두 가지 접근 방식을 결합하는 것도 가능할 수 있지만 아직 시도해 보지는 않았습니다. 이 방법을 시도해 보신다면 결과를 보고해 주시거나 이 문서에 몇 가지 팁을 업데이트해 주세요!</p>
<h2 data-ke-size="size26">추신</h2>
<p data-ke-size="size16">서버 컴포넌트와 스트리밍은 아직 상당히 새로운 개념이며, React Query가 어떻게 적용되고 API를 개선할 수 있는지 계속 알아가고 있습니다. 제안, 피드백, 버그 보고를 환영합니다!</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">마찬가지로, 이 새로운 패러다임의 모든 복잡한 내용을 한 권의 가이드에 모두 담는다는 것은 불가능할 것입니다. 여기에 누락된 정보가 있거나 이 콘텐츠를 개선할 수 있는 방법에 대한 제안이 있다면 아래의 'GitHub에서 수정하기' 버튼을 클릭하여 도움을 주세요.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><a title="reference" href="https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr" target="_blank" rel="noopener">https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr</a></p>