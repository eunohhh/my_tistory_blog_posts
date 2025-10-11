<h2 data-ke-size="size26">TanStack Query DevTools vs Apollo DevTools 비교</h2>
<h3 data-ke-size="size23">TanStack Query DevTools ✨</h3>
<pre class="angelscript"><code>import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
<p>&lt;QueryClientProvider client={queryClient}&gt;
&lt;App /&gt;
&lt;ReactQueryDevtools initialIsOpen={false} /&gt;
&lt;/QueryClientProvider&gt;</p>
<p>// 기능:
// ✅ 모든 쿼리 상태 실시간 확인
// ✅ 캐시 데이터 탐색
// ✅ 쿼리 무효화/리페치 버튼
// ✅ 타임라인
// ✅ 직관적인 UI</code></pre></p>
<h3 data-ke-size="size23">Apollo DevTools  </h3>
<pre class="1c"><code>// 브라우저 확장 프로그램 설치 필요
// Chrome/Firefox Extension
<p>// 기능:
// ⚠️ 쿼리 목록 (기본적)
// ⚠️ 캐시 탐색 (복잡함)
// ⚠️ Mutation 추적 (불편함)
// ⚠️ UI가 투박함
// ❌ 타임라인 없음
// ❌ 실시간 업데이트 약함</code></pre></p>
<h2 data-ke-size="size26">해결책: Custom DevTools Link 만들기!</h2>
<h3 data-ke-size="size23">1. 기본 디버깅 Link</h3>
<pre class="typescript"><code>// lib/apollo/debug-link.ts
import { ApolloLink } from '@apollo/client'
import { makeVar } from '@apollo/client'
<p>// 전역 상태로 쿼리 히스토리 관리
export const queryHistoryVar = makeVar&lt;QueryLog[]&gt;([])</p>
<p>interface QueryLog {
id: string
operationName: string
operationType: 'query' | 'mutation' | 'subscription'
variables: any
startTime: number
endTime?: number
duration?: number
status: 'pending' | 'success' | 'error'
error?: any
result?: any
cached: boolean
}</p>
<p>export function createDebugLink() {
return new ApolloLink((operation, forward) =&gt; {
const id = <code>${operation.operationName}-${Date.now()}</code>
const startTime = performance.now()</p>
<pre><code>// 로그 생성
const log: QueryLog = {
  id,
  operationName: operation.operationName,
  operationType: operation.query.definitions[0]?.operation || 'query',
  variables: operation.variables,
  startTime,
  status: 'pending',
  cached: false
}

// 히스토리에 추가
queryHistoryVar([log, ...queryHistoryVar()])

return forward(operation).map(response =&amp;gt; {
  const endTime = performance.now()
  const duration = endTime - startTime

  // 로그 업데이트
  const updatedLog: QueryLog = {
    ...log,
    endTime,
    duration,
    status: 'success',
    result: response.data,
    cached: duration &amp;lt; 10 // 10ms 이하면 캐시로 간주
  }

  queryHistoryVar(
    queryHistoryVar().map(l =&amp;gt; l.id === id ? updatedLog : l)
  )

  // 콘솔에도 출력
  console.groupCollapsed(
    `%c${log.operationType.toUpperCase()} %c${operation.operationName} %c${duration.toFixed(2)}ms`,
    'color: #FF6B6B; font-weight: bold',
    'color: #4ECDC4',
    duration &amp;gt; 1000 ? 'color: #FF6B6B' : 'color: #95E1D3'
  )
  console.log('Variables:', operation.variables)
  console.log('Result:', response.data)
  console.log('Cached:', updatedLog.cached)
  console.groupEnd()

  return response
})
</code></pre>
<p>})
}</code></pre></p>
<h3 data-ke-size="size23">2. Custom DevTools UI 컴포넌트</h3>
<pre class="javascript"><code>// components/apollo-devtools.tsx
'use client'
<p>import { useReactiveVar } from '@apollo/client'
import { queryHistoryVar } from '@/lib/apollo/debug-link'
import { useState } from 'react'</p>
<p>export function ApolloDevTools() {
const history = useReactiveVar(queryHistoryVar)
const [isOpen, setIsOpen] = useState(false)
const [selectedLog, setSelectedLog] = useState&lt;string | null&gt;(null)</p>
<p>if (process.env.NODE_ENV !== 'development') {
return null
}</p>
<p>const selected = history.find(log =&gt; log.id === selectedLog)</p>
<p>return (
&lt;&gt;
{/* 플로팅 버튼 */}
&lt;button
onClick={() =&gt; setIsOpen(!isOpen)}
className=&quot;fixed bottom-4 right-4 z-[9999] bg-purple-600 text-white rounded-full w-14 h-14 shadow-lg hover:bg-purple-700 transition-all&quot;
title=&quot;Apollo DevTools&quot;
&gt;</p>
<pre><code>  &amp;lt;/button&amp;gt;

  {/* DevTools 패널 */}
  {isOpen &amp;amp;&amp;amp; (
    &amp;lt;div className=&quot;fixed inset-0 z-[9998] pointer-events-none&quot;&amp;gt;
      &amp;lt;div className=&quot;absolute bottom-20 right-4 w-[600px] h-[500px] bg-gray-900 rounded-lg shadow-2xl pointer-events-auto flex flex-col&quot;&amp;gt;
        {/* 헤더 */}
        &amp;lt;div className=&quot;bg-purple-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between&quot;&amp;gt;
          &amp;lt;div className=&quot;flex items-center gap-2&quot;&amp;gt;
            &amp;lt;span className=&quot;text-lg font-bold&quot;&amp;gt;Apollo DevTools&amp;lt;/span&amp;gt;
            &amp;lt;span className=&quot;text-xs bg-purple-700 px-2 py-1 rounded&quot;&amp;gt;
              {history.length} queries
            &amp;lt;/span&amp;gt;
          &amp;lt;/div&amp;gt;
          &amp;lt;div className=&quot;flex gap-2&quot;&amp;gt;
            &amp;lt;button
              onClick={() =&amp;gt; queryHistoryVar([])}
              className=&quot;text-xs bg-purple-700 hover:bg-purple-800 px-3 py-1 rounded&quot;
            &amp;gt;
              Clear
            &amp;lt;/button&amp;gt;
            &amp;lt;button
              onClick={() =&amp;gt; setIsOpen(false)}
              className=&quot;text-white hover:text-gray-300&quot;
            &amp;gt;
              ✕
            &amp;lt;/button&amp;gt;
          &amp;lt;/div&amp;gt;
        &amp;lt;/div&amp;gt;

        &amp;lt;div className=&quot;flex-1 flex overflow-hidden&quot;&amp;gt;
          {/* 쿼리 목록 */}
          &amp;lt;div className=&quot;w-1/2 border-r border-gray-700 overflow-y-auto&quot;&amp;gt;
            {history.map(log =&amp;gt; (
              &amp;lt;div
                key={log.id}
                onClick={() =&amp;gt; setSelectedLog(log.id)}
                className={`
                  px-4 py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors
                  ${selectedLog === log.id ? 'bg-gray-800' : ''}
                `}
              &amp;gt;
                &amp;lt;div className=&quot;flex items-center justify-between mb-1&quot;&amp;gt;
                  &amp;lt;span className={`
                    text-xs font-mono px-2 py-0.5 rounded
                    ${log.operationType === 'query' ? 'bg-blue-900 text-blue-300' : ''}
                    ${log.operationType === 'mutation' ? 'bg-green-900 text-green-300' : ''}
                    ${log.operationType === 'subscription' ? 'bg-purple-900 text-purple-300' : ''}
                  `}&amp;gt;
                    {log.operationType.toUpperCase()}
                  &amp;lt;/span&amp;gt;
                  &amp;lt;span className={`
                    text-xs
                    ${log.duration! &amp;gt; 1000 ? 'text-red-400' : 'text-green-400'}
                  `}&amp;gt;
                    {log.duration?.toFixed(0)}ms
                  &amp;lt;/span&amp;gt;
                &amp;lt;/div&amp;gt;
                &amp;lt;div className=&quot;text-sm text-white font-medium&quot;&amp;gt;
                  {log.operationName}
                &amp;lt;/div&amp;gt;
                &amp;lt;div className=&quot;flex items-center gap-2 mt-1&quot;&amp;gt;
                  &amp;lt;span className={`
                    text-xs px-1.5 py-0.5 rounded
                    ${log.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : ''}
                    ${log.status === 'success' ? 'bg-green-900 text-green-300' : ''}
                    ${log.status === 'error' ? 'bg-red-900 text-red-300' : ''}
                  `}&amp;gt;
                    {log.status}
                  &amp;lt;/span&amp;gt;
                  {log.cached &amp;amp;&amp;amp; (
                    &amp;lt;span className=&quot;text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded&quot;&amp;gt;
                      cached
                    &amp;lt;/span&amp;gt;
                  )}
                &amp;lt;/div&amp;gt;
              &amp;lt;/div&amp;gt;
            ))}
          &amp;lt;/div&amp;gt;

          {/* 상세 정보 */}
          &amp;lt;div className=&quot;w-1/2 overflow-y-auto p-4 text-white&quot;&amp;gt;
            {selected ? (
              &amp;lt;div className=&quot;space-y-4&quot;&amp;gt;
                &amp;lt;div&amp;gt;
                  &amp;lt;h3 className=&quot;text-lg font-bold text-purple-400 mb-2&quot;&amp;gt;
                    {selected.operationName}
                  &amp;lt;/h3&amp;gt;
                  &amp;lt;div className=&quot;text-sm text-gray-400&quot;&amp;gt;
                    {new Date(selected.startTime).toLocaleTimeString()}
                  &amp;lt;/div&amp;gt;
                &amp;lt;/div&amp;gt;

                &amp;lt;div&amp;gt;
                  &amp;lt;h4 className=&quot;text-sm font-semibold text-gray-400 mb-2&quot;&amp;gt;
                    Variables
                  &amp;lt;/h4&amp;gt;
                  &amp;lt;pre className=&quot;bg-gray-800 p-3 rounded text-xs overflow-x-auto&quot;&amp;gt;
                    {JSON.stringify(selected.variables, null, 2)}
                  &amp;lt;/pre&amp;gt;
                &amp;lt;/div&amp;gt;

                {selected.result &amp;amp;&amp;amp; (
                  &amp;lt;div&amp;gt;
                    &amp;lt;h4 className=&quot;text-sm font-semibold text-gray-400 mb-2&quot;&amp;gt;
                      Result
                    &amp;lt;/h4&amp;gt;
                    &amp;lt;pre className=&quot;bg-gray-800 p-3 rounded text-xs overflow-x-auto max-h-64&quot;&amp;gt;
                      {JSON.stringify(selected.result, null, 2)}
                    &amp;lt;/pre&amp;gt;
                  &amp;lt;/div&amp;gt;
                )}

                {selected.error &amp;amp;&amp;amp; (
                  &amp;lt;div&amp;gt;
                    &amp;lt;h4 className=&quot;text-sm font-semibold text-red-400 mb-2&quot;&amp;gt;
                      Error
                    &amp;lt;/h4&amp;gt;
                    &amp;lt;pre className=&quot;bg-red-900 text-red-100 p-3 rounded text-xs overflow-x-auto&quot;&amp;gt;
                      {JSON.stringify(selected.error, null, 2)}
                    &amp;lt;/pre&amp;gt;
                  &amp;lt;/div&amp;gt;
                )}
              &amp;lt;/div&amp;gt;
            ) : (
              &amp;lt;div className=&quot;text-center text-gray-500 mt-20&quot;&amp;gt;
                Select a query to see details
              &amp;lt;/div&amp;gt;
            )}
          &amp;lt;/div&amp;gt;
        &amp;lt;/div&amp;gt;
      &amp;lt;/div&amp;gt;
    &amp;lt;/div&amp;gt;
  )}
&amp;lt;/&amp;gt;
</code></pre>
<p>)
}</code></pre></p>
<h3 data-ke-size="size23">3. 사용하기</h3>
<pre class="javascript"><code>// lib/apollo/links.ts
export function createApolloLinks(options: CreateLinksOptions) {
  const { isServer } = options
<p>const links = [
// 개발 환경 + 클라이언트에서만 DevTools Link
...(process.env.NODE_ENV === 'development' &amp;&amp; !isServer
? [createDebugLink()]
: []
),
createErrorLink(options),
createAuthLink(options),
createHttpLink(options)
]</p>
<p>return from(links)
}</code></pre></p>
<pre class="javascript"><code>// app/layout.tsx
import { ApolloDevTools } from '@/components/apollo-devtools'

