<h2 data-ke-size="size26">좋은말할 때 Tanstack Query 쓰자</h2>
<p data-ke-size="size16">험난했던 팀플 주간이 끝이 났습니다.</p>
<p data-ke-size="size16">리덕스 createAsyncThunk 와 extraReducer 연습은 아주 제대로 했지만<br />그냥 웬만하면 tanstack query 를 쓰자는 교훈? 을 얻었습니다.</p>
<p data-ke-size="size16">기억하기 위해 supabase의 table, auth 관련 메소드를 정리하면서 한 주를 마치려 합니다.</p>
<h2 data-ke-size="size26">Supabase 메서드 정리</h2>
<h3 data-ke-size="size23">table 메서드</h3>
<p data-ke-size="size16">Supabase는 Postgres 데이터베이스를 기반으로 하며, 다양한 테이블 관련 메서드를 제공합니다.<br />다음은 Supabase의 테이블 관련 주요 메서드들에 대한 설명입니다:</p>
<h4 data-ke-size="size20">1. 데이터 삽입 (Insert)</h4>
<pre class="cs"><code>const { data, error } = await supabase
  .from('table_name')
  .insert([
    { column1: 'value1', column2: 'value2' },
  ]);</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>.from('table_name')</code></b>: 테이블을 지정합니다.</li>
<li><b><code>.insert([...])</code></b>: 테이블에 데이터를 삽입합니다.</li>
</ul>
<h4 data-ke-size="size20">2. 데이터 조회 (Select)</h4>
<pre class="cs"><code>const { data, error } = await supabase
  .from('table_name')
  .select('*');</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>.select('*')</code></b>: 테이블의 모든 열을 선택합니다.</li>
<li>특정 열을 선택하려면 <code>.select('column1, column2')</code> 형식을 사용합니다.</li>
</ul>
<h4 data-ke-size="size20">3. 조건부 데이터 조회 (Filter)</h4>
<pre class="cs"><code>const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', 'value');</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>.eq('column', 'value')</code></b>: 특정 열이 특정 값과 같은 행을 필터링합니다.</li>
<li>다른 조건부 메서드로는 <code>.neq</code>, <code>.gt</code>, <code>.lt</code>, <code>.gte</code>, <code>.lte</code>, <code>.like</code>, <code>.ilike</code>, <code>.in</code>, <code>.is</code>, <code>.not</code>, <code>.contains</code>, <code>.containedBy</code>, <code>.range</code> 등이 있습니다.</li>
</ul>
<h4 data-ke-size="size20">4. 데이터 업데이트 (Update)</h4>
<pre class="cs"><code>const { data, error } = await supabase
  .from('table_name')
  .update({ column1: 'new_value' })
  .eq('column2', 'value2');</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>.update({...})</code></b>: 테이블의 데이터를 업데이트합니다.</li>
<li>특정 조건을 만족하는 행을 업데이트하려면 <code>.eq</code>, <code>.neq</code> 등의 조건부 메서드를 함께 사용합니다.</li>
</ul>
<h4 data-ke-size="size20">5. 데이터 삭제 (Delete)</h4>
<pre class="coffeescript"><code>const { data, error } = await supabase
  .from('table_name')
  .delete()
  .eq('column', 'value');</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>.delete()</code></b>: 테이블의 데이터를 삭제합니다.</li>
<li>특정 조건을 만족하는 행을 삭제하려면 <code>.eq</code>, <code>.neq</code> 등의 조건부 메서드를 함께 사용합니다.</li>
</ul>
<h4 data-ke-size="size20">6. 정렬 (Order)</h4>
<pre class="cs"><code>const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .order('column', { ascending: true });</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>.order('column', { ascending: true })</code></b>: 특정 열을 기준으로 정렬합니다.</li>
<li><code>ascending: false</code>를 사용하여 내림차순으로 정렬할 수 있습니다.</li>
</ul>
<h4 data-ke-size="size20">7. 데이터 제한 (Limit) 및 오프셋 (Offset)</h4>
<pre class="cs"><code>const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .limit(10)
  .offset(5);</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>.limit(count)</code></b>: 조회할 행의 수를 제한합니다.</li>
