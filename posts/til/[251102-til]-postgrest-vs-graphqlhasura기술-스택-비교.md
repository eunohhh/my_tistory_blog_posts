<h2 data-ke-size="size26">PostgREST vs GraphQL(Hasura): 현실적인 기술 스택 비교</h2>
<p data-ke-size="size16">PostgreSQL을 사용하는 프로젝트에서 API 레이어를 구성할 때, 두 가지 옵션을 비교해봤습니다.<br />이 비교는 GraphQL이 정말 필요한 상황은 언제인가? 에 대해서 생각해보다가 시작하게 되었습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">GraphQL + Hasura + codegen 의 강력함은 프로젝트를 해보면서 알게 되었는데<br />다만 PostgREST 에서도 유연한 쿼리, 관계 기반 페칭이 잘 되므로(supabase.js 에서 보듯...)</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">요구사항만 맞는다면 Hasura 혹은 resolver 구성에 드는 비용을 줄이면서도<br />GraphQL의 이점을 유사하게 구사할 수 있을 것 같았습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그래서 GraphQL + Hasura 에 대항할 수 있는 REST 스펙을 아래와 같이 고민해 보았습니다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">스택 구성 비교</h2>
<h3 data-ke-size="size23">PostgREST 스택</h3>
<pre class="1c"><code>// 기본 구성
PostgreSQL &rarr; PostgREST &rarr; postgrest-js &rarr; openapi-typescript/zod</code></pre>
<h3 data-ke-size="size23">GraphQL + Hasura 스택</h3>
<pre class="1c"><code>// 기본 구성
PostgreSQL &rarr; Hasura &rarr; GraphQL &rarr; graphql-codegen</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">핵심 기능 비교</h2>
<h3 data-ke-size="size23">1. <b>쿼리 작성 방식</b></h3>
<h4 data-ke-size="size20">PostgREST</h4>
<pre class="lasso"><code>// REST 기반 체이닝
const { data } = await db
  .from('posts')
  .select(`
    *,
    author:users(name, email),
    comments(count)
  `)
  .eq('published', true)
  .order('created_at', { ascending: false })
  .limit(10)</code></pre>
<h4 data-ke-size="size20">Hasura (GraphQL)</h4>
<pre class="yaml"><code>query GetPosts {
  posts(
    where: { published: { _eq: true } }
    order_by: { created_at: desc }
    limit: 10
  ) {
    id
    title
    author {
      name
      email
    }
    comments_aggregate {
      aggregate {
        count
      }
    }
  }
}</code></pre>
<h3 data-ke-size="size23">2. <b>타입 안전성 구현</b></h3>
<h4 data-ke-size="size20">PostgREST + OpenAPI</h4>
<pre class="jboss-cli"><code># OpenAPI 스펙에서 타입 생성
npx openapi-typescript http://localhost:3000/ \
  --output ./types/database.ts</code></pre>
<pre class="markdown"><code>// 생성된 타입 활용
import { paths, components } from './types/database'
<p>type User = components['schemas']['users']
type Post = components['schemas']['posts']</p>
<p>// Zod 스키마로 런타임 검증 추가
import { z } from 'openapi-zod'
const UserSchema = z.schema(components['schemas']['users'])</code></pre></p>
<h4 data-ke-size="size20">Hasura + GraphQL Codegen</h4>
<pre class="markdown"><code># codegen.yml
generates:
  ./src/generated/graphql.tsx:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-query</code></pre>
