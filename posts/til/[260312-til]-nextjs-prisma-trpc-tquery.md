<h1>Next.js + tRPC + Prisma + TanStack Query, 아직 유효한 풀스택 타입-세이프 조합?</h1>
<h2 data-ke-size="size26">TL;DR</h2>
<p data-ke-size="size16">Server Action의 부상으로 tRPC가 한물갔다는 인식이 있지만, 실제로는 v11 릴리즈(2025.03)와 주간 70만+ npm 다운로드로 건재하다. 오히려 2024~2025년 연이어 터진 Next.js 보안 취약점(CVE-2025-29927, CVE-2025-66478 등)은 Server Action이 의존하는 미들웨어/RSC 프로토콜의 위험성을 드러냈고, 명시적 API 경계를 제공하는 tRPC의 아키텍처적 가치를 재확인시켜 주었다.<br /><br /></p>
<p data-ke-size="size16">이번에 사내 프로젝트를 <b>Next.js + tRPC + Prisma + TanStack Query + AWS RDS(PostgreSQL)</b> 스택으로 단기간에 구축한 결과, DB 마이그레이션부터 클라이언트 화면까지 <b>end-to-end 타입-세이프</b>하고 <b>레이어 분리가 명확한</b> 애플리케이션을 빠르게 만들 수 있었다. 특히 LLM 페어 프로그래밍에서 각 레이어가 독립적이고 예측 가능한 패턴을 가져, AI가 정확한 코드를 생성하는 데 큰 도움이 되었다.<br /><br /></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">개요</h2>
<h3 data-ke-size="size23">배경: Server Action 시대에 tRPC를 선택한 이유</h3>
<p data-ke-size="size16">Next.js App Router와 함께 Server Action이 등장하면서 tRPC는 "더 이상 필요 없다"는 의견이 커뮤니티에서 종종 보인다. Dan Abramov가 Server Action을 "bundler feature로서의 tRPC"라고 표현한 것도 이런 흐름에 힘을 실어주었다.</p>
<p data-ke-size="size16">하지만 실무에서 Server Action을 쓰다 보면 몇 가지 불편함이 체감된다.<br /><br /></p>
<p data-ke-size="size16"><b>1) 보안 우려가 현실로 드러났다.</b></p>
<p data-ke-size="size16">2025년, Next.js에서 치명적인 CVE가 연달아 공개되었다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>CVE-2025-29927</b> (CVSS 9.1): <code>x-middleware-subrequest</code> 헤더를 조작하면 미들웨어를 완전히 우회할 수 있는 취약점. Server Action의 인증/인가가 미들웨어에 의존하는 경우, 이 우회로 Server Action 엔드포인트가 그대로 노출되었다.</li>
<li><b>CVE-2025-66478</b> (CVSS 10.0): "React2Shell"로 불린 RSC Flight 프로토콜의 역직렬화 취약점. 인증 없이 원격 코드 실행(RCE)이 가능했으며, 공개 수 시간 내에 실제 공격이 관측되었다.</li>
<li><b>CVE-2024-34351</b> (CVSS 7.5): Server Action의 리다이렉트 과정에서 Host 헤더를 조작해 SSRF가 가능한 취약점.</li>
</ul>
<p data-ke-size="size16">Next.js 공식 문서에서도 "Server Action을 만들고 export하면 기본적으로 공개 HTTP 엔드포인트가 생성된다"고 명시하고 있다. 인증, 인가, 입력 검증, rate limiting 등은 모두 개발자가 직접 추가해야 한다.<br /><br /></p>
<p data-ke-size="size16"><b>2) 레이어 분리가 어렵다.</b></p>
<p data-ke-size="size16">Server Action은 컴포넌트 파일 안에 <code>"use server"</code>로 인라인 정의할 수 있어 편리하지만, 라우터 네임스페이스나 미들웨어 체인 같은 구조적 장치가 없다. 커뮤니티에서도 "Server Action을 네임스페이스로 그룹핑하기 어렵다"는 지적이 꾸준히 나온다. 오픈소스 문서 서명 플랫폼 Documenso는 Server Action에서 tRPC로 역마이그레이션하기도 했다.<br /><br /></p>
<p data-ke-size="size16"><b>3) 데이터 페칭에서의 한계.</b></p>
<p data-ke-size="size16">Server Action은 모든 요청이 POST이므로 HTTP 캐싱이 불가능하고, 같은 페이지에서 여러 Server Action을 호출하면 병렬 실행이 안 되어 페이지 로드가 느려진다. TanStack Query가 제공하는 stale-while-revalidate, optimistic update, prefetch 같은 기능도 자연스럽게 쓸 수 없다.</p>
<h3 data-ke-size="size23">이번 프로젝트의 제약 조건</h3>
<p data-ke-size="size16">이번에 만든 웹 애플리케이션은 다음과 같은 조건이 있었다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Next.js가 직접 AWS RDS(PostgreSQL)에 Prisma 어댑터를 통해 커넥션 풀을 만들어 연결해야 했다.</li>
<li>단기간 내에 완성해야 해서, 서버-클라이언트 간 타입을 프로젝트 단위로 빠르게 통일할 방법이 필요했다.</li>
<li>이전에는 Zod 스키마로 request/response 객체를 직접 검증하는 방식을 사용했지만, 이번엔 그 스키마 작성 시간조차 아끼고 싶었다.</li>
<li>LLM과의 페어 프로그래밍을 적극 활용할 계획이었으므로, AI가 추적하기 쉬운 구조가 중요했다.</li>
</ul>
<p data-ke-size="size16">이런 조건들을 종합하니 <b>tRPC + Prisma + TanStack Query</b> 조합이 답이었다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">방법</h2>
<h3 data-ke-size="size23">타입 흐름: Prisma Schema &rarr; tRPC Router &rarr; TanStack Query Hook</h3>
<p data-ke-size="size16">이 스택의 핵심은 <b>코드 생성이나 수동 타입 정의 없이</b> DB에서 UI까지 타입이 자동으로 흘러간다는 점이다.</p>
<pre class="css"><code>[Prisma Schema] &rarr; prisma generate &rarr; [TypeScript 타입]
       &darr;
