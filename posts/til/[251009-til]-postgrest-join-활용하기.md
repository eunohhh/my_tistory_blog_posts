<h4 data-ke-size="size20">Supabase의 PostgREST: GraphQL처럼 쿼리하는 SQL</h4>
<hr contenteditable="false" data-ke-type="horizontalRule" data-ke-style="style1" />
<h2 data-ke-size="size26">  TL;DR (한 줄 요약)</h2>
<p data-ke-size="size16">Supabase는 PostgREST를 통해 <b>GraphQL의 선언적 쿼리 스타일</b>을 REST API로 구현하여, SQL JOIN을 직관적인 체이닝 메서드로 사용할 수 있게 합니다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">  핵심 정리</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Supabase JS는 SQL을 직접 쓰지 않고 체이닝 메서드 사용</b></li>
<li><b>PostgREST</b>는 GraphQL의 장점과 REST의 단순함을 결합한 프로토콜</li>
<li><b>Foreign Key 기반으로 자동 관계 생성</b> - 별도 설정 불필요</li>
<li><b>중첩 쿼리</b>로 복잡한 JOIN도 간단하게 표현</li>
<li><b>TypeScript 타입 자동 생성</b>으로 완벽한 타입 안정성</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">1. SQL JOIN의 전통적 방식</h2>
<h3 data-ke-size="size23">전통적인 SQL JOIN</h3>
<pre class="sql"><code>-- 게시글 + 작성자 정보
SELECT 
  posts.id,
  posts.title,
  posts.content,
  users.name,
  users.avatar_url
FROM posts
LEFT JOIN users ON posts.user_id = users.id
WHERE posts.is_published = true
ORDER BY posts.created_at DESC
LIMIT 10;</code></pre>
<h3 data-ke-size="size23">문제점</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Over-fetching</b>: 필요 없는 컬럼도 모두 가져옴</li>
<li><b>Under-fetching</b>: 추가 데이터가 필요하면 별도 쿼리 필요</li>
<li><b>복잡한 중첩</b>: 댓글 + 댓글 작성자까지 가져오려면 복잡해짐</li>
<li><b>타입 안정성 부족</b>: SQL 결과를 수동으로 타이핑</li>
</ol>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">2. PostgREST의 철학</h2>
<h3 data-ke-size="size23">PostgREST란?</h3>
<p data-ke-size="size16">PostgreSQL 데이터베이스를 자동으로 <b>RESTful API</b>로 변환해주는 도구.</p>
<h3 data-ke-size="size23">GraphQL과의 비교</h3>
<h4 data-ke-size="size20">GraphQL 쿼리</h4>
<pre class="routeros"><code>query {
  posts {
    id
    title
    user {
      name
      avatar
    }
    comments {
      text
      author {
        name
      }
    }
  }
}</code></pre>
<h4 data-ke-size="size20">Supabase (PostgREST) 쿼리</h4>
<pre class="pgsql"><code>const { data } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    user:users (
      name,
      avatar
    ),
    comments (
      text,
      author:users (
        name
      )
    )
  `);</code></pre>
<p data-ke-size="size16"><b>거의 똑같습니다!</b>  </p>
<h3 data-ke-size="size23">PostgREST의 장점</h3>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>특징</th>
<th>PostgREST</th>
<th>GraphQL</th>
<th>전통 REST</th>
</tr>
</thead>
<tbody>
<tr>
<td>설정 복잡도</td>
<td>✅ 낮음 (FK만)</td>
<td>⚠️ 높음 (스키마+리졸버)</td>
<td>⚠️ 중간 (엔드포인트)</td>
</tr>
<tr>
<td>쿼리 유연성</td>
<td>✅ 높음</td>
<td>✅ 높음</td>
<td>❌ 낮음</td>
</tr>
<tr>
<td>Over-fetching 방지</td>
<td>✅</td>
<td>✅</td>
<td>❌</td>
</tr>
<tr>
<td>타입 안정성</td>
<td>✅ (자동생성)</td>
<td>✅ (codegen)</td>
<td>⚠️ (수동)</td>
</tr>
<tr>
<td>학습 곡선</td>
<td>✅ 낮음</td>
<td>⚠️ 높음</td>
<td>✅ 낮음</td>
</tr>
</tbody>
</table>
<h3 data-ke-size="size23">핵심 개념: Foreign Key = 자동 관계</h3>
<pre class="sql"><code>-- Foreign Key만 설정하면 끝!
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),  -- &larr; 이것만으로 충분
  title TEXT
);
<p>CREATE TABLE comments (
id UUID PRIMARY KEY,
post_id UUID REFERENCES posts(id),  -- ← 이것만으로 충분
user_id UUID REFERENCES users(id),
text TEXT
);</code></pre></p>
<pre class="cs"><code>// 자동으로 관계 쿼리 가능!
.select('*, users(*), comments(*)')</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">3. 기본 JOIN 패턴</h2>
<h3 data-ke-size="size23">❌ SQL 문법은 사용할 수 없습니다</h3>
<pre class="cs"><code>// ❌ 이런 건 안 됩니다!
await supabase
  .from('posts')
  .select('* LEFT JOIN users ON posts.user_id = users.id');</code></pre>
<h3 data-ke-size="size23">✅ 체이닝 메서드 사용</h3>
<pre class="cs"><code>// ✅ 이렇게 사용합니다!
await supabase
  .from('posts')
  .select('*, users(*)');</code></pre>
<h3 data-ke-size="size23">패턴 1: 1:1 관계 (사용자 프로필)</h3>
<pre class="routeros"><code>-- 테이블 구조
users                    profiles
├── id (PK)             ├── user_id (FK &rarr; users.id)
├── email               ├── bio
└── created_at          └── avatar_url</code></pre>
<pre class="jboss-cli"><code>const { data } = await supabase
  .from('users')
  .select(`
    id,
    email,
    profiles (
      bio,
      avatar_url
    )
  `);
<p>// 결과:
// [
//   {
//     id: &quot;user-1&quot;,
//     email: &quot;oeun@example.com&quot;,
//     profiles: {
//       bio: &quot;프론트엔드 개발자&quot;,
//       avatar_url: &quot;https://...&quot;
//     }
//   }
// ]</code></pre></p>
<h3 data-ke-size="size23">패턴 2: 1:N 관계 (게시글 + 댓글들)</h3>
<pre class="applescript"><code>-- 테이블 구조
posts                    comments
├── id (PK)             ├── id (PK)
├── title               ├── post_id (FK &rarr; posts.id)
└── user_id             ├── text
                        └── user_id</code></pre>
<pre class="jboss-cli"><code>const { data } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    comments (
      id,
      text
    )
  `);
