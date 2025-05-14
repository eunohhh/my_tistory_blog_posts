<h2 data-ke-size="size26">Q1</h2>
<p data-ke-size="size16">저는 계속 RSC 와 Next.js 에서 use server 혹은 use client 지시어에 대해 정확히 무슨 일을 하는지 궁금했습니다.<br />단순하게는 use server 를 사용하면 해당 파일은 server side 가 되고, use client 를 사용하면 client side 가 되는 건가? 라고 생각했는데요. Next.js 에서는 아무것도 안쓰면 자동으로 서버 컴포넌트가 되기도 해서 정확한 의미가 궁금했어요.</p>
<p data-ke-size="size16">검색을 해보니 use server 는 사용된 모듈 내의 함수를 마치 http 엔드포인트 처럼 만들어서 클라이언트가 사용할 수 있도록 하는 것이고, use client 는 프론트엔드에서 동작할 함수(=컴포넌트)가 데이터를 서버로부터 받을 수 있게하고, 서버에서 렌더링 가능하도록 한다는 것을 알 수 있었어요.</p>
<p data-ke-size="size16">제가 이해한 바가 맞다고 할 수 있을지, 그리고 선생님의 생각도 설명해주세요.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">A1</h2>
<h3 data-ke-size="size23">1. Next.js의 기본 동작</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>지시어가 없는 모듈</b>은 자동으로 <b>서버 컴포넌트</b>로 취급됩니다.</li>
<li>브라우저로 코드를 절대 보내지 않고, 서버에서 실행된 결과(HTML + 클라이언트 참조)만 직렬화해 전송합니다.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">2. <code>"use server"</code> 가 하는 일</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>모듈 최상단에 <code>'use server'</code>를 쓰면, 그 파일의 <b>내보낸 함수(export)</b> 들이 <b>RPC(endpoint)</b> 처럼 동작하도록 바뀝니다.</li>
<li>클라이언트 코드에서처럼 호출하면, 실제로는 내부적으로 <code>fetch()</code>를 자동으로 호출해 서버에 요청을 보내고, 인자와 반환값을 직렬화/역직렬화해 줍니다.</li>
<li><code class="language-js">  import { likePost } from './backend';
  await likePost(postId);</code></li>
