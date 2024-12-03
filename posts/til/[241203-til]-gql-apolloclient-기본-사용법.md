<h3 data-ke-size="size23">1. Apollo Client 설정 (App Router 버전)</h3>
<h4 data-ke-size="size20">Apollo Client 설정 (<code>lib/apolloClient.ts</code>)</h4>
<p data-ke-size="size16">클라이언트 환경에서 Apollo Client를 생성하는 설정입니다.</p>
<pre class="javascript"><code>// lib/apolloClient.ts
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";
<p>const apolloClient = new ApolloClient({
link: createUploadLink({
uri: process.env.NEXT_PUBLIC_API_BASE_URL,
credentials: &quot;include&quot;, // 쿠키 포함
}),
cache: new InMemoryCache(),
});</p>
<p>export default apolloClient;</code></pre></p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">2. ApolloProvider 설정</h3>
<h4 data-ke-size="size20">클라이언트 컴포넌트에서 ApolloProvider 사용</h4>
<p data-ke-size="size16">App Router의 구조에서는 <code>ApolloProvider</code>를 클라이언트 컴포넌트에서 사용해야 합니다.</p>
<p data-ke-size="size16"><code>ApolloProvider</code>를 설정하려면 <code>components/ApolloWrapper.tsx</code>처럼 Wrapper 컴포넌트를 만들어 사용하는 것이 좋습니다.</p>
<pre class="javascript"><code>// components/ApolloWrapper.tsx
"use client";
<p>import { ApolloProvider } from &quot;@apollo/client&quot;;
import apolloClient from &quot;../lib/apolloClient&quot;;</p>
<p>export default function ApolloWrapper({ children }: { children: React.ReactNode }) {
return &lt;ApolloProvider client={apolloClient}&gt;{children}&lt;/ApolloProvider&gt;;
}</code></pre></p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">3. App Layout에 ApolloWrapper 적용</h3>
<p data-ke-size="size16"><code>app/layout.tsx</code>에서 <code>ApolloWrapper</code>를 감싸도록 설정합니다.</p>
<pre class="javascript"><code>// app/layout.tsx
import ApolloWrapper from "../components/ApolloWrapper";
import "./globals.css";
<p>export default function RootLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
&lt;html lang=&quot;en&quot;&gt;
&lt;body&gt;
&lt;ApolloWrapper&gt;{children}&lt;/ApolloWrapper&gt;
&lt;/body&gt;
&lt;/html&gt;
);
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">4. 서버 컴포넌트에서 데이터 패칭</h3>
<p data-ke-size="size16">App Router에서 서버 컴포넌트를 사용하는 경우 Apollo Client는 클라이언트에서 동작하므로, 서버에서 GraphQL 데이터를 가져오려면 <code>graphql-request</code>나 <code>@apollo/client</code>의 <code>fetch</code> 기반 도구를 사용할 수 있습니다.</p>
<h4 data-ke-size="size20">서버 컴포넌트 예시</h4>
<pre class="javascript"><code>// app/page.tsx
import { gql } from "graphql-request";
import { request } from "graphql-request";
<p>export const metadata = {
title: &quot;Apollo with App Router&quot;,
};</p>
<p>export default async function Page() {
const query = gql<code>    query ExampleQuery {       exampleField     }  </code>;</p>
<p>const data = await request(process.env.NEXT_PUBLIC_API_BASE_URL!, query);</p>
<p>return (
&lt;div&gt;
&lt;h1&gt;Data from GraphQL:&lt;/h1&gt;
&lt;pre&gt;{JSON.stringify(data, null, 2)}&lt;/pre&gt;
&lt;/div&gt;
);
}</code></pre></p>
<p data-ke-size="size16">Next.js의 <b>App Router</b> 환경에서 <code>"use client"</code>를 사용하는 컴포넌트에서 Apollo Client를 통해 GraphQL 쿼리를 실행하려면, Apollo Client의 <code>useQuery</code>나 <code>useMutation</code> 훅을 사용하면 됩니다. 이 경우 클라이언트 컴포넌트에서만 실행됩니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">5. 클라이언트 컴포넌트에서 데이터 패칭</h3>
<h4 data-ke-size="size20">클라이언트 컴포넌트에서 쿼리 실행</h4>
<pre class="javascript"><code>"use client";
<p>import { gql, useQuery } from &quot;@apollo/client&quot;;</p>
<p>const GET_DATA = gql<code>  query GetData {     exampleField   }</code>;</p>
<p>export default function ExampleClientComponent() {
const { data, loading, error } = useQuery(GET_DATA);</p>
<p>if (loading) return &lt;p&gt;Loading...&lt;/p&gt;;
if (error) return &lt;p&gt;Error: {error.message}&lt;/p&gt;;</p>
<p>return (
&lt;div&gt;
&lt;h1&gt;Data from GraphQL:&lt;/h1&gt;
&lt;pre&gt;{JSON.stringify(data, null, 2)}&lt;/pre&gt;
&lt;/div&gt;
);
}</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>useQuery</code> 동작</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Apollo Client는 자동으로 데이터를 캐시하고 업데이트합니다.</li>
<li><code>loading</code>, <code>error</code>, <code>data</code> 상태를 관리합니다.</li>
</ul>
</li>
</ul>
<hr data-ke-style="style1" />
<h4 data-ke-size="size20">클라이언트 컴포넌트에서 데이터 뮤테이션 실행</h4>
<pre class="javascript"><code>"use client";
<p>import { gql, useMutation } from &quot;@apollo/client&quot;;</p>
<p>const ADD_ITEM = gql<code>  mutation AddItem($input: AddItemInput!) {     addItem(input: $input) {       id       name     }   }</code>;</p>
<p>export default function MutationClientComponent() {
const [addItem, { data, loading, error }] = useMutation(ADD_ITEM);</p>
<p>const handleAddItem = async () =&gt; {
try {
await addItem({
variables: {
input: { name: &quot;New Item&quot; }, // 입력 값
},
});
} catch (e) {
console.error(&quot;Error adding item:&quot;, e);
}
};</p>
<p>return (
&lt;div&gt;
&lt;button onClick={handleAddItem} disabled={loading}&gt;
Add Item
&lt;/button&gt;
{loading &amp;&amp; &lt;p&gt;Loading...&lt;/p&gt;}
{error &amp;&amp; &lt;p&gt;Error: {error.message}&lt;/p&gt;}
{data &amp;&amp; &lt;p&gt;Item added: {JSON.stringify(data.addItem)}&lt;/p&gt;}
&lt;/div&gt;
);
}</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>useMutation</code> 동작</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>실행 함수 (<code>addItem</code>)를 반환합니다.</li>
<li>실행 결과를 <code>data</code>, <code>loading</code>, <code>error</code>로 관리합니다.</li>
</ul>
</li>
</ul>
<hr data-ke-style="style1" />
<h4 data-ke-size="size20">클라이언트 컴포넌트에서의 추가 고려사항</h4>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>ApolloProvider</b> 적용 확인: 클라이언트 컴포넌트에서 Apollo Client를 사용하려면 반드시 <code>ApolloProvider</code>가 적용된 상태여야 합니다. (<code>app/layout.tsx</code>에 설정)</li>
<li><b>Dynamic Import</b>: 클라이언트 컴포넌트를 서버 컴포넌트에서 호출하려면 <code>dynamic</code>을 사용할 수 있습니다.</li>
</ol>
<pre class="javascript"><code>import dynamic from "next/dynamic";
<p>const DynamicClientComponent = dynamic(() =&gt; import(&quot;../components/ExampleClientComponent&quot;), { ssr: false });</p>
<p>export default function Page() {
return (
&lt;div&gt;
&lt;h1&gt;Server Component&lt;/h1&gt;
&lt;DynamicClientComponent /&gt;
&lt;/div&gt;
);
}</code></pre></p>
<ol style="list-style-type: decimal;" start="3" data-ke-list-type="decimal">
<li><b>DevTools 사용</b>: Apollo Client DevTools를 활성화하면 브라우저에서 쿼리 상태와 데이터를 디버깅할 수 있습니다.</li>
</ol>
<hr data-ke-style="style1" />
<h4 data-ke-size="size20">상태 관리 및 캐싱 전략</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Apollo Cache</b>: <code>useQuery</code>로 가져온 데이터는 Apollo의 캐시 시스템에 저장됩니다. 이를 통해 동일한 데이터를 반복적으로 요청하지 않고, 효율적으로 관리할 수 있습니다.</li>
<li><b>캐시 업데이트</b>: <code>useMutation</code>의 <code>update</code> 옵션을 사용하면 캐시를 수동으로 업데이트할 수 있습니다.</li>
</ul>
<pre class="armasm"><code>const [addItem] = useMutation(ADD_ITEM, {
  update(cache, { data: { addItem } }) {
    cache.modify({
      fields: {
        items(existingItems = []) {
          return [...existingItems, addItem];
        },
      },
    });
  },
});</code></pre>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">5. DevTools 활성화</h3>
<p data-ke-size="size16">Apollo Client DevTools는 클라이언트 환경에서만 동작하므로 App Router와 함께 사용하려면 아래 단계를 참고하세요.</p>
<h4 data-ke-size="size20">DevTools 활성화 조건</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>ApolloClient</code>가 브라우저 환경에서 동작하도록 설정.</li>
<li>DevTools 확장 프로그램 설치 필요.</li>
</ul>
<pre class="javascript"><code>// lib/apolloClient.ts (개발 환경에서 DevTools 활성화)
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";
<p>const apolloClient = new ApolloClient({
link: createUploadLink({
uri: process.env.NEXT_PUBLIC_API_BASE_URL,
credentials: &quot;include&quot;,
}),
cache: new InMemoryCache(),
});</p>
<p>if (typeof window !== &quot;undefined&quot; &amp;&amp; process.env.NODE_ENV === &quot;development&quot;) {
import(&quot;@apollo/client/devtools&quot;).then((devtools) =&gt; devtools);
}</p>
<p>export default apolloClient;</code></pre></p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">요약</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>클라이언트 컴포넌트</b>에서 <code>ApolloProvider</code>를 사용하여 Apollo Client를 적용.</li>
<li><b>서버 컴포넌트</b>에서 데이터 패칭은 <code>graphql-request</code> 또는 서버 fetch를 활용.</li>
<li>클라이언트 컴포넌트에서 데이터 페칭은 <code>useQuery, useMutation</code> 을 사용.</li>
<li>Apollo DevTools는 개발 환경에서 활성화.</li>
</ul>