<p>// 결과:
// [
//   {
//     id: &quot;post-1&quot;,
//     title: &quot;Supabase 시작하기&quot;,
//     comments: [
//       { id: &quot;c1&quot;, text: &quot;좋은 글이네요&quot; },
//       { id: &quot;c2&quot;, text: &quot;감사합니다&quot; }
//     ]
//   }
// ]</code></pre></p>
<h3 data-ke-size="size23">패턴 3: 특정 컬럼만 선택</h3>
<pre class="go"><code>// 전체 선택
.select('*, users(*)')
<p>// 특정 컬럼만
.select(<code>  id,   title,   users (     name,     email   )</code>)</p>
<p>// 단일 컬럼
.select('title, users(name)')</code></pre></p>
<h3 data-ke-size="size23">패턴 4: 별칭(Alias) 사용</h3>
<pre class="bash" data-ke-language="bash"><code>// Foreign Key가 2개일 때 (발신자/수신자)
const { data } = await supabase
  .from('messages')
  .select(`
    content,
    sender:users!sender_id (name, avatar_url),
    receiver:users!receiver_id (name, avatar_url)
  `);
<p>// 결과:
// {
//   content: &quot;안녕하세요&quot;,
//   sender: { name: &quot;영희&quot;, avatar_url: &quot;...&quot; },
//   receiver: { name: &quot;철수&quot;, avatar_url: &quot;...&quot; }
// }</code></pre></p>
<p data-ke-size="size16"><b>문법 설명:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>sender:users</code> - 'sender'라는 별칭 사용</li>
<li><code>!sender_id</code> - 어떤 Foreign Key를 사용할지 명시</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">4. 고급 JOIN 패턴</h2>
<h3 data-ke-size="size23">패턴 1: 중첩 JOIN (N단계)</h3>
<pre class="ada"><code>-- 테이블 구조
posts &rarr; comments &rarr; users</code></pre>
<pre class="jboss-cli"><code>// 게시글 + 댓글 + 댓글 작성자
const { data } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    comments (
      id,
      text,
      users (
        name,
        avatar_url
      )
    )
  `);
<p>// 결과:
// [
//   {
//     title: &quot;게시글&quot;,
//     comments: [
//       {
//         text: &quot;댓글&quot;,
//         users: { name: &quot;철수&quot;, avatar_url: &quot;...&quot; }
//       }
//     ]
//   }
// ]</code></pre></p>
<h3 data-ke-size="size23">패턴 2: 다대다 관계 (게시글 + 태그)</h3>
<pre class="applescript"><code>-- 테이블 구조
posts          post_tags         tags
├── id         ├── post_id       ├── id
└── title      └── tag_id        └── name</code></pre>
<pre class="jboss-cli"><code>const { data } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    post_tags (
      tags (
        id,
        name
      )
    )
  `);
