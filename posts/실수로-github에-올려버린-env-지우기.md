<h2 data-ke-size="size26">gitignore에 환경변수 파일 설정</h2>
<pre id="code_1719600798611" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code># .gitignore
.env</code></pre>
<h2 data-ke-size="size26">환경변수 파일 캐시에서 제거</h2>
<pre id="code_1719600833503" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>git rm --cached .env</code></pre>
<h2 data-ke-size="size26">변경사항 커밋</h2>
<pre id="code_1719600843067" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>git commit -m "Remove .env file from repository"</code></pre>
<h2 data-ke-size="size26">변경사항 push</h2>
<pre id="code_1719600854520" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>git push origin main</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위 과정은 리포지토리에서 파일만 삭제하는 것이고 커밋 로그는 그대로 남아 있어서 이곳에서 볼 수 있으니, 필요하면 커밋 로그를 지우는 명령어를 사용해서 추가 조치한다.</p>