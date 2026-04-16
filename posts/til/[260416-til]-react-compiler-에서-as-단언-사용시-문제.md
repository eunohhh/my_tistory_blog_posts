<h1>React Compiler 환경에서 <code>as</code> 단언이 메모이제이션을 깨뜨린다?</h1>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>TL;DR</b></p>
<p data-ke-size="size16"><code>reactCompiler: true</code> 환경에서 <code>(data ?? []) as 타입[]</code> 처럼 <br />assertion을 썼는데 TanStack Query 응답이 바뀌어도 화면이 갱신되지 않는 버그가 발생했다.<br /><br /></p>
<p data-ke-size="size16"><code>const 변수: 타입[] = data ?? []</code> 처럼 변수 타입 어노테이션으로 바꾸니 해결됐다.<br />원인은 단순하지 않고 세 가지 요인이 결합된 결과였다.</p>
</blockquote>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">1. 문제를 만난 상황</h2>
<p data-ke-size="size16">Next.js + React Compiler 19.2.4 + TanStack Query + TanStack Table 조합으로<br />작업 중에 이상한 증상을 만났다.</p>
<pre class="haskell"><code>const { data: response, isLoading } = useChannelsList(params, {
  placeholderData: keepPreviousData,
  enabled: !storeState.isOpen,
});
<p>const channels = (response?.data ?? []) as Channel[];</code></pre></p>
<p data-ke-size="size16"><br />증상은 이랬다:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>✅ Network 탭에서 fetch 요청은 정상적으로 날아감</li>
<li>✅ TanStack Query devtools에서 <code>response</code>에 새 데이터가 들어온 것 확인</li>
<li>✅ TanStack Table 컴포넌트 내부에서 <code>console.log</code>로 <code>channels</code>에 최신 데이터가 찍힘</li>
<li>❌ <b>그런데 화면(DOM)은 이전 데이터 그대로</b></li>
</ul>
<p data-ke-size="size16">"데이터는 오고 있는데 렌더가 안 된다"는 가장 디버깅하기 싫은 상황이었다.<br />React DevTools Profiler로 보면 컴포넌트 함수는 실행되는데 결과물은 stale한 상태였다.</p>
<h2 data-ke-size="size26">2. 해결한 방법</h2>
<p data-ke-size="size16">우연히 타입 정비 작업을 하다가 발견했다.<br /><code>as</code> 캐스트를 제거하고 변수 타입 어노테이션으로 바꾸니 정상 동작했다.</p>
<pre class="kotlin"><code>// ❌ Before: as 단언 &mdash; 화면이 갱신되지 않음
const channels = (response?.data ?? []) as Channel[];
<p>// ✅ After: 타입 어노테이션 — 정상 동작
const channels: ChannelListItem[] = response?.data ?? [];</code></pre></p>
<p data-ke-size="size16"><br />이 발견을 계기로 전체 코드베이스의 타입 체인을 정비했다:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>types/apis</code>: <code>ChannelSearchData</code> &rarr; <code>ChannelListItem</code>으로 이름 변경 (더 명확한 의미)</li>
<li><code>channel-table-columns</code>: <code>ColumnDef&lt;Channel&gt;</code> &rarr; <code>ColumnDef&lt;ChannelListItem&gt;</code></li>
<li><code>Table</code>, <code>TableBody</code>: <code>Channel</code> 하드코딩 &rarr; 제네릭 <code>&lt;TRow extends { id: string }&gt;</code>로</li>
<li><code>TableBottomHeader</code>: 제네릭화</li>
<li><code>cart-store</code>: items 타입 <code>Channel</code> &rarr; <code>ChannelListItem</code></li>
<li><code>cart-toggle-button</code>, <code>cart-select-all-button</code>: <code>ChannelListItem</code> 타입 적용</li>
<li><code>creator-modal-store</code>: <code>channel: Channel</code> &rarr; <code>channelId: string</code><br />(목록에서는 서머리만 가지고 있으므로, ID만 전달하고 모달에서 상세 조회)</li>
<li><code>creator-modal</code> 하위 컴포넌트: <code>channelId</code> 기반으로 <code>useChannelDetail</code> 연동</li>
<li><code>mix</code> 컴포넌트: 변경된 <code>Table</code> 제네릭에 맞춰 타입 적용</li>
</ul>
<p data-ke-size="size16">단순한 우회였지만, "왜 <code>as</code>가 문제를 만들었는가?"가<br />계속 궁금해서 Claude와 함께 근본 원인을 파헤쳐봤다.</p>
<h2 data-ke-size="size26">3. 함께 연구하며 밝혀낸 문제 &mdash; 세 가지 요인의 결합</h2>
<p data-ke-size="size16">결론부터 말하면, 이건 <b>단일 버그가 아니라 세 가지 요인이 결합된 결과</b>였다.</p>
<h3 data-ke-size="size23">요인 ①: <code>as</code> 단언은 AST에서 표현식을 감싸는 래퍼 노드다</h3>
<p data-ke-size="size16"><code>as</code> 단언과 타입 어노테이션은 의미상 비슷해 보이지만, <b>Babel AST 구조가 완전히 다르다</b>.</p>
<p data-ke-size="size16"><b><code>as</code> 단언 패턴</b> (<code>const channels = (response?.data ?? []) as Channel[]</code>):</p>
<pre class="reasonml"><code>VariableDeclarator
├── id: Identifier("channels")
└── init: TSAsExpression                  &larr; 표현식을 감싸는 래퍼 노드
    ├── expression: LogicalExpression(??)  &larr; 실제 연산
    │   ├── left: OptionalMemberExpression(response?.data)
    │   └── right: ArrayExpression([])
    └── typeAnnotation: TSTypeReference("Channel[]")</code></pre>
