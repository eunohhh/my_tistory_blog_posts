<p data-ke-size="size16">이 글에는 나(사람)의 시점이 없다. 클로드에게 완전히 선생님 시점에서 써달라고 부탁했다.<br />나는 클로드 선생님이 이 문제를 해결하는 과정을 1시간 넘게 지켜봤다.<br />지켜보며 배운 것이 정말 많았으므로, 이 TIL엔 내 시점을 넣지 않고 생성된 그대로 놔둔다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">ANALYZE는 왜 한 시간이 걸렸나 &mdash; 네 번 틀리고 콜레이션에 닿기까지</h2>
<p data-ke-size="size16">이 글은 내 시점에서 쓴다.<br />사람이 읽는 회고가 아니라, <b>내가 무엇을 보고 무엇을 틀렸고 무엇이 나를 고쳤는지</b>의 기록이다.</p>
<p data-ke-size="size16">발단은 곁가지였다.</p>
<p data-ke-size="size16"><br /><code>personas</code> 100만 행에 halfvec 인덱스를 얹는 작업 중에 <code>ANALYZE personas</code>를 돌려 뒀는데,<br />사용자가 물었다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>"analyze 가 항상 엄청오래걸리던데 얼마나 걸릴지 예측 가능할까요"</b></p>
<p data-ke-size="size16">나는 답을 추측으로 채우려다 멈췄다.</p>
<p data-ke-size="size16">마침 그 ANALYZE가 눈앞에서 돌고 있었다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">첫 단서 &mdash; 진행률이 100%인데 끝나지 않는다</h2>
<p data-ke-size="size16"><code>pg_stat_progress_analyze</code>를 봤다.</p>
<pre class="angelscript"><code>phase               | computing statistics
sample_blks_total   | 30000
sample_blks_scanned | 30000     &larr; 100%
wait_event          | (없음)
elapsed             | 00:50:26</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">읽기는 이미 끝나 있었다. 50분 내내 <code>computing statistics</code> 단계였고 <code>wait_event</code>가 비어 있었다.<br /><b>디스크가 아니라 CPU에서 멎어 있다.</b></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그리고 더 중요한 것 &mdash; 저 뷰는 <b>표본 블록 읽기 진행률만</b> 준다.<br />정작 오래 걸리는 연산 단계에는 진행률 카운터가 <b>없다.</b></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">사용자의 "언제 끝날지 모르겠다"는 체감은 착각이 아니었다. <b>계측 공백이 실재했다.</b><br />그래서 나는 ETA를 만들어내지 않았다. 낼 근거가 Postgres 안에 없다고 말했다.</p>
<h2 data-ke-size="size26">두 번째 단서 &mdash; 행 수는 범인이 아니다</h2>
<p data-ke-size="size16">대신 예측의 실마리가 하나 있었다.<br />연산 대상은 <code>min(행 수, 300 &times; default_statistics_target)</code> = <b>30,000행 고정</b>이다.</p>
<p data-ke-size="size16">테이블이 100만 행이든 3천만 행이든 이 단계 비용은 거의 같다.</p>
<p data-ke-size="size16"><br />그렇다면 <b>시간을 정하는 것은 행 수가 아니라 컬럼 구성</b>이고,<br />같은 스키마의 30,000행 표본으로 재면 본 테이블 시간을 근사할 수 있다.</p>
<p data-ke-size="size16">측정 가능한 명제가 생겼다. 여기서부터 가설을 세우기 시작했다. 그리고 네 번 틀렸다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">가설 1 &mdash; 임베딩 컬럼이 비싸다 (틀림)</h2>
<p data-ke-size="size16">가장 그럴듯했다. <code>vector(1536)</code>은 행당 6KB고 TOAST에 나가 있다.<br />3만 개를 정렬 비교하면 느릴 수밖에 없다고 생각했다.</p>
<pre class="angelscript"><code>ANALYZE (embedding 만 통계)   &rarr;   4 ms</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>4밀리초.</b> 가설이 즉사했다.</p>
<p data-ke-size="size16">나중에 확인 사살도 됐다. 임베딩 컬럼을 <b>뺀</b> 30,000행 테이블의 ANALYZE가 179초였다.<br />임베딩은 무죄였다. 오히려 제일 쌌다.</p>
<h2 data-ke-size="size26">가설 2 &mdash; <code>text[]</code> 배열의 MCELEM 계산이 범인이다 (틀림)</h2>
<p data-ke-size="size16"><code>skills_list</code>&middot;<code>hobbies_list</code>는 <code>array_typanalyze</code>가 원소별 빈도를 따로 계산한다.<br />구조적으로 비싼 경로다. 유력하다고 적었다.</p>
<pre class="angelscript"><code>skills_list    8,641 ms
hobbies_list   7,900 ms</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">비싸긴 한데 <b>179초 중 16초</b>다. 지배적이지 않다. 또 틀렸다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">가장 위험했던 순간 &mdash; "모든 컬럼이 45초다"</h2>
<p data-ke-size="size16">컬럼별로 끊어 재기로 했다. 결과가 이렇게 나왔다.</p>
<pre class="angelscript"><code>uuid      text      39,826 ms
sex       text      45s+ 타임아웃
age       integer   45,077 ms
province  text      45s+ 타임아웃
district  text      45s+ 타임아웃
...</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>sex</code>는 고유값이 <b>2개</b>다. <code>age</code>는 정수다. 3만 행짜리 테이블이다.<br />이게 45초일 리가 없다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">여기가 이 조사에서 가장 위험한 지점이었다.<br />숫자가 가지런했기 때문이다. 전 컬럼이 균일하게 40~45초.</p>
<p data-ke-size="size16"><br />"이 테이블의 ANALYZE는 컬럼과 무관하게 비싸다"는 그럴듯한 표를 그대로 보고할 수 있었다.</p>
<p data-ke-size="size16"><b>그럴듯함이 아니라 부조리를 봤다.</b> 고유값 2개짜리 컬럼이 45초라는 건 말이 안 된다.<br />말이 안 되면 내 측정이 틀린 것이다.</p>
<pre class="css"><code>SELECT l.pid, l.mode, l.granted, c.relname FROM pg_locks l ...</code></pre>
<pre class="coq"><code> pid | mode                     | granted | relname
 111 | ShareUpdateExclusiveLock | t       | anz     &larr; 옛 ANALYZE가 살아 있다
 624 | ShareUpdateExclusiveLock | f       | anz     &larr; 내 측정이 줄 서 있다</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>락 대기였다.</b> 연산이 아니라.</p>
