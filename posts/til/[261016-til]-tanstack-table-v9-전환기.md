<h2 data-ke-size="size26">TanStack Table v9 전환기 - 디렉티브 7개를 제거, 숨은 버그도 찾음..</h2>
<p data-ke-size="size16">React Compiler와 TanStack Table v8의 호환성 문제를 정리한 글을 쓴 게 두 달 전이다.</p>
<p data-ke-size="size16">그 글의 결론 중 하나가 "v9로 올리면 <code>"use no memo"</code>를 들고 가지 말 것"이었고, 할 일로 적어 두기만 하던 작업을 오늘 했다.</p>
<p data-ke-size="size16">결과부터 적으면 이렇다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>@tanstack/react-table</code> 8.21.3 &rarr; 9.3.1(legacy 호환 레이어)</li>
<li><code>"use no memo"</code> 7개 &rarr; <b>0개</b></li>
<li>컴포넌트 테스트 환경을 <b>React Compiler를 켠 채로</b> 처음 세웠다</li>
<li>그 테스트가 <b>운영에 두 달 넘게 살아 있던 버그</b>를 하나 찾았다</li>
</ul>
<p data-ke-size="size16">마지막 줄이 이 글을 쓰는 이유다. 전편에서 "아직 안 터진다"고 적어 둔 경로가 실은 이미 터져 있었다.</p>
<p data-ke-size="size16">프로젝트별 수치나 파일 목록은 빼고, 전편처럼 <b>다른 프로젝트에서도 남을 것</b>만 적는다.</p>
<h2 data-ke-size="size26">1. 첫 번째 결정 &mdash; 테스트부터, 그것도 컴파일러를 켠 채로</h2>
<p data-ke-size="size16">프로젝트에 컴포넌트 테스트가 하나도 없었다. 단위 테스트는 수백 개 있었는데 전부 node 환경의 <code>.test.ts</code>였다.</p>
<p data-ke-size="size16">라이브러리 교체에서 테스트는 새 동작이 아니라 <b>회귀 고정</b>이 목적이다. 그런데 이 부류의 회귀는 "에러 없이 화면만 옛 값"이다. 그래서 테스트를 세우기 전에 한 가지를 먼저 정해야 했다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>컴파일러 없이 돌리는 컴포넌트 테스트는 이 버그를 원리적으로 못 본다.</b></p>
</blockquote>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">캐시를 만드는 게 컴파일러인데 테스트에서 컴파일러가 빠지면, 테스트는 늘 "갱신된다"고 말한다. 통과해도 아무 의미가 없다.</p>
<p data-ke-size="size16">Vite 8(rolldown) + vitest 4 조합에서는 이렇게 붙는다.</p>
<pre class="clean"><code>// vitest.config.mts
import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
<p>plugins: [react(), babel({ presets: [reactCompilerPreset({ target: &quot;19&quot; })] })],</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">함정이 하나 있었다. pnpm이 <code>@babel/core</code>를 8.x로 깔았는데, <code>babel-plugin-react-compiler@1.0.0</code>은 <code>@babel/types ^7</code>에 묶여 있다. <b>7.x로 고정</b>했다.</p>
<h3 data-ke-size="size23">가드 테스트 &mdash; 테스트 환경 자체를 테스트한다</h3>
<p data-ke-size="size16">설정이 맞게 들어갔는지 확인할 방법이 필요했다.</p>
<p data-ke-size="size16">누가 나중에 설정에서 프리셋을 빼면 모든 컴포넌트 테스트가 조용히 무력해지기 때문이다.</p>
<p data-ke-size="size16">그래서 <b>컴파일러가 있으면 낡은 값을 보여야 하는</b> 테스트를 하나 넣었다.</p>
<pre class="reasonml"><code>function Reader({ source }: { source: { read: () =&gt; string } }) {
  return &lt;p&gt;{source.read()}&lt;/p&gt;;
}
<p>it(&quot;참조가 같은 prop이면 컴파일러가 캐시한 결과를 재사용한다&quot;, () =&gt; {
let value = &quot;처음&quot;;
const source = { read: () =&gt; value };   // 참조 고정 + 내부 값만 변함 = v8 table과 같은 성질
const { rerender } = render(&lt;Reader source={source} /&gt;);
value = &quot;바뀜&quot;;
rerender(&lt;Reader source={source} /&gt;);
expect(screen.getByText(&quot;처음&quot;)).toBeInTheDocument();  // 컴파일러가 없으면 &quot;바뀜&quot;
});</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">버그를 <b>재현하는</b> 걸 성공 조건으로 둔 테스트다. 프리셋을 빼고 돌려서 실패하는 것까지 확인했다. 이게 없었으면 이후의 모든 초록불을 믿을 근거가 없었다.</p>
<h2 data-ke-size="size26">2. legacy 경유 - 그리고 전편이 예고한 일</h2>
<p data-ke-size="size16">테이블 훅 호출부가 여러 곳이고 공용 테이블 컴포넌트 파일도 많아서, 신 API(<code>useTable</code> + <code>tableFeatures</code>)로 한 번에 가지 않고 v9가 동봉한 v8 호환 훅 <code>useLegacyTable</code>을 먼저 거치기로 했다.</p>
<p data-ke-size="size16">설치하자마자 전편에 적어 둔 문장이 현실이 됐다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">v9 코드에는 컴파일러 경고가 매칭될 수 없다. 경고가 사라진 것과 안전해진 것은 다르다.</p>
</blockquote>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">컴파일러 레지스트리는 <code>@tanstack/react-table</code> 모듈의 <b><code>useReactTable</code>이라는 이름 하나</b>만 안다. <code>useLegacyTable</code>로 바꾸는 순간 <b>호출부의 자동 스킵이 전부 사라진다.</b> v8 시절 "디렉티브 없이도 안전했던" 파일이 하나 있었는데, 그 안전은 디렉티브가 아니라 자동 스킵 덕이었다. 이제 그 파일도 컴파일된다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">다행히 legacy 훅을 뜯어보니 반환값이 <code>useMemo(() =&gt; ({...table, getState, setState}), [table, &hellip;])</code>이고, 안쪽 <code>useTable</code>은 옵션&middot;상태가 바뀌면 새 참조를 준다. <b>입력이 바뀌면 참조도 바뀐다</b> &mdash; 컴파일러가 원하는 전제를 라이브러리가 맞춰 준 구조다. 자동 스킵을 잃어도 판정 자체가 정상으로 돈다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>경험칙:</b> 라이브러리 메이저 업그레이드 후 컴파일러 경고가 사라지면, 먼저 레지스트리 키가 아직 코드에 존재하는지 본다. 경고가 사라진 이유가 "고쳐져서"인지 "이름이 바뀌어서"인지는 다르다.</p>
</blockquote>
<h2 data-ke-size="size26">3. 숨은 버그 - 가중치를 바꿔도 점수 열이 그대로</h2>
<p data-ke-size="size16">문제의 화면은 사용자가 가중치(URL 쿼리 파라미터)를 바꾸면 각 행의 종합 점수 열이 다시 계산되는 목록 화면이다. 가중치를 프리셋 하나로 바꾸는 테스트를 썼다. 실패했다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">URL 값은 바뀌었다(<code>25,25,25,25</code> &rarr; <code>40,30,15,15</code>). 셀만 <code>25</code>에 머물렀다.</p>
<p data-ke-size="size16">처음엔 마이그레이션 회귀라고 생각했다. 그래서 <b>v8 시절 커밋을 worktree로 띄워서 같은 테스트를 돌렸다.</b></p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>조건</th>
<th>결과</th>
</tr>
</thead>
<tbody>
<tr>
<td>v8 + 컴파일러 켬</td>
<td><b>실패</b></td>
</tr>
<tr>
<td>v8 + 컴파일러 끔</td>
<td>통과</td>
</tr>
<tr>
<td>v9 legacy + 수정 전</td>
<td>실패</td>
</tr>
<tr>
<td>v9 legacy + 수정 후</td>
<td>통과</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">v8에서도 실패했다. <b>원래 있던 버그</b>였다.</p>
<h3 data-ke-size="size23">원인 - 전편이 "아직 안 터진다"고 했던 바로 그 자리</h3>
<p data-ke-size="size16">공용 행 컴포넌트가 이렇게 생겼었다.</p>
<pre class="javascript"><code>function TableBodyRow({ row, onRowClick }) {
  return (
    &lt;tr onClick={() =&gt; onRowClick?.(row.original)}&gt;
      {row.getVisibleCells().map((cell) =&gt; &lt;td&gt;{flexRender(&hellip;)}&lt;/td&gt;)}
    &lt;/tr&gt;
  );
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">컴파일 결과의 셀 블록 메모 조건은 <code>row</code> <b>하나</b>였다. 그리고 <code>row</code>는 <b><code>data</code>가 같으면 같은 참조</b>다. 가중치 변경은 <code>columns</code>만 바꾸고 <code>data</code>는 그대로 둔다. 그러니 컴파일러 입장에서는 아무것도 안 바뀌었다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이건 v9 동봉 문서가 HIGH로 꼽은 "중첩 인스턴스(<code>row</code>&middot;<code>cell</code>&middot;<code>column</code>&middot;<code>header</code>)는 여전히 안정 참조"의 실례다. 수정은 전편의 판단 기준을 그대로 적용한 것이다 - <b>인스턴스를 넘기지 말고, 이미 읽어낸 값을 넘긴다.</b></p>
<pre class="xml"><code>// 부모 테이블 컴포넌트가 읽어서 넘긴다. 컬럼이 바뀌면 배열이 새로 온다.
&lt;TableBodyRow row={row} cells={row.getVisibleCells()} onRowClick={onRowClick} /&gt;</code></pre>
<h3 data-ke-size="size23">그런데 내 문서가 반대로 말하고 있었다</h3>
<p data-ke-size="size16">내가 남긴 문서 두 곳이 이 결과와 어긋났다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>전편을 쓰며 함께 정리한 문서에는 "호출부가 자동 스킵되고 인라인 <code>onRowClick</code>이 매 렌더 새 참조라 <b>자식의 메모 조건을 무효화해서</b> 아직 안 터진다"고 적혀 있었다. <b>틀렸다.</b> <code>onRowClick</code>이 바뀌면 <code>onClick</code> 핸들러 블록만 다시 만들어지고, 셀 블록은 <code>row</code>만 보므로 그대로 재사용된다. 메모 조건이 블록마다 따로라는 걸 놓친 추론이었다.</li>
<li>몇 달 전 다른 기록에는 "가중치를 바꾸면 <b>셀 점수는 즉시 갱신된다</b>"는 관찰이 남아 있었다.</li>
</ol>
<p data-ke-size="size16">2번이 특히 신경 쓰였다. 테스트는 "안 바뀐다", 사람의 관찰은 "바뀐다".</p>
<p data-ke-size="size16">테스트 환경(babel)과 운영 빌드(Next SWC)가 다르게 동작할 가능성도 있었다. 그래서 운영에서 직접 확인하기로 했다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">처음 확인했을 때 "가중치 바꾸니까 <b>평균 점수</b>가 바뀐다"고 답했다. 그런데 그건 표 위의 <b>요약 카드</b>였다. 카드는 표를 거치지 않고 스토어에서 바로 계산한다. 표의 <b>점수 열</b>을 다시 보니 - <b>그대로였다.</b></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">예전 관찰도 아마 같은 착각이었을 것이다. 화면 한쪽 숫자가 바뀌니까 다 바뀐 줄 알았다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>같은 화면에서 숫자 하나가 바뀌었다고 다른 숫자도 바뀐 게 아니다.</b> 같은 입력을 받아도 표를 거치는 값과 안 거치는 값은 서로 다른 캐시 경로를 탄다. 확인할 땐 <b>문제의 그 셀</b>을 본다.</p>
</blockquote>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">덤으로 얻은 것도 있다. 컴파일러를 켠 vitest가 재현한 버그가 운영 빌드에서도 그대로 나왔다. <b>테스트 환경이 운영과 같은 판정을 낸다는 근거</b>가 생긴 셈이다.</p>
<h2 data-ke-size="size26">4. 테스트가 정말 회귀를 잡는지 - 통과를 믿지 않는 법</h2>
<p data-ke-size="size16">회귀 고정 테스트는 처음부터 초록불이다.</p>
<p data-ke-size="size16">이미 동작하는 코드에 붙이니까. TDD의 RED 단계가 없다. 그러면 이 테스트가 <b>잡아야 할 때 실제로 잡는지</b>는 어떻게 아나.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이번에 쓴 방법은 <b>과거 커밋을 worktree로 띄워 같은 테스트를 돌리는 것</b>이었다.</p>
<pre class="routeros"><code>git worktree add ../wt-v8 &lt;v8 시절 커밋&gt;
cp &lt;새 테스트들&gt; ../wt-v8/src/__tests__/&hellip;
# 디렉티브를 뺀 상태로 돌려 본다</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">행 선택 테스트는 v8에서 디렉티브를 빼자 정확히 실패했다. 예전에 고쳤던 버그("체크박스를 눌러도 선택 표시가 안 바뀜")의 증상 그대로다. 이 테스트는 <b>두 달 전 그 버그를 다시 잡을 수 있다</b>는 증명이 붙은 셈이다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그 다음에야 <code>"use no memo"</code>를 하나씩 뺐다. 파일 하나 뺄 때마다 테스트를 돌렸고, 7개를 다 뺀 상태의 컴파일 결과도 뽑아서 메모 조건에 <code>table</code>(입력이 바뀌면 새 참조)이나 원시값만 남은 걸 확인했다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">할 일 메모에는 디렉티브가 8개라고 적혀 있었는데 실제로는 7개였다. 하나는 주석 안의 언급을 grep이 잡은 것이었다. 숫자도 실측한다.</p>
</blockquote>
<h2 data-ke-size="size26">5. 유통기한 있는 지식 vs 남을 원리 (전편 이어서)</h2>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>유통기한 있는 지식</th>
<th>오래 남을 원리</th>
</tr>
</thead>
<tbody>
<tr>
<td>legacy 훅 이름(<code>useLegacyTable</code>)과 import 경로</td>
<td>레지스트리는 <b>이름</b>으로 매칭한다 &mdash; 이름이 바뀌면 보호도 경고도 사라진다</td>
</tr>
<tr>
<td><code>@babel/core</code> 7 고정, <code>reactCompilerPreset</code> 설정 문법</td>
<td><b>컴파일러를 켠 채로</b> 컴포넌트를 테스트한다</td>
</tr>
<tr>
<td><code>cells</code> prop이라는 구체적 해법</td>
<td><code>data</code>는 그대로, <code>columns</code>만 바뀌는 화면이 <b>안정 참조 <code>row</code>의 사각지대</b>다</td>
</tr>
<tr>
<td>이 프로젝트의 디렉티브 7개 현황</td>
<td>테스트가 회귀를 잡는지는 <b>과거 커밋에서 실패하는지</b>로 확인한다</td>
</tr>
<tr>
<td>예전 기록의 틀린 관찰</td>
<td>확인할 땐 <b>문제의 그 값</b>을 본다. 옆의 값이 바뀐 건 증거가 아니다</td>
</tr>
</tbody>
</table>
<h2 data-ke-size="size26">6. 다음 - 다른 프로젝트들</h2>
<p data-ke-size="size16">이 작업을 문서로 남긴 이유 중 하나는 다른 프로젝트도 같은 길을 가야 하기 때문이다. 훑어보니 갈래가 뚜렷했다.</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>프로젝트 유형</th>
<th>react-table</th>
<th>컴파일러</th>
<th>해야 할 일</th>
</tr>
</thead>
<tbody>
<tr>
<td>이번 프로젝트</td>
<td>9.x legacy</td>
<td>켜짐</td>
<td>2단계 &mdash; 화면별로 신 API</td>
</tr>
<tr>
<td>관리자용 프로젝트</td>
<td>8.x</td>
<td><b>꺼짐</b></td>
<td>순수 API 이전. 이 글의 함정 대부분이 <b>해당 없음</b></td>
</tr>
<tr>
<td>최근에 새로 만든 프로젝트</td>
<td>9.x</td>
<td>켜짐</td>
<td>이미 신 API</td>
</tr>
<tr>
<td>의존성만 남은 프로젝트</td>
<td>8.x</td>
<td>꺼짐</td>
<td>사용처 0 &rarr; 의존성 제거</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">관리자용 프로젝트가 컴파일러를 안 쓴다는 게 의외였다. 같은 v8 &rarr; v9 작업인데 <b>위험의 성격이 완전히 다르다.</b></p>
<p data-ke-size="size16">컴파일러가 없으면 "화면만 조용히 옛 값"인 부류가 원리적으로 생기지 않으니, 남는 건 타입&middot;이름 이전뿐이다.</p>
<h2 data-ke-size="size26">정리</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>컴포넌트 테스트는 <b>앱과 같은 컴파일러 조건</b>에서 돌아야 이 부류의 버그를 본다. 테스트 환경 자체를 지키는 <b>가드 테스트</b>를 같이 둔다.</li>
<li>v9로 올리면 레지스트리가 모르는 이름이 되어 <b>자동 스킵이 사라진다.</b> v9 훅은 입력이 바뀌면 새 참조를 주므로 판정은 정상이지만, 경고 부재를 안전 신호로 읽지 않는다.</li>
<li><code>row</code>&middot;<code>cell</code> 같은 중첩 인스턴스는 v9에서도 안정 참조다. 특히 <b><code>data</code>는 그대로이고 <code>columns</code>만 바뀌는 화면</b>에서 셀이 얼어붙는다. 부모가 읽은 값을 넘긴다.</li>
<li>메모 조건은 <b>블록마다 따로</b>다. 한 prop이 매 렌더 바뀐다고 같은 컴포넌트의 다른 블록까지 무효화되지는 않는다.</li>
<li>회귀 고정 테스트는 <b>과거 커밋에서 실패하는 것</b>을 보고 나서 믿는다.</li>
<li>운영 확인은 <b>문제의 그 값</b>을 본다. 같은 화면의 다른 숫자가 바뀐 것은 증거가 아니다 &mdash; 이번에 두 번(예전 기록, 오늘의 첫 확인) 같은 착각이 나왔다.</li>
<li>전편의 교훈이 또 맞았다. <b>그럴듯한 설명(<code>onRowClick</code>이 메모를 무효화한다는 추론)을 적어 두면 다음 사람이 믿는다.</b> 이번에 그걸 깬 건 추론이 아니라 실패하는 테스트 하나였다.</li>
</ul>