<h2 data-ke-size="size26">1. InMemoryCache의 typePolicies</h2>
<h3 data-ke-size="size23">기본 개념: Apollo Client의 캐싱 메커니즘</h3>
<p data-ke-size="size16">Apollo Client는 GraphQL 응답을 <b>메모리에 캐싱</b>해서 같은 데이터를 다시 요청할 때 네트워크 요청 없이 즉시 반환.</p>
<pre class="routeros"><code>const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        campaign_application: {
          keyArgs: ['where', 'order_by'],
          merge(existing, incoming) {
            return incoming
          },
        },
      },
    },
  },
})</code></pre>
<h3 data-ke-size="size23">상세 분석</h3>
<h4 data-ke-size="size20"><b>typePolicies란?</b></h4>
<p data-ke-size="size16">캐시가 각 타입과 필드를 어떻게 처리할지 정의하는 규칙.</p>
<pre class="dts"><code>typePolicies: {
  Query: {  // Query 타입에 대한 정책
    fields: {  // Query 타입의 필드들
      campaign_application: {  // 이 필드에 대한 정책
        // ...
      }
    }
  }
}</code></pre>
<h4 data-ke-size="size20"><b>keyArgs: ['where', 'order_by']</b></h4>
<p data-ke-size="size16">캐시 키를 만들 때 어떤 인자를 사용할지 결정.</p>
<p data-ke-size="size16"><b>예시로 이해하기:</b></p>
<pre class="less"><code>// 쿼리 1
useQuery(GET_APPLICATIONS, {
  variables: {
    where: { campaign_id: { _eq: "abc-123" } },
    order_by: { created_at: "desc" },
    limit: 10
  }
})
<p>// 쿼리 2
useQuery(GET_APPLICATIONS, {
variables: {
where: { campaign_id: { _eq: &quot;abc-123&quot; } },
order_by: { created_at: &quot;desc&quot; },
limit: 20  // limit만 다름
}
})</code></pre></p>
<p data-ke-size="size16"><b>keyArgs가 없다면:</b></p>
<pre class="nimrod"><code>캐시 키 1: campaign_application({"where":{...},"order_by":{...},"limit":10})
캐시 키 2: campaign_application({"where":{...},"order_by":{...},"limit":20})
&rarr; 다른 키로 인식, 별도로 캐싱</code></pre>
<p data-ke-size="size16"><b>keyArgs: ['where', 'order_by']로 설정하면:</b></p>
<pre class="nimrod"><code>캐시 키 1: campaign_application({"where":{...},"order_by":{...}})
캐시 키 2: campaign_application({"where":{...},"order_by":{...}})
&rarr; 같은 키! limit는 무시됨</code></pre>
<p data-ke-size="size16"><b>결과:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>쿼리 2는 네트워크 요청 없이 쿼리 1의 캐시를 재사용</li>
<li>limit은 클라이언트에서 필터링 (배열 slice)</li>
</ul>
<h4 data-ke-size="size20"><b>merge(existing, incoming)</b></h4>
<p data-ke-size="size16">같은 캐시 키에 새 데이터가 들어올 때 <b>어떻게 병합할지</b> 결정.</p>
<pre class="stylus"><code>merge(existing, incoming) {
  return incoming  // 기존 데이터 버리고 새 데이터로 교체
}</code></pre>
<p data-ke-size="size16"><b>동작 시나리오:</b></p>
<pre class="smali"><code>// 1차 쿼리 실행
const { data } = useQuery(GET_APPLICATIONS, {
  variables: { where: { status: { _eq: "pending" } } }
})
// 캐시에 저장: [app1, app2, app3]
<p>// 2차 쿼리 실행 (같은 where, order_by)
refetch()
// 새 데이터: [app1, app2, app4]</p>
<p>// merge 함수 호출됨
merge(
existing: [app1, app2, app3],  // 기존 캐시
incoming: [app1, app2, app4]   // 새로 받은 데이터
)
// return incoming → [app1, app2, app4]로 덮어씀</code></pre></p>
<p data-ke-size="size16"><b>다른 merge 전략 예시:</b></p>
<pre class="cos"><code>// 1. 배열 합치기 (무한 스크롤)
merge(existing = [], incoming) {
  return [...existing, ...incoming]
}
<p>// 2. 중복 제거하며 합치기
merge(existing = [], incoming) {
const existingIds = new Set(existing.map(item =&gt; item.id))
const newItems = incoming.filter(item =&gt; !existingIds.has(item.id))
return [...existing, ...newItems]
}</p>
<p>// 3. 특정 조건으로 병합
merge(existing, incoming, { args }) {
if (args.offset === 0) {
return incoming  // 첫 페이지면 교체
}
return [...existing, ...incoming]  // 아니면 추가
}</code></pre></p>
<h3 data-ke-size="size23">실제 사용 예시</h3>
<pre class="cs"><code>// lib/apollo-client.tsx
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // 무한 스크롤용
        campaign_application: {
          keyArgs: ['where', 'order_by'],
          merge(existing = [], incoming, { args }) {
            const offset = args?.offset ?? 0
            const merged = existing.slice(0)
<pre><code>        for (let i = 0; i &amp;lt; incoming.length; ++i) {
          merged[offset + i] = incoming[i]
        }

        return merged
      },
    },

    // 단순 교체 (실시간 데이터)
    campaign_by_pk: {
      keyArgs: ['id'],
      merge(existing, incoming) {
        return incoming
      },
    },
  },
},
</code></pre>
<p>},
})</code></pre></p>
<p data-ke-size="size16"><b>결과:</b></p>
<pre class="yaml"><code>// 컴포넌트 1
const { data } = useQuery(GET_APPLICATIONS, {
  variables: { where: { status: { _eq: "pending" } }, limit: 10 }
})
<p>// 컴포넌트 2 (같은 where, order_by)
const { data } = useQuery(GET_APPLICATIONS, {
variables: { where: { status: { _eq: &quot;pending&quot; } }, limit: 5 }
})
// → 네트워크 요청 없이 캐시에서 가져옴! ⚡</code></pre></p>
<h2 data-ke-size="size26">2. ApolloLink - 미들웨어 체인</h2>
<h3 data-ke-size="size23">기본 개념</h3>
<p data-ke-size="size16">Apollo Link는 <b>GraphQL 요청의 미들웨어 체인</b>이에요. Express의 미들웨어와 비슷.</p>
<pre class="angelscript"><code>요청 &rarr; Link 1 &rarr; Link 2 &rarr; Link 3 &rarr; 서버
응답 &larr; Link 1 &larr; Link 2 &larr; Link 3 &larr; 서버</code></pre>
<h3 data-ke-size="size23">Logger Link 상세 분석</h3>
<pre class="javascript"><code>const loggerLink = new ApolloLink((operation, forward) =&gt; {
  console.log(`GraphQL Request: ${operation.operationName}`)
  const start = Date.now()
<p>return forward(operation).map(response =&gt; {
console.log(<code>Took ${Date.now() - start}ms</code>)
return response
})
})</code></pre></p>
<h4 data-ke-size="size20"><b>매개변수 설명</b></h4>
<pre class="dart"><code>(operation, forward) =&gt; {
  // operation: 현재 GraphQL 작업 정보
  // forward: 다음 링크로 전달하는 함수
}</code></pre>
<p data-ke-size="size16"><b>operation 객체:</b></p>
<pre class="dts"><code>{
  operationName: "GetCampaigns",  // 쿼리 이름
  query: DocumentNode,            // GraphQL 쿼리 AST
  variables: { id: "abc-123" },   // 변수들
  extensions: {},                 // 확장 정보
  getContext: () =&gt; {},           // 컨텍스트
  setContext: () =&gt; {}            // 컨텍스트 설정
}</code></pre>
<h4 data-ke-size="size20"><b>실행 흐름</b></h4>
<pre class="javascript"><code>// 1. 요청 시작
console.log(`GraphQL Request: ${operation.operationName}`)
// 출력: "GraphQL Request: GetCampaigns"
<p>// 2. 시작 시간 기록
const start = Date.now()  // 예: 1640000000000</p>
<p>// 3. 다음 링크로 전달 (서버로 요청)
return forward(operation)
// forward(operation)는 Observable을 반환
.map(response =&gt; {
// 4. 응답 받았을 때 실행
console.log(<code>Took ${Date.now() - start}ms</code>)
// 출력: &quot;Took 234ms&quot;</p>
<pre><code>// 5. 응답 그대로 반환 (변경 안 함)
return response
</code></pre>
<p>})</code></pre></p>
<h3 data-ke-size="size23">Observable 패턴</h3>
<p data-ke-size="size16">Apollo Link는 <b>Observable</b>을 사용 (RxJS와 비슷).</p>
<pre class="javascript"><code>// Observable의 개념
const observable = forward(operation)
<p>observable.map(response =&gt; {
// 응답을 변환
return response
})</p>
<p>observable.subscribe({
next: (value) =&gt; console.log('받음:', value),
error: (err) =&gt; console.error('에러:', err),
complete: () =&gt; console.log('완료')
})</code></pre></p>
<h3 data-ke-size="size23">실전 활용 예시</h3>
<h4 data-ke-size="size20"><b>1. 인증 헤더 추가</b></h4>
<pre class="javascript"><code>const authLink = new ApolloLink((operation, forward) =&gt; {
  // 토큰 가져오기
  const token = localStorage.getItem('token')
<p>// 헤더에 추가
operation.setContext({
headers: {
authorization: token ? <code>Bearer ${token}</code> : '',
}
})</p>
<p>return forward(operation)
})</code></pre></p>
<h4 data-ke-size="size20"><b>2. 에러 핸들링</b></h4>
<pre class="javascript"><code>import { onError } from '@apollo/client/link/error'
<p>const errorLink = onError(({ graphQLErrors, networkError, operation }) =&gt; {
if (graphQLErrors) {
graphQLErrors.forEach(({ message, locations, path }) =&gt; {
console.error(
<code>[GraphQL error]: Message: ${message}, Path: ${path}</code>
)
})
}</p>
<p>if (networkError) {
console.error(<code>[Network error]: ${networkError}</code>)
// 로그인 페이지로 리다이렉트 등
}
})</code></pre></p>
<h4 data-ke-size="size20"><b>3. 재시도 로직</b></h4>
<pre class="yaml"><code>import { RetryLink } from '@apollo/client/link/retry'
<p>const retryLink = new RetryLink({
delay: {
initial: 300,
max: 5000,
jitter: true
},
attempts: {
max: 3,
retryIf: (error) =&gt; !!error &amp;&amp; error.statusCode !== 400
}
})</code></pre></p>
<h4 data-ke-size="size20"><b>4. 로딩 상태 추적</b></h4>
<pre class="javascript"><code>import { makeVar } from '@apollo/client'
<p>export const loadingVar = makeVar(false)</p>
<p>const loadingLink = new ApolloLink((operation, forward) =&gt; {
loadingVar(true)</p>
<p>return forward(operation).map(response =&gt; {
loadingVar(false)
return response
})
})</p>
<p>// 컴포넌트에서 사용
function GlobalLoader() {
const isLoading = useReactiveVar(loadingVar)
return isLoading ? &lt;Spinner /&gt; : null
}</code></pre></p>
<h4 data-ke-size="size20"><b>5. 성능 모니터링 (고급)</b></h4>
<pre class="javascript"><code>const performanceLink = new ApolloLink((operation, forward) =&gt; {
  const start = performance.now()
<p>return forward(operation).map(response =&gt; {
const duration = performance.now() - start</p>
<pre><code>// 분석 서비스로 전송
analytics.track('GraphQL Query', {
  operationName: operation.operationName,
  duration,
  variables: operation.variables,
  // 느린 쿼리 경고
  slow: duration &amp;gt; 1000
})

return response
</code></pre>
<p>})
})</code></pre></p>
<h3 data-ke-size="size23">링크 체인 구성</h3>
<pre class="javascript"><code>import { ApolloClient, from, HttpLink } from '@apollo/client'
<p>const httpLink = new HttpLink({
uri: process.env.NEXT_PUBLIC_HASURA_URL,
})</p>
<p>// 체인 순서가 중요!
const client = new ApolloClient({
cache,
link: from([
loggerLink,      // 1. 로깅
errorLink,       // 2. 에러 처리
authLink,        // 3. 인증 헤더 추가
retryLink,       // 4. 재시도
performanceLink, // 5. 성능 추적
httpLink,        // 6. 실제 HTTP 요청 (마지막!)
]),
})</code></pre></p>
<p data-ke-size="size16"><b>실행 순서:</b></p>
<pre class="routeros"><code>요청 &rarr; logger &rarr; error &rarr; auth &rarr; retry &rarr; performance &rarr; HTTP &rarr; 서버
                                                               &darr;
