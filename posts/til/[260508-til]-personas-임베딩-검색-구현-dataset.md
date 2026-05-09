<h1>HuggingFace 데이터셋 처음 다뤄본 후기</h1>
<h2 data-ke-size="size26">0. 시작 vs 끝 시점의 멘탈 모델</h2>
<h3 data-ke-size="size23">시작 시점의 멘탈 모델</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>데이터셋 = HF에서 다운받는 거.</li>
<li>parquet은 잘 모르겠지만 좋다고 들었다.</li>
<li>100만건이면 어떻게 다뤄야 하지...</li>
<li>끝 시점의 멘탈 모델</li>
<li>데이터 탐색은 "5단계 체크리스트"로 표준화됨</li>
<li>parquet의 컬럼 지향 의미를 어느정도,, 이해</li>
<li>100만건도 두렵지 않아!! 면 좋겠지만 아직 무섭다..</li>
</ul>
<h2 data-ke-size="size26">1. 다운로드: streaming vs full download</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>선택</b>: full download &rarr; 로컬 parquet</li>
<li><b>이유</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>데이터 탐색 단계에서는 같은 데이터를 여러 번 다른 각도로 들여다봐야 함.</li>
<li>streaming은 일회성 순회에 최적화되어 있어서 탐색에 부적합.</li>
</ul>
</li>
<li><b>언제 streaming이 맞나</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>데이터가 디스크에 안 들어갈 때, 또는 한 번 훑고 변환만 해서 다른 곳에 쓸 때 (예: 임베딩 파이프라인의 입력으로 한 번만 흘려보낼 때)</li>
<li><b>이번 케이스 숫자</b>: 100만 행 / 디스크 용량 ~XGB / 다운로드 시간 ~X분</li>
</ul>
</li>
</ul>
<h2 data-ke-size="size26">2. 인증: huggingface-cli login</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>huggingface-cli login -&gt; <code>hf login</code></li>
<li>토큰은 ~/.cache/huggingface/token 에 저장됨</li>
<li>요런게 필요하구나~</li>
</ul>
<h2 data-ke-size="size26">3. 저장 형식: parquet + pandas + pyarrow</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>데이터를 다뤄본 경험이 적어서 "잘 모르겠다, 그냥 좋다 편하다" 정도의 느낌.</li>
<li>**CSV 대비 parquet의 핵심 차이는 "컬럼 지향(columnar)"이라는 점 이었다.</li>
<li>CSV는 행 단위 텍스트라 특정 컬럼만 읽고 싶어도 전체를 파싱해야 하는데, parquet은 컬럼 단위로 저장되어 있어서 필요한 컬럼만 읽을 수 있음. 100만 행에서 한두 컬럼만 보고 싶을 때 속도 차이가 컸다.</li>
<li><b>타입이 보존된다.</b> 최고. CSV는 모든 게 문자열이라 읽을 때마다 dtype 추론을 해야 하는데, parquet은 스키마가 파일에 함께 있음. 카테고리 컬럼이 카테고리로, 정수가 정수로..</li>
<li><b>pandas + pyarrow 조합</b>: pyarrow는 parquet 읽기/쓰기 엔진. pandas 2.0 이후로 <code>dtype_backend="pyarrow"</code> 옵션이 있어서 pandas 작업 자체도 pyarrow 기반으로 할 수 있는데, 이번엔 거기까지는 안 들어갔다.</li>
</ul>
<h2 data-ke-size="size26">4. 100만 행 데이터를 살펴보는 5단계 체크리스트</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Step 1. 형태 파악 (shape)</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code class="language-python">df.shape          # (1000000, N) &mdash; 몇 행 몇 컬럼인지
df.columns        # 컬럼 이름들
df.head(3)        # 첫 3행을 눈으로 보기</code></li>
</ul>
</li>
<li><b>Step 2. 타입과 결측 (dtypes &amp; nulls)</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code class="language-python">df.dtypes         # 각 컬럼의 타입
df.isna().sum()   # 컬럼별 결측치 개수
df.info()         # 위 둘을 한 번에 + 메모리 사용량</code></li>
</ul>
</li>
<li><b>Step 3. 범주형 컬럼 분포</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code class="language-python">df["age_group"].value_counts(normalize=True)  # 비율로 보기
df["occupation"].value_counts().head(20)      # 상위 20개만
df["occupation"].nunique()                    # 고유값 개수</code></li>
<li>편향(bias) 발견의 핵심 단계. 임베딩 검색 결과에 영향 미침. 예: 특정 직업군이 50%를 차지하면 검색 결과도 그쪽으로 쏠릴 수 있음. 근데 데이터 자체가 이미 훌륭해서 뭐...</li>
</ul>
</li>
<li><b>Step 4. 자연어 컬럼의 길이 분포</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code class="language-python">df["persona"].str.len().describe()  # min/25%/50%/75%/max
df["persona"].str.len().hist(bins=50)  # 히스토그램</code></li>
<li>임베딩 모델의 토큰 한도를 넘는 행이 얼마나 있는지, 너무 짧아서 의미 없는 행이 있는지 확인. 임베딩 비용 추정에 요긴했음.</li>
</ul>
</li>
</ul>
<h2 data-ke-size="size26">5. 1만건 샘플 &rarr; 100만건 풀스케일 워크플로우:</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>당연히 이렇게 진행했으나, 그럼에도 데이터를 다루는 전체 워크플로에 대한 이해도가 낮아서 매칭 점수가 낮았는데도 그냥 진행했다.</li>
<li>입력 텍스트 디자인 재설계를 이때 고민해볼 수 있었을 것이다. 100만건 다 돌리고 나서 발견하면 비용 날리는 건데.. 이미 날렸다. 하지만 이번엔 0.5+로 만족.</li>
<li>1만건 단계에서 batch API enqueue 한도를 미리 부딪혀서, 100만건 단계에선 분할 전략을 알고 시작했어...야 했다. 하지만 부딪히면서 배웠다 ㅠㅠ</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><a href="https://ifelseif.tistory.com/343" target="_blank" rel="noopener">overview보기</a></p>