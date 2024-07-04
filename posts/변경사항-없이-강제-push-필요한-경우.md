<p data-ke-size="size16">로컬과 원격 리포지토리의 차이가 없어 변경사항이 없는데, 아니면 있는데 어떠한 문제로 변경사항이 없다고 나올 때,</p>
<p data-ke-size="size16">add commit 후 강제 push를 하면 되지만 변경사항이 없어서 commit을 못 남긴다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이럴 땐 빈 커밋을 생성하고 강제 push를 하면 push가 된다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">강제 push는 돌이킬 수 없을 수 있으니 최악의 상황에서만 사용한다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719424105738" class="css" data-ke-language="css" data-ke-type="codeblock"><code>// 빈 커밋 생성
git commit --allow-empty -m "Triggering a force push"
<p>// 강제 push
git push origin main --force</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">main 부분을 브랜치 이름으로 바꿔주면 된다.</p>