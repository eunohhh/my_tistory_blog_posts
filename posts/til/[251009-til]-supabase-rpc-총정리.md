<h4 data-ke-size="size20">Supabase RPC: 트랜잭션과 보안을 위한 필수 도구</h4>
<hr contenteditable="false" data-ke-type="horizontalRule" data-ke-style="style1" />
<h2 data-ke-size="size26">  TL;DR (한 줄 요약)</h2>
<p data-ke-size="size16">Supabase RPC는 성능 최적화뿐만 아니라 <b>Row Level Security 하에서 안전한 트랜잭션 처리</b>를 위한 핵심 기능.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">  핵심 정리</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Supabase JS 클라이언트는 트랜잭션을 지원하지 않음</b></li>
<li><b>RPC (PostgreSQL Functions)</b>를 사용하면 서버 측에서 트랜잭션 보장</li>
<li><b>RLS (Row Level Security)</b>는 행 단위 접근 제어로 클라이언트의 직접 DB 접근을 안전하게 보호</li>
<li><b>RLS 정책의 <code>USING</code> 절</b>은 관계 테이블을 통한 복잡한 권한 체크 가능</li>
<li><b>트랜잭션 + RLS</b>를 함께 사용하면 안전하고 일관된 데이터 처리 가능</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">1. 문제 상황: Supabase JS의 한계</h2>
<h3 data-ke-size="size23">Supabase JS는 트랜잭션을 지원하지 않습니다</h3>
<pre class="javascript"><code>// ❌ 이런 코드는 트랜잭션이 아닙니다!
export async function POST(request: Request) {
  const supabase = createClient(url, key);
<p>// 1번 업데이트
const { error: error1 } = await supabase
.from('users')
.update({ name: '새이름' })
.eq('id', userId);</p>
<p>// 2번 업데이트
const { error: error2 } = await supabase
.from('profiles')
.update({ status: 'active' })
.eq('user_id', userId);</p>
<p>// 문제: 1번은 성공, 2번은 실패 → 데이터 불일치!
}</code></pre></p>
<h3 data-ke-size="size23">수동 롤백의 문제점</h3>
<pre class="less"><code>// ⚠️ 비추천: 수동 롤백
if (error2) {
  // 1번을 되돌리려 시도
  await supabase
    .from('users')
    .update({ name: '원래이름' })
    .eq('id', userId);
  // 문제점:
  // - 원래 값을 알아야 함
  // - 네트워크 장애 시 롤백 실패
  // - 동시성 문제 발생 가능
}</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">2. 해결책: RPC를 통한 트랜잭션</h2>
<h3 data-ke-size="size23">RPC (Remote Procedure Call)란?</h3>
<p data-ke-size="size16">PostgreSQL의 <b>Stored Procedure</b>를 GraphQL/REST API처럼 호출하는 방식.</p>
<h3 data-ke-size="size23">RPC 함수 생성</h3>
<pre class="pgsql"><code>-- Supabase Dashboard &rarr; SQL Editor에서 실행
CREATE OR REPLACE FUNCTION update_user_and_profile(
  p_user_id UUID,
  p_name TEXT,
  p_status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- 함수 소유자 권한으로 실행
AS $$
BEGIN
  -- 트랜잭션 자동 시작
<p>UPDATE users
SET name = p_name
WHERE id = p_user_id;</p>
<p>UPDATE profiles
SET status = p_status
WHERE user_id = p_user_id;</p>
<p>-- 모든 작업 성공 시 자동 커밋
RETURN json_build_object('success', true);</p>
<p>EXCEPTION
WHEN OTHERS THEN
-- 에러 발생 시 자동 롤백
RETURN json_build_object(
'success', false,
'error', SQLERRM
);
END;
$$;</code></pre></p>
<h3 data-ke-size="size23">Next.js에서 RPC 호출</h3>
<pre class="aspectj"><code>// app/api/update-user/route.ts
import { createClient } from '@supabase/supabase-js';
<p>export async function POST(request: Request) {
const { userId, name, status } = await request.json();</p>
<p>const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!  // 서버에서만 사용
);</p>
<p>const { data, error } = await supabase.rpc('update_user_and_profile', {
p_user_id: userId,
p_name: name,
p_status: status
});</p>
<p>if (error || !data.success) {
return Response.json(
{ error: data?.error || error.message },
{ status: 500 }
);
}</p>
<p>return Response.json({ success: true });
}</code></pre></p>
<h3 data-ke-size="size23">트랜잭션의 장점</h3>
<pre class="ada"><code>-- ✅ 원자성 (Atomicity): 모두 성공 or 모두 실패
-- ✅ 일관성 (Consistency): 데이터 무결성 보장
-- ✅ 격리성 (Isolation): 동시 실행 간섭 방지
-- ✅ 지속성 (Durability): 커밋 후 영구 저장</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">3. RLS의 이해와 중요성</h2>
<h3 data-ke-size="size23">Row Level Security (RLS)란?</h3>
<p data-ke-size="size16">테이블 전체가 아닌 <b>행(row) 단위</b>로 접근을 제어하는 PostgreSQL의 보안 기능.</p>
<h3 data-ke-size="size23">전통적인 방식 vs RLS</h3>
<pre class="routeros"><code>-- 전통적인 GRANT/REVOKE (테이블 단위)
GRANT SELECT ON users TO some_user;
-- &rarr; 테이블 전체를 볼 수 있다/없다
<p>-- RLS (행 단위)
CREATE POLICY &quot;사용자는 자기 데이터만&quot;
ON users FOR SELECT
USING (auth.uid() = id);
-- → 테이블에서 내 행만 볼 수 있다</code></pre></p>
<h3 data-ke-size="size23">RLS의 핵심 가치: 클라이언트 직접 접근</h3>
<pre class="cs"><code>// React 컴포넌트 (브라우저에서 실행!)
import { createClient } from '@supabase/supabase-js';
<p>const supabase = createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY  // 공개 키!
);</p>
<p>// RLS가 없다면?
const { data } = await supabase
.from('users')
.select('email, password_hash, credit_card');
//   모든 사용자 정보가 노출됨!</p>
<p>// RLS가 있다면?
const { data } = await supabase
.from('posts')
.select('*');
// ✅ 자동으로 내 게시글만 반환됨</code></pre></p>
<h3 data-ke-size="size23">RLS 활성화</h3>
<pre class="sql"><code>-- 1. RLS 활성화 (필수!)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
<p>-- 2. 정책이 없으면 기본적으로 모든 접근 거부
-- 빈 결과 반환</p>
<p>-- 3. 필요한 정책만 추가
CREATE POLICY &quot;사용자는 본인 게시글만 관리&quot;
ON posts FOR ALL
USING (auth.uid() = user_id);</code></pre></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">4. RLS 정책 작성 패턴</h2>
<h3 data-ke-size="size23">패턴 1: 직접 소유 (user_id 컬럼 사용)</h3>
<pre class="routeros"><code>-- 가장 기본적인 패턴
CREATE POLICY "본인 데이터만 CRUD"
ON posts FOR ALL
USING (auth.uid() = user_id);</code></pre>
<p data-ke-size="size16"><b>테이블 구조:</b></p>
<pre class="sql"><code>CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),  -- 필수!
  title TEXT,
  content TEXT
);</code></pre>
<h3 data-ke-size="size23">패턴 2: 관계 테이블을 통한 접근 제어</h3>
<p data-ke-size="size16">user_id가 없어도 다른 테이블을 통해 권한 확인 가능!</p>
<pre class="sql"><code>-- 조직 테이블 (user_id 없음!)
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT
);
<p>-- 멤버십 테이블
CREATE TABLE memberships (
organization_id UUID REFERENCES organizations(id),
user_id UUID REFERENCES auth.users(id),
role TEXT
);</p>
<p>-- 조직에 user_id가 없지만 RLS 가능!
CREATE POLICY &quot;조직 멤버만 조직 정보 조회&quot;
ON organizations FOR SELECT
USING (
id IN (
SELECT organization_id
FROM memberships
WHERE user_id = auth.uid()
)
);</code></pre></p>
<p data-ke-size="size16"><b>USING 절은 WHERE 조건과 동일합니다:</b></p>
<pre class="pgsql"><code>-- RLS 정책
USING (auth.uid() = user_id)
<p>-- 실제 실행되는 쿼리
SELECT * FROM posts WHERE auth.uid() = user_id;</code></pre></p>
<h3 data-ke-size="size23">패턴 3: 공개 + 소유자</h3>
<pre class="routeros"><code>CREATE POLICY "공개 게시글은 모두, 비공개는 본인만"
ON posts FOR SELECT
USING (
  is_published = true 
  OR auth.uid() = user_id
);</code></pre>
<h3 data-ke-size="size23">패턴 4: 역할 기반 접근</h3>
<pre class="routeros"><code>CREATE POLICY "관리자는 모든 게시글 수정 가능"
ON posts FOR UPDATE
USING (
  auth.uid() = user_id 
  OR 
  (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
);</code></pre>
<h3 data-ke-size="size23">패턴 5: 복잡한 관계 (팀 프로젝트)</h3>
<pre class="sql"><code>-- 프로젝트 테이블 (user_id 없음)
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  name TEXT
);
<p>-- 팀 멤버십
CREATE TABLE team_members (
team_id UUID REFERENCES teams(id),
user_id UUID REFERENCES auth.users(id),
role TEXT
);</p>
<p>-- 팀 멤버만 프로젝트 접근
CREATE POLICY &quot;팀 멤버 전용&quot;
ON projects FOR ALL
USING (
team_id IN (
SELECT team_id
FROM team_members
WHERE user_id = auth.uid()
)
);</code></pre></p>
<h3 data-ke-size="size23">패턴 6: EXISTS를 사용한 존재 여부 확인</h3>
<pre class="routeros"><code>-- "내가 좋아요 누른 게시글만 보기"
CREATE POLICY "liked_posts_only"
ON posts FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM post_likes 
    WHERE post_id = posts.id 
    AND user_id = auth.uid()
  )
);</code></pre>
<h3 data-ke-size="size23">헬퍼 함수로 재사용성 높이기</h3>
<pre class="pgsql"><code>-- 자주 쓰는 체크를 함수로 만들기
CREATE FUNCTION is_team_member(team_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = team_uuid
    AND user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER;
<p>-- 여러 테이블에서 재사용
CREATE POLICY &quot;팀 접근&quot;
ON projects FOR SELECT
USING (is_team_member(team_id));</p>
<p>CREATE POLICY &quot;팀 접근&quot;
ON tasks FOR SELECT
USING (is_team_member(team_id));</code></pre></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">5. RPC + RLS 실전 예제</h2>
<h3 data-ke-size="size23">시나리오: 팀 프로젝트 관리 시스템</h3>
<p data-ke-size="size16"><b>요구사항:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>프로젝트 생성 시 자동으로 작업(task) 3개 생성 (트랜잭션 필요)</li>
<li>팀 멤버만 프로젝트와 작업 접근 가능 (RLS 필요)</li>
</ul>
<h3 data-ke-size="size23">1단계: 테이블 구조</h3>
<pre class="routeros"><code>-- 팀
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);
<p>-- 팀 멤버
CREATE TABLE team_members (
team_id UUID REFERENCES teams(id),
user_id UUID REFERENCES auth.users(id),
role TEXT DEFAULT 'member',
PRIMARY KEY (team_id, user_id)
);</p>
<p>-- 프로젝트 (user_id 없음!)
CREATE TABLE projects (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
team_id UUID REFERENCES teams(id),
name TEXT NOT NULL,
created_at TIMESTAMPTZ DEFAULT now()
);</p>
<p>-- 작업
CREATE TABLE tasks (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
project_id UUID REFERENCES projects(id),
title TEXT NOT NULL,
status TEXT DEFAULT 'todo'
);</code></pre></p>
<h3 data-ke-size="size23">2단계: RLS 정책 설정</h3>
<pre class="sql"><code>-- 모든 테이블 RLS 활성화
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
<p>-- 팀: 멤버만 조회
CREATE POLICY &quot;팀 멤버만 팀 조회&quot;
ON teams FOR SELECT
USING (
id IN (
SELECT team_id
FROM team_members
WHERE user_id = auth.uid()
)
);</p>
<p>-- 프로젝트: 팀 멤버만 접근 (관계 테이블 통해 확인!)
CREATE POLICY &quot;팀 멤버만 프로젝트 접근&quot;
ON projects FOR ALL
USING (
team_id IN (
SELECT team_id
FROM team_members
WHERE user_id = auth.uid()
)
);</p>
<p>-- 작업: 프로젝트의 팀 멤버만 접근 (2단계 관계!)
CREATE POLICY &quot;팀 멤버만 작업 접근&quot;
ON tasks FOR ALL
USING (
project_id IN (
SELECT p.id
FROM projects p
INNER JOIN team_members tm ON p.team_id = tm.team_id
WHERE tm.user_id = auth.uid()
)
);</p>
<p>-- 팀 멤버: 본인 멤버십만 조회
CREATE POLICY &quot;본인 멤버십 조회&quot;
ON team_members FOR SELECT
USING (user_id = auth.uid());</code></pre></p>
<h3 data-ke-size="size23">3단계: RPC 함수 (트랜잭션 + RLS)</h3>
<pre class="pgsql"><code>CREATE OR REPLACE FUNCTION create_project_with_tasks(
  p_team_id UUID,
  p_project_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- 함수 소유자 권한으로 실행
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
  v_is_member BOOLEAN;
BEGIN
  -- 1. 권한 확인: 요청자가 팀 멤버인지 체크
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id
    AND user_id = auth.uid()
  ) INTO v_is_member;
