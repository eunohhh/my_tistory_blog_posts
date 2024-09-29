<p data-ke-size="size16">수파베이스 auth 를 사용할 때, auth.users 스키마에 row 추가시(즉 회원가입시)<br />자동으로 custom users(프로젝트별로 이름은 다를것) 테이블에 auth.users 스키마에 추가되는 데이터를 가져오는 방법을 연구했습니다.</p>
<h2 data-ke-size="size26">SQL</h2>
<pre class="pgsql"><code>CREATE OR REPLACE FUNCTION public.handle_new_user_custom()
RETURNS TRIGGER AS $$
BEGIN
-- 아래 buddy 어쩌구는 프로젝트에 맞게 수정하면 됩니다.
INSERT INTO public.buddies (buddy_id, buddy_email, buddy_nickname, buddy_profile_pic)
VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data-&gt;&gt;'user_name',
    CASE
        WHEN NEW.raw_user_meta_data-&gt;&gt;'avatar_url' IS NOT NULL
        THEN NEW.raw_user_meta_data-&gt;&gt;'avatar_url'
    ELSE NULL
    END
);
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;  
<p>-- 새로운 트리거 생성
CREATE TRIGGER on_auth_user_created_custom
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_custom();</code></pre></p>
<p data-ke-size="size16">이제 INSERT 발생시 public.buddies(users 테이블임) 에 자동으로 기본적인 데이터가 추가됩니다.</p>