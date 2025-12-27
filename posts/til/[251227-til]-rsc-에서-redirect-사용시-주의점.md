<h2 data-ke-size="size26">요약</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>클라이언트 invalidate query는 쿼리키가 같더라도, 서버(RSC)의 prefetch query 까지 무효화 하지 않는다</b>(tanstack-query)</li>
<li><b>소프트 네비게이션 전환 중 RSC 페이로드가 stale할 수 있다면, 당연히 이 값을 근거로 한 서버 redirect는 의도와 다르게 동작할 수 있다</b>(React RSC + Next.js redirect)</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">상황</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>앱 스택은 Next.js + supabase + vercel + tanstack query + axios</li>
<li>플로우는 / -&gt; /[id]/input -&gt; /[id]/review -&gt; /[id]/ready -&gt; 결제 -&gt; /[id]/loading -&gt; /my/[id]/result 로 흐르고 각각 페이지 경계를 가진다.</li>
<li>테이블에 state column은 이 플로우의 흐름을 저장하는 ENUM이다.</li>
<li>클라이언트에서, 폼 onSubmit 될 때, 다음 단계에 해당하는 state로 mutate하고 완료시 이동한다.</li>
<li>이때 mutation 에서는 onSuccess 시 invalidate-query 한다.</li>
<li>서버 컴포넌트 page.tsx 에서는 tanstack-query의 prefetch-query 를 통해 데이터를 prefetch 한다.</li>
<li>prefetch 후 state가 현재 페이지에서 렌더링하려는 state와 맞지 않다면 redirect 호출한다.</li>
</ol>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">문제</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>mutateAsync 로 await 후 success 일때 router.push 를 실행했으나 정상적으로 페이지 이동이 되지 않았음.</li>
<li>무한 fetch , fetch 는 잘 되었는데 무한 isPending , 이동은 되었으나 바로 다시 돌아옴.. 등이 낮은 확률로 발생<br />(특히, 로컬에서는 발생하지 않았으나 배포에서만 발생하는 증상 &rarr; router.prefetch 와 관련)</li>
</ol>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">해결</h2>
<p data-ke-size="size16">아래 2가지를 모두 적용한 후 문제가 해결됨</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>첫번째 해결책. 서버 컴포넌트에서 수행하던 redirect 로직을 클라이언트 컴포넌트로 이동</li>
<li>두번째 해결책. router.push 대신 window.location.href 를 사용하여 하드 네비게이션으로 변경</li>
</ol>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">원인 분석</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>TanStack Query invalidate는&nbsp;클라이언트 캐시만&nbsp;갱신한다.</b> 따라서 RSC 전환 중 dedupe / stale DB read(레이스) 등의 이유로 바뀌기 전 state를 읽을 수 있다. 이렇게 되면 RSC 의 redirect 가 발동하여 다시 이전 페이지로 돌아가게 되고 예상치 못한 결과가 발생할 수 있다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>여기에는 DB supabase 의 리전이 미국이고, vercel은 2개 리전(미국, 서울)에 배포된 문제도 개입될 소지가 있다. 미묘한 입출력 속도 차이.</li>
<li>Next.js 같은 클라이언트 &harr; 서버 섞어 비빔밥 같은 프레임워크를 다룰땐, 경계에 대해 더 깊게 생각해야 한다.</li>
<li>그런데 왜 로컬에서는 이 문제가 재현이 안되었을까 생각해보면, Next.js 로컬개발시 터보팩, HMR은 더 자주 RSC 페이로드를 만든다고 한다. 그러니까.. 돌아가는게 배포 환경과 아예 다르다고 가정해야겠다..</li>
</ul>
</li>
<li><b>하드 네비게이션은 현재 RSC 전환 컨텍스트/캐시를 다 끊고, 서버에서 처음부터 새로 렌더한다.</b> 그래서 DB state가 이미 커밋되어 있다면 최신 state로 서버 페이지가 계산되고 redirect도 올바르게 동작하게 된다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>따라서 RSC 컨텍스트를 물 흐르듯 이용하고 싶다면 window.loacation 사용은 좋은 해결책이 아닐 수 있다.</li>
</ul>
</li>
<li>더 잘 만들고 싶은 욕심때문에.. <b>Next.js 의 router.prefetch를 각 페이지 마다 적용했었던 것도 문제였다.</b> SPA가 아닌, 페이지로 구분하는 구조이기 때문에 페이지 전환을 더 매끄럽게 하고자 foresight.js + router.prefetch 를 사용했는데, 이건&hellip; flow state 형태의 앱에서는 하면 안되는 방식이었다.<br />
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>추가로 router.prefetch 를 사용할때는, 테스트는 dev 로 하면 안된다! 무조건 build 후 start 하여 테스트 해야만, 어떻게 Next router 의 prefetch 가 동작하는지 관측할 수 있다.</li>
<li>그리고, build 후 start 하여 테스트한 결과도 배포 환경과는 또 다를 수 있다. 100% 책임지지 못할 동작은 더 많은 테스트를 필요로 한다.</li>
</ul>
</li>
</ol>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">추가 선택지</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>상태 변경 + 다음 페이지 이동을 서버에서 한 번에 처리</b>한다. 서버 액션(또는 route handler)에서 state 업데이트 &rarr; redirect까지 수행하기</li>
<li>router.push 직전에 router.refresh 호출(소프트 네비게이션 유지하고 싶다면)</li>
</ol>
<hr contenteditable="false" data-ke-type="horizontalRule" data-ke-style="style1" />
<h2 style="color: #000000; text-align: start;" data-ke-size="size26">교훈</h2>
<p data-ke-size="size16">애초에 prefetch, RSC, SSR, 디버깅 편의성 등 복잡하게 생각할 것 없이 SPA로 간단하게 시작하고 정말 필요해졌을때(?) 점진적으로 적용했다면 이런일이 없었을까 생각이 들었다. 다만 다양한 케이스에 처음부터 대응하려 했던 것이고 덕분에 복잡한 문제에 대해 하나 더 배울 수 있었으니 긍정적으로 생각하려고 한다..</p>