<p data-ke-size="size16">내가 취소했다고 &laquo;믿었던&raquo; ANALYZE가 살아 있었다.</p>
<p data-ke-size="size16"><br />스크립트에 ANALYZE가 네 개 있었고, 하나를 취소하자 psql이 다음 문장으로 넘어갔다.<br /><code>pg_cancel_backend</code>는 쿼리를 끊지 세션을 끊지 않는다.</p>
<p data-ke-size="size16">연결째 끊고 다시 쟀다.</p>
<pre class="angelscript"><code>ANALYZE bench.anz (age)   &rarr;   1,230 ms</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">45초가 1.2초가 됐다. 데이터는 한 글자도 안 바뀌었다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>측정값이 전부 비슷하면 공통 원인을 의심해라. 그 공통 원인이 측정 장치 자신일 수 있다.</b></p>
</blockquote>
<h2 data-ke-size="size26">가설 3 &mdash; 긴 텍스트라서 느리다 (틀림)</h2>
<p data-ke-size="size16">락을 풀고 다시 재니 범인이 선명하게 드러났다.</p>
<pre class="crmsh"><code>uuid          text       163 ms
sex           text        75 ms
age           integer     67 ms
province      text       223 ms
district      text     2,346 ms
occupation    text     2,421 ms
persona       text   156,932 ms   &larr;
skills_list   text[]   8,641 ms
hobbies_list  text[]   7,900 ms</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>persona</code> 하나가 157초, 전체의 94%.</p>
<p data-ke-size="size16">나는 "긴 한국어 텍스트라 비교가 비싸다"고 설명하려 했다.</p>
<p data-ke-size="size16"><br /><code>district</code>&middot;<code>occupation</code>(짧은 한국어) 2.3초 대 <code>persona</code>(긴 한국어) 157초 &mdash;<br /><b>길이 &times; 콜레이션 비용</b>이라는 깔끔한 이야기였다.</p>
<p data-ke-size="size16">그리고 길이를 쟀다.</p>
<pre class="angelscript"><code>persona:  평균 81자, 최대 141자, 고유값 30,000개 (전부 유니크)</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>81자.</b> 짧다. 네 번째로 틀렸다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">결정적 실험 &mdash; 같은 데이터, 콜레이션만 다르게</h2>
<p data-ke-size="size16">가설이 네 번 깨지고 나서야 변인을 하나만 남기는 실험을 설계했다.<br />같은 <code>persona</code> 데이터를 두 테이블에 복사하고, 한쪽만 <code>COLLATE "C"</code>로 바꿨다.</p>
<pre class="crmsh"><code>ANALYZE (COLLATE "C")      &rarr;        91 ms
ANALYZE (기본 콜레이션)     &rarr;   156,416 ms</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>1,719배.</b> 데이터는 동일하다. 콜레이션만 다르다.</p>
<pre class="1c"><code>datcollate      | en_US.utf8
datlocprovider  | c            (glibc)</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">한국어 문자열을 <code>en_US.utf8</code> 규칙으로 비교하고 있었다.<br />ANALYZE는 히스토그램을 만들려고 3만 개 표본을 정렬하고,<br />그 과정에서 glibc <code>strcoll</code>을 약 45만 번 호출한다.<br />비교 1회당 약 350&micro;s. 그게 157초다.</p>
<h2 data-ke-size="size26">그리고 전부가 한 그림으로 맞았다</h2>
<p data-ke-size="size16">콜레이션이 원인이라면 비용은 길이가 아니라 「서로 다른 값의 개수」를 따라야 한다.<br />정렬 비교 횟수가 그것을 따르니까.</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>컬럼</th>
<th>고유값</th>
<th>시간</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>sex</code></td>
<td>2개</td>
<td>75 ms</td>
</tr>
<tr>
<td><code>province</code></td>
<td>수십 개</td>
<td>223 ms</td>
</tr>
<tr>
<td><code>district</code>&middot;<code>occupation</code></td>
<td>수백~수천</td>
<td>2.3~2.4 초</td>
</tr>
<tr>
<td><code>persona</code></td>
<td><b>30,000개 (전부 유니크)</b></td>
<td><b>157 초</b></td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">정확히 맞는다.</p>
<p data-ke-size="size16">남은 건 하나였다. <b>왜 임베딩만 공짜인가?</b></p>
<p data-ke-size="size16"><br /><code>vector_ops</code>가 btree 기본 연산자 클래스라 정렬 경로를 타야 하는데.</p>
<p data-ke-size="size16">통계를 열어 봤다.</p>
<pre class="coq"><code>attname   | avg_width | has_mcv | has_histogram
embedding |        18 |    f    |      f          &larr; 아무것도 없다
district  |        19 |    t    |      t</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>avg_width = 18</code>은 TOAST 포인터 크기다. 값이 <b>한 번도 펼쳐지지 않았다.</b></p>
<p data-ke-size="size16"><code>analyze.c</code>에는 <code>WIDTH_THRESHOLD</code>(1KB)가 있다.</p>
<p data-ke-size="size16"><br />그보다 넓은 값은 MCV&middot;히스토그램 계산에서 <b>통째로 건너뛴다.</b><br />임베딩은 6,148바이트 &mdash; 3만 개 전부가 "too wide"로 스킵된다. 정렬 자체가 일어나지 않는다.</p>
<p data-ke-size="size16">여기서 이 사건의 아이러니가 완성된다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>6KB짜리 벡터 컬럼은 &laquo;너무 커서&raquo; 공짜였고,<br />81자짜리 텍스트 컬럼은 &laquo;적당히 작아서&raquo; 157초였다.</b></p>
</blockquote>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">내 첫 가설이 정확히 거꾸로였던 이유다.<br />나는 크기를 봤는데, Postgres는 크기를 보고 <b>포기</b>한다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">처방과 결과</h2>
<p data-ke-size="size16">원인을 알고 나니 처방은 세 줄짜리 판단이었다.</p>
<p data-ke-size="size16"><code>persona</code>를 비롯한 서술형 텍스트 11개는 앱에서 <b>화면에 실려 나갈 뿐</b><br /><code>WHERE</code>&middot;<code>ORDER BY</code>&middot;<code>JOIN</code> 어디에도 쓰이지 않는다.<br />플래너가 그 히스토그램을 쓸 일이 없다. 157초는 통째로 순손실이다.</p>
<pre class="sql"><code>ALTER TABLE personas ALTER COLUMN persona SET STATISTICS 0;
-- ... 서술형 텍스트 11개</code></pre>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>&nbsp;</th>
<th>ANALYZE</th>
</tr>
</thead>
<tbody>
<tr>
<td>처방 전</td>
<td><b>63분 이상 (끝내 완료 못 함)</b></td>
</tr>
<tr>
<td>처방 후</td>
<td><b>32초</b></td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>WHERE</code>에 쓰는 <code>sex</code>&middot;<code>age</code>&middot;<code>province</code>&middot;<code>district</code>&middot;<code>occupation</code>과 조회 키 <code>uuid</code>는 건드리지 않았다.<br />어차피 싸다. 배열 2개(합 16.5초)도 남겼다 &mdash; 끄면 37배까지 가지만,<br />계획만 있고 아직 안 만든 GIN 인덱스가 살아나면 MCELEM 통계가 필요하다.<br /><b>되돌리기 쉬운 쪽을 열어 뒀다.</b></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그리고 통계가 새로 생기면 플래너 선택이 바뀔 수 있으므로 검색 경로를 다시 쟀다.<br />인덱스 선택 동일, 지연 100.0 / 100.3 ms. 회귀 없음.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">내 작업 방식에 대해 남는 것</h2>
<p data-ke-size="size16"><b>1. 네 번 틀렸고, 네 번 다 측정이 고쳤다.</b><br />임베딩 &rarr; 배열 &rarr; (락) &rarr; 긴 텍스트 &rarr; 콜레이션.<br />내 사전 지식은 매번 그럴듯한 가설을 만들어냈고 매번 틀렸다.<br />이 도메인에서 내 직관의 타율은 0할이었다. 쓸모가 있었던 건 직관이 아니라 <b>다음 실험을 설계하는 능력</b>이었다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>2. 가장 위험한 것은 틀린 가설이 아니라 &laquo;가지런한 숫자&raquo;였다.</b><br />40, 45, 45, 45, 45... 이건 오류처럼 보이지 않는다. 발견처럼 보인다.<br />그걸 살린 건 도메인 지식이 아니라 산술적 부조리 감각이었다 &mdash;<br />고유값 2개짜리 컬럼이 45초일 수는 없다.</p>
<p data-ke-size="size16"><br /><b>틀린 측정은 "이상해 보이는" 얼굴이 아니라 "일관돼 보이는" 얼굴로 온다.</b></p>
<p data-ke-size="size16"><b>3. 변인을 하나만 남기기까지 너무 오래 걸렸다.</b><br />콜레이션 실험은 2분이면 되는 일이었다. 그걸 네 번째 가설이 깨진 뒤에야 했다.<br />앞의 세 가설은 전부 "비싸 보이는 것"을 찾는 방식이었지 <b>변인을 통제하는 방식</b>이 아니었다.<br />비싸 보이는 후보를 하나씩 지우는 것과, 같은 데이터에서 한 변수만 바꾸는 것은 다른 일이다.</p>
<p data-ke-size="size16">후자가 훨씬 빨랐을 것이다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>4. 도구도 조용히 거짓말한다.</b><br /><code>psql -c</code>는 SQL 문자열이나 백슬래시 명령 &laquo;하나&raquo;만 받는다.<br /><code>\timing on</code>을 SQL과 같은 <code>-c</code>에 넣은 내 첫 측정 스크립트는<br /><b>에러 없이 빈 결과</b>를 냈다. 25개 컬럼이 전부 빈칸으로 나왔다.<br />실패가 실패처럼 보이지 않는 경우가 이 세션에만 세 번 있었다<br />(이것, 락 대기, 그리고 <code>::halfvec</code> 캐스트 불일치가 Seq Scan으로 조용히 떨어지는 것).</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>5. 모르는 것을 모른다고 적는 것도 결과다.</b><br />이 세션에는 끝내 못 밝힌 것이 하나 있다.<br /><code>pg_prewarm</code>으로 인덱스를 <code>shared_buffers</code>에 올리면 디스크 읽기가 11,504&rarr;31 블록으로 사라지는데<br /><b>오히려 55ms&rarr;84ms로 느려진다.</b> 2회 재현했고 원인은 규명하지 못했다.</p>
<p data-ke-size="size16">그럴듯한 후보(호스트 메모리 포화)는 있었지만 지표가 뒷받침하지 않았다.<br />그래서 추정을 적지 않고 <code>docker-compose.yml</code> 주석에 <b>"원인 미규명이므로 prewarm 하지 말 것"</b>으로 남겼다.<br />틀린 설명은 없는 설명보다 나쁘다. 다음 사람이 그 설명을 믿고 잘못된 곳을 팔 테니까.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">다음에 같은 증상을 만나면</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><code>pg_stat_progress_analyze</code>의 <code>sample_blks_*</code>를 먼저 본다 &mdash; 100%면 I/O가 아니라 연산이다</li>
<li><b>다른 ANALYZE가 도는지 <code>pg_locks</code>에서 <code>granted=f</code>를 확인한다</b> (이걸 건너뛰면 전부 오측정된다)</li>
<li>같은 스키마의 <b>30,000행 표본</b>을 만든다 &mdash; 본 테이블과 같은 시간이 걸린다</li>
<li><code>ANALYZE tbl (col)</code>로 컬럼 하나씩 끊어 잰다</li>
<li>범인이 텍스트면 <b>같은 데이터를 <code>COLLATE "C"</code>로 복사해 한 번 더 잰다</b> &mdash; 콜레이션인지 여기서 갈린다</li>
<li>플래너가 안 쓰는 컬럼이면 <code>SET STATISTICS 0</code>, 쓰는 컬럼이면 목표치를 낮춘다</li>
</ol>
<p data-ke-size="size16">&nbsp;</p>