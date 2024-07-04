<h3 data-ke-size="size23">01) Tanstack Query life cycle</h3>
<h4 data-ke-size="size20">(1) (캐시 데이터에 대한) LifeCycle 설명</h4>
<p><img src="https://teamsparta.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F83c75a39-3aba-4ba4-a792-7aefe4b07895%2Fbd3f993b-c490-4373-b7b4-9d97e672948c%2FUntitled.png?table=block&amp;id=790ed62d-7296-4d2a-901d-e49de23f5dab&amp;spaceId=83c75a39-3aba-4ba4-a792-7aefe4b07895&amp;width=2000&amp;userId=&amp;cache=v2" alt="" /></p>
<p data-ke-size="size16">TanStack Query의 생명주기는 데이터가 캐시되고, 사용되고, 갱신되는 과정을 포함합니다.<br />아래는 주요 상태들에 대한 설명입니다.</p>
<table style="height: 229px;" width="796" data-ke-align="alignLeft" data-ke-style="style5">
<thead>
<tr style="height: 20px;">
<th style="height: 20px;">상태</th>
<th style="height: 20px;">설명</th>
</tr>
</thead>
<tbody>
<tr style="height: 38px;">
<td style="height: 38px;">fresh</td>
<td style="height: 38px;">데이터를 새로 패칭할 필요가 없는 상태입니다. staleTime이 지나지 않은 상태로, 캐시 데이터를 그대로 사용할 수 있습니다.</td>
</tr>
<tr style="height: 38px;">
<td style="height: 38px;">stale</td>
<td style="height: 38px;">데이터를 새로 패칭해야 하는 상태입니다. staleTime이 지난 후로, 새로운 데이터를 가져오기 위해 쿼리가 실행됩니다.</td>
</tr>
<tr style="height: 19px;">
<td style="height: 19px;">active</td>
<td style="height: 19px;">현재 컴포넌트에서 사용 중인 쿼리 상태입니다. 컴포넌트가 마운트되어 쿼리를 사용하고 있을 때를 말합니다.</td>
</tr>
<tr style="height: 38px;">
<td style="height: 38px;">inactive</td>
<td style="height: 38px;">더 이상 사용되지 않는 쿼리 상태입니다. 컴포넌트가 언마운트되거나 쿼리가 더 이상 필요하지 않을 때를 말합니다.</td>
</tr>
<tr style="height: 19px;">
<td style="height: 19px;">deleted</td>
<td style="height: 19px;">캐시에서 제거된 쿼리 상태입니다. gcTime 이 지나면 쿼리가 캐시에서 삭제되어 이 상태가 됩니다.</td>
</tr>
<tr style="height: 19px;">
<td style="height: 19px;">fetching</td>
<td style="height: 19px;">데이터를 서버에서 가져오고 있는 상태입니다. 이 상태에서는 isFetching이 true로 설정됩니다.</td>
</tr>
</tbody>
</table>
<h4 data-ke-size="size20">(2) default config(기본 설정)</h4>
<table style="height: 209px;" data-ke-align="alignLeft" data-ke-style="style5">
<thead>
<tr style="height: 19px;">
<th style="height: 19px;">&nbsp;</th>
<th style="height: 19px;">&nbsp;</th>
</tr>
</thead>
<tbody>
<tr style="height: 19px;">
<td style="height: 19px;"><b>기본 설정</b></td>
<td style="height: 19px;"><b>의미</b></td>
</tr>
<tr style="height: 38px;">
<td style="height: 38px;">staleTime: 0</td>
<td style="height: 38px;">useQuery 또는 useInfiniteQuery에 등록된 queryFn 을 통해 fetch 받아온 데이터는 항상 stale data 취급</td>
</tr>
<tr style="height: 19px;">
<td style="height: 19px;">refetchOnMount: true</td>
<td style="height: 19px;">useQuery 또는 useInfiniteQuery 가 있는 컴포넌트가 마운트 시 stale data 를 refetch 자동 실행</td>
</tr>
<tr style="height: 35px;">
<td style="height: 35px;">refetchOnWindowFocus: true</td>
<td style="height: 35px;">실행중인 브라우저 화면을 focus 할 때 마다 stale data를 refetch 자동 실행</td>
</tr>
<tr style="height: 19px;">
<td style="height: 19px;">refetchOnReconnect: true</td>
<td style="height: 19px;">Network 가 끊겼다가 재연결 되었을 때 stale data를 refetch 자동 실행</td>
</tr>
<tr style="height: 38px;">
<td style="height: 38px;">gcTime(cacheTime): 5분 (1000 x 60 x 5 ms)</td>
<td style="height: 38px;">useQuery 또는 useInfiniteQuery가 있는 컴포넌트가 언마운트 되었을 때 inactive query라 부르며, inactive 상태가 5분 경과 후 GC(가비지콜렉터)에 의해 cache data 삭제 처리</td>
</tr>
<tr style="height: 22px;">
<td style="height: 22px;">retry: 3</td>
<td style="height: 22px;">useQuery 또는 useInfiniteQuery에 등록된 queryFn 이 API 서버에 요청을 보내서 실패하더라도 바로 에러를 띄우지 않고 총 3번까지 재요청을 자동으로 시도</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>useQuery 는 캐시데이터에 기반하여 동작합니다. 컴포넌트가 새로 마운트되어도 캐시 데이터가 fresh 하다면 fetch 하지 않습니다!</b></p>
<p data-ke-size="size16">&nbsp;</p>
<h4 data-ke-size="size20">(3) 헷갈리는 개념 정리</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>(3)-1. staleTime vs gcTime</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>staleTime</b></li>
<li>: 얼마의 시간이 흐른 뒤에 stale 취급할 건지 (default: 0)</li>
<li><b>gcTime</b></li>
<li>: inactive 된 이후로 메모리에 얼마만큼 있을건지 (default: 5분, gcTime 0되면 삭제처리)</li>
</ul>
</li>
<li><b>(3)-2. staleTime 과 stale/fresh 의 관계</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>staleTime &gt; 0 이면, fresh data</li>
<li>staleTime = 0 이면, stale data</li>
</ul>
</li>
<li><b>(3)-3. isPending vs. isFetching</b><code>isPending</code> vs <code>isFetching</code></li>
</ul>
<p data-ke-size="size16"><code>Tanstack Query</code>에서 <code>isPending</code>과 <code>isFetching</code>의 차이를 이해하는 것은 중요한데, 특히 캐시된 데이터와 새로운 데이터를 구별하는 데 도움이 됩니다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>isPending</code></b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>새로운 캐시 데이터를 서버에서 받고 있는 지 여부를 나타냅니다.</li>
<li>기존의 캐시된 데이터가 있는 경우, <code>isPending</code>은 <code>false</code>이고, <code>isFetching</code>은 <code>true</code>입니다.</li>
<li>캐시된 데이터가 없고 새로 데이터를 가져오는 경우, <code>isPending</code>은 <code>true</code>가 됩니다.</li>
</ul>
</li>
<li><b><code>isFetching</code></b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>서버에서 데이터를 받고 있는지 여부를 나타냅니다.</li>
<li>서버에서 데이터를 가져오는 중일 때 항상 <code>true</code>입니다.</li>
</ul>
</li>
</ul>
<h4 data-ke-size="size20">시나리오 설명</h4>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>메인 페이지에서 데이터 로드 (첫 번째 마운트)</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>useQuery</code>가 처음 실행되고 서버에서 데이터를 가져옵니다.</li>
<li><code>isPending</code>: <code>true</code> (새로운 캐시 데이터를 서버에서 받고 있는 중)</li>
<li><code>isFetching</code>: <code>true</code> (서버에서 데이터를 받고 있는 중)</li>
</ul>
</li>
<li><b>상세 페이지로 이동</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>메인 페이지가 언마운트되고, 상세 페이지가 마운트됩니다.</li>
<li>만약 상세 페이지에서도 <code>useQuery("todos", getTodos)</code>를 사용하고 있다면:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이미 캐시된 데이터가 있기 때문에, 상세 페이지의 <code>isPending</code>은 <code>false</code>이고 <code>isFetching</code>은 <code>true</code>입니다.</li>
</ul>
</li>
</ul>
</li>
<li><b>메인 페이지로 돌아옴 (두 번째 마운트)</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>메인 페이지가 다시 마운트됩니다.</li>
<li>캐시된 데이터가 있는 상태로 마운트되므로:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>isPending</code>: <code>false</code> (캐시된 데이터가 있기 때문에 새로운 데이터를 기다리지 않음)</li>
<li><code>isFetching</code>: <code>true</code> (데이터를 다시 가져오고 있음)</li>
</ul>
</li>
</ul>
</li>
</ol>
<h4 data-ke-size="size20">예시 코드</h4>
<pre class="javascript"><code>// src &gt; pages &gt; Main.jsx
import { useQuery } from "@tanstack/react-query";
import getTodos from "@/api/getTodos";
<p>function Main() {
const { isPending, isFetching } = useQuery({
queryKey: [&quot;todos&quot;],
queryFn: getTodos
});</p>
<pre><code>console.log(&quot;isPending: &quot;, isPending);
console.log(&quot;isFetching: &quot;, isFetching);

return (
    &amp;lt;div&amp;gt;
        &amp;lt;h1&amp;gt;Main Page&amp;lt;/h1&amp;gt;
    &amp;lt;/div&amp;gt;
);
</code></pre>
<p>}</p>
<p>export default Main;</code></pre></p>
<h4 data-ke-size="size20">콘솔 로그 예상 값</h4>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>첫 번째 메인 페이지 마운트</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>isPending</code>: <code>true</code></li>
<li><code>isFetching</code>: <code>true</code></li>
</ul>
</li>
<li><b>상세 페이지 이동 후 다시 메인 페이지로 돌아옴</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>isPending</code>: <code>false</code></li>
<li><code>isFetching</code>: <code>true</code></li>
</ul>
</li>
</ol>
<h4 data-ke-size="size20">요약</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>isPending</code>은 새로운 캐시 데이터를 서버에서 받고 있는지 여부를 나타내며, 캐시 데이터가 있는 경우 <code>false</code>입니다.</li>
<li><code>isFetching</code>은 서버에서 데이터를 받고 있는지 여부를 나타내며, 데이터가 로드되는 동안 항상 <code>true</code>입니다.</li>
<li>캐시된 데이터가 있는 경우, 페이지가 다시 마운트될 때 <code>isPending</code>은 <code>false</code>이고 <code>isFetching</code>은 <code>true</code>입니다.</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">02) Must-know options</h3>
<aside>✔️ useQuery를 할 때, 반드시 알아야 하는 옵션에 대해 살펴봅니다.</aside>
<h4 data-ke-size="size20">(1) enabled</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>(1)-1. 개념</b>기본 사용법은 아래와 같아요.</li>
<li><code class="language-jsx">  useQuery({
      queryKey: ["todos"],
      queryFn: getTodos,
      enabled: true
  })</code></li>
