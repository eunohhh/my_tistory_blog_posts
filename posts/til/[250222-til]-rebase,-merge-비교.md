<p data-ke-size="size16">Git에서 <b>Rebase</b>와 <b>Merge</b>는 브랜치를 병합하는 두 가지 방식인데, 각각 장단점이 있어요. 실무에서는 코드 히스토리를 관리하는 전략에 따라 다르게 사용됩니다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>1️⃣ Merge (<code>git merge</code>)</b></h2>
<p data-ke-size="size16">✅ <b>기본적인 브랜치 병합 방식</b><br />✅ <b>새로운 Merge Commit이 생성됨</b></p>
<h3 data-ke-size="size23"><b>사용법</b></h3>
<pre class="properties"><code>git checkout main
git merge feature-branch</code></pre>
<h3 data-ke-size="size23"><b>예시</b></h3>
<pre class="brainfuck"><code>A---B---C (main)
     \
      D---E---F (feature-branch)</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">➡ <code>git merge feature-branch</code> 실행 후:</p>
<pre class="brainfuck"><code>A---B---C---M (main)
     \      /
      D---E---F (feature-branch)</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">✅ <code>M</code>(Merge Commit)이 생성됨.<br />✅ 과거 히스토리를 그대로 유지하며, 브랜치가 합쳐짐.</p>
<h3 data-ke-size="size23"><b>장점</b></h3>
<p data-ke-size="size16">✔️ 히스토리가 명확해져 변경 사항을 쉽게 추적 가능<br />✔️ 팀 협업에서 충돌이 발생해도 해결이 비교적 쉽고 안전</p>
<h3 data-ke-size="size23"><b>단점</b></h3>
<p data-ke-size="size16">❌ 불필요한 Merge Commit이 많아지면 히스토리가 지저분해짐<br />❌ <code>git log</code> 조회 시 브랜치가 분기되었다가 합쳐지는 흐름이 복잡해짐</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>2️⃣ Rebase (<code>git rebase</code>)</b></h2>
<p data-ke-size="size16">✅ <b>커밋 히스토리를 깔끔하게 유지</b><br />✅ <b>Merge Commit 없이 브랜치를 main 브랜치 뒤에 정렬</b></p>
<h3 data-ke-size="size23"><b>사용법</b></h3>
<pre class="properties"><code>git checkout feature-branch
git rebase main</code></pre>
<h3 data-ke-size="size23"><b>예시</b></h3>
<pre class="brainfuck"><code>A---B---C (main)
     \
      D---E---F (feature-branch)</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">➡ <code>git rebase main</code> 실행 후:</p>
<pre class="brainfuck"><code>A---B---C---D'---E'---F' (feature-branch)</code></pre>
<p data-ke-size="size16">✅ <code>feature-branch</code>의 커밋들이 <code>main</code> 브랜치 위로 다시 정렬됨.<br />✅ 마치 <code>feature-branch</code>가 <code>main</code>에서 바로 시작한 것처럼 히스토리가 깔끔해짐.</p>
<h3 data-ke-size="size23"><b>장점</b></h3>
<p data-ke-size="size16">✔️ <code>git log</code>가 직선형으로 유지되어 히스토리가 깔끔<br />✔️ <code>git blame</code>이 쉬워지고, 변경 사항 추적이 용이</p>
<h3 data-ke-size="size23"><b>단점</b></h3>
<p data-ke-size="size16">❌ 충돌이 발생하면 각 커밋마다 충돌을 해결해야 함<br />❌ 공유된 브랜치에서 Rebase 사용 시 팀원들과 충돌 가능</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>3️⃣ Merge vs Rebase 실무에서 어떻게 사용해야 할까?</b></h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>main</code> 브랜치에서 <code>feature</code> 브랜치를 만들고 작업</b> &rarr; <code>git rebase main</code>을 사용해 최신 상태로 유지</li>
<li><b>PR 머지 시</b> &rarr; Merge 전략을 선택
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>히스토리 보존이 필요하면 <code>git merge</code></b></li>
<li><b>히스토리를 깔끔하게 유지하고 싶으면 <code>git rebase main</code> 후 <code>git merge --ff-only</code></b></li>
</ul>
</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>4️⃣ 실무에서 안전한 Rebase &amp; Merge 방법</b></h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>브랜치 최신화 (<code>fetch &amp; rebase</code>)</b></li>
</ol>
<pre class="mipsasm"><code>git fetch origin
git checkout feature-branch
git rebase origin/main  # 최신 main 브랜치 반영</code></pre>
<ol style="list-style-type: decimal;" start="2" data-ke-list-type="decimal">
<li><b>충돌 해결 후 커밋 (<code>fix conflict &amp; continue</code>)</b></li>
</ol>
<pre class="cs"><code>git status  # 충돌 확인
# 충돌 파일 수정 후
git add .
git rebase --continue</code></pre>
<ol style="list-style-type: decimal;" start="3" data-ke-list-type="decimal">
<li><b>머지하기 (<code>rebase 후 fast-forward merge</code>)</b></li>
</ol>
<pre class="dsconfig"><code>git checkout main
git merge --ff-only feature-branch  # fast-forward 병합</code></pre>
<ol style="list-style-type: decimal;" start="4" data-ke-list-type="decimal">
<li><b>로컬 정리 (<code>delete branch</code>)</b></li>
</ol>
<pre class="mipsasm"><code>git branch -d feature-branch  # 로컬 브랜치 삭제
git push origin --delete feature-branch  # 원격 브랜치 삭제</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>5️⃣ 정리</b></h2>
<table style="height: 96px;" data-ke-align="alignLeft">
<thead>
<tr style="height: 20px;">
<th style="height: 20px; width: 125px;">방식</th>
<th style="height: 20px; width: 183px;">특징</th>
<th style="height: 20px; width: 190px;">장점</th>
<th style="height: 20px; width: 204px;">단점</th>
<th style="height: 20px; width: 145px;">사용 추천 상황</th>
</tr>
</thead>
<tbody>
<tr style="height: 38px;">
<td style="height: 38px; width: 125px;"><code>git merge</code></td>
<td style="height: 38px; width: 183px;">브랜치를 병합하고 Merge Commit 생성</td>
<td style="height: 38px; width: 190px;">히스토리 보존, 충돌 해결 쉬움</td>
<td style="height: 38px; width: 204px;">Merge Commit이 많아지면 지저분</td>
<td style="height: 38px; width: 145px;">팀 협업 시 안정적</td>
</tr>
<tr style="height: 38px;">
<td style="height: 38px; width: 125px;"><code>git rebase</code></td>
<td style="height: 38px; width: 183px;">브랜치를 최신 브랜치 위로 재배치</td>
<td style="height: 38px; width: 190px;">히스토리가 깔끔</td>
<td style="height: 38px; width: 204px;">충돌 발생 시 해결 번거로움</td>
<td style="height: 38px; width: 145px;">개인 브랜치 정리 시 추천</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">➡ <b>협업에서는 <code>git merge</code>, 개인 작업에서는 <code>git rebase</code></b> 를 주로 사용하는 게 일반적이에요!  <br />➡ 회사에서 어떤 Git 전략을 사용하는지 먼저 확인하고 적용하는 게 중요합니다.  </p>