<p>// 결과:
// {
//   title: &quot;Next.js 가이드&quot;,
//   post_tags: [
//     { tags: { name: &quot;typescript&quot; } },
//     { tags: { name: &quot;react&quot; } },
//     { tags: { name: &quot;nextjs&quot; } }
//   ]
// }</code></pre></p>
<p data-ke-size="size16"><b>더 깔끔한 형태로 변환:</b></p>
<pre class="jboss-cli"><code>const posts = data?.map(post =&gt; ({
  ...post,
  tags: post.post_tags.map(pt =&gt; pt.tags.name)
}));
<p>// 결과:
// {
//   title: &quot;Next.js 가이드&quot;,
//   tags: [&quot;typescript&quot;, &quot;react&quot;, &quot;nextjs&quot;]
// }</code></pre></p>
<h3 data-ke-size="size23">패턴 3: COUNT 집계</h3>
<pre class="cs"><code>// 각 게시글의 댓글 수
const { data } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    comments (count)
  `);
<p>// 결과:
// [
//   {
//     id: &quot;post-1&quot;,
//     title: &quot;게시글&quot;,
//     comments: [{ count: 5 }]
//   }
// ]</code></pre></p>
<p data-ke-size="size16"><b>더 깔끔하게:</b></p>
<pre class="stata"><code>const posts = data?.map(post =&gt; ({
  ...post,
  commentCount: post.comments[0]?.count || 0
}));</code></pre>
<h3 data-ke-size="size23">패턴 4: INNER vs LEFT JOIN</h3>
<pre class="pgsql"><code>// LEFT JOIN (기본값) - 댓글 없는 게시글도 포함
.select('*, comments(*)')
<p>// INNER JOIN - 댓글 있는 게시글만
.select('<em>, comments!inner(</em>)')</code></pre></p>
<p data-ke-size="size16"><b>예제:</b></p>
<pre class="cs"><code>// 댓글이 하나라도 있는 게시글만 가져오기
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    comments!inner (
      id
    )
  `);</code></pre>
<h3 data-ke-size="size23">패턴 5: 필터링과 함께 사용</h3>
<pre class="lasso"><code>// JOIN된 테이블에 필터 적용
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    comments!inner (
      *,
      users (name)
    )
  `)
  .eq('comments.approved', true)  // 승인된 댓글만
  .gte('comments.created_at', '2024-01-01');  // 특정 날짜 이후
<p>// 복수 조건
const { data } = await supabase
.from('posts')
.select('<em>, users(</em>)')
.eq('is_published', true)
.eq('users.role', 'author')
.order('created_at', { ascending: false })
.limit(10);</code></pre></p>
<h3 data-ke-size="size23">패턴 6: 외부 테이블에 LIMIT 적용</h3>
<pre class="cs"><code>// 각 게시글의 최신 댓글 3개만
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    comments (
      *,
      users (name)
    )
  `)
  .order('comments.created_at', { 
    foreignTable: 'comments',
    ascending: false 
  })
  .limit(3, { foreignTable: 'comments' });</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">5. TypeScript 타입 안정성</h2>
<h3 data-ke-size="size23">타입 자동 생성</h3>
<pre class="cmake"><code># Supabase CLI 설치
npm install -g supabase
<h1>타입 생성</h1>
<p>npx supabase gen types typescript --project-id &quot;your-project-id&quot; &gt; types/supabase.ts</code></pre></p>
<h3 data-ke-size="size23">생성된 타입 사용</h3>
<pre class="angelscript"><code>// types/supabase.ts (자동 생성)
export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          title: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
        };
        // ...
      };
    };
  };
}</code></pre>
<h3 data-ke-size="size23">클라이언트에 타입 적용</h3>
<pre class="javascript"><code>// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
<p>export const supabase = createClient&lt;Database&gt;(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);</code></pre></p>
<h3 data-ke-size="size23">타입 안정성의 힘</h3>
<pre class="kotlin"><code>const { data } = await supabase
  .from('posts')  // &larr; 'posts' 자동완성!
  .select('id, title, users(name)')
  .eq('is_published', true);  // &larr; 'is_published' 자동완성!