<p>IF NOT v_is_member THEN
RETURN json_build_object(
'success', false,
'error', '팀 멤버만 프로젝트를 생성할 수 있습니다'
);
END IF;</p>
<p>-- 2. 프로젝트 생성 (트랜잭션 시작)
INSERT INTO projects (team_id, name)
VALUES (p_team_id, p_project_name)
RETURNING id INTO v_project_id;</p>
<p>-- 3. 기본 작업 3개 생성
INSERT INTO tasks (project_id, title, status)
VALUES
(v_project_id, '요구사항 분석', 'todo'),
(v_project_id, '설계', 'todo'),
(v_project_id, '개발', 'todo');</p>
<p>-- 모두 성공 → 자동 커밋
RETURN json_build_object(
'success', true,
'project_id', v_project_id
);</p>
<p>EXCEPTION
WHEN OTHERS THEN
-- 에러 발생 → 자동 롤백
RETURN json_build_object(
'success', false,
'error', SQLERRM
);
END;
$$;</code></pre></p>
<h3 data-ke-size="size23">4단계: Next.js Route Handler</h3>
<pre class="javascript"><code>// app/api/projects/create/route.ts
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
<p>export async function POST(request: Request) {
const { teamId, projectName } = await request.json();</p>
<p>// 사용자 세션을 포함한 클라이언트 생성
const cookieStore = cookies();
const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{
cookies: {
get(name: string) {
return cookieStore.get(name)?.value;
},
},
}
);</p>
<p>// RPC 호출 (RLS 적용됨!)
const { data, error } = await supabase.rpc('create_project_with_tasks', {
p_team_id: teamId,
p_project_name: projectName
});</p>
<p>if (error || !data.success) {
return Response.json(
{ error: data?.error || error.message },
{ status: 500 }
);
}</p>
<p>return Response.json({
success: true,
projectId: data.project_id
});
}</code></pre></p>
<h3 data-ke-size="size23">5단계: React 컴포넌트</h3>
<pre class="javascript"><code>// components/CreateProjectForm.tsx
'use client';
<p>import { useState } from 'react';</p>
<p>export function CreateProjectForm({ teamId }: { teamId: string }) {
const [projectName, setProjectName] = useState('');
const [loading, setLoading] = useState(false);</p>
<p>const handleSubmit = async (e: React.FormEvent) =&gt; {
e.preventDefault();
setLoading(true);</p>
<pre><code>try {
  const response = await fetch('/api/projects/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId, projectName })
  });

  const result = await response.json();

  if (result.success) {
    alert('프로젝트가 생성되었습니다!');
    // 프로젝트 + 작업 3개가 한 번에 생성됨 (트랜잭션)
  } else {
    alert(result.error);
  }
} catch (error) {
  console.error(error);
} finally {
  setLoading(false);
}
</code></pre>
<p>};</p>
<p>return (
&lt;form onSubmit={handleSubmit}&gt;
&lt;input
type=&quot;text&quot;
value={projectName}
onChange={(e) =&gt; setProjectName(e.target.value)}
placeholder=&quot;프로젝트 이름&quot;
required
/&gt;
&lt;button type=&quot;submit&quot; disabled={loading}&gt;
{loading ? '생성 중...' : '프로젝트 생성'}
&lt;/button&gt;
&lt;/form&gt;
);
}</code></pre></p>
<h3 data-ke-size="size23">동작 흐름</h3>
<pre class="markdown"><code>1. 사용자가 프로젝트 생성 버튼 클릭
   &darr;
