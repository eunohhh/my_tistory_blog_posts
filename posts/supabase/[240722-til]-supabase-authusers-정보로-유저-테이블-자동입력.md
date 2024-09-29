<h2 data-ke-size="size26">auth.users 를 보강하기위해 public.users 생성</h2>
<p data-ke-size="size16">supabase auth 를 사용할 경우, auth.users 스키마만으로는<br />프로젝트 필요한 정보들을 모두 컨트롤 할 수 없습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그래서 보통 users 같은 테이블을 하나 만들어서 쓰는 것이 보통이라고 합니다.</p>
<p data-ke-size="size16">그래서 저희도 이에 해당하는 buddies 테이블을 만들었습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">하지만 문제는 유저가 회원가입 혹은 소셜로그인을 하여<br />auth.users 에 로우가 추가되어도, 직접 만든 buddies 테이블(public.buddies) 에는<br />로우가 자동으로 추가되지 않는다는 점입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그래서 이를 해결하기 위해 간단한 SQL 사용해보기로 했습니다.</p>
<h2 data-ke-size="size26">auth.users 변경시 자동으로 users 테이블에 로우를 추가</h2>
<p data-ke-size="size16">처음에는 아래 정도의 로직을 생각했습니다.</p>
<pre class="pgsql"><code>-- 새로운 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.handle_new_user_custom()
RETURNS TRIGGER AS $$ BEGIN INSERT
INTO public.users (id, email, nickname)
VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data-&gt;&gt;'user_name');
RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
<p>-- 새로운 트리거 생성
CREATE TRIGGER on_auth_user_created_custom
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_custom();</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">auth.users 에 insert 가 발생하면 여기에서 id, email, raw_user.meta_data 컬럼을 가져다가<br />public.users 의 id, email, nickname에 쓰는 것입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">여기서 문제가 생겼습니다.</p>
<h2 data-ke-size="size26">nickname은 unique 하고 nullable 하지 않아야 한다?</h2>
<p data-ke-size="size16">우리의 테이블에서 nickname은 nullable 하지 않고<br />unique 하여야 합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그런데 위 SQL 대로라면 raw_user_meta_data--&gt;'user_name'이<br />만약 null 일 경우에 대처할 수 없습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">거기다 우리는 사용자의 개별 페이지를<br /><code>도메인.com/닉네임or고유아이디(텍스트)</code><br />같은 구조로 만들고 싶었습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그래서 nickname 은 꼭 고유한 값이 필요했습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">고민끝에 생각해낸 해결책은<br />만일 raw_user_meta_data--&gt;'user_name' 이 null 등으로 참조할 값이 없을 경우,</p>
<p data-ke-size="size16">'user_12314125' 같은 랜덤하고 고유한 nickname이 자동 부여되도록 하는 것이었습니다.</p>
<h2 data-ke-size="size26">최종 SQL</h2>
<pre class="pgsql"><code>CREATE OR REPLACE FUNCTION public.handle_new_user_custom()
RETURNS TRIGGER AS $$
DECLARE
    new_nickname TEXT;
BEGIN
    -- 기본 닉네임 생성
    new_nickname := 'user_' || substring(md5(random()::text), 1, 8);
    -- nickname이 이미 존재하는지 검사
    WHILE EXISTS 
        (SELECT 1 FROM public.buddies WHERE buddy_nickname = new_nickname) LOOP
        -- 중복 발생 시 다른 유니크한 닉네임 생성
        new_nickname := 'user_' || substring(md5(random()::text), 1, 8);
    END LOOP;
<p>INSERT INTO public.buddies (buddy_id, buddy_email, buddy_nickname, buddy_profile_pic)
VALUES (
NEW.id,
NEW.email,
new_nickname,
CASE
WHEN NEW.raw_user_meta_data-&gt;&gt;'avatar_url' IS NOT NULL
THEN NEW.raw_user_meta_data-&gt;&gt;'avatar_url'
ELSE NULL
END
);
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;</p>
<p>-- 새로운 트리거 생성
CREATE TRIGGER on_auth_user_created_custom
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_custom();</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이렇게 함으로써 nickname은 항상 unique 한 값을 갖게 됩니다.</p>