<h2 data-ke-size="size26">ApolloLink = GraphQL 요청/응답 미들웨어</h2>
<p data-ke-size="size16">Express.js의 미들웨어와 완전히 같은 개념이에요:</p>
<h3 data-ke-size="size23">Express.js 미들웨어</h3>
<pre class="moonscript"><code>// Express
app.use((req, res, next) =&gt; {
  console.log('Request:', req.url)  // 로깅
  next()  // 다음 미들웨어로
})
<p>app.use((req, res, next) =&gt; {
req.user = getCurrentUser()  // 인증
next()
})</p>
<p>app.use((req, res, next) =&gt; {
if (!req.user) {
return res.status(401).send('Unauthorized')  // 권한 체크
}
next()
})</code></pre></p>
<h3 data-ke-size="size23">Apollo Link (같은 패턴!)</h3>
<pre class="javascript"><code>// Apollo Link
const loggerLink = new ApolloLink((operation, forward) =&gt; {
  console.log('Request:', operation.operationName)  // 로깅
  return forward(operation)  // 다음 링크로
})
<p>const authLink = new ApolloLink((operation, forward) =&gt; {
const token = getToken()  // 인증
operation.setContext({
headers: { authorization: <code>Bearer ${token}</code> }
})
return forward(operation)
})</p>
<p>const errorLink = onError(({ networkError }) =&gt; {
if (networkError?.statusCode === 401) {
logout()  // 권한 체크
}
})</code></pre></p>
<h2 data-ke-size="size26">미들웨어 체인의 흐름</h2>
<h3 data-ke-size="size23">요청/응답 흐름</h3>
<pre class="sas"><code>요청 시작
   &darr;
[Logger Link]     &rarr; console.log('GetCampaigns')
   &darr;
[Auth Link]       &rarr; 헤더에 토큰 추가
   &darr;
[Retry Link]      &rarr; 실패 시 재시도 준비
   &darr;
[Error Link]      &rarr; 에러 감지 준비
   &darr;
[HTTP Link]       &rarr; 실제 서버로 요청
   &darr;
──────────────────────────────────
서버 처리
──────────────────────────────────
   &darr;
[HTTP Link]       &rarr; 응답 받음
   &darr;
[Error Link]      &rarr; 에러 있나 체크
   &darr;
[Retry Link]      &rarr; 재시도 필요한가?
   &darr;
[Auth Link]       &rarr; (응답에는 보통 작업 없음)
   &darr;
[Logger Link]     &rarr; console.log('Took 234ms')
   &darr;
