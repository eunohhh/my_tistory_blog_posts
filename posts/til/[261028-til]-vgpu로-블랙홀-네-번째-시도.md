<h2 data-ke-size="size26">vgpu로 블랙홀 네 번째 - 품질이 내려가는 게 보이는 브라우저 <a href="https://eunoh.top/labs/blackhole-slingshot" target="_blank" rel="noopener"><span>게임</span></a> 만들기!</h2>
<p data-ke-size="size16"><a href="https://eunoh.top/labs/blackhole-slingshot" target="_blank" rel="noopener"><span>결과 링크</span></a><br />&nbsp;<br />vgpu(WebGPU 래퍼)로 블랙홀을 세 번째로 다시 그린 글을 쓰고 한 달 만이다. 계기는 WebLLM으로 브라우저에서 AI 추론을 돌린 글이었다. 브라우저가 그 정도를 한다면 <b>사용자 GPU 사양에 맞춰 품질이 알아서 바뀌는 고사양 그래픽 게임</b>도 될까 싶었다.<br />&nbsp;<br />결과부터 적으면 이렇다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>블랙홀 슬링샷 - 우주선을 당겨 놓아 블랙홀 중력으로 휘며 게이트를 순서대로 지나는 게임, 5레벨 &middot; 레벨당 3발</li>
<li>게이트 &middot; 우주선 &middot; 잔해가 <b>전부 중력렌즈에 휘어 보인다.</b> 렌즈를 위한 추가 적분은 0</li>
<li>High/Medium/Low 3단계 자동 품질 조절. <b>숨기지 않고 보이게</b> - 성능 패널 &middot; 전환 알림 &middot; 결과 화면 기록</li>
<li>레벨이 오를수록 잔해가 늘어 <b>난이도와 GPU 부하가 같이 오른다</b></li>
<li>실기기 4대(M4 맥북 &middot; M2 에어 &middot; M2 맥미니 &middot; RTX 3060)로 확인. 3060은 끝까지 High, 에어 &middot; 맥미니는 5레벨에서 Medium</li>
</ul>
<p data-ke-size="size16">프로젝트별 수치나 파일 목록은 빼고, 다른 그래픽 작업에서도 남을 것을 적는다.</p>
<h2 data-ke-size="size26">1. 무엇을 만들지 - 매끄럽게가 아니라 알아채게</h2>
<p data-ke-size="size16">브레인스토밍에서 정한 것 셋이 끝까지 설계를 끌고 갔다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>모바일은 이번엔 뺀다.</b> GPU가 확실히 있는 데스크톱만. 모바일은 다음 실험에서.</li>
<li><b>품질 조절을 숨기지 않는다.</b> 보통은 사용자가 모르게 매끄럽게 내리는 게 목표지만, 이번 실험은 "지금 Medium으로 내려갔다"를 알아채는 게 목표다.</li>
<li><b>잔해 = 난이도 = 부하.</b> 레벨이 오를수록 잔해 입자가 늘어난다. 게임 진행 자체가 품질 조절을 보여 주는 장치가 된다.</li>
</ul>
<p data-ke-size="size16">잔해는 <b>보기만 하는 입자</b>로 정했다. 품질 단계마다 그리는 비율(100/60/30%)이 다르니 충돌에 쓰면 단계에 따라 게임 결과가 달라진다. "단계가 바뀌어도 결과는 같다"를 성공 기준에 넣었다.</p>
<h2 data-ke-size="size26">2. 렌즈를 공짜로 - 평면 지도</h2>
<p data-ke-size="size16">지난 글의 핵심은 "비싼 측지선 적분은 한 번 굽고(bake) 매 프레임은 칠하기(shade)만"이었다. bake 결과(G-buffer)에는 픽셀마다 <b>빛줄기가 원반 평면(y=0)을 지나는 지점 두 개</b>가 이미 들어 있다.<br />&nbsp;<br />그러면 게임 오브젝트를 전부 원반 평면 위에 두고, 매 프레임 <b>평면을 위에서 본 2D 텍스처(평면 지도)</b>에 그린 다음, shade가 그 교차점에서 지도를 읽으면 된다. 오브젝트가 원반과 똑같이 렌즈를 탄다. 블랙홀 뒤편 물체의 2차상까지 공짜다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2880" data-origin-height="1800"><span data-url="https://blog.kakaocdn.net/dn/k0UEn/dJMcahzGxZL/kvn2NmQ5JwcyZVs2TRaKq0/img.png" data-phocus="https://blog.kakaocdn.net/dn/k0UEn/dJMcahzGxZL/kvn2NmQ5JwcyZVs2TRaKq0/img.png"><img src="https://blog.kakaocdn.net/dn/k0UEn/dJMcahzGxZL/kvn2NmQ5JwcyZVs2TRaKq0/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fk0UEn%2FdJMcahzGxZL%2Fkvn2NmQ5JwcyZVs2TRaKq0%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" loading="lazy" width="2880" height="1800" data-origin-width="2880" data-origin-height="1800"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;<br />디버그로 평면 지도에 격자를 그려 본 화면이다. 격자선이 그림자 주변에서 휘고, 뒤편 격자가 그림자 위로 넘어온다. 대가는 오브젝트가 <b>납작한 데칼</b>이 된다는 것. 입체 모델(렌즈 없음)과 렌즈 중에 렌즈를 골랐다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2880" data-origin-height="1800"><span data-url="https://blog.kakaocdn.net/dn/ciSY9R/dJMcabTKbkn/ouI0CgmvYLBS7po9OjRin1/img.png" data-phocus="https://blog.kakaocdn.net/dn/ciSY9R/dJMcabTKbkn/ouI0CgmvYLBS7po9OjRin1/img.png"><img src="https://blog.kakaocdn.net/dn/ciSY9R/dJMcabTKbkn/ouI0CgmvYLBS7po9OjRin1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FciSY9R%2FdJMcabTKbkn%2FouI0CgmvYLBS7po9OjRin1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" loading="lazy" width="2880" height="1800" data-origin-width="2880" data-origin-height="1800"/></span></figure>
</p>
<h3 data-ke-size="size23">슬롯 경쟁 - 부분적으로 맞은 가설 위에 해법을 쌓았다</h3>
<p data-ke-size="size16">교차 기록 범위를 원반(반경 2.6~13)에서 플레이 반경(18)까지 넓히자, 빈 평면 지도인데도 기반 데모와 픽셀 차이가 최대 102 났다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>가설: 교차 슬롯이 2칸뿐이라 원반 밖 교차가 칸을 먹고 원반 밑면 교차가 밀린다. 범위를 원반으로 되돌리면 차이 0 - <b>맞았다.</b></li>
<li>그래서 슬롯을 3칸으로 늘렸다(G-buffer 48바이트, <code>maxColorAttachmentBytesPerSample</code> 64 요청). 그래도 차이 95, <b>단 7픽셀</b>. 위치가 전부 광자 고리 근처.</li>
<li>진짜 원인: 광자 고리 근처 광선은 지평선을 감아 돌며 <b>반경 1.5~2.6(원반 안쪽 구멍)</b>에서 평면을 여러 번 지나고, 그 의미 없는 교차가 칸을 다 써 버렸다. 하한을 원반 안쪽 반경(= 포획 반경, 오브젝트가 있을 수 없는 곳)으로 올리자 <b>2칸으로도 차이 0.</b></li>
<li>게임 구도 전 범위에서 2칸 vs 3칸 차이 0. 3칸 코드를 전부 걷었다.</li>
</ol>
<p data-ke-size="size16">가설 1은 틀리지 않았다. "범위를 되돌리면 차이가 사라진다"는 관찰과 맞았다. 그런데 그 위에 해법을 바로 쌓았다. <b>해법을 쌓기 전에 남은 차이가 어디서 나는지 먼저 쟀어야 했다.</b> 남은 7픽셀의 위치가 진짜 원인을 가리키고 있었다.</p>
<h3 data-ke-size="size23">테스트가 진짜를 재는지 - 일부러 꺼 본다</h3>
<p data-ke-size="size16">렌즈 테스트 셋(뒤편 점이 그림자 위로 휜다 &middot; 그림자 아래 2차상 &middot; 원반 밖 점도 보인다)은 구현이 먼저 있어서 처음부터 초록이었다. 초록은 아무것도 증명하지 않는다. shade의 합성 줄을 일부러 끄니 <b>정확히 그 셋만</b> 빨개졌고, 기록 범위를 원반으로 줄이니 "원반 밖 점"만 빨개졌다. 2차상 테스트는 직진 광선으로는 생길 수 없으니 렌즈의 증거가 된다.<br />&nbsp;<br />이번 작업 내내 이 습관을 반복했다. 방향(z) 뒤집기, 게이트 순서, 고정 스텝 여유값 - 통과한 테스트는 한 번 빨개지는 걸 보고 나서 믿었다.</p>
<h2 data-ke-size="size26">3. GPU 시간을 어떻게 재나 - Apple에선 timestamp를 더할 수 없다</h2>
<p data-ke-size="size16">승격("여유가 있으니 한 칸 올린다")을 판정하려면 GPU 시간이 필요하다. rAF 간격은 vsync 아래로 안 내려가서 여유를 못 보여 준다.</p>
<p data-ke-size="size16">처음엔 vgpu <code>timer</code>로 패스마다 timestamp span을 걸고 합했다. M4(120Hz)에서 <b>프레임은 8.3ms인데 GPU가 21.6ms</b>로 나왔다 - 물리적으로 불가능하다. span을 펼쳐 보니 360px짜리 블러 패스도 무거운 shade와 같은 ~2.4ms였다.</p>
<p data-ke-size="size16">&nbsp;</p>
<table style="border-collapse: collapse;" border="1" data-ke-align="alignLeft">
<tbody>
<tr>
<td>High (2880&times;1800)</td>
<td>4.80ms</td>
<td>10.16ms</td>
</tr>
<tr>
<td>Medium (1620&times;1013)</td>
<td>3.70ms</td>
<td><b>12.65ms</b></td>
</tr>
<tr>
<td>Low (792&times;495)</td>
<td>2.70ms</td>
<td>4.39ms</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">span 합은 Medium &gt; High로 뒤집힌다. Apple GPU는 패스를 겹쳐 돌려서 겹친 구간이 span마다 중복으로 잡히는 걸로 본다. 대신 <b>제출 &rarr; <code>queue.onSubmittedWorkDone()</code> 지연</b>을 쓰기로 했다. 단계 순서대로 줄고, 바닥에 ~2ms 고정 지연이 깔리지만 "여유가 있나" 판정엔 충분하다. timestamp-query 기능도 필요 없어진다.</p>
<p data-ke-size="size16">&nbsp;<br />나중에 RTX 3060(D3D12)의 벤치 JSON을 보니 거기선 패스별 span이 패스마다 달랐다(블러 0.07ms, shade 0.9ms). <b>같은 API가 Apple에선 합산 불가, NVIDIA에선 실제 비용.</b> 패스별 값은 참고 칸으로만 남겼다.</p>
<h2 data-ke-size="size26">4. 품질 컨트롤러 - 판정 규칙보다 판정의 기준이 문제였다</h2>
<p data-ke-size="size16">규칙은 이렇게 정했다. 약 1초 동안 프레임 중앙값이 예산을 넘으면 한 칸 내리고, 5초 동안 끊김 없이 여유가 이어지면 한 칸 올린다.<br />전환 직후엔 쉬고, 숨긴 탭 &middot; 리사이즈 같은 250ms 넘는 공백은 판정 창을 비운다. 올라갔다 곧 떨어진 단계는 그 레벨 동안 다시 안 올라가고, 레벨당 전환은 3번까지. 전부 순수 TS로 테스트했다.<br />&nbsp;<br />실제로 사람을 괴롭힌 건 규칙이 아니라 <b>예산 자체</b>였다.</p>
<h3 data-ke-size="size23">주사율 추정은 오르기만 해야 한다</h3>
<p data-ke-size="size16">60Hz 화면에서 GPU가 버거워 두 vsync마다 그리는 상태(33ms)는 30Hz 화면과 구별되지 않는다. 추정을 내릴 수 있게 두면 과부하일수록 예산이 느슨해져 강등이 안 일어난다. 그래서 스스로는 안 내리고, 창이 다른 화면으로 옮겨 가면 처음부터 다시 잰다.</p>
<h3 data-ke-size="size23">120Hz에서는 버거운 프레임이 20ms에 앉는다</h3>
<p data-ke-size="size16"><code>?stress=20</code>(잔해 240만 개)에서 50fps인데 12초 내내 High였다. 프레임 20.1ms, 문턱은 예산 16.7ms &times; 1.25 = 20.8ms. 1.25배는 <b>60Hz에서 놓친 프레임이 33ms로 점프한다</b>는 가정이었다. 120Hz 화면은 vsync 단위가 8.3ms라 버거운 프레임이 20ms 근처에 앉는다. 그 상황을 테스트로 만들어 빨간 걸 보고 1.15배로 낮췄다.</p>
<h3 data-ke-size="size23">주사율은 무거운 렌더를 시작하기 전에 잰다</h3>
<p data-ke-size="size16">그다음엔 67fps &middot; 15ms로 다시 안 내려갔다. 페이지가 <b>부하 속에서 시작해</b> 주사율 추정이 안정된 8.3ms를 한 번도 못 보고 60Hz로 남았던 것. 같은 기기라도 빈 상태로 시작하면 120Hz를 잡는다 - <b>판정이 시작 순간의 부하에 달려 있었다.</b> vgpu 로딩 &middot; GPU 초기화와 겹쳐 그리는 것 없는 rAF 40프레임으로 먼저 재게 바꾸니, 첫 초부터 120Hz &middot; 예산 11.1ms, 2초 안에 High &rarr; Medium.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2880" data-origin-height="1800"><span data-url="https://blog.kakaocdn.net/dn/bBVQzi/dJMcabeYYWw/njNugyVzKIzSm1HkVOa6eK/img.png" data-phocus="https://blog.kakaocdn.net/dn/bBVQzi/dJMcabeYYWw/njNugyVzKIzSm1HkVOa6eK/img.png"><img src="https://blog.kakaocdn.net/dn/bBVQzi/dJMcabeYYWw/njNugyVzKIzSm1HkVOa6eK/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbBVQzi%2FdJMcabeYYWw%2FnjNugyVzKIzSm1HkVOa6eK%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" loading="lazy" width="2880" height="1800" data-origin-width="2880" data-origin-height="1800"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;<br />비행 중에 High &rarr; Medium으로 내려갔는데도 같은 발사로 그대로 통과한 화면. "단계가 바뀌어도 결과는 같다"를 실브라우저로 확인한 장면이다.</p>
<h2 data-ke-size="size26">5. 게임 - 결정성과 레벨</h2>
<h3 data-ke-size="size23">고정 스텝을 float로 세면 프레임률이 결과를 바꾼다</h3>
<p data-ke-size="size16">물리는 1/240초 고정 스텝(속도 Verlet), 사칙연산과 <code>Math.sqrt</code>만 쓴다. IEEE 754가 결과를 정확히 정하는 연산이라 엔진이 달라도 비트까지 같다. 그런데 "같은 2초를 30fps로 넣든 144fps로 넣든 같다"는 테스트가 깨졌다. 30fps는 479스텝, 144fps는 480스텝. <b><code>1/30</code>을 60번 더하면 2보다 아주 조금 작다.</b> 스텝 경계에 작은 여유(<code>+1e-6</code>)를 두고, 지우면 다시 빨개지는 걸 확인했다.</p>
<h3 data-ke-size="size23">레벨은 손으로 놓지 않고 궤적에서 뽑았다</h3>
<p data-ke-size="size16">당김 벡터를 격자로 훑어 블랙홀 곁을 4~7 거리로 스치며 60&deg; 이상 꺾이는 궤적만 남기고, 그 궤적에 수직으로 게이트를 세웠다. <b>해답이 곧 그 궤적이라 모든 레벨이 풀린다는 게 보장된다.</b> 당김을 &plusmn;2% 흔들어도 이기는지로 견고함을 봤고, 블랙홀 뒤에 게이트가 하나는 있게 했다(렌즈로 휘어 보이게). 중력 계수를 레벨에 맞추는 대신 레벨을 중력에 맞춰 뽑은 셈이다.</p>
<h3 data-ke-size="size23">조준은 렌즈를 무시한다 - 어긋남의 방향을 단정한다</h3>
<p data-ke-size="size16">화면 좌표 &rarr; 평면 좌표는 렌즈를 무시한 핀홀 투영이다. 실제 GPU 그림과 비교해 보니 5.8px(480 폭) 어긋났다. 허용치를 넓히는 대신 방향을 쟀다. 블랙홀 바깥쪽으로 5.7px, 옆으로 0.9px - 1차상이 바깥으로 휘는 렌즈 효과 그대로다. 그래서 "바깥 방향 &middot; 옆으로 2px 미만 &middot; 폭의 2% 미만"을 단정했다. <b>허용치를 늘리는 테스트는 아무것도 말해 주지 않는다. 어긋남의 성질을 단정하는 테스트는 렌즈가 사라지면 깨진다.</b></p>
<h2 data-ke-size="size26">6. 실기기가 고친 가정</h2>
<p data-ke-size="size16">프리뷰에서 네 기기로 벤치마크를 돌렸다(전부 Chrome). GPU 제출&rarr;완료(ms), 고정 구간은 1920&times;1080:</p>
<table style="border-collapse: collapse;" border="1" data-ke-align="alignLeft">
<tbody>
<tr>
<td>M4 맥북</td>
<td>3840 모니터 &middot; 60Hz</td>
<td>6.0</td>
<td>4.7</td>
<td>3.7</td>
<td>7.5</td>
</tr>
<tr>
<td>M2 맥미니</td>
<td>3840 모니터 &middot; 60Hz</td>
<td>6.0</td>
<td>4.5</td>
<td>3.6</td>
<td>10.0</td>
</tr>
<tr>
<td>M2 에어</td>
<td>내장 &middot; 60Hz</td>
<td>9.2</td>
<td>7.0</td>
<td>5.4</td>
<td>8.8</td>
</tr>
<tr>
<td>RTX 3060</td>
<td>3840 모니터 &middot; 60Hz</td>
<td>3.9</td>
<td>6.5</td>
<td>5.4</td>
<td>5.9</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;<br /><b>어느 기기도 강등되지 않았다.</b> 에어로 5레벨까지 직접 해 봐도 안 느려졌다. 성공 기준 2("에어는 후반 레벨에서 내려간다")가 실패다.<br />이유는 둘이었다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>전 기기가 60Hz였다.</b> 개발은 M4 내장 120Hz(예산 11.1ms)에서 했는데 실제 환경은 16.7ms로 1.5배 느슨했다. 개발 기기 기준으로 잡은 부하가 실환경엔 가벼웠다.</li>
<li><b>잔해는 생각보다 약한 손잡이였다.</b> 화면을 안 가리려고 입자를 아주 작게 줄였더니 픽셀 비용이 거의 사라지고 버텍스 비용만 남았다.</li>
</ul>
<p data-ke-size="size16">기준을 고치지 않고 부하를 올리기로 했고, 배율은 추정하지 않고 쟀다. <code>?level=5&amp;stress=N</code>으로 에어는 <b>72만 개에서 처음 Medium</b>, 3060은 <b>240만 개(상한)에서도 High.</b> 그 사이에서 레벨 잔해를 2만/8만/25만/60만/120만으로 다시 잡았다 - 5레벨은 에어 문턱의 1.7배, 3060이 버틴 수의 절반.</p>
<p data-ke-size="size16">&nbsp;<br />입자가 10배가 되면 평면이 하얗게 덮인다. 그래서 <b>수와 크기는 그대로 두고 불투명도만</b> 레벨 전체 수에 맞춰 낮췄다(1-(1-a)^n = 목표 덮임). 그리는 양이 같으니 실측한 문턱도 그대로다. 목표 덮임 35%는 원반이 우윳빛으로 씻겨서, 이미 합의했던 화면과 같은 15%(A)와 8%(B)를 나란히 찍어 봤다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="3040" data-origin-height="1362"><span data-url="https://blog.kakaocdn.net/dn/LLdVn/dJMcah0EhT1/6ZHshC9TZHdSi9JunPhvV1/img.png" data-phocus="https://blog.kakaocdn.net/dn/LLdVn/dJMcah0EhT1/6ZHshC9TZHdSi9JunPhvV1/img.png"><img src="https://blog.kakaocdn.net/dn/LLdVn/dJMcah0EhT1/6ZHshC9TZHdSi9JunPhvV1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FLLdVn%2FdJMcah0EhT1%2F6ZHshC9TZHdSi9JunPhvV1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" loading="lazy" width="3040" height="1362" data-origin-width="3040" data-origin-height="1362"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;<br />A의 먼지 폭풍 느낌으로 골랐다. Low로 내려가면 120만 중 36만만 그리니 성겨지는 게 눈에 보인다.<br />다시 머지하고 stress 없이 플레이: 3060 끝까지 High, 에어 5레벨에서 Medium, 맥미니도 5레벨에서 Medium이지만 <b>에어보다 약 4초 늦게</b>(체감 - 결과 화면의 전환 시각은 못 봤다). 같은 M2라도 맥미니가 벤치 High 6.0ms 대 에어 9.2ms로 빠르다. 성공 기준 1~5를 다 통과했다.</p>
<h2 data-ke-size="size26">정리</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>렌즈 같은 비싼 효과는, 이미 구운 결과가 주는 좌표 위에 콘텐츠를 올리면 공짜로 따라온다. 대가(데칼)는 미리 고른다.</li>
<li>부분적으로 맞은 가설 위에 해법을 쌓기 전에, 해법을 넣고도 <b>남은 차이의 위치</b>를 먼저 잰다.</li>
<li>통과한 테스트는 일부러 한 번 빨갛게 만들어 보고 나서 믿는다.</li>
<li>Apple GPU에서 패스별 timestamp 합은 프레임 GPU 시간이 아니다. 제출 &rarr; 완료 지연이 기기를 가리지 않는다.</li>
<li>자동 품질 조절의 함정은 판정 규칙보다 예산 쪽에 있었다. 주사율은 무거운 렌더 전에 재고, vsync 양자화는 주사율마다 다르다.</li>
<li>고정 스텝 물리는 스텝 수를 정수로 세고 경계에 여유를 둔다. <code>1/30 &times; 60 &ne; 2</code>.</li>
<li>부하 수치는 실기기에서 잰다. 개발 기기 기준은 1.5배 빗나가 있었다.</li>
</ul>