<h2 data-ke-size="size26">git config --global --list 실행시</h2>
<p data-ke-size="size16">뭔가 좀 꼬여가지고 대충 아래와 같이 나오는 상황이었는데<br />credential.helper 를 지우고 싶었습니다...</p>
<pre class="ini"><code>filter.lfs.clean=git-lfs clean -- %f
filter.lfs.smudge=git-lfs smudge -- %f
filter.lfs.process=git-lfs filter-process
filter.lfs.required=true
credential.helper=cache</code></pre>
<pre class="awk"><code>git config --global --unset credential.helper
git credential-cache exit</code></pre>
<p data-ke-size="size16">위 명령어는 글로벌 Git 설정에서 credential.helper 항목을 삭제하고 캐시된 인증 정보도 삭제합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">macOS 키체인 사용</h3>
<pre class="routeros"><code>git config --global credential.helper osxkeychain</code></pre>
<p data-ke-size="size16">근데 이 설정했다가 .ssh 에 뭔가 꼬였을 때 git push, pull 다 안된적이 있었습니다...<br />뭐가 문제였을지 더 찾아봐야겠지만 아마도 ssh 로 여러 github 아이디 사용하려다가 문제가 생겼던 것 같아요.<br />(현재는 .ssh 숨김폴더의 설정들 다 깨끗하게 초기화함)</p>