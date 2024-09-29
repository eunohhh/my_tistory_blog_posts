<h2 data-ke-size="size26">모든 옵션 사용시 검색 액션이 두 번 들어가는 구조입니다.</h2>
<h3 data-ke-size="size23">옵션 1 따로 가고요.</h3>
<p data-ke-size="size16">(옵션1 고성능 검색이 가능할 경우 시도 - 자동완성, 등등)<br />옵션 1 - 키워드</p>
<h3 data-ke-size="size23">옵션 2~9 따로 갑니다.</h3>
<p data-ke-size="size16">(아래는 완전일치)<br />옵션 2 - 지역? - trip_destination<br />옵션 3 - 일시? - trip_start_date / trip_end_date<br />옵션 4 - 선호성별? - trip_wanted_sex</p>
<p data-ke-size="size16">옵션 5 - 경비? - trip_cost &lt;&lt;&lt; 추후에 뺄 수도 있음<br />옵션 6 - 인원수? - trip_max_buddies_counts &lt;&lt;&lt; 추후에 뺄 수도 있음<br />옵션 7 - 만남장소? - trip_meet_location &lt;&lt;&lt; 추후에 뺄 수도 있음<br />(만약에 속도느리면 인덱싱 걸고...)</p>
<p data-ke-size="size16">(아래2개는 세개 중 한개라도 일치하는것 다 가져온다음에, 가능하면 우선순위로 필터링)<br />옵션 8 - 테마? - trip_themes<br />옵션 9 - 선호버디즈성향? - trip_wanted_buddies</p>
<p data-ke-size="size16">==&gt; 1 따로 가서 배열하나 받고, 2~9 따로 가서 배열하나 받아서 중복 제거</p>
<h2 data-ke-size="size26">일부를 옵션으로 선택했을 경우에는 아래와 같습니다.</h2>
<h3 data-ke-size="size23">옵션 1 키워드만 했을때</h3>
<p data-ke-size="size16">키워드만 검색했을때 로직은 옵션2~10까지는 고려하지 않고,<br />trips 테이블에서 isValidate 가 true 인 모임 중에서<br />trip_title 과 trip_content 에서 키워드와 일치하는 trip_id를 뽑아낸다.</p>
<h3 data-ke-size="size23">옵션이 하나만(2~7) 존재할 경우</h3>
<p data-ke-size="size16">trips 테이블에서 isValidate 가 true 이면서<br />trip_(column) 이 일치하는 trip_id 를 뽑아낸다.</p>
<h3 data-ke-size="size23">예외) 옵션 8 / 옵션 9 의 경우</h3>
<p data-ke-size="size16">trips 테이블에서, isValidate 가  true 인 것들만남기고<br />user가 선택한 chip 최대 세개를 기준으로<br />trip_theme1, trip_theme2, trip_theme3 에서 한개라도 걸리는 trip을 다 불러온다음</p>
<pre class="javascript"><code>// 옵션 8, 9 에 대한 함수
async function searchTripDocuments(searchTerms) {
  let query = supabase
    .from('trips')
    .select('*')
    .filter('isValidate', 'eq', true);
<p>const searchConditions = searchTerms.map(term =&gt; {
return <code>(pool1 ILIKE '%${term}%' OR pool2 ILIKE '%${term}%' OR pool3 ILIKE '%${term}%')</code>;
}).join(' OR ');</p>
<p>query = query.or(searchConditions);</p>
<p>const { data, error } = await query;</p>
<p>if (error) {
console.error('Error searching documents:', error);
} else {
console.log('Search results:', data);
}
}</p>
<p>const searchTerms = ['one', 'two', 'three'];
searchDocuments(searchTerms);</p>
<p>async function searchBuddiesDocuments(searchTerms) {
let query = supabase
.from('documents')
.select('*')
.filter('isValidate', 'eq', true);</p>
<p>const searchConditions = searchTerms.map(term =&gt; {
return <code>(pool1 ILIKE '%${term}%' OR pool2 ILIKE '%${term}%' OR pool3 ILIKE '%${term}%')</code>;
}).join(' OR ');</p>
<p>query = query.or(searchConditions);</p>
<p>const { data, error } = await query;</p>
<p>if (error) {
console.error('Error searching documents:', error);
} else {
console.log('Search results:', data);
}
}</p>
<p>const searchTerms = ['one', 'two', 'three'];
searchDocuments(searchTerms);</code></pre></p>
<p data-ke-size="size16">(도전과제 - 위 함수의 결과로 리턴된 배열에서 몇개가 일치하는지 퍼센트를 계산해서 그 순서대로 배열 순서 재배치)</p>
<pre class="javascript"><code>// 2~7번 까지를 결합할 수 있는 코드
import { createClient } from '@supabase/supabase-js';
<p>const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-public-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);</p>
<p>async function searchTripDocuments(searchTerms) {
let query = supabase
.from('trips')
.select('*')
.filter('isValidate', 'eq', true);</p>
<p>// 동적으로 추가할 조건들 (클라이언트에서 보내면됨 아래를)
const filters = [
{ column: 'blabla', operator: 'eq', value: variable2 },
{ column: 'blabla2', operator: 'eq', value: variable3 },
// 필요한 만큼 추가 가능
];</p>
<p>// 각 조건을 query에 추가
filters.forEach(filter =&gt; {
query = query.filter(filter.column, filter.operator, filter.value);
});</p>
<p>// OR 조건을 만들어 여러 컬럼에 대해 검색어를 일치시키기
const searchConditions = searchTerms.map(term =&gt; {
return <code>(pool1 ILIKE '%${term}%' OR pool2 ILIKE '%${term}%' OR pool3 ILIKE '%${term}%')</code>;
}).join(' OR ');</p>
<p>query = query.or(searchConditions);</p>
<p>const { data, error } = await query;</p>
<p>if (error) {
console.error('Error searching documents:', error);
} else {
console.log('Search results:', data);
}
}</p>
<p>const searchTerms = ['one', 'two', 'three'];
const variable2 = 'some_value1';
const variable3 = 'some_value2';</p>
<p>searchTripDocuments(searchTerms);</code></pre></p>