컴포넌트로 반환</code></pre>
<h2 data-ke-size="size26">실무에서 자주 쓰는 Link들</h2>
<h3 data-ke-size="size23">1. <b>인증 Link (가장 기본)</b></h3>
<pre class="javascript"><code>import { setContext } from '@apollo/client/link/context'
<p>const authLink = setContext((_, { headers }) =&gt; {
const token = localStorage.getItem('token')</p>
<p>return {
headers: {
...headers,
authorization: token ? <code>Bearer ${token}</code> : '',
}
}
})</code></pre></p>
<p data-ke-size="size16"><b>사용 이유:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>모든 요청에 토큰 자동 추가</li>
<li>컴포넌트에서 신경 안 써도 됨</li>
<li>Hasura의 JWT 인증에 필수!</li>
</ul>
<pre class="less"><code>// 이렇게 안 해도 됨! ❌
useQuery(GET_CAMPAIGNS, {
  context: {
    headers: { authorization: `Bearer ${token}` }
  }
})
<p>// authLink가 자동으로 해줌 ✅
useQuery(GET_CAMPAIGNS)</code></pre></p>
<h3 data-ke-size="size23">2. <b>에러 처리 Link</b></h3>
<pre class="javascript"><code>import { onError } from '@apollo/client/link/error'
<p>const errorLink = onError(({ graphQLErrors, networkError, operation }) =&gt; {
// GraphQL 에러 (서버가 응답은 했지만 에러)
if (graphQLErrors) {
graphQLErrors.forEach(({ message, extensions }) =&gt; {
if (extensions?.code === 'UNAUTHENTICATED') {
console.error('로그인 필요!')
// 로그인 페이지로 리다이렉트
window.location.href = '/login'
}</p>
<pre><code>  if (extensions?.code === 'FORBIDDEN') {
    toast.error('권한이 없습니다')
  }

  if (message.includes('unique constraint')) {
    toast.error('이미 존재하는 데이터입니다')
  }
})
</code></pre>
<p>}</p>
<p>// 네트워크 에러 (서버 응답 자체가 없음)
if (networkError) {
console.error('네트워크 에러:', networkError)
toast.error('서버 연결 실패')
}
})</code></pre></p>
<p data-ke-size="size16"><b>사용 이유:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>에러를 한 곳에서 중앙 집중 처리</li>
<li>컴포넌트마다 에러 처리 코드 반복 안 해도 됨</li>
</ul>
<pre class="aspectj"><code>// 이렇게 매번 안 해도 됨 ❌
const { data, error } = useQuery(GET_CAMPAIGNS)
<p>if (error) {
if (error.message.includes('auth')) {
window.location.href = '/login'
}
if (error.message.includes('unique')) {
toast.error('중복')
}
// 반복 반복 반복...
}</p>
<p>// errorLink가 자동 처리 ✅
const { data } = useQuery(GET_CAMPAIGNS)</code></pre></p>
<h3 data-ke-size="size23">3. <b>재시도 Link</b></h3>
<pre class="yaml"><code>import { RetryLink } from '@apollo/client/link/retry'
<p>const retryLink = new RetryLink({
delay: {
initial: 300,    // 첫 재시도: 300ms 후
max: 5000,       // 최대 대기: 5초
jitter: true     // 랜덤 지연 추가 (서버 부하 분산)
},
attempts: {
max: 3,          // 최대 3번 재시도
retryIf: (error, operation) =&gt; {
// 네트워크 에러만 재시도
return !!error &amp;&amp; !error.statusCode</p>
<pre><code>  // 또는 특정 상태 코드만
  // return error?.statusCode === 503  // 서버 점검 중
}
</code></pre>
<p>}
})</code></pre></p>
<p data-ke-size="size16"><b>사용 이유:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>일시적 네트워크 문제 자동 해결</li>
<li>사용자 경험 개선</li>
</ul>
<pre class="javascript"><code>// 수동 재시도 ❌
const [getCampaigns, { loading, error }] = useLazyQuery(GET_CAMPAIGNS)
<p>const handleClick = async () =&gt; {
try {
await getCampaigns()
} catch (error) {
// 재시도 로직
await new Promise(r =&gt; setTimeout(r, 1000))
try {
await getCampaigns()
} catch {
// 또 재시도...
}
}
}</p>
<p>// retryLink가 자동 처리 ✅
const { data } = useQuery(GET_CAMPAIGNS)</code></pre></p>
<h3 data-ke-size="size23">4. <b>로딩 상태 Link</b></h3>
<pre class="javascript"><code>import { makeVar } from '@apollo/client'
<p>// 전역 상태
export const isLoadingVar = makeVar(false)
export const activeQueriesVar = makeVar&lt;string[]&gt;([])</p>
<p>const loadingLink = new ApolloLink((operation, forward) =&gt; {
// 요청 시작
const operationName = operation.operationName</p>
<p>activeQueriesVar([...activeQueriesVar(), operationName])
isLoadingVar(true)</p>
<p>return forward(operation).map(response =&gt; {
// 응답 완료
const active = activeQueriesVar().filter(name =&gt; name !== operationName)
activeQueriesVar(active)</p>
<pre><code>if (active.length === 0) {
  isLoadingVar(false)
}

return response
</code></pre>
<p>})
})</p>
<p>// 컴포넌트에서 사용
function GlobalLoader() {
const isLoading = useReactiveVar(isLoadingVar)
const activeQueries = useReactiveVar(activeQueriesVar)</p>
<p>return (
&lt;div&gt;
{isLoading &amp;&amp; &lt;Spinner /&gt;}
&lt;div&gt;Active: {activeQueries.join(', ')}&lt;/div&gt;
&lt;/div&gt;
)
}</code></pre></p>
<p data-ke-size="size16"><b>사용 이유:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>전역 로딩 스피너</li>
<li>활성 쿼리 추적</li>
</ul>
<h3 data-ke-size="size23">5. <b>조건부 Link (WebSocket vs HTTP)</b></h3>
<pre class="javascript"><code>import { split } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
<p>const wsLink = new GraphQLWsLink(
createClient({
url: 'ws://localhost:8080/v1/graphql',
connectionParams: {
headers: {
authorization: <code>Bearer ${getToken()}</code>
}
}
})
)</p>
<p>const httpLink = new HttpLink({
uri: 'http://localhost:8080/v1/graphql'
})</p>
<p>// subscription은 WebSocket, 나머지는 HTTP
const splitLink = split(
({ query }) =&gt; {
const definition = getMainDefinition(query)
return (
definition.kind === 'OperationDefinition' &amp;&amp;
definition.operation === 'subscription'
)
},
wsLink,    // true면 WebSocket
httpLink   // false면 HTTP
)</code></pre></p>
<p data-ke-size="size16"><b>사용 이유:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>실시간 subscription은 WebSocket</li>
<li>일반 query/mutation은 HTTP</li>
<li>자동으로 적절한 프로토콜 선택</li>
</ul>
<h3 data-ke-size="size23">6. <b>캐시 무효화 Link</b></h3>
<pre class="lisp"><code>const invalidationLink = new ApolloLink((operation, forward) =&gt; {
  return forward(operation).map(response =&gt; {
    // mutation 성공 시 관련 쿼리 무효화
    if (operation.query.definitions[0].operation === 'mutation') {
      const mutationName = operation.operationName
<pre><code>  // 특정 mutation 후 캐시 무효화
  if (mutationName === 'UpdateCampaign') {
    client.cache.evict({ 
      id: 'ROOT_QUERY',
      fieldName: 'campaigns' 
    })
  }

  if (mutationName === 'CreateApplication') {
    client.refetchQueries({
      include: ['GetApplications', 'GetCampaignStats']
    })
  }
}

return response
</code></pre>
<p>})
})</code></pre></p>
<p data-ke-size="size16"><b>사용 이유:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>mutation 후 자동으로 관련 데이터 갱신</li>
<li>수동 refetch 불필요</li>
</ul>
<h3 data-ke-size="size23">7. <b>분석/모니터링 Link</b></h3>
<pre class="javascript"><code>const analyticsLink = new ApolloLink((operation, forward) =&gt; {
  const start = performance.now()
<p>return forward(operation).map(response =&gt; {
const duration = performance.now() - start</p>
<pre><code>// 분석 서비스로 전송
analytics.track('GraphQL Query', {
  operationName: operation.operationName,
  operationType: operation.query.definitions[0].operation,
  duration,
  variables: operation.variables,
  slow: duration &amp;gt; 1000  // 1초 이상이면 slow
})

// 느린 쿼리 경고
if (duration &amp;gt; 3000) {
  console.warn(`⚠️ Slow query: ${operation.operationName} (${duration}ms)`)

  // Sentry 등으로 전송
  Sentry.captureMessage(`Slow GraphQL query: ${operation.operationName}`, {
    level: 'warning',
    extra: { duration, variables: operation.variables }
  })
}

return response
</code></pre>
<p>})
})</code></pre></p>
<h3 data-ke-size="size23">8. <b>Request ID Link (디버깅용)</b></h3>
<pre class="javascript"><code>import { v4 as uuid } from 'uuid'
<p>const requestIdLink = new ApolloLink((operation, forward) =&gt; {
const requestId = uuid()</p>
<p>// 요청에 ID 추가
operation.setContext({
headers: {
'x-request-id': requestId
}
})</p>
<p>console.log(<code>[${requestId}] ${operation.operationName} started</code>)</p>
<p>return forward(operation).map(response =&gt; {
console.log(<code>[${requestId}] ${operation.operationName} completed</code>)
return response
})
})</code></pre></p>
<p data-ke-size="size16"><b>사용 이유:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>요청 추적</li>
<li>서버 로그와 매칭</li>
<li>디버깅 용이</li>
</ul>
<h2 data-ke-size="size26">실전 Link 조합</h2>
<h3 data-ke-size="size23">기본 구성</h3>
<pre class="javascript"><code>import { ApolloClient, from, HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
<p>// 1. 인증
const authLink = setContext((_, { headers }) =&gt; ({
headers: {
...headers,
authorization: <code>Bearer ${getToken()}</code>
}
}))</p>
<p>// 2. 에러 처리
const errorLink = onError(({ graphQLErrors, networkError }) =&gt; {
if (graphQLErrors) {
graphQLErrors.forEach(({ extensions }) =&gt; {
if (extensions?.code === 'UNAUTHENTICATED') {
window.location.href = '/login'
}
})
}</p>
<p>if (networkError) {
toast.error('네트워크 에러')
}
})</p>
<p>// 3. HTTP
const httpLink = new HttpLink({
uri: process.env.NEXT_PUBLIC_HASURA_URL
})</p>
<p>// 조합 (순서 중요!)
const client = new ApolloClient({
cache: new InMemoryCache(),
link: from([
errorLink,  // 에러 처리 먼저
authLink,   // 그 다음 인증
httpLink    // 마지막에 HTTP
])
})</code></pre></p>
<h3 data-ke-size="size23">프로덕션 구성</h3>
<pre class="javascript"><code>import { RetryLink } from '@apollo/client/link/retry'
<p>const client = new ApolloClient({
cache: new InMemoryCache(),
link: from([
// 개발 환경에서만 로거
...(process.env.NODE_ENV === 'development' ? [loggerLink] : []),</p>
<pre><code>// 에러 처리
errorLink,

// 분석
analyticsLink,

// 인증
authLink,

// 재시도
retryLink,

// HTTP/WebSocket 분기
splitLink
</code></pre>
<p>])
})</code></pre></p>
<h2 data-ke-size="size26">Link 작성 패턴</h2>
<h3 data-ke-size="size23">패턴 1: 단순 변환</h3>
<pre class="reasonml"><code>const uppercaseLink = new ApolloLink((operation, forward) =&gt; {
  // 요청 변환
  operation.operationName = operation.operationName.toUpperCase()
<p>return forward(operation).map(response =&gt; {
// 응답 변환
return {
...response,
data: transformData(response.data)
}
})
})</code></pre></p>
<h3 data-ke-size="size23">패턴 2: 조건부 실행</h3>
<pre class="lisp"><code>const cacheFirstLink = new ApolloLink((operation, forward) =&gt; {
  const cached = checkCache(operation)
<p>if (cached) {
// 캐시 있으면 요청 안 함
return Observable.of({ data: cached })
}</p>
<p>// 캐시 없으면 진행
return forward(operation)
})</code></pre></p>
<h3 data-ke-size="size23">패턴 3: 비동기 처리</h3>
<pre class="lisp"><code>const asyncAuthLink = new ApolloLink((operation, forward) =&gt; {
  // 비동기로 토큰 갱신
  return new Observable(observer =&gt; {
    refreshTokenIfNeeded()
      .then(() =&gt; {
        const token = getToken()
        operation.setContext({
          headers: { authorization: `Bearer ${token}` }
        })
        return forward(operation)
      })
      .then(observable =&gt; {
        observable.subscribe(observer)
      })
      .catch(observer.error.bind(observer))
  })
})</code></pre>
<h2 data-ke-size="size26">TanStack Query와 비교</h2>
<h3 data-ke-size="size23">TanStack Query의 미들웨어 스타일</h3>
<pre class="javascript"><code>const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 전역 설정 (Link와 비슷한 역할)
      retry: 3,
      staleTime: 5000,
      onError: (error) =&gt; {
        console.error(error)
      },
      // 하지만 체인은 안 됨
    }
  }
})
<p>// 개별 커스터마이징
useQuery({
queryKey: ['campaigns'],
queryFn: fetchCampaigns,
onSuccess: (data) =&gt; {
// 성공 처리
},
onError: (error) =&gt; {
// 에러 처리
}
})</code></pre></p>
<p data-ke-size="size16"><b>차이점:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>TanStack Query: 옵션 기반</li>
<li>Apollo Link: 체인 기반 (더 유연)</li>
</ul>
<h2 data-ke-size="size26">정리</h2>
<pre class="stata"><code>// ApolloLink = 미들웨어 체인
//   ├─ 로거 (미들웨어의 한 예시)
//   ├─ 인증 (토큰 추가)
//   ├─ 에러 처리
//   ├─ 재시도
//   ├─ 분석
//   └─ ... 무한 확장 가능!
<p>// Express 미들웨어와 동일한 개념
app.use(logger)
app.use(auth)
app.use(errorHandler)</p>
<p>// Apollo Link
from([loggerLink, authLink, errorLink, httpLink])</code></pre></p>
<p data-ke-size="size16"><b>로거는 Link의 활용 예시 중 하나일 뿐!</b> ✨</p>