<li><b><code>enabled</code></b> 옵션은 쿼리(queryFn) 실행 여부를 제어합니다. 기본값은 <code>true</code>(만약 설정하지 않는다면 자동으로 true)이며, <code>false</code>로 설정하면 쿼리가 자동으로 실행되지 않습니다. 이 옵션을 사용하여 특정 이벤트 발생 시 쿼리를 실행할 수 있습니다.</li>
<li><b>(1)-2. 사용 예제</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>(1)-2-1. Disabling/Pausing Queries (이벤트 발생 시에만 수동 실행하고 싶을 때)</li>
</ul>
</li>
</ul>
<pre id="code_1718314226428" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>const { data, refetch } = useQuery({ 
    queryKey: ["todos"], 
    queryFn: getTodos, 
    enabled: false 
}); 
<p>return (
&lt;div&gt;
&lt;button onClick={() =&gt; refetch()}&gt;데이터 불러오기&lt;/button&gt;
&lt;/div&gt;
);</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>(1)-2-2. Dependent Queries(useQuery 2개 이상이며 실행순서 설정 필요할 때)</li>
</ul>
<pre id="code_1718314294917" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// Dependent Query 예제 (순차적 query 실행) 
// Get the user 
const { data: user } = useQuery({ 
    queryKey: ['user', email],
    queryFn: getUserByEmail, 
}) 
<p>const userId = user?.id</p>
<p>// Then get the user's projects
const { status, fetchStatus, data: projects, } = useQuery({
queryKey: ['projects', userId],
queryFn: getProjectsByUser,
// 쿼리는 userId가 존재하는 경우에만 실행돼요 :)
enabled: !!userId
})
// 여기서 !!userId 는 Boolean(userId)와 같습니다.</code></pre></p>
<h4 data-ke-size="size20">(2) select</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>(2)-1. 개념</b></li>
<li><b><code>select</code></b> 옵션은 쿼리 함수에서 반환된 데이터를 변형하여 사용할 수 있도록 합니다. 데이터의 특정 부분만 선택하거나, 데이터를 변환하여 사용할 때 유용해요. 단, 캐시 데이터는 원본 데이터를 유지합니다.</li>
<li><b>(2)-2. 사용예제</b><b></b></li>
</ul>
<pre id="code_1718314334050" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>import { useQuery } from 'react-query' 
<p>function User() {</p>
<pre><code>const { data } = useQuery({ 
    queryKey: [&quot;user&quot;], 
    queryFn: fetchUser, 
    select: user =&amp;gt; user.username 
}); 

return &amp;lt;div&amp;gt;Username: {data}&amp;lt;/div&amp;gt; 
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>