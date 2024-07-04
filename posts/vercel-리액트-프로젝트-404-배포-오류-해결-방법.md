<p data-ke-size="size16">메인 도메인에서는 잘 작동하나, 라우트 페이지에서 리프레쉬 되거나 새로고침을 누르면 404 에러가 뜬다.</p>
<p data-ke-size="size16">Next.js 프로젝트에서는 이런 문제가 없으나 React.js에서는 이런 문제가 발생한다.</p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">해결방법</h2>
<p data-ke-size="size16">루트 폴더에 vercel.json 폴더 생성</p>
<p data-ke-size="size16">아래 코드 복붙</p>
<pre id="code_1719589219960" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>{
    "routes": [{ "handle": "filesystem" }, { "src": "/.*", "dest": "/index.html" }]
}</code></pre>