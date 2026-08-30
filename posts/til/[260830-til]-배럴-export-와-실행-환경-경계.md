<h3 data-ke-size="size23">export * 한 줄이 sharp를 브라우저 번들로 실어 날랐다</h3>
<p data-ke-size="size16"><code>pnpm build</code>가 6개 에러로 죽었다.<br />겉보기엔 두 종류였다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">하나는 이미지 라이브러리 sharp가 브라우저 청크에 못 들어간다는 것,<br />다른 하나는 <code>next/headers</code>를 클라이언트에서 쓰면 안 된다는 것.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">서로 상관없어 보이는 두 문제가 동시에 터졌다고 생각했다.</p>
<p data-ke-size="size16"><b>전부 한 줄에서 나온 파편이었다.</b></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">1. 그 한 줄</h2>
<p data-ke-size="size16">서버 액션에서 쓸 함수를 하나 만들고, 같은 디렉토리의 배럴에 얹었다.</p>
<pre class="clean"><code>// src/hooks/queries/auth/index.ts
export * from "./start-provider-login-server";  // &larr; 이것
export * from "./use-provider-login-start-query";
export * from "./useUserQuery";</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>start-provider-login-server.ts</code>는 tRPC caller를 직접 부르는 <b>서버 전용</b> 함수다.<br />그리고 <code>src/hooks/queries/auth/</code>는 <b>클라이언트 훅</b> 디렉토리다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">아무 생각없이 서버 함수를 hooks 아래에 만들고 있었다...</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">더 큰 문제는 이 배럴을 <code>"use client"</code>인 파일이 import하고 있었다는 것이다.<br />그것도 <code>useUserQuery</code> <b>하나</b> 때문에.</p>
<pre class="clean"><code>// src/contexts/auth-context.tsx
"use client";
import { useUserQuery } from "@/hooks/queries/auth";</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>export *</code>는 "필요한 것만 골라 가져간다"가 아니다.<br />배럴 파일 전체가 그래프에 들어온다. 그래서 이렇게 이어졌다.</p>
<pre class="crystal"><code>admin/****/layout.tsx (Server)
 &rarr; AdminHeader.tsx ("use client")
   &rarr; useAuth &rarr; auth-context.tsx
     &rarr; @/hooks/queries/auth          &larr; 배럴
       &rarr; start-provider-login-server.ts   &larr; 서버 모듈
         &rarr; auth-router.ts
           ├&rarr; @/utils/supabase/server  &rarr; next/headers         
           ├&rarr; trpc/init &rarr; supabase/admin &rarr; "server-only"       
           └&rarr; @/lib/crud (또 배럴) &rarr; projects.ts &rarr; sharp       </code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>useUserQuery</code> 하나를 가져오려다 tRPC 라우터 전체와 그 뒤의 이미지 처리 파이프라인까지<br />브라우저 번들로 끌고 온 것이다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">2. 진단이 오래 걸린 이유</h2>
<p data-ke-size="size16">원인은 한 줄인데 찾는 데 한참 걸렸다. 세 가지가 방해했다.</p>
<h3 data-ke-size="size23">에러 메시지가 거짓말을 한다</h3>
<pre class="subunit"><code>Error: You're importing a module that depends on "next/headers".
This API is only available in Server Components in the App Router,
but you are using it in the Pages Router.</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>이 레포에 Pages Router는 없다.</b><br />Turbopack이 이 메시지를 쓸 때 "클라이언트 경계에서 임포트됨"을 저렇게 표현한다.<br />문구를 곧이 읽으면 있지도 않은 Pages Router를 찾아 헤매게 된다.</p>
<h3 data-ke-size="size23">증상이 원인보다 시끄럽다</h3>
<p data-ke-size="size16">sharp는 네이티브 <code>.node</code> 바이너리를 쓴다.<br />그래서 브라우저 청크에 들어가려는 순간 이런 게 나온다.</p>
<pre class="subunit"><code>Error: non-ecmascript placeable asset
Error: Module not found: Can't resolve 'fs'
  at detect-libc/lib/filesystem.js</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>fs</code>를 못 찾는다는 에러가 <code>detect-libc</code>라는 처음 보는 패키지에서 난다.<br />내가 쓴 코드에서 한참 멀리 떨어진 자리다.....</p>
