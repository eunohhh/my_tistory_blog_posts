<p data-ke-size="size16">React Query, 현재는 TanStack Query로 알려진 라이브러리는 리액트 애플리케이션에서 서버 상태 관리를 쉽게 해주는 도구입니다. 등장 배경과 기본 개념에 대해 알아보겠습니다.</p>
<h3 data-ke-size="size23">등장 배경</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>서버 상태 관리의 복잡성</b>: 클라이언트 애플리케이션에서 서버와 데이터를 주고받을 때, 데이터의 로딩 상태, 에러 처리, 캐싱, 동기화 등의 문제를 해결해야 합니다. 이를 위해 많은 보일러플레이트 코드가 필요하며, 이러한 코드가 애플리케이션의 복잡성을 증가시킵니다.</li>
<li><b>Redux와 같은 상태 관리 라이브러리의 한계</b>: Redux는 클라이언트 상태 관리에는 매우 유용하지만, 서버 상태 관리에는 적합하지 않습니다. 서버 상태는 클라이언트 상태와 다르며, 주로 외부 소스에서 가져온 데이터를 다룹니다. 이 데이터를 관리하기 위해서는 Redux 외에도 여러 가지 부가적인 설정과 코드가 필요합니다.</li>
<li><b>반응형 데이터 처리의 필요성</b>: 서버에서 데이터를 가져오거나 변경한 후, 이를 자동으로 화면에 반영하는 기능이 필요합니다. 이를 위해서는 데이터의 캐싱, 백그라운드에서의 데이터 갱신, 데이터의 유효성 관리 등의 기능이 필요합니다.</li>
</ol>
<p data-ke-size="size16">이러한 배경에서 React Query는 서버 상태 관리를 간편하게 하기 위해 개발되었습니다.</p>
<h3 data-ke-size="size23">기본 개념</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>서버 상태(Server State)</b>: 서버 상태는 외부 서버로부터 가져온 데이터를 의미합니다. 서버 상태는 클라이언트 상태와 다르게 전역적이지 않으며, 일반적으로 서버에 의존적이고 비동기적으로 가져옵니다.</li>
<li><b>쿼리(Query)</b>: 쿼리는 서버로부터 데이터를 가져오는 것을 의미합니다. React Query는 이러한 쿼리를 쉽게 관리할 수 있도록 도와줍니다. 쿼리 키(Query Key)를 사용하여 데이터를 식별하고, 해당 키를 기반으로 캐싱을 수행합니다.</li>
<li><b>뮤테이션(Mutation)</b>: 뮤테이션은 서버의 데이터를 변경하는 작업을 의미합니다. 예를 들어, 데이터를 생성, 업데이트 또는 삭제하는 작업이 뮤테이션에 해당합니다. React Query는 이러한 뮤테이션을 간편하게 관리할 수 있도록 도와줍니다.</li>
<li><b>캐싱(Caching)</b>: React Query는 쿼리의 결과를 자동으로 캐싱하여 동일한 쿼리를 반복적으로 실행하지 않도록 합니다. 캐시된 데이터는 일정 시간 동안 유효하며, 필요에 따라 자동으로 갱신할 수 있습니다.</li>
<li><b>자동 리페치(Automatic Refetching)</b>: React Query는 데이터의 유효성을 관리하며, 백그라운드에서 자동으로 데이터를 갱신할 수 있습니다. 예를 들어, 탭이 포커스되거나 네트워크가 재연결될 때 데이터를 자동으로 리페치합니다.</li>
<li><b>서스펜스(Suspense)</b>: React Query는 React의 서스펜스 기능을 지원하여, 데이터 로딩 상태를 보다 쉽게 관리할 수 있습니다.</li>
</ol>
<h3 data-ke-size="size23">기본 사용 예제</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>설치</b>:</li>
</ol>
<pre class="css"><code>npm install @tanstack/react-query</code></pre>
<ol style="list-style-type: decimal;" start="2" data-ke-list-type="decimal">
<li><b>프로바이더 설정</b>:</li>
</ol>
<p data-ke-size="size16">먼저, <code>QueryClient</code>와 <code>QueryClientProvider</code>를 설정합니다.</p>
<pre class="javascript"><code>// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
<p>const queryClient = new QueryClient();</p>
<p>ReactDOM.render(
&lt;QueryClientProvider client={queryClient}&gt;
&lt;App /&gt;
&lt;/QueryClientProvider&gt;,
document.getElementById('root')
);</code></pre></p>
<ol style="list-style-type: decimal;" start="3" data-ke-list-type="decimal">
<li><b>쿼리 사용</b>:</li>
</ol>
<p data-ke-size="size16">다음은 서버에서 데이터를 가져오는 간단한 컴포넌트</p>
<pre class="javascript"><code>// src/App.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
<p>const fetchUsers = async () =&gt; {
const response = await fetch('https://jsonplaceholder.typicode.com/users');
if (!response.ok) {
throw new Error('Network response was not ok');
}
return response.json();
};</p>
<p>const App: React.FC = () =&gt; {
const { data, error, isLoading } = useQuery(['users'], fetchUsers);</p>
<p>if (isLoading) return &lt;div&gt;Loading...&lt;/div&gt;;
if (error) return &lt;div&gt;Error: {(error as Error).message}&lt;/div&gt;;</p>
<p>return (
&lt;div&gt;
&lt;h1&gt;Users&lt;/h1&gt;
&lt;ul&gt;
{data.map((user: any) =&gt; (
&lt;li key={user.id}&gt;{user.name}&lt;/li&gt;
))}
&lt;/ul&gt;
&lt;/div&gt;
);
};</p>
<p>export default App;</code></pre></p>
<p data-ke-size="size16">위 예제에서 <code>useQuery</code> 훅을 사용하여 데이터를 가져오고, 로딩 상태와 에러 상태를 처리하는 것을 볼 수 있습니다.</p>
<p data-ke-size="size16">React Query(TanStack Query)는 서버 상태 관리를 위한 강력한 도구로, 개발자들이 비동기 데이터를 보다 쉽게 다룰 수 있도록 도와줍니다. 이를 통해 복잡한 상태 관리 코드를 줄이고, 애플리케이션의 유지보수성을 높일 수 있습니다.</p>