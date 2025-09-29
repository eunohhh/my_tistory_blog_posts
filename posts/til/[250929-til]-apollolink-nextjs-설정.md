<h2 data-ke-size="size26">문제 상황</h2>
<h3 data-ke-size="size23">일반적인 Next.js + Apollo 설정</h3>
<pre class="javascript"><code>// lib/apollo-client-rsc.ts (Server Component용)
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc'
<p>export const { getClient } = registerApolloClient(() =&gt; {
return new ApolloClient({
cache: new InMemoryCache(),
link: from([
loggerLink,      // 중복 1
errorLink,       // 중복 2
authLink,        // 중복 3
httpLink         // 중복 4
])
})
})</code></pre></p>
<pre class="javascript"><code>// lib/apollo-client.tsx (Client Component용)
'use client'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { ApolloNextAppProvider } from '@apollo/experimental-nextjs-app-support/ssr'

function makeClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: from([
      loggerLink,      // 또 중복 1
      errorLink,       // 또 중복 2
      authLink,        // 또 중복 3
      httpLink         // 또 중복 4
    ])
  })
}</code></pre>
<p data-ke-size="size16"><b>  Link 설정을 두 번 작성해야 함!</b></p>
<h2 data-ke-size="size26">해결 방법들</h2>
<h3 data-ke-size="size23">방법 1: Link 팩토리 함수로 공통화 (추천! ⭐)</h3>
<pre class="typescript"><code>// lib/apollo-links.ts
import { ApolloLink, from, HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'
<p>// 공통 Link 생성 함수
export function createApolloLinks(options?: {
isServer?: boolean
getToken?: () =&gt; string | null
}) {
const { isServer = false, getToken } = options || {}</p>
<p>// 1. 로거 (개발 환경에서만)
const loggerLink = new ApolloLink((operation, forward) =&gt; {
if (process.env.NODE_ENV === 'development') {
console.log(<code>  [${isServer ? 'Server' : 'Client'}] ${operation.operationName}</code>)
const start = Date.now()</p>
<pre><code>  return forward(operation).map(response =&amp;gt; {
    console.log(`✅ [${isServer ? 'Server' : 'Client'}] ${operation.operationName} (${Date.now() - start}ms)`)
    return response
  })
}
return forward(operation)
</code></pre>
<p>})</p>
<p>// 2. 에러 처리
const errorLink = onError(({ graphQLErrors, networkError, operation }) =&gt; {
if (graphQLErrors) {
graphQLErrors.forEach(({ message, extensions }) =&gt; {
console.error(<code>❌ [GraphQL error] ${operation.operationName}:</code>, message)</p>
<pre><code>    // 클라이언트에서만 토스트
    if (!isServer &amp;amp;&amp;amp; typeof window !== 'undefined') {
      if (extensions?.code === 'UNAUTHENTICATED') {
        window.location.href = '/login'
      }
      // toast 등
    }
  })
}

if (networkError) {
  console.error(`  [Network error]:`, networkError)
}
</code></pre>
<p>})</p>
<p>// 3. 인증
const authLink = setContext((_, { headers }) =&gt; {
// 토큰 가져오기 (서버/클라이언트 분기)
let token: string | null = null</p>
<pre><code>if (isServer) {
  // 서버: cookies()에서 가져오기 (Next.js 15)
  // getToken 함수로 주입받음
  token = getToken ? getToken() : null
} else {
  // 클라이언트: localStorage
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token')
  }
}

return {
  headers: {
    ...headers,
    ...(token &amp;amp;&amp;amp; { authorization: `Bearer ${token}` })
  }
}
</code></pre>
<p>})</p>
<p>// 4. 재시도 (클라이언트에서만)
const retryLink = !isServer
? new RetryLink({
delay: { initial: 300, max: 5000, jitter: true },
attempts: { max: 3 }
})
: null</p>
<p>// 5. HTTP
const httpLink = new HttpLink({
uri: process.env.NEXT_PUBLIC_HASURA_URL,
// 서버에서는 fetch 명시
...(isServer &amp;&amp; {
fetch: fetch,
fetchOptions: {
cache: 'no-store'  // SSR에서 캐시 제어
}
})
})</p>
<p>// Link 체인 조합
return from([
loggerLink,
errorLink,
authLink,
...(retryLink ? [retryLink] : []),
httpLink
])
}</p>
<p>// 공통 캐시 설정도 함수화
export function createApolloCache() {
return new InMemoryCache({
typePolicies: {
Query: {
fields: {
campaign_application: {
keyArgs: ['where', 'order_by'],
merge(existing, incoming) {
return incoming
}
}
}
}
}
})
}</code></pre></p>
<pre class="javascript"><code>// lib/apollo-client-rsc.ts (Server)
import { ApolloClient } from '@apollo/client'
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc'
import { cookies } from 'next/headers'
import { createApolloLinks, createApolloCache } from './apollo-links'

