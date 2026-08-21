<h1>embedding 컬럼을 만들어두고 17일을 비워뒀다</h1>
<p data-ke-size="size16">Claude와 ChatGPT등 LLM들이 공유하는 개인 메모리 레이어를 만들었다.<br />Next.js 라우트 하나, Postgres 테이블 하나,</p>
<p data-ke-size="size16">툴 네 개(<code>remember</code> / <code>recall</code> / <code>list_memories</code> / <code>forget</code>)가 전부인 장난감 같은 도구다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">기록해두고 싶은 건 완성된 구조가 아니라 <b>거기까지 간 순서</b>다.<br />커밋 로그에는 무엇을 했는지만 남고, 무엇을 하지 않기로 했는지는 남지 않는다.<br />이 프로젝트에서 값이 나온 부분은 대부분 후자였다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">1. 사지 않기로 한 것부터</h2>
<p data-ke-size="size16">시작할 때 머릿속에 있던 선택지는 이랬다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>LangGraph로 제대로 된 RAG 파이프라인을 짠다</li>
<li>최근 화제가 된 메모리 특화 오픈소스(mem-palace 류)를 붙인다</li>
<li>직접 최소한으로 만든다</li>
</ul>
<p data-ke-size="size16">앞의 둘은 매력적이었다.<br />검증된 구조가 있고, 문서가 있고, 남들이 이미 밟은 지뢰가 지워져 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그런데 개인 메모리라는 문제에 대해 내가 아는 게 하나도 없었다.<br />하루에 몇 개나 쌓일지, 검색이 실제로 뭘 못 찾을지, 한국어가 어디서 깨질지...</p>
<p data-ke-size="size16">전부 추측이었다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>모르는 문제에 프레임워크를 얹으면, 프레임워크가 문제 정의를 대신해버린다.</b><br />그래서 오버헤드가 가장 적고 가장 빨리 붙일 수 있는 쪽으로 갔다.</p>
<p data-ke-size="size16"><br />효과가 없으면 버리기도 쉬운 쪽으로.</p>
<p data-ke-size="size16">결과적으로 이 선택의 대가는 명확했다.<br />남이 해결해둔 걸 다시 만나야 한다. 대신 얻은 것도 명확했다.<br /><b>이 레포의 모든 설계 결정에는 직접 데이터로 잰 숫자가 붙어 있다.</b></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">2. 옵션은 준비 and 대기</h2>
<p data-ke-size="size16">최초 커밋(2026-08-02)의 스키마다.</p>
<pre class="pgsql"><code>export const memories = memorySchema.table("memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  // 나중에 시맨틱 검색용 (pgvector). 지금은 채우지 않음.
  // text-embedding-3-small 기준 1536차원.
  embedding: vector("embedding", { dimensions: 1536 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">컬럼만 준비해뒀다. 임베딩 호출도, 벡터 검색도, API 키도 없었다.</p>
<p data-ke-size="size16">이건 미완성이 아니라 의도였다.</p>
<p data-ke-size="size16"><br />나중에 벡터를 붙일 때 제일 귀찮은 건 코드가 아니라 <b>이미 쌓인 데이터에 컬럼을 추가하는 일</b>이다.<br />컬럼 하나를 미리 선언해두는 비용은 0에 가깝고, 나중에 마이그레이션과 백필을 동시에 해야 하는 상황을 미리 없앤다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">덧붙이면 주석의 <code>text-embedding-3-small</code>은 결국 쓰지 않았다. 실제로는 Gemini로 갔다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그런데 <b>1536차원이라는 숫자는 살아남았다.</b><br />컬럼을 예약할 때 중요했던 건 어느 모델이냐가 아니라 차원 수 하나였다는 뜻이다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">3. 13일의 공백이 곧 설계</h2>
<p data-ke-size="size16">커밋 로그를 시간순으로 보면 눈에 띄는 구멍이 있다.</p>
<pre class="angelscript"><code>08-02  기본 스캐폴딩
08-02  인증(withMcpAuth) 도입
08-02  새 기기 연결용 문서
08-06  Railway &rarr; Supabase 전환
       &larr; 여기서 13일
08-19  recall 한국어 바이그램 검색 + 관련도 랭킹
08-19  recall 하이브리드 검색 (임베딩 + RRF) + 백필</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">13일 동안 커밋이 없다. 손을 놓은 게 아니라 <b>그냥 썼다.</b></p>
<p data-ke-size="size16">이 기간에 알게 된 것들은 앉아서는 절대 안 나왔을 것들이다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>메모리는 생각보다 훨씬 천천히 쌓였다. 3주 뒤에도 62행이었다. "수만 건에서도 빠른 검색"은 존재하지 않는 문제였다.</li>
<li>검색이 실패하는 방식은 예상과 달랐다. 오타나 동의어가 아니라 <b>어휘 교집합이 아예 0인 경우</b>가 문제였다.</li>
<li>한국어에서 Postgres 기본 전문검색이 사실상 작동하지 않는다는 게 실사용으로 드러났다.</li>
</ul>
<p data-ke-size="size16">세 번째는 특히 중요했다.<br />만약 처음부터 벡터 검색을 붙였다면 이 문제를 <b>영영 몰랐을 것이다.</b><br />벡터가 한국어 문제를 덮어버리기 때문이다.<br />덮인 문제는 나중에 다른 얼굴로 돌아온다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">4. 한국어가 문제</h2>
<p data-ke-size="size16">그래서 벡터보다 키워드를 먼저 고쳤다.</p>
<p data-ke-size="size16">한글은 형태소 분석기 없이는 토큰화가 안 된다.</p>
<p data-ke-size="size16"><br />서버리스 환경에 형태소 분석기를 얹는 건 이 프로젝트 규모에 맞지 않았다.<br />선택한 건 <b>문자 바이그램</b>이다. "메모리서버"를 <code>메모</code>, <code>모리</code>, <code>리서</code>, <code>서버</code>로 쪼개 tsvector로 만든다.</p>
<p data-ke-size="size16"><br />정확도는 형태소 분석기에 못 미치지만 SQL 함수 몇 개로 끝나고 의존성이 0이다.</p>
<p data-ke-size="size16">그 다음에 계획을 바꾼 측정이 하나 나왔다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">토크나이저를 쿼리 시점에 돌리면 비용이 <b>행 수에 완전히 선형</b>이었다.</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>행 수</th>
<th><code>ko_tsv_doc</code> 온더플라이</th>
</tr>
</thead>
<tbody>
<tr>
<td>62</td>
<td>48ms</td>
</tr>
<tr>
<td>992</td>
<td>759ms</td>
</tr>
<tr>
<td>7,936</td>
<td>6,437ms</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">행당 약 0.78ms.<br />연 1,000행이면 1년 뒤에 <code>recall</code>이 780ms가 된다.</p>
<p data-ke-size="size16"><br />그런데 <code>recall</code>은 <b>세션 시작 임계 경로</b>.. 즉 대화를 시작할 때마다 호출된다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">생성 컬럼(generated always as ... stored) + GIN 인덱스로 바꾸자 62행 기준 53.7ms &rarr; <b>0.17ms</b>가 됐다.<br />(이건 일하면서 바이그램+GIN 붙여본게 특히 도움이 되었다.)</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">원래 이건 "나중에" 항목이었다.<br />측정이 그걸 <b>지금</b>으로 끌어올렸다.<br />계획을 바꾼 건 취향이 아니라 기울기였다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">5. 그제서야 벡터</h2>
<p data-ke-size="size16">키워드가 자리를 잡은 다음에야 임베딩을 붙였다.<br />그리고 처음으로 "임베딩이 정확히 무엇을 사는가"를 숫자로 물어볼 수 있게 됐다.<br />실제 62행 + 한국어 패러프레이즈 16문항 평가셋으로 세 방식을 비교했다.</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>방식</th>
<th>R@1</th>
<th>R@5</th>
<th>R@10</th>
<th>R@20</th>
</tr>
</thead>
<tbody>
<tr>
<td>키워드만 (바이그램 <code>ts_rank</code>)</td>
<td>7/16</td>
<td>10/16</td>
<td>10/16</td>
<td>10/16</td>
</tr>
<tr>
<td>벡터만 (1536차원)</td>
<td>13/16</td>
<td>15/16</td>
<td>15/16</td>
<td>16/16</td>
</tr>
<tr>
<td><b>RRF 하이브리드 (벡터:키워드 = 2:1)</b></td>
<td>11/16</td>
<td><b>16/16</b></td>
<td><b>16/16</b></td>
<td>16/16</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">여기서 두 가지가 확정됐다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>첫째, 키워드는 깊이 20에서도 10/16에서 포화한다.</b><br />6건은 질의와 문서 사이에 겹치는 낱말이 하나도 없다.<br />어떤 키워드 기법으로도, 어떤 깊이로도 도달할 수 없다.<br />임베딩을 통해 해결해야 하는 부분이 정확히 이 6건이었다.<br />막연한 "의미 검색이 더 좋다"가 아니라 <b>구체적으로 몇 건</b>인지 확인하고 접근할 수 있었다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>둘째, 최적화 대상은 R@1이 아니었다.</b><br />하이브리드는 R@1에서 벡터 단독보다 오히려 낮다(11 vs 13).<br />보통이면 여기서 하이브리드를 버린다.</p>
<p data-ke-size="size16"><br />그런데 <code>recall</code>은 기본 10건을 모델에게 넘기고 <b>모델이 그걸 전부 읽는다.</b><br />1위인지 3위인지는 아무 의미가 없고, 반환 집합 안에 있느냐만 의미가 있다.<br />그 깊이에서 하이브리드는 만점이다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">지표를 관행대로 골랐으면 틀린 결정을 했을 것이다.<br />무엇을 최적화할지는 벤치마크가 아니라 <b>소비자가 정한다.</b><br />여기서 소비자는 사람이 아니라 LLM이었다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">한 가지 더.<br /><code>remember</code>는 임베딩에 실패해도 성공한다.<br />실패하면 <code>embedding</code>을 <code>NULL</code>로 저장하고 그대로 넘어간다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그리고 <b><code>embedding IS NULL</code>이 곧 백필 큐다!!</b><br />별도 큐 테이블도, 재시도 상태 머신도 없다.<br />크론이 15분마다 NULL을 주워 채우면 되는거다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이건 불변 법칙 하나에서 나왔다.<br /><b>"사용자가 기억해라고 한 것을 잃지 않는다."</b><br />임베딩 없는 메모리는 검색이 조금 나쁠 뿐이지만, 저장되지 않은 메모리는 존재하지 않는다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">6. 되돌아보면, 적은 에러 보단 침묵</h2>
<p data-ke-size="size16">이 프로젝트에서 시간을 가장 많이 쓴 문제들에는 공통점이 있다.<br /><b>에러도 없을때...</b></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>벡터를 1536으로 잘라내면 단위 노름이 깨진다.</b><br />네이티브 3072차원의 L2 노름은 1.000000인데, 1536으로 자르면 0.687247이 된다.<br />이 상태에서 내적(<code>&lt;#&gt;</code>) 연산자를 쓰면 크기가 큰 벡터가 부당하게 이긴다.<br />에러도 경고도 없이 순위만 조용히 틀린다.<br />&rarr; 코사인만 쓰고, 저장&middot;질의 양쪽에서 수동 L2 정규화.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>임베딩 API는 입력이 창을 넘으면 조용히 자른다.</b><br />한국어 4,000자 뒤에 완전히 다른 주제 4,000자를 붙여도 코사인이 1.000000이었다!<br />200,000자를 보내도 응답은 200이다.<br />잘렸다는 신호가 어디에도 없다.<br />&rarr; 우리가 먼저 자르고 로그를 남긴다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>tsvector에는 1MB 상한이 있다.</b><br />한글 바이그램은 문자당 약 14바이트로 선형 증가한다(500자 &rarr; 6,994B, 8,000자 &rarr; 111,994B).<br />약 75,000자에서 INSERT 자체가 실패한다.<br />더 길면 임시 파일로 디스크를 고갈시킨다 ㅠㅠ</p>
<p data-ke-size="size16"><br />400,000자로 실제로 겪었고, 그동안 같은 인스턴스의 모든 관련 쿼리가 같이 죽었다.<br />&rarr; DB 에러가 되기 전에 입력 검증이 막는다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>서버리스 함수 리전이 DB 리전과 다르면 사소한 쿼리도 태평양을 건넌다.</b><br />LIMIT 5짜리 SELECT 하나가 0.36초였다.<br />리전을 맞추자 0.012초. <code>recall</code> 전체가 1.13초 &rarr; 0.5초가 됐다.<br />이건 정말 Vercel 배포시 자주 까먹는다...</p>
<p data-ke-size="size16"><br />게다가 응답 헤더의 첫 필드는 요청을 받은 엣지 위치라서, 서울에서 테스트하면 제대로 된 것처럼 보인다.</p>
<p data-ke-size="size16"><b>그리고 오늘, Postgres 연산자 우선순위.</b> 코사인 유사도를 <code>1 - (거리)</code>로 계산하는데 괄호를 빼먹었다.</p>
<pre class="angelscript"><code>-- 의도: (1 - (embedding &lt;=&gt; $1))
-- 실제: (1 - embedding) &lt;=&gt; $1     &larr; integer - vector 연산자가 없어 실패</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>+</code>/<code>-</code>는 <code>&lt;=&gt;</code> 같은 사용자 정의 연산자보다 <b>강하게</b> 묶인다.<br />고약한 건 같은 표현식의 WHERE 쪽 <code>embedding &lt;=&gt; $1 &lt;= $2</code>는 반대로 <code>&lt;=&gt;</code>가</p>
<p data-ke-size="size16">비교 연산자보다 강해서, <b>괄호 없이도 맞다</b>는 점이다.</p>
<p data-ke-size="size16">한쪽만 필요하니 눈으로는 안 보인다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그리고 이 에러를 내가 넣은 <code>try/catch</code>가 삼켰다.</p>
<p data-ke-size="size16">응답에는 "저장됨"만 나왔다ㅜㅜ<br />타입 체크도 통과하고, 생성된 SQL을 눈으로 봐도 그럴듯했다.<br />컨테이너에 진짜 Postgres와 pgvector를 띄워 <b>실행해보고서야</b> 드러났다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">여기서 두 가지를 고쳤다.<br />괄호를 넣었고, 조회 실패 시 응답에 <code>- 중복 검사 실패(저장에는 영향 없음)</code>를 붙이게 했다.<br /><b></b></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>부가 기능의 실패를 조용히 삼키면, 개발 중의 버그가 정상 응답으로 위장한다.</b></p>
<p data-ke-size="size16">돌아보면 이 목록이야말로 프레임워크를 안 쓴 대가다.<br />동시에 프레임워크를 썼다면 몰랐을 것들이기도 하다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">7. 3주 뒤의 정비</h2>
<p data-ke-size="size16">기능이 자리를 잡고 나서 밀린 것들을 정리했다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>툴 등록 방식이 deprecated 되어 있었다.</b></p>
<p data-ke-size="size16"><code>server.tool(...)</code> 오버로드 전부에 <code>@deprecated</code>가 붙어</p>
<p data-ke-size="size16"><code>registerTool(name, config, cb)</code>로 옮겼다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">옮기는 김에 <code>annotations</code>도 명시했는데, 이게 생각보다 중요했다.<br />MCP 스펙의 기본값이 <code>destructiveHint: true</code>, <code>openWorldHint: true</code>다.<br /><b>아무것도 안 쓰면 <code>recall</code> 같은 읽기 전용 툴까지 "파괴적이고 외부 세계에 나간다"로 광고된다.</b></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>어댑터 메이저 버전을 올렸더니 우회 코드 두 개가 통째로 사라졌다.</b><br />이게 제일 기분 좋은 부분이었다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">하나는 경로 정규화였다.<br />예전 어댑터는 요청 URL의 pathname을 자기 엔드포인트와 완전 일치로 대조했다.<br />웹 커넥터용으로 <code>/t/&lt;TOKEN&gt;/mcp</code> 경로를 rewrite로 받는데,</p>
<p data-ke-size="size16">프레임워크의 rewrite는 라우팅만 바꾸고 <code>req.url</code>은 원본으로 남긴다.</p>
<p data-ke-size="size16">그래서 핸들러에 넘기기 직전에 URL을 갈아끼우는 가짜 Request를 만들고 있었다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">다른 하나는 본문 파싱 가드였다.<br />어댑터가 <code>req.json()</code>을 try 블록 <b>밖에서</b> 부르는 바람에,</p>
<p data-ke-size="size16">깨진 본문이 오면 예외가 그대로 빠져나가 응답 없이 함수 실행 시간을 다 잡아먹었다.</p>
<p data-ke-size="size16">그래서 앞에서 미리 파싱해 끊고 있었다.</p>
<p data-ke-size="size16">새 버전은 "받은 요청은 전부 MCP로 처리하고 라우팅은 호스트 프레임워크 몫"으로 바뀌었고,</p>
<p data-ke-size="size16">본문 파싱도 SDK 안으로 들어갔다.</p>
<p data-ke-size="size16">두 우회 모두 존재 이유가 사라졌다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>우회 코드에 "왜 이게 있는지"를 적어두는 게 여기서 값을 했다.</b><br />두 함수 모두 위에 문단짜리 주석이 붙어 있었고, 그 문단이 사라진 전제를 그대로 서술하고 있었다.<br />주석이 없었다면 지워도 되는지 판단하는 데 훨씬 오래 걸렸을 것이다.<br />지울 근거를 미리 적어둔 셈이다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">대신 새로 생긴 부분도 있었다.<br />라우팅이 프레임워크 책임이 되면서, 동적 세그먼트가 아무 경로나 매칭되게 됐다.<br />명시적으로 404 가드를 넣었다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">8. 서버는 에이전트가 아니다</h2>
<p data-ke-size="size16">가장 최근 기능은 <code>remember</code>가 근접 중복을 알려주는 것이다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">문제는 명확했다.<br />비슷한 메모리가 계속 쌓이는데 아무도 정리하지 않는다.<br />갱신된 사실을 저장하면 옛 사실이 그대로 남아서 나중에 둘 다 검색된다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">떠오르는 해법은 서버가 판단하는 것이다.<br />저장 전에 유사한 메모리를 찾고, LLM에게 신규/병합/대체를 물어보고, 그에 맞게 쓴다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">여기서부터 진짜 분기와 루프가 생긴다.<br />프레임워크가 필요해지는 지점이다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">하지 않았다.<br />대신 <b>판단을 반대편으로 넘겼다.</b><br />왜냐? 이제 클로드, GPT 선생님들은 그냥 너무 훌륭하다.</p>
<pre class="angelscript"><code>저장됨 (id: 265c0659-&hellip;)
<p>유사한 기존 메모리 1건 (코사인 0.92 이상):</p>
<ul>
<li>0.998 (2026-08-21) [temp] 프로젝트 zeta-quokka-7의 빌드 캐시는 매주 수요일 새벽 3시에 비운다.
id: 78583c17-…</li>
</ul>
<p>같은 사실이면 오래된 쪽을 forget으로 정리하고, 내용이 갱신된 것이면 이전
메모리를 지워 방금 저장한 것만 남길 것. 별개의 사실이면 그대로 두면 된다.</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">서버가 하는 일은 SELECT 한 번이 전부다.<br /><code>remember</code>는 이미 저장용 문서 임베딩을 계산해뒀으므로 그걸 재사용한다.</p>
<p data-ke-size="size16"><br /><b>임베딩 API 호출은 0회 늘었다.</b></p>
<p data-ke-size="size16">핵심은, <b>이 서버는 에이전트가 아니라 도구 공급자다.</b></p>
<p data-ke-size="size16"><br />에이전트는 MCP 경계 반대편에 이미 있고, 문맥을 훨씬 많이 안다.<br />서버 안에 판단을 넣는 건 더 나은 판단자를 놔두고 더 나쁜 판단자를 새로 만드는 일이다.<br />게다가 그 순간 서버에 LLM 의존성, 프롬프트 관리, 토큰 비용이 생긴다.</p>
<h3 data-ke-size="size23">임계값은 감으로 정할 수 없었다</h3>
<p data-ke-size="size16">코사인 임계값을 얼마로 둘 것인가. 흔히 0.8을 쓴다. 여기선 못 쓴다..<br />이미 측정해둔 게 있었기 때문이다.</p>
<p data-ke-size="size16"><br /><b>주제가 아예 다른 한국어 텍스트끼리도 코사인이 0.765</b>가 나온다.<br />0.8이면 모든 저장이 "유사"로 잡힌다.</p>
<p data-ke-size="size16">배포 후 실제 값으로 세 점을 찍었다.</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>관계</th>
<th>코사인</th>
</tr>
</thead>
<tbody>
<tr>
<td>무관</td>
<td>0.765</td>
</tr>
<tr>
<td>같은 뜻, 다른 표현</td>
<td>0.932 ~ 0.934</td>
</tr>
<tr>
<td>거의 동일 (<code>새벽 3시</code> &harr; <code>새벽 세 시</code>)</td>
<td>0.998</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">현재 임계값은 0.92다.<br />패러프레이즈를 잡긴 하는데 여유가 0.012밖에 없다.<br />반면 무관한 것과는 간격이 아주 넓다.</p>
<p data-ke-size="size16"><br />즉 <b>오탐 위험 없이 내릴 여지가 크다.</b></p>
<p data-ke-size="size16">그래서 지금은 확정하지 않았다.<br />대신 응답에 점수를 함께 싣기로 했다!!</p>
<p data-ke-size="size16"><br /><b>조정 근거가 응답 자체에 쌓이게 하는 것</b>이다.<br />며칠 쓰고 실제 분포를 보고 정하면 된다.<br />이 프로젝트에서 반복된 패턴이 여기서도 같다.<br />모르면 재고, 잴 수 없으면 재는 도구부터 만든다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">9. 그래서 지금은 LangGraph인가</h2>
<p data-ke-size="size16">기능이 붙고 나서 처음의 질문을 다시 던져봤다.<br />답은 여전히 "아니다"인데, <b>이유가 달라졌다</b>는 게 흥미롭다.</p>
<p data-ke-size="size16">처음엔 *"문제를 몰라서"* 안 썼다. 지금은 *"문제를 알아서"* 안 쓴다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이 서버의 툴은 전부 <b>요청 하나 = 판단 없는 왕복 하나</b>다. 그래프로 그릴 상태 기계가 없다.</li>
<li>LangGraph의 값어치는 대부분 durable execution &mdash; 크래시 후 재개, 중간 개입, 타임트래블 &mdash; 에서 나온다. 전부 <i>요청 하나보다 오래 사는 프로세스</i>를 전제한다. 서버리스 함수가 정확히 그 반대다. <b>비용은 다 치르고 값은 거의 못 받는 배치</b>가 된다.</li>
<li><code>recall</code>은 세션 시작 임계 경로다. 1.13초를 0.5초로 줄이려고 리전까지 옮겼다. 에이전틱 리트리벌은 LLM 왕복이 최소 2~3회고, 그 최적화를 스스로 되돌린다.</li>
<li>임베딩 클라이언트를 만들 때 이미 "AI SDK를 쓰지 않는다, 필요한 게 임베딩 두 종류뿐인데 번들만 커진다"고 결정했다. 같은 논리를 적용하면 결론도 같다.</li>
</ul>
<p data-ke-size="size16">다시 볼 신호도 정해뒀다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">배경 통합 작업이 부분 실패에서 재개돼야 할 때,<br />손으로 관리하는 분기가 버거워질 때,<br />사람 승인을 중간에 끼워야 할 때.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">둘 이상이 동시에 오면 그때가 적기다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>그때도 시작은 평범한 코드 몇 줄 부터!</b><br />지금 떠오르는 파이프라인은 조건 분기 두 개에 LLM 호출 한 번, 60줄이면 된다.<br />그 60줄이 재시도와 부분 실패 때문에 300줄로 부푸는 게 눈에 보일 때가 프레임워크를 고민할 때다.<br />그 전에 부르면 프레임워크와 싸우게 된다ㅜㅜ</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">10. 남는 것</h2>
<p data-ke-size="size16">세 문장으로 줄이면 이렇다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>모르는 문제에는 프레임워크를 얹지 않는다.</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>프레임워크는 문제 정의를 대신해버리고, 그 정의가 내 문제와 맞는지 확인할 방법이 없어진다.</li>
</ul>
</li>
<li><b>옵션을 사두는 것과 행사하는 것은 다르다.</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>컬럼 하나를 미리 선언하는 데 든 비용은 0이었고, 17일 뒤에 마이그레이션과 백필을 동시에 해야 하는 상황을 없앴다.</li>
</ul>
</li>
<li><b>측정할 수 없으면 만들지 않는다.</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이 레포의 모든 상수(벡터 가중 2, <code>RRF_K = 60</code>, <code>content</code> 8,000자, 임계값 0.92) 옆에는 그 값이 나온 측정이 주석으로 붙어 있다. 값보다 그 주석이 오래 간다. 값을 바꿔야 할 때 다시 재야 할 게 뭔지 알려주기 때문이다.</li>
</ul>
</li>
</ol>
<p data-ke-size="size16">그리고 하나 더.<br />이 프로젝트에서 계속 만난 적은 에러가 아니라 <b>침묵</b>이었다. 역시 에러는 좋은것이다..<br />깨진 노름, 잘린 입력, 삼켜진 예외, 엉뚱한 리전... 전부 정상처럼 보였다.<br />실행해보지 않고 통과시킨 것은 대체로 통과한 게 아니었다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">부록 A. 결정 기록</h2>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>#</th>
<th>결정</th>
<th>시점</th>
<th>검토한 대안</th>
<th>근거</th>
<th>상태</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>프레임워크 없이 직접 만든다</td>
<td>08-02</td>
<td>LangGraph RAG, 메모리 특화 OSS</td>
<td>문제를 모르는 상태에서 프레임워크가 문제 정의를 선점한다</td>
<td>유효</td>
</tr>
<tr>
<td>2</td>
<td><code>embedding</code> 컬럼만 선언하고 비워둔다</td>
<td>08-02</td>
<td>나중에 컬럼 추가 / 처음부터 벡터</td>
<td>예약 비용 0, 나중의 마이그레이션+백필 동시 진행 회피</td>
<td>08-19 행사</td>
</tr>
<tr>
<td>3</td>
<td>Bearer 토큰 단일 인증 + URL 토큰 심</td>
<td>08-02</td>
<td>OAuth</td>
<td>개인용. 웹 커넥터가 커스텀 헤더를 못 넣어 <code>/t/&lt;TOKEN&gt;/mcp</code> 경로 필요</td>
<td>유효</td>
</tr>
<tr>
<td>4</td>
<td>Railway &rarr; Supabase</td>
<td>08-06</td>
<td>Railway 유지</td>
<td>pgvector + 무료 티어</td>
<td>유효</td>
</tr>
<tr>
<td>5</td>
<td>13일간 기능 추가 없이 사용</td>
<td>08-06~19</td>
<td>바로 검색 고도화</td>
<td>실패 방식을 추측이 아니라 관측으로 확보</td>
<td>완료</td>
</tr>
<tr>
<td>6</td>
<td>형태소 분석기 대신 문자 바이그램</td>
<td>08-19</td>
<td>형태소 분석기, 벡터로 대체</td>
<td>서버리스에 의존성 0. 벡터를 먼저 붙이면 한국어 문제가 덮인다</td>
<td>유효</td>
</tr>
<tr>
<td>7</td>
<td>생성 컬럼 + GIN을 Phase 1로 당김</td>
<td>08-19</td>
<td>Phase 2로 미룸</td>
<td>온더플라이가 행당 0.78ms 선형. 1년 뒤 <code>recall</code> 780ms</td>
<td>유효</td>
</tr>
<tr>
<td>8</td>
<td><code>innerProduct</code> 금지, 코사인 + 수동 L2</td>
<td>08-19</td>
<td>내적</td>
<td>1536 절단 시 노름 0.687. 순위가 경고 없이 틀림</td>
<td>유효</td>
</tr>
<tr>
<td>9</td>
<td>RRF 하이브리드, 벡터:키워드 = 2:1</td>
<td>08-19</td>
<td>벡터 단독, 키워드 단독</td>
<td>R@1이 아니라 R@5~10이 최적화 대상(모델이 10건 전부 읽음). 그 깊이에서 16/16</td>
<td>유효</td>
</tr>
<tr>
<td>10</td>
<td>문서측 임베딩 입력은 <code>content</code>만</td>
<td>08-19</td>
<td><code>content</code> + <code>tags</code></td>
<td>R@1&middot;R@5 동일. 태그는 키워드 leg가 담당. 태그 수정 시 재임베딩 불필요</td>
<td>유효</td>
</tr>
<tr>
<td>11</td>
<td>벡터 인덱스 없음 (exact scan)</td>
<td>08-19</td>
<td>HNSW</td>
<td>5,000행에서도 한 자리 ms. exact의 recall은 100%</td>
<td>재검토 대상</td>
</tr>
<tr>
<td>12</td>
<td>임베딩 실패 시 <code>NULL</code> 저장, <code>remember</code>는 성공</td>
<td>08-19</td>
<td>실패 반환, 재시도 큐</td>
<td>"기억해라고 한 것을 잃지 않는다"가 최우선. <code>NULL</code>이 곧 큐</td>
<td>유효</td>
</tr>
<tr>
<td>13</td>
<td>입력 상한을 zod가 막는다</td>
<td>08-19</td>
<td>절단, DB 에러 노출</td>
<td>tsvector 1MB / temp 디스크 고갈보다 앞에서 끊는다. 절단은 데이터 유실</td>
<td>유효</td>
</tr>
<tr>
<td>14</td>
<td>함수 리전을 DB 리전에 맞춤</td>
<td>08-20</td>
<td>기본값 유지</td>
<td>SELECT 0.36s &rarr; 0.012s, <code>recall</code> 1.13s &rarr; 0.5s</td>
<td>유효</td>
</tr>
<tr>
<td>15</td>
<td><code>registerTool</code> + <code>annotations</code> 명시</td>
<td>08-21</td>
<td>deprecated API 유지</td>
<td>스펙 기본값이 <code>destructiveHint: true</code>, <code>openWorldHint: true</code></td>
<td>유효</td>
</tr>
<tr>
<td>16</td>
<td>어댑터 메이저 업그레이드</td>
<td>08-21</td>
<td>현행 유지</td>
<td>우회 코드 2개(경로 정규화, 파싱 가드) 제거 + 신 스펙 지원</td>
<td>유효</td>
</tr>
<tr>
<td>17</td>
<td>근접 중복은 알려주기만, 판단은 클라이언트</td>
<td>08-21</td>
<td>서버가 병합 판단</td>
<td>서버는 도구 공급자. 문맥은 반대편이 안다. LLM 의존성 회피</td>
<td>유효</td>
</tr>
<tr>
<td>18</td>
<td>임계값 0.92는 잠정, 점수를 응답에 노출</td>
<td>08-21</td>
<td>고정값 확정</td>
<td>무관 0.765 / 패러프레이즈 0.932 / 동일 0.998. 여유 0.012</td>
<td><b>미확정</b></td>
</tr>
<tr>
<td>19</td>
<td>부가 기능 실패를 응답에 드러낸다</td>
<td>08-21</td>
<td>조용히 무시</td>
<td>삼킨 예외가 개발 중 버그를 정상 응답으로 위장</td>
<td>유효</td>
</tr>
<tr>
<td>20</td>
<td>LangGraph 도입 보류</td>
<td>08-21</td>
<td>지금 도입</td>
<td>요청 하나 = 왕복 하나. durable execution이 서버리스와 불일치</td>
<td>조건부 재검토</td>
</tr>
</tbody>
</table>
<h2 data-ke-size="size26">부록 B. 타임라인</h2>
<pre class="angelscript"><code>08-02  스캐폴딩 &middot; 인증 &middot; 기기 연결 문서 (embedding 컬럼 선언, 비움)
08-06  Railway &rarr; Supabase
   ⋮   13일 &mdash; 그냥 사용
08-19  Phase 1: 한국어 바이그램 + 관련도 랭킹 + 생성 컬럼
08-19  Phase 2: 임베딩 + RRF 하이브리드 + 백필 (컬럼을 17일 만에 채움)
08-20  함수 리전 정렬
08-21  registerTool + annotations
08-21  어댑터 2.x 마이그레이션 &middot; serverInfo
08-21  remember 근접 중복 안내</code></pre>
<h2 data-ke-size="size26">부록 C. 재검토 예정</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>#18 임계값</b> &mdash; 며칠간 실사용 점수를 모아 0.88~0.90으로 내릴지 결정</li>
<li><b>#11 벡터 인덱스</b> &mdash; 행 수가 수천 대에 들어서면 재측정</li>
<li><b>#20 LangGraph</b> &mdash; 배경 통합 작업의 재개 요구 / 분기 복잡도 / 사람 승인 중 둘 이상 발생 시</li>
</ul>