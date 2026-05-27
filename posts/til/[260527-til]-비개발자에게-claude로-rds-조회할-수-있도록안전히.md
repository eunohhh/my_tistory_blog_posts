<h1>비개발 팀에게 RDS 조회 환경을 안전하게 전달하기</h1>
<h2 data-ke-size="size26">1. 배경</h2>
<p data-ke-size="size16">HQ 마케터와 기획자가 내부 데이터를 직접 확인해야 하는 상황이 있었다.<br /><br />다만 이들은 SQL이나 개발 환경에 익숙하지 않았고, <br />RDS를 직접 노출하거나 관리자 계정을 공유하는 방식은 보안상 적절하지 않았다.<br /><br /></p>
<p data-ke-size="size16">그래서 다음 조건을 만족하는 방식을 구성했다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>RDS는 외부에 직접 공개하지 않는다.</li>
<li>Bastion EC2를 통해서만 접근한다.</li>
<li>HQ 전용 DB 계정은 SELECT 권한만 가진다.</li>
<li>비개발자는 복잡한 SSH 명령어를 직접 입력하지 않는다.</li>
<li>Windows 환경에서도 실행 가능해야 한다.</li>
<li>Claude Desktop의 MCP Postgres 서버에서 사용할 수 있어야 한다.</li>
</ul>
<h2 data-ke-size="size26">2. 최종 아키텍처</h2>
<pre class="properties"><code>HQ Windows PC
  &darr; PowerShell SSH Tunnel
localhost:15432
  &darr;
EC2 Bastion
  &darr;