export const { getClient } = registerApolloClient(() =&gt; {
  return new ApolloClient({
    cache: createApolloCache(),
    link: createApolloLinks({
      isServer: true,
      getToken: () =&gt; {
        // Next.js 15의 cookies()
        const cookieStore = cookies()
        return cookieStore.get('token')?.value || null
      }
    })
  })
})</code></pre>
<pre class="javascript"><code>// lib/apollo-client.tsx (Client)
'use client'
import { ApolloClient } from '@apollo/client'
import { ApolloNextAppProvider } from '@apollo/experimental-nextjs-app-support/ssr'
import { createApolloLinks, createApolloCache } from './apollo-links'

function makeClient() {
  return new ApolloClient({
    cache: createApolloCache(),
    link: createApolloLinks({
      isServer: false
    })
  })
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return (
    &lt;ApolloNextAppProvider makeClient={makeClient}&gt;
      {children}
    &lt;/ApolloNextAppProvider&gt;
  )
}</code></pre>
<p data-ke-size="size16"><b>✨ 이제 Link 설정은 한 곳에서만 관리!</b></p>
<h3 data-ke-size="size23">방법 2: 환경별 Link 선택 (고급)</h3>
<pre class="javascript"><code>// lib/apollo-links.ts
export function createApolloLinks(options: {
  isServer: boolean
}) {
  const { isServer } = options
<p>const commonLinks = [
createLoggerLink(isServer),
createErrorLink(isServer),
createAuthLink(isServer)
]</p>
<p>const clientOnlyLinks = isServer ? [] : [
createRetryLink(),
createLoadingLink(),
createAnalyticsLink()
]</p>
<p>const serverOnlyLinks = isServer ? [
createServerCacheLink()
] : []</p>
<p>return from([
...commonLinks,
...clientOnlyLinks,
...serverOnlyLinks,
createHttpLink(isServer)
])
}</p>
<p>function createLoggerLink(isServer: boolean) {
return new ApolloLink((operation, forward) =&gt; {
const prefix = isServer ? '[SSR]' : '[CSR]'
console.log(<code>${prefix} ${operation.operationName}</code>)
return forward(operation)
})
}</p>
<p>function createRetryLink() {
return new RetryLink({ /* ... */ })
}</p>
<p>// ... 각 Link를 함수로 분리</code></pre></p>
<h3 data-ke-size="size23">방법 3: Config 객체로 관리</h3>
<pre class="yaml"><code>// lib/apollo-config.ts
export const apolloLinkConfig = {
  common: {
    logger: {
      enabled: process.env.NODE_ENV === 'development'
    },
    error: {
      redirectOnAuth: true,
      showToast: true
    },
    auth: {
      headerKey: 'authorization',
      tokenPrefix: 'Bearer'
    }
  },
  server: {
    retry: false,
    cache: 'no-store'
  },
  client: {
    retry: {
      max: 3,
      delay: 300
    },
    analytics: true
  }
}
<p>// lib/apollo-links.ts
export function createApolloLinks(isServer: boolean) {
const config = isServer
? { ...apolloLinkConfig.common, ...apolloLinkConfig.server }
: { ...apolloLinkConfig.common, ...apolloLinkConfig.client }</p>
<p>return from([
...(config.logger.enabled ? [createLoggerLink(isServer)] : []),
createErrorLink(config.error, isServer),
createAuthLink(config.auth, isServer),
...(config.retry ? [createRetryLink(config.retry)] : []),
createHttpLink(isServer)
])
}</code></pre></p>
<h2 data-ke-size="size26">서버/클라이언트 차이점 처리</h2>
<h3 data-ke-size="size23">1. <b>토큰 저장 위치</b></h3>
<pre class="cs"><code>function getAuthToken(isServer: boolean): string | null {
  if (isServer) {
    // 서버: cookies 또는 headers
    const { cookies } = require('next/headers')
    return cookies().get('token')?.value || null
  } else {
    // 클라이언트: localStorage 또는 cookies
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }
}</code></pre>
<h3 data-ke-size="size23">2. <b>에러 처리</b></h3>
<pre class="lisp"><code>const errorLink = onError(({ graphQLErrors, operation }) =&gt; {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ extensions }) =&gt; {
      if (extensions?.code === 'UNAUTHENTICATED') {
        if (isServer) {
          // 서버: 로그만
          console.error('Unauthorized request:', operation.operationName)
        } else {
          // 클라이언트: 리다이렉트
          window.location.href = '/login'
        }
      }
    })
  }
})</code></pre>
<h3 data-ke-size="size23">3. <b>재시도 정책</b></h3>
<pre class="yaml"><code>// 서버: 재시도 없음 (SSR 속도 중요)
// 클라이언트: 재시도 있음 (UX 중요)
<p>const retryLink = !isServer ? new RetryLink({
delay: { initial: 300, max: 5000 },
attempts: { max: 3 }
}) : null</code></pre></p>
<h3 data-ke-size="size23">4. <b>캐싱 전략</b></h3>
<pre class="lasso"><code>const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_HASURA_URL,
  fetchOptions: {
    // 서버: 캐시 안 함 (항상 최신 데이터)
    // 클라이언트: 브라우저 캐시 활용
    ...(isServer &amp;&amp; { cache: 'no-store' })
  }
})</code></pre>
<h2 data-ke-size="size26">실전 예시: 완전한 설정</h2>
<pre class="typescript"><code>// lib/apollo/links.ts
import { ApolloLink, from, HttpLink, Observable } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'
<p>export interface CreateLinksOptions {
isServer: boolean
getToken?: () =&gt; string | Promise&lt;string&gt; | null
}</p>
<p>export function createApolloLinks(options: CreateLinksOptions) {
const { isServer, getToken } = options
const prefix = isServer ? ' ️ [Server]' : '  [Client]'</p>
<p>// 1. Logger Link
const loggerLink = new ApolloLink((operation, forward) =&gt; {
if (process.env.NODE_ENV !== 'development') {
return forward(operation)
}</p>
<pre><code>console.log(`${prefix}   ${operation.operationName}`, {
  variables: operation.variables
})
const start = Date.now()

return forward(operation).map(response =&amp;gt; {
  const duration = Date.now() - start
  const emoji = duration &amp;gt; 1000 ? ' ' : '⚡'
  console.log(`${prefix} ${emoji} ${operation.operationName} (${duration}ms)`)
  return response
})
</code></pre>
<p>})</p>
<p>// 2. Error Link
const errorLink = onError(({ graphQLErrors, networkError, operation }) =&gt; {
if (graphQLErrors) {
graphQLErrors.forEach(({ message, extensions, path }) =&gt; {
const errorMsg = <code>${prefix} ❌ [GraphQL] ${operation.operationName}: ${message}</code>
console.error(errorMsg, { path, extensions })</p>
<pre><code>    // 클라이언트에서만 UI 처리
    if (!isServer &amp;amp;&amp;amp; typeof window !== 'undefined') {
      if (extensions?.code === 'UNAUTHENTICATED') {
        localStorage.removeItem('token')
        window.location.href = '/login'
      } else if (extensions?.code === 'FORBIDDEN') {
        // toast.error('권한이 없습니다')
      }
    }
  })
}

if (networkError) {
  console.error(`${prefix}   [Network]:`, networkError)

  if (!isServer &amp;amp;&amp;amp; typeof window !== 'undefined') {
    // toast.error('네트워크 오류가 발생했습니다')
  }
}
</code></pre>
<p>})</p>
<p>// 3. Auth Link
const authLink = setContext(async (_, { headers }) =&gt; {
let token: string | null = null</p>
<pre><code>if (getToken) {
  const tokenResult = getToken()
  token = tokenResult instanceof Promise ? await tokenResult : tokenResult
} else if (!isServer &amp;amp;&amp;amp; typeof window !== 'undefined') {
  token = localStorage.getItem('token')
}

return {
  headers: {
    ...headers,
    ...(token &amp;amp;&amp;amp; { authorization: `Bearer ${token}` }),
    'x-request-from': isServer ? 'server' : 'client'
  }
}
</code></pre>
<p>})</p>
<p>// 4. Retry Link (클라이언트만)
const retryLink = !isServer
? new RetryLink({
delay: {
initial: 300,
max: 5000,
jitter: true
},
attempts: {
max: 3,
retryIf: (error) =&gt; {
// 네트워크 에러만 재시도
return !!error &amp;&amp; !error.statusCode
}
}
})
: null</p>
<p>// 5. HTTP Link
const httpLink = new HttpLink({
uri: process.env.NEXT_PUBLIC_HASURA_URL,
credentials: 'include',
...(isServer &amp;&amp; {
fetch: fetch,
fetchOptions: {
cache: 'no-store'
}
})
})</p>
<p>// Link 체인 조합
const links = [
loggerLink,
errorLink,
authLink,
...(retryLink ? [retryLink] : []),
httpLink
]</p>
<p>return from(links)
}</code></pre></p>
<pre class="vim"><code>// lib/apollo/cache.ts
import { InMemoryCache } from '@apollo/client'