2. Next.js API Route 호출
   &darr;
3. RPC 함수 실행 (PostgreSQL)
   - 권한 체크 (팀 멤버인가?)
   - 프로젝트 INSERT (트랜잭션 시작)
   - 작업 3개 INSERT
   - 모두 성공 &rarr; COMMIT
   - 하나라도 실패 &rarr; ROLLBACK
   &darr;
4. 사용자가 데이터 조회 시
   - RLS가 자동으로 팀 멤버 확인
   - 권한 있는 데이터만 반환</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">6. 주의사항과 베스트 프랙티스</h2>
<h3 data-ke-size="size23">⚠️ 주의사항</h3>
<h4 data-ke-size="size20">1. SECURITY DEFINER의 양날의 검</h4>
<pre class="pgsql"><code>CREATE FUNCTION my_function()
SECURITY DEFINER  -- 함수 소유자 권한으로 실행
AS $$
BEGIN
  -- 이 안에서는 RLS가 우회될 수 있음!
  -- 반드시 함수 내부에서 권한 체크 필수
END;
$$;</code></pre>
<p data-ke-size="size16"><b>해결책: 명시적 권한 확인</b></p>
<pre class="sql"><code>CREATE FUNCTION secure_function()
SECURITY DEFINER
AS $$
BEGIN
  -- 1. 반드시 권한 확인!
  IF NOT EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION '권한이 없습니다';
  END IF;