<p data-ke-size="size16"><br />sharp 설정을 의심하며 한참 뒤졌는데, sharp는 아무 잘못이 없었다.</p>
<h3 data-ke-size="size23">고친 뒤에도 안 낫는다</h3>
<p data-ke-size="size16">원인을 고치고 다시 빌드했더니 이번엔 이게 떴다.</p>
<pre class="css"><code>TurbopackInternalError: TaskId { id: 1081640 } AssetIdent::new_inner was canceled</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">패닉 로그까지 남기며 죽길래 또 다른 문제인 줄 알았다.<br /><b>stale <code>.next</code> 캐시였다.</b> <code>rm -rf .next</code> 한 번으로 사라졌다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">교훈: <code>AssetIdent::new_inner was canceled</code>를 보면 원인 추적 전에 캐시부터 지운다.</p>
</blockquote>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">3. 트레이스를 읽는 법</h2>
<p data-ke-size="size16">Turbopack 에러에는 <code>Import traces:</code> 블록이 붙는다. 이게 진짜 정보다.</p>
<pre class="crystal"><code>Import traces:
  Client Component Browser:
    ./node_modules/.../sharp/lib/index.js
    ./src/utils/common/convertToWebP.ts
    ./src/utils/image/image-files-to-buffers.ts
    ./src/lib/crud/projects.ts
    ./src/lib/crud/index.ts
    ./src/lib/trpc/routers/auth/auth-router.ts
    ./src/hooks/queries/auth/start-provider-login-server.ts   &larr; 여기
    ./src/hooks/queries/auth/index.ts
    ./src/contexts/auth-context.tsx
    ...</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">두 가지만 기억하면 되는 것 같다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b><code>[Client Component Browser]</code> 트레이스를 아래에서 위로 읽는다.</b> 경계를 넘는 지점이 그대로 보인다.</li>
