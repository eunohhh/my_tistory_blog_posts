<h2 data-ke-size="size26">post-commit(husky)</h2>
<p data-ke-size="size16">post-commit 파일은 husky로 pre-commit 하여 linting 을 수행했을 때, linting 되면서 변경되는 파일들이 많아서 해당 파일들도 한번더 커밋 하도록 한 것인데, 파일별로 커밋을 나눠서 하고 싶을 때에도 모든 파일을 커밋해버린다거나 하는 문제가 있어요. 해결할 방법이 있을까요?</p>
<pre class="bash"><code>#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
<h1>Get the list of staged files before linting</h1>
<p>STAGED_FILES=$(git diff --cached --name-only)</p>
<h1>Run linting</h1>
<p>pnpm lint
pnpm format</p>
<h1>Get the list of modified files after linting</h1>
<p>MODIFIED_FILES=$(git diff --name-only)</p>
<h1>Find files that were both staged and modified</h1>
<p>FILES_TO_COMMIT=$(comm -12 &lt;(echo &quot;$STAGED_FILES&quot; | sort) &lt;(echo &quot;$MODIFIED_FILES&quot; | sort))</p>
<p>if [ ! -z &quot;$FILES_TO_COMMIT&quot; ]; then</p>
<h1>Add only the files that were both staged and modified</h1>
<p>echo &quot;$FILES_TO_COMMIT&quot; | xargs git add
git commit --amend --no-edit
fi</code></pre></p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>linting 전에 스테이징된 파일들의 목록을 저장</li>
<li>linting과 포맷팅 실행</li>
<li>linting 후에 수정된 파일들의 목록을 가져옴</li>
<li><code>comm</code> 명령어를 사용하여 두 목록의 교집합을 찾음 (즉, 원래 스테이징되어 있었고 linting으로 수정된 파일들)</li>
<li>해당 파일들만 <code>git add</code>로 스테이징하고 커밋을 수정</li>
</ol>
<p data-ke-size="size16">이렇게 하면:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>linting으로 수정된 파일들만 커밋됨</li>
<li>다른 파일들은 영향을 받지 않음</li>
<li>원래 커밋 메시지는 유지됨 (<code>--no-edit</code> 옵션 사용)</li>
</ul>
<p data-ke-size="size16">이제 파일별로 커밋을 나누어 할 때도 linting 수정사항만 해당 파일에 적용됩니다.</p>