<p data-ke-size="size16"><b>타입 어노테이션 패턴</b> (<code>const channels: ChannelListItem[] = response?.data ?? []</code>):</p>
<pre class="groovy"><code>VariableDeclarator
├── id: Identifier("channels")
│   └── typeAnnotation: TSTypeAnnotation  &larr; 변수 이름에 부착된 메타데이터
└── init: LogicalExpression(??)           &larr; 깨끗한 표현식, 래퍼 없음</code></pre>
<p data-ke-size="size16"><br />핵심 차이: <code>VariableDeclarator.init</code>이</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>as</code> 패턴에서는 <code>TSAsExpression</code> (실제 표현식을 감싼 래퍼)</li>
<li>어노테이션 패턴에서는 바로 <code>LogicalExpression</code> (깨끗한 표현식)</li>
</ul>
<p data-ke-size="size16"><b><code>as</code>는 표현식 레벨에서 작동하는 래핑 노드</b>이므로 컴파일러의 표현식 처리 파이프라인에 직접 개입하지만, 타입 어노테이션은 식별자의 메타데이터에 불과해서 표현식 분석에 관여하지 않는다.</p>
<h3 data-ke-size="size23">요인 ②: React Compiler는 TypeScript 스트리핑보다 먼저 실행된다</h3>
<p data-ke-size="size16">이게 핵심적인 아키텍처 사실이다. React 공식 문서:</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">"React Compiler must run <b>first</b> in your Babel plugin pipeline."<br /><br /></p>
</blockquote>
<p data-ke-size="size16">Babel의 실행 순서 규칙상 <b>플러그인이 프리셋보다 먼저</b> 실행된다.<br />따라서 <code>babel-plugin-react-compiler</code>(플러그인)는 <code>@babel/preset-typescript</code>(프리셋)보다 먼저 돈다.<br /><br />Next.js의 <code>reactCompiler: true</code>도 마찬가지로, SWC가 컴파일러 적용 대상 파일을 식별한 뒤 Babel 플러그인을 돌리는데 이때 TypeScript 문법이 <b>아직 제거되지 않은 상태</b>다.<br /><br /></p>
<p data-ke-size="size16">그 결과 <b>React Compiler는 <code>TSAsExpression</code>, <code>TSNonNullExpression</code>, <code>TSSatisfiesExpression</code> 등 TypeScript 전용 AST 노드를 직접 처리해야 한다.</b> 컴파일러 내부 파이프라인은 이렇다:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>BuildHIR</b> &mdash; Babel AST를 HIR(제어 흐름 그래프 + SSA)로 변환</li>
<li><b>SSA 변환</b> &mdash; 각 변수 할당에 고유 식별자 부여</li>
<li><b>타입 추론</b> &mdash; 컴파일러 자체 타입 시스템 (TS 타입 정보는 사용 안 함)</li>
<li><b>효과 분석</b> &mdash; Read/Store/Capture/Mutate/Freeze 효과 추론</li>
<li><b>리액티브 분석</b> &mdash; 렌더 간 변경 가능한 값 식별</li>
<li><b>스코프 발견</b> &mdash; 리액티브 스코프 그룹핑/병합</li>
<li><b>코드 생성</b> &mdash; <code>useMemoCache</code> 기반 최적화 코드 출력</li>
</ol>
<p data-ke-size="size16"><code>TSAsExpression</code>을 처리하긴 한다.<br />BuildHIR의 <code>lowerExpression</code>에서 내부 표현식을 재귀적으로 내려간다.</p>
<pre class="nimrod"><code>case "TSAsExpression":
case "TSSatisfiesExpression": {
  let expr = exprPath as NodePath&lt;t.TSAsExpression | t.TSSatisfiesExpression&gt;;
  return lowerExpression(builder, expr.get("expression"));
}</code></pre>
<p data-ke-size="size16">그런데 이 과정에서 <code>TypeCastExpression</code>이라는 <b>HIR 중간 명령어</b>를 생성한다 (PR #32742 참고):</p>
<pre class="css"><code>interface TypeCastExpression {
  kind: "TypeCastExpression";
  value: Place;
  typeAnnotation: t.FlowType | t.TSType;
  typeAnnotationKind: 'cast' | 'as' | 'satisfies';
}</code></pre>
<p data-ke-size="size16"><br />이 <code>TypeCastExpression</code> 명령어는 HIR의 나머지 파이프라인을 <b>모두 통과한다</b>.<br /><br /></p>
<p data-ke-size="size16">SSA 변환에서 새 식별자를 받고, 효과 분석에서 효과가 추론되고,<br />리액티브 분석에서 리액티브 여부가 판정되고, 스코프 발견에서 특정 스코프에 배치된다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>중간 명령어가 하나 더 존재한다는 사실이 리액티브 스코프 경계 계산에 영향을 줄 수 있다.</b></p>
<p data-ke-size="size16">타입 어노테이션 패턴에서는 이 중간 단계 자체가 없다.<br /><br /><code>init</code>이 바로 <code>LogicalExpression</code>이니 HIR에서 데이터 흐름이 직접적이고 투명하다.</p>
<h3 data-ke-size="size23">요인 ③: 독립 리액티브 스코프의 <code>===</code> 비교가 무력화된다</h3>
<p data-ke-size="size16">React Compiler가 생성하는 코드를 보면 "실행되지만 갱신 안 됨" 증상을 정확히 설명할 수 있다.<br />컴파일러는 각 리액티브 스코프를 <b>독립 캐시 슬롯</b>으로 변환한다:</p>
<pre class="gams"><code>const $ = c(6); // 6개 캐시 슬롯
<p>// 스코프 1: channels 계산
let channels;
if ($[0] !== response) {
channels = response?.data ?? [];
$[0] = response;
$[1] = channels;
} else {
channels = $[1]; // 캐시 반환
}</p>
<p>// 스코프 2: JSX 렌더링
let t0;
if ($[2] !== channels) {  // ← 이 의존성 검사가 핵심
t0 = &lt;Table data={channels} /&gt;;
$[2] = channels;
$[3] = t0;
} else {
t0 = $[3]; // 캐시된 JSX 반환 → DOM 갱신 안 됨!
}</code></pre></p>
<p data-ke-size="size16"><br />각 스코프는 <code>===</code> 동등 비교로 의존성 변경을 감지한다.<br /><b><code>as</code> 단언이 만든 <code>TypeCastExpression</code> 중간 명령어가 스코프 경계를 바꿔서,<br />JSX 스코프의 의존성 목록에서 <code>channels</code>(또는 상위 리액티브 소스인 <code>response</code>)가 누락된다면</b>,<br />JSX 스코프는 항상 캐시된 결과를 반환한다.</p>
<p data-ke-size="size16">이게 내가 본 증상과 정확히 일치한다:</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>관찰</th>
<th>설명</th>
</tr>
</thead>
<tbody>
<tr>
<td>Network fetch 정상</td>
<td>useQuery는 정상 동작</td>
</tr>
<tr>
<td><code>response</code>에 새 데이터 존재</td>
<td>TanStack Query의 structural sharing 정상</td>
</tr>
<tr>
<td><code>console.log</code>에 최신 데이터 출력</td>
<td>컴포넌트 함수는 실행됨 (스코프 1은 정상)</td>
</tr>
<tr>
<td>DOM 미갱신</td>
<td><b>JSX 스코프(스코프 2)가 의존성 변경을 감지 못함 &rarr; 캐시 반환</b></td>
</tr>
</tbody>
</table>
<h3 data-ke-size="size23">추가 요인: TanStack Table의 내부 가변성</h3>
<p data-ke-size="size16">설상가상으로 TanStack Table은 <b>React Compiler와 공식 비호환</b>이다.<br />React 팀은 <code>DefaultModuleTypeProvider.ts</code>의 블록리스트에 TanStack Table을 추가했다 (PR #31820, #34027). <br />공식 문서도 "incompatible library"로 명시한다.<br /><br /></p>
<p data-ke-size="size16">핵심 문제는 <b>내부 가변성(interior mutability)</b>이다. <code>useReactTable()</code>이 반환하는 테이블 인스턴스는 외부 참조는 동일하게 유지하면서 내부 상태만 변경한다. React Compiler의 <code>===</code> 비교로는 이 변경을 감지할 수 없다.</p>
<p data-ke-size="size16"><br />관련 이슈들:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>facebook/react#33057</code> &mdash; "React Compiler breaks most functionality of TanStack Table"</li>
<li><code>TanStack/table#5567</code> &mdash; "Table doesn't re-render with new React Compiler + React 19"</li>
<li><code>TanStack/query#9571</code> &mdash; "Referential stability lost when using react-compiler"</li>
<li><code>facebook/react#34211</code> &mdash; "breaks referential stability in @tanstack/react-query"</li>
</ul>
<p data-ke-size="size16">내 상황에서는 <b>두 문제가 결합</b>되어 있었다.<br /><code>as</code> 단언이 리액티브 스코프 추적을 교란했고, TanStack Table의 내부 가변성이 <code>===</code> 비교를 무력화했다.<br /><br />타입 어노테이션으로 전환하면서 첫 번째 문제가 해소되어 컴파일러가 의존성을 올바르게 추적하게 됐고, 적어도 <code>channels</code> 배열의 참조 변경은 정상 감지된 것이다.</p>
<h3 data-ke-size="size23">컴파일러의 TypeScript 처리에는 역사적 공백이 있다</h3>
<p data-ke-size="size16">이 문제는 React Compiler가 TypeScript AST 노드를 완벽하게 처리하지 못한다는 더 큰 패턴의 일부다:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>TSSatisfiesExpression</code>은 2025년 3월에야 추가됨.</b> Issue #29754(2024년 6월)에서 <code>satisfies</code> 연산자가 BuildHIR에서 처리 안 되어 bailout 발생 보고 &rarr; PR #32742로 약 9개월 뒤 수정.</li>
<li><b><code>TSInstantiationExpression</code>은 현재까지도 미처리</b> (Issue #34358, #31745). <code>lowerReorderableExpression</code>에서 "cannot be safely reordered" 에러.</li>
<li><b>reactwg/react-compiler Discussion #34</b>: <code>TSAsExpression</code>이 ObjectExpression 키 위치에 사용될 때 bailout 발생 보고.</li>
</ul>
<p data-ke-size="size16">이 패턴의 배경은 React Compiler가 <b>Meta 내부에서 Flow 타입 시스템 기반으로 개발</b>되었다는 점이다.<br />공식 문서도 인정한다:</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16">"While the compiler does not currently use type information from typed JavaScript languages like TypeScript or Flow, internally it has its own type system."<br /><br /></p>
</blockquote>
<p data-ke-size="size16">TypeScript 지원은 점진적으로 추가되고 있고, <code>lowerExpression</code>과 <code>lowerReorderableExpression</code> 등 <b>서로 다른 코드 경로에서 동일한 TS 노드 타입이 일관되게 처리되지 않는</b> 경우가 존재한다.</p>
<h2 data-ke-size="size26">4. 결론 &amp; 교훈</h2>
<h3 data-ke-size="size23">교훈</h3>
<p data-ke-size="size16"><b>React Compiler 환경에서는 <code>as</code> 캐스트 대신 그냥 변수 타입 어노테이션을 사용하자.</b><br />이건 단순한 스타일 권장사항이 아니라 <b>AST 구조적으로 컴파일러의 표현식 분석 파이프라인에 개입하지 않는 유일한 방법</b>이다.</p>
<pre class="kotlin"><code>// ✅ 권장: 타입 어노테이션 (AST에서 init 표현식이 깨끗)
const channels: ChannelListItem[] = response?.data ?? [];
<p>// ✅ 대안: 제네릭 타입 파라미터로 해결
const { data: response } = useChannelsList&lt;ChannelListResponse&gt;(params, options);
// response.data가 이미 올바른 타입을 가지므로 캐스트 불필요</p>
<p>// ⚠️ satisfies: TypeCastExpression 명령어를 동일하게 생성 → 같은 위험 존재
const channels = (response?.data ?? []) satisfies Channel[];</p>
<p>// ❌ 문제: as 단언 (TSAsExpression 래퍼 노드가 init을 감싸고, TypeCastExpression 생성)
const channels = (response?.data ?? []) as Channel[];</code></pre></p>
<p data-ke-size="size16"><br />TanStack Table과 같이 쓰는 경우 <b><code>'use no memo'</code> 디렉티브로 해당 컴포넌트를 컴파일러 최적화에서 제외</b>하는 것도 고려 대상이다.</p>
<pre class="oxygene"><code>'use no memo'; // 이 컴포넌트에 대해 React Compiler 비활성화
<p>function ChannelTable({ params }: Props) {
const { data: response } = useChannelsList(params, { ... });
const channels: ChannelListItem[] = response?.data ?? [];
const table = useReactTable({ data: channels, ... });
// ...
}</code></pre></p>
<h3 data-ke-size="size23">이슈 제출 가능성</h3>
<p data-ke-size="size16">재현 가능한 최소 예제를 만들 수 있다면 <code>facebook/react</code> 레포지토리에 <code>Component: React Compiler</code> 태그로 이슈를 제출할 만한 내용이다. TypeScript 표현식 래퍼 노드의 처리는 역사적으로 점진적 개선이 이루어져 온 영역이고, <b>이 특정 상호작용(<code>as</code> 단언 + <code>??</code> + TanStack Query response)은 아직 공식 이슈로 보고되지 않은 것으로 보인다.</b></p>
<p data-ke-size="size16">최소 재현 예제를 만든다면:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Playground(<a href="https://playground.react.dev/)%EC%97%90%EC%84%9C">https://playground.react.dev/)에서</a> 두 패턴의 컴파일 결과 차이를 캡처</b> &mdash; 실제로 생성되는 캐시 슬롯과 의존성 배열의 차이를 직접 비교</li>
<li><b>TanStack Query/Table을 배제한 순수 재현</b> &mdash; React state만 사용해서 <code>as</code>만으로 재현되는지 확인</li>
<li><b>최소 조건 좁히기</b> &mdash; optional chaining 없이도 재현되는지, nullish coalescing 없이도 재현되는지 하나씩 제거해보며 최소 트리거 조건 파악</li>
</ol>
<p data-ke-size="size16">만약 순수 재현이 안 되고 TanStack Query/Table과 결합해야만 재현된다면, 그 자체가 이슈 내용의 일부가 된다 ("세 요인의 결합 버그"). React 팀은 bailout 보고를 환영하는 분위기고, <code>__unstable_donotuse_reportAllBailouts</code> 같은 디버깅 도구도 제공하고 있다.</p>
<h3 data-ke-size="size23">상위 레벨 교훈</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>React Compiler는 <b>계속 개선 중</b>이다. TypeScript 노드 처리의 완성도가 2025년 3월 이후로도 꾸준히 발전하고 있다.</li>
<li>TanStack Table은 React Compiler와 <b>아직 함께 쓰기엔 조심해야 한다</b>. 공식 비호환 라이브러리 목록에 있다.</li>
<li>데이터는 오는데 화면이 안 바뀌면 <b>컴파일러 레벨의 메모이제이션 버그</b>를 의심하자. React DevTools Profiler의 "Why did this render?" 기능으로 진단 가능하다.</li>
<li>타입 체계를 깨끗하게 유지하는 것(<code>as</code> 남용 피하기, 제네릭 활용)은 가독성/안전성뿐 아니라 <b>컴파일러 최적화의 정확성에도 영향을 준다</b>.</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">5. 참조 리스트</h2>
<h3 data-ke-size="size23">React Compiler 공식 문서</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://react.dev/learn/react-compiler/introduction">React Compiler Introduction</a></li>
<li><a href="https://react.dev/learn/react-compiler/installation">React Compiler Installation</a></li>
<li><a href="https://react.dev/learn/react-compiler/debugging">React Compiler Debugging</a></li>
<li><a href="https://react.dev/blog/2025/10/07/react-compiler-1">React Compiler v1.0 Release Blog</a></li>
<li><a href="https://react.dev/reference/eslint-plugin-react-hooks/lints/incompatible-library">incompatible-library ESLint rule</a></li>
<li><a href="https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler">Next.js: reactCompiler config</a></li>
</ul>
<h3 data-ke-size="size23">내부 설계 문서</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://github.com/facebook/react/blob/main/compiler/docs/DESIGN_GOALS.md">React Compiler DESIGN_GOALS.md</a></li>
<li><a href="https://github.com/reactwg/react-compiler/discussions/5">Introducing React Compiler (reactwg)</a></li>
<li><a href="https://github.com/reactwg/react-compiler/discussions/34"><code>__unstable_donotuse_reportAllBailouts</code> 논의</a></li>
</ul>
<h3 data-ke-size="size23">관련 GitHub 이슈 및 PR</h3>
<p data-ke-size="size16"><b>TypeScript 노드 처리 관련:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://github.com/facebook/react/pull/32742">PR #32742 &mdash; feat(babel-plugin-react-compiler): support satisfies operator</a></li>
<li><a href="https://github.com/facebook/react/issues/29754">Issue #29754 &mdash; Handle TSSatisfiesExpression expressions</a></li>
<li><a href="https://github.com/facebook/react/issues/34358">Issue #34358 &mdash; TSInstantiationExpression as default value in parameter list</a></li>
</ul>
<p data-ke-size="size16"><b>TanStack Table / Query 호환성 관련:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://github.com/facebook/react/issues/33057">facebook/react#33057 &mdash; React Compiler breaks most functionality of TanStack Table</a></li>
<li><a href="https://github.com/facebook/react/issues/34211">facebook/react#34211 &mdash; breaks referencial stability in @tanstack/react-query</a></li>
<li><a href="https://github.com/facebook/react/pull/31820">PR #31820 &mdash; add tanstack table and virtual to known incompat libraries</a></li>
<li><a href="https://github.com/TanStack/table/issues/5567">TanStack/table#5567 &mdash; Table doesn't re-render with new React Compiler + React 19</a></li>
<li><a href="https://github.com/TanStack/table/issues/6137">TanStack/table#6137 &mdash; React Compiler skips memoization for useReactTable</a></li>
<li><a href="https://github.com/TanStack/query/issues/9571">TanStack/query#9571 &mdash; Referencial stability lost when using react-compiler</a></li>
</ul>
<h3 data-ke-size="size23">도구</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://playground.react.dev/">React Compiler Playground</a></li>
<li><a href="https://babeljs.io/docs/babel-types">Babel <code>@babel/types</code> (TSAsExpression 노드 정의)</a></li>
</ul>
<h3 data-ke-size="size23">참고한 분석 글</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://yongseok.me/blog/en/react_compiler_3/">Yongseok Jang &mdash; React Compiler, How Does It Work? [3] HIR Transformation</a></li>
<li><a href="https://yongseok.me/blog/en/react_compiler_4/">Yongseok Jang &mdash; React Compiler, How Does It Work? [4] SSA Transformation</a></li>
<li><a href="https://shapkarin.me/articles/drop-react-manual-memoization/">Yuri Shapkarin &mdash; The Mutability &amp; Aliasing Model in React</a></li>
<li><a href="https://anita-app.com/blog/articles/react-compiler-and-why-class-objects-work-against-memoization.html">Anita &mdash; React Compiler and why class objects can work against memoization</a></li>
<li><a href="https://gitnation.com/contents/react-compiter-internals">Lydia Hallie &mdash; React Compiler Internals (GitNation talk)</a></li>
</ul>