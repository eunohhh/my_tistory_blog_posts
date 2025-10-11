<h2 data-ke-size="size26">SSO vs OAuth</h2>
<p data-ke-size="size16">SSO(Single Sign-On)와 OAuth는 <b>인증(Authentication)</b>과 <b>인가(Authorization)</b> 관점에서 서로 다릅니다. 간단히 비교하면 다음과 같습니다:</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>✅ 목적의 차이</b></h3>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th><b>항목</b></th>
<th><b>SSO (Single Sign-On)</b></th>
<th><b>OAuth (Open Authorization)</b></th>
</tr>
</thead>
<tbody>
<tr>
<td>핵심 목적</td>
<td><b>하나의 로그인으로 여러 서비스 사용</b></td>
<td><b>제3자 앱이 사용자의 자원에 접근 허용</b></td>
</tr>
<tr>
<td>주요 개념</td>
<td>인증(Authentication) 중심</td>
<td>인가(Authorization) 중심</td>
</tr>
</tbody>
</table>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>✅ 예시</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>SSO</b>:</li>
<li>회사 포털에 한 번 로그인하면 이메일, 회계, 인트라넷 등 다양한 시스템에 추가 로그인 없이 접근 가능</li>
<li><b>OAuth</b>:</li>
<li>어떤 앱이 &ldquo;구글 계정으로 로그인&rdquo;할 때, 구글에서 인증하고 &rarr; 해당 앱이 사용자 이메일, 프로필 등 <b>제한된 정보에 접근하도록 허용</b>함</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>✅ 실제 동작</b></h3>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th><b>항목</b></th>
<th><b>SSO</b></th>
<th><b>OAuth</b></th>
</tr>
</thead>
<tbody>
<tr>
<td>로그인 주체</td>
<td>사용자가 <b>한 번 로그인하면</b> 여러 서비스에 공유됨</td>
<td>사용자가 <b>권한 부여</b> 버튼 클릭 &rarr; 제3자 앱에 권한 위임</td>
</tr>
<tr>
<td>자원 접근 여부</td>
<td>로그인하면 모든 연동 서비스에 자동 접근</td>
<td>사용자가 명시적으로 어떤 자원에 접근 허용할지 지정</td>
</tr>
</tbody>
</table>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>✅ 결론 요약</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>SSO</b>는 <b>사용자 인증 재사용</b>이 목적 (여러 서비스 한 번에 로그인)</li>
<li><b>OAuth</b>는 <b>타 서비스가 사용자 자원 접근</b>을 위한 위임 시스템</li>
</ul>
<p data-ke-size="size16">  실제 서비스에서는 이 둘을 함께 사용하기도 합니다. 예: &ldquo;구글 SSO&rdquo;는 OAuth2 프로토콜을 기반으로 동작합니다.</p>