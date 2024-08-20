<h2 data-ke-size="size26">내배캠 수료</h2>
<p data-ke-size="size16">짧다면 짤고 길다면 긴 부트캠프가 내일이면 끝납니다.<br />til 은 계속 해서 작성할 예정이고<br />기존에 작성했던 것들은 분류작업을 해보려고 합니다.<br />시원섭섭합니다.</p>
<h2 data-ke-size="size26">supabase.rpc</h2>
<p data-ke-size="size16">내배캠 막바지에 supabase.rpc 라는 메서드를 사용할 일이 있었습니다.<br />sql 을 몰라서 생소한 기능이었는데 gpt 쌤에게 물어본 내용을 정리합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">Supabase에서 <code>supabase.rpc</code> 메서드는 PostgreSQL의 <b>저장 프로시저</b>(Stored Procedure) 또는 <b>사용자 정의 함수</b>(User-defined Function)를 호출하는 데 사용됩니다. 이를 통해 복잡한 로직을 데이터베이스 내에서 실행하고, 결과를 가져올 수 있습니다.</p>
<h3 data-ke-size="size23">1. <b>함수 생성</b></h3>
<p data-ke-size="size16">먼저 PostgreSQL에서 함수를 생성해야 합니다. 예를 들어, 특정 테이블에서 특정 조건에 맞는 데이터를 반환하는 간단한 함수를 작성해 보겠습니다.</p>
<pre class="pgsql"><code>CREATE OR REPLACE FUNCTION get_active_users(min_temperature FLOAT)
RETURNS SETOF users AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM users WHERE temperature &gt; min_temperature;
END;
$$ LANGUAGE plpgsql;</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 함수는 <code>users</code> 테이블에서 <code>temperature</code>가 <code>min_temperature</code>보다 높은 사용자를 반환합니다.</p>
<h3 data-ke-size="size23">2. <b><code>supabase.rpc</code> 사용법</b></h3>
<p data-ke-size="size16">Supabase 클라이언트를 사용하여 이 함수를 호출할 수 있습니다.</p>
<pre class="javascript"><code>import { createClient } from '@supabase/supabase-js';
<p>// Supabase 클라이언트 초기화
const supabase = createClient('https://your-project.supabase.co', 'your-anon-key');</p>
<p>async function fetchActiveUsers(minTemperature) {
const { data, error } = await supabase.rpc('get_active_users', {
min_temperature: minTemperature
});</p>
<pre><code>if (error) {
    console.error('Error fetching active users:', error);
} else {
    console.log('Active users:', data);
}
</code></pre>
<p>}</p>
<p>fetchActiveUsers(37.5);</code></pre></p>
<h3 data-ke-size="size23">3. <b>파라미터 전달</b></h3>
<p data-ke-size="size16"><code>supabase.rpc</code> 메서드의 두 번째 인자는 함수에 전달할 파라미터의 객체입니다. 파라미터의 이름과 객체의 키가 일치해야 합니다.</p>
<pre class="aspectj"><code>const { data, error } = await supabase.rpc('function_name', {
    param_name1: value1,
    param_name2: value2,
    // 기타 파라미터
});</code></pre>
<h3 data-ke-size="size23">4. <b>결과 처리</b></h3>
<p data-ke-size="size16"><code>supabase.rpc</code>는 <code>data</code>와 <code>error</code> 객체를 반환합니다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>data</code></b>: 함수 실행 결과가 들어있는 배열입니다.</li>
<li><b><code>error</code></b>: 함수 실행 중 발생한 오류 정보가 들어있습니다.</li>
</ul>
<h3 data-ke-size="size23">5. <b>비동기 함수 사용</b></h3>
<p data-ke-size="size16"><code>supabase.rpc</code>는 비동기 함수이므로, <code>await</code> 또는 <code>.then()</code>을 사용하여 함수 호출 결과를 처리합니다.</p>
<h3 data-ke-size="size23">6. <b>예제: 사용자 정의 함수 호출</b></h3>
<p data-ke-size="size16">아래는 또 다른 예제로, 두 날짜 사이에 생성된 사용자를 검색하는 함수입니다:</p>
<h4 data-ke-size="size20">함수 생성</h4>
<pre class="pgsql"><code>CREATE OR REPLACE FUNCTION get_users_by_date_range(start_date DATE, end_date DATE)
RETURNS SETOF users AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM users WHERE created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;</code></pre>
<h4 data-ke-size="size20">함수 호출</h4>
<pre class="javascript"><code>async function fetchUsersByDateRange(startDate, endDate) {
    const { data, error } = await supabase.rpc('get_users_by_date_range', {
        start_date: startDate,
        end_date: endDate,
    });
<pre><code>if (error) {
    console.error('Error fetching users by date range:', error);
} else {
    console.log('Users by date range:', data);
}
</code></pre>
<p>}</p>
<p>fetchUsersByDateRange('2024-01-01', '2024-12-31');</code></pre></p>
<h3 data-ke-size="size23">7. <b>주의사항</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>함수 이름과 파라미터는 PostgreSQL 함수에서 정의된 대로 정확하게 일치해야 합니다.</li>
<li><code>supabase.rpc</code>는 기본적으로 모든 권한을 가진 사용자가 호출할 수 있지만, 함수의 보안 정책을 확인하고 필요에 따라 권한을 제한할 수 있습니다.</li>
<li>Supabase의 함수 호출은 PostgreSQL의 성능 특성을 따르므로, 복잡한 계산이나 큰 데이터셋을 다룰 때는 적절한 인덱스와 최적화를 고려해야 합니다.</li>
</ul>
<h3 data-ke-size="size23">요약</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>supabase.rpc</code>는 Supabase에서 PostgreSQL 사용자 정의 함수(또는 저장 프로시저)를 호출하는 메서드입니다.</li>
<li>함수 이름과 파라미터를 객체 형태로 전달하여 복잡한 로직을 데이터베이스에서 직접 실행할 수 있습니다.</li>
<li>결과는 <code>data</code>와 <code>error</code> 객체로 반환되며, 비동기적으로 처리됩니다.</li>
</ul>
<p data-ke-size="size16">이 방법을 통해 클라이언트에서 복잡한 로직을 서버로 이동하여 처리할 수 있고, 이는 성능과 보안 측면에서 많은 이점을 제공할 수 있습니다.</p>