export function createApolloCache() {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          campaign_application: {
            keyArgs: ['where', 'order_by'],
            merge(existing, incoming, { args }) {
              if (args?.offset === 0) return incoming
              return [...(existing ?? []), ...incoming]
            }
          }
        }
      }
    }
  })
}</code></pre>
<pre class="javascript"><code>// lib/apollo/client-rsc.ts
import { ApolloClient } from '@apollo/client'
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc'
import { cookies } from 'next/headers'
import { createApolloLinks } from './links'
import { createApolloCache } from './cache'

export const { getClient } = registerApolloClient(() =&gt; {
  return new ApolloClient({
    cache: createApolloCache(),
    link: createApolloLinks({
      isServer: true,
      getToken: async () =&gt; {
        const cookieStore = await cookies()
        return cookieStore.get('token')?.value || null
      }
    })
  })
})</code></pre>
<pre class="javascript"><code>// lib/apollo/client.tsx
'use client'
import { ApolloClient } from '@apollo/client'
import { ApolloNextAppProvider } from '@apollo/experimental-nextjs-app-support/ssr'
import { createApolloLinks } from './links'
import { createApolloCache } from './cache'

function makeClient() {
  return new ApolloClient({
    cache: createApolloCache(),
    link: createApolloLinks({
      isServer: false
    })
  })
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return (
    &lt;ApolloNextAppProvider makeClient={makeClient}&gt;
      {children}
    &lt;/ApolloNextAppProvider&gt;
  )
}</code></pre>
<h2 data-ke-size="size26">사용 예시</h2>
<pre class="javascript"><code>// app/campaigns/[id]/page.tsx (Server Component)
import { getClient } from '@/lib/apollo/client-rsc'
import { gql } from '@apollo/client'
<p>export default async function CampaignPage({ params }) {
const client = getClient()</p>
<p>const { data } = await client.query({
query: GET_CAMPAIGN,
variables: { id: params.id }
})
// → 서버 전용 Link 사용 (로깅에  ️ [Server] 표시)</p>
<p>return &lt;div&gt;{data.campaign.title}&lt;/div&gt;
}</code></pre></p>
<pre class="javascript"><code>// app/campaigns/[id]/applications.tsx (Client Component)
'use client'
import { useQuery } from '@apollo/client'

