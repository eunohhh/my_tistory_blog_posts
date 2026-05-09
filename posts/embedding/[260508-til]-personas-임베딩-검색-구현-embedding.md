<h1>0. 벡터 임베딩 처음 구현해본 후기</h1>
<h2 data-ke-size="size26">1. 임베딩의 본질 &mdash; "특정 모델만의 좌표계"</h2>
<h3 data-ke-size="size23">시작 시점의 멘탈 모델</h3>
<p data-ke-size="size16">"어깨너머로 본 벡터 임베딩. 1536차원이라는데 대체 그게 무슨 차원이라는 거지?"</p>
<h3 data-ke-size="size23">끝 시점의 멘탈 모델</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>인간이 1536차원 배열을 보고 의미를 읽을 수는 없다.<br />대신 "두 벡터의 거리가 얼마나 가까운가"가 의미적 유사도를 표현한다.</li>
<li>더 중요한 깨달음: 임베딩은 "절대적 의미 좌표계"가 아니라 <b>특정 모델만의 좌표계</b>다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>text-embedding-3-small의 좌표 &ne; BGE-M3의 좌표</li>
<li>두 벡터를 비교하려면 같은 모델로 만들어야만 한다.</li>
<li>&rarr; 인덱싱한 모델과 검색 시 쓰는 모델이 반드시 같아야 한다!</li>
</ul>
</li>
<li>차원 수(1536, 3072 등)는 "표현 해상도". 높을수록 미세한 의미 차이를 담을 수 있지만, 저장&middot;연산 비용도 비례해서 증가.</li>
</ul>
<h2 data-ke-size="size26">2. 모델 선택 트레이드오프</h2>
<p data-ke-size="size16"><b>1. API vs 로컬(self-hosted)</b></p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>&nbsp;</th>
<th>API (OpenAI, Cohere 등)</th>
<th>로컬 (BGE-M3, E5 등)</th>
</tr>
</thead>
<tbody>
<tr>
<td>초기 비용</td>
<td>0 (호출당 과금)</td>
<td>GPU/서버 비용 선투자</td>
</tr>
<tr>
<td>운영</td>
<td>호출만 하면 됨</td>
<td>모델 로딩, 메모리, 배치 처리 직접 관리</td>
</tr>
<tr>
<td>데이터</td>
<td>외부로 나감</td>
<td>내부에서 끝남</td>
</tr>
<tr>
<td>속도</td>
<td>네트워크 + 큐 대기</td>
<td>GPU 있으면 빠름, CPU면 느림</td>
</tr>
<tr>
<td>모델 선택권</td>
<td>제공자가 주는 것만</td>
<td>허깅페이스에 있는 거 다 가능</td>
</tr>
<tr>
<td>100만건 비용 예시</td>
<td>text-embedding-3-small ~$X</td>
<td>전기세 + 시간</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16"><b><br />언제 어느 쪽? &gt; 이번엔 그냥 API 사용함</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>API: 프로토타입, 1회성 인덱싱, 데이터 민감도 낮음, 운영 인력 적음 &rarr; 이번 프로젝트</li>
<li>로컬: 지속적으로 임베딩 만들어야 함, 데이터 외부 반출 불가, 한국어 특화 모델 쓰고 싶음</li>
</ul>
<p data-ke-size="size16"><b>2. small vs large (같은 제공자 안에서)</b></p>
<p data-ke-size="size16">OpenAI 기준 예시:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>text-embedding-3-small</code>: 1536차원, $0.02/1M 토큰</li>
<li><code>text-embedding-3-large</code>: 3072차원, $0.13/1M 토큰 (약 6.5배)</li>
</ul>
<p data-ke-size="size16"><b>3. 차원 수의 의미</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>임베딩 생성 비용</b>: 일반적으로 차원 &uarr; &rarr; 토큰당 가격 &uarr;</li>
<li><b>저장 비용</b>: 1536 vs 3072 &rarr; DB 용량 2배</li>
<li><b>검색 비용</b>: 거리 계산이 차원에 비례. HNSW 같은 ANN 인덱스 빌드/탐색도 차원에 비례해서 느려짐</li>
</ul>
<h2 data-ke-size="size26">3. 임베딩 입력 텍스트 설계</h2>
<h3 data-ke-size="size23">왜 입력 텍스트 설계가 중요한가</h3>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">"임베딩은 모델 고르는 게 아니라 입력 텍스트를 설계하는 일이다."</p>
</blockquote>
<p data-ke-size="size16">임베딩 품질의 70%는 "어떤 텍스트를 넣느냐"에서 결정된다고 함. 모델은 도구일 뿐이고, 입력이 곧 좌표를 정하는...</p>
<h3 data-ke-size="size23">26개 컬럼 &rarr; 1개 문자열로</h3>
<p data-ke-size="size16">원본 데이터: 26개 컬럼 (자연어 + 범주형 혼합)</p>
<p data-ke-size="size16">전략 검토:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>A안. 모든 컬럼을 단순 concat
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>단점: 신호가 묻힘. 짧은 컬럼은 긴 컬럼에 가려짐.</li>
</ul>
</li>
<li>B안. 자연어 컬럼만 선별 + 단순 concat
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>단점: 컬럼 경계가 사라져서 모델이 어떤 정보가 어떤 측면인지 구분 못함.</li>
</ul>
</li>
<li>C안. 자연어 컬럼 10개 선별 + 섹션 태그 + 순서 설계 &larr; 채택
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>컬럼별로 <code>[섹션명]</code> 태그를 앞에 붙여 모델에게 "이건 어떤 측면" 신호 제공</li>
<li>핵심 요약을 <code>[요약]</code> 태그로 가장 앞에 배치 (트랜스포머의 앞 토큰 가중)</li>
</ul>
</li>
</ul>
<h3 data-ke-size="size23">최종 입력 텍스트 형식</h3>
<pre class="prolog"><code>[요약] (페르소나 핵심 요약)
[직업] ...
[성격] ...
[관심사] ...
...</code></pre>
<h3 data-ke-size="size23">왜 26 &rarr; 10인가</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>범주형 컬럼은 임베딩보다 메타데이터 필터로 다루는 게 효율적<br />(예: age_group은 WHERE 절로 필터, 임베딩 텍스트엔 불필요)</li>
<li>짧은 컬럼이나 거의 모든 행에서 같은 값을 갖는 컬럼은 신호 기여도 낮음</li>
<li>임베딩 토큰 비용 = 텍스트 길이에 비례. 신호 낮은 컬럼 빼는 게 비용에도 이득</li>
</ul>
<h2 data-ke-size="size26">4. 쿼리 augmentation (HyDE)</h2>
<h3 data-ke-size="size23">적용했더니?</h3>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">매칭 점수 분포 변화. 상위 10건 평균 &gt; 0.42 &rarr; 0.5+<br />그냥 사람이 봐도 유사한 사례가 확실히 많이 나옴</p>
</blockquote>
<h3 data-ke-size="size23">왜 작동하는가??</h3>
<p data-ke-size="size16">임베딩 좌표계에서 "짧은 쿼리 텍스트"와 "긴 페르소나 문서"는 형식&middot;길이&middot;문체가 달라서 자연스럽게 멀리 떨어진다.<br />같은 의미를 담고 있어도 좌표상으론 다른 동네에 있는 셈.<br />그러니, 사용자가 쿼리를 짧게 입력하면 덜 정확한 결과가 나오게 된다.</p>
<p data-ke-size="size16">HyDE는 쿼리를 "페르소나 문서처럼 생긴 가상 문서"로 변환한 뒤 임베딩한다.<br />즉 좌표계의 같은 동네로 옮긴 다음 비교한다. 의미가 같으면 진짜로 가까운 위치가 나오기 시작한다.</p>
<h3 data-ke-size="size23">캐시 설계 (2단)</h3>
<p data-ke-size="size16">L1 (HyDE 결과 캐시):</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>key: hyde:gpt-4o-mini:{sha256(query + filters)}</li>
<li>value: HyDE가 생성한 11섹션 텍스트</li>
<li>TTL: 30d</li>
<li>목적: 같은 (쿼리, 필터) &rarr; LLM 재호출 회피</li>
</ul>
<p data-ke-size="size16">L2 (임베딩 캐시):</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>key: emb:text-embedding-3-small:{sha256(11섹션 텍스트)}</li>
<li>value: 1536차원 벡터</li>
<li>TTL: 30d</li>
<li>목적: 같은 텍스트 &rarr; 임베딩 재호출 회피</li>
</ul>
<h3 data-ke-size="size23">왜 2단인가</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>L1만 있으면: 다른 쿼리지만 HyDE 결과가 같은 케이스를 못 잡음 (드물지만 있음)</li>
<li>L2만 있으면: HyDE는 매번 호출 (LLM 비용 + 500ms~1s 지연)</li>
<li>2단으로 분리: temperature=0 &rarr; HyDE 결과 결정적 &rarr;<br />L1 miss인데 같은 텍스트가 나오면 L2 hit으로 임베딩 비용 절감</li>
</ul>
<h3 data-ke-size="size23">HyDE의 함정도 있다</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>HyDE는 LLM이 잘못된 사실을 만들어내도 그게 임베딩되어 검색에 영향을 줄 수 이다.</li>
<li>따라서 사실성보다 "형식 흉내"가 목적임을 인지하고 프롬프트 설계~.</li>
<li>temperature=0 보장 안 하면 캐시 hit율이 급락 (매번 다른 텍스트 &rarr; L2 miss)</li>
</ul>
<h2 data-ke-size="size26">5. OpenAI Batch API 의 함정</h2>
<h3 data-ke-size="size23">왜 Batch API였나</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>100만건 동기 호출은 RPM/TPM 한도에 막힘</li>
<li>Batch API는 50% 할인 + 24h 내 비동기 처리</li>
</ul>
<h3 data-ke-size="size23">부딪힌 함정</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>"Enqueued token limit"은 동시 큐 한도(20M)이지 일일 한도가 아니다. 공식 문서를 처음엔 일일 한도로 오해.</li>
<li>batch 파일 1개가 enqueue 한도를 통째로 넘으면 (50K건 &asymp; 80M 토큰) 파일 전체가 거부됨...</li>
<li>해결: 12K건 단위로 분할. 동시 N개를 큐에 올려두고 끝나는 대로 다음 거 투입.</li>
<li>부수 함정: batch가 "성공적으로 등록됐지만 즉시 failed" 상태로 떨어지는 케이스. SDK 예외가 안 뜨므로 status 폴링 + 검사 필수.</li>
</ul>
<h2 data-ke-size="size26">6. 검증 패턴</h2>
<h3 data-ke-size="size23">1만건 샘플에서 했어야 했지만 못 한 검증</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>매칭 점수 분포의 상한이 0.42에서 막히는 이유 분석<br />&rarr; 입력 텍스트 설계 문제인지, 모델 한계인지, 쿼리 측 문제인지 분리해서 봤어야<br />&rarr; 100만건 다 돌리고 나서 HyDE 도입한 건 사후 대응. 1만건 단계에서 발견했으면 더 빨랐을 것.</li>
<li>의미적으로 가까워야 할 페르소나 쌍의 유사도가 실제로 가까운지 sanity check<br />(예: 같은 직업, 비슷한 성격의 페르소나 5쌍을 직접 골라서 유사도 측정)</li>
<li>"전혀 안 비슷한 쌍"의 유사도 분포도 같이 봤어야 (false match 기준선)</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><a href="https://ifelseif.tistory.com/343" target="_blank" rel="noopener">overview보기</a></p>