//    &uarr; 존재하지 않는 컬럼 입력 시 타입 에러!
<p>// data의 타입도 자동 추론!
data?.[0].title  // ✅ string
data?.[0].users.name  // ✅ string
data?.[0].nonexistent  // ❌ 타입 에러!</code></pre></p>
<h3 data-ke-size="size23">커스텀 쿼리 타입</h3>
<pre class="prolog"><code>// 복잡한 쿼리의 결과 타입 추출
type PostWithAuthorAndComments = Database['public']['Tables']['posts']['Row'] &amp; {
  users: Database['public']['Tables']['users']['Row'];
  comments: Array
    Database['public']['Tables']['comments']['Row'] &amp; {
      users: Database['public']['Tables']['users']['Row'];
    }
  &gt;;
};
<p>const { data } = await supabase
.from('posts')
.select(<code>    *,     users(*),     comments(*, users(*))  </code>)
.returns&lt;PostWithAuthorAndComments[]&gt;();</code></pre></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">6. 실전 예제</h2>
<h3 data-ke-size="size23">예제 1: 블로그 시스템</h3>
<p data-ke-size="size16"><b>요구사항:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>게시글 목록 (최신순)</li>
<li>각 게시글의 작성자 정보</li>
<li>각 게시글의 댓글 수</li>
<li>각 게시글의 태그 목록</li>
</ul>
<pre class="javascript"><code>// app/api/posts/route.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
<p>export async function GET() {
const supabase = createClient&lt;Database&gt;(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);</p>
<p>const { data, error } = await supabase
.from('posts')
.select(<code>      id,       title,       content,       created_at,       users (         name,         avatar_url       ),       comments (count),       post_tags (         tags (           name,           color         )       )    </code>)
.eq('is_published', true)
.order('created_at', { ascending: false })
.limit(20);</p>
<p>if (error) {
return Response.json({ error: error.message }, { status: 500 });
}</p>
<p>// 데이터 변환
const posts = data.map(post =&gt; ({
id: post.id,
title: post.title,
content: post.content,
createdAt: post.created_at,
author: {
name: post.users?.name,
avatar: post.users?.avatar_url
},
commentCount: post.comments[0]?.count || 0,
tags: post.post_tags.map(pt =&gt; ({
name: pt.tags?.name,
color: pt.tags?.color
}))
}));</p>
<p>return Response.json({ posts });
}</code></pre></p>
<h3 data-ke-size="size23">예제 2: 소셜 피드</h3>
<p data-ke-size="size16"><b>요구사항:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>팔로우하는 사람들의 게시글만</li>
<li>최신 댓글 3개 (작성자 포함)</li>
<li>좋아요 수</li>
</ul>
<pre class="applescript"><code>-- 테이블 구조
follows
├── follower_id (현재 사용자)
└── following_id (팔로우 대상)
<p>posts
├── id
├── user_id
└── content</p>
<p>likes
├── post_id
└── user_id</p>
<p>comments
├── post_id
├── user_id
└── text</code></pre></p>
<pre class="cs"><code>export async function GET(request: Request) {
  const userId = await getUserFromSession(request);

  const supabase = createClient&lt;Database&gt;(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. 팔로우하는 사용자 ID 가져오기
  const { data: followingData } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  const followingIds = followingData?.map(f =&gt; f.following_id) || [];

  // 2. 피드 가져오기
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      created_at,
      users (
        id,
        name,
        avatar_url
      ),
      likes (count),
      comments (
        id,
        text,
        created_at,
        users (
          name,
          avatar_url
        )
      )
    `)
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    .order('comments.created_at', { 
      foreignTable: 'comments',
      ascending: false 
    })
    .limit(3, { foreignTable: 'comments' })
    .limit(20);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ feed: data });
}</code></pre>
<h3 data-ke-size="size23">예제 3: 이커머스 주문 상세</h3>
<p data-ke-size="size16"><b>요구사항:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>주문 정보</li>
<li>주문 항목들 (상품 정보 포함)</li>
<li>배송지 정보</li>
<li>결제 정보</li>
</ul>
<pre class="bash" data-ke-language="bash"><code>const { data: order } = await supabase
  .from('orders')
  .select(`
    id,
    order_number,
    status,
    total_amount,
    created_at,
    users (
      name,
      email
    ),
    order_items (
      quantity,
      price,
      products (
        name,
        image_url,
        description
      )
    ),
    shipping_addresses (
      recipient_name,
      address,
      phone
    ),
    payments (
      method,
      status,
      paid_at
    )
  `)
  .eq('id', orderId)
  .single();
<p>// 결과:
// {
//   order_number: &quot;ORD-2024-001&quot;,
//   status: &quot;delivered&quot;,
//   users: { name: &quot;~~&quot;, email: &quot;...&quot; },
//   order_items: [
//     {
//       quantity: 2,
//       price: 29000,
//       products: { name: &quot;키보드&quot;, image_url: &quot;...&quot; }
//     }
//   ],
//   shipping_addresses: { ... },
//   payments: { ... }
// }</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">예제 4: 실시간 채팅 (Realtime + JOIN)</h3>
<pre class="cs"><code>// 실시간 구독 + JOIN
const channel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages'
    },
    async (payload) =&gt; {
      // 새 메시지가 들어오면 작성자 정보 포함해서 가져오기
      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          users (
            name,
            avatar_url
          )
        `)
        .eq('id', payload.new.id)
        .single();
<pre><code>  // UI 업데이트
  addMessageToChat(data);
}
</code></pre>
<p>)
.subscribe();</code></pre></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">7. 성능 최적화</h2>
<h3 data-ke-size="size23">최적화 1: 필요한 컬럼만 선택</h3>
<pre class="sqf"><code>// ❌ 비효율적 (모든 컬럼)
.select('*, users(*), comments(*)')
<p>// ✅ 효율적 (필요한 것만)
.select(<code>  id,   title,   users (name, avatar_url),   comments (count)</code>)</code></pre></p>
<h3 data-ke-size="size23">최적화 2: 인덱스 활용</h3>
<pre class="sql"><code>-- Foreign Key는 자동으로 인덱스 생성되지만,
-- 필터링에 자주 쓰는 컬럼에는 인덱스 추가
<p>CREATE INDEX idx_posts_published ON posts(is_published, created_at DESC);
CREATE INDEX idx_comments_approved ON comments(approved, created_at);</code></pre></p>
<h3 data-ke-size="size23">최적화 3: 페이지네이션</h3>
<pre class="cs"><code>// 오프셋 페이지네이션
const page = 1;
const pageSize = 20;
<p>const { data, count } = await supabase
.from('posts')
.select('*, users(name)', { count: 'exact' })
.range(page * pageSize, (page + 1) * pageSize - 1);</p>
<p>// 커서 페이지네이션 (더 효율적)
const { data } = await supabase
.from('posts')
.select('*, users(name)')
.lt('created_at', lastPostCreatedAt)  // 커서
.order('created_at', { ascending: false })
.limit(20);</code></pre></p>
<h3 data-ke-size="size23">최적화 4: 쿼리 결과 캐싱</h3>
<pre class="javascript"><code>// Next.js App Router
export async function getPosts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
<p>const { data } = await supabase
.from('posts')
.select('*, users(name)');</p>
<p>return data;
}</p>
<p>// 캐싱 (5분)
export const revalidate = 300;</code></pre></p>
<h3 data-ke-size="size23">최적화 5: N+1 문제 방지</h3>
<pre class="cs"><code>// ❌ N+1 문제 (N번의 추가 쿼리)
const { data: posts } = await supabase.from('posts').select('*');
<p>for (const post of posts) {
// 각 게시글마다 별도 쿼리!
const { data: user } = await supabase
.from('users')
.select('name')
.eq('id', post.user_id)
.single();</p>
<p>post.authorName = user.name;
}</p>
<p>// ✅ 해결: 한 번에 JOIN
const { data: posts } = await supabase
.from('posts')
.select(<code>    *,     users (name)  </code>);</code></pre></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">8. 한계와 대안</h2>
<h3 data-ke-size="size23">Supabase JS의 한계</h3>
<h4 data-ke-size="size20">1. 복잡한 집계 쿼리</h4>
<pre class="routeros"><code>-- ❌ 이런 건 불가능
SELECT 
  users.name,
  COUNT(posts.id) as post_count,
  AVG(posts.views) as avg_views,
  MAX(posts.created_at) as latest_post