<li><b><code>.offset(count)</code></b>: 조회할 행의 시작 위치를 지정합니다.</li>
</ul>
<h4 data-ke-size="size20">8. 조인 (Join)</h4>
<p data-ke-size="size16">현재 Supabase는 SQL 구문을 통해 조인을 지원합니다. 예를 들어:</p>
<pre class="cs"><code>const { data, error } = await supabase
  .rpc('your_function_name', { param1: 'value1' });</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>.rpc('function_name', { param1: 'value1' })</code></b>: SQL 함수를 호출하여 조인 또는 복잡한 쿼리를 수행합니다.</li>
</ul>
<h4 data-ke-size="size20">9. 로우 레벨 보안 (RLS) 정책 적용</h4>
<p data-ke-size="size16">Supabase는 Row Level Security (RLS)를 통해 사용자별 데이터 접근을 제어할 수 있습니다. RLS 정책은 SQL을 사용하여 설정됩니다.</p>
<pre class="routeros"><code>-- 예시: 특정 사용자가 자신의 데이터만 조회할 수 있도록 설정
CREATE POLICY "select_policy" ON "table_name"
  FOR SELECT
  USING (user_id = auth.uid());</code></pre>
<p data-ke-size="size16">이와 같은 메서드들을 활용하여 Supabase에서 데이터를 효과적으로 관리하고 조작할 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">Auth 메서드</h3>
<p data-ke-size="size16">Supabase Auth는 사용자 인증 및 인가를 위한 다양한 메서드를 제공합니다.<br />다음은 주요 Auth 메서드들에 대한 설명입니다:</p>
<h4 data-ke-size="size20">1. 사용자 가입</h4>
<pre class="pgsql"><code>const { user, session, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
      data: {
        displayName: "이거슨닉네임",
        first_name: "John",
        age: 27,
      },
    },
});</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>signUp({ email, password })</code></b>: 이메일과 비밀번호로 새로운 사용자를 등록합니다.</li>
</ul>
<h4 data-ke-size="size20">2. 사용자 로그인</h4>
<pre class="pgsql"><code>const { user, session, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>signInWithPassword({ email, password })</b>: 이메일과 비밀번호로 새로운 사용자를 등록합니다.</li>
</ul>
<h4 data-ke-size="size20">3. OAuth 제공자 로그인</h4>
<pre class="typescript" data-ke-language="typescript"><code>const { user, session, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
});</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>signIn({ provider })</code></b>: GitHub, Google 등 OAuth 제공자를 통해 사용자를 로그인합니다.</li>
</ul>
<h4 data-ke-size="size20">4. 사용자 로그아웃</h4>
<pre class="aspectj"><code>const { error } = await supabase.auth.signOut();</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>signOut()</code></b>: 현재 사용자를 로그아웃합니다.</li>
</ul>
<h4 data-ke-size="size20">5. 비밀번호 초기화</h4>
<pre class="rust"><code>const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://example.com/update-password',
});</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>resetPasswordForEmail(email)</code></b>: Supabase의 비밀번호 재설정 과정은 두 단계로 나뉩니다:</li>
</ul>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>비밀번호 재설정 링크 전송</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>resetPasswordForEmail(email, options)</code> 메서드를 사용하여 사용자의 이메일로 비밀번호 재설정 링크를 전송합니다.</li>
<li><code>redirectTo</code> 옵션을 사용하여 사용자가 링크를 클릭했을 때 리디렉션될 URL을 지정할 수 있습니다.</li>
</ul>
</li>
<li><b>비밀번호 업데이트</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>사용자가 이메일의 링크를 클릭하면 애플리케이션으로 리디렉션됩니다.</li>
<li>이 시점에 <code>updateUser({ password: new_password })</code> 메서드를 사용하여 새 비밀번호를 설정하도록 합니다.</li>
</ul>
</li>
</ol>
<p data-ke-size="size16">이를 통해 사용자는 비밀번호를 재설정할 수 있습니다.</p>
<h4 data-ke-size="size20">6. 사용자 업데이트</h4>
<pre class="groovy"><code>const { user, error } = await supabase.auth.updateUser({
  data: { first_name: 'John', last_name: 'Doe', displayName: "asdfsafd" },
  email: "asdfasdf@asdsadf.com",
  password : 1231245,
  phone : 
});</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>updateUser({ data })</code></b>: 현재 사용자 정보를 업데이트합니다.</li>
</ul>
<h4 data-ke-size="size20">7. 세션 가져오기</h4>
<pre class="dart"><code>export const getId = async () =&gt; {
  const {
    data: {
      session: {
        user: { id },
      },
    },
    error,
  } = await supabase.auth.getSession();
<p>return id;
};</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>getSession</code>: 현재 세션을 가져옵니다</li>
<li><b>목적</b>: 현재 활성화된 세션 정보를 반환합니다.</li>
<li><b>반환 값</b>: 사용자 세션의 토큰과 세션 정보를 포함합니다.</li>
<li><b>용도</b>: 사용자가 로그인된 상태인지 확인하고, 세션 정보를 관리할 때 사용합니다.</li>
</ul>
<h4 data-ke-size="size20">8. 유저 가져오기</h4>
<pre class="routeros"><code>export const getUser = async () =&gt; {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) console.log("getUser error:", error);
  return user;
};</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>getUser</code>: 현재 유저정보를 로컬이아닌 서버에서 가져옵니다</li>
<li><b>목적</b>: 현재 로그인된 사용자의 정보를 반환합니다.</li>
<li><b>반환 값</b>: 사용자의 프로필 정보(예: 이메일, 사용자 ID 등)를 포함합니다.</li>
<li><b>용도</b>: 현재 로그인한 사용자의 세부 정보를 서버에서 가져올 때 사용합니다.</li>
</ul>
<h4 data-ke-size="size20">9. 유저 정보 변경 감지</h4>
<pre class="javascript"><code>import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import { supabase } from "../supabase/supabaseClient";
<p>export const AuthContext = createContext(null);</p>
<p>export default function AuthProvider({ children }) {
const [isLogin, setIsLogin] = useState(false);</p>
<p>useEffect(() =&gt; {
const {
data: { subscription },
} = supabase.auth.onAuthStateChange((event, session) =&gt; {
console.log(event, session);</p>
<pre><code>  if (session) {
    // 로그인 상태로 변경
    setIsLogin(true);
  } else {
    // 로그아웃 상태로 변경
    setIsLogin(false);
  }
});

// 전역적으로 사용될 경우 구독해제가 필수적이지는 않음.
return () =&amp;gt; subscription.unsubscribe();
</code></pre>
<p>}, []);
return (
&lt;AuthContext.Provider value={{ isLogin, setIsLogin }}&gt;
{children}
&lt;/AuthContext.Provider&gt;
);
}</code></pre></p>
<p data-ke-size="size16">Supabase의 <code>onAuthStateChange</code> 메서드는 사용자의 인증 상태 변화(로그인, 로그아웃, 토큰 갱신 등)를 감지하기 위해 사용됩니다. 이 메서드는 콜백 함수를 받아 인증 상태가 변할 때마다 호출됩니다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>목적</b>: 사용자의 인증 상태 변화를 실시간으로 감지하고 처리.</li>
<li><b>사용 예시</b>: 사용자가 로그인하거나 로그아웃할 때 UI를 업데이트하거나 애플리케이션 상태를 변경.</li>
</ul>