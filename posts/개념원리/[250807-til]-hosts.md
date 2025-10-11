<h2 data-ke-size="size26">DNS와 hosts 파일 동작 원리</h2>
<h3 data-ke-size="size23">1. 일반적인 DNS 조회 과정</h3>
<pre class="routeros"><code>브라우저 &rarr; hosts 파일 확인 &rarr; DNS 서버 조회 &rarr; IP 주소 반환 &rarr; 웹사이트 접속</code></pre>
<h3 data-ke-size="size23">2. hosts 파일 수정 후 과정</h3>
<pre class="routeros"><code>브라우저 &rarr; hosts 파일에서 직접 IP 발견 &rarr; DNS 서버 건너뛰고 바로 해당 IP로 접속</code></pre>
<h2 data-ke-size="size26">hosts 수정하여 사용하기 단계별 정리</h2>
<h3 data-ke-size="size23">단계 1: 현재 상황 파악</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>원래 도메인(예: example.com)이 CloudFront &rarr; S3를 가리킴</li>
<li>하지만 Cafe24 서버(000.000.000.000)의 내용을 확인해야 함</li>
</ul>
<h3 data-ke-size="size23">단계 2: hosts 파일 수정</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>로컬 hosts 파일에 다음과 같은 내용 추가:</li>
</ul>
<pre class="accesslog"><code>000.000.000.000 example.com</code></pre>
<h3 data-ke-size="size23">단계 3: 결과</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>브라우저에서 example.com 입력 시 DNS를 거치지 않고 바로 000.000.000.000로 연결</li>
<li>따라서 Cafe24 서버의 내용을 볼 수 있음</li>
</ul>
<h2 data-ke-size="size26">맥에서 hosts 파일 수정하는 방법</h2>
<h3 data-ke-size="size23">1. 터미널에서 hosts 파일 열기</h3>
<pre class="awk"><code>sudo nano /etc/hosts</code></pre>
<p data-ke-size="size16">또는</p>
<pre class="awk"><code>sudo vim /etc/hosts</code></pre>
<h3 data-ke-size="size23">2. 파일에 내용 추가</h3>
<p data-ke-size="size16">기존 내용 아래에 다음과 같이 추가:</p>
<pre class="accesslog"><code>000.000.000.000 yourdomain.com</code></pre>
<h3 data-ke-size="size23">3. 파일 저장 및 종료</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>nano 사용 시: <code>Ctrl + X</code> &rarr; <code>Y</code> &rarr; <code>Enter</code></li>
<li>vim 사용 시: <code>ESC</code> &rarr; <code>:wq</code> &rarr; <code>Enter</code></li>
</ul>
<h3 data-ke-size="size23">4. DNS 캐시 플러시 (선택사항)</h3>
<pre class="properties"><code>sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder</code></pre>
<h2 data-ke-size="size26">주의사항</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>관리자 권한 필요</b>: hosts 파일 수정 시 <code>sudo</code> 필요</li>
<li><b>임시 조치</b>: 작업 완료 후 해당 라인을 삭제하거나 주석 처리(<code>#</code>)하는 것을 잊지 마세요</li>
<li><b>브라우저 캐시</b>: 경우에 따라 브라우저 캐시를 지워야 할 수도 있습니다</li>
</ol>
<h2 data-ke-size="size26">작업 후 원상복구</h2>
<p data-ke-size="size16">작업이 끝나면 hosts 파일에서 추가한 라인을 삭제하거나 앞에 <code>#</code>를 붙여서 주석 처리하세요:</p>
<pre class="css"><code># 000.000.000.000 yourdomain.com</code></pre>