<p>-- 2. 실제 작업 수행
UPDATE ...
END;
$$;</code></pre></p>
<h4 data-ke-size="size20">2. 성능 고려</h4>
<pre class="sql"><code>-- ❌ 복잡한 서브쿼리는 성능 저하
CREATE POLICY "complex_policy"
ON posts FOR SELECT
USING (
  (SELECT count(*) FROM likes WHERE post_id = posts.id) &gt; 100
  AND created_at &gt; now() - interval '7 days'
  AND auth.uid() IN (
    SELECT follower_id FROM follows WHERE following_id = user_id
  )
);
<p>-- ✅ 인덱스 추가로 최적화
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_follows_following ON follows(following_id, follower_id);</code></pre></p>
<h4 data-ke-size="size20">3. RLS 디버깅</h4>
<pre class="cs"><code>// RLS 때문에 데이터가 안 보일 때
const { data, error } = await supabase
  .from('projects')
  .select('*');
<p>console.log('Error:', error);
// &quot;row-level security policy&quot; 에러 → RLS 정책 확인</p>
<p>// Supabase Dashboard에서 직접 확인
// SQL Editor → SELECT * FROM projects (RLS 우회)
// Table Editor → 일반 사용자로 로그인해서 테스트</code></pre></p>
<h3 data-ke-size="size23">✅ 베스트 프랙티스</h3>
<h4 data-ke-size="size20">1. RLS 체크리스트</h4>
<pre class="routeros"><code>-- ✓ 1. 모든 테이블 RLS 활성화
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
<p>-- ✓ 2. 정책 없으면 기본 deny (안전)
-- 이 상태에서 SELECT하면 빈 결과</p>
<p>-- ✓ 3. 최소 권한 원칙
CREATE POLICY &quot;최소한의 접근만&quot;
ON posts FOR SELECT  -- SELECT만 허용
USING (auth.uid() = user_id);</p>
<p>-- ✓ 4. 명확한 정책 이름
CREATE POLICY &quot;team_members_read_projects&quot;  -- ✓ 명확
CREATE POLICY &quot;policy1&quot;  -- ✗ 불명확</code></pre></p>
<h4 data-ke-size="size20">2. RPC 함수 패턴</h4>
<pre class="pgsql"><code>CREATE OR REPLACE FUNCTION my_function(
  p_param1 TYPE,  -- p_ 접두사로 파라미터 구분
  p_param2 TYPE
)
RETURNS JSON  -- 항상 JSON 반환 (에러 처리 용이)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- SQL injection 방지
AS $$
DECLARE
  v_variable TYPE;  -- v_ 접두사로 변수 구분
