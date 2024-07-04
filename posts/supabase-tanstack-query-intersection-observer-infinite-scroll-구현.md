<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="800" data-origin-height="395"><span data-url="https://blog.kakaocdn.net/dn/DG5Zr/btsIgNLnSjY/5fdSpoIvxDUpxbKNPC3OJ1/img.gif" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/DG5Zr/btsIgNLnSjY/5fdSpoIvxDUpxbKNPC3OJ1/img.gif" srcset="https://blog.kakaocdn.net/dn/DG5Zr/btsIgNLnSjY/5fdSpoIvxDUpxbKNPC3OJ1/img.gif" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="800" data-origin-height="395"/></span></figure>
</p>
<h2 data-ke-size="size26">개발 환경</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>React</li>
<li>Vite</li>
<li>TypeScript</li>
</ul>
<h2 data-ke-size="size26">사용 라이브러리</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>TanStack Query</li>
<li>Supabase</li>
<li>React-Intersction-Observer</li>
</ul>
<h2 data-ke-size="size26">패키지 설치</h2>
<pre id="code_1719589521001" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>yarn add @tanstack/react-query @supabase/supabase-js react-intersection-observer</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">단, supabase 셋업은 완료된 상태로 가정함.</p>
<h2 data-ke-size="size26">데이터 fetch 함수 작성</h2>
<p data-ke-size="size16">supabase에서 어떤 데이터를 가져올 것이고, 데이터를 스크롤 한 번당 얼마나 끊어서 가져올 것인지 설정하는 함수이다.</p>
<p data-ke-size="size16">별도 컴포넌트로 작성해도 되고, useInfiniteQuery를 작성한 커스텀 훅 바로 위에서 작성해도 좋다.</p>
<p data-ke-size="size16">아니면 fetch만 모아 놓은 api.ts 같은 파일에 다른 fetch 함수들과 모아서 작성해도 좋다.</p>
<pre id="code_1719589620107" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>import supabase from '../api/supabase';
<p>export interface Sponsor {
uuid: string;
serielnumbers: string;
name: string;
datetime: string;
amounts: number;
}</p>
<p>const ITEMS_PER_PAGE = 10;</p>
<p>const fetchSponsorData = async (page: number): Promise&lt;Sponsor[]&gt; =&gt; {
const start = page * ITEMS_PER_PAGE;
const end = start + ITEMS_PER_PAGE - 1;</p>
<p>const { data, error } = await supabase
.from('bankstatement')
.select('uuid, serielnumbers, name, datetime, amounts')
.eq('transactiontype', '후원')
.order('datetime', { ascending: false })
.range(start, end);</p>
<p>if (error) {
console.error('Error fetching data:', error);
throw error;
}</p>
<p>return data ?? [];
};</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>export<span> </span>interface<span> Sponsor ...</span></b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><span>supabase에서 가져오는 컬럼의 타입을 지정한다.</span></li>
</ul>
</li>
<li><b>const ITEMS_PER_PAGE = 10;</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>한 번 스크롤이 당겨질 때 fetch로 가져올 데이터의 개수이다.</li>
<li>첫 화면에서 부터 데이터 10개를 가져온다는 것은 아니다. 첫 화면에서는 스크롤이 끝나는 곳까지 데이터를 꽉 채워서 가져온다. 즉 가져오는 데이터가 렌더링 되어서 화면을 얼마나 채우는 지에 따라 첫 데이터의 양은 달라진다.</li>
</ul>
</li>
<li><b><span>const</span> fetchSponsorData = <span>async</span> (page: <span>number</span>): <span>Promise</span>&lt;Sponsor[]&gt; =&gt; { ... }</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>page라는 페이지 번호 매개 변수를 받아서 그 페이지 번호의 데이터들을 fetch 하는 함수이다.</li>
<li>데이터를 fetch 하는 함수는 Promise를 반환하고, 제네릭으로 위에서 지정한 데이터 반환 값의 타입을 배열로 지정한다.</li>
</ul>
</li>
<li><b><span>const</span> start = page * ITEMS_PER_PAGE;</b><span>&nbsp;</span>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><span>매개 변수로 받은 page, 즉 페이지 번호를 이용해서 가져올 데이터의 시작 인덱스를 계산한다.</span></li>
<li><span>예를 들어 page에 0이 전달되면 start는 0이 되고, page가 1이면 start는 10이 된다. 그리고 page가 2가 되면 start는 20이 된다.</span></li>
<li><span>ITEMS_PER_PAGE는 맨 위에서 10으로 설정했다. (스크롤 한 번 당겨질 때 가져올 데이터 수)</span></li>
</ul>
</li>
<li><b><span>const end = start + ITEMS_PER_PAGE - 1;</span></b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><span>데이터의 마지막 인덱스를 계산한다. end는 start에서 ITEMS_PER_PAGE를 더하고 여기서 1을 뺀 값이다.</span></li>
<li><span>page가 1로 전달되어서 start가 위에서 계산을 끝내서 10이 되면 (10 + 10 - 1 = 19) 19가 된다. 즉 start 10 ~ end 19면 데이터를 10개 가져오는 게 된다.</span></li>
</ul>
</li>
<li><span>즉 위 start, end는 스크롤이 한 번 당겨질 때 가져올 데이터의 개수를 계산하는 로직이다. page라는 매개 변수는 useInfiniteQuery를 정의한 부분에서 queryFn에서 전달된다. 초기값은 0으로 설정했다. 일반적으로는 0이 아닌 다른 숫자로 건너 뛸 이유가 없다.</span></li>
</ul>
<pre id="code_1719590700885" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// useInfiniteQuery
<p>queryFn: ({ pageParam = 0 }) =&gt; fetchSponsorData(pageParam)</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>const { data, error } awiat supabase ... :</b> supabase에서 데이터를 가져오는 supabase 내장 메서드이다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>.from('bankstatement') :</b> bankstatement 데이터 테이블을 지목한다.</li>
<li><b>.select('uuid, serielnumbers, name, datetime, amounts') :</b> 그 테이블에서 이 컬럼들만 꺼내온다.</li>
<li><b>.eq('transactiontype', '후원') :</b> 그런데 조건이 있다. transactiontype 컬럼의 값이 '후원'인 것들만 위 컬럼들을 꺼내온다.</li>
<li><b>.order('datetime', { ascending: false }) :</b> datetime이라는 컬럼은 날짜가 입력된 컬럼인데, 최신 데이터가 먼저 fetch 되도록 내림차순으로 데이터를 꺼내온다.</li>
<li><b>.range(start, end) :</b> 특정 인덱스만 꺼내오는 메서드이다. start 에서 end 까지만 꺼내온다. 이 start와 end는 위에서 계산했다.</li>
</ul>
</li>
<li><b>if (error) ... :</b> API 통신 함수는 서버 오류든 어떤 오류든 항상 에러 처리를 해주어야 한다. 통신 중 에러가 발생하면 에러를 throw 던진다.</li>
<li><b>return data ?? []; :</b> 가져온 데이터가 null일 수 있으니 이런 경우 [] 빈 배열을 반환한다. 이 에러 처리를 안 하면 null 이 반환되면서 코드에서 에러가 발생한다.</li>
</ul>
<h2 data-ke-size="size26">TanStack Query 무한 스크롤 구현 (useInfiniteQuery 훅)</h2>
<p data-ke-size="size16">위에서 작성한 데이터 fetch 함수를 이용해서 TanStack Query에서 제공하는 useInfiniteQuery 훅으로 무한 스크롤 기능을 구현하는 커스텀 훅을 작성한다.</p>
<pre id="code_1719589678692" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchSponsorData, Sponsor } from '../api/supabase';
<p>export const useSponsorList = () =&gt; {
return useInfiniteQuery({
queryKey: ['sponsorList'],
queryFn: ({ pageParam = 0 }) =&gt; fetchSponsorData(pageParam),
getNextPageParam: (lastPage, allPages) =&gt; {
if (lastPage.length === 0) return null;
return allPages.length;
},
select: (data) =&gt; data.pages.flat(),
staleTime: Infinity,
});
};</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>return useInfiniteQuery({ ...</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>useInfiniteQuery 훅을 호출하여 코드 블럭 내부에서 무한 스크롤 쿼리 로직을 작성하고 useSponsorList라는 커스텀 훅 이름을 작명하여 내보낸다. 이렇게 내보내면 다른 컴포넌트에서 사용할 수 있다.</li>
</ul>
</li>
<li><b>queryKey: ['sponsorList']</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>쿼리키는 이 쿼리를 식별하는 이름이다. 지금은 중요한 게 아니고, 이 커스텀 훅을 사용하는 다른 컴포넌트에서 CUD가 발생해서 데이터를 무효화시키거나, 캐싱하여야 할 때 이 이름이 필요하다.</li>
</ul>
</li>
<li><b>queryFn : ({ pageParam = 0 }) =&gt; fetchSponsorData(pageParam)</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>queryFn은 데이터를 가져오는 함수, 아까 만들어 둔 함수를 지정한다.</li>
<li>그런데 그냥 함수만 실행할 거면 함수 이름만 작성해도 되지만, 아까 만들어 둔 함수에서는 page라는 매개 변수를 받게끔 했었다. 따라서 화살표 함수로 표현식 작성을 해서 매개 변수를 설정해준다.</li>
<li>여기서 이름이 pageParam으로 했지만 위에서 말한 page가 맞다.</li>
<li>초기값은 0으로 한다. 그래야 데이터를 순서대로 잘 불러온다. 1이 아니라 0인 이유는, 사람이 숫자를 셀 때는 1부터 시작하지만 컴퓨터에서는 0이 1번이다.</li>
</ul>
</li>
<li><b>getNextPageParam: (lastPage, allPages) =&gt; { ... }</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>다음 페이지의 번호를 반환하는 함수이다. TanStack Query에서 제공하는 useInfiniteQuery 훅을 사용하려면 설정해줘야 하는 내용이다.</li>
<li>매개 변수에서 lastPage는 마지막으로 가져온 페이지의 데이터이고, allPages는 지금까지 가져온 모든 페이지의 데이터 배열이다.</li>
</ul>
</li>
<li><b>if (lastPage.length === 0) return null;</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>마지막으로 가져온 페이지, 이 배열의 길이가 0인지 확인한다.</li>
<li>이 배열의 길이가 0이라는 것은 더 이상 가져올 데이터가 없음을 의미한다. 이 때는 null을 return 해버리고 무한 스크롤(데이터 fetch)를 중단한다.</li>
</ul>
</li>
<li><b>return allPages.length;</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>if문이 아닌 경우는 마지막으로 가져온 페이지가 있을 경우인데, 만약 지금까지 가져온 페이지의 개수가 3개면, allPages.length는 3이 되고, 이것을 return한다.</li>
<li>즉 if문을 다시 살펴보면 마지막으로 가져온 페이지가 더이상 없으면, 더 가져올 데이터가 없는 것이니 getNextPageParam 즉, 다음 페이지 번호를 null로 할당해서 더이상 가져올 데이터가 없다고 전달하고 가져올 데이터가 있으면 지금까지 가져온 페이지의 개수인 allPages.length로 전달해서 getNextPageParam, 즉 다음 페이지 번호로 전달한다.</li>
</ul>
</li>
<li><b>select:&nbsp;(data)&nbsp;=&gt;&nbsp;data.pages.flat(),</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>select 옵션은 TanStack Query에서 useInfiniteQuery 훅을 사용하는 경우 데이터를 원하는 형태로 변환할 수 있게 해주는 옵션이다.</li>
<li>data.pages는 useInfiniteQuery훅에서 제공하는 데이터 구조이다. 배열의 배열 형태로 되어 있다.</li>
<li>그리고 flat() 메서드는 이러한 2차원 배열을 1차원 배열로 평평하게 펴 주는, 즉 평탄화 해주는 JS 배열 메서드이다.</li>
</ul>
</li>
</ul>
<pre id="code_1719593198584" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>data.pages = [
  [0번째 데이터, 1번째 데이터, 2, 3, 4, 5, 6, 7, 8, 9], // 첫 번째 페이지의 데이터 배열
  [10번째 데이터, 11번째 데이터, 12, 13, 14, 15, 16, 17, 18, 19], // 첫 번째 페이지의 데이터 배열
]</code></pre>
<pre id="code_1719593342517" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>const 2차원배열 = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // 첫번째 페이지 데이터
  [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], // 첫번째 페이지 데이터
];
<p>const 1차원배열변환된배열 = 2차원배열.flat();
// [0, 1, 2, ... 18, 19]</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>staleTime: Infinity</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>TanStack Query에서 데이터를 쿼리(불러오기)할 때, 데이터를 얼마나의 시간 뒤에 stale하다고 볼 것이냐는 설정이다.</li>
<li>무슨 말이냐면, TanStack Query에서는 데이터의 상태를 크게 Fresh, Stale 상태 두 개로 나눠서 구분하는데, Fresh는 단어 그대로 서버에서 사용자에게 전달된 데이터가 서버와 같은 상태, 즉 신선한 상태이기 때문에 데이터를 새로 받아와봤자 의미가 없으니 사용자가 fetch 요청을 하더라도 사용자에게 캐싱한 데이터를 꺼내올 뿐 서버로 요청을 날리지는 않겠다는 의미이다. 반대로 stale하다는 의미는 단어 그대로 서버에서 가져온 데이터가 사용자에게 전달되고 나서 썩었다는 이야기이다. 이 옵션을 넣지 않게 되면 staletime의 기본 값은 0이기 때문에 서버에서 데이터를 가져 오자마자 데이터가 썩었다고 보고, 사용자가 fetch 요청을 하면 하는 대로 서버에 데이터 요청을 하게 된다.</li>
<li>잘 판단해서 사용하면 되겠고, 본인은 어차피 서버에서 자주 바뀌는 데이터가 아니기 때문에 CUD가 발생하지 않는 한 데이터를 항상 Fresh하다고 보고 사용자에게 캐싱 해버려서 서버 트래픽을 아끼고자 이런 설정을 하였다.</li>
</ul>
</li>
</ul>
<h3 data-ke-size="size23">전체 로직 설명</h3>
<p data-ke-size="size16">로직이 다소 복잡해보인다. 따라서 예시를 들어서 설명하겠다.</p>
<p data-ke-size="size16">&nbsp;</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>여기서 작성한 useInfiniteQuery 훅을 가져다 쓴 컴포넌트에서 사용자로부터 첫번째 데이터 fetch 요청이 발생한다.</li>
<li>pageParam의 초기값이 0이기 때문에 이 커스텀 훅이 동작하면서 queryFn의 fetch 함수인 pageParam이 0으로 전달된다.</li>
<li>getNextPageParam 함수가 동작하면서 lastPage와 allPages를 이용하여 다음 페이지 번호를 계산하여 전달한다.</li>
<li>fetchSponsorData(0)이 전달되면서 supabase에서 0번째 페이지의 데이터를 가져온다.</li>
<li>이어서 start가 0으로 할당되고, end가 9로 할당되면서 이게 0번째 페이지를 구성한다.</li>
<li>두번째 호출에서는 getNextPageParam에 의해 fetchSponsorData(1)이 전달되면서 위 로직을 반복한다.</li>
</ul>
<h2 data-ke-size="size26">무한 스크롤을 적용할 컴포넌트 작성</h2>
<p data-ke-size="size16">위에서 작성한 무한스크롤 커스텀 훅을 그냥 import 해서 사용하면 아름다운 결말이겠지만, 약간의 설정을 해주어야 한다.</p>
<p data-ke-size="size16">react-intersection-observer를 사용해서 스크롤이 어디까지 도달했는지 측정해야 그 시점에서 커스텀 훅을 실행할 수 있다.</p>
<p data-ke-size="size16">만약 라이브러리를 사용하기 싫으면 자바스크립트로 intersection-observer를 구현하는 MDN 문서를 참고해서 직접 제작해도 좋다.</p>
<pre id="code_1719589709664" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>import { useSponsorList } from '../hooks/useSponsorList';
import { Link } from 'react-router-dom';
import { useCommaFormat } from '../hooks/useCommaFormat';
import LoadingSpinner from '../components/Loading';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
<p>const SponsorList = () =&gt; {
const { ref, inView } = useInView({ threshold: 0 });
const { data: sponsors, isFetching, fetchNextPage, hasNextPage, error } = useSponsorList();</p>
<p>useEffect(() =&gt; {
if (inView &amp;&amp; hasNextPage) {
fetchNextPage();
}
}, [inView, hasNextPage, fetchNextPage]);</p>
<p>if (error) return &lt;div&gt;Error loading data: {error.message}&lt;/div&gt;;</p>
<p>return (
&lt;div className=&quot;container mx-auto px-4 py-8&quot;&gt;
&lt;h1 className=&quot;text-3xl font-bold mb-8 text-center&quot;&gt;후원자 목록&lt;/h1&gt;
&lt;div className=&quot;grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6&quot;&gt;
{sponsors &amp;&amp; sponsors.map((sponsor) =&gt; (
&lt;Link to={<code>/sponsorlist/detail/${sponsor.uuid}</code>} key={sponsor.uuid}&gt;
&lt;div className=&quot;bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:scale-105&quot;&gt;
&lt;h2 className=&quot;text-xl font-semibold mb-2&quot;&gt;{sponsor.name}&lt;/h2&gt;
&lt;h2 className=&quot;text-xl font-semibold mb-2 text-pastelRed&quot;&gt;{useCommaFormat(sponsor.amounts)}원&lt;/h2&gt;
&lt;p className=&quot;text-gray-700&quot;&gt;{sponsor.serielnumbers}&lt;/p&gt;
&lt;p className=&quot;text-gray-700&quot;&gt;{new Date(sponsor.datetime).toLocaleDateString()}&lt;/p&gt;
&lt;/div&gt;
&lt;/Link&gt;
))}
{isFetching &amp;&amp; &lt;LoadingSpinner /&gt;}
&lt;div className='h-5' ref={ref}&gt;&lt;/div&gt;
&lt;/div&gt;
&lt;/div&gt;
);
};</p>
<p>export default SponsorList;</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>const { ref, inView } = useInView({ threshold: 0 });</b><br />
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>react-intersection-observer에서 제공하는 훅이다.</li>
<li>사용자가 스크롤 할 때 요소가 보이는지 감지하는 훅이다.</li>
<li>InView 훅에서 ref를 하나 더 꺼내 왔는데, 밑에 JSX를 렌더링 하는 부분에서 빈 div에 ref를 일정 크기(여기서는 tailwind h-5 높이)의 영역에 참조를 걸어서 그 요소가 보이는지 체크한다.</li>
<li>즉 화면 맨 아래에 스크롤이 도달했는지 체크하는 메서드이다.</li>
</ul>
</li>
<li><b>const&nbsp;{&nbsp;data:&nbsp;sponsors,&nbsp;isFetching,&nbsp;fetchNextPage,&nbsp;hasNextPage,&nbsp;error&nbsp;}&nbsp;=&nbsp;useSponsorList();</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>아까 위에서 만든 useInfiniteQuery 훅이다. 여기서 제공하는 값들 중에서 저것들이 다 필요하다.</li>
<li>data: sponsors : API 요청 결과 반환되는 값이다. data라는 이름은 헷갈리니 sponsors 바꿔서 배열을 사용하겠다.</li>
<li>isFetching: 데이터가 로딩 중인지 확인시켜준다.</li>
<li>fetchNextPage: 다음 페이지의 데이터를 가져오는 함수이다.</li>
<li>hasNextPage: 더 가져올 페이지가 있는지 여부를 나타낸다.</li>
<li>error: API 요청 중 에러가 발생하면 그 에러의 내용을 반환해주는 것이다.</li>
</ul>
</li>
<li><b>if (inView &amp;&amp; hasNextPage) {fetchNextPage();}</b><br />
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>inView &amp;&amp; hasNextPage는, ref를 걸어 둔 요소가 화면에 보이고, 더 가져올 페이지가 있는 경우에만 fetchNextPage() 함수를 실행하라는 의미이다.</li>
<li>그런데 이 로직은 useEffect 훅으로 감싸져 있고, 의존성 배열에는 inView, hasNextPage, fetchNextPage가 있는데, 이것들의 값이 변경될 때마다 다시 실행시킨다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>inView는 불리언 값이고, ref를 걸어 둔 요소가 뷰포트 내에 있는지 여부를 나타낸다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>사용자가 스크롤을 내려서 ref를 걸어 둔 빈 div가 화면에 들어오면 true로 바뀌고, 그러면 fetchNextPage 함수가 발동한다. 그러면서 다음 페이지 번호를 넘기면서 다시 10개 데이터를 불러와서 이 빈 div가 화면 밖으로 밀려난다. 그러면서 다시 값이 false로 바뀌고, 또 스크롤을 내리면 true로 바뀌고, 이런 과정을 반복하면서 이 함수는 계속 실행된다.</li>
</ul>
</li>
<li>hasNextPage는 불리언 값이고, 다음 페이지가 더 있는지 여부를 나타낸다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이 불리언 값이 의존성 배열에 들어가면 다음 페이지, 즉 더 불러올 데이터가 있을 때만 fetch 함수가 실행된다.</li>
</ul>
</li>
</ul>
</li>
</ul>
</li>
<li><b>{isFetching &amp;&amp; &lt;LoadingSpinner /&gt;}</b><br />
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이제부터 return문의 내용이다. &amp;&amp;은 표현식에서 if문과 같은 의미임. 좌항이 true면 우항을 반환하는 것.</li>
<li>즉, isFetching, 데이터를 가져오는 중이면 미리 제작 해 놓은 로딩 스피너를 띄우라는 의미임.</li>
<li>이건 옵셔널한 설정임.</li>
</ul>
</li>
<li><b>&lt;div className='h-5' ref={ref}&gt;&lt;/div&gt;</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>return문에서는 이 부분이 핵심이다. inView에 이용되는 화면 최하단의 빈 div이다. h-5가 이 div의 크기인데 tailwind라서 그렇고, 필요에 따라서 크기를 설정한다. intersection observer로 ref를 거는 것이 핵심이다.</li>
<li>그러면 이 ref가 사용자의 뷰포트에 진입하면 불리언 값을 바꾸면서 위에서 작성한 로직이 유기적으로 동작한다.</li>
</ul>
</li>
</ul>
<h2 data-ke-size="size26">무한스크롤 구현 순서 의사코드 정리</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>패키지 설치
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>TanStack Query, react-inersection-observerm supabase(본인의 경우)</li>
</ul>
</li>
<li>데이터 가져오는 함수 작성
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>서버의 데이터 반환 값 타입 정의(본인의 경우 interface)</li>
<li>데이터 fetch 함수 작성
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>페이지 번호를 받아서 해당 페이지의 데이터를 가져오는 함수</li>
</ul>
</li>
</ul>
</li>
<li>무한스크롤 useInfiniteQuery 커스텀 훅 작성
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>굳이 커스텀 훅은 아니어도 됨. 그냥 바로 사용할 컴포넌트에서 작성해도 됨. 하지만 본인의 경우 컴포넌트가 지저분해지는 것이 싫어서 커스텀 훅.</li>
<li>queryKey, queryFn, getNextPageParam, select, flat 작성</li>
</ul>
</li>
<li>무한스크롤 구현 할 컴포넌트 작성
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>커스텀 훅으로 데이터 불러오기.</li>
<li>intersection observer 설정. useInView훅 (빈 div 화면 맨 아래에서 ref 걸어 활용)</li>
</ul>
</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>