응답 &larr; logger &larr; error &larr; auth &larr; retry &larr; performance &larr; HTTP &larr; 서버</code></pre>
<h3 data-ke-size="size23">조건부 링크 (분기 처리)</h3>
<pre class="javascript"><code>import { split } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
<p>const wsLink = new GraphQLWsLink(
createClient({ url: 'ws://localhost:8080/v1/graphql' })
)</p>
<p>// subscription은 WebSocket, 나머지는 HTTP
const splitLink = split(
({ query }) =&gt; {
const definition = getMainDefinition(query)
return (
definition.kind === 'OperationDefinition' &amp;&amp;
definition.operation === 'subscription'
)
},
wsLink,   // true면 WebSocket
httpLink  // false면 HTTP
)</code></pre></p>
<h2 data-ke-size="size26">전체 통합 예시</h2>
<pre class="javascript"><code>// lib/apollo-client.tsx
'use client'
<p>import { ApolloClient, ApolloLink, from, HttpLink, InMemoryCache } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { ApolloNextAppProvider } from '@apollo/experimental-nextjs-app-support/ssr'</p>
<p>// 캐시 설정
const cache = new InMemoryCache({
typePolicies: {
Query: {
fields: {
campaign_application: {
keyArgs: ['where', 'order_by'],
merge(existing, incoming, { args }) {
if (args?.offset === 0) {
return incoming  // 첫 페이지면 교체
}
return [...(existing ?? []), ...incoming]  // 추가
},
},
},
},
},
})</p>
<p>// 로거 링크
const loggerLink = new ApolloLink((operation, forward) =&gt; {
console.log(<code>  ${operation.operationName}</code>)
const start = Date.now()</p>
<p>return forward(operation).map(response =&gt; {
console.log(<code>✅ ${operation.operationName} (${Date.now() - start}ms)</code>)
return response
})
})</p>
<p>// 에러 링크
const errorLink = onError(({ graphQLErrors, networkError, operation }) =&gt; {
if (graphQLErrors) {
console.error(<code>❌ [${operation.operationName}]:</code>, graphQLErrors)
}
if (networkError) {
console.error(<code>  Network error:</code>, networkError)
}
})</p>
<p>// 인증 링크
const authLink = new ApolloLink((operation, forward) =&gt; {
const token = localStorage.getItem('token')</p>
<p>operation.setContext({
headers: {
authorization: token ? <code>Bearer ${token}</code> : '',
}
})</p>
<p>return forward(operation)
})</p>
<p>// HTTP 링크
const httpLink = new HttpLink({
uri: process.env.NEXT_PUBLIC_HASURA_URL,
})</p>
<p>function makeClient() {
return new ApolloClient({
cache,
link: from([
loggerLink,
errorLink,
authLink,
httpLink,
]),
})
}</p>
<p>export function ApolloWrapper({ children }: { children: React.ReactNode }) {
return (
&lt;ApolloNextAppProvider makeClient={makeClient}&gt;
{children}
&lt;/ApolloNextAppProvider&gt;
)
}</code></pre></p>
<p data-ke-size="size16"><b>콘솔 출력 예시:</b></p>
<pre class="dts"><code>  GetCampaigns
✅ GetCampaigns (234ms)
<p>GetApplications
✅ GetApplications (156ms)</p>
<p>UpdateCampaign
❌ [UpdateCampaign]: [
{
message: &quot;permission denied&quot;,
extensions: { code: &quot;validation-failed&quot; }
}
]</code></pre></p>
<h2 data-ke-size="size26">요약 정리</h2>
<h3 data-ke-size="size23">InMemoryCache typePolicies</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>목적:</b> 캐시 동작 커스터마이징</li>
<li><b>keyArgs:</b> 캐시 키 생성 기준</li>
<li><b>merge:</b> 데이터 병합 전략</li>
<li><b>효과:</b> 불필요한 네트워크 요청 감소 ⚡</li>
</ul>
<h3 data-ke-size="size23">ApolloLink</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>목적:</b> GraphQL 요청/응답 미들웨어</li>
<li><b>로거:</b> 성능 모니터링</li>
<li><b>인증:</b> 헤더 추가</li>
<li><b>에러:</b> 중앙 집중식 에러 처리</li>
<li><b>효과:</b> 관심사 분리, 재사용성 증가  </li>
</ul>