RDS PostgreSQL:5432</code></pre>
<p data-ke-size="size16"><br />Claude Desktop에서는 RDS endpoint를 직접 바라보지 않고, 로컬 터널 주소인 <code>localhost:15432</code>로 접속한다.</p>
<pre class="dts"><code>postgresql://hq_readonly_user:password@localhost:15432/mydb</code></pre>
<h2 data-ke-size="size26"><b>3. RDS에 readonly 계정 만들기</b></h2>
<p data-ke-size="size16">먼저 HQ 전용 계정을 만들고, 필요한 schema에 대해 권한을 부여했다.</p>
<p data-ke-size="size16">여기서 <code>USAGE ON SCHEMA</code>는 스키마 내부 객체에 접근하기 위한 권한이다.<br /><br />테이블에 <code>SELECT</code> 권한을 주더라도, 해당 스키마에 대한 <code>USAGE</code> 권한이 없으면 <code>serving.some_table</code>에 접근할 수 없다.</p>
<p data-ke-size="size16">그래서 readonly 계정에는 다음 순서로 권한을 부여했다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>DB 접속 권한</li>
<li>스키마 사용 권한</li>
<li>기존 테이블/시퀀스 조회 권한</li>
<li>앞으로 생성될 테이블/시퀀스에 대한 기본 조회 권한</li>
</ol>
<pre class="sql"><code>CREATE USER hq_readonly_user WITH PASSWORD 'strong_password';
<p>GRANT CONNECT ON DATABASE mydb TO hq_readonly_user;
GRANT USAGE ON SCHEMA serving TO hq_readonly_user;</p>
<p>GRANT SELECT ON ALL TABLES IN SCHEMA serving TO hq_readonly_user;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA serving TO hq_readonly_user;</code></pre></p>
<p data-ke-size="size16"><br />그리고 앞으로 생성될 테이블에 대해서도 자동으로 SELECT 권한이 부여되도록 default privileges를 설정했다.</p>
<p data-ke-size="size16">여기서 주의할 점은 <code>FOR ROLE</code>에 들어가는 값은 DB 이름이 아니라, <br />실제로 테이블을 생성하는 role이어야 한다는 점이다.(ex: postgres)</p>
<pre class="pgsql"><code>SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'serving'
ORDER BY tablename;</code></pre>
<p data-ke-size="size16"><br />확인한 owner role을 기준으로 다음을 실행했다.</p>
<pre class="routeros"><code>ALTER DEFAULT PRIVILEGES FOR ROLE actual_owner_role IN SCHEMA serving
GRANT SELECT ON TABLES TO hq_readonly_user;
<p>ALTER DEFAULT PRIVILEGES FOR ROLE actual_owner_role IN SCHEMA serving
GRANT SELECT ON SEQUENCES TO hq_readonly_user;</code></pre></p>
<h2 data-ke-size="size26"><b>4. Bastion에 터널 전용 OS 계정 만들기</b></h2>
<p data-ke-size="size16">기본 계정인 <code>ec2-user</code>를 그대로 공유하지 않고, SSH 터널 전용 계정을 새로 만들었다.</p>
<pre class="groovy"><code>sudo adduser hq-tunnel
sudo mkdir -p /home/hq-tunnel/.ssh
sudo touch /home/hq-tunnel/.ssh/authorized_keys
<p>sudo chown -R hq-tunnel:hq-tunnel /home/hq-tunnel/.ssh
sudo chmod 700 /home/hq-tunnel/.ssh
sudo chmod 600 /home/hq-tunnel/.ssh/authorized_keys</code></pre></p>
<p data-ke-size="size16"><br />이 계정은 Bastion에서 작업하기 위한 계정이 아니라, RDS로 가는 SSH 터널을 열기 위한 계정이다.</p>
<p data-ke-size="size16">추가로 <code>/etc/ssh/sshd_config</code>에서 <code>hq-tunnel</code> 계정에만 별도 제한을 걸었다.<br /><br /></p>
<p data-ke-size="size16">이 계정은 Bastion 서버에서 명령을 실행하기 위한 계정이 아니라, RDS로 향하는 SSH 터널만 열기 위한 계정이다.<br />그래서 TCP forwarding은 허용하되, TTY, X11 forwarding, agent forwarding은 막았다.<br /><br /></p>
<p data-ke-size="size16"><code>PermitOpen</code>을 통해 이 계정이 열 수 있는 터널 목적지도 RDS의 5432 포트로 제한했다.</p>
<pre class="routeros"><code>Match User hq-tunnel
    AllowTcpForwarding yes &rarr; SSH 터널링 허용
    X11Forwarding no &rarr; GUI forwarding 차단
    AllowAgentForwarding no &rarr; SSH agent forwarding 차단
    PermitTTY no &rarr; 쉘 터미널 할당 차단
    ForceCommand /bin/false &rarr; 명령 실행 차단
    PermitOpen rds-endpoint:5432 &rarr; 지정한 RDS:5432로만 포워딩 허용</code></pre>
<pre class="properties"><code>sudo nano /etc/ssh/sshd_config
sudo systemctl restart sshd</code></pre>
<p data-ke-size="size16"><br />단, <code>ForceCommand /bin/false</code>를 적용한 뒤에는 실제 SSH 터널이 정상적으로 열리는지 반드시 테스트해야 한다.<br />환경에 따라 설정 조합이 잘못되면 쉘 접속뿐 아니라 터널링까지 실패할 수 있다.</p>
<h2 data-ke-size="size26"><b>5. SSH key 생성과 public key 등록</b></h2>
<p data-ke-size="size16">로컬에서 HQ용 key를 생성했다.</p>
<pre class="armasm"><code>ssh-keygen -t ed25519 -f ./hq-readonly-user</code></pre>
<p data-ke-size="size16"><br />생성 결과는 다음과 같다.</p>
<pre class="crmsh"><code>hq-readonly-user      # private key
hq-readonly-user.pub  # public key</code></pre>
<p data-ke-size="size16"><br />EC2의 <code>authorized_keys</code>에는 public key만 등록한다.</p>
<pre class="awk"><code>sudo nano /home/hq-tunnel/.ssh/authorized_keys</code></pre>
<p data-ke-size="size16"><br />단순히 public key를 넣는 대신, 이 key가 특정 RDS endpoint의 5432 포트로만 포워딩할 수 있도록 제한했다.</p>
<pre class="coffeescript"><code>no-pty,no-agent-forwarding,no-X11-forwarding,permitopen="my-rds-endpoint.ap-northeast-2.rds.amazonaws.com:5432" ssh-ed25519 AAAAC3... hq-readonly-user</code></pre>
<p data-ke-size="size16"><br />이 설정의 의미는 다음과 같다.</p>
<pre class="yaml"><code>no-pty              &rarr; 터미널 쉘 사용 제한
no-agent-forwarding &rarr; SSH agent forwarding 금지
no-X11-forwarding   &rarr; X11 forwarding 금지
permitopen          &rarr; 지정한 host:port로만 터널 허용</code></pre>
<h2 data-ke-size="size26"><b>6. Windows용 PowerShell 스크립트 만들기</b></h2>
<p data-ke-size="size16">HQ 사용자는 Windows 환경이었기 때문에, <br />SSH 명령어를 직접 입력하게 하지 않고 <code>.bat</code> 파일을 더블클릭하는 방식으로 만들었다.</p>
<p data-ke-size="size16">폴더 구조는 다음과 같다.</p>
<pre class="pgsql"><code>hq-rds-access/
  ├─ start-rds-tunnel.bat
  ├─ start-rds-tunnel.ps1
  └─ hq-readonly-user.pem</code></pre>