FROM users
LEFT JOIN posts ON users.id = posts.user_id
GROUP BY users.id, users.name
HAVING COUNT(posts.id) &gt; 5;</code></pre>
<p data-ke-size="size16"><b>해결책: PostgreSQL Function (RPC)</b></p>
<pre class="pgsql"><code>CREATE FUNCTION get_active_users()
RETURNS TABLE(
  name TEXT,
  post_count BIGINT,
  avg_views NUMERIC,
  latest_post TIMESTAMPTZ
) AS $$
  SELECT 
    users.name,
    COUNT(posts.id) as post_count,
    AVG(posts.views) as avg_views,
    MAX(posts.created_at) as latest_post
  FROM users
  LEFT JOIN posts ON users.id = posts.user_id
  GROUP BY users.id, users.name
  HAVING COUNT(posts.id) &gt; 5;
$$ LANGUAGE SQL;</code></pre>
<pre class="aspectj"><code>const { data } = await supabase.rpc('get_active_users');</code></pre>
<h4 data-ke-size="size20">2. UNION, INTERSECT 등</h4>
<pre class="sql"><code>-- ❌ 불가능
SELECT id FROM posts WHERE user_id = '123'
UNION
SELECT id FROM drafts WHERE user_id = '123';</code></pre>
<p data-ke-size="size16"><b>해결책: RPC 또는 여러 쿼리 조합</b></p>
<pre class="lasso"><code>const [posts, drafts] = await Promise.all([
  supabase.from('posts').select('id').eq('user_id', userId),
  supabase.from('drafts').select('id').eq('user_id', userId)
]);
<p>const allIds = [...posts.data!, ...drafts.data!];</code></pre></p>
<h4 data-ke-size="size20">3. 서브쿼리 (복잡한 경우)</h4>
<pre class="sql"><code>-- ❌ 이런 서브쿼리는 불가능
SELECT *
FROM posts
WHERE views &gt; (
  SELECT AVG(views) FROM posts WHERE category = posts.category
);</code></pre>
<p data-ke-size="size16"><b>해결책: RPC 또는 클라이언트에서 처리</b></p>
<h4 data-ke-size="size20">4. WINDOW 함수</h4>
<pre class="sql"><code>-- ❌ 불가능
SELECT 
  *,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rank
