<h2 data-ke-size="size26">캐시 키 비교</h2>
<h3 data-ke-size="size23">TanStack Query</h3>
<pre class="scilab"><code>// 명시적으로 캐시 키 지정
useQuery({
  queryKey: ['campaigns', { status: 'open', page: 1 }],
  queryFn: () =&gt; fetchCampaigns({ status: 'open', page: 1 })
})
<p>// 캐시 구조
{
'[&quot;campaigns&quot;,{&quot;status&quot;:&quot;open&quot;,&quot;page&quot;:1}]': { data: [...], ... },
'[&quot;campaigns&quot;,{&quot;status&quot;:&quot;open&quot;,&quot;page&quot;:2}]': { data: [...], ... },
}</code></pre></p>
<h3 data-ke-size="size23">Apollo Client</h3>
<pre class="rust"><code>// 캐시 키 자동 생성!
useQuery(GET_CAMPAIGNS, {
  variables: { status: 'open', page: 1 }
})
<p>// 캐시 구조 (자동 생성)
{
'Query': {
'campaigns({&quot;status&quot;:&quot;open&quot;,&quot;page&quot;:1})': [...],
'campaigns({&quot;status&quot;:&quot;open&quot;,&quot;page&quot;:2})': [...],
}
}</code></pre></p>
<p data-ke-size="size16"><b> Apollo Client는 GraphQL 쿼리를 분석해서 자동으로 캐시 키를 만듭니다.</b></p>
<h2 data-ke-size="size26">자동 캐시 키 생성 원리</h2>
<h3 data-ke-size="size23">1. <b>기본 규칙: 필드 이름 + 모든 인자</b></h3>
<pre class="stata"><code>// GraphQL 쿼리
query GetCampaigns($status: String, $page: Int) {
  campaigns(status: $status, page: $page) {
    id
    title
  }
}
<p>// 자동 생성되는 캐시 키
'campaigns({&quot;status&quot;:&quot;open&quot;,&quot;page&quot;:1})'
'campaigns({&quot;status&quot;:&quot;open&quot;,&quot;page&quot;:2})'
// → TanStack Query의 queryKey와 동일한 개념!</code></pre></p>
<h3 data-ke-size="size23">2. <b>keyArgs로 캐시 키 제어</b></h3>
<pre class="rust"><code>const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        campaigns: {
          keyArgs: ['status'],  // page는 무시!
        },
      },
    },
  },
})
<p>// 결과 캐시 키
'campaigns({&quot;status&quot;:&quot;open&quot;})'  // page 1이든 2든 같은 키!</p>
<p>// TanStack Query로 비유하면:
useQuery({
queryKey: ['campaigns', { status: 'open' }],  // page 제외
// ...
})</code></pre></p>
<p data-ke-size="size16"><b>즉, keyArgs는 "어떤 인자로 캐시를 구분할지" 선택.</b></p>
<h2 data-ke-size="size26">실제 동작 비교</h2>
<h3 data-ke-size="size23">TanStack Query</h3>
<pre class="yaml"><code>// 쿼리 1
const query1 = useQuery({
  queryKey: ['campaigns', { status: 'open', page: 1 }],
  queryFn: fetchCampaigns
})
<p>// 쿼리 2
const query2 = useQuery({
queryKey: ['campaigns', { status: 'open', page: 1 }],  // 동일!
queryFn: fetchCampaigns
})
// → 쿼리 2는 캐시 hit! 네트워크 요청 안 함 ✅</code></pre></p>
<h3 data-ke-size="size23">Apollo Client (keyArgs 없을 때)</h3>
<pre class="groovy"><code>// 쿼리 1
const query1 = useQuery(GET_CAMPAIGNS, {
  variables: { status: 'open', page: 1 }
})
// 캐시 키: 'campaigns({"status":"open","page":1})'
<p>// 쿼리 2
const query2 = useQuery(GET_CAMPAIGNS, {
variables: { status: 'open', page: 1 }  // 동일!
})
// 캐시 키: 'campaigns({&quot;status&quot;:&quot;open&quot;,&quot;page&quot;:1})'
// → 캐시 hit! 네트워크 요청 안 함 ✅</code></pre></p>
<h3 data-ke-size="size23">Apollo Client (keyArgs 있을 때)</h3>
<pre class="groovy"><code>const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        campaigns: {
          keyArgs: ['status'],  // page 무시
        },
      },
    },
  },
})
<p>// 쿼리 1
const query1 = useQuery(GET_CAMPAIGNS, {
variables: { status: 'open', page: 1 }
})
// 캐시 키: 'campaigns({&quot;status&quot;:&quot;open&quot;})'
// 캐시 내용: [item1, item2, ..., item10]</p>
<p>// 쿼리 2
const query2 = useQuery(GET_CAMPAIGNS, {
variables: { status: 'open', page: 2 }  // page만 다름
})
// 캐시 키: 'campaigns({&quot;status&quot;:&quot;open&quot;})'  // 같은 키!
// → 캐시 hit하지만, merge 함수가 실행됨!</p>
<p>// merge 함수
merge(existing, incoming, { args }) {
// existing: [item1, ..., item10] (page 1)
// incoming: [item11, ..., item20] (page 2)
// args: { status: 'open', page: 2 }</p>
<p>return [...existing, ...incoming]  // 무한 스크롤!
// 결과: [item1, ..., item10, item11, ..., item20]
}</code></pre></p>
<p data-ke-size="size16"><b>TanStack Query로 비유하면:</b></p>
<pre class="arcade"><code>// 이런 느낌!
useInfiniteQuery({
  queryKey: ['campaigns', { status: 'open' }],  // page 제외
  queryFn: ({ pageParam }) =&gt; fetchCampaigns(pageParam),
  getNextPageParam: (lastPage) =&gt; lastPage.nextPage,
})</code></pre>
<h2 data-ke-size="size26">InMemory 저장 방식</h2>
<h3 data-ke-size="size23">TanStack Query</h3>
<pre class="vim"><code>// 메모리 구조
const queryCache = {
  queries: [
    {
      queryKey: ['campaigns', { status: 'open' }],
      state: {
        data: [...],
        status: 'success',
        fetchStatus: 'idle',
      }
    },
    {
      queryKey: ['campaign', { id: 'abc-123' }],
      state: { data: {...}, ... }
    }
  ]
}</code></pre>
<h3 data-ke-size="size23">Apollo Client</h3>
<pre class="pgsql"><code>// 메모리 구조 (정규화됨!)
const cache = {
  ROOT_QUERY: {
    'campaigns({"status":"open"})': [
      { __ref: 'Campaign:1' },
      { __ref: 'Campaign:2' },
    ],
    'campaign({"id":"abc-123"})': { __ref: 'Campaign:abc-123' }
  },
  'Campaign:1': {
    __typename: 'Campaign',
    id: '1',
    title: 'Summer Sale',
    status: 'open'
  },
  'Campaign:2': {
    __typename: 'Campaign',
    id: '2',
    title: 'Winter Sale',
    status: 'open'
  },
  'Campaign:abc-123': {
    __typename: 'Campaign',
    id: 'abc-123',
    title: 'Spring Sale',
    status: 'closed'
  }
}</code></pre>
<p data-ke-size="size16"><b>핵심 차이: Apollo Client는 객체를 정규화해서 참조로 저장!</b></p>
<h2 data-ke-size="size26">정규화의 장점</h2>
<h3 data-ke-size="size23">TanStack Query (정규화 없음)</h3>
<pre class="groovy"><code>// 쿼리 1: 캠페인 목록
useQuery({
  queryKey: ['campaigns'],
  queryFn: () =&gt; [
    { id: '1', title: 'Summer Sale', status: 'open' },
    { id: '2', title: 'Winter Sale', status: 'open' }
  ]
})
<p>// 쿼리 2: 특정 캠페인
useQuery({
queryKey: ['campaign', '1'],
queryFn: () =&gt; ({ id: '1', title: 'Summer Sale', status: 'open' })
})</p>
<p>// 쿼리 3: 캠페인 업데이트
useMutation({
mutationFn: updateCampaign,
onSuccess: (data) =&gt; {
// 수동으로 모든 관련 캐시 업데이트 필요!
queryClient.setQueryData(['campaign', '1'], data)
queryClient.setQueryData(['campaigns'], (old) =&gt;
old.map(c =&gt; c.id === '1' ? data : c)
)
//   실수하기 쉽고 번거로움
}
})</code></pre></p>
<h3 data-ke-size="size23">Apollo Client (정규화됨)</h3>
<pre class="less"><code>// 쿼리 1: 캠페인 목록
useQuery(GET_CAMPAIGNS)
// 캐시: Campaign:1, Campaign:2 객체 생성
<p>// 쿼리 2: 특정 캠페인
useQuery(GET_CAMPAIGN, { variables: { id: '1' } })
// 캐시: Campaign:1 재사용! (이미 있음)</p>
<p>// 쿼리 3: 캠페인 업데이트
useMutation(UPDATE_CAMPAIGN, {
variables: { id: '1', title: 'New Title' }
})
// Apollo가 자동으로 Campaign:1 업데이트
// → 모든 관련 쿼리가 자동으로 리렌더링!  </code></pre></p>
<p data-ke-size="size16"><b>Apollo Client는 같은 객체(id가 같으면)를 한 곳에만 저장하고 참조를 사용.</b></p>
<h2 data-ke-size="size26">구체적인 캐시 동작 예시</h2>
<h3 data-ke-size="size23">시나리오: 캠페인 목록 &rarr; 상세 &rarr; 업데이트</h3>
<pre class="gml"><code>// 1. 캠페인 목록 조회
const { data: campaigns } = useQuery(gql`
  query GetCampaigns {
    campaigns {
      id
      title
      status
    }
  }
`)
<p>// Apollo 캐시 상태
{
ROOT_QUERY: {
'campaigns': [
{ __ref: 'Campaign:1' },
{ __ref: 'Campaign:2' }
]
},
'Campaign:1': { id: '1', title: 'Summer Sale', status: 'open' },
'Campaign:2': { id: '2', title: 'Winter Sale', status: 'open' }
}</p>
<p>// 2. 상세 조회 (추가 필드 포함)
const { data: campaign } = useQuery(gql<code>  query GetCampaign($id: ID!) {     campaign(id: $id) {       id       title       status       description  # 새로운 필드!       budget       # 새로운 필드!     }   }</code>, { variables: { id: '1' } })</p>
<p>// Apollo 캐시 상태 (병합됨!)
{
ROOT_QUERY: {
'campaigns': [{ __ref: 'Campaign:1' }, { __ref: 'Campaign:2' }],
'campaign({&quot;id&quot;:&quot;1&quot;})': { __ref: 'Campaign:1' }
},
'Campaign:1': {
id: '1',
title: 'Summer Sale',
status: 'open',
description: 'Amazing summer deals!',  // 추가됨
budget: 10000                          // 추가됨
},
'Campaign:2': { id: '2', title: 'Winter Sale', status: 'open' }
}</p>
<p>// 3. 업데이트 mutation
const [updateCampaign] = useMutation(gql<code>  mutation UpdateCampaign($id: ID!, $title: String!) {     updateCampaign(id: $id, title: $title) {       id       title       status     }   }</code>)</p>
<p>await updateCampaign({
variables: { id: '1', title: 'Super Summer Sale!' }
})</p>
<p>// Apollo 캐시 상태 (자동 업데이트!)
{
'Campaign:1': {
id: '1',
title: 'Super Summer Sale!',  // 자동으로 변경됨!
status: 'open',
description: 'Amazing summer deals!',
budget: 10000
},
// ...
}</p>
<p>// 결과: campaigns 쿼리와 campaign 쿼리 모두 자동으로 리렌더링! ✨</code></pre></p>
<h2 data-ke-size="size26">캐시 키 생성 규칙 상세</h2>
<h3 data-ke-size="size23">1. <b>기본 규칙: 타입명 + id (또는 _id)</b></h3>
<pre class="actionscript"><code>// GraphQL 응답
{
  campaign: {
    __typename: "Campaign",
    id: "abc-123",
    title: "Summer Sale"
  }
}
<p>// 자동 생성되는 캐시 키
&quot;Campaign:abc-123&quot;</p>
<p>// 커스터마이즈 가능
const cache = new InMemoryCache({
typePolicies: {
Campaign: {
keyFields: ['id'],  // 기본값
// 또는
keyFields: ['customId'],
// 또는 복합 키
keyFields: ['businessId', 'campaignId'],
}
}
})</code></pre></p>
<h3 data-ke-size="size23">2. <b>복합 키 예시</b></h3>
<pre class="actionscript"><code>// GraphQL 응답
{
  campaignApplication: {
    __typename: "CampaignApplication",
    campaignId: "camp-1",
    influencerId: "inf-1",
    status: "approved"
  }
}
<p>// 캐시 설정
const cache = new InMemoryCache({
typePolicies: {
CampaignApplication: {
keyFields: ['campaignId', 'influencerId'],
}
}
})</p>
<p>// 생성되는 캐시 키
&quot;CampaignApplication:camp-1:inf-1&quot;</code></pre></p>
<h3 data-ke-size="size23">3. <b>키가 없는 객체 (리스트 아이템 등)</b></h3>
<pre class="yaml"><code>// keyFields: false &rarr; 캐시 키 없이 인라인 저장
const cache = new InMemoryCache({
  typePolicies: {
    CampaignStats: {
      keyFields: false,  // 캐시 키 생성 안 함
    }
  }
})
<p>// 결과: 부모 객체 안에 직접 저장
{
'Campaign:1': {
id: '1',
title: 'Summer Sale',
stats: {  // 인라인으로 저장 (참조 없음)
__typename: 'CampaignStats',
views: 1000,
clicks: 100
}
}
}</code></pre></p>
<h2 data-ke-size="size26">TanStack Query vs Apollo Client 정리</h2>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>특징</th>
<th>TanStack Query</th>
<th>Apollo Client</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>캐시 키</b></td>
<td>수동 지정 필수</td>
<td>자동 생성 (커스터마이즈 가능)</td>
</tr>
<tr>
<td><b>저장 방식</b></td>
<td>queryKey별로 독립</td>
<td>정규화 (객체 단위)</td>
</tr>
<tr>
<td><b>중복 제거</b></td>
<td>없음 (같은 데이터 여러 번 저장)</td>
<td>자동 (참조 사용)</td>
</tr>
<tr>
<td><b>캐시 업데이트</b></td>
<td>수동 (setQueryData)</td>
<td>자동 (같은 id면 자동 업데이트)</td>
</tr>
<tr>
<td><b>복잡도</b></td>
<td>단순</td>
<td>복잡 (학습 곡선)</td>
</tr>
<tr>
<td><b>사용 케이스</b></td>
<td>REST API</td>
<td>GraphQL</td>
</tr>
</tbody>
</table>
<h2 data-ke-size="size26">실무 팁</h2>
<h3 data-ke-size="size23">Apollo Client에서 TanStack Query 패턴 사용하기</h3>
<pre class="actionscript"><code>// 정규화 비활성화 (TanStack Query처럼)
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        searchResults: {
          keyArgs: ['query'],  // 검색어로만 구분
          merge(existing, incoming) {
            return incoming  // 단순 교체
          },
        },
      },
    },
    SearchResult: {
      keyFields: false,  // 정규화 안 함
    },
  },
})
<p>// 결과: TanStack Query처럼 동작</code></pre></p>
<h3 data-ke-size="size23">디버깅 팁</h3>
<pre class="javascript"><code>// Apollo DevTools 없이 캐시 확인
import { useApolloClient } from '@apollo/client'
<p>function DebugCache() {
const client = useApolloClient()</p>
<p>const showCache = () =&gt; {
console.log(client.cache.extract())
}</p>
<p>return &lt;button onClick={showCache}&gt;Show Cache&lt;/button&gt;
}</code></pre></p>
<p data-ke-size="size16"><b>출력 예시:</b></p>
<pre class="json"><code>{
  "ROOT_QUERY": {
    "campaigns({\"status\":\"open\"})": [
      {"__ref": "Campaign:1"},
      {"__ref": "Campaign:2"}
    ]
  },
  "Campaign:1": {
    "__typename": "Campaign",
    "id": "1",
    "title": "Summer Sale"
  }
}</code></pre>
<h2 data-ke-size="size26">결론</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>✅ <b>캐시 키 = TanStack Query의 queryKey</b> (개념적으로 동일)</li>
<li>✅ <b>자동 생성됨</b> (GraphQL 쿼리 기반)</li>
<li>✅ <b>InMemory = 메모리에 저장</b> (TanStack Query와 동일)</li>
<li>✨ <b>추가로 정규화 기능</b> (Apollo만의 강점!)</li>
</ol>
<p data-ke-size="size16"><b>keyArgs는 "어떤 변수로 캐시를 구분할지" 제어</b><br /><b>merge는 "같은 캐시 키에 데이터가 들어올 때 어떻게 합칠지" 제어</b></p>