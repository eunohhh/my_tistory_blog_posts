<h3 data-ke-size="size23">"로그인 성공과 동시에 차단 알림이?"</h3>
<p data-ke-size="size16">어드민에 로그인할 때마다 슬랙으로 "IP 차단" 알림이 왔습니다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">사유: 표적: 로그인 표면 (/api/auth/callback/google)<br />IP: 223.62.16.68 (SK Telecom)<br /><br /></p>
</blockquote>
<p data-ke-size="size16">이상한 점: <b>알림은 차단됐다는데 내 로그인은 멀쩡히 성공</b>했습니다.<br />타이밍도 정확히 내가 로그인한 순간이었고요.<br />오탐인가? 버그인가? 싶어서 파봤는데, 결론은...</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>크롬 확장 Wappalyzer가 내가 방문한 OAuth 콜백 URL(일회용 인가 코드 포함)을 통째로 수집해서, </b></p>
<p data-ke-size="size16"><b>주거용 프록시 망에서 재접속하고 있었습니다.</b></p>
<p data-ke-size="size16"><br />알림은 오탐이 아니라 이 유출 트래픽을 잡아낸 진짜 신호였습니다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">조사 과정</h2>
<h3 data-ke-size="size23">1) 알림 &ne; 내 로그인 요청</h3>
<p data-ke-size="size16">코드상 슬랙 알림은 403 차단과 같은 분기에서만 발송됩니다.<br />즉 알림이 왔다면 그 요청은 확실히 차단된 것인데...<br />제 로그인은 성공했으니 <b>콜백 요청이 2개였다</b>는 뜻입니다.</p>
<p data-ke-size="size16">CloudWatch 로그와 <code>session</code> 테이블(<code>ipAddress</code>, <code>createdAt</code>)을 대조해 보니:</p>
<p data-ke-size="size16">&nbsp;</p>
<table style="height: 58px;" data-ke-align="alignLeft" data-ke-style="style8">
<thead>
<tr style="height: 20px;">
<th style="height: 20px;">&nbsp;</th>
<th style="height: 20px;">로그인 성공 (본인)</th>
<th style="height: 20px;">차단된 요청</th>
</tr>
</thead>
<tbody>
<tr style="height: 19px;">
<td style="height: 19px;">1차 12:13</td>
<td style="height: 19px;">12:13:11.4 사무실 회선 (allowlist 등재)</td>
<td style="height: 19px;"><b>+3.6초 뒤</b>, 223.62.16.68 (SKT 모바일)</td>
</tr>
<tr style="height: 19px;">
<td style="height: 19px;">2차 12:51</td>
<td style="height: 19px;">12:51:13.4 사무실 회선</td>
<td style="height: 19px;"><b>+5.9초 뒤</b>, 182.172.56.197 (딜라이브 가정용)</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">로그인 성공 몇 초 뒤에, 매번 <b>다른 통신사의 소비자 회선</b>에서 같은 콜백 경로로 요청이 오고 있었습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">2) 관측 공백 메꾸기 - 차단 로그에 UA&middot;쿼리 키 추가</h3>
<p data-ke-size="size16">처음엔 차단 로그에 IP&middot;경로뿐이라 정체를 알 수 없었습니다.<br />그래서 차단 warn 로그와 슬랙 알림에 <b>User-Agent, Referer origin, 쿼리 키 목록</b>(비민감)을 추가했습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">다음 로그인에서 바로 답이 나왔습니다:</p>
<pre class="angelscript"><code>UA:      Mozilla/5.0 (Macintosh ...) Chrome/149.0.0.0  &larr; 내 브라우저와 동일
Referer: https://accounts.google.com                    &larr; 진짜 OAuth 리다이렉트처럼
쿼리 키: authuser,code,hd,iss,prompt,scope,state        &larr; 실제 인가 코드 포함</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">제 브라우저의 UA와 referer까지 복제한, <b>내 콜백 URL의 완전한 사본</b>이었습니다.</p>
<h3 data-ke-size="size23">3) 내 Mac이 두 회선으로 나가나? &rarr; Nope</h3>
<p data-ke-size="size16">Mac에서 egress IP를 3개 목적지 &times; 3회 실측(curl ifconfig.me 등)<br />&rarr; 전부 사무실 회선 단일.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">브라우저가 두 경로로 나간 게 아니라, <b>제3자가 내 URL을 어딘가에서 받아서 재접속</b>하고 있다?!</p>
<p data-ke-size="size16">HTTPS에서 URL 경로+쿼리는 네트워크 중간에서 볼 수 없으므로(SNI는 호스트명만),</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">유출 지점은 <b>브라우저 내부</b>였습니다.<br />즉 &gt;&gt; <b>확장 프로그램</b> &lt;&lt; 1순위 용의자.</p>
<h3 data-ke-size="size23">4) 확장 프로그램 실험 - 알림이 곧 판별기</h3>
<p data-ke-size="size16">이제 차단 알림 자체가 완벽한 canary가 됐습니다. 회당 1분:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>용의 확장 하나 끄기 &rarr; 로그아웃 &rarr; 로그인</li>
<li>알림이 안 오면 범인, 오면 다음 확장</li>
</ol>
<p data-ke-size="size16"><b>범인확정: Wappalyzer</b>. 끄니까 재요청이 사라졌습니다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">Wappalyzer가 왜?</h2>
<p data-ke-size="size16">유명한 확장이지만(사용자 수백만), 2020년경 오픈소스를 중단하고 <b>"어떤 사이트가 어떤 기술을 쓰는지" 데이터셋을 판매하는 상업 회사</b>가 됐다고 합니다. 확장이 그 데이터 수집 채널입니다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>공식 정책은 "hostname 수준 메타데이터만 수집, 전체 URL은 안 보냄"이라고 하지만, <b>실측으로는 일회용 인가 코드가 포함된 전체 URL이 브라우저 밖으로 나갔습니다</b> (재요청에 code/state 값이 실려 왔으니 논리적으로 확정).</li>
<li>OAuth 콜백은 DOM 없는 즉시 302 리다이렉트라 확장이 로컬에서 기술 분석을 못 하고, 그런 URL을 서버로 보내면 <b>백엔드 크롤러가 직접 방문해서 분석을 마저 하는</b> 구조로 추정됩니다. 일반 페이지는 재요청이 없었던 관측과 일치.</li>
<li>재접속 IP가 매번 다른 국내 주거용/모바일 회선인 건 봇 차단 우회용 <b>주거용 프록시</b> - 데이터 수집 업계의 흔한 관행입니다.</li>
</ul>
<h2 data-ke-size="size26">피해가 없었던 이유 (방어층이 일 다했다)</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>인가 코드는 일회용</b> - 내 로그인 시점(+0초)에 이미 소진, 4~6초 늦은 재요청은 어차피 실패</li>
<li><b>IP allowlist가 핸들러 도달 전에 403</b> - 애초에 서버 로직까지 오지도 못함</li>
<li><b>"로그인 표면 단발 차단은 무조건 알림" 설계</b> - 여기서 실제 유출을 두 번 잡아냈습니다</li>
</ol>
<h2 data-ke-size="size26">Wappalyzer 쓰지 말자 그냥!!</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Wappalyzer 삭제</b> (비활성화 말고 삭제). 유사 tech-profiler류(BuiltWith 등)도 업무 브라우저에선 제거 권장</li>
<li>특히 <b>어드민/내부 시스템/고객 데이터를 다루는 브라우저 프로필</b>에는 <code>&lt;all_urls&gt;</code> 권한 확장을 최소화</li>
<li>기억할 것: <b>URL 자체가 자격증명인 링크들이 있다</b> - OAuth 콜백은 일회용 코드라 그나마 안전하지만, 비밀번호 재설정 링크&middot;매직 로그인 링크&middot;presigned URL이 같은 채널로 새면 <b>그대로 계정/자원 탈취</b>입니다</li>
<li>확장 점검법: <code>chrome://extensions</code> &rarr; 세부정보 &rarr; "사이트 액세스: 모든 사이트"인 것들 위주로 필요성 재검토</li>
</ul>
<h2 data-ke-size="size26">배운 것</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>"차단됐는데 성공했다"는 모순처럼 보이면 요청이 2개 인지 의심.</b> 세션 테이블의 <code>ipAddress</code>/<code>createdAt</code>과 차단 로그의 밀리초 대조가 결정타였습니다.</li>
<li><b>관측 공백이 곧 조사 한계.</b> 차단 로그에 UA&middot;쿼리 키(값 제외)를 넣는 작은 수정 하나로, 다음 발생 즉시 정체가 드러났고 이등분 실험용 canary까지 됐습니다.</li>
<li><b>보안 알림은 "노이즈 줄이기"와 "신호 놓치지 않기"의 싸움.</b> 로그인 표면 단발 = 무조건 알림, 그 외 = burst만 알림이라는 positive-allowlist 설계가 스캐너 소음 속에서 진짜 유출을 건졌습니다.</li>
<li>유명 확장 &ne; 안전한 확장. <b>비즈니스 모델이 데이터 판매면, 내 브라우징이 상품?!</b>입니다.</li>
</ol>
<h2 data-ke-size="size26">참고</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://www.wappalyzer.com/privacy/">Wappalyzer Privacy Policy</a></li>
<li><a href="https://www.wappalyzer.com/faq/extension/">Wappalyzer FAQ</a></li>
<li><a href="https://www.linkedin.com/pulse/wappalyzer-unknown-spy-seifeddine-allaya">Wappalyzer the unknown spy (LinkedIn)</a></li>
</ul>