FROM posts;</code></pre>
<p data-ke-size="size16"><b>해결책: RPC</b></p>
<h3 data-ke-size="size23">대안 비교</h3>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>필요 기능</th>
<th>해결 방법</th>
<th>복잡도</th>
<th>성능</th>
</tr>
</thead>
<tbody>
<tr>
<td>간단한 JOIN</td>
<td>Supabase JS</td>
<td>✅ 낮음</td>
<td>✅ 좋음</td>
</tr>
<tr>
<td>복잡한 집계</td>
<td>RPC</td>
<td>⚠️ 중간</td>
<td>✅ 좋음</td>
</tr>
<tr>
<td>UNION, 복잡한 로직</td>
<td>RPC</td>
<td>⚠️ 중간</td>
<td>✅ 좋음</td>
</tr>
<tr>
<td>트랜잭션</td>
<td>RPC</td>
<td>⚠️ 중간</td>
<td>✅ 좋음</td>
</tr>
<tr>
<td>직접 제어 필요</td>
<td><code>pg</code> 라이브러리</td>
<td>⚠️ 높음</td>
<td>✅ 좋음</td>
</tr>
</tbody>
</table>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">  결론</h2>
<h3 data-ke-size="size23">PostgREST의 핵심 가치</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>GraphQL의 선언적 스타일</b>: 필요한 것만 명시적으로 요청</li>
<li><b>REST의 단순함</b>: 별도 서버 설정 불필요</li>
<li><b>PostgreSQL의 강력함</b>: SQL의 모든 기능 활용 가능</li>
<li><b>타입 안정성</b>: TypeScript 완벽 지원</li>
</ol>
<h3 data-ke-size="size23">언제 Supabase JS를 사용할까?</h3>
<p data-ke-size="size16">✅ <b>추천하는 경우</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>CRUD 중심의 애플리케이션</li>
<li>1~3단계 정도의 JOIN</li>
<li>빠른 프로토타이핑</li>
<li>타입 안정성이 중요한 프로젝트</li>
<li>Next.js/React와 함께 사용</li>
</ul>
<p data-ke-size="size16">⚠️ <b>RPC 함께 사용 권장</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>복잡한 집계 쿼리</li>
<li>트랜잭션 필요</li>
<li>비즈니스 로직이 복잡한 경우</li>
<li>GROUP BY, HAVING 등 고급 SQL 필요</li>
</ul>
<p data-ke-size="size16">❌ <b>다른 방법 고려</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>실시간 복잡한 분석 (BI 도구 사용)</li>
<li>매우 복잡한 데이터 모델 (GraphQL 고려)</li>
<li>레거시 DB 통합</li>
</ul>
<h3 data-ke-size="size23">GraphQL vs Supabase PostgREST</h3>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>측면</th>
<th>Supabase</th>
<th>GraphQL</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>설정</b></td>
<td>✅ FK만 설정</td>
<td>⚠️ 스키마+리졸버 작성</td>
</tr>
<tr>
<td><b>타입 생성</b></td>
<td>✅ CLI 한 줄</td>
<td>✅ Codegen 필요</td>
</tr>
<tr>
<td><b>학습 곡선</b></td>
<td>✅ SQL 아는 사람에게 쉬움</td>
<td>⚠️ 새로운 개념 학습</td>
</tr>
<tr>
<td><b>유연성</b></td>
<td>⚠️ PostgreSQL 기능 제한</td>
<td>✅ 완전한 자유</td>
</tr>
<tr>
<td><b>커뮤니티</b></td>
<td>⚠️ 상대적으로 작음</td>
<td>✅ 매우 큼</td>
</tr>
<tr>
<td><b>에코시스템</b></td>
<td>⚠️ Supabase 전용</td>
<td>✅ 다양한 도구</td>
</tr>
</tbody>
</table>
<h3 data-ke-size="size23">실무 조합 추천</h3>
<pre class="cs"><code>// 1. 간단한 CRUD &rarr; Supabase JS
const { data: posts } = await supabase
  .from('posts')
  .select('*, users(name)');
