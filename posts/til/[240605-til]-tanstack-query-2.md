<p data-ke-size="size16">TanStack Query(구 React Query)의 타입스크립트 버전 사용법</p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">설치및 사용</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>패키지 설치</b></li>
</ol>
<p data-ke-size="size16">먼저 TanStack Query 패키지를 설치해야 합니다. 패키지를 설치하려면 다음 명령어를 사용하세요:</p>
<pre class="coffeescript"><code>npm install @tanstack/react-query @tanstack/router-devtools</code></pre>
<p data-ke-size="size16">또는</p>
<pre class="css"><code>yarn add @tanstack/react-query @tanstack/router-devtools</code></pre>
<p data-ke-size="size16">타입스크립트 타입 정의도 설치합니다:</p>
<pre class="coffeescript"><code>npm install @types/react</code></pre>
<ol style="list-style-type: decimal;" start="2" data-ke-list-type="decimal">
<li><b>React Query 클라이언트 설정</b></li>
</ol>
<p data-ke-size="size16">React Query 클라이언트를 설정하고, 이를 앱 전체에서 사용할 수 있도록 제공합니다.</p>
<pre class="javascript"><code>// src/main.tsx 또는 src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
<p>const queryClient = new QueryClient();</p>
<p>ReactDOM.render(
&lt;React.StrictMode&gt;
&lt;QueryClientProvider client={queryClient}&gt;
&lt;App /&gt;
&lt;/QueryClientProvider&gt;
&lt;/React.StrictMode&gt;,
document.getElementById('root')
);</code></pre></p>
<ol style="list-style-type: decimal;" start="3" data-ke-list-type="decimal">
<li><b>데이터 패칭 함수 작성</b></li>
</ol>
<p data-ke-size="size16">API에서 데이터를 가져오는 함수를 작성합니다. 이 함수는 fetch를 사용하여 데이터를 가져오고, 이를 JSON으로 변환합니다.</p>
<pre class="typescript"><code>// src/api.ts
export interface Post {
  id: number;
  title: string;
  body: string;
}
<p>export const fetchPosts = async (): Promise&lt;Post[]&gt; =&gt; {
const response = await fetch('https://jsonplaceholder.typicode.com/posts');
if (!response.ok) {
throw new Error('Network response was not ok');
}
return response.json();
};</code></pre></p>
<ol style="list-style-type: decimal;" start="4" data-ke-list-type="decimal">
<li><b>React Query 훅 사용</b></li>
</ol>
<p data-ke-size="size16">컴포넌트에서 <code>useQuery</code> 훅을 사용하여 데이터를 가져옵니다.</p>
<pre class="javascript"><code>// src/Posts.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPosts, Post } from './api';
<p>const Posts: React.FC = () =&gt; {
const { data, error, isLoading } = useQuery&lt;Post[], Error&gt;(['posts'], fetchPosts);</p>
<p>if (isLoading) {
return &lt;span&gt;Loading...&lt;/span&gt;;
}</p>
<p>if (error) {
return &lt;span&gt;Error: {error.message}&lt;/span&gt;;
}</p>
<p>return (
&lt;ul&gt;
{data?.map((post) =&gt; (
&lt;li key={post.id}&gt;
&lt;h2&gt;{post.title}&lt;/h2&gt;
&lt;p&gt;{post.body}&lt;/p&gt;
&lt;/li&gt;
))}
&lt;/ul&gt;
);
};</p>
<p>export default Posts;</code></pre></p>
<ol style="list-style-type: decimal;" start="5" data-ke-list-type="decimal">
<li><b>앱에 컴포넌트 추가</b></li>
</ol>
<p data-ke-size="size16"><code>App.tsx</code> 파일에서 <code>Posts</code> 컴포넌트를 렌더링합니다.</p>
<pre class="javascript"><code>// src/App.tsx
import React from 'react';
import Posts from './Posts';
<p>const App: React.FC = () =&gt; {
return (
&lt;div&gt;
&lt;h1&gt;Posts&lt;/h1&gt;
&lt;Posts /&gt;
&lt;/div&gt;
);
};</p>
<p>export default App;</code></pre></p>
<p data-ke-size="size16">이제 애플리케이션을 실행하면 TanStack Query를 사용하여 API로부터 데이터를 가져와서 화면에 표시하는 것을 확인할 수 있습니다.</p>
<p data-ke-size="size16">위 예제는 기본적인 사용법을 설명한 것이며, 실제 애플리케이션에서는 오류 처리, 캐싱, 페이지네이션 등 다양한 기능을 활용할 수 있습니다. TanStack Query의 공식 문서에서 더 많은 정보를 확인할 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">data, isLoading, error</h3>
<p data-ke-size="size16"><code>data</code>, <code>error</code>, <code>isLoading</code> 등은 TanStack Query의 <code>useQuery</code> 훅이 반환하는 객체의 속성들입니다. 이 훅은 쿼리의 상태를 관리하고, 관련된 정보를 제공하는 객체를 반환합니다. 각각의 속성은 다음과 같은 역할을 합니다:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>data</b>: 쿼리가 성공적으로 완료되었을 때 반환되는 데이터입니다. <code>fetchPosts</code> 함수가 반환한 데이터를 포함합니다.</li>
<li><b>error</b>: 쿼리 수행 중 오류가 발생했을 때의 오류 객체입니다. <code>fetchPosts</code> 함수에서 오류가 발생하면 그 오류가 <code>error</code> 속성에 저장됩니다.</li>
<li><b>isLoading</b>: 쿼리가 로딩 중인지 여부를 나타내는 불리언 값입니다. 쿼리가 실행 중일 때 <code>true</code>로 설정되며, 로딩이 완료되면 <code>false</code>로 설정됩니다.</li>
</ol>
<p data-ke-size="size16">이제 <code>useQuery</code> 훅의 반환 값을 사용하여 상태에 따라 컴포넌트가 적절한 UI를 렌더링할 수 있습니다. 여기에는 로딩 상태를 표시하거나, 오류 메시지를 표시하거나, 데이터를 표시하는 것이 포함됩니다.</p>
<pre class="javascript"><code>// src/Posts.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPosts, Post } from './api';
<p>const Posts: React.FC = () =&gt; {
const { data, error, isLoading } = useQuery&lt;Post[], Error&gt;(['posts'], fetchPosts);</p>
<p>if (isLoading) {
return &lt;span&gt;Loading...&lt;/span&gt;;
}</p>
<p>if (error) {
return &lt;span&gt;Error: {error.message}&lt;/span&gt;;
}</p>
<p>return (
&lt;ul&gt;
{data?.map((post) =&gt; (
&lt;li key={post.id}&gt;
&lt;h2&gt;{post.title}&lt;/h2&gt;
&lt;p&gt;{post.body}&lt;/p&gt;
&lt;/li&gt;
))}
&lt;/ul&gt;
);
};</p>
<p>export default Posts;</code></pre></p>
<p data-ke-size="size16">여기서 <code>useQuery</code> 훅은 다음과 같이 동작합니다:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>로딩 중일 때</b>: <code>isLoading</code>은 <code>true</code>가 되고, 이 경우 "Loading..." 메시지를 렌더링합니다.</li>
<li><b>오류가 발생했을 때</b>: <code>error</code>가 설정되며, 오류 메시지를 렌더링합니다.</li>
<li><b>성공적으로 데이터를 가져왔을 때</b>: <code>data</code>가 설정되고, 데이터를 사용하여 리스트를 렌더링합니다.</li>
</ul>
<p data-ke-size="size16">이 모든 것은 TanStack Query가 내부적으로 상태를 관리하고 업데이트하기 때문에 가능한 일입니다. TanStack Query는 React 컴포넌트의 상태를 단순화하고, 데이터 패칭 로직을 쉽게 관리할 수 있도록 도와줍니다.</p>
<h3 data-ke-size="size23">오류처리</h3>
<p data-ke-size="size16">TanStack Query에서 오류 처리는 매우 중요한 부분이며, 다양한 방법으로 쉽게 처리할 수 있습니다. 기본적인 오류 처리는 <code>useQuery</code> 훅의 <code>error</code> 속성을 통해 이루어지며, 보다 복잡한 오류 처리를 위해 <code>onError</code> 콜백이나 전역 오류 핸들러를 사용할 수 있습니다.</p>
<h4 data-ke-size="size20">1. 기본적인 오류 처리</h4>
<p data-ke-size="size16"><code>useQuery</code> 훅의 <code>error</code> 속성을 사용하여 오류를 처리하는 방법입니다.</p>
<pre class="javascript"><code>// src/Posts.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPosts, Post } from './api';
<p>const Posts: React.FC = () =&gt; {
const { data, error, isLoading } = useQuery&lt;Post[], Error&gt;(['posts'], fetchPosts);</p>
<p>if (isLoading) {
return &lt;span&gt;Loading...&lt;/span&gt;;
}</p>
<p>if (error) {
return &lt;span&gt;Error: {error.message}&lt;/span&gt;;
}</p>
<p>return (
&lt;ul&gt;
{data?.map((post) =&gt; (
&lt;li key={post.id}&gt;
&lt;h2&gt;{post.title}&lt;/h2&gt;
&lt;p&gt;{post.body}&lt;/p&gt;
&lt;/li&gt;
))}
&lt;/ul&gt;
);
};</p>
<p>export default Posts;</code></pre></p>
<p data-ke-size="size16">위 예제에서는 <code>error</code>가 있을 경우 간단한 에러 메시지를 화면에 표시합니다.</p>
<h4 data-ke-size="size20">2. <code>onError</code> 콜백을 사용한 오류 처리</h4>
<p data-ke-size="size16">쿼리를 생성할 때 <code>onError</code> 콜백을 사용하여 오류를 처리할 수 있습니다. 이를 통해 오류가 발생했을 때 특정 작업을 수행할 수 있습니다.</p>
<pre class="javascript"><code>// src/Posts.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPosts, Post } from './api';
<p>const Posts: React.FC = () =&gt; {
const { data, error, isLoading } = useQuery&lt;Post[], Error&gt;(
['posts'],
fetchPosts,
{
onError: (error) =&gt; {
console.error('Error fetching posts:', error);
// 추가적인 오류 처리 로직을 여기에 작성할 수 있습니다.
}
}
);</p>
<p>if (isLoading) {
return &lt;span&gt;Loading...&lt;/span&gt;;
}</p>
<p>if (error) {
return &lt;span&gt;Error: {error.message}&lt;/span&gt;;
}</p>
<p>return (
&lt;ul&gt;
{data?.map((post) =&gt; (
&lt;li key={post.id}&gt;
&lt;h2&gt;{post.title}&lt;/h2&gt;
&lt;p&gt;{post.body}&lt;/p&gt;
&lt;/li&gt;
))}
&lt;/ul&gt;
);
};</p>
<p>export default Posts;</code></pre></p>
<h4 data-ke-size="size20">3. 전역 오류 핸들링</h4>
<p data-ke-size="size16">React Query에서는 QueryClient를 설정할 때 전역 오류 핸들러를 정의할 수 있습니다. 이는 애플리케이션 전체에서 발생하는 오류를 처리하는 데 유용합니다.</p>
<pre class="javascript"><code>// src/main.tsx 또는 src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
<p>const queryClient = new QueryClient({
defaultOptions: {
queries: {
onError: (error) =&gt; {
console.error('Global error handler:', error);
// 전역 오류 처리 로직을 여기에 작성할 수 있습니다.
},
},
},
});</p>
<p>ReactDOM.render(
&lt;React.StrictMode&gt;
&lt;QueryClientProvider client={queryClient}&gt;
&lt;App /&gt;
&lt;/QueryClientProvider&gt;
&lt;/React.StrictMode&gt;,
document.getElementById('root')
);</code></pre></p>
<p data-ke-size="size16">위 예제에서는 <code>QueryClient</code>를 생성할 때 <code>defaultOptions</code>를 설정하여 전역 오류 핸들러를 정의합니다. 이렇게 하면 모든 쿼리에서 발생하는 오류가 이 핸들러를 통해 처리됩니다.</p>
<p data-ke-size="size16">이와 같이 TanStack Query를 사용하면 다양한 방법으로 오류를 처리할 수 있습니다. 각 상황에 맞는 오류 처리 방법을 선택하여 사용하면 됩니다.</p>