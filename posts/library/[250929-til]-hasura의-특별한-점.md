<h2 data-ke-size="size26">Hasura의 특별한 점</h2>
<p data-ke-size="size16"><b>일반 GraphQL 서버 (Apollo Server 등):</b></p>
<pre class="erlang-repl"><code>GraphQL &rarr; 직접 작성한 리졸버 &rarr; SQL 쿼리
         (여기서 DataLoader 필요!)</code></pre>
<p data-ke-size="size16"><b>Hasura:</b></p>
<pre class="erlang-repl"><code>GraphQL &rarr; Hasura 엔진 &rarr; 최적화된 SQL 자동 생성
         (DataLoader 불필요! 이미 내장됨)</code></pre>
<h2 data-ke-size="size26">Hasura가 자동으로 해주는 것들</h2>
<h3 data-ke-size="size23">1. <b>자동 JOIN 최적화</b></h3>
<pre class="applescript"><code>query GetCampaign {
  campaign(where: { id: { _eq: "abc-123" } }) {
    id
    title
    applications {
      id
      status
      influencer {
        id
        username
        platforms {
          name
          follower_count
        }
      }
    }
  }
}</code></pre>
<p data-ke-size="size16"><b>Hasura가 자동 생성하는 SQL:</b></p>
<pre class="sql"><code>-- 한 번의 쿼리로!
SELECT 
  campaign.id,
  campaign.title,
  applications.id AS applications_id,
  applications.status,
  influencer.id AS influencer_id,
  influencer.username,
  platforms.name AS platform_name,
  platforms.follower_count
FROM campaign
LEFT JOIN LATERAL (
  SELECT * FROM campaign_application
  WHERE campaign_id = campaign.id
) applications ON true
LEFT JOIN LATERAL (
  SELECT * FROM influencer_profile
  WHERE id = applications.influencer_id
) influencer ON true
LEFT JOIN LATERAL (
  SELECT * FROM influencer_platform
  WHERE influencer_id = influencer.id
) platforms ON true
WHERE campaign.id = 'abc-123';</code></pre>
<p data-ke-size="size16"><b>즉, N+1 문제가 애초에 발생하지 않아요!</b> ✨</p>
<h3 data-ke-size="size23">2. <b>배치 쿼리 자동 처리</b></h3>
<pre class="less"><code>query GetMultipleCampaigns {
  campaign1: campaign_by_pk(id: "abc-1") { ...fields }
  campaign2: campaign_by_pk(id: "abc-2") { ...fields }
  campaign3: campaign_by_pk(id: "abc-3") { ...fields }
}</code></pre>
<p data-ke-size="size16"><b>Hasura가 생성하는 SQL:</b></p>
<pre class="sql"><code>-- 한 번에 배치 처리
SELECT * FROM campaign 
WHERE id IN ('abc-1', 'abc-2', 'abc-3');</code></pre>
<p data-ke-size="size16">DataLoader가 하는 일을 <b>Hasura 엔진이 알아서</b> 해줘요!</p>
<h2 data-ke-size="size26">Hasura + Next.js 15 App Router 구조</h2>
<h3 data-ke-size="size23">아키텍처</h3>
<pre class="typescript" data-ke-language="typescript"><code>┌─────────────────────────────────────┐
│  Next.js 15 App Router (Frontend)   
│  ├─ Server Components               
│  ├─ Client Components               
│  └─ Apollo Client                   
└──────────────┬──────────────────────┘
               │ GraphQL over HTTP
               &darr;
┌─────────────────────────────────────┐
│  Hasura v2 (GraphQL Engine)         
│  ├─ Auto-generated Schema           
│  ├─ Query Optimizer                 
│  ├─ Permission System               
│  └─ Subscription Engine             
└──────────────┬──────────────────────┘
               │ SQL
               &darr;
┌─────────────────────────────────────┐
│  PostgreSQL Database                
│  └─ 설계한 스키마 + 인덱스  │
└─────────────────────────────────────┘</code></pre>
<h3 data-ke-size="size23">Setup 예시</h3>
<h4 data-ke-size="size20">1. <b>Hasura 설정</b></h4>
<pre class="vim"><code># docker-compose.yml
version: '3.6'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
<p>hasura:
image: hasura/graphql-engine:v2.36.0
ports:
- &quot;8080:8080&quot;
environment:
HASURA_GRAPHQL_DATABASE_URL: postgres://postgres:password@postgres:5432/aibee
HASURA_GRAPHQL_ENABLE_CONSOLE: &quot;true&quot;
HASURA_GRAPHQL_ADMIN_SECRET: &quot;admin-secret&quot;</code></pre></p>
<h4 data-ke-size="size20">2. <b>Hasura에서 관계 설정</b></h4>
<p data-ke-size="size16">Hasura Console에서 클릭 몇 번이면 끝:</p>
<pre class="delphi"><code>campaign
  ├─ applications (array relationship)
      └─ influencer (object relationship)
          └─ platforms (array relationship)</code></pre>