<li>덕분에 직접 <code>fetch</code> URL을 작성하거나, <code>JSON.stringify</code>/<code>parse</code>를 수동으로 처리할 필요가 없어집니다.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">3. <code>"use client"</code> 가 하는 일</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>모듈 최상단에 <code>'use client'</code>를 쓰면, 그 파일의 <b>내보낸 React 컴포넌트</b>가 <b>클라이언트 참조(client reference)</b> 로 변경됩니다.</li>
<li>서버 컴포넌트에서 이 컴포넌트를 임포트하면, 다음 과정을 거칩니다:
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>브라우저로 해당 모듈을 로드하는 <code>&lt;script&gt;</code> 태그 삽입</li>
<li>전달한 props로 컴포넌트를 실행하는 또 다른 <code>&lt;script&gt;</code> 태그 삽입</li>
<li>필요하다면 서버에서 미리 렌더된 HTML을 함께 보내서 하이드레이션</li>
</ol>
</li>
<li>요약하자면, <code>'use client'</code>는 <b>타입이 보장된 <code>&lt;script&gt;</code></b> 지시어와 같습니다.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">4. 단순히 &ldquo;서버 vs. 클라이언트&rdquo; 표시가 아닌 이유</h3>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">&bull; <code>'use server'</code>와 <code>'use client'</code>는 <b>코드가 어디서 실행되어야 하는지 표시</b>하는 기능이 아닙니다.<br />&bull; 대신, <b>한 환경에서 다른 환경으로 가는 문을 연다</b>고 생각하세요:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>use server</code></b>: 클라이언트 &rarr; 서버로 가는 <b>타입 안정형 RPC</b></li>
<li><b><code>use client</code></b>: 서버 &rarr; 클라이언트로 가는 <b>타입 안정형 <code>&lt;script&gt;</code></b></li>
</ul>
</blockquote>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">5. 다시 정리된 핵심</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>✅ <b>&ldquo;<code>use server</code>는 함수를 HTTP 엔드포인트처럼 보이게 만든다&rdquo;</b></li>
<li>✅ <b>&ldquo;<code>use client</code>는 UI 로직을 브라우저로 보내고 하이드레이션할 수 있게 한다&rdquo;</b></li>
<li>  <b>중요한 점</b>: 이 지시어들은 <i>실제로</i> 다른 환경에서 코드를 실행시키지 않습니다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>대신, 컴파일러가 <code>import</code>를 <b>RPC 스텁</b>이나 <b>클라이언트 참조</b>로 바꿔줄 뿐입니다.</li>
</ul>
</li>
</ul>
<p data-ke-size="size16">이렇게 하면 <b>서버와 클라이언트를 하나의 정적 분석 가능한 프로그램</b>처럼 엮어 사용할 수 있습니다!</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">Q2</h2>
<p data-ke-size="size16">use server 내의 함수들은 RPC(endpoint) 처럼 작동한다는 것이고 클라이언트에서 이를 호출하면 fetch 를 호출하는 것과 같다는 점이 인상깊네요. 그런데 저는 평소에 Next.js 를 사용하면서 use server 함수 보다는 route handler api 를 선호했어요. 왜냐하면 use server 로 작성된 함수들은 REST api 같은 느낌이 들지 않고, 뭔가 코드가 비빔밥처럼 뒤섞이는 느낌이 강했거든요. 또한 tanstack query 를 쓸 때 route handler 로 api 를 만들고 여기로 useQuery 하면 isPending 같은 여러 상태도 처리할 수 있어서 좋다고 생각했거든요. 그렇지만 use server 를 쓰면 단계가 간소화 되는 것도 사실인 것 같아요. 제 접근에 대해 평가해주세요. 어떤게 더 나은 사용일까요? 물론 요구사항과 상황에 따라 다르겠지만 선생님의 생각이 궁금해요.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">A2</h2>
<p data-ke-size="size16">다음과 같은 관점으로 비교해 볼 수 있어요.</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">1. 경로 분리 vs. 모듈 통합</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Route Handler (REST-like)</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>/api/posts/[id]</code> 식으로 URL, 메서드(GET/POST 등)가 명확히 드러납니다.</li>
<li>클라이언트 쪽 요청&middot;응답 흐름이 익숙하고, API 문서화도 쉽죠.</li>
</ul>
</li>
<li><b><code>use server</code> 함수 (RPC-like)</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>호출하는 쪽에서는 그냥 <code>await addComment(&hellip;)</code> 처럼 메서드 호출만 보이고, URL을 신경 쓸 필요가 없습니다.</li>
<li>비즈니스 로직과 UI 코드가 같은 모듈에 섞일 수 있지만, &ldquo;이 함수를 호출하면 서버로 간다&rdquo;는 의미가 더 직접적이에요.</li>
</ul>
</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">2. 상태 관리 &amp; 캐싱</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Route Handler</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>TanStack Query, SWR 같은 클라이언트-사이드 데이터 페칭 라이브러리와 자연스럽게 어울립니다.</li>
<li><code>isLoading</code>, <code>isError</code>, <code>data</code> 같은 상태를 바로 제공하니 디테일한 로딩 UX 제어가 편하죠.</li>
</ul>
</li>
<li><b><code>use server</code></b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>서버 컴포넌트에서 <code>await getPosts()</code>처럼 동기적 호출만 지원하므로, 클라이언트-사이드 로딩 스피너나 에러 바운더리를 직접 제어하기 어렵습니다.</li>
<li>대신 단계가 줄어들어 코드가 더 간결해져요.</li>
</ul>
</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">3. 타입 안전성과 리팩터링</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Route Handler</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Request/Response 스키마를 Zod 같은 스키마로 정의하고, 클라이언트 쪽에서는 타입 제너레이션을 통해 엄격하게 맞출 수 있습니다.</li>
</ul>
</li>
<li><b><code>use server</code></b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>함수 시그니처만으로도 인자&middot;반환 타입이 바로 공유되어 IDE 자동 완성과 리팩터링이 강력합니다.</li>
<li>별도 API 스키마 정의 없이도 타입이 바로 통합니다.</li>
</ul>
</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">4. 권장 시나리오</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>RESTful API 스타일을 팀원&middot;타팀과 공유하거나, 외부에 문서화해서 쓸 때</b> &rarr; <b>Route Handler</b></li>
<li><b>앱 내부에서만, UI 코드와 비즈니스 로직을 최대한 가깝게 두고 싶을 때</b> &rarr; <b><code>use server</code></b></li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">제 개인적 추천</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>새 프로젝트</b>라면, 자잘한 CRUD는 <code>use server</code>로 빠르게 시작해 보고,</li>
<li>점점 팀 규모가 커지거나 복잡도가 올라가면, <b>Route Handler</b>로 분리해 명확한 API 스펙을 유지하는 하이브리드 접근이 좋아요.</li>
</ul>
<p data-ke-size="size16">상황과 팀 문화에 맞춰 우선 작은 영역부터 시험삼아 도입해 보세요!</p>