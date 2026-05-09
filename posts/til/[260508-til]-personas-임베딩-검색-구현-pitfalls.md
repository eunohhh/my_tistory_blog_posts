<h1>Nemotron Personas 프로젝트 함정 노트</h1>
<p data-ke-size="size16">이 프로젝트를 진행하면서 직접 부딪혀 알게 된 함정들.<br />미래의 내가 같은 증상을 만났을 때 키워드로 찾을 수 있도록 정리.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">임베딩</h2>
<h3 data-ke-size="size23">임베딩 모델은 인덱싱과 검색에 같은 걸 써야 한다 (좌표계 일관성)</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: 다른 모델로 임베딩한 두 벡터를 비교하면 의미적으로 가까운 것도 멀게 나옴</li>
<li><b>원인</b>: 임베딩 좌표계는 모델별로 다름. text-embedding-3-small의 (1536차원) 좌표 &ne; BGE-M3의 좌표. 차원 수가 같다고 해도 다른 좌표계.</li>
<li><b>해결</b>: 인덱싱한 모델과 검색 시 쓰는 모델을 동일하게 고정. 모델 변경 시 전체 재임베딩.</li>
<li><b>메모</b>: 어깨너머로 봤을 땐 "한 번 차원 좌표계를 만들면 다 똑같이 쓰는 줄" 알았던 게 오개념.</li>
</ul>
<h3 data-ke-size="size23">쿼리와 문서의 길이/형식 비대칭 &rarr; 유사도 천장</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: 의미적으로 분명히 가까운데도 코사인 유사도 0.42 정도에서 막힘</li>
<li><b>원인</b>: 페르소나 문서는 1500<del>2500자 풀 텍스트, 쿼리는 10</del>30자 단편. 같은 좌표계여도 길이/스타일이 달라서 좌표상 멀리 떨어짐.</li>
<li><b>해결</b>: HyDE 패턴 &mdash; 쿼리를 LLM으로 "페르소나 형식의 가상 문서"로 확장한 뒤 그걸 임베딩. 0.5+ 달성.</li>
<li><b>메모</b>: 임베딩 품질의 70%는 모델이 아니라 입력 텍스트 설계에서 나온다. 쿼리 측도 마찬가지.</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">OpenAI Batch API</h2>
<h3 data-ke-size="size23">Batch API enqueue 한도 오해 &mdash; "동시 큐 한도"이지 일일 한도 아님</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: 50K건짜리 batch 파일 업로드 시 "Enqueued token limit exceeded"로 통째로 거부</li>
<li><b>원인</b>: enqueue 한도(20M 토큰)는 동시에 큐에 올려둘 수 있는 총량. 일일 처리 한도가 아님. 파일 하나가 한도 초과면 부분 수락 없이 통째 거부.</li>
<li><b>해결</b>: 1개 batch당 한도의 절반 이하로 분할 (이번 프로젝트 12K건 &asymp; 19M 토큰). 동시 N개 큐 &rarr; 끝나는 대로 다음 투입.</li>
<li><b>메모</b>: 공식 문서 처음 읽을 때 일일 한도로 오해. 한 번 부딪혀야 알 수 있는 함정.</li>
</ul>
<h3 data-ke-size="size23">Batch가 "등록 성공 후 즉시 fail"</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: SDK 예외 없이 batch 생성됐는데 status가 곧바로 failed</li>
<li><b>원인</b>: 입력 파일 형식 오류 등을 등록 시점이 아니라 처리 시점에 검증</li>
<li><b>해결</b>: batch 생성 직후 status 폴링 필수. failed면 errors 필드 확인 후 재투입.</li>
<li><b>메모</b>: SDK가 예외를 안 던지므로 "성공했다"고 가정하면 안 됨. status 검사가 워크플로우의 일부.</li>
</ul>
<h3 data-ke-size="size23">일시 오류(504 등)에 워크플로우가 통째로 죽는 패턴</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: 몇 시간짜리 임베딩 작업 중 일시적 504로 스크립트 전체 종료</li>
<li><b>원인</b>: 재시도 로직이나 체크포인팅 없이 단일 스크립트로 돌림</li>
<li><b>해결</b>: 재시도(지수 백오프) + 체크포인팅(N건마다 진행 상태 디스크에 저장). 죽어도 마지막 체크포인트부터 재개 가능.</li>
<li><b>메모</b>: 알고 있던 패턴인데 개인 프로젝트라 생략하고 싶은 유혹. 양이 많아질수록 대가가 커짐.</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">pgvector &amp; PostgreSQL</h2>
<h3 data-ke-size="size23">pgvector 옵티마이저가 HNSW 인덱스를 안 쓰는 것처럼 보임</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: HNSW 인덱스 만들었는데 EXPLAIN에서 다른 인덱스(B-tree 등)만 사용</li>
<li><b>원인</b>: 필터 selectivity에 따라 옵티마이저가 두 path 중 합리적 선택. 빡빡한 필터(전체의 1~2%)면 Path B(B-tree로 좁힘 &rarr; 무차별 정렬), 느슨한 필터(30%+)나 필터 없음이면 Path A(HNSW). 버그가 아니라 정상.</li>
<li><b>해결</b>: 정상임을 인지. 의심되면 EXPLAIN으로 path와 추정 cost 확인. 필터 분포가 바뀌면 path도 자동으로 바뀜.</li>
<li><b>메모</b>: pg_trgm + GIN 다뤄본 직관이 그대로 적용됨. 옵티마이저는 통계와 selectivity로 판단한다.</li>
</ul>
<h3 data-ke-size="size23"><code>ef_search</code>만 올린다고 옵티마이저가 HNSW를 쓰는 게 아님</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: SET LOCAL hnsw.ef_search = 100을 추가했더니 HNSW path가 선택돼서, ef_search가 path 결정에 영향을 줬다고 오해</li>
<li><b>원인</b>: ef_search는 path 선택이 아니라 "선택된 HNSW path의 후보 풀 크기"를 조절. path 결정의 진짜 변수는 필터 selectivity.</li>
<li><b>해결</b>: path 변경의 진짜 원인은 쿼리 자체(필터 조건)가 바뀌었을 가능성. ef_search는 HNSW path가 선택된 상황에서 LIMIT 못 채우는 사태 방지용으로 80~100 권장.</li>
<li><b>메모</b>: 결과만 보면 인과를 거꾸로 판단하기 쉬움. 변수 한 번에 하나씩 바꿔야 진짜 원인이 보임.</li>
</ul>
<h3 data-ke-size="size23">HNSW 인덱스는 RAM 상주가 전제 &mdash; swap되면 ms&rarr;초</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: 평소 100ms 미만이던 벡터 쿼리가 갑자기 수 초로 튐</li>
<li><b>원인</b>: HNSW 인덱스가 메모리에서 밀려 디스크에서 읽힘. 그래프 탐색이라 페이지 점프가 많아 swap 페널티가 일반 인덱스보다 큼.</li>
<li><b>해결</b>: 인덱스 크기 + shared_buffers를 미리 산정. 100만 행 &times; 1536차원, m=16 기준 약 6~8GB. 다른 워크로드와 메모리 경쟁하지 않게 모니터링.</li>
<li><b>메모</b>: 콜드/웜 차이도 같은 맥락(이번 프로젝트 1243ms vs 184ms). 벤치마크는 콜드/웜 분리해서 측정.</li>
</ul>
<h3 data-ke-size="size23">psycopg COPY로 vector 컬럼 적재 시 register_vector() 안 통함</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: register_vector()로 자동 변환 등록했는데도 COPY에서 타입 오류</li>
<li><b>원인</b>: COPY TEXT 포맷은 행 단위 텍스트 스트림. 파라미터 바인딩 경로가 아니라 register_vector() 어댑터가 개입할 자리 없음.</li>
<li><b>해결</b>: vector 컬럼 값은 직접 <code>"[" + ",".join(map(str, vec)) + "]"</code> 형태의 텍스트 리터럴로 만들어 copy.write_row에 전달.</li>
<li><b>메모</b>: COPY는 INSERT 100만 건 30분<del>1시간을 5</del>10분으로 줄여주는 핵심 도구. 이 텍스트 변환 패턴 한 번만 외워두면 됨.</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">Prisma</h2>
<h3 data-ke-size="size23">Prisma 7에서 <code>postgresqlExtensions</code>/<code>driverAdapters</code> preview flag 폐기</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: Prisma 6 시절 문서 보고 schema.prisma에 preview flag 적었는데 Prisma 7에서 경고/오류</li>
<li><b>원인</b>: Prisma 7에서 GA 또는 폐기. preview flag가 필요 없거나 작동 안 함.</li>
<li><b>해결</b>: schema.prisma에서 해당 flag 제거. Prisma 7 공식 문서 기준으로 작성.</li>
<li><b>메모</b>: Prisma는 메이저 버전마다 변경 폭이 큼. 검색 결과에 옛날 문서가 섞여 있으니 버전 확인 필수.</li>
</ul>
<h3 data-ke-size="size23">Prisma는 vector 타입과 거리 연산자(<code>&lt;=&gt;</code>)를 지원 안 함 &rarr; raw SQL 필요</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: Prisma Client에서 코사인 거리 정렬 쿼리를 빌더로 표현하려는데 방법이 없음</li>
<li><b>원인</b>: Prisma 스키마는 vector를 정식 타입으로 매핑 안 함(Unsupported로만 받음). 거리 연산자 <code>&lt;=&gt;</code>, <code>&lt;-&gt;</code>, <code>&lt;#&gt;</code>도 ORM 추상화 밖.</li>
<li><b>해결</b>: 하이브리드 패턴 &mdash; 메타 CRUD는 Prisma, 벡터 검색만 pg.Pool로 raw SQL. 같은 DB라 데이터 일관성 OK. 트랜잭션이 두 클라이언트에 걸치는 케이스만 피하면 됨.</li>
<li><b>메모</b>: 부수 이점으로 pgvector 컬럼/인덱스 변경 시 db pull 안 거쳐도 됨. 인덱스 튜닝이 가벼워짐.</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">인프라 &amp; Docker</h2>
<h3 data-ke-size="size23"><code>docker run -it</code>은 stdin 파이프 입력에 안 통함</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: <code>cat data.jsonl | docker run -it ...</code> 같은 파이프 입력이 동작 안 함</li>
<li><b>원인</b>: <code>-t</code>(TTY 할당)가 비대화형 stdin과 충돌. 파이프 입력은 TTY가 아님.</li>
<li><b>해결</b>: 파이프로 입력 줄 땐 <code>-i</code>만 사용. <code>-it</code>는 사람이 키보드로 칠 때만.</li>
<li><b>메모</b>: 평소엔 둘이 묶여 있어서 의식 안 하다가 자동화 스크립트에서 처음 부딪힘.</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">홈서버 운영</h2>
<h3 data-ke-size="size23">Cloudflare Tunnel 앞단에 reverse proxy 불필요</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: 홈서버에 Grafana 노출하려고 nginx + cloudflared 2단으로 구성하다 복잡해짐</li>
<li><b>원인</b>: cloudflared가 TLS 종단 + 라우팅 + 헬스체크를 다 처리. 단일 앱이면 nginx/Caddy는 중복.</li>
<li><b>해결</b>: 단일 앱이면 <code>cloudflared &rarr; localhost:3001</code> 직결. 같은 호스트에서 여러 앱 노출하려면 tunnel config의 ingress 규칙으로 hostname 라우팅 (nginx 없이 cloudflared가 그 역할까지).</li>
<li><b>메모</b>: 익숙한 패턴(nginx 항상 앞단에)을 의심 없이 가져가면 불필요한 복잡도가 쌓임.</li>
</ul>
<h3 data-ke-size="size23">Tailscale 쓰는 머신에서 ufw 룰에 <code>tailscale0</code> 인터페이스 명시 필요</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: ufw default deny 적용 후 Tailscale로도 접근 안 됨</li>
<li><b>원인</b>: ufw는 인터페이스 단위로 동작. Tailscale은 자체 가상 인터페이스(<code>tailscale0</code>)로 동작하는데, ufw 기본 정책이 모든 인터페이스 deny면 Tailscale 트래픽도 차단됨.</li>
<li><b>해결</b>: <code>ufw allow in on tailscale0</code> 추가. 인터페이스 이름이 환경마다 다를 수 있으니 <code>ip a</code>로 먼저 확인.</li>
<li><b>메모</b>: 외부 노출이 cloudflared 한 갈래여도 로컬 포트 무방비면 의미 없음(같은 LAN의 다른 머신에서 직접 접근 가능). ufw default deny + 화이트리스트는 홈서버 기본기.</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">관측성</h2>
<h3 data-ke-size="size23">Grafana rate() 쿼리가 빈 결과 &mdash; push interval과 window 불일치</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: 메트릭 emit은 정상인데 Grafana 패널이 비어 보임. 같은 화면의 Error rate 패널은 0%로 잘 보임.</li>
<li><b>원인</b>: rate()는 윈도우 안에 sample &ge; 2 필요. OTel 기본 export interval 60s + 쿼리 윈도우 [1m]면 sample 1개일 때가 자주 생겨 빈 결과 반환.</li>
<li><b>해결</b>: <code>[$__rate_interval]</code> 사용 (Grafana가 scrape/push 간격 기반 자동 산정, 보통 sample 충분히 잡히는 윈도우로 풀림).</li>
<li><b>메모</b>: "패널이 비어 보인다"는 데이터 부재가 아니라 표현 문제일 때가 많음. 의심 순서: 메트릭 emit 확인 &rarr; instant query 확인 &rarr; window vs interval 검토.</li>
</ul>
<h3 data-ke-size="size23">PromQL "빈 결과"와 "0"은 다르다</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: 트래픽 0일 때 패널이 0 라인이 아니라 그냥 빔</li>
<li><b>원인</b>: rate(...) 결과가 빈 vector면 선이 안 그려짐. 빈 결과 &ne; 0.</li>
<li><b>해결</b>: 라벨 없는 단일 결과는 <code>or vector(0)</code>. 라벨 있는 그룹화는 <code>or label_replace(vector(0), "라벨명", "값", "", "")</code>. (vector(0)은 라벨이 없어서 by절 결과와 형태가 안 맞으므로 label_replace로 인공 라벨 부여)</li>
<li><b>메모</b>: 시각화의 사용자 인식상 "비어 보임"과 "0"은 큰 차이. fallback은 모든 시각화 쿼리의 기본기로.</li>
</ul>
<h3 data-ke-size="size23">저트래픽 환경의 비율 기반 알림은 false positive</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: dev에서 5xx 1건만 떠도 에러율 100%로 발화</li>
<li><b>원인</b>: 비율은 분모가 작을 때 의미 없음. 분당 1요청에서 1요청이 5xx면 비율 100%지만 incident는 아님.</li>
<li><b>해결</b>: 비율 룰에 트래픽 가드 (<code>and sum(rate(...)) &gt; 임계치</code>). 추가로 절대 빈도 룰을 짝으로 (예: 10분에 5xx 3건 이상). 비율과 절대 빈도는 보완재.</li>
<li><b>메모</b>: 비율은 prod 트래픽 충분할 때 정확, 절대 빈도는 저트래픽 dev에서도 의미 있음. 둘 다 두면 환경별로 적절한 신호.</li>
</ul>
<h3 data-ke-size="size23">알림 잡음을 룰 비활성화로 해결하면 안 됨</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: dev에서 시끄러운 룰을 끄고 싶은 유혹</li>
<li><b>원인</b>: 끄면 prod 가서 다시 만들어야 함. 룰의 의도가 history에서 사라짐.</li>
<li><b>해결</b>: severity 라벨 + 라우팅 정책으로 채널 분리. 룰은 살리고 라우팅만 환경별로 (dev에선 #personas-info 같은 quiet 채널, prod에선 #alerts-warning).</li>
<li><b>메모</b>: 환경별로 다른 게 "발화 여부"인지 "수신 채널"인지 먼저 물어볼 것. 발화 여부가 다르면 룰 조건에 환경 라벨, 수신 채널이 다르면 라우팅.</li>
</ul>
<h3 data-ke-size="size23"><code>personas_no_traffic</code> 같은 dev-noisy 룰 &mdash; <code>noDataState: Alerting &rarr; NoData</code></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>증상</b>: dev/idle 환경에서 "10분간 요청 없음" 알림이 자주 fire/resolved 반복</li>
<li><b>원인</b>: noDataState: Alerting은 데이터 없으면 발화. dev에서 트래픽 없는 게 일상이라 의미 없는 발화 다발.</li>
<li><b>해결</b>: <code>noDataState: NoData</code>로 변경(데이터 없으면 발화 안 함). for: 10m &rarr; 30m으로 늘려 일시적 idle 무시. 라우팅은 별도로 quiet 채널로.</li>
<li><b>메모</b>: noData 처리 정책 + for 시간 + 라우팅 &mdash; 세 층이 다 같이 작동해야 잡음이 가라앉음.</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><a href="https://ifelseif.tistory.com/343" target="_blank" rel="noopener">overview보기</a></p>