<h2 data-ke-size="size26">Server 용 Apollo Client 생성시 주의점!</h2>
<h3 data-ke-size="size23">TL; DR</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b><code>registerApolloClient</code>는 싱글톤처럼 동작하지만</b>, <code>getToken</code>을 함수로 전달하면 매 요청마다 토큰을 새로 읽어와서 안전할 수 있음. <a href="https://github.com/apollographql/apollo-client-integrations/tree/main/packages/nextjs">참고</a></li>
<li><b>하지만 캐시 오염 가능성</b>은 여전히 존재하므로, 민감한 데이터는 <code>fetchPolicy: 'no-cache'</code> 사용을 권장.</li>
<li><b><code>getToken</code> 없이 <code>credentials: 'include'</code>만으로는 절대 작동하지 않음!</b></li>
<li><b>가장 안전한 방법</b>은 요청별 클라이언트를 생성하는 것이지만, <code>getToken</code>을 올바르게 구현하면 <code>registerApolloClient</code>만으로 충분히 사용 가능.</li>
</ol>
<hr contenteditable="false" data-ke-type="horizontalRule" data-ke-style="style1" />
<h3 data-ke-size="size23">코드 예시</h3>
<pre class="javascript" data-ke-language="javascript"><code>// /lib/apollo/server.ts
import { Defer20220824Handler } from "@apollo/client/incremental";
import {
    ApolloClient,
    InMemoryCache,
    registerApolloClient,
} from "@apollo/client-integration-nextjs";
import { env } from "@/env";
import { createApolloLinks } from "./apollo-links";
import { getTokenFromCookie } from "../auth/server-utils";
<p>export const { getClient, query, PreloadQuery } = registerApolloClient(() =&gt; {
return new ApolloClient({
cache: new InMemoryCache(),
link: createApolloLinks({
// 여기가 DI
isServer: true,
hasuraGraphQLEndpoint: env.GRAPHQL_ENDPOINT,
getToken: getTokenFromCookie,
incrementalHandler: new Defer20220824Handler(),
}),
});
});</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<hr contenteditable="false" data-ke-type="horizontalRule" data-ke-style="style1" />
<h2 data-ke-size="size26">이거 싱글톤인데 문제 안됨? &gt;&gt; 될 수 있음! 주의필요!</h2>
<h3 data-ke-size="size23">1. <code>registerApolloClient</code>의 동작 방식</h3>
<p data-ke-size="size16"><code>registerApolloClient</code>는 <b>React의 <code>cache()</code> API</b>를 사용합니다:</p>
<pre class="javascript"><code>// apollo-client-integrations/packages/nextjs 내부
import { cache } from 'react';
<p>export function registerApolloClient(makeClient) {
const getClient = cache(() =&gt; {
return makeClient();
});</p>
<p>return { getClient, ... };
}</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>cache()</code>의 특성</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>렌더링 단위로 캐싱</b>됩니다</li>
<li>동일한 렌더링 사이클 내에서는 같은 인스턴스 반환</li>
<li>다른 요청에서는 새로운 인스턴스가 생성될 수도 있음</li>
</ul>
</li>
</ul>
<h3 data-ke-size="size23">2. 문제가 되는 케이스와 안 되는 케이스</h3>
<p data-ke-size="size16"><b>✅ 안전한 케이스 (getToken 사용)</b></p>
<pre class="javascript"><code>export const { getClient } = registerApolloClient(() =&gt; {
  return new ApolloClient({
    link: createApolloLinks({
      isServer: true,
      hasuraGraphQLEndpoint: env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
      getToken: getTokenFromCookie, // 함수를 전달!
    }),
  });
});
<p>// 사용
const { data } = await getClient().query({ query: userQuery });</code></pre></p>
<p data-ke-size="size16"><b>왜 안전한가?</b></p>
<pre class="javascript"><code>// createApolloLinks 내부 예시
const authLink = new SetContextLink(async (prevContext, operation) =&gt; {
  const token = await getToken(); // 매 요청마다 실행!
  return {
    headers: {
      ...prevContext.headers,
      ...(token &amp;&amp; { authorization: `Bearer ${token}` }),
    }
  };
});</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>getToken</code>은 <b>함수 참조</b>로 전달됨</li>
<li>Apollo의 <code>SetContextLink</code>가 <b>매 GraphQL 요청마다</b> <code>getToken()</code>을 호출</li>
<li><code>getTokenFromCookie()</code>는 그 순간의 쿠키를 읽어옴</li>
<li>즉, 클라이언트 인스턴스는 공유되지만, <b>토큰은 매번 새로 읽어옴</b></li>
</ul>
<h3 data-ke-size="size23">⚠️ 위험한 케이스</h3>
<pre class="javascript"><code>export const { getClient } = registerApolloClient(() =&gt; {
  return new ApolloClient({
    link: createApolloLinks({
      isServer: true,
      hasuraGraphQLEndpoint: env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
      // getToken 없음!
    }),
  });
});</code></pre>
<p data-ke-size="size16"><b>문제점:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Authorization 헤더가 아예 전달되지 않음</li>
<li>Hasura가 익명 권한으로 처리</li>
<li>사용자별 데이터 조회 불가</li>
</ul>
<h3 data-ke-size="size23">3. 하지만 여전히 주의해야 할 점들</h3>
<h4 data-ke-size="size20">3.1 캐시 오염 가능성</h4>
<pre class="javascript"><code>const { getClient } = registerApolloClient(() =&gt; {
  return new ApolloClient({
    cache: new InMemoryCache(), // 이 캐시가 공유될 수 있음!
    link: createApolloLinks({
      getToken: getTokenFromCookie,
    }),
  });
});</code></pre>
<p data-ke-size="size16"><b>시나리오:</b></p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>사용자 A가 요청 &rarr; 클라이언트 생성 &rarr; 데이터 조회 &rarr; 캐시에 저장</li>
<li>같은 렌더링 사이클/컨텍스트에서 사용자 B가 요청</li>
<li><code>cache()</code>가 같은 클라이언트 인스턴스 반환</li>
<li>사용자 B의 토큰으로 요청하지만, <b>캐시에 사용자 A의 데이터가 남아있을 수 있음</b></li>
</ol>
<h4 data-ke-size="size20">3.2 <code>getTokenFromCookie</code>의 구현에 따라 다름</h4>
<pre class="actionscript"><code>// ❌ 위험한 구현
function getTokenFromCookie() {
  // 전역 변수나 모듈 레벨 상태에서 읽어오면 위험!
  return globalToken; 
}
<p>// ✅ 안전한 구현
function getTokenFromCookie() {
// Next.js의 cookies()는 현재 요청 컨텍스트를 자동으로 추적
const cookieStore = cookies();
return cookieStore.get('access_token')?.value;
}</code></pre></p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">4. Next.js App Router의 Request Context</h3>
<p data-ke-size="size16">Next.js 13+ App Router에서는 <b>Request Context</b>가 중요!!</p>
<pre class="javascript"><code>import { cookies } from 'next/headers';
<p>// 서버 컴포넌트나 Route Handler에서
async function POST() {
const cookieStore = cookies(); // 현재 요청의 쿠키
const token = cookieStore.get('access_token');</p>
<p>// 이 시점에서 getClient() 호출
const client = getClient();
const { data } = await client.query({ query: userQuery });
}</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>cookies()</code>는 <b>현재 실행 중인 요청의 컨텍스트</b>를 자동으로 추적</li>
<li><code>getTokenFromCookie()</code> 내부에서 <code>cookies()</code>를 호출하면, 그 순간의 요청 쿠키를 읽어옴</li>
<li>이게 올바르게 동작하려면 <b>반드시 async 컨텍스트 내에서 호출</b>되어야 함</li>
</ul>
<hr contenteditable="false" data-ke-type="horizontalRule" data-ke-style="style1" />
<h3 data-ke-size="size23">5. 공식 문서 예제의 의도</h3>
<p data-ke-size="size16">Apollo의 Next.js 통합 패키지는:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>SSR/RSC에서 Apollo Client 사용을 간편하게</b> 만들기 위함</li>
<li><b>렌더링 단위 캐싱</b>으로 불필요한 클라이언트 재생성 방지</li>
<li><b>하지만 보안은 개발자가 직접 관리</b>해야 함</li>
</ol>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">6. 결론 및 권장사항</h3>
<h4 data-ke-size="size20">"credentials: include이기 때문에 알아서 들어간다"?</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>❌ <b>땡!!</b></li>
<li>Apollo Client의 HTTP Link는 쿠키를 자동으로 헤더에 변환하지 않음</li>
<li><code>credentials: 'include'</code>는 브라우저가 쿠키를 <b>전송</b>하는 것이지, Authorization 헤더로 <b>변환</b>하는 게 아님</li>
</ul>
<h4 data-ke-size="size20">올바른 구현 예제</h4>
<pre class="javascript"><code>// ✅ 1. getToken 함수 구현 확인
function getTokenFromCookie() {
  const cookieStore = cookies(); // Next.js의 cookies() 사용
  const token = cookieStore.get('access_token')?.value;
  return token;
}
<p>// ✅ 2. createApolloLinks에 getToken 전달
export const { getClient } = registerApolloClient(() =&gt; {
return new ApolloClient({
cache: new InMemoryCache(),
link: createApolloLinks({
isServer: true,
hasuraGraphQLEndpoint: env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
getToken: getTokenFromCookie, // 반드시 필요!
}),
});
});</p>
<p>// ✅ 3. 캐시 정책 고려
// 민감한 사용자 데이터는 fetchPolicy: 'no-cache' 사용
const { data } = await getClient().query({
query: userQuery,
fetchPolicy: 'no-cache', // 또는 'network-only'
});</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<hr contenteditable="false" data-ke-type="horizontalRule" data-ke-style="style1" />
<h3 data-ke-size="size23">7. 부록</h3>
<h4 data-ke-size="size20">query의 fetchPolicy 와 HttpLink의 fetchOptions 차이</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>fetchOptions는 HTTP 레벨이고, fetchPolicy는 Apollo 레벨</li>
<li>두 개는 다른 레이어이므로 <b>둘 다 설정</b>해야 좋음</li>
<li><b>Apollo의 <code>fetchPolicy</code> 옵션들</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>cache-first</code> (기본값)
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Apollo 캐시에 있으면 네트워크 요청 안 함</li>
<li>가장 빠르지만, 오래된 데이터 위험</li>
</ul>
</li>
<li><code>network-only</code>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>항상 네트워크 요청</li>
<li>응답은 캐시에 저장</li>
<li>다음 요청을 위해 캐시 업데이트</li>
</ul>
</li>
<li><code>no-cache</code> ✅ (민감한 데이터용)
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>항상 네트워크 요청</li>
<li><b>응답을 캐시에 저장하지 않음</b></li>
<li>사용자별 데이터에 적합</li>
</ul>
</li>
<li><code>cache-and-network</code>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>캐시에서 먼저 읽고, 동시에 네트워크 요청</li>
<li>빠른 응답 + 최신 데이터 보장</li>
</ul>
</li>
</ul>
</li>
<li><b><code>fetchOptions</code> 는 <a href="https://developer.mozilla.org/ko/docs/Web/API/Window/fetch#cache">MDN 참고</a></b></li>
</ul>
<p data-ke-size="size16">예시</p>
<pre class="actionscript"><code>const httpLink = new HttpLink({ 
 fetchOptions: {
  cache: "no-store", // &larr; HTTP 레벨 캐시 설정하면 됨
 }, 
});</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<pre class="haskell"><code>const { data } = await getClient().query({
    query: userQuery, 
    fetchPolicy: 'no-cache', // &larr; Apollo 레벨 캐시
});</code></pre>
<p data-ke-size="size16">&nbsp;</p>