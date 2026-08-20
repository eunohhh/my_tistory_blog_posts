<h2 data-ke-size="size26">React Compiler와 라이브러리 호환성 - 사라질 문제와 남을 원리</h2>
<p data-ke-size="size16">두 프로젝트에서 각각 한 번씩 크게 물렸다.<br />한쪽은 폼(react-hook-form), 한쪽은 테이블(TanStack Table v8)이었는데 증상 문장은 똑같았다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>"눌렀는데 아무 일도 안 일어난다."</b></p>
</blockquote>
<p data-ke-size="size16">런타임 에러도 없고 콘솔 경고도 없다.<br />라이브러리는 제대로 동작하고 있고 <b>화면만 옛날 값</b>이다.</p>
<h2 data-ke-size="size26">1. 한 문장 원리</h2>
<p data-ke-size="size16">React Compiler의 판단 기준은 오직 하나다. Object.is 참조 비교.</p>
<pre class="gams"><code>if ($[13] !== label || $[14] !== registration) {
  t8 = &lt;div&gt;&hellip;&lt;Form registration={registration} /&gt;&lt;/div&gt;;
} else {
  t8 = $[15];   // &larr; 캐시된 JSX를 그대로 재사용
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">캐시된 엘리먼트를 그대로 돌려주면 React는 <b>그 서브트리 전체의 재렌더를 건너뛴다</b>(같은 엘리먼트 참조 = bailout).</p>
<p data-ke-size="size16">이 모델의 전제는 "값이 바뀌면 참조도 바뀐다"는 것이다.<br />그런데 폼&middot;테이블&middot;가상화 계열 라이브러리는 <b>정확히 반대 전제</b>로 설계돼 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>&nbsp;</th>
<th>React Compiler의 전제</th>
<th>폼&middot;테이블 라이브러리의 설계</th>
</tr>
</thead>
<tbody>
<tr>
<td>인스턴스</td>
<td>값이 바뀌면 새 객체</td>
<td>마운트 내내 <b>같은 참조</b> 유지</td>
</tr>
<tr>
<td>갱신 전파</td>
<td>새 참조를 위로 올려 전파</td>
<td>인스턴스 <b>내부를 변이</b>하고 자체 구독으로 재렌더</td>
</tr>
<tr>
<td>최적화 근거</td>
<td>컴파일 타임 참조 비교</td>
<td>런타임 구독 범위 최소화</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">두 전제가 만나면 이렇게 된다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>라이브러리가 내부 상태를 바꾸고, 자기 구독으로 <b>소유 컴포넌트</b>를 재렌더시킨다.</li>
<li>그런데 자식에게 넘기는 props(= 그 안정된 인스턴스)의 참조는 그대로다.</li>
<li>컴파일러는 "안 바뀌었다"고 판정해 <b>자식 서브트리를 캐시된 채로 둔다</b>.</li>
<li>결과: 라이브러리는 제대로 동작하는데 화면만 안 바뀐다.</li>
</ol>
<p data-ke-size="size16"><b>이건 컴파일러 버그가 아니다.</b><br />양쪽 다 자기 전제 안에서 옳게 동작하고 있고, 어긋난 건 전제다.<br />React 공식 문서도 같은 입장이고, 표현이 더 단호하다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">Some libraries were designed before React's memoization rules were fully documented. &hellip;<br /><b>Efforts are ongoing to work with library authors to migrate these libraries to patterns that align with the Rules of React.</b></p>
</blockquote>
<p data-ke-size="size16">그리고 결정적인 한 문장이 있다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">if manual <code>useMemo</code> breaks with a pattern, React Compiler's automatic optimization will also fail</p>
</blockquote>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">즉 <b>컴파일러가 새 제약을 만든 게 아니라, 원래 있던 규칙 위반을 드러낸 것</b>이다.<br />손으로 <code>useMemo</code>를 붙여도 똑같이 깨지는 패턴이었고, 사람이 그걸 잘 안 붙여서 안 드러났을 뿐이다.</p>
<p data-ke-size="size16"><br />공식 문서는 이 설계 특성을 <b>interior mutability</b>(내부 가변성)라고 명명한다.</p>
<p data-ke-size="size16">그래서 "언젠가 컴파일러가 고쳐 줄 문제"로 기대하면 안 된다 - 실제로 적응하고 있는 쪽은 라이브러리다.</p>
<h3 data-ke-size="size23">특히 위험한 배치 - 커스텀 훅으로 감싸기</h3>
<p data-ke-size="size16">컴파일러는 <b>커스텀 훅이 반환하는 객체 리터럴까지 메모이제이션한다.</b><br />훅 안의 값이 전부 "안정된 참조"뿐이면 그 반환 객체 자체가 영원히 같은 참조가 되어, <b>갱신 전파가 훅 경계에서 끊긴다.</b></p>
<pre class="angelscript"><code>// 커스텀 훅의 컴파일 결과 &mdash; 반환 객체가 통째로 메모된다
if ($[5] !== done || $[6] !== form || $[7] !== isPending || &hellip;) {
  t4 = { form, isPending, done, onSubmit };
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>form</code>은 <code>useForm()</code>이 돌려주는 <b>항상 같은 참조</b>다.<br />검증 에러가 새로 생겨도 이 목록 중 아무것도 바뀌지 않는다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>경험상 암묵지:</b> 이 부류의 버그는 <b>"컴포넌트를 잘게 쪼개고 상태 로직을 커스텀 훅으로 뺀" 리팩토링 직후</b>에 나타난다.<br />쪼개기 전에는 라이브러리 소유 컴포넌트와 소비 컴포넌트가 같은 함수라서 문제가 드러날 자리가 없기 때문이다. 즉 <b>코드를 잘 정리할수록 밟는 함정</b>이다.</p>
</blockquote>
<h2 data-ke-size="size26">2. 컴파일러는 라이브러리를 봐주지 않는다 - 레지스트리는 딱 3개다</h2>
<p data-ke-size="size16">가장 먼저 알아야 할 사실.</p>
<p data-ke-size="size16">React Compiler 1.0은 비호환 API 레지스트리를 <b>내장하고 있다.</b></p>
<p data-ke-size="size16"><br />그리고 그 목록은 생각보다 훨씬 짧고 흥미롭다.</p>
<p data-ke-size="size16"><code>babel-plugin-react-compiler@1.0.0</code>의 dist에서 실측한 전체 목록이다.</p>
<pre class="gradle"><code>grep -o "knownIncompatible.\{0,200\}" \
  node_modules/.pnpm/babel-plugin-react-compiler@*/node_modules/babel-plugin-react-compiler/dist/index.js</code></pre>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>모듈</th>
<th>등재된 대상</th>
<th>범위</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>react-hook-form</code></td>
<td><code>useForm()</code> 반환값 중 <b><code>watch()</code> 하나만</b></td>
<td>"returns a <code>watch()</code> function which cannot be memoized safely"</td>
</tr>
<tr>
<td><code>@tanstack/react-table</code></td>
<td><code>useReactTable()</code> &mdash; <b>훅 전체</b></td>
<td>"returns functions that cannot be memoized safely"</td>
</tr>
<tr>
<td><code>@tanstack/react-virtual</code></td>
<td><code>useVirtualizer()</code> &mdash; <b>훅 전체</b></td>
<td>위와 동일</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 <b>세 개가 전부.</b> 그러니까 다 내가 걸렸던 함정이다 ㅠㅠ<br />레지스트리 실체는 <code>switch</code>문 3개 case이고 나머지는 전부 <code>return null</code>이다.</p>
<p data-ke-size="size16"><br />Embla, GSAP, 그 밖에 명령형 인스턴스를 돌려주는 수많은 라이브러리는 등재돼 있지 않다.<br />"컴파일러가 알아서 다 처리해 준다"는 기대는 여기서 깨진다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">알아 둘 만한 부수 사실 세 가지.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>빌드는 깨지지 않는다.</b> 이건 lint rule <code>incompatible-library</code>의 <b>Warning</b>이다. 경고를 흘려보내도 빌드는 통과하므로, 아무도 안 보는 채로 배포될 수 있다.</li>
<li><b>목록은 커뮤니티 신고로 늘어난다.</b> 공식 문서가 *"users are encouraged to file an issue to help add them to the linter's detection list"<i>라고 안내한다. 즉 이 목록은 완결된 명세가 아니라 *</i>누적 중인 화이트리스트**다.</li>
<li><b>직접 등재할 수 있다.</b> 컴파일러 옵션에 <code>moduleTypeProvider</code> 확장점이 있어 사내에서 쓰는 라이브러리를 자체 등재할 수 있다. (옵트아웃 디렉티브는 <code>"use no memo"</code>와 <code>"use no forget"</code> 두 개다.)</li>
</ul>
<h3 data-ke-size="size23">등재돼 있어도 보호는 안됨</h3>
<p data-ke-size="size16">더 중요한 건 컴파일러가 <b>자기 경고문에 한계를 직접 못 박아 뒀다는 것</b>이다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">by default React Compiler will skip memoizing this component/hook.<br /><b>However, you may see issues if values from this API are passed to other components/hooks that are memoized.</b></p>
</blockquote>
<p data-ke-size="size16">자동 스킵은 <b>그 훅을 호출한 함수 하나에만</b> 적용된다.<br />인스턴스를 prop으로 넘기는 순간 보호가 끝난다.</p>
<p data-ke-size="size16"><br />받는 쪽은 그 훅을 호출하지 않으므로 평범하게 메모이제이션된다.</p>
<p data-ke-size="size16">여기서 두 사례의 성격이 갈렸다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>TanStack Table v8</b>: 훅 전체가 등재돼 <code>useReactTable()</code>을 부르는 파일은 컴파일러가 이미 통째로 건너뛰고 있었다. 위험은 <b><code>table</code>/<code>row</code>를 받는 파일</b>에만 있었다. (실제로 옵트아웃 디렉티브를 붙여 둔 7개 파일 중 3개는 자동 스킵과 중복이라 아무 일도 하지 않고 있었다.)</li>
<li><b>react-hook-form</b>: 등재된 게 <code>watch()</code> 하나뿐이라 <b><code>formState</code> 경로는 자동 보호가 처음부터 없다.</b> 폼 검증 에러가 화면에 도달하지 못한 버그가 아무 경고 없이 통과한 이유다.</li>
</ul>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>결론: 위험한 쪽은 인스턴스를 만드는 파일이 아니라 받는 파일이다.</b></p>
</blockquote>
<h2 data-ke-size="size26">3. 라이브러리들이 따라오는 네 가지 방식</h2>
<p data-ke-size="size16">여기가 미래지향적으로 볼 지점이다.<br />지금 생태계는 <b>컴파일러가 라이브러리를 봐주는 방향이 아니라, 라이브러리가 컴파일러의 모델로 적응하는 방향</b>으로 수렴하고 있다.</p>
<p data-ke-size="size16">관찰된 방식이 네 가지다.</p>
<h3 data-ke-size="size23">(a) 이미 있던 구독 API를 정규 패턴으로 승격 - react-hook-form</h3>
<p data-ke-size="size16">RHF에는 원래 재렌더 격리용으로 만들어 둔 구독 훅이 있었다.<br />컴파일러 시대에는 그게 <b>선택이 아니라 기본</b>이 됐다.</p>
<pre class="cpp"><code>-  const { register, control, watch, formState: { errors } } = form;
+  const { register, control } = form;
+  const { errors } = useFormState({ control });
+  const sessionType = useWatch({ control, name: "sessionType" });</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>useFormState</code> / <code>useWatch</code>는 <b>호출한 컴포넌트 안에 자체 상태를 두고 구독한다.</b><br />자기 상태가 바뀌면 부모가 캐시된 엘리먼트를 넘겨도 React는 그 컴포넌트를 다시 그린다.</p>
<p data-ke-size="size16"><br />컴파일러의 메모이제이션을 우회하는 꼼수가 아니라, <b>원래 권장 패턴이 컴파일러 환경에서 필수가 된 것</b>이다.</p>
<p data-ke-size="size16">이 패턴이 라이브러리 전반의 정답 형태다 - "외부상태는 구독으로 읽는다"는 원칙과 같은 뿌리다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">주목할 점은 <b>RHF 공식 문서가 이 두 훅을 설명할 때 React Compiler를 언급하지 않는다</b>는 것이다.<br />목적이 어디까지나 "재렌더 격리"(성능)로만 서술돼 있다.</p>
<p data-ke-size="size16"><br />원래 성능용으로 만들어 둔 API가 컴파일러 환경에서 <b>정확성용 필수 경로</b>가 된 셈이다.</p>
<p data-ke-size="size16">그리고 v8이 이걸 정면으로 받았다.<br />마이그레이션 문서에 이렇게 적혀 있다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">React Hook Form <b>V8 introduces first-class support for the React Compiler</b>,<br />requiring no additional configuration for compatibility.</p>
</blockquote>
<p data-ke-size="size16">같은 문서의 breaking change 목록에<br /><code>watch</code> 콜백 API 제거 &rarr; <code>subscribe({ formState, callback })</code>가 있다.</p>
<p data-ke-size="size16"><br />컴파일러가 레지스트리에 등재한 바로 그 API를 라이브러리가 걷어낸 것이다.<br />이보다 명확한 "적응" 증거는 없다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">다만 <b>v8은 아직 베타다</b>(<code>beta: 8.0.0-beta.3</code>, <code>latest: 7.85.0</code>).<br />지금 프로덕션은 v7이고, v7에서는 위 diff의 구독 훅 패턴이 정답이다.</p>
</blockquote>
<h3 data-ke-size="size23">(b) 반환 참조를 상태에 연동 - TanStack Table v9</h3>
<p data-ke-size="size16">v8이 유독 심했던 이유는 인스턴스가 <b>영구히</b> 고정이었기 때문이다.</p>
<pre class="reasonml"><code>// v8 &mdash; 마운트 내내 같은 객체를 그대로 반환
const [tableRef] = React.useState(() =&gt; ({ 
    current: createTable(resolvedOptions) 
}));
tableRef.current.setOptions(prev =&gt; ({ ...prev, ...options }));
return tableRef.current;   // &larr; 참조가 절대 안 바뀐다</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>table</code> 참조가 절대 안 바뀌므로 <code>table.getRowModel().rows.map(...)</code> 결과가<br />첫 렌더 값으로 영원히 캐시된다. 정렬&middot;페이지네이션&middot;행 선택이 전부 화면에 도달하지 못한다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">v9(정식 9.1.2)는 이 최상위 원인을 없앴다.<br />구현을 뜯어보면 방식이 명확하다.</p>
<pre class="pf"><code>// v9 &mdash; 내부 인스턴스는 여전히 useState로 고정이지만,
//      반환값은 구독한 state가 바뀌면 새 객체가 된다
const state = useSelector(rootSource, selector, { compare: shallow });
return useMemo(() =&gt; ({ 
    ...table, 
    options: tableOptions, 
    state 
}), [table, tableOptions, state]);</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">즉 <b>인스턴스를 새로 만드는 게 아니라, 상태를 구독해 얕은 복사본을 새 참조로 돌려준다.</b><br />컴파일러가 요구하는 "값이 바뀌면 참조도 바뀐다"를 라이브러리가 맞춰 준 것이다.<br />공식 문서도 정확히 그렇게 말한다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><code>useTable</code> already returns a fresh table reference on state changes. The remaining hazard is a nested component receiving a stable <b>row, cell, column, or header</b> and hiding a state read behind its methods.</p>
</blockquote>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">남은 위험이 좁아졌을 뿐 사라진 건 아니라는 점이 중요하다.</p>
<p data-ke-size="size16"><br /><code>row</code>&middot;<code>cell</code>&middot;<code>column</code>&middot;<code>header</code>는 여전히 안정 참조이므로,<br />그 메서드 뒤에 상태 읽기를 숨기면 같은 버그가 난다.<br />공식 해법은 <code>Subscribe</code>다.</p>
<pre class="pgsql"><code>// ❌ row.getIsSelected()를 memo된 셀 안에 숨긴다
const SelectionCell = memo(({ row }) =&gt; (
  &lt;input type="checkbox" checked={row.getIsSelected()} &hellip; /&gt;
))
<p>// ✅ atom을 구독한다
const SelectionCell = memo(({ row }) =&gt; (
&lt;Subscribe source={row.table.atoms.rowSelection}
selector={(s) =&gt; s[row.id]}&gt;
{(selected) =&gt; &lt;input type=&quot;checkbox&quot; checked={!!selected} … /&gt;}
&lt;/Subscribe&gt;
))</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">v9는 상태 접근 경로 자체를 atom 기반으로 재설계했다(<code>table.atoms</code> &middot; <code>table.store</code> &middot; <code>table.baseAtoms</code> &middot; <code>table.Subscribe</code>).<br /><b>"인스턴스 메서드로 상태를 읽는다"를 "atom을 구독한다"로 바꾼 것</b>이 설계 변경의 본질이다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">여기에 함정이 하나 있다.<br /><b>v9는 <code>useReactTable</code>을 아예 export하지 않는다</b>?<br /><code>useTable</code>로 개명했고, v8 호환은 <code>./legacy</code>의 <code>useLegacyTable</code>로 분리했다(dist 전수 검색으로 확인).<br />그런데 2의 레지스트리 키가 <code>useReactTable</code>이다.<br />즉 <b>v9 코드에는 컴파일러 경고가 매칭될 수 없다.</b></p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>경고가 사라진 것과 안전해진 것은 다르다.</b><br />v9로 올리면 경고가 없어지는데, 1차 이유는 설계가 나아진 것이기도 하지만 <b>레지스트리 키가 코드에 존재하지 않기 때문</b>이기도 하다. 정작 v9 자신의 문서는 중첩 컴포넌트의 builder 메서드 읽기를 <b>HIGH 심각도</b>로 등재해 두고 있다.<br />경고 부재를 안전 신호로 읽지 말 것.</p>
</blockquote>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">v8 &rarr; v9 올릴 때 <b>옵트아웃 디렉티브를 그냥 들고 가지 말 것.</b><br />v9에서는 대부분 불필요하고, 필요한 지점은 <code>Subscribe</code>로 좁게 해결하는 게 맞다.</p>
</blockquote>
<h3 data-ke-size="size23">(c) 컴파일러 쪽 레지스트리 등재 - 보조 수단</h3>
<p data-ke-size="size16">2에서 본 그 목록이다.<br />라이브러리와 컴파일러 팀이 협의해 등재하는 방식인데, <b>보호가 한 칸짜리</b>라 근본 해결이 아니다.</p>
<p data-ke-size="size16"><br />앞으로 목록은 늘어날 것이고, 그래서 <b>목록을 외우는 건 의미가 없다.</b><br />도입 시점에 직접 grep하는 습관이 낫다.</p>
<h3 data-ke-size="size23">(d) 패키지에 에이전트용 스킬 문서를 동봉 - 새로 생긴 흐름</h3>
<p data-ke-size="size16">이건 예상 못 했던 부분이다.<br />TanStack Table v9는 <code>node_modules</code> 안에 스킬 문서 6종을 동봉한다.</p>
<pre class="reasonml"><code>skills/table-state/SKILL.md        &larr; React Compiler 문제를 정면으로 다룬다
skills/migrate-v8-to-v9/SKILL.md
skills/getting-started/SKILL.md
skills/with-tanstack-virtual/SKILL.md
skills/with-tanstack-query/SKILL.md
skills/create-table-hook/SKILL.md</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>table-state/SKILL.md</code>의 description에 <b>"React Compiler builder-method subscription problems"</b>가 명시돼 있고, 본문에는 <code>### HIGH Hiding builder reads from React Compiler</code>라는 심각도 표시 항목이 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">라이브러리가 컴파일러 호환성을 <b>1급 관심사로 문서화</b>하고, 그 문서를 사람이 아니라 에이전트가 읽도록 패키지에 실어 보내기 시작했다는 뜻이다. 앞으로 새 라이브러리를 붙일 때 <b><code>node_modules/&lt;pkg&gt;/skills/</code> 를 먼저 확인</b>하는 게 실질적인 습관이 될 것 같다.</p>
<h2 data-ke-size="size26">4. 중요!! 유통기한 있는 지식 vs 남을 원리</h2>
<p data-ke-size="size16">이 부류를 기록할 때 제일 조심할 게 이거다.<br />4개월 전 메모가 이미 틀린 게 나왔다.</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>유통기한 있는 지식 (버전이 올라가면 틀려진다)</th>
<th>오래 남을 원리</th>
</tr>
</thead>
<tbody>
<tr>
<td>"TanStack Table은 옵트아웃 디렉티브가 필요하다" &rarr; v9에서 대부분 불필요</td>
<td>참조 안정성 전제와 값 변경 전제의 충돌</td>
</tr>
<tr>
<td>레지스트리 등재 모듈 3개 목록 &rarr; 늘어날 것</td>
<td>자동 보호는 <b>호출한 함수 한 칸</b>에만 적용된다</td>
</tr>
<tr>
<td>특정 파일에 디렉티브가 몇 개 붙어 있다는 현황</td>
<td><b>인스턴스를 받는 쪽이 위험하다</b>는 경계 판정</td>
</tr>
<tr>
<td>개별 라이브러리의 우회 스니펫</td>
<td>라이브러리가 주는 <b>구독 수단</b>을 찾아 쓴다는 규칙</td>
</tr>
<tr>
<td>"이 버그는 이렇게 고쳤다"는 사례</td>
<td>추측하지 말고 <b>컴파일 결과를 뽑아 본다</b>는 진단법</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">왼쪽은 각 레포 문서에, 오른쪽은 이 노트(내 옵시디언)처럼 추상화된 계층에 둔다.<br />왼쪽을 옵시디언에 적어 두면 반드시 썩는다.</p>
<h2 data-ke-size="size26">5. 새 라이브러리를 붙일 때의 사전 판별</h2>
<p data-ke-size="size16">레지스트리를 뒤지기 전에, <b>설계 특성만 보고</b> 위험을 예측할 수 있다.<br />신호는 네 가지다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>훅이 객체를 돌려주고, 그 객체의 메서드로 상태를 읽는가?</b> (<code>form.formState</code>, <code>table.getRowModel()</code>, <code>api.selectedScrollSnap()</code>) &rarr; 위험 후보</li>
<li><b>그 객체가 마운트 내내 같은 참조인가?</b> &rarr; 문서에 "stable reference"라고 자랑하듯 적혀 있으면 바로 그게 위험 신호다</li>
<li><b><code>useSyncExternalStore</code> / <code>Subscribe</code> / <code>useXxxState</code> 같은 구독 수단을 함께 제공하는가?</b> &rarr; 제공한다면 그게 정답 경로다. 없다면 상태를 라이브러리 밖(스토어&middot;URL)으로 빼는 설계를 고려한다</li>
<li><b>imperative handle을 쓰는 명령형 API인가?</b> (캐러셀, 애니메이션, 지도, 에디터) &rarr; 렌더 중에 읽지 말고 이벤트 콜백에서 리액트 상태로 승격시킨다</li>
</ol>
<p data-ke-size="size16">그리고 판단 기준은 한 문장으로 압축된다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>라이브러리 인스턴스를 받아서 그 메서드로 상태를 읽는가?</b><br />읽는다면 위험하다.<br />인스턴스를 아예 안 받거나, 이미 읽어낸 <b>원시값</b>만 받으면 안전하다.</p>
</blockquote>
<p data-ke-size="size16">도입 시점 체크는 이거 하나.</p>
<pre class="gradle"><code>grep -o "knownIncompatible.\{0,200\}" \
  node_modules/.pnpm/babel-plugin-react-compiler@*/node_modules/babel-plugin-react-compiler/dist/index.js
ls node_modules/&lt;패키지&gt;/skills/ 2&gt;/dev/null   # 동봉 문서가 있는지</code></pre>
<h2 data-ke-size="size26">6. 진단 - 추측하지 말고 컴파일 결과를 봐라</h2>
<p data-ke-size="size16">이 부류는 <b>컴파일러가 무엇을 캐시했는지 직접 출력해 보는 것</b>이 압도적으로 빠르다. 30초면 갈린다.</p>
<pre class="javascript"><code>// scripts/print-compiled.mjs &mdash; 레포 루트에서 실행
//   node scripts/print-compiled.mjs src/components/foo.tsx
import { globSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
<p>const require = createRequire(resolve(&quot;package.json&quot;));
/** pnpm은 @babel/*을 호이스팅하지 않으므로 스토어에서 찾아 건다. */
const fromStore = (pkg) =&gt; {
const [hit] = globSync(
<code>node_modules/.pnpm/${pkg.replace(&quot;/&quot;, &quot;+&quot;)}@*/node_modules/${pkg}/package.json</code>
);
if (!hit) throw new Error(<code>${pkg}를 찾지 못했다. 설치 먼저.</code>);
return require(resolve(hit, &quot;..&quot;));
};</p>
<p>const babel = fromStore(&quot;@babel/core&quot;);
const presetTs = fromStore(&quot;@babel/preset-typescript&quot;);
const compiler = require(&quot;babel-plugin-react-compiler&quot;);</p>
<p>const file = process.argv[2];
const { code } = babel.transformSync(readFileSync(file, &quot;utf8&quot;), {
filename: file, configFile: false, babelrc: false,
presets: [[presetTs.default ?? presetTs, { isTSX: true, allExtensions: true }]],
plugins: [[compiler.default ?? compiler, { target: &quot;19&quot; }]],
});
console.log(code);</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">메모 조건만 훑으려면:</p>
<pre class="crmsh"><code>node scripts/print-compiled.mjs src/components/table.tsx | grep -E '\$\[[0-9]+\] !=='</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이미 옵트아웃 디렉티브가 붙은 파일을 조사할 때는 <b>디렉티브를 뺀 사본</b>을 컴파일한다.<br />그래야 원래 무엇이 캐시될지가 보인다(= 그 디렉티브가 실제로 일을 하고 있는지 판정할 수 있다).</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>읽는 법</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>if ($[n] !== x || &hellip;)</code> 목록이 그 블록의 <b>의존성</b>이다.</li>
<li>화면에 보여야 할 값이 그 목록에 <b>없다면</b> &rarr; 그 값이 바뀌어도 다시 안 그려진다. <b>버그.</b></li>
<li>목록에 <code>table</code>, <code>form</code>, <code>row</code>, <code>api</code> 같은 <b>라이브러리 인스턴스만</b> 있다면 &rarr; 십중팔구 위험.</li>
<li>목록에 <code>errors.company?.message</code> 같은 <b>원시값</b>이 있다면 &rarr; 안전.</li>
<li>훅 호출(<code>useFormState(&hellip;)</code>)은 컴파일러가 캐시하지 못한다. 매 렌더 실행되므로 그 반환값은 항상 신선하다.</li>
</ul>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">이 스크립트는 진단 전용이다.<br />Next는 SWC 파이프라인에서 컴파일러를 돌리므로 이 babel 하네스와 바이트 단위로 같지는 않다.<br /><b>의존성 판정을 보는 용도로는 충분하다.</b></p>
</blockquote>
<h2 data-ke-size="size26">7. 내가 틀렸던 기록 - <code>as</code> 단언 오진</h2>
<p data-ke-size="size16">2026-04에 이 증상을 처음 만났을 때 원인을 <b>TypeScript <code>as</code> 단언</b>으로 적었다. TIL도 두 편 썼다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://ifelseif.tistory.com/334" target="_blank" rel="noopener">260416 til React Compiler 환경에서 as 단언이 메모이제이션을 깨뜨린다</a></li>
</ul>
<p data-ke-size="size16"><b>틀렸다.</b> 6의 방법으로 확인해 보면 두 코드의 컴파일 출력이 <b>메모 슬롯 번호까지 한 글자도 다르지 않다.</b></p>
<pre class="kotlin"><code>const rows = (response?.data ?? []) as Row[];        // A
const rows: Row[] = (response?.data ?? []) as Row[]; // B</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">당시 버그가 고쳐진 건 같은 커밋에 함께 들어간 <b>구조 변경</b>(공용 테이블 컴포넌트 제네릭화, 스토어가 객체 대신 id 문자열을 들도록 바꾼 것) 때문일 가능성이 크다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">흥미로운 건 <b>전제로 삼은 사실은 맞았다</b>는 점이다.<br /><b>"babel은 플러그인을 preset보다 먼저 돌리므로 컴파일러가 <code>TSAsExpression</code> 노드를 그대로 본다"</b> 이건 사실이다.<br />그러나 거기서 "그러니 의존성 추적이 방해받는다"로 <b>검증 없이 결론을 뻗은 것</b>이 오류였다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">컴파일러는 그 노드를 보고도 동일하게 처리한다.</p>
<p data-ke-size="size16">가장 따끔한 부분은 이거다.</p>
<p data-ke-size="size16"><br />그 TIL에는 <b>"최소 재현 예제"라는 절이 있고, 거기에 검증 절차가 3단계로 적혀 있다</b>.<br />Playground에서 두 패턴의 컴파일 결과 차이를 캡처하라는 내용이다.<br />6에서 실제로 한 것과 같은 절차다.</p>
<p data-ke-size="size16"><b>적어 놓고 실행하지 않았다.</b><br />실행했으면 그 자리에서 갈렸다.</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>교훈은 <code>as</code>가 아니라 방법론이다.</b><br />그럴듯한 원인을 적어 두면 다음 사람이 그걸 믿는다.<br />나 자신이 4개월 뒤의 그 다음 사람이었다.<br />그리고 검증 절차를 <b>적는 것</b>과 <b>돌리는 것</b>은 다르다.<br />적어만 두면 다음 사람은 "검증된 문서"로 읽는다.</p>
</blockquote>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">메커니즘을 재현으로 확인하지 못한 항목은 앞으로 <b>"기전 미확정"이라고 적어 둔다.</b><br />예를 들어 손으로 쓴 <code>useMemo</code>를 지워서 갱신 문제가 고쳐진 건이 있는데, 방향은 맞다고 보지만(컴파일러가 켜진 환경에서 손 <code>useMemo</code>는 대체로 불필요하고, 의존성이 라이브러리가 안정화한 참조라면 그 안정성이 곧 캐시 무효화 실패가 된다) 기전을 재현으로 확인하지는 못했다.</p>
<h2 data-ke-size="size26">8. 그래도 react-complier 사용 할 거? &gt; ㅇㅇ 켠다</h2>
<p data-ke-size="size16">주의사항을 길게 썼지만 결론은 그렇다.</p>
<p data-ke-size="size16"><b>얻는 것</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>손으로 쓰는 <code>useMemo</code> / <code>useCallback</code> / <code>memo</code>가 거의 사라진다.</li>
<li>의존성 배열 실수라는 버그 클래스가 통째로 없어진다.</li>
<li>최적화가 코드 리뷰 대상에서 빠진다. "이거 memo 감싸야 하나요"라는 논의가 없어진다.</li>
<li>사람이 손으로 붙이는 것보다 <b>일관되게</b> 붙는다. 빠뜨린 곳이 없다.</li>
</ul>
<p data-ke-size="size16"><b>대가</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>문제가 <b>조용히</b> 나타난다. 에러가 없으니 원인 후보 목록에 올라가는 데 시간이 걸린다.</li>
<li>문제의 위치가 <b>직관과 반대</b>다. 인스턴스를 만드는 파일이 아니라 받는 파일이고, 코드를 잘 쪼갤수록 밟는다.</li>
<li>라이브러리 선택에 새 기준이 하나 붙는다.</li>
</ul>
<p data-ke-size="size16">대가는 <b>알고 있으면 대부분 회피된다.</b><br />5의 판별 신호와 6의 진단법이 그 지식의 전부다.<br />반면 얻는 것은 코드베이스 전체에 상시로 적용된다.</p>
<p data-ke-size="size16"><br />그리고 3에서 본 대로 생태계가 이쪽으로 적응하고 있으니,<br /><b>지금 겪는 마찰은 시간이 지나면 줄어드는 종류의 마찰</b>이다.</p>
<h2 data-ke-size="size26">9. 아직 확인 못 한 것</h2>
<p data-ke-size="size16">7의 교훈을 지키기 위해, 이번에 확인하지 못한 것을 적어 둔다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>@tanstack/react-virtual</code></b> &mdash; 레지스트리 등재 문구는 확인했지만 쓰는 곳이 없어 실물 검증은 못 했다. 위험은 <code>useVirtualizer()</code> 반환값을 <b>받는 쪽</b>에 있을 것으로 추정(2의 원리에서 유도).</li>
<li><b>RHF v8 정식 릴리스 시점</b>, 그리고 v8이 <code>watch</code> 자체를 유지하는지(콜백 API만 제거인지). 베타 문서 기준이다.</li>
<li><b>Next가 앞으로도 Babel 플러그인을 쓸지.</b> 현재는 <code>babel-plugin-react-compiler</code>를 peerDependency로 물고 SWC 파이프라인에서 돌린다. 컴파일러가 SWC에 내장되면 &sect;6의 babel 진단 하네스는 더 어긋날 수 있다.</li>
<li><b>Embla&middot;GSAP 등 명령형 인스턴스 계열</b> &mdash; 5의 원리에서 유도한 예방 지침이고, 실측 사례는 없다.</li>
</ul>
<h2 data-ke-size="size26">정리</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>컴파일러의 유일한 판단 기준은 <code>Object.is</code> 참조 비교다. 전제는 "값이 바뀌면 참조도 바뀐다".</li>
<li>폼&middot;테이블&middot;가상화 라이브러리는 정반대 전제(안정 참조 + 내부 변이 + 자체 구독)로 설계돼 있다. <b>버그가 아니라 전제 불일치다.</b></li>
<li>컴파일러 1.0의 비호환 레지스트리는 <b>3개 모듈뿐</b>이고, 그 보호도 <b>훅을 호출한 함수 한 칸</b>에만 적용된다. 심각도는 Warning이라 <b>빌드를 깨지 않는다.</b></li>
<li><b>경고 부재를 안전 신호로 읽지 말 것.</b> 레지스트리는 API 이름으로 매칭하므로, 라이브러리가 훅 이름만 바꿔도 경고가 사라진다(v8 <code>useReactTable</code> &rarr; v9 <code>useTable</code>).</li>
<li>컴파일러는 새 제약을 만든 게 아니라 <b>원래 있던 규칙 위반을 드러낸다.</b> 손 <code>useMemo</code>로도 깨지던 패턴이다.</li>
<li><b>위험한 쪽은 인스턴스를 만드는 파일이 아니라 받는 파일이다.</b></li>
<li>커스텀 훅의 반환 객체까지 메모된다. <b>리팩토링으로 잘 쪼갠 직후</b>에 이 버그가 나타난다.</li>
<li>라이브러리가 구독 수단을 제공하면 그게 정답이다(<code>useFormState</code> &middot; <code>useWatch</code> &middot; <code>Subscribe</code>). 옵트아웃 디렉티브는 구독 수단이 없을 때의 임시방편이고, <b>자식으로 전파되지 않는다.</b></li>
<li>생태계는 <b>라이브러리가 컴파일러 모델로 이사하는 방향</b>으로 수렴한다. TanStack Table v9가 반환 참조를 상태에 연동한 게 그 전형이다.</li>
<li>새 라이브러리 도입 시: 레지스트리 grep + <code>node_modules/&lt;pkg&gt;/skills/</code> 확인 + "인스턴스 메서드로 상태를 읽는가" 질문.</li>
<li><b>추측하지 말고 컴파일 결과를 뽑아 봐라.</b> 30초에 갈린다. 확인 못 한 기전은 "미확정"이라고 적어 둔다.</li>
</ul>