export default function Applications({ campaignId }) {
  const { data } = useQuery(GET_APPLICATIONS, {
    variables: { campaignId }
  })
  // &rarr; 클라이언트 전용 Link 사용 (로깅에   [Client] 표시)

  return &lt;ul&gt;{/* ... */}&lt;/ul&gt;
}</code></pre>
<h2 data-ke-size="size26">콘솔 출력 예시</h2>
<pre class="css"><code> ️ [Server]   GetCampaign { variables: { id: 'abc-123' } }
 ️ [Server] ⚡ GetCampaign (45ms)
<p>[Client]   GetApplications { variables: { campaignId: 'abc-123' } }
[Client] ⚡ GetApplications (156ms)</code></pre></p>
<h2 data-ke-size="size26">정리</h2>
<p data-ke-size="size16"><b>문제:</b> Server/Client Apollo Client를 따로 만들면 Link 중복<br /><b>해결:</b> Link 생성 로직을 팩토리 함수로 공통화</p>
<pre class="cs"><code>// ❌ 중복
const serverClient = new ApolloClient({ link: from([...]) })
const clientClient = new ApolloClient({ link: from([...]) })
<p>// ✅ 공통화
const serverClient = new ApolloClient({
link: createApolloLinks({ isServer: true })
})
const clientClient = new ApolloClient({
link: createApolloLinks({ isServer: false })
})</code></pre></p>
<p data-ke-size="size16"><b>핵심:</b> <code>isServer</code> 플래그로 서버/클라이언트 동작만 분기하고, Link 로직 자체는 하나로 통합!&nbsp;</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><code>from()</code>은 Apollo Client의 Link 체이닝 함수</h2>
<h3 data-ke-size="size23">import 위치</h3>
<pre class="clean"><code>import { from } from '@apollo/client'
// 또는
import { from } from '@apollo/client/link/core'</code></pre>
<h3 data-ke-size="size23">역할: 여러 Link를 하나로 연결</h3>
<pre class="processing"><code>// 여러 개의 Link를 하나로 합침
const combinedLink = from([
  loggerLink,
  errorLink,
  authLink,
  httpLink
])
<p>// 이렇게 쓰는 것과 동일
const combinedLink = loggerLink
.concat(errorLink)
.concat(authLink)
.concat(httpLink)</code></pre></p>
<h2 data-ke-size="size26">동작 원리</h2>
<h3 data-ke-size="size23"><code>from()</code>의 내부 구현 (단순화)</h3>
<pre class="javascript"><code>// Apollo Client 내부 코드 (개념적으로)
function from(links: ApolloLink[]): ApolloLink {
  if (links.length === 0) {
    throw new Error('링크가 없습니다')
  }
<p>if (links.length === 1) {
return links[0]
}</p>
<p>// 배열을 역순으로 순회하며 연결
return links.reduceRight((rest, link) =&gt; {
return link.concat(rest)
})
}</code></pre></p>
<p data-ke-size="size16"><b>즉, from은 여러 Link를 연결 리스트처럼 이어주는 함수!</b></p>
<h2 data-ke-size="size26">실제 동작 예시</h2>
<h3 data-ke-size="size23">코드</h3>
<pre class="javascript"><code>const loggerLink = new ApolloLink((operation, forward) =&gt; {
  console.log('1. Logger Start')
  return forward(operation).map(response =&gt; {
    console.log('4. Logger End')
    return response
  })
})
<p>const authLink = new ApolloLink((operation, forward) =&gt; {
console.log('2. Auth Start')
operation.setContext({ headers: { authorization: 'Bearer token' } })
return forward(operation).map(response =&gt; {
console.log('3. Auth End')
return response
})
})</p>
<p>const httpLink = new HttpLink({ uri: '/graphql' })</p>
<p>// from()으로 연결
const link = from([loggerLink, authLink, httpLink])</code></pre></p>
<h3 data-ke-size="size23">실행 흐름</h3>
<pre class="less"><code>요청 시작
   &darr;
