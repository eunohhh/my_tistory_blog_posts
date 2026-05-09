<h1>Nemotron Personas &mdash; 임베딩 기반 페르소나 검색 시스템 구현 회고</h1>
<h2 data-ke-size="size26">한 줄 요약</h2>
<p data-ke-size="size16">NVIDIA Nemotron 한국어 페르소나 데이터셋 100만 건을 OpenAI 임베딩으로 벡터화하고,<br />pgvector + HNSW로 의미 검색 시스템을 구축한 뒤,<br />NestJS API + Next.js 프론트로 광고 도메인 페르소나 검색기를 만든 프로젝트.</p>
<h2 data-ke-size="size26">만든 것</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>배포</b>: <a href="https://personas.eunoh.top">https://personas.eunoh.top</a> (API), <a href="https://eunoh.top/tests/personas">https://eunoh.top/tests/personas</a> (UI)</li>
<li><b>관측성</b>: <a href="https://grafana.eunoh.top">https://grafana.eunoh.top</a> (Cloudflare Zero Trust로 보호)</li>
</ul>
<h2 data-ke-size="size26">최종 스택</h2>
<pre class="less"><code>[Next.js 프론트] 
&darr; 
[NestJS API (홈 우분투 서버)] 
&darr; 
├─&rarr; [OpenAI text-embedding-3-small + gpt-4o-mini (HyDE)]
├─&rarr; [Redis: HyDE 캐시 + 임베딩 캐시 (2단)] 
└─&rarr; [PostgreSQL + pgvector + HNSW (100만 행)]
<p>[Cloudflare Tunnel] → 외부 노출 (TLS·라우팅·헬스체크 통합)
[OTel + LGTM 스택] → 관측성 (api → grafana로 시각화)</code></pre></p>
<h2 data-ke-size="size26">숫자로 보는 결과</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>데이터</b>: 100만 행 &times; 26 컬럼 (자연어 10 + 카테고리 9 + 리스트 2 + 메타)</li>
<li><b>임베딩 비용</b>: 약 $16 (OpenAI Batch API, 50% 할인 적용)</li>
<li><b>임베딩 차원</b>: 1536 (text-embedding-3-small)</li>
<li><b>HNSW 인덱스</b>: m=16, ef_construction=64, ef_search=80 &rarr; 약 6GB 디스크</li>
<li><b>검색 응답</b>: 콜드 1243ms / 웜 184ms / API 전체 ~400ms (HyDE LLM 포함, 캐시 미스 기준)</li>
<li><b>매칭 점수</b>: 단순 쿼리 임베딩 ~0.42 &rarr; HyDE 적용 후 0.5+</li>
</ul>
<h2 data-ke-size="size26">학습 목표 vs 실제 학습한 것</h2>
<h3 data-ke-size="size23">시작할 때 적었던 것</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>HuggingFace에서 큰 데이터를 받아 뭔가 만들어보고 싶다</li>
<li>대량 데이터 다뤄보고 싶다</li>
<li>임베딩과 벡터 검색을 직접 해보고 싶다</li>
<li>관측성도 챙겨보고 싶다</li>
</ul>
<h3 data-ke-size="size23">끝나고 보니 실제로 배운 것</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>데이터 탐색 워크플로우 (5단계 체크리스트로 표준화)</li>
<li><b>임베딩의 본질</b> &mdash; "특정 모델만의 좌표계"라는 멘탈 모델</li>
<li>임베딩 입력 텍스트 설계의 비중 (모델보다 입력이 70%)</li>
<li>쿼리 측 augmentation (HyDE) &mdash; 0.42 &rarr; 0.5+로 끌어올린 경험</li>
<li>OpenAI Batch API의 운영 함정 (enqueue 한도, 등록-후-즉시-실패, 체크포인팅 필요성)</li>
<li>pgvector 옵티마이저의 path 선택 (selectivity 기반, ef_search의 진짜 역할)</li>
<li>COPY로 100만 건 적재 (라운드트립 vs 단일 스트림)</li>
<li>Prisma + pg.Pool 하이브리드 패턴 (vector 타입과 거리 연산자가 ORM 추상화 밖)</li>
<li>관측성의 운영 디테일 &mdash; rate()의 sample 부족 문제, "비어 보임"과 "0"의 차이, 비율 기반 알림의 트래픽 가드, severity 라우팅으로 dev/prod 잡음 분리</li>
<li>Cloudflare Tunnel의 진짜 사용법 (앞단 reverse proxy 불필요)</li>
</ul>
<h3 data-ke-size="size23">의도하지 않게 얻은 것</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Redis 캐시 설계 (2단 캐시, fallible하게 다루기, sha256 키 + 모델명 prefix)</li>
<li>며칠짜리 비동기 작업의 구조화 (체크포인팅, 일시 오류 재시도, 재개 가능성)</li>
<li>옵티마이저를 의심하지 않고 EXPLAIN으로 검증하는 습관</li>
<li>한국 IP에서의 OpenAI Batch API enqueue 패턴 &mdash; Tier 2 한계 안에서 throughput 짜내기</li>
</ul>
<h2 data-ke-size="size26">시리즈 글 가이드</h2>
<p data-ke-size="size16">각 글이 다루는 주제와, 어떤 상황에서 다시 펼쳐보면 좋을지.</p>
<p data-ke-size="size16">타이틀 클릭시 이동됨.</p>
<h3 data-ke-size="size23"><a href="https://ifelseif.tistory.com/339" target="_blank" rel="noopener">01. dataset</a></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>다루는 것</b>: HuggingFace <code>datasets</code> 라이브러리, parquet의 컬럼 지향 의미, 100만 행 탐색 5단계 체크리스트, 1만&rarr;100만 스케일업 워크플로우</li>
<li><b>다시 볼 때</b>: 새 데이터셋 받았을 때, 데이터 탐색 표준 절차 떠올려야 할 때</li>
</ul>
<h3 data-ke-size="size23"><a href="https://ifelseif.tistory.com/340" target="_blank" rel="noopener">02. embedding</a></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>다루는 것</b>: 임베딩의 본질("좌표계"), 모델 선택 트레이드오프(API vs 로컬, small vs large), 입력 텍스트 설계, <b>HyDE 패턴과 2단 캐시</b>, OpenAI Batch API 함정, 검증 패턴</li>
<li><b>다시 볼 때</b>: 회사에서 임베딩/RAG 시스템 도입 결정할 때 &mdash; 가장 먼저 펼쳐볼 글</li>
<li><b>비중 큰 섹션</b>: HyDE (0.42 &rarr; 0.5+로 끌어올린 부분)</li>
</ul>
<h3 data-ke-size="size23"><a href="https://ifelseif.tistory.com/341" target="_blank" rel="noopener">03. pgvector + HNSW</a></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>다루는 것</b>: 호스팅 결정(Supabase/Railway/로컬 비교), HNSW 빌드 파라미터, <b>옵티마이저 path 선택 문제</b> (selectivity 기반), 콜드/웜 캐시, COPY 적재, Prisma + pg.Pool 하이브리드</li>
<li><b>다시 볼 때</b>: 벡터 검색을 Postgres에 얹을 때, "인덱스가 안 쓰이는 것 같은데?" 의심이 들 때</li>
<li><b>비중 큰 섹션</b>: 옵티마이저 path 인과 분리</li>
</ul>
<h3 data-ke-size="size23"><a href="https://ifelseif.tistory.com/342" target="_blank" rel="noopener">04. observability</a></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>다루는 것</b>: LGTM 스택 + OTel, Grafana request rate 빈 결과 진단, 비율 기반 알림의 트래픽 가드, severity 라우팅</li>
<li><b>다시 볼 때</b>: 새 서비스에 관측성 처음 붙일 때, 알림 잡음으로 답답할 때</li>
<li><b>비중 큰 섹션</b>: rate()와 <code>[$__rate_interval]</code>, <code>or vector(0)</code> fallback, 알림 라우팅</li>
</ul>
<h3 data-ke-size="size23"><a href="https://ifelseif.tistory.com/338" target="_blank" rel="noopener">05. pitfalls</a></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>다루는 것</b>: 위 4개 영역에서 부딪힌 함정들의 증상/원인/해결/메모 형식 모음</li>
<li><b>다시 볼 때</b>: "어디서 봤더라" 싶은 증상이 떠오를 때 &mdash; 키워드 검색용 인덱스</li>
</ul>
<h2 data-ke-size="size26">멘탈 모델의 진화</h2>
<p data-ke-size="size16">이 프로젝트로 5가지 영역의 멘탈 모델이 한 단계씩 진화했다. 각 글에 자세히 적었지만 한 줄 요약하면:</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>영역</th>
<th>시작</th>
<th>끝</th>
</tr>
</thead>
<tbody>
<tr>
<td>데이터셋</td>
<td>"HF에서 받는 거"</td>
<td>5단계 체크리스트로 표준화</td>
</tr>
<tr>
<td>임베딩</td>
<td>"1536차원? 그게 뭔데"</td>
<td>"특정 모델만의 좌표계, 입력 텍스트 설계가 70%"</td>
</tr>
<tr>
<td>pgvector</td>
<td>"pg_trgm처럼 인덱스 만들면 끝"</td>
<td>"필터 selectivity가 path 결정, ef_search는 path가 아니라 후보 풀"</td>
</tr>
<tr>
<td>관측성</td>
<td>"Slack 알림은 있는데 컨텍스트 없음"</td>
<td>"rate()/window/sample/fallback의 상호작용, 라우팅으로 잡음 분리"</td>
</tr>
<tr>
<td>운영</td>
<td>"외부 노출하려면 nginx"</td>
<td>"cloudflared 단독으로 충분, ufw + Tailscale 인터페이스"</td>
</tr>
</tbody>
</table>
<h2 data-ke-size="size26">다음 단계 후보</h2>
<p data-ke-size="size16">회고를 위한 멈춤이지 종료는 아니다. 이어서 가능한 트랙들:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>검색 결과 캐시</b> (Redis 학습 심화) &mdash; (query+filters) 해시 &rarr; 결과 5분 TTL</li>
<li><b>광고 도메인 워크플로우</b> &mdash; "캠페인 페르소나 N명 셋 만들기 &rarr; CSV/PDF 내보내기", LLM이 카피 검수</li>
<li><b>Rate limiting</b> &mdash; IP별 분당 요청 제한</li>
<li><b>관측성 확장</b> &mdash; 임베딩/DB/Redis/비즈니스 메트릭 단계적 추가</li>
<li><b>실험 시나리오</b> &mdash; 회사 동료/클라이언트에게 personas.eunoh.top 던져 의견 받기</li>
</ul>
<h2 data-ke-size="size26">회고를 마치며</h2>
<p data-ke-size="size16">처음에 "허깅페이스에서 큰 데이터로 뭘 해본 게 처음"이라고 시작했다. <br />끝에 와서는 데이터 다운로드부터 임베딩 파이프라인, 벡터 인덱스 튜닝, 캐시 설계, API/UI, 외부 노출, 관측성까지 한 번에 통과했다.</p>
<p data-ke-size="size16">가장 큰 자산은 코드가 아니라 <b>"부딪혀봐야만 알 수 있는 것들의 목록"</b>과 <b>그 5가지 멘탈 모델의 진화</b>다. <br />책으로 못 배우는 영역들이라, 회사에서 비슷한 시스템 만들 때 시작선이 달라질 것.</p>