[tRPC Router] &larr; ctx.prisma.post.findMany() 반환 타입 자동 추론
       &darr;
[TanStack Query Hook] &larr; api.post.getAll.useQuery() &rarr; Post[] 타입 자동 완성</code></pre>
<p data-ke-size="size16"><b><br />Prisma</b>가 DB 스키마로부터 <code>Post</code>, <code>Prisma.PostCreateInput</code>, <code>Prisma.PostWhereInput</code> 등의 TypeScript 타입을 생성한다. <b>tRPC</b> 프로시저에서 <code>ctx.prisma.post.findMany()</code>를 호출하면, 그 반환 타입이 프로시저의 output 타입으로 자동 추론된다. 클라이언트에서 <b>TanStack Query</b> 훅을 호출하면 tRPC의 타입 추론을 통해 완전히 타이핑된 데이터를 받는다.</p>
<h3 data-ke-size="size23">실천한 주요 패턴</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>PrismaClient를 tRPC context로 전달:</b> PrismaClient를 한 번만 초기화하고 context 객체에 붙여서 모든 프로시저에서 공유했다. Next.js 개발 환경에서는 <code>globalThis</code>에 저장하는 싱글턴 패턴을 적용해 핫 리로드 시 커넥션 고갈을 방지했다.</li>
<li><b>Zod validation은 tRPC 프로시저 레벨에서:</b> 입력 검증을 Prisma에 도달하기 전에 tRPC의 <code>.input()</code> 에서 Zod로 처리해, 잘못된 데이터가 DB 레이어까지 내려가지 않도록 했다.</li>
<li><b>tRPC v11의 새 TanStack Query 통합 사용:</b> 기존 tRPC 클라이언트는 <code>useQuery</code>/<code>useMutation</code>을 래핑하는 방식이라 React hooks 규칙을 위반하는 문제가 있었다. v11의 새 통합은 TanStack Query의 <code>queryOptions</code> API를 네이티브로 사용해 React Compiler와도 호환된다.</li>
<li><b><code>RouterOutputs</code> 헬퍼 타입 활용:</b> 프론트엔드에서 <code>type User = RouterOutputs['user']['getById']</code> 형태로 서버 응답 타입을 추론해, 별도의 타입 정의 파일 없이도 컴포넌트에서 정확한 타입을 사용했다.</li>
</ol>
<h3 data-ke-size="size23">AWS RDS 연결 시 주의사항</h3>
<p data-ke-size="size16">Prisma로 AWS RDS에 연결할 때 한 가지 중요한 함정이 있다. <b>AWS RDS Proxy는 Prisma와 함께 사용할 때 커넥션 풀링 이점이 없다.</b> Prisma가 모든 쿼리에 prepared statement를 사용하기 때문에 RDS Proxy가 커넥션을 고정(pin)시켜 재사용이 안 된다. Prisma 공식 문서에서도 이를 명시하고 있다.<br /><br /></p>
<p data-ke-size="size16">대안으로는 PgBouncer(같은 VPC의 EC2에서 transaction mode로 운영)나 Prisma Accelerate를 사용할 수 있다. PgBouncer 사용 시에는 connection URL에 <code>pgbouncer=true</code>를 설정하고, 마이그레이션용 별도 <code>DIRECT_URL</code>을 구성해야 한다.<br /><br /></p>
<p data-ke-size="size16">이번 프로젝트에서는 Next.js가 Prisma의 <code>@prisma/adapter-pg</code>를 통해 직접 RDS에 붙는 구조를 사용했다. Prisma 7부터는 Rust 쿼리 엔진이 사라지고 TypeScript 기반 쿼리 컴파일러로 대체되면서 번들 크기가 약 90% 줄었다(14MB &rarr; 1.6MB). Pool 설정은 어댑터에서 직접 한다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">성과</h2>
<h3 data-ke-size="size23">1. DB migrate부터 화면까지 타입-세이프한 개발 경험</h3>
<p data-ke-size="size16">Prisma 스키마를 수정하고 <code>prisma migrate dev</code>를 실행하면, 타입 변경이 tRPC 라우터를 거쳐 프론트엔드 훅까지 자동으로 전파된다. 필드명을 바꾸거나 nullable을 변경하면 관련된 모든 곳에서 TypeScript 컴파일 에러가 발생해서, 런타임에 발견하는 대신 개발 시점에 잡을 수 있었다.</p>
<h3 data-ke-size="size23">2. TanStack Query와의 궁합</h3>
<p data-ke-size="size16">tRPC v11의 새 TanStack Query 통합 덕분에 캐싱, invalidation, optimistic update가 자연스럽게 작동했다. 기존에 Zod + fetch로 직접 관리하던 서버 상태를 TanStack Query의 선언적 패턴으로 대체하니 보일러플레이트가 크게 줄었다. 특히 목록 페이지에서 필터링/정렬/페이지네이션을 처리할 때, <b>tRPC의 query key가 TanStack Query의 캐시 키와 자연스럽게 맞물려 별도 key 설계가 필요 없었다.</b></p>
<h3 data-ke-size="size23">3. LLM 페어 프로그래밍에 유리한 구조</h3>
<p data-ke-size="size16">이 스택이 AI 코딩 어시스턴트와 특히 잘 맞는다고 느꼈는데, 그 이유는 세 가지다.<br /><br /></p>
<p data-ke-size="size16"><b>레이어별 독립적 컨텍스트 제공이 가능하다.</b> Prisma 스키마를 보여주면 데이터 모델링, tRPC 라우터를 보여주면 API 로직, TanStack Query 훅을 보여주면 UI 로직에 집중하게 할 수 있다. 각 레이어의 패턴이 일관적이므로 AI의 컨텍스트 윈도우를 효율적으로 사용할 수 있다.<br /><br /></p>
<p data-ke-size="size16"><b>타입 체계가 AI의 실수를 자동으로 잡아준다.</b> GitHub의 연구에 따르면 LLM이 생성한 코드의 컴파일 에러 중 94%가 타입 체크 실패라고 한다. Prisma &rarr; tRPC &rarr; TanStack Query로 이어지는 end-to-end 타입 흐름이 이런 에러를 즉시 잡아준다. AI가 생성한 코드가 타입 체크를 통과하면, 상당 부분 정확한 코드라고 신뢰할 수 있는 "검증 루프"가 형성된다.<br /><br /></p>
<p data-ke-size="size16"><b>선언적이고 예측 가능한 패턴이다.</b> Prisma의 선언적 스키마, tRPC의 라우터 프로시저 + Zod 검증, TanStack Query의 훅 패턴은 모두 정형화되어 있다. Prisma 공식 블로그에서도 PSL(Prisma Schema Language)이 LLM과 AI 도구가 스키마를 생성하고 수정하기 쉽도록 설계되었다고 밝히고 있다. 실제로 Prisma는 Cursor, Windsurf, GitHub Copilot 연동 가이드와 MCP 서버까지 공식 제공한다.</p>
<h3 data-ke-size="size23">4. 단점: Prisma의 쿼리 복잡성</h3>
<p data-ke-size="size16">솔직히 불편했던 부분도 있다. WHERE 절이 복잡해지는 경우, 특히 여러 릴레이션을 넘나드는 필터링에서 Prisma의 쿼리 코드가 상당히 장황해진다. <code>some</code>, <code>is</code>, <code>every</code> 같은 nested relation 필터를 중첩하다 보면 가독성이 떨어진다. 이건 tRPC의 문제가 아니라 Prisma의 <code>findMany</code> 등이 JOIN이 많아질수록 복잡하게 보이는 특성이다.<br /><br /></p>
<p data-ke-size="size16">다만 탈출구는 있다. Prisma의 <b>TypedSQL</b>(v5.19.0+)을 사용하면 <code>.sql</code> 파일에 직접 SQL을 작성하면서도 타입 안전성을 유지할 수 있다. 또한 <b>relation load strategy</b>에서 <code>relationLoadStrategy: 'join'</code> 옵션을 사용하면 PostgreSQL의 LATERAL JOIN을 활용해 별도 쿼리 대신 단일 JOIN 쿼리로 처리할 수도 있다. 커뮤니티의 합의는 "90%의 쿼리는 Prisma Client로, 나머지 10%의 복잡한 쿼리는 raw SQL 또는 TypedSQL로" 하는 것이 현실적이라는 것이다.<br /><br /></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">참고자료</h2>
<h3 data-ke-size="size23">tRPC</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://trpc.io/blog/announcing-trpc-v11">Announcing tRPC v11</a> &mdash; v11 릴리즈 공식 블로그</li>
<li><a href="https://trpc.io/blog/introducing-tanstack-react-query-client">Introducing the new TanStack React Query integration</a> &mdash; 새 TanStack Query 통합 소개</li>
<li><a href="https://trpc.io/blog/trpc-actions">Using Server Actions with tRPC</a> &mdash; tRPC에서 Server Action을 함께 사용하는 방법</li>
<li><a href="https://www.npmjs.com/package/@trpc/server">@trpc/server npm</a> &mdash; npm 패키지 (다운로드 수 확인)</li>
</ul>
<h3 data-ke-size="size23">Next.js 보안 취약점</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass">CVE-2025-29927 기술 분석 (ProjectDiscovery)</a> &mdash; 미들웨어 우회 취약점</li>
<li><a href="https://vercel.com/blog/postmortem-on-next-js-middleware-bypass">Postmortem on Next.js Middleware bypass (Vercel)</a> &mdash; Vercel 공식 포스트모템</li>
<li><a href="https://nextjs.org/blog/CVE-2025-66478">Security Advisory: CVE-2025-66478 (Next.js)</a> &mdash; React2Shell 보안 권고</li>
<li><a href="https://aws.amazon.com/blogs/security/china-nexus-cyber-threat-groups-rapidly-exploit-react2shell-vulnerability-cve-2025-55182/">React2Shell 취약점 AWS 분석</a> &mdash; CVE-2025-55182 실제 공격 사례</li>
</ul>
<h3 data-ke-size="size23">Server Action vs tRPC 비교</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://github.com/vercel/next.js/discussions/68155">Server Actions and Security &mdash; GitHub Discussion</a> &mdash; Server Action 보안 우려 커뮤니티 논의</li>
<li><a href="https://documenso.com/blog/removing-server-actions">Removing Server Actions &rarr; tRPC (Documenso)</a> &mdash; Documenso의 Server Action &rarr; tRPC 역마이그레이션 사례</li>
<li><a href="https://dev.to/ravicoding/why-i-migrated-from-server-actions-to-trpc-de2">Why I Migrated from Server Actions to tRPC (DEV.to)</a> &mdash; 개발자 경험 비교</li>
</ul>
<h3 data-ke-size="size23">Prisma + AWS</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://www.prisma.io/docs/orm/prisma-client/deployment/caveats-when-deploying-to-aws-platforms">Caveats when deploying to AWS platforms (Prisma)</a> &mdash; AWS 배포 시 주의사항</li>
<li><a href="https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer">Configure Prisma Client with PgBouncer</a> &mdash; PgBouncer 설정 가이드</li>
<li><a href="https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool">Connection pool (Prisma)</a> &mdash; 커넥션 풀 관리</li>
</ul>
<h3 data-ke-size="size23">Prisma 쿼리 &amp; TypedSQL</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://www.prisma.io/blog/announcing-typedsql-make-your-raw-sql-queries-type-safe-with-prisma-orm">Announcing TypedSQL (Prisma)</a> &mdash; TypedSQL 소개</li>
<li><a href="https://www.prisma.io/blog/database-vs-application-demystifying-join-strategies">Database vs Application: Demystifying JOIN Strategies (Prisma)</a> &mdash; JOIN 전략 비교</li>
<li><a href="https://www.prisma.io/blog/prisma-schema-language-the-best-way-to-define-your-data">Prisma Schema Language: The Best Way to Define Your Data</a> &mdash; PSL의 AI 친화적 설계</li>
</ul>
<h3 data-ke-size="size23">LLM 페어 프로그래밍 &amp; AI-friendly 아키텍처</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://blog.logrocket.com/ai-ready-frontend-architecture-guide/">A developer's guide to designing AI-ready frontend architecture (LogRocket)</a> &mdash; AI 친화적 프론트엔드 설계</li>
<li><a href="https://yuv.ai/blog/why-ai-is-pushing-us-all-toward-typescript-and-why-that-s-good">Why AI Is Pushing Us All Toward TypeScript (YUV.AI)</a> &mdash; TypeScript와 AI의 시너지</li>
<li><a href="https://ard.ninja/blog/2026-03-07-the-ai-friendly-tech-stack-i-like-right-now/">The AI-Friendly Tech Stack I Like Right Now</a> &mdash; tRPC/TS/Postgres를 AI와 함께 사용한 실전 후기</li>
</ul>