<p data-ke-size="size16"><br />PowerShell 스크립트는 다음과 같다.</p>
<pre class="powershell"><code>$KEY_PATH = "$PSScriptRoot\hq-readonly-user.pem"
$LOCAL_PORT = 15432
$RDS_ENDPOINT = "my-rds-endpoint.ap-northeast-2.rds.amazonaws.com"
$RDS_PORT = 5432
$BASTION_USER = "hq-tunnel"
$BASTION_HOST = "bastion-public-ip"
<p>Write-Host &quot;Preparing SSH key permission...&quot;
icacls &quot;$KEY_PATH&quot; /inheritance:r | Out-Null
icacls &quot;$KEY_PATH&quot; /grant:r &quot;$($env:USERNAME):(R)&quot; | Out-Null</p>
<p>Write-Host &quot;&quot;
Write-Host &quot;Starting RDS SSH tunnel...&quot;
Write-Host &quot;Local DB endpoint: localhost:$LOCAL_PORT&quot;
Write-Host &quot;Keep this PowerShell window open while using Claude/Desktop DB tools.&quot;
Write-Host &quot;&quot;</p>
<p>ssh -i &quot;$KEY_PATH&quot; <code>  -N</code>
-L ${LOCAL_PORT}:${RDS_ENDPOINT}:${RDS_PORT} `
${BASTION_USER}@${BASTION_HOST}</code></pre></p>
<p data-ke-size="size16"><br />비개발자가 더 쉽게 실행할 수 있도록 <code>.bat</code> 파일도 만들었다.</p>
<pre class="cmake"><code>@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0start-rds-tunnel.ps1"
pause</code></pre>
<p data-ke-size="size16"><br />사용자는 <code>start-rds-tunnel.bat</code>을 더블클릭하고, 열린 PowerShell 창을 유지하면 된다.</p>
<h2 data-ke-size="size26"><b>7. Claude Desktop MCP 설정</b></h2>
<p data-ke-size="size16">Claude Desktop의 Postgres MCP 서버는 RDS endpoint가 아니라 로컬 터널 주소를 바라보게 설정했다.</p>
<pre class="json"><code>{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://hq_readonly_user:password@localhost:15432/mydb"
      ]
    }
  }
}</code></pre>
<p data-ke-size="size16"><br />중요한 점은 다음과 같았다.</p>
<pre class="erlang"><code>RDS endpoint는 PowerShell SSH 터널 스크립트 안에만 들어간다.
Claude Desktop에는 localhost:15432를 넣는다.</code></pre>
<h2 data-ke-size="size26"><b>8. 중간에 만난 문제들</b></h2>
<h3 data-ke-size="size23"><b>Windows에서 icacls 오류</b></h3>
<p data-ke-size="size16">처음에는 다음 오류가 발생했다.</p>
<pre class="erlang"><code>"/grant:r" 매개 변수가 잘못되었습니다.</code></pre>
<p data-ke-size="size16"><br />원인은 PowerShell의 변수 해석 문제였다.<br />아래처럼 수정해서 해결했다.</p>
<pre class="dart"><code>icacls "$KEY_PATH" /grant:r "$($env:USERNAME):(R)" | Out-Null</code></pre>
<h3 data-ke-size="size23"><b>Permission denied publickey 오류</b></h3>
<p data-ke-size="size16">또 다른 문제는 SSH 접속 시 다음 오류였다.</p>
<pre class="lisp"><code>Permission denied (publickey,gssapi-keyex,gssapi-with-mic)</code></pre>
<p data-ke-size="size16"><br />확인해보니 Bastion 계정명이 <code>hq-tunnel</code>인데 스크립트에는 <code>hq_tunnel</code>처럼 다르게 들어간 문제가 있었다.<br />SSH 계정명, <code>authorized_keys</code> 위치, private/public key 쌍을 다시 확인해서 해결했다.</p>
<h3 data-ke-size="size23"><b>Ghostty에서 nano 실행 오류</b></h3>
<p data-ke-size="size16">Bastion에서 <code>nano</code>를 실행할 때 다음 오류도 있었다.</p>
<pre class="routeros"><code>ncurses: cannot initialize terminal type ($TERM="xterm-ghostty")</code></pre>
<p data-ke-size="size16"><br />서버가 <code>xterm-ghostty</code> terminfo를 몰라서 생긴 문제였고, 임시로 아래처럼 우회했다.</p>
<pre class="routeros"><code>export TERM=xterm-256color
nano /home/hq-tunnel/.ssh/authorized_keys</code></pre>
<h2 data-ke-size="size26"><b>9. 최종 사용 방식</b></h2>
<p data-ke-size="size16">HQ 사용자는 다음 순서만 알면 된다.</p>
<pre class="angelscript"><code>1. start-rds-tunnel.bat 실행
2. PowerShell 창 유지
3. Claude Desktop 실행
4. DB 관련 질문 또는 조회 작업 수행
5. 작업이 끝나면 PowerShell 창 닫기</code></pre>
<p data-ke-size="size16"><br />비개발자에게 SSH, Bastion, RDS endpoint, 보안 그룹 구조를 설명할 필요 없이, 실행 절차를 단순화할 수 있었다.</p>
<h2 data-ke-size="size26"><b>10. 회고</b></h2>
<p data-ke-size="size16">이번 구성에서 가장 중요했던 점은 &ldquo;접근 가능하게 만드는 것&rdquo;보다 &ldquo;어디까지 접근 가능하게 할 것인가&rdquo;였다.</p>
<p data-ke-size="size16">단순히 RDS 접속 정보를 공유하면 빠르게 해결될 수는 있지만, 운영 환경에서는 위험하다.<br />그래서 다음과 같이 계층별로 권한을 나눴다.</p>
<pre class="angelscript"><code>네트워크 레벨: HQ 고정 IP만 Bastion 22번 접근 허용
서버 레벨: hq-tunnel 전용 OS 계정 사용
SSH 레벨: permitopen으로 RDS:5432만 허용
DB 레벨: hq_readonly_user에 SELECT 권한만 부여
클라이언트 레벨: localhost:15432로만 접근하게 구성</code></pre>
<p data-ke-size="size16"><br />결과적으로 HQ는 Claude Desktop을 통해 필요한 데이터를 조회할 수 있게 되었고,<br />개발팀은 RDS를 직접 공개하지 않으면서도 최소 권한 원칙을 지킬 수 있었다.<br /><br /></p>
<p data-ke-size="size16">이번 경험은 비개발 조직에게 내부 데이터를 열어줄 때,<br />단순히 &ldquo;연결되게 하는 것&rdquo;이 아니라 &ldquo;안전하게 사용할 수 있는 형태로 포장하는 것&rdquo;이 중요하다는 걸 보여준 사례였다.</p>