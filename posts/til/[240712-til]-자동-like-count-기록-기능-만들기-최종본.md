<h2 data-ke-size="size26">기본 세팅</h2>
<p data-ke-size="size16">가장 먼저 supabase 기본 auth 를 보강해줄 users public table 이 필요합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<table style="border-collapse: collapse; width: 100%; height: 121px;" border="1" data-ke-align="alignLeft" data-ke-style="style8">
<tbody>
<tr style="height: 19px;">
<td style="width: 16.6667%; height: 19px;">컬럼명</td>
<td style="width: 16.6667%; height: 19px;">타입</td>
<td style="width: 16.6667%; height: 19px;">용도</td>
<td style="width: 16.6667%; height: 19px;">입력방법</td>
<td style="width: 16.6667%; height: 19px;">외래키</td>
</tr>
<tr style="height: 17px;">
<td style="width: 16.6667%; height: 17px;">id</td>
<td style="width: 16.6667%; height: 17px;">uuid</td>
<td style="width: 16.6667%; height: 17px;">auth 스키마 연결</td>
<td style="width: 16.6667%; height: 17px;">자동입력(유니크)</td>
<td style="width: 16.6667%; height: 17px;">O</td>
</tr>
<tr style="height: 17px;">
<td style="width: 16.6667%; height: 17px;">created_at</td>
<td style="width: 16.6667%; height: 17px;">timestampz</td>
<td style="width: 16.6667%; height: 17px;">작성일</td>
<td style="width: 16.6667%; height: 17px;">자동입력</td>
<td style="width: 16.6667%; height: 17px;">X</td>
</tr>
<tr style="height: 17px;">
<td style="width: 16.6667%; height: 17px;">email</td>
<td style="width: 16.6667%; height: 17px;">varchar</td>
<td style="width: 16.6667%; height: 17px;">회원식별</td>
<td style="width: 16.6667%; height: 17px;">회원가입 시 자동입력</td>
<td style="width: 16.6667%; height: 17px;">X</td>
</tr>
<tr style="height: 17px;">
<td style="width: 16.6667%; height: 17px;">nickname</td>
<td style="width: 16.6667%; height: 17px;">text</td>
<td style="width: 16.6667%; height: 17px;">회원식별</td>
<td style="width: 16.6667%; height: 17px;">회원가입 시 자동입력</td>
<td style="width: 16.6667%; height: 17px;">X</td>
</tr>
<tr style="height: 17px;">
<td style="width: 16.6667%; height: 17px;">avatar</td>
<td style="width: 16.6667%; height: 17px;">text</td>
<td style="width: 16.6667%; height: 17px;">마이페이지 렌더링</td>
<td style="width: 16.6667%; height: 17px;">회원가입 시 자동입력</td>
<td style="width: 16.6667%; height: 17px;">X</td>
</tr>
<tr style="height: 17px;">
<td style="width: 16.6667%; height: 17px;">introduction</td>
<td style="width: 16.6667%; height: 17px;">text</td>
<td style="width: 16.6667%; height: 17px;">마이페이지 렌더링</td>
<td style="width: 16.6667%; height: 17px;">마이페이지에서 입력</td>
<td style="width: 16.6667%; height: 17px;">X</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위와 같이 테이블을 생성하고, 아래 sql 을 적용합니다.</p>
<pre class="pgsql"><code>-- 새로운 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.handle_new_user_custom()
RETURNS TRIGGER AS $$ BEGIN INSERT
INTO public.users (id, email, nickname)
VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data-&gt;&gt;'user_name');
RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
-- 새로운 트리거 생성
CREATE TRIGGER on_auth_user_created_custom
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_custom();</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그리고 주요 콘텐츠가 저장될 posts 테이블은 아래와 같습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<table style="border-collapse: collapse; width: 100%; height: 121px;" border="1" data-ke-align="alignLeft" data-ke-style="style8">
<tbody>
<tr style="height: 19px;">
<td style="width: 16.6667%; height: 19px;">컬럼명</td>
<td style="width: 16.6667%; height: 19px;">타입</td>
<td style="width: 16.6667%; height: 19px;">용도</td>
<td style="width: 16.6667%; height: 19px;">입력방법</td>
<td style="width: 16.6667%; height: 19px;">외래키</td>
</tr>
<tr style="height: 17px;">
<td style="width: 16.6667%; height: 17px;">id</td>
<td style="width: 16.6667%; height: 17px;">uuid</td>
<td style="width: 16.6667%; height: 17px;">고유 아이디</td>
<td style="width: 16.6667%; height: 17px;">자동입력(유니크)</td>
<td style="width: 16.6667%; height: 17px;">X</td>
</tr>
<tr style="height: 17px;">
<td style="width: 16.6667%; height: 17px;">created_at</td>
<td style="width: 16.6667%; height: 17px;"><span style="text-align: start;">timestamptz</span></td>
<td style="width: 16.6667%; height: 17px;"><span style="text-align: start;">작성일</span></td>
<td style="width: 16.6667%; height: 17px;"><span style="text-align: start;">자동입력</span></td>
<td style="width: 16.6667%; height: 17px;">X</td>
</tr>
<tr style="height: 17px;">
<td style="width: 16.6667%; height: 17px;">contents</td>
<td style="width: 16.6667%; height: 17px;">text</td>
<td style="width: 16.6667%; height: 17px;">글 내용</td>
<td style="width: 16.6667%; height: 17px;">글 생성시</td>
<td style="width: 16.6667%; height: 17px;">X</td>
</tr>
<tr style="height: 17px;">
<td style="width: 16.6667%; height: 17px;">nickname</td>
<td style="width: 16.6667%; height: 17px;">text</td>
<td style="width: 16.6667%; height: 17px;"><span style="text-align: start;">작성자</span></td>
<td style="width: 16.6667%; height: 17px;">글 생성시</td>
<td style="width: 16.6667%; height: 17px;">X</td>
</tr>
<tr style="height: 17px;">
<td style="width: 16.6667%; height: 17px;">email</td>
<td style="width: 16.6667%; height: 17px;">text</td>
<td style="width: 16.6667%; height: 17px;">작성자 이메일</td>
<td style="width: 16.6667%; height: 17px;">글 생성시</td>
<td style="width: 16.6667%; height: 17px;">X</td>
</tr>
<tr style="height: 17px;">
<td style="width: 16.6667%; height: 17px;">avatar</td>
<td style="width: 16.6667%; height: 17px;">text</td>
<td style="width: 16.6667%; height: 17px;"><span style="text-align: start;">유저 프로필 사진</span></td>
<td style="width: 16.6667%; height: 17px;">글 생성시</td>
<td style="width: 16.6667%; height: 17px;">X</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">또한 아래와 같이 likes를 관리하는 테이블이 있어야 합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<table style="border-collapse: collapse; width: 100%;" border="1" data-ke-align="alignLeft">
<tbody>
<tr>
<td style="width: 16.6667%;">컬럼명</td>
<td style="width: 12.7132%;">타입</td>
<td style="width: 25.1551%;">용도</td>
<td style="width: 15.6202%;">입력방법</td>
<td style="width: 13.1783%;">외래키</td>
</tr>
<tr>
<td style="width: 16.6667%;">id</td>
<td style="width: 12.7132%;">uuid</td>
<td style="width: 25.1551%;">고유 아이디</td>
<td style="width: 15.6202%;">자동입력(유니크)</td>
<td style="width: 13.1783%;">X</td>
</tr>
<tr>
<td style="width: 16.6667%;">created_at</td>
<td style="width: 12.7132%;">timestamptz</td>
<td style="width: 25.1551%;">작성일</td>
<td style="width: 15.6202%;">자동입력</td>
<td style="width: 13.1783%;">X</td>
</tr>
<tr>
<td style="width: 16.6667%;">postid</td>
<td style="width: 12.7132%;">uuid</td>
<td style="width: 25.1551%;">posts의 id와 연결(카운트용)</td>
<td style="width: 15.6202%;">자동입력</td>
<td style="width: 13.1783%;">O</td>
</tr>
<tr>
<td style="width: 16.6667%;">userid</td>
<td style="width: 12.7132%;">uuid</td>
<td style="width: 25.1551%;">users의 id와 연결(카운트용)</td>
<td style="width: 15.6202%;">자동입력</td>
<td style="width: 13.1783%;">O</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">자동 컬럼 값 변경 SQL</h2>
<h3 data-ke-size="size23">1. add likes column</h3>
<p data-ke-size="size16">먼저 posts 테이블에 likecount 컬럼을 추가합니다.</p>
<pre class="routeros"><code>ALTER TABLE posts ADD COLUMN likecount INTEGER DEFAULT 0;</code></pre>
<h3 data-ke-size="size23">2. manual update column likes</h3>
<p data-ke-size="size16">그 후 필요하다면 수동으로 한번 likecount 값을 업데이트 해줍니다.</p>
<pre class="n1ql"><code>UPDATE posts SET likecount = (SELECT COUNT(*) FROM cheerup WHERE cheerup.postid = posts.id);</code></pre>
<h3 data-ke-size="size23">3. function</h3>
<p data-ke-size="size16">likes 테이블이 insert, delete 될 때마다 작동하는 함수를 만들어 줍니다.<br />이때 마지막에 SECURITY DEFINER 를 꼭 붙여줘야 합니다!</p>
<pre class="pgsql"><code>CREATE OR REPLACE FUNCTION update_likecount()
RETURNS TRIGGER AS $$
BEGIN
<p>IF (TG_OP = 'INSERT') THEN
UPDATE posts
SET likecount = (
SELECT COUNT(*)
FROM cheerup
WHERE cheerup.postid = NEW.postid
)
WHERE id = NEW.postid;</p>
<p>ELSIF (TG_OP = 'DELETE') THEN
UPDATE posts
SET likecount = (
SELECT COUNT(*)
FROM cheerup
WHERE cheerup.postid = OLD.postid
)
WHERE id = OLD.postid;
END IF;</p>
<p>RETURN NULL;
END;</p>
<p>$$ LANGUAGE plpgsql SECURITY DEFINER;</code></pre></p>
<h3 data-ke-size="size23">4. trigger</h3>
<p data-ke-size="size16">위에서 작성한 함수를 트리거로 등록해줍니다.</p>
<pre class="n1ql"><code>-- After INSERT or DELETE on cheerup
CREATE TRIGGER trigger_update_likecount
AFTER INSERT OR DELETE ON cheerup
FOR EACH ROW
EXECUTE FUNCTION update_likecount();</code></pre>
<p data-ke-size="size16">야호! 끝!! 이제 posts 테이블의 likecount 컬럼은 likes(여기서는 cheerup)에 insert, delete 가 있을 때마다 자동으로 값이 변경됩니다.</p>
<h3 data-ke-size="size23">5. drop trigger</h3>
<p data-ke-size="size16">테스트등을 위해 트리거를 드랍할 수 있는 방법입니다.</p>
<pre class="n1ql"><code>DROP TRIGGER IF EXISTS trigger_update_likecount ON cheerup;</code></pre>
<h3 data-ke-size="size23">번외. likes view 만들기</h3>
<p data-ke-size="size16">직접 posts 테이블에 likecount 컬럼을 추가하지 않고 따로 view 를 만들려면 아래와 같이 할 수 있습니다.</p>
<pre class="n1ql"><code>CREATE VIEW cheerup_likes AS
SELECT
posts.id AS postid,
posts.contents,
COUNT(cheerup.id) AS likecount
FROM posts
LEFT JOIN cheerup ON posts.id = cheerup.postid
GROUP BY posts.id;</code></pre>