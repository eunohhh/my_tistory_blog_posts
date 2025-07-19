<h2>RSC에서 QueryClient 패턴</h2>
<p>질문: prisma client 혹은 다른 여러 이런 종류 클라이언트들은 singleton 으로 쓰는 경우 많은데,<br>왜 tanstack-query server side 에서는 매번 new QueryClient() 하나유?</p>
<h3>왜 매번 새로 생성하나요?</h3>
<pre><code class="language-typescript">// 각 요청마다 독립적인 QueryClient가 필요
async function PostPage() {
  const queryClient = new QueryClient() // 서버 요청별로 새 인스턴스
<p>await queryClient.prefetchQuery({...})</p>
<p>return &lt;HydrationBoundary state={dehydrate(queryClient)}&gt;</code></pre></p>
<h3>이유</h3>
<ol>
<li><strong>서버사이드는 stateless</strong>: 각 요청이 독립적</li>
<li><strong>요청간 격리</strong>: 다른 사용자의 데이터가 섞이면 안됨</li>
<li><strong>메모리 누수 방지</strong>: 요청 완료 후 GC로 정리</li>
</ol>
<h2>Prisma vs TanStack Query 차이</h2>
<h3>Prisma (연결 풀 관리)</h3>
<pre><code class="language-typescript">// 연결은 재사용, 인스턴스는 싱글톤
const prisma = globalThis.prismaGlobal ?? new PrismaClient()</code></pre>
<h3>TanStack Query (상태 관리)</h3>
<pre><code class="language-typescript">// 각 요청마다 새로운 상태 컨텍스트
const queryClient = new QueryClient() // 매번 새로 생성이 정상!</code></pre>
<h2>클라이언트에서는 다르게</h2>
<pre><code class="language-typescript">// app/providers.tsx - 클라이언트는 싱글톤
&#39;use client&#39;
const [queryClient] = useState(() =&gt; new QueryClient()) // 한 번만 생성</code></pre>
<h2>결론</h2>
<ul>
<li>✅ <strong>RSC에서 매번 new QueryClient()</strong>: 정상 패턴</li>
<li>✅ <strong>Prisma는 싱글톤</strong>: 연결 재사용</li>
<li>✅ <strong>클라이언트는 QueryClient 싱글톤</strong>: 상태 유지</li>
</ul>
<p>TanStack Query 공식 문서에서도 RSC에서는 매번 새로 생성하라고 권장해요!<br>그렇다고 합니다...</p>