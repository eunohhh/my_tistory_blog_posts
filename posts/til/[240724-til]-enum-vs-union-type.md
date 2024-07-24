<h2>Enum?</h2>
<p>다음과 같은 배열이 있을때, 이것을 Enum 으로 처리할지 그냥 Union type 으로 할지 의사결정이 필요했습니다.</p>
<pre><code class="language-ts">export const buddyThemes = [
    &#39;계획&#39;,
    &#39;즉흥&#39;,
    &#39;빨리빨리&#39;,
    &#39;느긋느긋&#39;,
    &#39;촬영&#39;,
    &#39;감상&#39;,
    &#39;깔끔쟁이&#39;,
    &#39;자연인&#39;,
    &#39;가성비&#39;,
    &#39;가심비&#39;,
];
<p>export const tripThemes = [
'도시',
'자연',
'유명맛집',
'로컬맛집',
'힐링',
'액티비티',
'쇼핑',
'관광',
];</code></pre></p>
<p>TypeScript에서는 enum을 사용하여 이러한 배열을 기반으로 enum 타입을 만들 수 있다고 합니다.<br>다음은 두 배열을 기반으로 만든 enum 타입의 예시입니다.</p>
<pre><code class="language-typescript">// buddyPreferredThemes 배열과 tripThemes 배열을 기반으로 enum 타입 생성
<p>enum BuddyPreferredTheme {
Plan = '계획',
Impromptu = '즉흥',
Fast = '빨리빨리',
Slow = '느긋느긋',
Filming = '촬영',
Appreciating = '감상',
NeatFreak = '깔끔쟁이',
NatureLover = '자연인',
ValueForMoney = '가성비',
HeartSatisfaction = '가심비',
}</p>
<p>enum TripTheme {
Plan = '계획',
Impromptu = '즉흥',
Fast = '빨리빨리',
Slow = '느긋느긋',
Filming = '촬영',
Appreciating = '감상',
NeatFreak = '깔끔쟁이',
NatureLover = '자연인',
ValueForMoney = '가성비',
HeartSatisfaction = '가심비',
}</p>
<p>// 사용 예시
const myBuddyTheme: BuddyPreferredTheme = BuddyPreferredTheme.Plan;
const myTripTheme: TripTheme = TripTheme.NatureLover;</p>
<p>console.log(<code>My buddy&amp;#39;s preferred theme is ${myBuddyTheme}</code>);
console.log(<code>My trip theme is ${myTripTheme}</code>);</code></pre></p>
<p>이렇게 하면 <code>BuddyPreferredTheme</code>와 <code>TripTheme</code>이라는 두 enum 타입을 만들 수 있으며, 각각의 값들은 해당하는 한글 문자열로 매핑됩니다. 이를 통해 코드에서 더 안전하게 특정 테마를 사용할 수 있습니다.</p>
<h2>Enum vs Union type</h2>
<p>TypeScript에서 <code>enum</code>과 유니온 타입 (<code>type</code>) 중 어느 것을 사용할지 결정하는 것은 사용 사례와 필요에 따라 달라진다고 합니다. 각각의 장단점을 다음과 같다고 합니다.</p>
<h3><code>enum</code> 사용의 장점</h3>
<ol>
<li><strong>명확한 구조</strong>: <code>enum</code>은 명확한 구조와 네임스페이스를 제공합니다.</li>
<li><strong>자동 완성</strong>: IDE에서 <code>enum</code> 타입을 사용할 때 자동 완성 기능이 잘 지원됩니다.</li>
<li><strong>역방향 매핑</strong>: <code>enum</code>은 값과 이름 간의 역방향 매핑을 제공합니다.</li>
<li><strong>확장성</strong>: <code>enum</code>은 나중에 새로운 값을 추가하기 더 쉽습니다.</li>
</ol>
<h3><code>type</code>을 사용하는 경우의 장점</h3>
<ol>
<li><strong>간단함</strong>: 유니온 타입은 간단하고 코드가 짧습니다.</li>
<li><strong>타입 체킹</strong>: 유니온 타입도 강력한 타입 체킹을 제공합니다.</li>
<li><strong>타입 추론</strong>: 유니온 타입은 더 나은 타입 추론을 제공할 수 있습니다.</li>
</ol>
<h3>비교 예시</h3>
<h4>Using <code>enum</code></h4>
<pre><code class="language-typescript">enum TripTheme {
    Plan = &#39;계획&#39;,
    Impromptu = &#39;즉흥&#39;,
    Fast = &#39;빨리빨리&#39;,
    Slow = &#39;느긋느긋&#39;,
    Filming = &#39;촬영&#39;,
    Appreciating = &#39;감상&#39;,
    NeatFreak = &#39;깔끔쟁이&#39;,
    NatureLover = &#39;자연인&#39;,
    ValueForMoney = &#39;가성비&#39;,
    HeartSatisfaction = &#39;가심비&#39;,
}
<p>const myTripTheme: TripTheme = TripTheme.Plan;
console.log(myTripTheme); // 출력: 계획</code></pre></p>
<h4>Using Union Type</h4>
<pre><code class="language-typescript">type TripTheme = &#39;계획&#39; | &#39;즉흥&#39; | &#39;빨리빨리&#39; | &#39;느긋느긋&#39; | &#39;촬영&#39; | &#39;감상&#39; | &#39;깔끔쟁이&#39; | &#39;자연인&#39; | &#39;가성비&#39; | &#39;가심비&#39;;
<p>const myTripTheme: TripTheme = '계획';
console.log(myTripTheme); // 출력: 계획</code></pre></p>
<h3>선택 기준</h3>
<ul>
<li><strong>명확한 구조와 네임스페이스가 필요</strong>: <code>enum</code> 사용</li>
<li><strong>단순성과 짧은 코드</strong>: 유니온 타입 사용</li>
<li><strong>확장성과 자동 완성</strong>: <code>enum</code> 사용</li>
<li><strong>타입 추론을 최대한 활용</strong>: 유니온 타입 사용</li>
</ul>
<p>결국, 선택은 프로젝트의 요구 사항과 개인 또는 팀의 선호에 따라 달라질 수 있다고 합니다.<br>두 접근 방식 모두 올바르게 사용될 수 있으며, 사용 편의성과 확장성에 따라 선택하는 것이 좋을 것 습니다.</p>
<h2>배열을 기반으로 타입을 생성하기</h2>
<p>TypeScript에서는 배열을 기반으로 유니온 타입을 생성하는 방법도 있습니다.</p>
<p>이를 위해 배열의 각 요소를 리터럴 타입으로 변환한 후, 이를 유니온 타입으로 결합하는 방법을 사용할 수 있습니다.<br>아래는 이러한 방법을 사용하는 예시입니다:</p>
<h3>예시 코드</h3>
<ol>
<li><p><strong>배열 정의</strong>:</p>
<pre><code class="language-typescript"> const tripThemes = [
     &#39;계획&#39;,
     &#39;즉흥&#39;,
     &#39;빨리빨리&#39;,
     &#39;느긋느긋&#39;,
     &#39;촬영&#39;,
     &#39;감상&#39;,
     &#39;깔끔쟁이&#39;,
     &#39;자연인&#39;,
     &#39;가성비&#39;,
     &#39;가심비&#39;,
 ] as const;</code></pre>
</li>
<li><p><strong>유니온 타입 생성</strong>:</p>
<pre><code class="language-typescript"> type TripTheme = typeof tripThemes[number];</code></pre>
</li>
</ol>
<p><code>as const</code>를 사용하여 배열을 리터럴 타입으로 만들고, <code>typeof</code>와 인덱스 접근 (<code>[number]</code>)을 사용하여 배열의 모든 요소를 유니온 타입으로 결합합니다.</p>
<h3>전체 코드</h3>
<pre><code class="language-typescript">const tripThemes = [
    &#39;계획&#39;,
    &#39;즉흥&#39;,
    &#39;빨리빨리&#39;,
    &#39;느긋느긋&#39;,
    &#39;촬영&#39;,
    &#39;감상&#39;,
    &#39;깔끔쟁이&#39;,
    &#39;자연인&#39;,
    &#39;가성비&#39;,
    &#39;가심비&#39;,
] as const;
<p>type TripTheme = typeof tripThemes[number];</p>
<p>// 사용 예시
const myTripTheme: TripTheme = '계획';
console.log(myTripTheme); // 출력: 계획</code></pre></p>
<h3>설명</h3>
<ul>
<li><strong><code>as const</code></strong>: 배열의 요소들을 리터럴 타입으로 고정합니다. 이를 통해 배열의 각 요소가 정확한 문자열 리터럴 타입으로 취급됩니다.</li>
<li><strong><code>typeof tripThemes[number]</code></strong>: 배열의 각 요소 타입을 추출하여 유니온 타입으로 만듭니다.</li>
</ul>
<p>이 방법을 사용하면 배열을 기반으로 자동으로 유니온 타입을 생성할 수 있으며, 배열의 요소가 변경되면 유니온 타입도 자동으로 업데이트됩니다.</p>