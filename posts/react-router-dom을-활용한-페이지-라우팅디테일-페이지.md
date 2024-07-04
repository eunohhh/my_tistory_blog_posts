<h2 data-ke-size="size26">패키지 설치</h2>
<pre id="code_1719472931302" class="html xml" data-ke-language="html" data-ke-type="codeblock"><code>yarn add react-router-dom</code></pre>
<h2 data-ke-size="size26">폴더 및 파일 생성하기</h2>
<pre id="code_1719489070109" class="html xml" data-ke-language="html" data-ke-type="codeblock"><code>  
├─&nbsp;.env ✅
├─&nbsp;.eslintrc.cjs
├─&nbsp;.gitignore
├─&nbsp;README.md
├─&nbsp;index.html
├─&nbsp;package.json
├─&nbsp;public
│&nbsp;&nbsp;└─&nbsp;vite.svg
├─&nbsp;src
│&nbsp;&nbsp;├─&nbsp;App.tsx
│&nbsp;&nbsp;├─&nbsp;api
│&nbsp;&nbsp;│&nbsp;&nbsp;└─&nbsp;api.ts ✅
│&nbsp;&nbsp;├─&nbsp;main.tsx
│&nbsp;&nbsp;├─&nbsp;pages
│&nbsp;&nbsp;│&nbsp;&nbsp;├─&nbsp;SponsorDetail.tsx ✅
│&nbsp;&nbsp;│&nbsp;&nbsp;└─&nbsp;SponsorList.tsx ✅
│&nbsp;&nbsp;├─&nbsp;routes
│&nbsp;&nbsp;│&nbsp;&nbsp;└─&nbsp;routes.tsx ✅
│&nbsp;&nbsp;└─&nbsp;vite-env.d.ts
├─&nbsp;tsconfig.app.json
├─&nbsp;tsconfig.json
├─&nbsp;tsconfig.node.json
├─&nbsp;vite.config.ts
└─&nbsp;yarn.lock</code></pre>
<p data-ke-size="size16">✅ 표시가 처음 세팅한 내용.</p>
<h2 data-ke-size="size26">페이지 라우팅 설정하기</h2>
<pre id="code_1719489160106" class="html xml" data-ke-language="html" data-ke-type="codeblock"><code>// src/routes/routes.tsx
<p>import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SponsorDetail from '../pages/SponsorDetail';
import SponsorList from '../pages/SponsorList';</p>
<p>const AppRoutes = () =&gt; {
return (
&lt;Router&gt;
&lt;Routes&gt;
&lt;Route path=&quot;/&quot; element={&lt;SponsorList /&gt;} /&gt;
&lt;Route path=&quot;/detail/:id&quot; element={&lt;SponsorDetail /&gt;} /&gt;
&lt;/Routes&gt;
&lt;/Router&gt;
);
};</p>
<p>export default AppRoutes;</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>모듈 import하기
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';</li>
<li>페이지 라우팅 할 페이지들</li>
</ul>
</li>
<li>함수형 컴포넌트 세팅
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>&lt;Router&gt; 안에 &lt;Routes&gt; 안에 실제 페이지인 &lt;Route&gt; 들.</li>
</ul>
</li>
</ul>
<h2 data-ke-size="size26">App 컴포넌트 라우트 호출</h2>
<pre id="code_1719489324695" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// src/App.tsx
<p>import AppRoutes from './routes/routes';</p>
<p>function App() {
return &lt;AppRoutes /&gt;;
}</p>
<p>export default App;</code></pre></p>
<h2 data-ke-size="size26">실제 페이지 작성</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>url 파라미터로 내용을 주고 받는 페이지가 아닌 곳은 그냥 작성하면 됨.</li>
<li>url 파라미터를 전달받는 페이지의 설정에서는 useParams 훅으로 라우팅 설정한 곳에서 :id 같은 url 파라미터 중 페이지에서 받아와야 하는 것을 구조 분해 할당 해서 꺼내와야 함.</li>
</ul>
<pre id="code_1719489469778" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// src/pages/URL 파라미터를 받는 페이지.tsx
<p>import { useParams } from 'react-router-dom';</p>
<p>const SponsorDetail = () =&gt; {
const { id } = useParams&lt;{ id: string }&gt;();
return (
&lt;h1&gt;Sponsor Detail Page for ID: {id}&lt;/h1&gt;
)
};</p>
<p>export default SponsorDetail;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>