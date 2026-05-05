<h1>SQL DB 역사와 한국 웹 개발 궤적</h1>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">Claude와 나눈 대화 정리. SQL 데이터베이스의 역사적 흐름과,<br />그것이 한국 웹 개발 시장의 이야기와 어떻게 맞물리는지를 정리한 문서.</p>
</blockquote>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">1. 시작 &mdash; 관계형 모델의 탄생 (1970년대)</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>1970년</b>, IBM 연구원 <b>Edgar F. Codd</b>가 논문 *"A Relational Model of Data for Large Shared Data Banks"* 발표.</li>
<li>그 전까지 DB는 <b>계층형(IMS)</b> 또는 <b>네트워크형(CODASYL)</b> 구조 &mdash; 데이터 구조와 접근 경로가 단단히 묶여 있어서 스키마 변경 시 애플리케이션도 다 고쳐야 했음.</li>
<li>Codd의 아이디어: <b>데이터를 테이블(관계)로 표현하고, 어떻게(how) 가져올지가 아니라 무엇을(what) 가져올지만 선언하자.</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>&rarr; 선언형 쿼리 언어 = SQL의 철학적 뿌리.</li>
</ul>
</li>
<li>IBM은 <b>System R</b>이라는 프로토타입을 만들고, 거기서 쓴 쿼리 언어가 <b>SEQUEL</b> (나중에 SQL로 개명).</li>
<li>그러나 IBM은 자기네 메인프레임 DB 사업(IMS)을 보호하느라 System R 상용화를 늦춤 &rarr; <b>Oracle이 그 빈틈을 파고듦.</b></li>
</ul>
<h2 data-ke-size="size26">2. Oracle의 부상 (1977~1990년대)</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>1977년</b>, Larry Ellison이 IBM의 System R 논문을 읽고 먼저 상용화하기로 결심.</li>
<li><b>1979년 Oracle V2</b> 출시 &mdash; <b>세계 최초의 상용 SQL 데이터베이스</b>. (IBM DB2보다 4년 빠름)</li>
<li>Oracle 30년 지배의 비결 = 기술 + 타이밍 + 영업력 + <b>친위대(DBA 생태계)</b>.</li>
<li>그 시절 DB는 정말 어려웠음 &mdash; 메모리 부족, 디스크 IO 병목, 트랜잭션 정합성. Oracle DBA는 고연봉 전문직.</li>
</ul>
<h2 data-ke-size="size26">3. 오픈소스 진영 등장 (1990년대 중반)</h2>
<p data-ke-size="size16">비슷한 시기에 철학이 정반대인 두 DB가 등장.</p>
<h3 data-ke-size="size23">MySQL (1995)</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>스웨덴에서 시작. 모토는 <b>"빠르고 단순하게"</b>.</li>
<li>초기에는 트랜잭션도 외래키도 없었음.</li>
<li>웹 시대 게시판/블로그/초기 SaaS에 딱 맞음.</li>
<li><b>LAMP 스택(Linux + Apache + MySQL + PHP)</b>의 M = MySQL &rarr; 2000년대 웹 폭발기에 사실상 표준이 됨.</li>
</ul>
<h3 data-ke-size="size23">PostgreSQL (1996, 뿌리는 1986년 Postgres)</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>UC Berkeley의 <b>Michael Stonebraker</b>가 시작한 학술 프로젝트가 뿌리.</li>
<li>Stonebraker는 그 전에 Ingres라는 또 다른 초기 관계형 DB도 만들었던 인물.</li>
<li>철학: <b>"관계형 모델을 제대로, 확장 가능하게 만들자"</b>.</li>
<li>처음부터 타입 시스템, 트랜잭션, 확장성, 표준 준수를 우선. 느리고 무겁다는 비판을 받으면서도 길게 감.</li>
</ul>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">한국 개발 현장의 디폴트<br />이 시기 한국에서는 압도적으로 MySQL/MariaDB.<br />내가 다뤄본 셋(MariaDB, MySQL, SQLite)이 모두 그 계열인 게 우연이 아니었다.</p>
</blockquote>
<h2 data-ke-size="size26">4. MariaDB의 분기 (2009)</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>2008년</b> Sun이 MySQL 인수 &rarr; <b>2010년</b> Oracle이 Sun 인수 &rarr; MySQL이 Oracle 손에 들어감.</li>
<li>MySQL 창립자 <b>Monty Widenius</b>가 "Oracle이 MySQL을 죽일 거다"라고 판단, <b>2009년 MariaDB로 포크</b>.</li>
<li>이름은 그의 둘째 딸 이름에서 따왔다고 함...;</li>
<li>지금 MariaDB와 MySQL은 사실상 다른 DB로 분기. 문법은 거의 호환되지만 옵티마이저, 스토리지 엔진, 클러스터링이 꽤 다름.</li>
</ul>
<h2 data-ke-size="size26">5. NoSQL의 도전과 회귀 (2009~2015)</h2>
<h3 data-ke-size="size23">도전기</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>2010년 전후로 "관계형 DB는 빅데이터/웹스케일에 안 맞다"는 주장이 폭발.</li>
<li><b>MongoDB, Cassandra, DynamoDB, Redis</b> 등장.</li>
<li>슬로건: "스키마 없이 빠르게, 수평 확장으로".</li>
</ul>
<h3 data-ke-size="size23">회귀의 이유</h3>
<p data-ke-size="size16">5~10년 지나서 분위기가 바뀐 두 가지 이유:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>트랜잭션과 조인이 없다는 게 생각보다 큰 고통.</b> 결국 애플리케이션 코드에서 다시 구현하게 됨.</li>
<li><b>PostgreSQL이 NoSQL의 좋은 점을 흡수.</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>JSON/JSONB 타입 (2012, 2014)</li>
<li>배열 타입</li>
<li>전문 검색</li>
<li>지리 정보(PostGIS)</li>
<li>&rarr; 결과적으로 "그냥 PostgreSQL 쓰면 되네"가 됨.</li>
</ul>
</li>
</ol>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">내 작업과의 연결<br />내가 다루는 <code>pg_trgm</code> GIN 인덱싱이나<br /><code>search_words text[]</code> + GIN <code>array_ops</code> 최적화가 바로 이 흐름의 한가운데.<br />관계형이면서 NoSQL적 유연성을 가진 DB가 PostgreSQL</p>
</blockquote>
<h2 data-ke-size="size26">6. 클라우드와 분리 시대 (2015~현재)</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>AWS RDS, Aurora, Google Cloud SQL, Azure SQL &rarr; DB 운영 자체가 서비스화.</li>
<li><b>스토리지와 컴퓨트의 분리</b>: Aurora, Snowflake, Neon &mdash; DB 엔진은 그대로, 스토리지는 분산 객체 스토리지에. (내가 RDS Proxy 다룰 때 마주친 흐름)</li>
<li><b>OLTP/OLAP 경계 흐림</b>: ClickHouse, DuckDB, MotherDuck. 특히 DuckDB는 "SQLite의 OLAP 버전".</li>
</ul>
<h2 data-ke-size="size26">7. 지금 PostgreSQL의 위상</h2>
<p data-ke-size="size16">지난 5년간 PostgreSQL은 사실상 <b>개발자 디폴트 DB</b>가 됨. 이유:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>표준 SQL을 가장 충실히 따름</li>
<li>확장성(extension 생태계)이 압도적</li>
<li>JSON 같은 유연한 기능도 다 있음</li>
<li>무료</li>
<li>클라우드 어디서든 매니지드 서비스로 사용 가능</li>
<li>pgvector 같은 확장으로 AI 시대 벡터 DB 역할까지 흡수</li>
</ul>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">Oracle &rarr; PostgreSQL 흐름의 진실<br />"Oracle 자리를 PostgreSQL이 차지한다"는 단순화된 주장은 과장이지만, <b>방향성 자체는 업계가 실제로 가고 있는 방향</b>.<br />신규 프로젝트에서 Oracle을 새로 도입하는 경우는 정말 드물고,<br />대부분 PostgreSQL부터 검토하는 게 현실.</p>
</blockquote>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">8. 한국 웹 개발 시장의 특이성</h2>
<h3 data-ke-size="size23">"한국은 거의 계속 Java로 일했어야 했다"</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>전자정부 표준프레임워크</b>가 2009년부터 Java/Spring 기반으로 사실상 강제됨.</li>
<li>정부, 공공기관, 금융, 대기업 SI는 거의 다 이걸 따라야 했음.</li>
<li>한국에서 "안정적인 일자리 = SI = Java"라는 공식이 20년 가까이 유지.</li>
<li>지금도 정부 입찰 공고는 Spring/JSP 기반이 압도적.</li>
</ul>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">다른 나라랑 비교하면 특이함.<br />미국/유럽은 2010년대 들어 Rails, Node.js, Django가 스타트업/중소 시장을 빠르게 잠식했다고 한다.<br />한국은 그 흐름이 훨씬 느림? "Java 아닌 걸로 일하려면 SI 메인 시장을 떠나야 했다"가 한국 개발자들의 분기점이었을까?</p>
</blockquote>
<h3 data-ke-size="size23">"JSP보다 LAMP가 핫했다" (2000년대 중반)</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>JSP는 그때도 "무겁고 설정 복잡하고 배포 귀찮은" 이미지.</li>
<li>PHP는 FTP로 파일만 올리면 바로 돌아갔고, 호스팅 비용도 쌌음.</li>
<li>카페24 같은 한국 호스팅 업체들이 PHP/MySQL을 기본 상품으로 밂.</li>
<li>개인 사이트, 중소기업 홈페이지, 커뮤니티는 거의 다 PHP.</li>
<li><b>그누보드, 제로보드(나중에 XE)</b>가 한국 웹의 진짜 인프라.</li>
</ul>
<h3 data-ke-size="size23">워드프레스의 SI 침투 (2010년대 중반~)</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>2010년대 중반부터 한국 SI 중소 시장에 워드프레스 폭발적 유입.</li>
<li>이유: "홈페이지 + 블로그 + 간단한 관리자" 정도면 처음부터 짜는 것보다 워드프레스 + 플러그인 + 약간의 PHP 커스텀이 훨씬 효율적.</li>
<li>SI 입장에서 마진이 좋음 &mdash; "기획 1주, 개발 2주, 납품" 회전율 가능.</li>
<li>한국 PHP 개발자 상당수가 자연스럽게 워드프레스 커스터마이저가 됨.</li>
</ul>
<h3 data-ke-size="size23">Laravel &mdash; PHP 진영의 "현대화 선택지"</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>한국에서 Laravel은 PHP 개발자들의 <b>"워드프레스나 그누보드는 너무 레거시"라고 느낄 때 넘어가는 곳</b>.</li>
<li>Ruby on Rails 영향 받은 모던 PHP 프레임워크. MVC + ORM(Eloquent) + Blade 템플릿 + 마이그레이션.</li>
<li>SI 중소 시장에서 워드프레스로 안 되는 좀 더 복잡한 프로젝트는 Laravel로 갔음.</li>
<li>&rarr; <b>내가 손댄 Laravel Blade 프로젝트가 바로 그 흔적.</b></li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">9. 얻어 들은 이야기와 궤적</h2>
<h3 data-ke-size="size23">이야기 요약</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>개발 경력 20년+. 2000년대 초반 시작, 주 업무는 <b>SI</b>.</li>
<li>정부/Java를 많이 안 했기 때문에 PHP LAMP를 잡을 수 있었음.</li>
<li>워드프레스 &rarr; Laravel 흐름을 그대로 탐.</li>
<li>지금은 Python(FastAPI), NestJS도 다룸.</li>
</ul>
<h3 data-ke-size="size23">판단력</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>NoSQL 시절에도 유행하는 거 다 해봤지만, <b>"결국 SQL로 돌아갈 것"이라고 봤음.</b></li>
<li>신입~주니어가 새 기술을 "이게 진리다"로 받아들이는 것과 달리, 사이클을 두세 번 돌아보셨으므로 <b>매력과 한계를 같이 봄</b>.</li>
<li>팀 DB를 PostgreSQL로 바꾼 것도 그 판단의 결과. 트렌드 보다는 경험을 바탕으로 선택.</li>
</ul>
<h3 data-ke-size="size23">"Next.js 철학은 이해는 되지만 따라가기 피곤"</h3>
<p data-ke-size="size16"><b>멘탈 모델</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>백엔드는 백엔드, 프론트엔드는 프론트엔드 &mdash; 명확히 분리된 세계.</li>
<li>PHP: 서버에서 HTML 렌더해서 던지면 끝.</li>
<li>Laravel + Vue, FastAPI + React: API 서버와 클라이언트가 깔끔히 분리.</li>
</ul>
<p data-ke-size="size16"><b>Next.js가 깨는 것</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>App Router, Server Components, Server Actions로 가면서 서버/클라이언트 경계를 의도적으로 흐림.</li>
<li><code>"use client"</code>, <code>"use server"</code> 지시어로 같은 컴포넌트 트리 안에서 경계가 왔다갔다.</li>
<li>데이터 페칭이 컴포넌트 안에서 일어나고, 폼 제출이 서버 액션으로 처리.</li>
</ul>
<p data-ke-size="size16"><b>왜 피곤하게 느끼시는가</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>프론트에서 시작한 사람: "오, 백엔드까지 자연스럽게 확장되네" 느낌.</li>
<li>백엔드에서 시작한 사람: <b>"왜 잘 분리돼있던 걸 다시 섞지?"</b> 느낌.</li>
<li>게다가 Next.js는 버전마다 패러다임이 바뀜 (Pages Router &rarr; App Router &rarr; Server Actions &rarr; PPR&hellip;).</li>
<li><b>6개월마다 베스트 프랙티스가 바뀌는</b> 회전 속도가 한 가지 패러다임으로 일관되게 일해오셨던 분께는 피곤할 것 같다</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">10. 내 위치 정리</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>나는 <b>NoSQL로 시작해서 SQL로 돌아온 세대</b>.</li>
<li>1세대 LAMP 개발자: SQL을 당연히 시작. NoSQL은 "추가 옵션".</li>
<li>내 세대: NoSQL을 디폴트로 배웠다가, 업계가 SQL로 회귀하는 흐름에 다시 적응.</li>
<li>&rarr; <b>"NoSQL이 왜 매력적이었는지"와 "왜 한계가 있었는지"를 둘 다 몸으로 아는 세대</b>.</li>
<li>SQL만 써온 사람은 도큐먼트 모델이 어떨 때 적합한지 감이 없고, NoSQL만 한 사람은 정규화의 가치를 모름. 둘 다 겪은 사람이 더 입체적인 판단 가능.</li>
</ul>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">핵심 메시지<br />MongoDB는 잘못된 도구가 아니라, <b>잘못 권유받았던 시기가 있었다</b>가 더 정확한 표현.<br />지금도 이벤트 스토어, 로그, CMS, IoT 데이터 같은 영역에서는 좋은 선택지.</p>
</blockquote>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">관련 노트</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>[[PostgreSQL GIN 인덱싱과 한국어 검색]]</li>
<li>[[search_words text[] + array_ops 성능 최적화]]</li>
<li>[[Prisma 듀얼 스키마 아키텍처 - smc-lens]]</li>
<li>[[NestJS Better Auth 패턴]]</li>
</ul>