<pre class="angelscript"><code>// 자동 생성된 훅 사용
import { useGetPostsQuery } from '@/generated/graphql'
<p>const { data, loading, error } = useGetPostsQuery({
variables: { limit: 10 }
})</code></pre></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">실제 사용 시나리오별 비교</h2>
<h3 data-ke-size="size23">시나리오 1: 단순 CRUD 작업</h3>
<h4 data-ke-size="size20">PostgREST &gt;&gt; 더 간단</h4>
<pre class="less"><code>// 한 줄로 처리
await db.from('users').insert({ name: 'John', email: 'john@example.com' })</code></pre>
<h4 data-ke-size="size20">Hasura</h4>
<pre class="reasonml"><code>// mutation 정의 필요
const INSERT_USER = gql`
  mutation InsertUser($name: String!, $email: String!) {
    insert_users_one(object: { name: $name, email: $email }) {
      id
    }
  }
`
await client.mutate({ mutation: INSERT_USER, variables: { ... } })</code></pre>
<h3 data-ke-size="size23">시나리오 2: 복잡한 관계 데이터 조회</h3>
<h4 data-ke-size="size20">PostgREST</h4>
<pre class="cs"><code>// 깊은 중첩은 복잡해짐
const { data } = await db
  .from('organizations')
  .select(`
    *,
    departments!inner(
      *,
      employees(
        *,
        manager:employees!manager_id(name),
        projects(*)
      )
    )
  `)</code></pre>
<h4 data-ke-size="size20">Hasura &gt;&gt; 더 직관적이고 편리!</h4>
<pre class="nginx"><code>query GetOrgStructure {
  organizations {
    name
    departments {
      name
      employees {
        name
        manager {
          name
        }
        projects {
          title
          status
        }
      }
    }
  }
}</code></pre>
<h3 data-ke-size="size23">시나리오 3: 실시간 구독</h3>
<h4 data-ke-size="size20">PostgREST &gt;&gt; 추가 구성 없이는 불가능</h4>
<pre class="coffeescript"><code>// 별도 Realtime 서버 필요
import { RealtimeClient } from '@supabase/realtime-js'
<p>const client = new RealtimeClient('ws://localhost:4000/socket')
const channel = client.channel('db-changes')
.on('postgres_changes',
{ event: 'INSERT', schema: 'public', table: 'messages' },
(payload) =&gt; console.log(payload.new)
)
.subscribe()</code></pre></p>
<h4 data-ke-size="size20">Hasura &gt;&gt; 내장 지원</h4>
<pre class="pgsql"><code>const MESSAGE_SUBSCRIPTION = gql`
  subscription OnMessageAdded {
    messages(order_by: { created_at: desc }, limit: 1) {
      id
      content
      user {
        name
      }
    }
  }
`
// 바로 사용 가능</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">⭐️ 각 스택이 빛나는 순간은?</h2>
<h3 data-ke-size="size23">PostgREST가 최적인 경우</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>단일 PostgreSQL DB 중심 서비스</b></li>
</ol>
<pre class="cs"><code>// 모든 데이터가 하나의 DB에 있을 때
const dashboard = await db
  .from('analytics')
  .select('*')
  .gte('date', '2024-01-01')</code></pre>
<ol style="list-style-type: decimal;" start="2" data-ke-list-type="decimal">
<li><b>빠른 프로토타이핑</b></li>
</ol>
<pre class="1c"><code>// 별도 스키마 정의 없이 바로 시작
// DB 테이블 = API 엔드포인트</code></pre>
<ol style="list-style-type: decimal;" start="3" data-ke-list-type="decimal">
<li><b>RESTful API 선호 환경</b></li>
</ol>
<pre class="stylus"><code>// 기존 REST 클라이언트와 호환
fetch('/api/users?age=gte.18&amp;select=name,email')</code></pre>
<ol style="list-style-type: decimal;" start="4" data-ke-list-type="decimal">
<li><b>서버리스/엣지 환경</b></li>
</ol>
<pre class="javascript"><code>// Vercel Edge Function
export const runtime = 'edge'
<p>export async function GET() {
// PostgREST는 HTTP 요청만으로 작동
const res = await fetch(process.env.POSTGREST_URL + '/users')
return Response.json(await res.json())
}</code></pre></p>
<h3 data-ke-size="size23">Hasura + GraphQL이 최적인 경우</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>다중 데이터소스 통합</b></li>
</ol>
<pre class="dts"><code># Hasura metadata
remote_schemas:
  - name: payment_service
    definition:
      url: https://payment-api.com/graphql
  - name: auth_service
    definition:
      url: https://auth-api.com/graphql</code></pre>
