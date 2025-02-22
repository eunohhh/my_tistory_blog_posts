<p>Git에서 <strong>Rebase</strong>와 <strong>Merge</strong>는 브랜치를 병합하는 두 가지 방식인데, 각각 장단점이 있어요. 실무에서는 코드 히스토리를 관리하는 전략에 따라 다르게 사용됩니다.</p>
<hr>
<h2><strong>1️⃣ Merge (<code>git merge</code>)</strong></h2>
<p>✅ <strong>기본적인 브랜치 병합 방식</strong><br>✅ <strong>새로운 Merge Commit이 생성됨</strong></p>
<h3><strong>사용법</strong></h3>
<pre><code class="language-bash">git checkout main
git merge feature-branch</code></pre>
<h3><strong>예시</strong></h3>
<pre><code>A---B---C (main)
     \
      D---E---F (feature-branch)</code></pre><p>➡ <code>git merge feature-branch</code> 실행 후:</p>
<pre><code>A---B---C---M (main)
     \      /
      D---E---F (feature-branch)</code></pre><p>✅ <code>M</code>(Merge Commit)이 생성됨.<br>✅ 과거 히스토리를 그대로 유지하며, 브랜치가 합쳐짐.</p>
<h3><strong>장점</strong></h3>
<p>✔️ 히스토리가 명확해져 변경 사항을 쉽게 추적 가능<br>✔️ 팀 협업에서 충돌이 발생해도 해결이 비교적 쉽고 안전</p>
<h3><strong>단점</strong></h3>
<p>❌ 불필요한 Merge Commit이 많아지면 히스토리가 지저분해짐<br>❌ <code>git log</code> 조회 시 브랜치가 분기되었다가 합쳐지는 흐름이 복잡해짐</p>
<hr>
<h2><strong>2️⃣ Rebase (<code>git rebase</code>)</strong></h2>
<p>✅ <strong>커밋 히스토리를 깔끔하게 유지</strong><br>✅ <strong>Merge Commit 없이 브랜치를 main 브랜치 뒤에 정렬</strong></p>
<h3><strong>사용법</strong></h3>
<pre><code class="language-bash">git checkout feature-branch
git rebase main</code></pre>
<h3><strong>예시</strong></h3>
<pre><code>A---B---C (main)
     \
      D---E---F (feature-branch)</code></pre><p>➡ <code>git rebase main</code> 실행 후:</p>
<pre><code>A---B---C---D&#39;---E&#39;---F&#39; (feature-branch)</code></pre><p>✅ <code>feature-branch</code>의 커밋들이 <code>main</code> 브랜치 위로 다시 정렬됨.<br>✅ 마치 <code>feature-branch</code>가 <code>main</code>에서 바로 시작한 것처럼 히스토리가 깔끔해짐.</p>
<h3><strong>장점</strong></h3>
<p>✔️ <code>git log</code>가 직선형으로 유지되어 히스토리가 깔끔<br>✔️ <code>git blame</code>이 쉬워지고, 변경 사항 추적이 용이</p>
<h3><strong>단점</strong></h3>
<p>❌ 충돌이 발생하면 각 커밋마다 충돌을 해결해야 함<br>❌ 공유된 브랜치에서 Rebase 사용 시 팀원들과 충돌 가능</p>
<hr>
<h2><strong>3️⃣ Merge vs Rebase 실무에서 어떻게 사용해야 할까?</strong></h2>
<ul>
<li><strong><code>main</code> 브랜치에서 <code>feature</code> 브랜치를 만들고 작업</strong> → <code>git rebase main</code>을 사용해 최신 상태로 유지</li>
<li><strong>PR 머지 시</strong> → Merge 전략을 선택<ul>
<li><strong>히스토리 보존이 필요하면 <code>git merge</code></strong></li>
<li><strong>히스토리를 깔끔하게 유지하고 싶으면 <code>git rebase main</code> 후 <code>git merge --ff-only</code></strong></li>
</ul>
</li>
</ul>
<hr>
<h2><strong>4️⃣ 실무에서 안전한 Rebase &amp; Merge 방법</strong></h2>
<ol>
<li><strong>브랜치 최신화 (<code>fetch &amp; rebase</code>)</strong></li>
</ol>
<pre><code class="language-bash">git fetch origin
git checkout feature-branch
git rebase origin/main  # 최신 main 브랜치 반영</code></pre>
<ol start="2">
<li><strong>충돌 해결 후 커밋 (<code>fix conflict &amp; continue</code>)</strong></li>
</ol>
<pre><code class="language-bash">git status  # 충돌 확인
# 충돌 파일 수정 후
git add .
git rebase --continue</code></pre>
<ol start="3">
<li><strong>머지하기 (<code>rebase 후 fast-forward merge</code>)</strong></li>
</ol>
<pre><code class="language-bash">git checkout main
git merge --ff-only feature-branch  # fast-forward 병합</code></pre>
<ol start="4">
<li><strong>로컬 정리 (<code>delete branch</code>)</strong></li>
</ol>
<pre><code class="language-bash">git branch -d feature-branch  # 로컬 브랜치 삭제
git push origin --delete feature-branch  # 원격 브랜치 삭제</code></pre>
<hr>
<h2><strong>5️⃣ 정리</strong></h2>
<table>
<thead>
<tr>
<th>방식</th>
<th>특징</th>
<th>장점</th>
<th>단점</th>
<th>사용 추천 상황</th>
</tr>
</thead>
<tbody><tr>
<td><code>git merge</code></td>
<td>브랜치를 병합하고 Merge Commit 생성</td>
<td>히스토리 보존, 충돌 해결 쉬움</td>
<td>Merge Commit이 많아지면 지저분</td>
<td>팀 협업 시 안정적</td>
</tr>
<tr>
<td><code>git rebase</code></td>
<td>브랜치를 최신 브랜치 위로 재배치</td>
<td>히스토리가 깔끔</td>
<td>충돌 발생 시 해결 번거로움</td>
<td>개인 브랜치 정리 시 추천</td>
</tr>
</tbody></table>
<p>➡ <strong>협업에서는 <code>git merge</code>, 개인 작업에서는 <code>git rebase</code></strong> 를 주로 사용하는 게 일반적이에요!  <br>➡ 회사에서 어떤 Git 전략을 사용하는지 먼저 확인하고 적용하는 게 중요합니다.  </p>