<h2 data-ke-size="size26">GraphQL Yoga 역할(+Hasura Remote Schema)</h2>
<h3 data-ke-size="size23">예시</h3>
<pre class="python" data-ke-language="python"><code>// /api/graphql/route.ts
import { DateTimeTypeDefinition } from "graphql-scalars";
import { createSchema, createYoga } from "graphql-yoga";
import { v4 as uuid } from "uuid";
<p>interface NextContext {
params: Promise&lt;Record&lt;string, string&gt;&gt;;
}</p>
<p>const typeDefs = /* GraphQL */ `
type Query {
session: Session!
}</p>
<pre><code>type Mutation {
    ok: String!
}

type Session {
    id: String!
    userId: String!
}
</code></pre>
<p>`;</p>
<p>const { handleRequest } = createYoga&lt;NextContext&gt;({
schema: createSchema({
typeDefs: [DateTimeTypeDefinition, typeDefs],
resolvers: {
Query: {
session: async (_, _args, ctx) =&gt; {
const userId = ctx.request.headers.get(&quot;x-hasura-user-id&quot;);</p>
<pre><code>                if (!userId) {
                    throw new Error(&quot;userId not exists!&quot;);
                }

                const cookie = ctx.request.headers.get(&quot;cookie&quot;);

                if (!cookie) {
                    throw new Error(&quot;cookie is not exists!&quot;);
                }

                return {
                    id: uuid(),
                    userId,
                };
            },
        },
        Mutation: {
            // Mutation TEST 용도. 임시코드
            ok() {
                return &quot;ok&quot;;
            },
        },
    },
}),
graphqlEndpoint: &quot;/api/graphql&quot;,
graphiql: process.env.NODE_ENV !== &quot;production&quot;,
	cors: {
	credentials: true,
},
fetchAPI: {
	Response: Response,
},
</code></pre>
<p>});</p>
<p>export {
handleRequest as GET,
handleRequest as POST,
handleRequest as OPTIONS,
};</code></pre></p>
<h3 data-ke-size="size23">1. GraphQL-Yoga</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>역할</b>: 앱 내부의 GraphQL 엔드포인트</li>
<li><b>동작</b>: 로컬에서 세션 정보를 리졸브(Hasura Remote Schema 에 등록 안했을 경우!)</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">2. Hasura Remote Schema 연동 시의 동작 방식</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Hasura 콘솔에서 설정</li>
<li><b>흐름</b>: 앱 &rarr; Hasura &rarr; (JWT 검증) &rarr; 앱 (GraphQL-Yoga: <code>/api/graphql</code>)</li>
<li>Hasura가 JWT를 먼저 검증하고 <code>x-hasura-user-id</code> 등의 세션 변수를 생성</li>
<li>검증된 세션 변수를 Remote Schema(yoga)로 전달</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">3. Apollo Client 등을 통해 쿼리하는 것과의 차이점</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Apollo Client 쿼리:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>역할: Hasura GraphQL로 요청을 보내는 클라이언트</li>
<li><b>동작</b>: 앱 -&gt; Hasura</li>
<li>그냥 Hasura 로 쿼리를 요청하는 것!</li>
</ul>
</li>
<li>GraphQL-Yoga 만 사용시:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>앱 내부 로컬 호출!</li>
</ul>
</li>
<li>GrapQL-Yoga + Hasura Remote Schema
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>앱 &rarr; Hasura &rarr; (JWT 검증) &rarr; GraphQL-Yoga (`/api/graphql`)</li>
</ul>
</li>
</ul>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li style="list-style-type: none;">&nbsp;</li>
</ol>