<h2 data-ke-size="size26">PostgREST와 Hasura의 관계</h2>
<p data-ke-size="size16"><b>Hasura는 PostgREST를 사용하지 않습니다.</b><br />Hasura와 PostgREST는 완전히 <b>별개의 프로젝트</b>!</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">차이점 비교</h2>
<h3 data-ke-size="size23">아키텍처</h3>
<pre class="routeros"><code>Supabase:
PostgreSQL &rarr; PostgREST &rarr; REST API &rarr; Supabase JS Client
<p>Hasura:
PostgreSQL → Hasura Engine → GraphQL API → Apollo Client</code></pre></p>
<h3 data-ke-size="size23">기술 스택</h3>
<hr data-ke-style="style1" />
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>&nbsp;</th>
<th>Supabase</th>
<th>Hasura</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>프로토콜</b></td>
<td>REST (PostgREST 사용)</td>
<td>GraphQL (자체 엔진)</td>
</tr>
<tr>
<td><b>쿼리 언어</b></td>
<td>URL + 체이닝</td>
<td>GraphQL</td>
</tr>
<tr>
<td><b>엔진</b></td>
<td>PostgREST (Haskell)</td>
<td>Hasura Engine (Haskell)</td>
</tr>
<tr>
<td><b>철학</b></td>
<td>REST + GraphQL 스타일 쿼리</td>
<td>순수 GraphQL</td>
</tr>
</tbody>
</table>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">참고 블로그 글의 의미</h2>
<p data-ke-size="size16"><a href="https://blog.pages.kr/2883" target="_blank" rel="noopener">PostgREST?</a>&nbsp;&lt;&lt; 해당 블로그는 <b>"PostgREST 단독 사용"</b>에 대한 내용.</p>
<pre class="routeros"><code>옵션 1: PostgREST만 단독 사용
PostgreSQL &rarr; PostgREST &rarr; REST API
<p>옵션 2: Supabase 사용 (PostgREST 포함)
PostgreSQL → PostgREST → Supabase Services → Client</p>
<p>옵션 3: Hasura 사용 (PostgREST 없음)
PostgreSQL → Hasura → GraphQL API</code></pre></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">Hasura에 PostgREST를 추가할 수 있나?</h2>
<h3 data-ke-size="size23">이론적으로는 가능</h3>
<pre class="gcode"><code>PostgreSQL
├── Hasura (GraphQL)
└── PostgREST (REST)</code></pre>
<p data-ke-size="size16">같은 DB에 두 개 다 연결할 수 있습니다.</p>
<h3 data-ke-size="size23">하지만 실무에서는...</h3>
<p data-ke-size="size16"><b>❌ 권장하지 않습니다!</b></p>
<h4 data-ke-size="size20">이유 1: 중복된 기능</h4>
<pre class="javascript"><code>// PostgREST
const { data } = await fetch('/posts?select=*,users(*)')
<p>// Hasura
const { data } = await client.query({
query: gql<code>{ posts { id users { name } } }</code>
})</p>
<p>// 똑같은 걸 두 가지 방법으로?</code></pre></p>
<h4 data-ke-size="size20">이유 2: 권한 관리 복잡도</h4>
<pre class="routeros"><code>-- PostgREST: Row Level Security
CREATE POLICY "users_policy" ON posts
USING (auth.uid() = user_id);
<p>-- Hasura: Permissions
-- Hasura Console에서 별도 설정</p>
<p>-- 두 곳에서 따로 관리해야 함!  </code></pre></p>
<h4 data-ke-size="size20">이유 3: 유지보수 부담</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>두 개의 서버 운영</li>
<li>두 개의 설정 관리</li>
<li>두 개의 모니터링</li>
<li>팀원들의 혼란</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">언제 PostgREST를 고려할까?</h2>
<h3 data-ke-size="size23">Case 1: Hasura 없이 가벼운 REST API</h3>
<pre class="asciidoc"><code>PostgreSQL &rarr; PostgREST &rarr; REST API
<p>장점:</p>
<ul>
<li>매우 가볍고 빠름</li>
<li>설정 거의 없음</li>
<li>GraphQL 학습 불필요</code></pre></li>
</ul>
<p data-ke-size="size16"><b>하지만 Supabase를 쓰는 게 더 나음!</b></p>
<h3 data-ke-size="size23">Case 2: 레거시 시스템 통합</h3>
<pre class="gcode"><code>기존 PostgreSQL DB
├── 기존 서비스 (변경 불가)
└── PostgREST (새로운 읽기 전용 API)</code></pre>
<p data-ke-size="size16"><b>이 경우에도 Hasura가 더 강력함!</b></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">Supabase vs Hasura 선택 가이드</h2>
<h3 data-ke-size="size23">Supabase를 선택!</h3>
<p data-ke-size="size16">✅ <b>빠른 프로토타이핑</b></p>
<pre class="cs"><code>// 설정 거의 없이 바로 시작
const supabase = createClient(url, key);
const { data } = await supabase.from('posts').select('*');</code></pre>
<p data-ke-size="size16">✅ <b>간단한 CRUD 중심</b></p>
<p data-ke-size="size16">✅ <b>Next.js와 통합</b> (Auth, Storage 등)</p>
<p data-ke-size="size16">✅ <b>백엔드 경험 적음</b></p>
<p data-ke-size="size16">✅ <b>Firebase 대체</b> 찾는 경우</p>
<h3 data-ke-size="size23">Hasura를 선택!</h3>
<p data-ke-size="size16">✅ <b>복잡한 데이터 관계</b></p>
<pre class="routeros"><code>query {
  users {
    posts(where: { likes: { _gt: 100 } }) {
      comments_aggregate { aggregate { count } }
    }
  }
}</code></pre>
<p data-ke-size="size16">✅ <b>GraphQL 생태계</b> 활용 (Apollo, Relay 등)</p>
<p data-ke-size="size16">✅ <b>세밀한 권한 제어</b></p>
<p data-ke-size="size16">✅ <b>마이크로서비스 통합</b> (여러 DB, REST API)</p>
<p data-ke-size="size16">✅ <b>팀이 GraphQL에 익숙</b></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">실전 조합 추천</h2>
<h3 data-ke-size="size23">권장 ✅</h3>
<pre class="x86asm"><code>// Option 1: Supabase 올인원
PostgreSQL + PostgREST + Auth + Storage + Realtime
&rarr; Supabase JS Client
<p>// Option 2: Hasura + Next.js
PostgreSQL → Hasura GraphQL
→ Apollo Client + Next.js</p>
<p>// Option 3: 하이브리드 (고급)
PostgreSQL
├── Hasura (복잡한 쿼리)
└── Supabase (Auth, Storage)</code></pre></p>
<h3 data-ke-size="size23">비권장 ❌</h3>
<pre class="1c"><code>// PostgreSQL + Hasura + PostgREST
// 너무 복잡하고 불필요함!
<p>// 둘 중 하나만 선택하세요</code></pre></p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">프로젝트 규모별 추천</h3>
<p data-ke-size="size16"><b>작은 프로젝트 / MVP:</b></p>
<pre class="asciidoc"><code>✅ Supabase
- 설정 간단
- Next.js Auth 통합 쉬움
- 배포 빠름</code></pre>
<p data-ke-size="size16"><b>중간 프로젝트:</b></p>
<pre class="asciidoc"><code>✅ Supabase 또는 Hasura 둘 다 OK
- 데이터 관계 복잡 &rarr; Hasura
- CRUD 중심 &rarr; Supabase</code></pre>
<p data-ke-size="size16"><b>큰 프로젝트 / 복잡한 도메인:</b></p>
<pre class="asciidoc"><code>✅ Hasura
- GraphQL의 강력함
- 세밀한 권한 제어
- 확장성</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">결론</h2>
<h3 data-ke-size="size23">핵심 답변 요약</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Hasura는 PostgREST를 사용하지 않음</b> ❌</li>
<li><b>둘은 완전히 다른 접근 방식</b> (GraphQL vs REST)</li>
<li><b>굳이 함께 쓸 필요 없음</b> ❌</li>
<li><b>하나만 선택하세요!</b> ✅</li>
</ol>
<h3 data-ke-size="size23">선택 기준</h3>
<pre class="properties"><code>GraphQL 선호 + 복잡한 쿼리 &rarr; Hasura
REST 선호 + 간단한 CRUD &rarr; Supabase
올인원 솔루션 &rarr; Supabase
기업용 / 확장성 &rarr; Hasura</code></pre>
<h3 data-ke-size="size23">PostgREST 단독 사용?</h3>
<p data-ke-size="size16"><b>No!</b> 그냥 Supabase 쓰세요  <br />Supabase = PostgREST + Auth + Storage + Realtime + Dashboard + CLI + ...</p>