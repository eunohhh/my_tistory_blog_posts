<h2 data-ke-size="size26">  문제 정의</h2>
<p data-ke-size="size16">프로젝트에서 <b>OpenAI의 image edit 기능을 활용한 이미지 생성</b>을 구현하던 중,<br />Amplify 환경에서 API 요청이 <b>504 Gateway Timeout</b> 에러를 반환하는 문제에 직면했습니다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Vercel 배포 환경에서는 요청이 정상적으로 처리되지만,</li>
<li>Amplify에서는 Lambda@Edge의 timeout 제한으로 인해 <b>SSR 함수가 29초를 넘기면 강제 종료</b></li>
<li>특히 이미지 생성은 평균 40초 이상 걸리는 작업이라, Amplify 환경에서 실행 불가능</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">  해결 과정</h2>
<h3 data-ke-size="size23">1. <b>구조 분리 (백엔드 역할 Next.js 앱 도입)</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이미지 생성 로직을 별도의 Next.js 앱에 분리해 &lsquo;백엔드 역할&rsquo;로 사용</li>
<li>클라이언트는 이 앱에 요청을 보내고, 실제 작업은 해당 앱에서 수행</li>
</ul>
<h3 data-ke-size="size23">2. <b>Polling 방식 적용</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>첫 번째 API는 클라이언트 요청을 받아 <b>즉시 202 응답</b>을 반환하고,<br />내부적으로 두 번째 API를 <b>fire-and-forget</b> 방식으로 호출</li>
<li>두 번째 API는 실제로 시간이 오래 걸리는 <b>OpenAI image edit 요청을 수행하고 DB에 결과 저장</b></li>
</ul>
<h3 data-ke-size="size23">3. <b>클라이언트에서 Polling 처리</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>클라이언트는 202 응답을 받은 후 <b>15초 대기</b>, 이후 <b>5초 간격으로 최대 20회 status 확인</b></li>
<li>결과가 <code>completed</code> 상태가 되면 사용자에게 결과 페이지로 전환</li>
</ul>
<h3 data-ke-size="size23">4. <b>기타 개선 사항</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Amplify에서 SSR을 유도하기 위해 <code>middleware.ts</code> 및 <code>app/api/.../route.ts</code> 외에<br /><code>pages/api/ping.ts</code>도 추가하여 SSR Lambda가 확실히 생성되도록 처리</li>
<li>
<div><del>fire-and-forget 호출 시 <code>.catch()</code>로 예외 누락 방지</del></div>
</li>
<li>이건 try catch 든 .catch 든 쓰면 fire-and-forget 이 안되는 것 확인!!!</li>
<li>아래처럼 꼼수로 처리했음</li>
</ul>
<pre class="typescript"><code>import api from "@/apis/axios";
import type { GenResponse } from "@/types/iffy.types";
import { type NextRequest, NextResponse } from "next/server";
<p>function awaitTime(ms: number) {
return new Promise((resolve) =&gt; setTimeout(resolve, ms));
}</p>
<p>export async function GET(
request: NextRequest,
): Promise&lt;NextResponse&lt;GenResponse&gt;&gt; {</p>
<pre><code>const searchParams = request.nextUrl.searchParams;
const query = searchParams.get(&quot;id&quot;);


if (!query) {
    return NextResponse.json(
        { status: &quot;error&quot;, message: &quot;No id provided&quot; },
        { status: 400 },
    );
}

// 원본 요청에서 쿠키 헤더 가져오기
const cookieHeader = request.headers.get(&quot;cookie&quot;);

// Fire-and-Forget 요청 시 쿠키 헤더 전달
api.get(`/api/backtask?id=${query}`, {
    headers: {
        ...(cookieHeader &amp;amp;&amp;amp; { Cookie: cookieHeader }),
    },
});

// 여기가 꼼수부분.. 
// await 을 하지 않으니 api.get 이 되기도 전에 
// 리스폰스로 넘어가버려 실행이 안되는 문제 임시 해결용
// upstash 등을 쓰라고 하지만.. 간단히 처리해보고 싶었기 때문...
await awaitTime(1000);

return NextResponse.json(
    { status: &quot;success&quot;, message: &quot;IFFY 생성 요청 전달&quot; },
    { status: 202 },
);
</code></pre>
<p>}</code></pre></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">  배운 점 &amp; 인사이트</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Amplify의 SSR 구조는 <b>Lambda@Edge + CloudFront 기반</b>이며, <b>timeout은 최대29초로 고정</b>되어 있음<br />&rarr; 장시간 작업은 구조적으로 불가능하며, 우회 전략 필요</li>
<li><b>Polling 구조</b>는 Amplify와 같은 서버리스 환경에서 유용한 비동기 처리를 가능하게 함</li>
<li>OpenAI image edit API는 아직 응답 후 완료 통지를 지원하지 않아,<br />webhook이나 status 확인 API가 생기면 개선 여지가 큼</li>
<li>Amplify는 cold start가 <b>Vercel보다 다소 느리게 체감</b>됨 &rarr; 실시간성이 중요한 앱에서는 고려 필요</li>
<li>사실 이 모든게 프론트만 가지고 아무튼 해볼려는 일종의 트릭이므로 별로 좋은 전략은 아님..</li>
<li>poliing 자체도 계속 디비를 확인하는 구조로 되어 있는데, supabase 사용중인 그냥 realtime 쓰는 것도 좋을듯</li>
</ul>