<p data-ke-size="size16">이렇게 설정하면 자동으로 nested query 가능!</p>
<h4 data-ke-size="size20">3. <b>Next.js 15 App Router에서 사용</b></h4>
<h5>Server Component (SSR)</h5>
<pre class="javascript"><code>// app/campaigns/[id]/page.tsx
import { getClient } from '@/lib/apollo-client-rsc'
import { gql } from '@apollo/client'
<p>const GET_CAMPAIGN = gql<code>  query GetCampaign($id: uuid!) {     campaign_by_pk(id: $id) {       id       title       status       applications(where: { status: { _eq: &quot;approved&quot; } }) {         id         influencer {           username           platforms {             platform {               name             }             follower_count           }         }       }     }   }</code></p>
<p>export default async function CampaignPage({
params
}: {
params: { id: string }
}) {
const client = getClient()</p>
<p>const { data } = await client.query({
query: GET_CAMPAIGN,
variables: { id: params.id },
})</p>
<p>return (
&lt;div&gt;
&lt;h1&gt;{data.campaign_by_pk.title}&lt;/h1&gt;
{/* ... */}
&lt;/div&gt;
)
}</code></pre></p>
<pre class="javascript"><code>// lib/apollo-client-rsc.ts (Server Component용)
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc'

export const { getClient } = registerApolloClient(() =&gt; {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_HASURA_URL,
      headers: {
        'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET!,
      },
    }),
  })
})</code></pre>
<h5>Client Component (CSR)</h5>
<pre class="javascript"><code>// app/campaigns/[id]/applications.tsx
'use client'
<p>import { gql, useQuery } from '@apollo/client'</p>
<p>const GET_APPLICATIONS = gql<code>  query GetApplications($campaignId: uuid!) {     campaign_application(       where: { campaign_id: { _eq: $campaignId } }       order_by: { created_at: desc }     ) {       id       status       influencer {         username         platforms_aggregate {           aggregate {             sum {               follower_count             }           }         }       }     }   }</code></p>
<p>export default function Applications({ campaignId }: { campaignId: string }) {
const { data, loading } = useQuery(GET_APPLICATIONS, {
variables: { campaignId },
})</p>
<p>if (loading) return &lt;div&gt;Loading...&lt;/div&gt;</p>
<p>return (
&lt;ul&gt;
{data.campaign_application.map(app =&gt; (
&lt;li key={app.id}&gt;{app.influencer.username}&lt;/li&gt;
))}
&lt;/ul&gt;
)
}</code></pre></p>
<pre class="javascript"><code>// lib/apollo-client.tsx (Client Component용)
'use client'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { ApolloNextAppProvider } from '@apollo/experimental-nextjs-app-support/ssr'

function makeClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_HASURA_URL,
      headers: {
        'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET!,
      },
    }),
  })
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return (
    &lt;ApolloNextAppProvider makeClient={makeClient}&gt;
      {children}
    &lt;/ApolloNextAppProvider&gt;
  )
}</code></pre>
<pre class="javascript"><code>// app/layout.tsx
import { ApolloWrapper } from '@/lib/apollo-client'

export default function RootLayout({ children }) {
  return (
    &lt;html&gt;
      &lt;body&gt;
        &lt;ApolloWrapper&gt;
          {children}
        &lt;/ApolloWrapper&gt;
      &lt;/body&gt;
    &lt;/html&gt;
  )
}</code></pre>
<h2 data-ke-size="size26">Hasura의 강력한 기능들</h2>
<h3 data-ke-size="size23">1. <b>집계 쿼리 자동 생성</b></h3>
<pre class="dts"><code>query CampaignStats {
  campaign_by_pk(id: "abc-123") {
    title
    applications_aggregate {
      aggregate {
        count
        avg {
          rating
        }
      }
      nodes {
        influencer {
          username
        }
      }
    }
  }
}</code></pre>
<p data-ke-size="size16"><b>생성되는 SQL:</b></p>
<pre class="sql"><code>-- 효율적으로 집계
SELECT 
  campaign.title,
  COUNT(applications.id),
  AVG(applications.rating)
FROM campaign
LEFT JOIN campaign_application applications 
  ON applications.campaign_id = campaign.id
