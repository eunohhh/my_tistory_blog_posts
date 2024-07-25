<h2 data-ke-size="size26">처음 생각한 다이나믹 헤더 의사 코드</h2>
<pre class="xquery"><code>export default function Page({
 params,
 searchParams,
}: {
 params: { slug: string }
 searchParams: { [key: string]: string | string[] | undefined }
}) {
    return &lt;h1&gt;My Page&lt;/h1&gt;
}</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Next.js 에서 slug 와 query string 을 가져올 수 있는 위 코드를 사용해서</li>
<li>layout.tsx 혹은 page.tsx : (서버컴포넌트 겠죠..? 아마) 에서</li>
<li>동적으로 주소에따라 MobileHeader.tsx 컴포넌트로 넘겨주는 props 를 다르게 한다!</li>
</ul>
<h2 data-ke-size="size26">위 방법은 동적 라우팅에서만 사용가능! 따라서 middleware 설정 추가</h2>
<p data-ke-size="size16">확인해보니 위 방법은 동적 라우팅, 예를 들어 위치가 <code>/trips/[id]</code> 같은 경우에만 사용가능한 것이었습니다.</p>
<p data-ke-size="size16"><br />스태틱한 라우트에서 위와 같이 하고 콘솔에 찍어보니 params 는 빈 객체를, searchParams 는 null 을 반환합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그래서 방법을 찾은 것은, src/utils/supabase/middleware.ts 를 수정하는 방법입니다.</p>
<p data-ke-size="size16">middleware 레벨에서 pathname과 queryParams 를 헤더에 담아 보내주는것이죠.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이를 위해 먼저 middware 에서 헤더를 set 하기로 하였습니다.</p>
<pre class="cs"><code>// src/utils/supabase/middleware.ts 
<p>export async function updateSession(request: NextRequest) {
// 아래 requestHeaders set 관련 로직이, 서버컴포넌트에서 시작하자마자 주소를 알수있게 하는 로직임
// 헤더에 현재 경로 추가
const requestHeaders = new Headers(request.headers);
requestHeaders.set('x-pathname', request.nextUrl.pathname);</p>
<pre><code>// 헤더에 특정 쿼리 파리미터(funnel) 값 추가
const funnelParam = request.nextUrl.searchParams.get('funnel');
if (funnelParam) requestHeaders.set('x-funnel', funnelParam);

let supabaseResponse = NextResponse.next({
    request: {
        headers: requestHeaders
    },
});
// ... 중략 ...&lt;/code&gt;&lt;/pre&gt;
</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위와 같이 middleware 상단에 headers 를 set 하는 로직을 추가하고,<br />response 에 request { } 로 담아줍니다.</p>
<h2 data-ke-size="size26">헤더를 가져오는 유틸리티 함수</h2>
<p data-ke-size="size16">이제는 그럼 위에서 설정한 headers 를 가져오면 될 것 같습니다.</p>
<p data-ke-size="size16">매 서버컴포넌트 마다 가져오는 코드 세 줄을 써도 되긴 하지만,</p>
<p data-ke-size="size16"><br />편의와 분리를 위해 유틸리티 함수를 작성했습니다.</p>
<pre class="dart"><code>import { headers } from 'next/headers';
<p>export const getPathnameServer = () =&gt; {
const headersList = headers();
const pathname = headersList.get('x-pathname');
const queryParams = headersList.get('x-funnel');</p>
<pre><code>return { pathname, queryParams };
</code></pre>
<p>};</code></pre></p>
<p data-ke-size="size16">이 코드는 헤더에서 pathname 과 queryParams 를 가져오는 역할을 합니다.<br />각각을 리턴하며 객체 형태로 리턴합니다.</p>
<h2 data-ke-size="size26">서버컴포넌트에서 사용</h2>
<p data-ke-size="size16">이제 이 코드를 layout.tsx, page.tsx 에서 사용하면 됩니다.(주의 반드시 서버컴포넌트이어야 합니다)</p>
<pre class="jboss-cli"><code>const AuthenticatedLayout: React.FC&lt;AuthenticatedLayoutProps&gt; = ({
    children,
}) =&gt; {
    const { pathname, queryParams } = getPathnameServer();
<pre><code>// 아래 콘솔로그를 주석해제 하시면 테스트 해볼 수 있습니다.
// console.log('pathname =============&amp;gt;', pathname);
// console.log('queryParams =============&amp;gt;', queryParams);
// ...중략...&lt;/code&gt;&lt;/pre&gt;
</code></pre>
<p data-ke-size="size16">이제 이렇게 가져온 pathname, queryParams 를 사용해 mobileHeader 를 조건부 렌더링 할 수 있습니다.</p>
<h2 data-ke-size="size26">mobileHeader.tsx</h2>
<p data-ke-size="size16">이제 조건부 렌더링을 실제로 할 모바일 헤더가 필요합니다!</p>
<pre class="javascript"><code>type MobileHeaderProps = {
    title: string;
    close?: boolean;
    notification?: boolean;
    search?: boolean;
    settings?: boolean;
    edit?: boolean;
};
<p>const MobileHeader: React.FC&lt;MobileHeaderProps&gt; = ({
title,
close,
notification,
search,
settings,
edit,
}) =&gt; {
return (
&lt;header className=&quot;h-[57px] w-full flex flex-row items-center px-5&quot;&gt;
&lt;div className=&quot;w-[calc(100%/3)] flex justify-start items-center&quot;&gt;
&lt;Arrow_Back /&gt;
&lt;/div&gt;</p>
<pre><code>        &amp;lt;h1 className=&quot;w-[calc(100%/3)] text-center leading-3&quot;&amp;gt;{title}&amp;lt;/h1&amp;gt;

        &amp;lt;div className=&quot;w-[calc(100%/3)] flex justify-end items-center gap-2&quot;&amp;gt;
            {search &amp;amp;&amp;amp; &amp;lt;Search /&amp;gt;}
            {notification &amp;amp;&amp;amp; &amp;lt;Notification /&amp;gt;}
            {settings &amp;amp;&amp;amp; &amp;lt;Settings /&amp;gt;}
            {edit &amp;amp;&amp;amp; &amp;lt;span&amp;gt;수정&amp;lt;/span&amp;gt;}
            {close &amp;amp;&amp;amp; &amp;lt;Close /&amp;gt;}
        &amp;lt;/div&amp;gt;
    &amp;lt;/header&amp;gt;
);
</code></pre>
<p>};</p>
<p>export default MobileHeader;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위와 같이 단순하게 prop이 있으면 필요한 아이콘을 렌더링 하고, 없으면 안하는 그러한 컴포넌트입니다.</p>
<p data-ke-size="size16">파라미터는 다음과 같습니다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>title : string =&gt; 헤더 중앙 제목(필수)</li>
<li>close : boolean =&gt; 우측상단 x 버튼을 보여줄지말지(기본값 false)</li>
<li>notification : boolean =&gt; 우측상단 알림 버튼을 보여줄지말지(기본값 false)</li>
<li>search : boolean =&gt; 우측상단 검색돋보기 버튼을 보여줄지말지(기본값 false)</li>
<li>settings : boolean =&gt; 우측상단 세팅즈(톱니바퀴) 버튼을 보여줄지말지(기본값 false)</li>
<li>edit : boolean =&gt; 우측상단 '수정'이라는 글 버튼을 보여줄지말지(기본값 false)</li>
</ul>
<p data-ke-size="size16">이제 서버컴포넌트에서 자유롭게 사용하시면 될 것 같습니다!</p>