<p>// 2. 복잡한 쿼리 → RPC
const { data: stats } = await supabase
.rpc('get_user_statistics', { user_id: userId });</p>
<p>// 3. 트랜잭션 → RPC
const { data: result } = await supabase
.rpc('create_order_with_items', {
items: [...],
total: 10000
});</p>
<p>// 4. 실시간 → Supabase Realtime
supabase
.channel('posts')
.on('postgres_changes', { ... }, callback)
.subscribe();</code></pre></p>
<h3 data-ke-size="size23">핵심 기억사항</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Foreign Key = 자동 관계</b>: 설정만 하면 끝</li>
<li><b><code>select()</code> 문법은 GraphQL과 유사</b>: 중첩 가능</li>
<li><b>점(<code>.</code>)이 아닌 괄호(<code>()</code>)로 관계 탐색</b>: <code>users(name)</code></li>
<li><b>TypeScript 타입은 자동 생성</b>: CLI 한 줄로 해결</li>
<li><b>복잡한 건 RPC로</b>: SQL의 모든 기능 활용</li>
</ul>
<h3 data-ke-size="size23">마이그레이션 가이드</h3>
<h4 data-ke-size="size20">기존 SQL &rarr; Supabase JS</h4>
<pre class="routeros"><code>-- Before: SQL
SELECT 
  posts.id,
  posts.title,
  users.name,
  COUNT(comments.id) as comment_count
FROM posts
LEFT JOIN users ON posts.user_id = users.id
LEFT JOIN comments ON posts.id = comments.post_id
WHERE posts.is_published = true
GROUP BY posts.id, users.name
ORDER BY posts.created_at DESC
LIMIT 10;</code></pre>
<pre class="lasso"><code>// After: 간단한 부분은 Supabase JS
const { data } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    users (name),
    comments (count)
  `)
  .eq('is_published', true)
  .order('created_at', { ascending: false })
  .limit(10);
<p>// 복잡한 집계는 RPC로
CREATE FUNCTION get_posts_with_stats() ...</code></pre></p>
<h4 data-ke-size="size20">GraphQL &rarr; Supabase</h4>
<pre class="routeros"><code># Before: GraphQL
query {
  posts(where: { published: { _eq: true } }) {
    id
    title
    user {
      name
    }
    comments_aggregate {
      aggregate {
        count
      }
    }
  }
}</code></pre>
<pre class="cs"><code>// After: Supabase (거의 같은 구조!)
const { data } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    users (name),
    comments (count)
  `)
  .eq('is_published', true);</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">  참고 자료</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://postgrest.org/">PostgREST 공식 문서</a></li>
