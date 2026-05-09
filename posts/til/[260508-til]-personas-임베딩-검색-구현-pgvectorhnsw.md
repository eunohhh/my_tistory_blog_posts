<h1>pgvector + HNSW 검색 시스템 설계 후기</h1>
<h2 data-ke-size="size26">0. 시작 vs 끝 시점의 멘탈 모델</h2>
<h2 data-ke-size="size26">시작 시점의 멘탈 모델</h2>
<p data-ke-size="size16">pg_trgm + GIN 같은 거 해봤으니 pgvector도 비슷하게 인덱스 만들고 WHERE + ORDER BY 하면 될 거 같다</p>
<h2 data-ke-size="size26">끝 시점의 멘탈 모델</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>HNSW는 일반 인덱스와 본질이 다르다. "사전 그래프"여서 필터와 결합되는 순간 옵티마이저의 path 선택 문제가 발생.</li>
<li>옵티마이저는 데이터 분포 보고 케이스별로 옳은 선택을 하고 있다 (Path A vs Path B).</li>
<li>우리가 할 일은 ef_search 같은 힌트로 후보 풀 크기를 조절하는 것.</li>
<li>100만건 적재는 INSERT가 아니라 COPY. 라운드트립 vs 단일 스트림 차이.</li>
</ul>
<h2 data-ke-size="size26">1. 호스팅 결정: Supabase / Railway / 로컬 Docker</h2>
<h3 data-ke-size="size23">후보 비교</h3>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>&nbsp;</th>
<th>Supabase</th>
<th>Railway Hobby</th>
<th>로컬 Docker (홈서버)</th>
</tr>
</thead>
<tbody>
<tr>
<td>비용</td>
<td>무료 시작 가능</td>
<td>8GB RAM</td>
<td>전기세</td>
</tr>
<tr>
<td>pgvector</td>
<td>○</td>
<td>○</td>
<td>○</td>
</tr>
<tr>
<td>RAM</td>
<td>플랜 의존</td>
<td>8GB (HNSW 빌드 가능)</td>
<td>홈서버 사양</td>
</tr>
<tr>
<td>강점</td>
<td>Auth/Realtime/Storage/RLS</td>
<td>배포 단순함</td>
<td>백엔드와 같은 위치</td>
</tr>
<tr>
<td>이번 프로젝트와의 매치</td>
<td>강점이 거의 안 쓰임</td>
<td>백엔드도 따로 배포 필요</td>
<td>백엔드와 같이 묶임</td>
</tr>
</tbody>
</table>
<h3 data-ke-size="size23">선택: 로컬 Docker</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이유: 어차피 백엔드를 홈서버에서 운영. DB가 같은 머신이면 네트워크 0ms.</li>
<li>트레이드오프: 가용성/백업은 직접 책임. 대신 HNSW 인덱스 메모리 상주를 자유롭게 튜닝 가능.</li>
<li>pgvector 단일 용도면 Supabase는 "비싼 Postgres"가 됨. 강점 매트릭스가 안 맞을 때 무료 플랜이라도 도구가 과해짐.</li>
</ul>
<h3 data-ke-size="size23">다음에 비슷한 결정 만나면</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>멀티테넌트 + Auth + RLS 필요 &rarr; Supabase</li>
<li>빠른 PoC + 외부 노출 &rarr; Railway</li>
<li>비용/성능/통제권 우선 + 운영 책임 OK &rarr; 로컬 또는 자체 호스팅</li>
</ul>
<h2 data-ke-size="size26">2. HNSW 인덱스 빌드 파라미터</h2>
<h3 data-ke-size="size23">이번 프로젝트의 실제 숫자</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>데이터: 100만 행 &times; 1536차원</li>
<li>인덱스 빌드 시간: 60분 (m=16, ef_construction=64)</li>
<li>빌드 중 메모리 사용: 8GB</li>
<li>인덱스 디스크 크기: 6GB</li>
<li>ef_search=80에서 평균 응답:226ms</li>
</ul>
<pre class="sql"><code>-- HNSW 인덱스: 정확도와 속도의 균형
-- m=16, ef_construction=64는 일반적인 권장값
CREATE INDEX idx_personas_embedding ON personas
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
<p>-- 통계 갱신
ANALYZE personas;</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>m</code>: 그래프 연결 차수. 클수록 정확&uarr;, 메모리&uarr;, 빌드 느림. 16이 표준.</li>
<li><code>ef_construction</code>: 빌드 시 탐색 폭. 클수록 정확&uarr;, 빌드 느림. 64~128.</li>
<li>검색 시엔 <code>ef_search</code> (런타임 파라미터)로 정확도/속도 조절. 기본 40, 높이면 더 정확.</li>
<li>나는 최종적으로 80으로 잡았다.</li>
<li>pgvector HNSW 인덱스는 메모리 상주가 성능에 직결됨.</li>
<li>100만건 &times; 1536차원 인덱스는 대략 <b>6~8GB RAM</b> 정도 잡아먹는다(<code>m=16</code> 기준).</li>
</ul>
<h2 data-ke-size="size26">3. 그러나 옵티마이저는 HNSW 를 바로 안타네?</h2>
<h3 data-ke-size="size23">처음에 이상했던 것</h3>
<p data-ke-size="size16"><code>sex=여자 + age 20-29 + 서울</code> (15,864명) 쿼리에서<br />HNSW 인덱스를 만들었는데도 EXPLAIN을 보니 demographic 인덱스만 쓰고 있었음.</p>
<h3 data-ke-size="size23">무슨일이 일어났나?</h3>
<pre class="routeros"><code>Index Scan using idx_personas_demo &larr; demographic 인덱스(sex/age/province)만 사용 
Index Cond: (sex = '여자' AND age &gt;= 20 AND age &lt;= 29 AND province = '서울') rows=15864
...그후...
Sort (top-N heapsort) &larr; 15,864명을 가져와서 메모리에서 코사인 유사도로 전체 정렬</code></pre>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>demographic 필터로 15,864명 추림</li>
<li><b>15,864명 전부 임베딩 가져와서</b> 쿼리 벡터와 거리 계산</li>
</ol>
<p data-ke-size="size16">"인덱스 만들었는데 왜 안 써?"가 첫 반응.</p>
<h3 data-ke-size="size23">알게 된 것: 필터 + 벡터 검색의 근본 트레이드오프</h3>
<p data-ke-size="size16">HNSW는 사전에 그래프를 만들어두는 인덱스라<br />"코사인 거리로 가까운 K개"는 잘 찾지만,<br />"필터를 만족하면서 가까운 K개"는 본질적으로 어렵다.</p>
<p data-ke-size="size16">옵티마이저는 두 가지 path 중 하나를 선택:</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>&nbsp;</th>
<th>Path A</th>
<th>Path B</th>
</tr>
</thead>
<tbody>
<tr>
<td>흐름</td>
<td>HNSW로 K개 &rarr; 필터 &rarr; 부족하면 K 늘림</td>
<td>필터로 좁힘 &rarr; 무차별 거리 계산</td>
</tr>
<tr>
<td>빡빡한 필터(1.6%)</td>
<td>K 키워도 필터 통과 못 채울 위험</td>
<td>후보 작아서 빠름</td>
</tr>
<tr>
<td>느슨한 필터(50%)</td>
<td>후보 풀 충분, HNSW 유리</td>
<td>50만 건 전부 계산, 느림</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">옵티마이저는 데이터 분포 통계 보고 케이스별로 옳은 선택.</p>
<h3 data-ke-size="size23">두 케이스 비교 (실측)</h3>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>쿼리</th>
<th>선택한 path</th>
<th>이유</th>
</tr>
</thead>
<tbody>
<tr>
<td>sex=여자 + 20-29 + 서울 (15,864명, 1.6%)</td>
<td>demographic &rarr; 정렬 (Path B)</td>
<td>후보 작아서 무차별이 안전</td>
</tr>
<tr>
<td>sex=여자 (50만명, 50%)</td>
<td>HNSW &rarr; 필터 (Path A)</td>
<td>후보 너무 커서 HNSW가 유리</td>
</tr>
</tbody>
</table>
<h3 data-ke-size="size23">내가 한 처치: ef_search=100</h3>
<p data-ke-size="size16">SET LOCAL hnsw.ef_search = 100을 추가한 게 path를 바꾼 게<br />아니라는 점을 알게 됨. path 결정은 <b>필터 selectivity</b>가 한다.</p>
<p data-ke-size="size16">ef_search의 진짜 효과는:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>HNSW path가 선택된 상황에서, 후보 풀 크기를 키워서<br />"LIMIT 5인데 필터 통과한 게 3개뿐" 같은 사태를 방지.</li>
<li>기본 40 &rarr; 80~100으로 올리면 안전 마진.</li>
</ul>
<h3 data-ke-size="size23">핵심 인사이트</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>"인덱스 안 쓰네?"는 옵티마이저가 데이터 분포 보고 더 빠른 길을 골랐을 가능성이 높다.</li>
<li>의심하기 전에 EXPLAIN으로 "어느 path를 골랐고 왜 그게 합리적인지" 검토할 것.</li>
<li>pg_trgm + GIN 다뤘던 경험이 그대로 적용됨: 옵티마이저는 통계와 selectivity로 판단한다.</li>
</ul>
<h2 data-ke-size="size26">4. 콜드 캐시 vs 웜 캐시 (1243ms &rarr; 184ms)</h2>
<h3 data-ke-size="size23">무엇을 봤나</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>처음 던진 쿼리: 1243ms</li>
<li>같은 쿼리 두 번째: 184ms</li>
<li>약 6.7배 차이</li>
</ul>
<h3 data-ke-size="size23">왜 그런가</h3>
<p data-ke-size="size16">PostgreSQL은 데이터/인덱스를 페이지(8KB) 단위로 읽는다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>콜드: 페이지가 shared_buffers나 OS page cache에 없어서 디스크 I/O 발생</li>
<li>웜: 같은 페이지가 메모리에 올라와 있어서 바로 읽음</li>
</ul>
<p data-ke-size="size16">HNSW에선 이게 더 두드러짐:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>HNSW는 그래프 탐색이라 여러 페이지를 점프하며 읽음</li>
<li>인덱스 일부만 캐시에 있으면 그래프 탐색 중간에 디스크 I/O가 끼어듦</li>
<li>한 번 따뜻해지면 그래프 전체가 메모리에서 동작</li>
</ul>
<h3 data-ke-size="size23">함의</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>1243ms는 "이 쿼리의 진짜 성능"이 아니라 "콜드 페널티 포함 성능"</li>
<li>운영에선 자주 쓰이는 인덱스가 항상 웜 상태이도록 해야 함</li>
<li>shared_buffers가 인덱스를 다 담을 수 있는지 확인 (이번 케이스 6~8GB)</li>
<li>서비스 시작 직후의 첫 요청 페널티를 피하려면 워밍업 쿼리 (pg_prewarm 익스텐션 등)</li>
</ul>
<h3 data-ke-size="size23">벤치마크할 때 주의</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>"쿼리 한 번 돌려보고 N ms 나왔다"는 거의 의미 없음</li>
<li>같은 쿼리 여러 번 돌려서 콜드/웜을 분리해서 보거나</li>
<li>다양한 쿼리로 캐시를 의도적으로 흔들면서 측정</li>
</ul>
<h2 data-ke-size="size26">COPY로 100만건 적재 패턴 (INSERT 대비)</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>INSERT 100만 건은 30분<del>1시간, COPY는 5</del>10분 (네트워크 라운드트립 vs 단일 스트림 차이)</li>
<li><code>with cur.copy(SQL) as copy:</code> 블록 안에서 <code>copy.write_row(fields)</code>로 행 단위 push, 블록 빠지면 자동 flush+종료</li>
<li>vector 컬럼 값은 <code>register_vector()</code> 자동 변환 안 통하고 직접 <code>"[" + ",".join(...) + "]"</code> 문자열로 만들어 넘겨야 함 (COPY TEXT 포맷의 한계)</li>
</ul>
<h2 data-ke-size="size26">5. Prisma + pg.Pool 하이브리드 패턴</h2>
<h3 data-ke-size="size23">역할 분담</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Prisma: 메타 CRUD (페르소나 메타 정보, 사용자, 검색 로그 등)
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>스키마 &rarr; 타입 자동 생성으로 DX 좋음</li>
<li>db pull/push로 마이그레이션 관리</li>
</ul>
</li>
<li>pg.Pool (raw SQL): 벡터 검색 쿼리
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>vector 타입과 거리 연산자(&lt;=&gt;, &lt;-&gt;, &lt;#&gt;) 사용</li>
<li>SET LOCAL로 ef_search 같은 튜닝 파라미터 제어</li>
<li>EXPLAIN 분석 가능</li>
</ul>
</li>
</ul>
<h3 data-ke-size="size23">왜 raw SQL인가</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Prisma는 vector 타입을 정식 매핑하지 않음 (Unsupported로만 받을 수 있음)</li>
<li>거리 연산자 &lt;=&gt;는 Prisma 빌더로 표현 불가</li>
<li>HNSW 튜닝(ef_search)은 ORM 추상화 밖</li>
</ul>
<h3 data-ke-size="size23">두 클라이언트 공존이 위험하지 않은가</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>같은 DB를 가리키므로 데이터 일관성 OK</li>
<li>트랜잭션 경계만 주의: Prisma와 pg.Pool 양쪽에 걸치는 트랜잭션은 피함</li>
<li>커넥션 풀은 분리됨 &rarr; 풀 사이즈를 양쪽 합산해서 max_connections 안 넘게 산정</li>
</ul>
<h3 data-ke-size="size23">부수 이점: db pull 안 해도 됨</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>검색 쿼리가 Prisma 스키마와 무관해서,<br />pgvector 컬럼/인덱스 변경 시 Prisma 재생성 사이클 안 거쳐도 됨</li>
<li>운영 중 인덱스 튜닝이 가벼워짐</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><a href="https://ifelseif.tistory.com/343" target="_blank" rel="noopener">overview보기</a></p>