WHERE campaign.id = 'abc-123'
GROUP BY campaign.id;</code></pre>
<h3 data-ke-size="size23">2. <b>필터링과 정렬</b></h3>
<pre class="dts"><code>query TopInfluencers {
  influencer_profile(
    where: {
      platforms: {
        follower_count: { _gte: 10000 }
      }
    }
    order_by: { created_at: desc }
    limit: 10
  ) {
    username
    platforms_aggregate {
      aggregate {
        sum {
          follower_count
        }
      }
    }
  }
}</code></pre>
<p data-ke-size="size16">Hasura가 알아서 최적의 인덱스를 활용해요!</p>
<h3 data-ke-size="size23">3. <b>실시간 Subscription</b></h3>
<pre class="bash"><code>subscription WatchCampaignApplications($campaignId: uuid!) {
  campaign_application(
    where: { campaign_id: { _eq: $campaignId } }
  ) {
    id
    status
    influencer {
      username
    }
  }
}</code></pre>
<pre class="javascript"><code>'use client'
<p>import { gql, useSubscription } from '@apollo/client'</p>
<p>const WATCH_APPLICATIONS = gql<code>  subscription WatchApplications($campaignId: uuid!) {     campaign_application(       where: { campaign_id: { _eq: $campaignId } }     ) {       id       status     }   }</code></p>
<p>export default function LiveApplications({ campaignId }) {
const { data } = useSubscription(WATCH_APPLICATIONS, {
variables: { campaignId },
})</p>
<p>// 실시간 업데이트!
return &lt;div&gt;{data?.campaign_application.length} applications&lt;/div&gt;
}</code></pre></p>
<h2 data-ke-size="size26">DataLoader가 필요 없는 이유 정리</h2>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>상황</th>
<th>일반 GraphQL</th>
<th>Hasura</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>N+1 문제</b></td>
<td>DataLoader 필수</td>
<td>자동 해결 (LATERAL JOIN)</td>
</tr>
<tr>
<td><b>배치 쿼리</b></td>
<td>DataLoader로 구현</td>
<td>자동 배치 처리</td>
</tr>
<tr>
<td><b>복잡한 JOIN</b></td>
<td>수동 최적화</td>
<td>자동 최적화</td>
</tr>
<tr>
<td><b>인덱스 활용</b></td>
<td>쿼리 튜닝 필요</td>
<td>자동 활용</td>
</tr>
</tbody>
</table>
<h2 data-ke-size="size26">그럼 사용자가 신경 써야 할 것은?</h2>
<h3 data-ke-size="size23">✅ DB 인덱스 설계 (여전히 중요!)</h3>
<pre class="sql"><code>-- Hasura가 아무리 똑똑해도 인덱스가 없으면 느려요
CREATE INDEX idx_campaign_application_campaign_status 
ON campaign_application(campaign_id, status);
<p>CREATE INDEX idx_influencer_platform_influencer
ON influencer_platform(influencer_id);</code></pre></p>
<h3 data-ke-size="size23">✅ Hasura Permission 설정</h3>
<pre class="routeros"><code># campaign 테이블 권한 예시
- role: user
  permission:
    columns: ['id', 'title', 'status']
    filter:
      business_profile:
        user_id:
          _eq: X-Hasura-User-Id  # JWT에서 가져옴</code></pre>
<h3 data-ke-size="size23">✅ 쿼리 복잡도 제한</h3>
<pre class="yaml"><code># Hasura 설정
HASURA_GRAPHQL_QUERY_DEPTH_LIMIT: 5  # nested 5단계까지만</code></pre>
<h3 data-ke-size="size23">✅ Apollo Client 캐시 전략</h3>
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
<h2 data-ke-size="size26">실무 팁</h2>
<h3 data-ke-size="size23">1. <b>Hasura CLI로 마이그레이션 관리</b></h3>
<pre class="routeros"><code># Hasura CLI 설치
npm install --save-dev hasura-cli
<h1>마이그레이션 생성</h1>
<p>hasura migrate create init --from-server --database-name default</p>
<h1>메타데이터 export</h1>
<p>hasura metadata export</code></pre></p>
<h3 data-ke-size="size23">2. <b>CodeGen으로 타입 안정성</b></h3>
<pre class="crystal"><code>npm install -D @graphql-codegen/cli
<h1>codegen.yml</h1>
<p>schema: http://localhost:8080/v1/graphql
documents: './app/**/*.tsx'
generates:
./lib/graphql/generated.ts:
plugins:
- typescript
- typescript-operations
- typescript-react-apollo</code></pre></p>
<pre class="haskell"><code>// 자동 생성된 타입 사용
import { useGetCampaignQuery } from '@/lib/graphql/generated'

const { data } = useGetCampaignQuery({
  variables: { id: campaignId }
})
// data가 완전히 타입 안전!</code></pre>
<h3 data-ke-size="size23">3. <b>Performance Monitoring</b></h3>
<pre class="javascript"><code>// Apollo Client에 로깅 추가
import { ApolloLink } from '@apollo/client'
<p>const loggerLink = new ApolloLink((operation, forward) =&gt; {
console.log(<code>GraphQL Request: ${operation.operationName}</code>)
const start = Date.now()</p>
<p>return forward(operation).map(response =&gt; {
console.log(<code>Took ${Date.now() - start}ms</code>)
return response
})
})</code></pre></p>
<h2 data-ke-size="size26">결론</h2>
<p data-ke-size="size16"><b>Hasura를 사용하면:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>✅ DataLoader 불필요 (자동 최적화)</li>
<li>✅ 리졸버 작성 불필요 (자동 생성)</li>
<li>✅ N+1 문제 자동 해결</li>
<li>✅ <b>하지만 DB 인덱스는 여전히 필수</b></li>
</ul>