<li><a href="https://supabase.com/docs/reference/javascript/select">Supabase JavaScript Client</a></li>
<li><a href="https://supabase.com/docs/guides/database/joins">Supabase Database Relationships</a></li>
<li><a href="https://supabase.com/docs/guides/api/generating-types">TypeScript 타입 생성</a></li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">  추신: 추가로 궁금할 만한 점</h2>
<h3 data-ke-size="size23">Q1: JOIN 성능이 걱정됩니다</h3>
<p data-ke-size="size16"><b>A:</b> Supabase JS의 JOIN은 PostgREST를 통해 실제 PostgreSQL의 JOIN으로 변환됩니다. 따라서 성능은 일반 SQL JOIN과 동일합니다. 오히려 필요한 컬럼만 선택하므로 네트워크 트래픽이 줄어듭니다.</p>
<pre class="pgsql"><code>// 이 쿼리는 내부적으로 최적화된 SQL JOIN으로 실행됩니다
.select('id, title, users(name)')
<p>// 실제 실행되는 SQL (단순화):
// SELECT posts.id, posts.title, users.name
// FROM posts
// LEFT JOIN users ON posts.user_id = users.id</code></pre></p>
<h3 data-ke-size="size23">Q2: 몇 단계까지 중첩할 수 있나요?</h3>
<p data-ke-size="size16"><b>A:</b> 이론적으로는 제한이 없지만, 실무에서는 3~4단계가 적당합니다. 그 이상은 가독성과 성능을 위해 RPC를 고려하세요.</p>
<pre class="cs"><code>// ✅ 적당함 (3단계)
.select('*, comments(*, users(*))')
<p>// ⚠️ 과도함 (5단계)
.select('<em>, a(</em>, b(<em>, c(</em>, d(*))))')
// 이럴 땐 RPC 사용 권장</code></pre></p>
<h3 data-ke-size="size23">Q3: 같은 테이블을 여러 번 JOIN할 수 있나요?</h3>
<p data-ke-size="size16"><b>A:</b> 네, 별칭(alias)을 사용하면 됩니다.</p>
<pre class="reasonml"><code>// 발신자와 수신자 (둘 다 users 테이블)
.select(`
  content,
  sender:users!sender_id(name),
  receiver:users!receiver_id(name)
`)</code></pre>
<h3 data-ke-size="size23">Q4: 관계가 없는 테이블도 JOIN할 수 있나요?</h3>
<p data-ke-size="size16"><b>A:</b> 아니요. Supabase JS는 Foreign Key 기반. 관계가 없다면:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>Foreign Key를 추가하거나</li>
<li>RPC 함수를 사용하거나</li>
<li>여러 쿼리를 조합하세요</li>
</ol>
<pre class="aspectj"><code>// Foreign Key 없이 JOIN 필요하다면
const { data } = await supabase.rpc('custom_join_function');</code></pre>
<h3 data-ke-size="size23">Q5: 조건부 JOIN은 어떻게 하나요?</h3>
<p data-ke-size="size16"><b>A:</b> Supabase JS는 조건부 JOIN을 직접 지원하지 않습니다. 클라이언트에서 처리하거나 RPC를 사용하세요.</p>
<pre class="cs"><code>// 클라이언트에서 처리
const query = supabase
  .from('posts')
  .select('*');
<p>if (includeAuthor) {
query.select('<em>, users(</em>)');
}</p>
<p>const { data } = await query;</code></pre></p>
<h3 data-ke-size="size23">Q6: 순환 참조는 어떻게 처리하나요?</h3>
<p data-ke-size="size16"><b>A:</b> PostgREST는 순환 참조를 감지하고 자동으로 차단합니다. 필요하다면 명시적으로 깊이를 제한하세요.</p>
<pre class="reasonml"><code>// 무한 루프 방지를 위해 명시적으로 선택
.select(`
  id,
  name,
  parent_category:categories!parent_id(id, name)
`)
// 2단계만 가져오기</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>