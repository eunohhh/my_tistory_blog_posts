<p data-ke-size="size16">수파베이스 db 복제하고 싶을때(단 backup.gz 파일 있어야함)</p>
<h2 data-ke-size="size26">0. psql 설치</h2>
<pre class="mipsasm"><code>brew install libpq</code></pre>
<pre class="jboss-cli"><code>echo 'export PATH="/usr/local/opt/libpq/bin:$PATH"' &gt;&gt; ~/.zshrc
source ~/.zshrc</code></pre>
<h2 data-ke-size="size26">1. zip 해제</h2>
<pre class="applescript"><code>gunzip path/to/your/file/db_dump.backup.gz</code></pre>
<h2 data-ke-size="size26">2. psql 명령어로 백업 파일 복원하기</h2>
<pre class="applescript"><code>psql -h 호스트명 -p 포트명 -U 사용자명 -d 디비이름 -f path/to/your/file/db_dump.backup</code></pre>
<p data-ke-size="size16">&bull; -h: 호스트 이름 (Supabase에서 제공하는 데이터베이스 호스트)<br />&bull; -p: 포트 번호<br />&bull; -U: PostgreSQL 사용자 이름<br />&bull; -d: 대상 데이터베이스 이름<br />&bull; -f: 복원할 백업 파일의 경로</p>
<p data-ke-size="size16">끝!@<br />sql 쿼리도 전부 복사됨</p>
<p data-ke-size="size16"><b><i>주의: 스토리지는 복사안됨</i></b></p>