BEGIN
  -- 1. 권한 확인 (필수!)
  IF NOT authorized THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
<p>-- 2. 비즈니스 로직
-- ...</p>
<p>-- 3. 성공 응답
RETURN json_build_object('success', true, 'data', v_variable);</p>
<p>EXCEPTION
WHEN OTHERS THEN
-- 4. 에러 처리
RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;</code></pre></p>
<h4 data-ke-size="size20">3. 테이블 설계 가이드</h4>
<pre class="sql"><code>-- 사용자 소유 데이터 &rarr; user_id 필수
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,  -- ✓
  title TEXT
);
<p>-- 조직/팀 소유 → organization_id + 멤버십 테이블
CREATE TABLE projects (
id UUID PRIMARY KEY,
team_id UUID REFERENCES teams(id) NOT NULL,  -- user_id 불필요
name TEXT
);</p>
<p>-- 공개 데이터 → RLS true 또는 비활성화
CREATE TABLE categories (
id UUID PRIMARY KEY,
name TEXT
-- user_id 불필요
);</code></pre></p>
<h4 data-ke-size="size20">4. 환경 변수 관리</h4>
<pre class="ini"><code># .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key  # 클라이언트용 (RLS 적용)
SUPABASE_SERVICE_ROLE_KEY=your-service-key   # 서버용 (RLS 우회)</code></pre>
<pre class="arduino"><code>// 클라이언트 (브라우저)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // RLS 적용됨
);
<p>// 서버 (Route Handler)
const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!  // RLS 우회 (주의!)
);</code></pre></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">  결론</h2>
<h3 data-ke-size="size23">RPC를 사용하는 이유</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>트랜잭션 보장</b>: 여러 테이블 업데이트를 원자적으로 처리</li>
<li><b>복잡한 비즈니스 로직</b>: SQL의 강력함 활용</li>
<li><b>성능 최적화</b>: 네트워크 왕복 최소화</li>
<li><b>보안</b>: 민감한 로직을 DB에서 실행</li>
</ol>
<h3 data-ke-size="size23">RLS를 타이트하게 설정하는 이유</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>클라이언트 직접 접근 보호</b>: 공개 키로도 안전</li>
<li><b>행 단위 세밀한 제어</b>: 사용자별, 조직별 데이터 격리</li>
<li><b>관계 테이블 활용</b>: user_id 없이도 복잡한 권한 체크 가능</li>
<li><b>자동 적용</b>: 개발자가 권한 체크 깜빡해도 DB가 보호</li>
</ol>
<h3 data-ke-size="size23">핵심 기억사항</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Supabase JS는 트랜잭션 미지원</b> &rarr; RPC 사용</li>
<li><b>RLS의 USING 절 = WHERE 조건</b> &rarr; 서브쿼리, JOIN 모두 가능</li>
<li><b>관계 테이블로 권한 확인 가능</b> &rarr; user_id 필수 아님</li>
<li><b>SECURITY DEFINER는 조심히</b> &rarr; 함수 내부에서 권한 체크 필수</li>
<li><b>RPC + RLS = 안전한 트랜잭션</b> &rarr; 최고의 조합</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">  참고 자료</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><a href="https://supabase.com/docs/guides/database/functions">Supabase RPC 공식 문서</a></li>
<li><a href="https://www.postgresql.org/docs/current/ddl-rowsecurity.html">PostgreSQL Row Level Security</a></li>
<li><a href="https://supabase.com/docs/guides/auth/auth-helpers/nextjs">Supabase Auth Helpers</a></li>
</ul>