1. Logger Start      (loggerLink의 forward 호출 전)
   &darr;
2. Auth Start        (authLink의 forward 호출 전)
   &darr;
[HTTP 요청]          (httpLink가 실제 요청)
   &darr;
[서버 응답]
   &darr;
3. Auth End          (authLink의 map 내부)
   &darr;
4. Logger End        (loggerLink의 map 내부)
   &darr;
컴포넌트로 반환</code></pre>
<h2 data-ke-size="size26"><code>from()</code>과 <code>concat()</code>의 관계</h2>
<h3 data-ke-size="size23">방법 1: <code>from()</code> 사용 (권장)</h3>
<pre class="angelscript"><code>const link = from([
  link1,
  link2,
  link3
])</code></pre>
<h3 data-ke-size="size23">방법 2: <code>concat()</code> 사용 (동일한 결과)</h3>
<pre class="processing"><code>const link = link1.concat(link2).concat(link3)
<p>// 또는
const link = ApolloLink.from([link1, link2, link3])</code></pre></p>
<p data-ke-size="size16"><b><code>from()</code>이 더 읽기 쉬움!</b></p>
<h2 data-ke-size="size26">왜 배열로 받을까?</h2>
<h3 data-ke-size="size23">조건부 Link 추가가 쉬워짐</h3>
<pre class="gradle"><code>const links = [
  loggerLink,
  errorLink,
  authLink
]
<p>// 개발 환경에서만 추가
if (process.env.NODE_ENV === 'development') {
links.push(debugLink)
}</p>
<p>// 클라이언트에서만 추가
if (!isServer) {
links.push(retryLink)
}</p>
<p>// HTTP는 항상 마지막
links.push(httpLink)</p>
<p>// 한 번에 연결
const link = from(links)</code></pre></p>
<p data-ke-size="size16"><b>배열 조작으로 동적 구성이 가능!</b></p>
<h2 data-ke-size="size26">실전 패턴</h2>
<h3 data-ke-size="size23">패턴 1: 스프레드 연산자 활용</h3>
<pre class="angelscript"><code>const commonLinks = [loggerLink, errorLink, authLink]
const clientOnlyLinks = [retryLink, analyticsLink]
const serverOnlyLinks = [cacheLink]
<p>const link = from([
...commonLinks,
...(isServer ? serverOnlyLinks : clientOnlyLinks),
httpLink
])</code></pre></p>
<h3 data-ke-size="size23">패턴 2: filter로 조건부 제거</h3>
<pre class="javascript"><code>const link = from([
  process.env.NODE_ENV === 'development' &amp;&amp; loggerLink,
  errorLink,
  authLink,
  !isServer &amp;&amp; retryLink,
  httpLink
].filter(Boolean))  // falsy 값 제거</code></pre>
<h3 data-ke-size="size23">패턴 3: 명시적 분기</h3>
<pre class="javascript"><code>function createLinks(isServer: boolean) {
  const baseLinks = [errorLink, authLink]
<p>if (isServer) {
return from([...baseLinks, httpLink])
} else {
return from([loggerLink, ...baseLinks, retryLink, httpLink])
}
}</code></pre></p>
<h2 data-ke-size="size26">TypeScript 타입</h2>
<pre class="less"><code>// from의 타입 정의
function from(links: ApolloLink[]): ApolloLink
<p>// ApolloLink 타입
class ApolloLink {
constructor(
request?: (
operation: Operation,
forward: NextLink
) =&gt; Observable&lt;FetchResult&gt; | null
)</p>
<p>concat(next: ApolloLink | RequestHandler): ApolloLink</p>
<p>static from(links: ApolloLink[]): ApolloLink
}</code></pre></p>
<h2 data-ke-size="size26"><code>from()</code>의 대안들</h2>
<h3 data-ke-size="size23">대안 1: <code>concat()</code> 체이닝</h3>
<pre class="processing"><code>// from() 사용
const link = from([link1, link2, link3])
<p>// concat() 사용 (동일)
const link = link1.concat(link2).concat(link3)</code></pre></p>
<h3 data-ke-size="size23">대안 2: <code>ApolloLink.from()</code> (정적 메서드)</h3>
<pre class="javascript"><code>// from() 함수
import { from } from '@apollo/client'
const link = from([link1, link2])
<p>// ApolloLink.from() 정적 메서드 (동일)
import { ApolloLink } from '@apollo/client'
const link = ApolloLink.from([link1, link2])</code></pre></p>
<p data-ke-size="size16"><b>(같은 것임)</b></p>
<h2 data-ke-size="size26">내부 동작 깊게 이해하기</h2>
<h3 data-ke-size="size23"><code>forward(operation)</code>의 의미</h3>
<pre class="javascript"><code>const myLink = new ApolloLink((operation, forward) =&gt; {
  console.log('Before')
<p>// forward = &quot;다음 Link로 넘기기&quot;
const observable = forward(operation)</p>
<p>return observable.map(response =&gt; {
console.log('After')
return response
})
})</code></pre></p>
<p data-ke-size="size16"><b><code>forward(operation)</code>은 체인의 다음 Link를 실행하는 함수예요.</b></p>
<h3 data-ke-size="size23">체인의 끝 (httpLink)</h3>
<pre class="reasonml"><code>// httpLink는 forward를 호출하지 않고, 실제 HTTP 요청을 함
const httpLink = new HttpLink({ uri: '/graphql' })
<p>// 내부적으로 이런 느낌
new ApolloLink((operation, forward) =&gt; {
// forward 호출 안 함!
return makeHttpRequest(operation)  // 실제 요청
})</code></pre></p>
<p data-ke-size="size16"><b>그래서 httpLink는 항상 마지막에 와야 함 !important</b></p>
<h2 data-ke-size="size26">잘못된 사용 예시</h2>
<h3 data-ke-size="size23">❌ httpLink를 중간에 넣으면?</h3>
<pre class="angelscript"><code>const link = from([
  loggerLink,
  httpLink,    // ❌ 중간에!
  authLink     // 실행 안 됨!
])</code></pre>
<p data-ke-size="size16"><b>결과:</b> authLink는 절대 실행 안 됨 (httpLink에서 체인이 끝남)</p>
<h3 data-ke-size="size23">❌ from에 빈 배열</h3>
<pre class="sas"><code>const link = from([])  // ❌ 에러!
// Error: from() requires at least one link</code></pre>
<h3 data-ke-size="size23">❌ Link가 아닌 것 넣기</h3>
<pre class="cs"><code>const link = from([
  loggerLink,
  'not a link',  // ❌ 타입 에러!
  httpLink
])</code></pre>
<h2 data-ke-size="size26">디버깅 팁</h2>
<h3 data-ke-size="size23">Link 체인 확인하기</h3>
<pre class="javascript"><code>const debugLink = new ApolloLink((operation, forward) =&gt; {
  console.log('  Current Link')
  console.log('Operation:', operation.operationName)
  console.log('Variables:', operation.variables)
  console.log('Context:', operation.getContext())
<p>return forward(operation).map(response =&gt; {
console.log('  Response received')
console.log('Data:', response.data)
return response
})
})</p>
<p>// 여러 곳에 삽입해서 흐름 확인
const link = from([
debugLink,  // 1번째 체크포인트
loggerLink,
debugLink,  // 2번째 체크포인트
authLink,
debugLink,  // 3번째 체크포인트
httpLink
])</code></pre></p>
<h2 data-ke-size="size26">비유로 이해하기</h2>
<pre class="typescript" data-ke-language="typescript"><code>// from()은 "도미노 연결"과 유사
<p>from([link1, link2, link3])</p>
<p>// = link1 → link2 → link3 → 결과</p>
<p>// 각 Link는 도미노 한 칸
// forward()는 &quot;다음 도미노 밀기&quot;
// 마지막 Link(httpLink)가 쓰러지면 응답이 돌아옴</code></pre></p>
<h2 data-ke-size="size26">실무 예시</h2>
<pre class="gradle"><code>// lib/apollo/links.ts
import { ApolloLink, from, HttpLink } from '@apollo/client'
<p>export function createApolloLinks(isServer: boolean) {
// 동적으로 Link 배열 구성
const links: ApolloLink[] = []</p>
<p>// 개발 환경에서만 로거
if (process.env.NODE_ENV === 'development') {
links.push(createLoggerLink(isServer))
}</p>
<p>// 공통 Link들
links.push(
createErrorLink(isServer),
createAuthLink(isServer)
)</p>
<p>// 클라이언트에서만 재시도
if (!isServer) {
links.push(createRetryLink())
}</p>
<p>// 프로덕션에서만 분석
if (process.env.NODE_ENV === 'production' &amp;&amp; !isServer) {
links.push(createAnalyticsLink())
}</p>
<p>// HTTP는 항상 마지막
links.push(createHttpLink(isServer))</p>
<p>// from()으로 체인 생성
return from(links)
}</code></pre></p>
<h2 data-ke-size="size26">정리</h2>
<pre class="angelscript"><code>// from()은 Apollo Client의 Link 체이닝 함수
import { from } from '@apollo/client'
<p>// 배열을 받아서 하나의 Link로 연결
const link = from([link1, link2, link3])</p>
<p>// Array.from()과는 완전 다른 함수!
Array.from([1, 2, 3])  // 배열 변환
from([link1, link2])   // Link 연결</code></pre></p>
<p data-ke-size="size16"><b>핵심:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>✅ <code>from()</code>은 Apollo의 Link 체이닝 함수</li>
<li>✅ 여러 Link를 하나로 연결</li>
<li>✅ 배열 순서 = 실행 순서</li>
<li>✅ 마지막은 항상 httpLink</li>
</ul>