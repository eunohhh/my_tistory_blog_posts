<h2 data-ke-size="size26">cva with 타입스크립트?</h2>
<p data-ke-size="size16">포켓몬 도감 비스무리한 개인과제 프로젝트를 하면서,<br />cva 라이브러리를 사용 중에 타입지정에 매우 애를 먹었습니다.</p>
<p data-ke-size="size16"><br />원래 이렇게 쓰는건가 싶습니다...? 더 공부해봐야겠습니다 ㅠㅠ</p>
<p data-ke-size="size16">아래의 예는 포켓몬의 타입 18개에만 해당하는 것이라 문제가 덜하지만<br />속성인지 뭔지는 게임의 세대가 변화될때마다 추가되어서 뭐 몇개인지도 모르겠어요.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이것을 다 리터럴 타입으로 지정하자니 너무 힘들고 해서 mapped type 을 사용하긴 했는데<br />되는건지 뭔지 모르겠습니다?</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">관련 내용을 정리합니다.</p>
<h2 data-ke-size="size26">cva chip 컴포넌트 만들기</h2>
<p data-ke-size="size16">포켓몬의 18가지 타입에 맞는 <code>Chip</code> 컴포넌트를 만들기 위해 기존의 <code>chipVariants</code> 객체에 포켓몬 타입별 색상을 추가합니다.</p>
<p data-ke-size="size16">각각의 타입에 적절한 배경색, 테두리색, 텍스트 색을 지정하여 포켓몬 타입에 맞는 시각적 효과를 줄 수 있습니다.</p>
<p data-ke-size="size16">포알못이라 대강 했습니다. 하드코딩...</p>
<pre class="dts"><code>import { cva, VariantProps } from "class-variance-authority";
<p>const chipVariants = cva(
[
&quot;text-sm border&quot;,
&quot;rounded-full&quot;,
&quot;px-2.5&quot;,
&quot;py-0.5&quot;,
&quot;hover:opacity-70&quot;,
&quot;transition-opacity&quot;,
],
{
variants: {
intent: {
primary: &quot;bg-blue-500 border-blue-500 text-white&quot;,
secondary: &quot;bg-gray-500 border-gray-500 text-white&quot;,
danger: &quot;bg-red-500 border-red-500 text-white&quot;,
warning: &quot;bg-yellow-500 border-yellow-500 text-white&quot;,
info: &quot;bg-violet-500 border-violet-500 text-white&quot;,
success: &quot;bg-green-500 border-green-500 text-white&quot;,
default: &quot;bg-white border-black text-black&quot;,
normal: &quot;bg-gray-400 border-gray-400 text-white&quot;,
fire: &quot;bg-red-600 border-red-600 text-white&quot;,
water: &quot;bg-blue-600 border-blue-600 text-white&quot;,
electric: &quot;bg-yellow-400 border-yellow-400 text-black&quot;,
grass: &quot;bg-green-500 border-green-500 text-white&quot;,
ice: &quot;bg-blue-300 border-blue-300 text-black&quot;,
fighting: &quot;bg-orange-700 border-orange-700 text-white&quot;,
poison: &quot;bg-purple-500 border-purple-500 text-white&quot;,
ground: &quot;bg-yellow-700 border-yellow-700 text-white&quot;,
flying: &quot;bg-indigo-400 border-indigo-400 text-white&quot;,
psychic: &quot;bg-pink-500 border-pink-500 text-white&quot;,
bug: &quot;bg-green-700 border-green-700 text-white&quot;,
rock: &quot;bg-yellow-800 border-yellow-800 text-white&quot;,
ghost: &quot;bg-purple-700 border-purple-700 text-white&quot;,
dragon: &quot;bg-indigo-700 border-indigo-700 text-white&quot;,
dark: &quot;bg-gray-800 border-gray-800 text-white&quot;,
steel: &quot;bg-gray-500 border-gray-500 text-white&quot;,
fairy: &quot;bg-pink-300 border-pink-300 text-black&quot;,
},
},
defaultVariants: {
intent: &quot;default&quot;,
},
}
);</p>
<p>type ChipVariantsType = VariantProps&lt;typeof chipVariants&gt;;</p>
<p>type ChipProps = {
label: string;
intent?: string;
} &amp; ChipVariantsType;</p>
<p>function Chip({ intent = &quot;default&quot;, label }: ChipProps) {
return &lt;div className={chipVariants({ intent })}&gt;{label}&lt;/div&gt;;
}</p>
<p>export default Chip;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위 코드에서 포켓몬의 18가지 타입에 맞는 색상을 <code>chipVariants</code> 객체의 <code>intent</code> 속성에 추가했습니다.</p>
<p data-ke-size="size16"><code>Chip</code> 컴포넌트는 <code>intent</code> 속성을 받아 해당 타입의 색상으로 렌더링합니다.</p>
<p data-ke-size="size16">여기서 아래쪽 타입 부분만 기억하면 될 것 같습니다.</p>
<pre class="rust"><code>type ChipVariantsType = VariantProps&lt;typeof chipVariants&gt;;</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이렇게 VariantProps 를 이용해서 지정하면 된다고 하네요.</p>
<h2 data-ke-size="size26">포켓몬 특성이 너무 많잖아? 어떡하지</h2>
<p data-ke-size="size16">타입은 18개지만 특성은 진짜 너무 많습니다. 리터럴 타입으로 전부 대응하자니 너무 힘들고<br />아래처럼 처리하려 했지만 <code>chipVariants.variants.intent;</code> 이 부분에서 variants 가 없고 어쩌고 에러 납니다.</p>
<pre class="fortran"><code>function AbilitiesChip({ intent = "default", label }: ChipProps) {
<pre><code>// 아래 구문은 사실상 사용 불가
const isValidIntent = (intent: string): intent is keyof typeof 
    chipVariants.variants.intent =&amp;gt; intent in chipVariants.variants.intent;

return &amp;lt;div className={chipVariants({ 
    intent: isValidIntent(intent) ? intent : &quot;default&quot; })}&amp;gt;{label}&amp;lt;/div&amp;gt;;
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">결국 이래저래 해메이다가 하드코딩으로 해결했습니다 ^0^~~ ㅠㅠ</p>
<pre class="javascript"><code>export type PokemonAbility =
    | "air-lock"
    | "arena-trap"
    // 중략 .... 너무많음 뭐 이렇게 많아!
    | "unburden";
<p>const chipVariants = cva(
[
&quot;text-sm border&quot;,
&quot;rounded-full&quot;,
&quot;px-2.5&quot;,
&quot;py-0.5&quot;,
&quot;hover:opacity-70&quot;,
&quot;transition-opacity&quot;,
],
{
variants: {
intent: {
&quot;air-lock&quot;: &quot;bg-blue-100 border-blue-100 text-blue-900&quot;,
// 중략: 다른 variants.intent 속성들 역시 너무 많음 위 타입과 일치해야함
&quot;unaware&quot;: &quot;bg-blue-900 border-blue-900 text-blue-900&quot;,
&quot;unburden&quot;: &quot;bg-blue-900 border-blue-900 text-blue-900&quot;,
},
},
defaultVariants: {
intent: &quot;default&quot;,
},
}
);</p>
<p>type ChipVariantsType = VariantProps&lt;typeof chipVariants&gt;;</p>
<p>type ChipProps = {
label: string;
intent?: string;
} &amp; ChipVariantsType;</p>
<p>function isValidIntent(intent: string): intent is PokemonAbility {
const validIntents: PokemonAbility[] = [
&quot;air-lock&quot;, &quot;arena-trap&quot;, &quot;battle-armor&quot;, &quot;blaze&quot;, &quot;cacophony&quot;,
&quot;chlorophyll&quot;, &quot;clear-body&quot;, &quot;cloud-nine&quot;, &quot;color-change&quot;,
// 결국 이런식으로 해결 야호~~~~~~~~~~~~
&quot;solid-rock&quot;, &quot;stall&quot;, &quot;steadfast&quot;, &quot;storm-drain&quot;, &quot;super-luck&quot;,
&quot;tangled-feet&quot;, &quot;technician&quot;, &quot;tinted-lens&quot;, &quot;unaware&quot;, &quot;unburden&quot;
];
return validIntents.includes(intent as PokemonAbility);
}</p>
<p>function AbilitiesChip({ intent = &quot;default&quot;, label }: ChipProps) {
return &lt;div className={chipVariants({ intent: isValidIntent(intent) ? intent : &quot;default&quot; })}&gt;{label}&lt;/div&gt;;
}</p>
<p>export default AbilitiesChip;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b><i>*사실 이럴바에는 pokemonAbility 를 배열로 만들어놓고 아래처럼 하는게 현명할 것입니다!!</i></b></p>
<h2 data-ke-size="size26">const assertions</h2>
<pre class="typescript"><code>export const abilities = [
    "air-lock", "arena-trap", "battle-armor",
    // 기타 등등....
] as const;
<p>export type PokemonAbilityTypes = typeof abilites[number];</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">아래는 제가 지피티 쌤과 나눈 대화를 정리합니다.</p>
<h2 data-ke-size="size26">맵드타입을 제가 잘 의도하고 쓴 것 맞나요?</h2>
<pre class="routeros"><code>export type PokemonMapped&lt;T&gt; = {
    [Property in keyof T]: T[Property];
};</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">맵드 타입의 기본 개념은 TypeScript에서 주어진 타입의 모든 속성을 순회하면서 새로운 타입을 생성하는 것입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>PokemonMapped&lt;T&gt;</code>는 주어진 타입 <code>T</code>의 속성을 그대로 유지하는 새로운 타입을 정의하는 것으로 보입니다. 그러나 이 경우 맵드 타입의 사용이 필요하지 않습니다. 왜냐하면 주어진 타입 <code>T</code>를 그대로 반환하는 것과 동일하기 때문입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">맵드 타입은 속성의 타입을 변경하거나 속성 이름을 변경하는 등의 작업에 유용하게 사용됩니다. 따라서 현재 예제는 의미가 없고, 단순히 <code>T</code> 타입을 반환하는 것과 동일합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">하지만 만약 속성의 타입을 변경하거나 추가적인 변환을 하고 싶다면 맵드 타입을 사용하는 것이 맞습니다. 예를 들어, <code>T</code> 타입의 모든 속성을 선택적으로 만드는 맵드 타입은 다음과 같습니다:</p>
<pre class="routeros"><code>export type PokemonMapped&lt;T&gt; = {
    [Property in keyof T]?: T[Property];
};</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 <span style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Apple SD Gothic Neo', Arial, sans-serif; letter-spacing: 0px;">예제에서는 </span><code style="letter-spacing: 0px;">PokemonMapped&lt;T&gt;</code><span style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Apple SD Gothic Neo', Arial, sans-serif; letter-spacing: 0px;"> 타입이 </span><code style="letter-spacing: 0px;">T</code><span style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Apple SD Gothic Neo', Arial, sans-serif; letter-spacing: 0px;"> 타입의 모든 속성을 선택적으로 만듭니다. 이는 원래 타입의 모든 속성을 </span><code style="letter-spacing: 0px;">optional</code><span style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Apple SD Gothic Neo', Arial, sans-serif; letter-spacing: 0px;">로 만들고자 할 때 유용합니다.</span></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">또는 모든 속성 타입을 특정 타입으로 변환하고자 할 때도 사용할 수 있습니다:</p>
<pre class="routeros"><code>export type PokemonMapped&lt;T&gt; = {
    [Property in keyof T]: string;
};</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 예제에서는 <code>PokemonMapped&lt;T&gt;</code> 타입이 <code>T</code> 타입의 모든 속성을 <code>string</code> 타입으로 변환합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">기본적으로 <code>PokemonMapped&lt;T&gt;</code>를 사용하여 단순히 주어진 타입 <code>T</code>의 모든 속성을 순회하면서 원래 타입을 그대로 유지하는 경우는 불필요합니다. 대신, 구체적인 변환이 필요할 때만 맵드 타입을 사용하는 것이 좋습니다.</p>
<h2 data-ke-size="size26"><code>export type PokemonMapped&lt;T&gt; = T</code> 이거랑 똑같은가요?</h2>
<p data-ke-size="size16">아니요, 두 타입은 동일하지 않습니다. <code>PokemonMapped&lt;T&gt;</code> 타입은 <code>T</code> 타입의 모든 속성을 선택적(optional)으로 만듭니다.</p>
<p data-ke-size="size16">반면 <code>export type PokemonMapped&lt;T&gt; = T;</code>는 주어진 타입 <code>T</code>를 그대로 사용하는 것입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">예를 들어, 다음과 같은 타입이 있다고 가정해 봅시다:</p>
<pre class="applescript"><code>type Pokemon = {
    id: number;
    name: string;
    type: string;
};</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>PokemonMapped&lt;Pokemon&gt;</code>와 <code>Pokemon</code> 타입을 비교해 보겠습니다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><code>export type PokemonMapped&lt;T&gt; = T;</code>의 경우:</li>
</ol>
<pre class="fsharp"><code>type PokemonMapped&lt;T&gt; = T;
<p>type MappedPokemon = PokemonMapped&lt;Pokemon&gt;;
// MappedPokemon 타입은 Pokemon 타입과 동일합니다
// MappedPokemon 타입은 { id: number; name: string; type: string; }</code></pre></p>
<ol style="list-style-type: decimal;" start="2" data-ke-list-type="decimal">
<li><code>export type PokemonMapped&lt;T&gt; = { [Property in keyof T]?: T[Property]; };</code>의 경우:</li>
</ol>
<pre class="crmsh"><code>type PokemonMapped&lt;T&gt; = {
    [Property in keyof T]?: T[Property];
};
<p>type MappedPokemon = PokemonMapped&lt;Pokemon&gt;;
// MappedPokemon 타입은 Pokemon 타입의 모든 속성을 선택적으로 만든 타입입니다
// MappedPokemon 타입은 { id?: number; name?: string; type?: string; }</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">따라서 두 가지 타입은 다음과 같은 차이가 있습니다:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>PokemonMapped&lt;T&gt; = T;</code>는 주어진 타입 <code>T</code>를 그대로 반환합니다.</li>
<li><code>PokemonMapped&lt;T&gt; = { [Property in keyof T]?: T[Property]; };</code>는 주어진 타입 <code>T</code>의 모든 속성을 선택적으로 만듭니다.</li>
</ul>
<h3 data-ke-size="size23">예제 코드</h3>
<p data-ke-size="size16">다음은 각각의 타입을 사용하는 예제 코드입니다:</p>
<pre class="fsharp"><code>type Pokemon = {
    id: number;
    name: string;
    type: string;
};
<p>// T 타입을 그대로 사용하는 경우
type PokemonMapped1&lt;T&gt; = T;</p>
<p>type MappedPokemon1 = PokemonMapped1&lt;Pokemon&gt;;</p>
<p>const pokemon1: MappedPokemon1 = {
id: 1,
name: &quot;Bulbasaur&quot;,
type: &quot;Grass/Poison&quot;
}; // 정상</p>
<p>const pokemon1Optional: MappedPokemon1 = {
name: &quot;Bulbasaur&quot;
}; // 오류: 'id'와 'type' 속성이 필요합니다</p>
<p>// T 타입의 모든 속성을 선택적으로 만드는 경우
type PokemonMapped2&lt;T&gt; = {
[Property in keyof T]?: T[Property];
};</p>
<p>type MappedPokemon2 = PokemonMapped2&lt;Pokemon&gt;;</p>
<p>const pokemon2: MappedPokemon2 = {
id: 1,
name: &quot;Bulbasaur&quot;,
type: &quot;Grass/Poison&quot;
}; // 정상</p>
<p>const pokemon2Optional: MappedPokemon2 = {
name: &quot;Bulbasaur&quot;
}; // 정상: 'id'와 'type' 속성은 선택적입니다</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">따라서 두 타입 정의는 서로 다르며, <code>PokemonMapped&lt;T&gt;</code>가 어떤 용도로 사용될 것인지에 따라 적절히 선택해야 합니다.</p>
<h2 data-ke-size="size26">그렇다면 const assertions 을 쓰는게 맞을까요?</h2>
<p data-ke-size="size16">네, 정확합니다. <code>as const</code>를 사용하여 배열을 리터럴 타입으로 변환한 후, 해당 배열의 요소 타입을 유니언 타입으로 추출하는 방법은 매우 유용합니다. 이렇게 하면 타입 안전성을 유지하면서도 코드를 간결하게 작성할 수 있습니다.</p>
<p data-ke-size="size16">아래는 예시입니다:</p>
<pre class="typescript"><code>const abilities = [
    "air-lock", "arena-trap", "battle-armor",
    // 기타 등등...
] as const;
<p>export type PokemonAbilityTypes = typeof abilities[number];</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 코드는 다음과 같은 타입을 생성합니다:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>abilities</code>는 읽기 전용 배열로 정의되며, 배열의 각 요소는 리터럴 타입으로 간주됩니다.</li>
<li><code>PokemonAbilityTypes</code>는 배열 <code>abilities</code>의 요소 타입을 유니언 타입으로 정의합니다.</li>
</ul>
<p data-ke-size="size16">이제 <code>PokemonAbilityTypes</code> 타입을 사용하여 <code>AbilitiesChip</code> 컴포넌트의 <code>intent</code> prop을 타입 안전하게 만들 수 있습니다:</p>
<pre class="javascript"><code>import { cva, VariantProps } from "class-variance-authority";
<p>// abilities 배열과 타입 정의
const abilities = [
&quot;air-lock&quot;, &quot;arena-trap&quot;, &quot;battle-armor&quot;,
// 기타 등등...
&quot;unaware&quot;, &quot;unburden&quot;
] as const;</p>
<p>export type PokemonAbilityTypes = typeof abilities[number];</p>
<p>// chipVariants 정의
const chipVariants = cva(
[
&quot;text-sm border&quot;,
&quot;rounded-full&quot;,
&quot;px-2.5&quot;,
&quot;py-0.5&quot;,
&quot;hover:opacity-70&quot;,
&quot;transition-opacity&quot;,
],
{
variants: {
intent: {
&quot;air-lock&quot;: &quot;bg-blue-100 border-blue-100 text-blue-900&quot;,
// 기타 등등...
&quot;unaware&quot;: &quot;bg-blue-900 border-blue-900 text-blue-900&quot;,
&quot;unburden&quot;: &quot;bg-blue-900 border-blue-900 text-blue-900&quot;,
},
},
defaultVariants: {
intent: &quot;default&quot;,
},
}
);</p>
<p>type ChipVariantsType = VariantProps&lt;typeof chipVariants&gt;;</p>
<p>type ChipProps = {
label: string;
intent?: PokemonAbilityTypes; // 타입 안전성을 보장하기 위해 PokemonAbilityTypes 사용
} &amp; ChipVariantsType;</p>
<p>// isValidIntent 함수 정의
function isValidIntent(intent: string): intent is PokemonAbilityTypes {
return abilities.includes(intent as PokemonAbilityTypes);
}</p>
<p>// AbilitiesChip 컴포넌트 정의
function AbilitiesChip({ intent = &quot;default&quot;, label }: ChipProps) {
return &lt;div className={chipVariants({ intent: isValidIntent(intent) ? intent : &quot;default&quot; })}&gt;{label}&lt;/div&gt;;
}</p>
<p>export default AbilitiesChip;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 코드에서는:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><code>abilities</code> 배열을 <code>as const</code>로 선언하여 리터럴 타입으로 변환합니다.</li>
<li><code>PokemonAbilityTypes</code> 타입을 <code>typeof abilities[number]</code>로 선언하여 배열 요소의 유니언 타입을 추출합니다.</li>
<li><code>intent</code> prop의 타입을 <code>PokemonAbilityTypes</code>로 지정하여 타입 안전성을 보장합니다.</li>
<li><code>isValidIntent</code> 함수는 <code>intent</code>가 <code>abilities</code> 배열에 포함되어 있는지 확인합니다.</li>
</ol>
<p data-ke-size="size16">이렇게 하면 <code>AbilitiesChip</code> 컴포넌트의 <code>intent</code> prop이 <code>PokemonAbilityTypes</code> 타입에 속하는 값만 가질 수 있게 되어, 타입 안전성을 높일 수 있습니다.</p>