export default function RootLayout({ children }) {
  return (
    &lt;html&gt;
      &lt;body&gt;
        &lt;ApolloWrapper&gt;
          {children}
        &lt;/ApolloWrapper&gt;
        &lt;ApolloDevTools /&gt;
      &lt;/body&gt;
    &lt;/html&gt;
  )
}</code></pre>
<h2 data-ke-size="size26">고급 기능 추가</h2>
<h3 data-ke-size="size23">4. 캐시 탐색기</h3>
<pre class="javascript"><code>// components/apollo-cache-explorer.tsx
'use client'
<p>import { useApolloClient } from '@apollo/client'
import { useState } from 'react'</p>
<p>export function ApolloCacheExplorer() {
const client = useApolloClient()
const [cache, setCache] = useState&lt;any&gt;(null)</p>
<p>const extractCache = () =&gt; {
const extracted = client.cache.extract()
setCache(extracted)
}</p>
<p>const clearCache = () =&gt; {
client.cache.reset()
setCache(null)
}</p>
<p>return (
&lt;div className=&quot;p-4&quot;&gt;
&lt;div className=&quot;flex gap-2 mb-4&quot;&gt;
&lt;button
onClick={extractCache}
className=&quot;bg-blue-600 text-white px-4 py-2 rounded&quot;
&gt;
Extract Cache
&lt;/button&gt;
&lt;button
onClick={clearCache}
className=&quot;bg-red-600 text-white px-4 py-2 rounded&quot;
&gt;
️ Clear Cache
&lt;/button&gt;
&lt;/div&gt;</p>
<pre><code>  {cache &amp;amp;&amp;amp; (
    &amp;lt;div className=&quot;bg-gray-900 text-white p-4 rounded&quot;&amp;gt;
      &amp;lt;h3 className=&quot;text-lg font-bold mb-2&quot;&amp;gt;Cache Contents&amp;lt;/h3&amp;gt;
      &amp;lt;pre className=&quot;text-xs overflow-auto max-h-96&quot;&amp;gt;
        {JSON.stringify(cache, null, 2)}
      &amp;lt;/pre&amp;gt;
    &amp;lt;/div&amp;gt;
  )}
&amp;lt;/div&amp;gt;
</code></pre>
<p>)
}</code></pre></p>
<h3 data-ke-size="size23">5. 성능 차트</h3>
<pre class="javascript"><code>// components/apollo-performance-chart.tsx
'use client'
<p>import { useReactiveVar } from '@apollo/client'
import { queryHistoryVar } from '@/lib/apollo/debug-link'</p>
<p>export function ApolloPerformanceChart() {
const history = useReactiveVar(queryHistoryVar)</p>
<p>const slowQueries = history.filter(log =&gt; (log.duration || 0) &gt; 1000)
const avgDuration = history.length &gt; 0
? history.reduce((sum, log) =&gt; sum + (log.duration || 0), 0) / history.length
: 0</p>
<p>return (
&lt;div className=&quot;p-4 bg-gray-900 rounded&quot;&gt;
&lt;h3 className=&quot;text-white font-bold mb-4&quot;&gt;Performance Metrics&lt;/h3&gt;</p>
<pre><code>  &amp;lt;div className=&quot;grid grid-cols-3 gap-4 mb-4&quot;&amp;gt;
    &amp;lt;div className=&quot;bg-gray-800 p-3 rounded&quot;&amp;gt;
      &amp;lt;div className=&quot;text-gray-400 text-sm&quot;&amp;gt;Total Queries&amp;lt;/div&amp;gt;
      &amp;lt;div className=&quot;text-white text-2xl font-bold&quot;&amp;gt;{history.length}&amp;lt;/div&amp;gt;
    &amp;lt;/div&amp;gt;

    &amp;lt;div className=&quot;bg-gray-800 p-3 rounded&quot;&amp;gt;
      &amp;lt;div className=&quot;text-gray-400 text-sm&quot;&amp;gt;Avg Duration&amp;lt;/div&amp;gt;
      &amp;lt;div className=&quot;text-white text-2xl font-bold&quot;&amp;gt;
        {avgDuration.toFixed(0)}ms
      &amp;lt;/div&amp;gt;
    &amp;lt;/div&amp;gt;

    &amp;lt;div className=&quot;bg-gray-800 p-3 rounded&quot;&amp;gt;
      &amp;lt;div className=&quot;text-gray-400 text-sm&quot;&amp;gt;Slow Queries&amp;lt;/div&amp;gt;
      &amp;lt;div className=&quot;text-red-400 text-2xl font-bold&quot;&amp;gt;
        {slowQueries.length}
      &amp;lt;/div&amp;gt;
    &amp;lt;/div&amp;gt;
  &amp;lt;/div&amp;gt;

  {/* 차트 */}
  &amp;lt;div className=&quot;space-y-2&quot;&amp;gt;
    {history.slice(0, 10).map(log =&amp;gt; (
      &amp;lt;div key={log.id} className=&quot;flex items-center gap-2&quot;&amp;gt;
        &amp;lt;div className=&quot;text-xs text-gray-400 w-32 truncate&quot;&amp;gt;
          {log.operationName}
        &amp;lt;/div&amp;gt;
        &amp;lt;div className=&quot;flex-1 bg-gray-800 rounded h-6 relative&quot;&amp;gt;
          &amp;lt;div
            className={`h-full rounded transition-all ${
              (log.duration || 0) &amp;gt; 1000 ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{
              width: `${Math.min((log.duration || 0) / 30, 100)}%`
            }}
          /&amp;gt;
        &amp;lt;/div&amp;gt;
        &amp;lt;div className=&quot;text-xs text-gray-400 w-16 text-right&quot;&amp;gt;
          {log.duration?.toFixed(0)}ms
        &amp;lt;/div&amp;gt;
      &amp;lt;/div&amp;gt;
    ))}
  &amp;lt;/div&amp;gt;
&amp;lt;/div&amp;gt;
</code></pre>
<p>)
}</code></pre></p>
<h3 data-ke-size="size23">6. Network Inspector Link</h3>
<pre class="javascript"><code>// lib/apollo/network-inspector-link.ts
import { ApolloLink } from '@apollo/client'
<p>export function createNetworkInspectorLink() {
return new ApolloLink((operation, forward) =&gt; {
const startTime = performance.now()</p>
<pre><code>console.group(
  `%c  Network Request`,
  'color: #61DAFB; font-weight: bold; font-size: 14px'
)

console.log('%cOperation:', 'font-weight: bold', operation.operationName)
console.log('%cType:', 'font-weight: bold', operation.query.definitions[0]?.operation)
console.log('%cVariables:', 'font-weight: bold', operation.variables)

// Context 정보
const context = operation.getContext()
console.log('%cContext:', 'font-weight: bold', {
  headers: context.headers,
  uri: context.uri
})

console.groupEnd()

return forward(operation).map(response =&amp;gt; {
  const duration = performance.now() - startTime
  const durationColor = duration &amp;gt; 1000 ? '#FF6B6B' : '#51CF66'

  console.group(
    `%c✅ Network Response %c${duration.toFixed(2)}ms`,
    'color: #51CF66; font-weight: bold; font-size: 14px',
    `color: ${durationColor}; font-weight: bold`
  )

  console.log('%cOperation:', 'font-weight: bold', operation.operationName)
  console.log('%cData:', 'font-weight: bold', response.data)

  if (response.errors) {
    console.log('%cErrors:', 'font-weight: bold; color: #FF6B6B', response.errors)
  }

  // Extensions (Hasura의 경우 유용)
  if (response.extensions) {
    console.log('%cExtensions:', 'font-weight: bold', response.extensions)
  }

  console.groupEnd()

  return response
})
</code></pre>
<p>})
}</code></pre></p>
<h2 data-ke-size="size26">완성된 DevTools 통합</h2>
<pre class="gradle"><code>// lib/apollo/links.ts
export function createApolloLinks(options: CreateLinksOptions) {
  const { isServer } = options
  const isDev = process.env.NODE_ENV === 'development'
<p>const links = []</p>
<p>// 개발 환경 + 클라이언트
if (isDev &amp;&amp; !isServer) {
links.push(
createDebugLink(),           // Custom DevTools
createNetworkInspectorLink() // 네트워크 로깅
)
}</p>
<p>// 공통 Link
links.push(
createErrorLink(options),
createAuthLink(options)
)</p>
<p>// 클라이언트 전용
if (!isServer) {
links.push(createRetryLink())
}</p>
<p>// HTTP
links.push(createHttpLink(options))</p>
<p>return from(links)
}</code></pre></p>
<pre class="javascript"><code>// app/layout.tsx
import { ApolloDevTools } from '@/components/apollo-devtools'

export default function RootLayout({ children }) {
  return (
    &lt;html&gt;
      &lt;body&gt;
        &lt;ApolloWrapper&gt;
          {children}
        &lt;/ApolloWrapper&gt;

        {/* 개발 환경에서만 표시 */}
        {process.env.NODE_ENV === 'development' &amp;&amp; (
          &lt;ApolloDevTools /&gt;
        )}
      &lt;/body&gt;
    &lt;/html&gt;
  )
}</code></pre>
<h2 data-ke-size="size26">콘솔 출력 예시</h2>
<pre class="routeros"><code>  Network Request
  Operation: GetCampaigns
  Type: query
  Variables: { status: "open", limit: 10 }
  Context: { headers: { authorization: "Bearer ..." } }
<p>✅ Network Response 234.56ms
Operation: GetCampaigns
Data: { campaigns: [...] }
Extensions: { hasura_execution_time: 0.012 }</code></pre></p>
<h2 data-ke-size="size26">추가 기능 아이디어</h2>
<h3 data-ke-size="size23">7. Query 재실행 버튼</h3>
<pre class="dts"><code>// DevTools에 추가
&lt;button
  onClick={() =&gt; {
    client.refetchQueries({
      include: [selected.operationName]
    })
  }}
  className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
&gt;
    Refetch
&lt;/button&gt;</code></pre>
<h3 data-ke-size="size23">8. Cache 무효화 버튼</h3>
<pre class="hsp"><code>&lt;button
  onClick={() =&gt; {
    client.cache.evict({ 
      id: 'ROOT_QUERY',
      fieldName: selected.operationName 
    })
  }}
  className="bg-orange-600 text-white px-3 py-1 rounded text-sm"
&gt;
    Evict Cache
&lt;/button&gt;</code></pre>
<h3 data-ke-size="size23">9. Subscription 모니터링</h3>
<pre class="javascript"><code>const subscriptionLink = new ApolloLink((operation, forward) =&gt; {
  if (operation.query.definitions[0]?.operation === 'subscription') {
    console.log('  Subscription started:', operation.operationName)
<pre><code>return forward(operation).map(response =&amp;gt; {
  console.log('  Subscription data:', operation.operationName, response.data)
  return response
})
</code></pre>
<p>}</p>
<p>return forward(operation)
})</code></pre></p>
<h2 data-ke-size="size26">정리</h2>
<p data-ke-size="size16"><b>Apollo의 공식 DevTools는 부족하지만:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>✅ Custom Link로 <b>더 나은 디버깅 환경</b> 구축 가능</li>
<li>✅ <b>TanStack Query DevTools 스타일</b>로 만들 수 있음</li>
<li>✅ <b>프로젝트에 맞는 커스텀</b> 기능 추가</li>
<li>✅ <b>콘솔 로깅</b>도 훨씬 예쁘게</li>
</ul>
<p data-ke-size="size16"><b>장점:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>원하는 대로 커스터마이징 가능</li>
<li>프로덕션 빌드에서 자동 제거</li>
<li>성능 모니터링 내장</li>
<li>브라우저 확장 프로그램 불필요</li>
</ul>