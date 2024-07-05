<p>오늘은 mock 데이터를 보내주는 가상 서버를 만들어 연습 등등에 사용할 수 있는 방법을 배웠습니다.<br>JSON Server 가 그것으로, JSON Server는 간단한 REST API 서버를 만들기 위해 사용되는 라이브러리라고 합니다.</p>
<p>JSON Server를 통해 JSON 파일을 기반으로 빠르게 Mock API를 생성할 수 있습니다. JSON Server의 설치 및 기본 사용법을 정리합니다.</p>
<h3>1. JSON Server 설치</h3>
<p>먼저 JSON Server를 글로벌로 설치합니다.</p>
<pre><code class="language-bash">npm install -g json-server</code></pre>
<h3>2. JSON 파일 준비</h3>
<p>JSON Server는 JSON 파일을 데이터베이스로 사용합니다. 프로젝트 루트 디렉토리에 <code>db.json</code> 파일을 생성하고 다음과 같이 데이터를 준비합니다.</p>
<pre><code class="language-json">// db.json
{
  &quot;posts&quot;: [
    { &quot;id&quot;: 1, &quot;title&quot;: &quot;Hello World&quot;, &quot;author&quot;: &quot;John Doe&quot; },
    { &quot;id&quot;: 2, &quot;title&quot;: &quot;JSON Server&quot;, &quot;author&quot;: &quot;Jane Doe&quot; }
  ],
  &quot;comments&quot;: [
    { &quot;id&quot;: 1, &quot;postId&quot;: 1, &quot;body&quot;: &quot;Nice post!&quot; },
    { &quot;id&quot;: 2, &quot;postId&quot;: 2, &quot;body&quot;: &quot;Very useful!&quot; }
  ],
  &quot;profile&quot;: { &quot;name&quot;: &quot;John Doe&quot; }
}</code></pre>
<h3>3. JSON Server 실행</h3>
<p>JSON Server를 실행하여 REST API 서버를 시작합니다.</p>
<pre><code class="language-bash">json-server --watch db.json</code></pre>
<p>이 명령어를 실행하면 JSON Server는 기본적으로 <code>http://localhost:3000</code>에서 실행됩니다.</p>
<h3>4. REST API 사용</h3>
<p>JSON Server가 실행되면 다음과 같은 RESTful 엔드포인트를 사용할 수 있습니다:</p>
<ul>
<li><code>GET /posts</code>: 모든 게시물을 가져옵니다.</li>
<li><code>GET /posts/1</code>: ID가 1인 게시물을 가져옵니다.</li>
<li><code>POST /posts</code>: 새로운 게시물을 생성합니다.</li>
<li><code>PUT /posts/1</code>: ID가 1인 게시물을 업데이트합니다.</li>
<li><code>DELETE /posts/1</code>: ID가 1인 게시물을 삭제합니다.</li>
</ul>
<h3>5. REST API 예제</h3>
<p><code>curl</code> 명령어를 사용하여 JSON Server의 REST API를 호출하는 예제는 다음과 같습니다.</p>
<ol>
<li><strong>모든 게시물 가져오기</strong></li>
</ol>
<pre><code class="language-bash">curl http://localhost:3000/posts</code></pre>
<ol start="2">
<li><strong>ID가 1인 게시물 가져오기</strong></li>
</ol>
<pre><code class="language-bash">curl http://localhost:3000/posts/1</code></pre>
<ol start="3">
<li><strong>새로운 게시물 생성하기</strong></li>
</ol>
<pre><code class="language-bash">curl -X POST -H &quot;Content-Type: application/json&quot; -d &#39;{&quot;title&quot;: &quot;New Post&quot;, &quot;author&quot;: &quot;Alice&quot;}&#39; http://localhost:3000/posts</code></pre>
<ol start="4">
<li><strong>ID가 1인 게시물 업데이트하기</strong></li>
</ol>
<pre><code class="language-bash">curl -X PUT -H &quot;Content-Type: application/json&quot; -d &#39;{&quot;title&quot;: &quot;Updated Post&quot;, &quot;author&quot;: &quot;John Doe&quot;}&#39; http://localhost:3000/posts/1</code></pre>
<ol start="5">
<li><strong>ID가 1인 게시물 삭제하기</strong></li>
</ol>
<pre><code class="language-bash">curl -X DELETE http://localhost:3000/posts/1</code></pre>
<h3>6. React에서 사용하기</h3>
<p>React 애플리케이션에서 JSON Server와 통신하는 방법은 다음과 같습니다</p>
<ol>
<li><strong>프로젝트 설정</strong></li>
</ol>
<pre><code class="language-bash">npx create-react-app json-server-demo
cd json-server-demo
npm install axios</code></pre>
<ol start="2">
<li><strong>API 호출</strong></li>
</ol>
<p><code>App.js</code> 파일을 수정하여 JSON Server에서 데이터를 가져오도록 합니다.</p>
<pre><code class="language-javascript">// src/App.js
import React, { useEffect, useState } from &#39;react&#39;;
import axios from &#39;axios&#39;;
<p>const App = () =&gt; {
const [posts, setPosts] = useState([]);</p>
<p>useEffect(() =&gt; {
axios.get('http://localhost:3000/posts')
.then(response =&gt; {
setPosts(response.data);
})
.catch(error =&gt; {
console.error('There was an error fetching the posts!', error);
});
}, []);</p>
<p>return (
&lt;div&gt;
&lt;h1&gt;Posts&lt;/h1&gt;
&lt;ul&gt;
{posts.map(post =&gt; (
&lt;li key={post.id}&gt;{post.title} by {post.author}&lt;/li&gt;
))}
&lt;/ul&gt;
&lt;/div&gt;
);
};</p>
<p>export default App;</code></pre></p>
<p>이제 React 애플리케이션을 실행하면 JSON Server에서 데이터를 가져와서 화면에 표시합니다.</p>
<h3>7. JSON Server 커스터마이징</h3>
<p>JSON Server는 다양한 옵션으로 커스터마이징이 가능합니다.</p>
<ul>
<li><p><strong>포트 변경</strong>: 기본 포트를 변경하려면 <code>--port</code> 옵션을 사용합니다.</p>
<pre><code class="language-bash">json-server --watch db.json --port 4000</code></pre>
</li>
<li><p><strong>라우팅 설정</strong>: <code>routes.json</code> 파일을 사용하여 커스텀 라우트를 설정할 수 있습니다.</p>
<pre><code class="language-json">// routes.json
{
  &quot;/api/&quot;: &quot;/&quot;
}</code></pre>
<pre><code class="language-bash">json-server --watch db.json --routes routes.json</code></pre>
</li>
<li><p>**Middleware 사용: <code>server.js</code> 파일을 생성하여 Middleware 를 추가할 수 있습니다.</p>
<pre><code class="language-javascript">// server.js
const jsonServer = require(&#39;json-server&#39;);
const server = jsonServer.create();
const router = jsonServer.router(&#39;db.json&#39;);
const middlewares = jsonServer.defaults();
<p>server.use(middlewares);
server.use(jsonServer.bodyParser);</p>
<p>server.use((req, res, next) =&gt; {
if (req.method === 'POST') {
req.body.createdAt = Date.now();
}
next();
});</p>
<p>server.use(router);</p>
<p>server.listen(3000, () =&gt; {
console.log('JSON Server is running');
});</code></pre></p>
<pre><code class="language-bash">node server.js</code></pre>
</li>
</ul>
<p>이처럼 JSON Server를 사용하여 빠르게 Mock API 서버를 만들고, 이를 통해 애플리케이션을 개발하고 테스트가 가능합니다.</p>