<li><b>여러 에러의 트레이스에 공통으로 등장하는 파일이 진범이다.</b></li>
</ol>
<p data-ke-size="size16">6개 에러 전부가 <code>start-provider-login-server.ts</code>를 거치고 있었다.<br />처음부터 이걸 봤으면 5분이면 끝났을 일이다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">4. 진짜 배운 것 - 이건 재발이었다</h2>
<p data-ke-size="size16">여기까지는 그냥 실수담이다.<br />뼈아픈 건 다음이다.</p>
<p data-ke-size="size16">같은 레포에 <b>내가 이미 세워둔 규칙</b>이 있었다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><code>query-provider.tsx</code>의 <code>AppRouter</code> import는 반드시 <code>import type</code>이어야 한다.<br />값 import로 바뀌면 sharp가 브라우저 번들로 끌려온다.</p>
</blockquote>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">sharp가 브라우저로 새는 경로를 한 번 발견하고, 그 <b>지점 하나</b>를 막아둔 것이다.<br />그런데 이번엔 배럴이라는 <b>다른 경로</b>로 같은 sharp가 다시 들어왔다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>새는 경로를 하나씩 막는 방식은 다음 경로를 막지 못한다.</b></p>
<p data-ke-size="size16"><br /><code>import type</code> 키워드 하나에 브라우저 번들의 안전이 걸려 있었다는 게 문제의 본질이었다.<br />그건 경계가 아니다.....</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">5. 그래서 클래스로 막았다</h2>
<h3 data-ke-size="size23"><code>server-only</code>를 세운다</h3>
<p data-ke-size="size16">sharp를 import하는 모듈 맨 위에 한 줄을 넣었다.</p>
<pre class="xl"><code>import "server-only";
<p>import sharp from &quot;sharp&quot;;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이제 같은 실수를 해도 에러가 <b>내 파일 이름으로</b> 난다.<br /><code>detect-libc</code>의 <code>Can't resolve 'fs'</code>를 읽는 대신, 내가 쓴 모듈이 막힌다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">실제로 나중에 이 가드가 발동하는 걸 목격했다.<br />디버깅용 스크립트에서 무심코 import했더니 바로 막혔다.</p>
<pre class="routeros"><code>Error: This module cannot be imported from a Client Component module.</code></pre>
<h3 data-ke-size="size23">배럴을 지웠다</h3>
<p data-ke-size="size16"><code>src/lib/crud/index.ts</code>도 같은 병을 앓고 있었다.<br />5줄짜리 <code>export *</code>가 서로 무관한 5개 도메인을 하나의 인터페이스로 노출하고 있었다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">지워도 되는지 판단하는 기준은 <b>삭제 테스트</b>였다.<br />"이 모듈을 지우면 복잡도가 어디론가 모이는가, 아니면 그냥 흩어지는가?"</p>
<p data-ke-size="size16">세어보니 이 배럴을 쓰는 곳 14군데 중 <b>13곳이 한 모듈만</b> 쓰고 있었다.</p>
<p data-ke-size="size16"><br />둘을 쓰는 건 <code>sitemap.ts</code> 하나뿐.<br />지우면 import 줄이 하나 늘어나는 곳이 딱 한 군데라는 뜻이다.</p>
<p data-ke-size="size16"><br /><b>인터페이스가 구현보다 크면, 그건 모듈이 아니라 통로다.</b></p>
<p data-ke-size="size16">가장 아팠던 건 이 줄이었다.</p>
<pre class="clean"><code>// src/lib/trpc/init.ts
import { getUserTRPC } from "../crud";   // &larr; 배럴</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>init.ts</code>는 모든 tRPC 프로시저의 뿌리다. 모든 라우터가 이걸 import한다.<br />함수 <b>하나</b>가 필요해서 배럴을 물었는데, 그 대가로 tRPC 전체가 sharp에 전이 의존하게 됐다.</p>
<p data-ke-size="size16"><code>@/lib/crud/auth</code>로 한 글자 좁히니 그 의존이 통째로 사라졌다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">6. 숫자</h2>
<p data-ke-size="size16">Next.js는 빌드할 때 라우트마다 <code>.nft.json</code>을 남긴다.<br />그 함수가 배포될 때 어떤 파일들을 싣고 가는지 적힌 파일이다. 세어봤다.</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>라우트</th>
<th>전</th>
<th>후</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>sitemap</code></td>
<td>36</td>
<td><b>0</b></td>
</tr>
<tr>
<td><code>rss.xml</code></td>
<td>36</td>
<td><b>0</b></td>
</tr>
<tr>
<td>전체 라우트 중 sharp를 싣는 수</td>
<td>7</td>
<td><b>3</b></td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">sitemap과 RSS는 이미지를 만지지 않는다.<br />그런데 sharp + libvips(약 17MB)를 함께 싣고 있었다.<br />배럴 하나 때문에.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">남은 3개는 <code>api/trpc</code>(업로드 처리), <code>labs/animate</code>, <code>labs/iffy</code>로<br />전부 sharp를 <b>실제로 쓰는</b> 라우트다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">7. 정리</h2>
<p data-ke-size="size16">배럴 export는 편의 기능처럼 보인다.<br />import 줄이 짧아지니까...<br />그런데 실제로 벌어지는 일은 달랐다ㅜㅜ</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b><code>export *</code>는 "이 파일들은 전부 같은 실행 환경에 속한다"는 선언이다.</b></p>
</blockquote>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>src/hooks/</code>라는 디렉토리 이름도 마찬가지다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">"여기 있는 건 전부 클라이언트에서 돈다"는 선언인데,<br />컴파일러는 그 선언을 검사해주지 않는다.</p>
<p data-ke-size="size16">그래서 지킬 방법은 셋뿐이다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>선언을 어기지 않는다</b> &mdash; 훅이 아닌 것을 훅 디렉토리에 두지 않는다</li>
<li><b>컴파일러가 검사하게 만든다</b> &mdash; <code>server-only</code>처럼 어기면 실패하는 장치를 세운다</li>
<li><b>애초에 선언을 하지 않는다</b> &mdash; 배럴을 안 만들고 모듈을 지명한다</li>
</ol>
<p data-ke-size="size16">나는 이번에 셋 다 못 지켰다.<br />그런데 정말로 값을 낸 건 2번이다.</p>
<p data-ke-size="size16"><br />1번과 3번은 규율이고, 규율은 잊힌다. 실제로 나는 두 달 만에 잊었다.</p>
<p data-ke-size="size16"><b>산문(주석)으로 지키던 불변식은 드리프트한다. 실행 가능한 검사로 내려야 유지된다.</b></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">덧 - 세 번 어긋난 문서</h2>
<p data-ke-size="size16">이 사건을 정리하면서 ADR을 하나 썼다.<br />"sharp를 import하는 파일은 이것들뿐이다"라는 표를 넣었다.</p>
<p data-ke-size="size16">그 표가 <b>세 번 어긋났다.</b></p>
<p data-ke-size="size16"><br />처음엔 내가 목록을 잘못 셌고, 두 번째는 리팩터링하면서 항목이 바뀌었고,<br />세 번째는 새 스크립트가 sharp를 쓰기 시작했는데 표를 안 고쳤다.</p>
<p data-ke-size="size16">결국 표를 지키는 테스트를 붙였다.</p>
<pre class="reasonml"><code>// src&middot;app&middot;scripts 에서 sharp import 를 스캔해 ADR 표와 대조한다
expect(actualSharpImporters).toEqual(documentedInAdr);</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이제 sharp를 새로 import하는 사람은 ADR도 함께 고쳐야 초록이 된다.</p>
<p data-ke-size="size16">같은 이야기의 반복이다.<br /><b>문서에 적어두는 것만으로는 지켜지지 않는다.</b></p>