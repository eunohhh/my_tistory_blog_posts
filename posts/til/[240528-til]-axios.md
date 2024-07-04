<p>오늘은 리액트에서 HTTP 요청을 보내는 방법 중 Axios 에 대해 알아보려고 합니다.</p>
<p>Axios는 비동기적으로 데이터를 가져오거나 서버에 데이터를 보내는 데 유용한 HTTP 클라이언트 라이브러리입니다.<br>아래에 Axios를 리액트 프로젝트에 통합하여 사용하는 방법을 단계별로 정리합니다.</p>
<h3>1. Axios 설치</h3>
<p>먼저, Axios를 프로젝트에 설치합니다. 터미널에서 다음 명령어를 실행합니다.</p>
<pre><code class="language-bash">npm install axios</code></pre>
<p>또는 Yarn을 사용하는 경우:</p>
<pre><code class="language-bash">yarn add axios</code></pre>
<h3>2. Axios 설정</h3>
<p>필요한 경우, Axios 인스턴스를 설정하여 기본 URL이나 공통 헤더 등을 설정할 수 있습니다. 하지만 간단한 사용을 위해 기본 설정을 사용해 보겠습니다.</p>
<h3>3. 간단한 GET 요청 예시</h3>
<p>리액트 컴포넌트에서 Axios를 사용하여 데이터를 가져오는 예제 입니다. 여기서는 간단히 Jsonplaceholder 를 사용합니다.</p>
<pre><code class="language-javascript">import React, { useState, useEffect } from &#39;react&#39;;
import axios from &#39;axios&#39;;
<p>const DataFetching = () =&gt; {
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);</p>
<p>useEffect(() =&gt; {
// 데이터 가져오기
axios.get('https://jsonplaceholder.typicode.com/posts')
.then((response) =&gt; {
setData(response.data);
setLoading(false);
})
.catch((error) =&gt; {
setError(error);
setLoading(false);
});
}, []);</p>
<p>if (loading) return &lt;p&gt;Loading...&lt;/p&gt;;
if (error) return &lt;p&gt;Error: {error.message}&lt;/p&gt;;</p>
<p>return (
&lt;div&gt;
&lt;h1&gt;Posts&lt;/h1&gt;
&lt;ul&gt;
{data.map(post =&gt; (
&lt;li key={post.id}&gt;{post.title}&lt;/li&gt;
))}
&lt;/ul&gt;
&lt;/div&gt;
);
};</p>
<p>export default DataFetching;</code></pre></p>
<h3>4. POST 요청 예시</h3>
<p>서버에 데이터를 보내는 POST 요청의 예제입니다.</p>
<pre><code class="language-javascript">import React, { useState } from &#39;react&#39;;
import axios from &#39;axios&#39;;
<p>const CreatePost = () =&gt; {
const [title, setTitle] = useState('');
const [body, setBody] = useState('');
const [response, setResponse] = useState(null);</p>
<p>const handleSubmit = (e) =&gt; {
e.preventDefault();</p>
<pre><code>const postData = {
  title: title,
  body: body,
};

axios.post(&amp;#39;https://jsonplaceholder.typicode.com/posts&amp;#39;, postData)
  .then((response) =&amp;gt; {
    setResponse(response.data);
  })
  .catch((error) =&amp;gt; {
    console.error(&amp;#39;There was an error creating the post!&amp;#39;, error);
  });
</code></pre>
<p>};</p>
<p>return (
&lt;div&gt;
&lt;h1&gt;Create Post&lt;/h1&gt;
&lt;form onSubmit={handleSubmit}&gt;
&lt;div&gt;
&lt;label&gt;Title:&lt;/label&gt;
&lt;input
type=&quot;text&quot;
value={title}
onChange={(e) =&gt; setTitle(e.target.value)}
/&gt;
&lt;/div&gt;
&lt;div&gt;
&lt;label&gt;Body:&lt;/label&gt;
&lt;textarea
value={body}
onChange={(e) =&gt; setBody(e.target.value)}
&gt;&lt;/textarea&gt;
&lt;/div&gt;
&lt;button type=&quot;submit&quot;&gt;Create&lt;/button&gt;
&lt;/form&gt;
{response &amp;&amp; (
&lt;div&gt;
&lt;h2&gt;Response:&lt;/h2&gt;
&lt;pre&gt;{JSON.stringify(response, null, 2)}&lt;/pre&gt;
&lt;/div&gt;
)}
&lt;/div&gt;
);
};</p>
<p>export default CreatePost;</code></pre></p>
<h3>5. Axios 인스턴스 사용</h3>
<p>반복적으로 사용되는 설정을 위한 Axios 인스턴스를 생성하여 사용할 수 있습니다.</p>
<pre><code class="language-javascript">import axios from &#39;axios&#39;;
<p>// 기본 URL 및 기타 설정을 포함한 인스턴스 생성
const axiosInstance = axios.create({
baseURL: 'https://jsonplaceholder.typicode.com',
timeout: 1000,
headers: { 'X-Custom-Header': 'foobar' }
});</p>
<p>export default axiosInstance;</code></pre></p>
<p>그 후, 컴포넌트에서 인스턴스를 사용하여 요청을 보낼 수 있습니다.</p>
<pre><code class="language-javascript">import React, { useState, useEffect } from &#39;react&#39;;
import axiosInstance from &#39;./axiosInstance&#39;;
<p>const DataFetching = () =&gt; {
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);</p>
<p>useEffect(() =&gt; {
axiosInstance.get('/posts')
.then((response) =&gt; {
setData(response.data);
setLoading(false);
})
.catch((error) =&gt; {
setError(error);
setLoading(false);
});
}, []);</p>
<p>if (loading) return &lt;p&gt;Loading...&lt;/p&gt;;
if (error) return &lt;p&gt;Error: {error.message}&lt;/p&gt;;</p>
<p>return (
&lt;div&gt;
&lt;h1&gt;Posts&lt;/h1&gt;
&lt;ul&gt;
{data.map(post =&gt; (
&lt;li key={post.id}&gt;{post.title}&lt;/li&gt;
))}
&lt;/ul&gt;
&lt;/div&gt;
);
};</p>
<p>export default DataFetching;</code></pre></p>
<h3>요약</h3>
<ol>
<li><strong>Axios 설치</strong>: <code>npm install axios</code> 또는 <code>yarn add axios</code></li>
<li><strong>GET 요청</strong>: <code>axios.get(url)</code>을 사용하여 데이터 가져오기</li>
<li><strong>POST 요청</strong>: <code>axios.post(url, data)</code>을 사용하여 데이터 전송</li>
<li><strong>Axios 인스턴스</strong>: 반복적인 설정을 위한 Axios 인스턴스 생성 및 사용</li>
</ol>
<p>이렇게 하면 리액트 프로젝트에서 Axios를 사용하여 간편하게 HTTP 요청을 보낼 수 있습니다. 필요에 따라 더 복잡한 설정이나 요청 처리 로직을 추가할 수 있습니다.</p>