<ol style="list-style-type: decimal;" start="2" data-ke-list-type="decimal">
<li><b>복잡한 권한 관리</b></li>
</ol>
<pre class="json"><code>{
  "permission": {
    "role": "user",
    "select": {
      "filter": {
        "_or": [
          { "owner_id": { "_eq": "X-Hasura-User-Id" } },
          { "visibility": { "_eq": "public" } }
        ]
      },
      "columns": ["id", "title", "content"],
      "computed_fields": ["likes_count"]
    }
  }
}</code></pre>
<ol style="list-style-type: decimal;" start="3" data-ke-list-type="decimal">
<li><b>MSA 환경의 API Gateway</b></li>
</ol>
<pre class="haskell"><code># 여러 서비스를 하나의 GraphQL로 통합
type Query {
  # PostgreSQL (Hasura)
  users: [User!]!
<h1>Redis (Remote Schema)</h1>
<p>activeUsers: [ActiveUser!]!</p>
<h1>Elasticsearch (Action)</h1>
<p>searchPosts(query: String!): [Post!]!
}</code></pre></p>
<ol style="list-style-type: decimal;" start="4" data-ke-list-type="decimal">
<li><b>모바일 앱 최적화</b> &gt;&gt; 클라이언트마다, 상황마다 매번 이것저것 다른 필드 요청이 빈번할 때</li>
</ol>
<pre class="nginx"><code># 필요한 필드만 정확히 요청
query MobileOptimized {
  posts {
    id
    title
    thumbnailUrl  # 큰 이미지 제외
    # content 제외 - 필요시만 추가 요청
  }
}</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">성능 &amp; 운영 비교</h2>
<h3 data-ke-size="size23">인프라 복잡도</h3>
<h4 data-ke-size="size20">PostgREST</h4>
<pre class="dts"><code># docker-compose.yml
services:
  postgres:
    image: postgres:17
  postgrest:
    image: postgrest/postgrest
    depends_on:
      - postgres
# 끝! 매우 단순</code></pre>
<h4 data-ke-size="size20">Hasura</h4>
<pre class="dts"><code>services:
  postgres:
    image: postgres:17
  hasura:
    image: hasura/graphql-engine
    depends_on:
      - postgres
# 메타데이터 관리, 마이그레이션 등 추가 고려사항 있음</code></pre>
<h3 data-ke-size="size23">번들 사이즈</h3>
<pre class="clean"><code>// PostgREST 클라이언트
import { PostgrestClient } from '@supabase/postgrest-js' // ~15kb
<p>// GraphQL 클라이언트
import { ApolloClient, InMemoryCache } from '@apollo/client' // ~130kb
// 또는
import { createClient } from 'urql' // ~45kb</code></pre></p>
<h3 data-ke-size="size23">러닝 커브</h3>
<h4 data-ke-size="size20">PostgREST</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>REST API 지식만 필요</li>
<li>PostgreSQL 함수/뷰 활용하면 확장 가능</li>
<li>팀원 온보딩 빠름</li>
</ul>
<h4 data-ke-size="size20">Hasura</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>GraphQL 개념 이해 필요</li>
<li>Hasura 특유의 설정 학습 필요...</li>
<li>강력한 기능이지만 초기 러닝커브 존재</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">정리</h2>
<h3 data-ke-size="size23">PostgREST 선택 !!</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>  B2B SaaS, 관리자 대시보드</li>
<li>  서버 사이드 렌더링 중심 웹앱</li>
<li>  MVP, 빠른 프로토타입</li>
<li>  단일 PostgreSQL DB 서비스</li>
</ul>
<h3 data-ke-size="size23">Hasura 선택 !!</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>  모바일 앱 백엔드</li>
<li>  MSA 환경의 통합 레이어</li>
<li>  실시간 협업 기능 중심 서비스</li>
<li> ️ 여러 데이터소스 조합 필요</li>
</ul>