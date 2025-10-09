<h4 data-ke-size="size20">Hasura 트랜잭션 처리: Actions와 Functions 활용하기</h4>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">  TL;DR (한 줄 요약)</h2>
<p data-ke-size="size16">Hasura v2는 <b>단일 mutation 내부는 자동 트랜잭션</b>이지만,</p>
<p data-ke-size="size16">복잡한 로직은 <b>Actions</b> 또는 <b>PostgreSQL Functions</b>로 처리해야 합니다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">  핵심 정리</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>단일 GraphQL mutation</b>은 자동으로 트랜잭션 처리</li>
<li><b>여러 mutation을 별도 호출</b>하면 트랜잭션 아님</li>
<li><b>Hasura Actions</b>로 커스텀 비즈니스 로직 구현 (추천)</li>
<li><b>PostgreSQL Functions (RPC)</b>로 DB 레벨 트랜잭션 처리</li>
<li><b>Apollo Client의 배치</b>는 서버 트랜잭션이 아님</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">1. Hasura의 트랜잭션 동작 방식</h2>
<h3 data-ke-size="size23">✅ 자동 트랜잭션 (보장됨)</h3>
<pre class="yaml"><code># 하나의 mutation 요청 = 하나의 트랜잭션
mutation CreateOrderWithItems {
  # 1. 주문 생성
  insert_orders_one(object: { total: 10000 }) {
    id
  }
<h1>2. 주문 항목 생성</h1>
<p>insert_order_items(objects: [
{ product_id: &quot;prod-1&quot;, quantity: 2 }
]) {
affected_rows
}
}</p>
<h1>✅ 둘 다 성공 or 둘 다 실패</code></pre></h1>
<h3 data-ke-size="size23">❌ 트랜잭션 아님 (주의!)</h3>
<pre class="aspectj"><code>// Apollo Client에서 별도 호출
await client.mutate({ mutation: CREATE_ORDER });
await client.mutate({ mutation: CREATE_ITEMS });
// ❌ 첫 번째 성공, 두 번째 실패 &rarr; 롤백 안 됨!</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">2. 자동 트랜잭션 (단일 Mutation)</h2>
<h3 data-ke-size="size23">패턴 1: 중첩 Insert (1:N 관계)</h3>
<pre class="less"><code>mutation CreatePostWithComments {
  insert_posts_one(
    object: {
      title: "새 게시글"
      content: "내용"
      comments: {
        data: [
          { text: "댓글1" }
          { text: "댓글2" }
        ]
      }
    }
  ) {
    id
    title
    comments {
      id
      text
    }
  }
}</code></pre>
<p data-ke-size="size16"><b>동작:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>posts</code> INSERT 성공 + <code>comments</code> INSERT 성공 &rarr; 모두 커밋</li>
<li><code>comments</code> INSERT 실패 &rarr; 모두 롤백</li>
</ul>
<h3 data-ke-size="size23">패턴 2: 여러 테이블 동시 업데이트</h3>
<pre class="less"><code>mutation UpdateUserAndProfile {
  # 하나의 mutation에 포함되면 트랜잭션!
  update_users_by_pk(
    pk_columns: { id: "user-1" }
    _set: { name: "새이름" }
  ) {
    id
  }
<p>update_profiles_by_pk(
pk_columns: { user_id: &quot;user-1&quot; }
_set: { status: &quot;active&quot; }
) {
user_id
}
}</code></pre></p>
<h3 data-ke-size="size23">패턴 3: Upsert (Insert or Update)</h3>
<pre class="bash" data-ke-language="bash"><code>mutation UpsertUser {
  insert_users_one(
    object: { id: "user-1", name: "blahblah" }
    on_conflict: {
      constraint: users_pkey
      update_columns: [name]
    }
  ) {
    id
    name
  }
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">3. 해결책 1: Hasura Actions</h2>
<h3 data-ke-size="size23">Actions란?</h3>
<p data-ke-size="size16">Hasura Actions는 <b>커스텀 비즈니스 로직을 REST/GraphQL 엔드포인트</b>로 구현하는 기능.</p>
<h3 data-ke-size="size23">사용 시기</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>복잡한 비즈니스 로직</li>
<li>외부 API 호출 필요</li>
<li>트랜잭션 + 복잡한 검증</li>
<li>Hasura mutation만으로 불가능한 경우</li>
</ul>
<h3 data-ke-size="size23">구현 예제: Next.js + Actions</h3>
<h4 data-ke-size="size20">1단계: Next.js API Route 생성</h4>
<pre class="dart"><code>// app/api/hasura/create-order/route.ts
import { Pool } from 'pg';
<p>const pool = new Pool({
connectionString: process.env.DATABASE_URL
});</p>
<p>export async function POST(request: Request) {
const { input, session_variables } = await request.json();
const { user_id, items } = input;</p>
<p>const client = await pool.connect();</p>
<p>try {
await client.query('BEGIN');</p>
<pre><code>// 1. 재고 확인 및 차감
for (const item of items) {
  const stock = await client.query(
    'SELECT quantity FROM products WHERE id = $1 FOR UPDATE',
    [item.product_id]
  );

  if (stock.rows[0].quantity &amp;lt; item.quantity) {
    throw new Error(`재고 부족: ${item.product_id}`);
  }

  await client.query(
    'UPDATE products SET quantity = quantity - $1 WHERE id = $2',
    [item.quantity, item.product_id]
  );
}

// 2. 주문 생성
const orderResult = await client.query(
  'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id',
  [user_id, items.reduce((sum, i) =&amp;gt; sum + i.price * i.quantity, 0)]
);

const orderId = orderResult.rows[0].id;

// 3. 주문 항목 생성
for (const item of items) {
  await client.query(
    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
    [orderId, item.product_id, item.quantity, item.price]
  );
}

await client.query('COMMIT');

return Response.json({
  order_id: orderId,
  success: true
});
</code></pre>
<p>} catch (error) {
await client.query('ROLLBACK');
return Response.json(
{ message: error.message },
{ status: 400 }
);
} finally {
client.release();
}
}</code></pre></p>
<h4 data-ke-size="size20">2단계: Hasura Console에서 Action 정의</h4>
<pre class="routeros"><code># Hasura Console &rarr; Actions &rarr; Create
<p>type Mutation {
createOrder(
user_id: uuid!
items: [OrderItemInput!]!
): CreateOrderOutput
}</p>
<p>input OrderItemInput {
product_id: uuid!
quantity: Int!
price: Int!
}</p>
<p>type CreateOrderOutput {
order_id: uuid!
success: Boolean!
}</code></pre></p>
<p data-ke-size="size16"><b>Handler URL:</b> <code>https://your-domain.com/api/hasura/create-order</code></p>
<h4 data-ke-size="size20">3단계: Apollo Client에서 사용</h4>
<pre class="reasonml"><code>// hooks/useCreateOrder.ts
import { gql, useMutation } from '@apollo/client';
<p>const CREATE_ORDER = gql<code>  mutation CreateOrder($user_id: uuid!, $items: [OrderItemInput!]!) {     createOrder(user_id: $user_id, items: $items) {       order_id       success     }   }</code>;</p>
<p>export function useCreateOrder() {
const [createOrder, { loading, error }] = useMutation(CREATE_ORDER);</p>
<p>return {
createOrder,
loading,
error
};
}</code></pre></p>
<pre class="javascript"><code>// components/CheckoutButton.tsx
'use client';

import { useCreateOrder } from '@/hooks/useCreateOrder';

export function CheckoutButton({ userId, items }) {
  const { createOrder, loading } = useCreateOrder();

  const handleCheckout = async () =&gt; {
    try {
      const { data } = await createOrder({
        variables: {
          user_id: userId,
          items: items.map(item =&gt; ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      });

      if (data.createOrder.success) {
        alert('주문이 완료되었습니다!');
      }
    } catch (error) {
      alert('주문 실패: ' + error.message);
    }
  };

  return (
    &lt;button onClick={handleCheckout} disabled={loading}&gt;
      {loading ? '처리 중...' : '주문하기'}
    &lt;/button&gt;
  );
}</code></pre>
<h3 data-ke-size="size23">Actions의 장점</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>✅ 복잡한 비즈니스 로직을 TypeScript/JavaScript로 작성</li>
<li>✅ 외부 API 호출 가능 (결제, 이메일 등)</li>
<li>✅ 트랜잭션 완전 제어</li>
<li>✅ 에러 처리 자유롭게 구현</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">4. 해결책 2: PostgreSQL Functions</h2>
<h3 data-ke-size="size23">Functions (RPC) 사용</h3>
<p data-ke-size="size16">Supabase와 동일한 방식!</p>
<pre class="pgsql"><code>-- Hasura Console &rarr; Data &rarr; SQL
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_user_id UUID,
  p_items JSONB
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
BEGIN
  -- 주문 생성
  INSERT INTO orders (user_id, total)
  VALUES (
    p_user_id,
    (SELECT SUM((item-&gt;&gt;'quantity')::INT * (item-&gt;&gt;'price')::INT)
     FROM jsonb_array_elements(p_items) AS item)
  )
  RETURNING id INTO v_order_id;
<p>-- 주문 항목 생성
FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
LOOP
INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES (
v_order_id,
(v_item-&gt;&gt;'product_id')::UUID,
(v_item-&gt;&gt;'quantity')::INT,
(v_item-&gt;&gt;'price')::INT
);
END LOOP;</p>
<p>RETURN json_build_object('order_id', v_order_id, 'success', true);</p>
<p>EXCEPTION
WHEN OTHERS THEN
RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;</code></pre></p>
<h3 data-ke-size="size23">Hasura에서 Function 추가</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Data &rarr; Schema &rarr; public &rarr; Functions &rarr; Track</b></li>
<li>Function이 GraphQL에 자동 추가됨</li>
</ol>
<h3 data-ke-size="size23">GraphQL로 호출</h3>
<pre class="less"><code>mutation CreateOrder {
  create_order_with_items(
    args: {
      p_user_id: "user-1"
      p_items: [
        { product_id: "prod-1", quantity: 2, price: 10000 }
        { product_id: "prod-2", quantity: 1, price: 5000 }
      ]
    }
  ) {
    order_id
    success
  }
}</code></pre>
<h3 data-ke-size="size23">Functions의 장점</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>✅ 데이터베이스 레벨 트랜잭션</li>
<li>✅ SQL 최적화 가능</li>
<li>✅ 별도 서버 불필요</li>
<li>✅ Hasura 권한 시스템 통합</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">5. Apollo Client와 트랜잭션</h2>
<h3 data-ke-size="size23">❌ 배치는 트랜잭션이 아님</h3>
<pre class="javascript"><code>import { ApolloLink } from '@apollo/client';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
<p>// 여러 요청을 묶어서 보내기
const batchLink = new BatchHttpLink({
uri: 'https://your-hasura.hasura.app/v1/graphql',
batchMax: 5,
batchInterval: 20
});</p>
<p>// 하지만 서버에서는 별도 트랜잭션!
await client.mutate({ mutation: MUTATION_1 });
await client.mutate({ mutation: MUTATION_2 });
// ❌ 네트워크는 최적화되지만 트랜잭션 아님</code></pre></p>
<h3 data-ke-size="size23">✅ 단일 mutation으로 작성</h3>
<pre class="dts"><code># 하나의 mutation에 모두 포함
mutation BatchUpdate {
  update1: update_users(...) { id }
  update2: update_profiles(...) { user_id }
}</code></pre>
<h3 data-ke-size="size23">Optimistic Updates (낙관적 업데이트)</h3>
<pre class="moonscript"><code>const [updateUser] = useMutation(UPDATE_USER, {
  optimisticResponse: {
    update_users_by_pk: {
      __typename: 'users',
      id: userId,
      name: newName
    }
  },
  onError: (error) =&gt; {
    // 실패 시 UI 자동 롤백
    console.error('Update failed:', error);
  }
});</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">6. 패턴 비교 {#6-패턴-비교}</h2>
<h3 data-ke-size="size23">방법별 비교</h3>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>방법</th>
<th>트랜잭션</th>
<th>복잡도</th>
<th>유연성</th>
<th>추천 상황</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>단일 Mutation</b></td>
<td>✅</td>
<td>낮음</td>
<td>낮음</td>
<td>간단한 관계 데이터</td>
</tr>
<tr>
<td><b>Actions (Next.js)</b></td>
<td>✅</td>
<td>중간</td>
<td>높음</td>
<td>복잡한 로직, 외부 API</td>
</tr>
<tr>
<td><b>PostgreSQL Functions</b></td>
<td>✅</td>
<td>중간</td>
<td>중간</td>
<td>DB 중심 로직</td>
</tr>
<tr>
<td><b>별도 Mutation</b></td>
<td>❌</td>
<td>낮음</td>
<td>높음</td>
<td>사용 금지 (트랜잭션 X)</td>
</tr>
</tbody>
</table>
<h3 data-ke-size="size23">실전 가이드</h3>
<pre class="less"><code>// ✅ 간단한 INSERT &rarr; 단일 mutation
mutation {
  insert_posts_one(object: { 
    title: "제목"
    comments: { data: [{ text: "댓글" }] }
  }) { id }
}
<p>// ✅ 복잡한 로직 → Actions</p>
<ul>
<li>재고 확인 + 주문 생성 + 결제 + 이메일</li>
<li>Next.js API Route로 구현</li>
</ul>
<p>// ✅ DB 중심 로직 → Functions</p>
<ul>
<li>집계, 통계 계산</li>
<li>복잡한 데이터 변환</li>
<li>PostgreSQL Function으로 구현</code></pre></li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">  결론</h2>
<h3 data-ke-size="size23">핵심 기억사항</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>하나의 mutation = 하나의 트랜잭션</b>: Hasura의 기본 동작</li>
<li><b>복잡한 로직은 Actions</b>: Next.js와 조합이 최고</li>
<li><b>DB 중심 로직은 Functions</b>: Supabase와 동일한 패턴</li>
<li><b>Apollo Client 배치 &ne; 트랜잭션</b>: 착각하지 말 것</li>
</ul>
<h3 data-ke-size="size23">Hasura vs Supabase 트랜잭션 비교</h3>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>측면</th>
<th>Hasura</th>
<th>Supabase</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>기본 방식</b></td>
<td>GraphQL Mutation</td>
<td>RPC Functions</td>
</tr>
<tr>
<td><b>자동 트랜잭션</b></td>
<td>✅ 단일 mutation</td>
<td>❌ 없음</td>
</tr>
<tr>
<td><b>커스텀 로직</b></td>
<td>Actions</td>
<td>Route Handler</td>
</tr>
<tr>
<td><b>DB Functions</b></td>
<td>✅ Track</td>
<td>✅ RPC</td>
</tr>
<tr>
<td><b>학습 곡선</b></td>
<td>GraphQL 익숙하면 쉬움</td>
<td>SQL 익숙하면 쉬움</td>
</tr>
</tbody>
</table>
<h3 data-ke-size="size23">권장 아키텍처</h3>
<pre class="less"><code>간단한 CRUD
&darr;
단일 GraphQL Mutation (자동 트랜잭션)
<p>복잡한 비즈니스 로직
↓
Hasura Actions (Next.js API Route)</p>
<p>DB 중심 로직
↓
PostgreSQL Functions (RPC)</code></pre></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">  참고 자료</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://hasura.io/docs/latest/actions/overview/">Hasura Actions 공식 문서</a></li>
<li><a href="https://hasura.io/docs/latest/schema/postgres/custom-functions/">PostgreSQL Functions in Hasura</a></li>
<li><a href="https://www.apollographql.com/docs/react/">Apollo Client Transactions</a></li>
<li><a href="https://hasura.io/docs/3.0/getting-started/overview/">Hasura v3 (DDN) 변경사항</a></li>
</ul>