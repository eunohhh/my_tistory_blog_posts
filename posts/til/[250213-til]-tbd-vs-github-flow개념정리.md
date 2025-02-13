<h3 data-ke-size="size23"><b>  Trunk-Based Development vs GitHub Flow 차이점</b></h3>
<p data-ke-size="size16">둘 다 <b>가벼운 브랜치 전략</b>으로, 빠른 배포를 목표로 합니다. 하지만 몇 가지 중요한 차이가 있습니다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>  1. Trunk-Based Development (TBD)</b></h2>
<p data-ke-size="size16">✅ <b>핵심 개념:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>main</code> 브랜치(=Trunk)에서 <b>직접 개발</b>하고,</li>
<li><b>짧은-lived feature 브랜치</b>만 사용하며,</li>
<li><b>하루에도 여러 번 <code>main</code>에 머지</b>하는 방식.</li>
</ul>
<p data-ke-size="size16">✅ <b>특징:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>브랜치는 짧게 유지</b> &rarr; 몇 시간 또는 하루 이내 병합</li>
<li><b>Long-lived feature 브랜치 없음</b> &rarr; <code>develop</code> 브랜치 X</li>
<li><b>CI/CD 필수</b> &rarr; <code>main</code>에 병합 시 항상 배포 가능 상태 유지</li>
</ul>
<p data-ke-size="size16">✅ <b>워크플로우:</b></p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><code>main</code>에서 직접 개발하거나 짧은-lived 브랜치 생성</li>
<li>빠르게 개발 후 <code>main</code>에 머지</li>
<li>CI/CD가 <code>main</code>의 상태를 항상 배포 가능하도록 유지</li>
</ol>
<p data-ke-size="size16">✅ <b>장점:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>빠른 배포 &amp; 지속적 통합 가능</li>
<li>충돌 관리가 쉽고 코드 병합이 간단</li>
<li>롤백이 빠름 (feature flag와 함께 사용)</li>
</ul>
<p data-ke-size="size16">✅ <b>단점:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>즉시 배포 가능한 코드 품질 유지 필요</b></li>
<li>팀원 간 <b>충돌 가능성이 높음</b> &rarr; 코드 리뷰 &amp; CI/CD 필수</li>
<li><b>Feature toggle(플래그) 필요</b> &rarr; 미완성 기능을 숨기려면 설정 필요</li>
</ul>
<p data-ke-size="size16">✅ <b>사용 사례:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Google, Meta, Netflix 등 <b>배포 속도가 중요한 대규모 서비스</b></li>
<li><b>DevOps, CI/CD 환경이 잘 갖춰진 조직</b></li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>  2. GitHub Flow</b></h2>
<p data-ke-size="size16">✅ <b>핵심 개념:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>main</code> 브랜치에서 <b>배포 가능한 상태 유지</b>,</li>
<li><b>모든 변경 사항은 feature 브랜치에서 개발</b> 후</li>
<li><b>Pull Request를 통해 <code>main</code>에 머지</b>하는 방식.</li>
</ul>
<p data-ke-size="size16">✅ <b>특징:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>main</code> 브랜치는 <b>항상 배포 가능</b>해야 함</li>
<li>Feature 브랜치를 생성하고 PR(Pull Request)로 머지</li>
<li>CI/CD를 통해 <code>main</code> 브랜치가 업데이트되면 <b>자동 배포</b></li>
</ul>
<p data-ke-size="size16">✅ <b>워크플로우:</b></p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><code>main</code>에서 <b>feature 브랜치 생성</b></li>
<li>브랜치에서 개발 진행 후 <b>PR 작성</b></li>
<li>코드 리뷰 후 <code>main</code>에 머지</li>
<li>CI/CD를 통해 배포</li>
</ol>
<p data-ke-size="size16">✅ <b>장점:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>단순한 브랜치 전략</b> &rarr; 배우기 쉽고 관리 용이</li>
<li><b>배포 자동화와 잘 맞음</b> &rarr; PR 병합 후 자동 배포</li>
<li><b>GitHub과 연계</b> &rarr; GitHub Actions, CI/CD와 쉽게 통합 가능</li>
</ul>
<p data-ke-size="size16">✅ <b>단점:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>긴-lived 브랜치가 생길 가능성</b> &rarr; PR 리뷰 대기 시 지연 발생</li>
<li><b>코드 충돌 가능성</b> &rarr; 브랜치가 길어지면 충돌 위험 증가</li>
<li><b>Feature toggle 필요할 수 있음</b> &rarr; 큰 기능 추가 시 미완성 코드 방지 필요</li>
</ul>
<p data-ke-size="size16">✅ <b>사용 사례:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>스타트업, 소규모 프로젝트</b></li>
<li><b>GitHub Actions 기반 CI/CD가 있는 환경</b></li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>  차이점 정리</b></h2>
<table data-ke-align="alignLeft" data-ke-style="style4">
<thead>
<tr>
<th>&nbsp;</th>
<th><b>Trunk-Based Development</b></th>
<th><b>GitHub Flow</b></th>
</tr>
</thead>
<tbody>
<tr>
<td><b>브랜치 구조</b></td>
<td><code>main</code>에서 직접 개발, 짧은-lived 브랜치 사용</td>
<td><code>main</code>에서 feature 브랜치 생성 후 PR로 병합</td>
</tr>
<tr>
<td><b>병합 방식</b></td>
<td>직접 <code>main</code>에 머지</td>
<td>PR을 통한 리뷰 후 <code>main</code>에 머지</td>
</tr>
<tr>
<td><b>배포 전략</b></td>
<td><code>main</code>은 항상 배포 가능 상태, <b>즉시 병합 &amp; 배포</b></td>
<td>PR 병합 후 CI/CD를 통해 자동 배포</td>
</tr>
<tr>
<td><b>코드 리뷰</b></td>
<td>코드 리뷰 없이 바로 머지 가능 (CI 테스트 필수)</td>
<td>PR을 통한 코드 리뷰 필수</td>
</tr>
<tr>
<td><b>Feature 브랜치</b></td>
<td>거의 없음 (있어도 매우 짧게)</td>
<td>Feature 브랜치를 적극적으로 활용</td>
</tr>
<tr>
<td><b>CI/CD 필요 여부</b></td>
<td>필수</td>
<td>필수</td>
</tr>
<tr>
<td><b>적합한 팀 규모</b></td>
<td>대규모 팀, DevOps 조직</td>
<td>소규모 팀, 스타트업, GitHub 중심 개발</td>
</tr>
</tbody>
</table>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>  결론</b></h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>TBD</b> &rarr; <b>빠른 배포가 중요한 대기업, DevOps 조직</b>에 적합</li>
<li><b>GitHub Flow</b> &rarr; <b>소규모 팀, GitHub 기반 프로젝트</b>에 적합</li>
</ul>
<p data-ke-size="size16">둘 다 배포 자동화와 CI/CD가 필수이지만,<br /><b>GitHub Flow는 PR 중심의 협업</b>을 중요시하고,<br /><b>Trunk-Based는 직접 <code>main</code>에서 작업</b>하는 점이 가장 큰 차이입니다.</p>