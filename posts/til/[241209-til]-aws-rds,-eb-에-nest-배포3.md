<h2 data-ke-size="size26">5. cli 설치</h2>
<pre class="bash" data-ke-language="bash"><code># cli 설치
brew install awsebcli
brew install awscli
<h1>aws configure</h1>
<p>aws configure</p>
<h1>accessKeyID 및 secretAccessKey는 IAM 생성시 받은 것</h1>
<h1>리전은 ap-northeast-2</h1>
<h1>Default output format: json 입력</h1>
<h1>eb cli 초기화</h1>
<p>eb init</p>
<h1>리전은 ap-northeast-2 (10)</h1>
<h1>accessKeyID 및 secretAccessKey는 IAM 생성시 받은 것</h1>
<h1>CodeCommit no 선택</h1>
<h1>eb ssh 연결 셋업</h1>
<p>eb ssh --setup</p>
<h1>keypair: new keypair 선택</h1>
<h1>이름 정하고 새로 생성 과정 진행</h1>
<h1>이제 eb ssh 로 접속 가능</h1>
<p>eb ssh</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">6. https 설정</h2>
<p data-ke-size="size16">맨 처음 배포 시에는 SSL 인증서를 발급받고 관련 파일(<code>/etc/letsencrypt/live/...</code>)을 생성하는 과정이 필요합니다. 아래는 이 전체 과정을 처음부터 끝까지 정리한 가이드입니다.</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>1. 도메인 및 DNS 설정</b></h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>GoDaddy에서 도메인 설정</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>도메인</code>에 대해 다음을 설정합니다:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Type</b>: <code>A</code></li>
<li><b>Name</b>: <code>api</code></li>
<li><b>Value</b>: Elastic Beanstalk 인스턴스 퍼블릭 IP</li>
<li><b>TTL</b>: 기본값(1시간)</li>
</ul>
</li>
</ul>
</li>
<li><b>DNS 전파 확인</b>:Elastic Beanstalk의 퍼블릭 IP가 반환되어야 합니다.</li>
<li><code class="language-bash"> nslookup 도메인</code></li>
</ol>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>2. 첫 배포</b></h3>
<h4 data-ke-size="size20">애플리케이션 배포:</h4>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>애플리케이션 소스 준비</b>: <code>.ebextensions</code> 폴더를 포함하여 애플리케이션을 준비합니다. 첫 배포 시에는 SSL 관련 설정을 제외합니다.</li>
<li><b>GitHub Actions를 통해 Elastic Beanstalk에 배포</b>: 기존 GitHub Actions 워크플로를 사용하여 소스를 배포합니다.</li>
</ol>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>3. 서버에서 Let's Encrypt로 SSL 인증서 발급</b></h3>
<p data-ke-size="size16">Elastic Beanstalk에 배포된 애플리케이션에서 SSL 인증서를 발급받습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>SSH로 서버 접속</b>:</p>
<p data-ke-size="size16"><code class="language-bash"> eb ssh</code></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>Certbot 설치</b>:</p>
<p data-ke-size="size16"><code class="language-bash"> sudo yum install -y certbot</code></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>Nginx에 기본 설정 추가 (임시 설정)</b>: <code>/etc/nginx/conf.d/https_custom.conf</code> 파일을 생성하고 아래 내용을 추가합니다:</p>
<pre id="code_1733745184663" class="bash" data-ke-language="bash" data-ke-type="codeblock"><code>server { 
	listen 80; 
    server_name 도메인; 
<pre><code>location /.well-known/acme-challenge/ { 
	root /var/www/html; 
}
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code class="language-bash">sudo nano /etc/nginx/conf.d/https_custom.conf</code></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>Nginx 재시작</b>:</p>
<p data-ke-size="size16"><code class="language-bash"> sudo service nginx restart</code></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>SSL 인증서 발급</b>:인증서가 성공적으로 발급되면 <code>/etc/letsencrypt/live/도메인/</code> 경로에 인증서 파일들이 생성됩니다.</p>
<p data-ke-size="size16"><code class="language-bash"> sudo certbot certonly --webroot -w /var/www/html -d api.pagebrothers.work</code></p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>4. HTTPS 적용</b></h3>
<p data-ke-size="size16"><b>Nginx 설정 수정</b>: <code>/etc/nginx/conf.d/https_custom.conf</code>를 수정하여 HTTPS를 적용합니다:</p>
<pre id="code_1733745133176" class="bash" data-ke-language="bash" data-ke-type="codeblock"><code>server { 
	listen 443 ssl; 
    server_name 도메인; 
<pre><code>ssl_certificate /etc/letsencrypt/live/도메인/fullchain.pem; 
ssl_certificate_key /etc/letsencrypt/live/도메인/privkey.pem; \

location / { 
	proxy_pass http://127.0.0.1:8080; # 애플리케이션 내부 포트 
    proxy_set_header Host $host; 
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
} 
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code class="language-bash">sudo nano /etc/nginx/conf.d/https_custom.conf</code></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>Nginx 설정 테스트 및 재시작</b>:</p>
<p data-ke-size="size16"><code class="language-bash"> sudo nginx -t
 sudo service nginx restart</code></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>브라우저로 HTTPS 테스트</b>: <code>https://도메인</code>에 접속하여 HTTPS가 정상적으로 작동하는지 확인합니다.</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>5. <code>.ebextensions</code>에 설정 추가</b></h3>
<p data-ke-size="size16">이제 SSL 인증서와 Nginx 설정이 적용되었으므로 배포 시마다 이 설정이 초기화되지 않도록 <code>.ebextensions/https-instance.config</code>를 설정합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b><code>https-instance-security.config</code> 파일 생성</b>: 프로젝트 루트의 <code>.ebextensions/https-instance-security.config</code>에 다음 내용을 추가합니다:</p>
<pre class="dts"><code>Resources:
  sslSecurityGroupIngress:
    Type: AWS::EC2::SecurityGroupIngress
    Properties:
      GroupId: {"Fn::GetAtt" : ["AWSEBSecurityGroup", "GroupId"]}
      IpProtocol: tcp
      ToPort: 443
      FromPort: 443
      CidrIp: 0.0.0.0/0</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b><code>https-instance-nginx.config</code> 파일 생성</b>: 프로젝트 루트의 <code>.ebextensions/https-instance-nginx.config</code>에 다음 내용을 추가합니다:</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>파일 포함하여 GitHub Actions로 배포</b>: 다음 배포부터 <code>.ebextensions</code> 디렉토리가 포함된 프로젝트를 GitHub Actions로 배포하면, 설정이 자동으로 적용됩니다.</p>
<pre id="code_1733745341537" class="bash" data-ke-language="bash" data-ke-type="codeblock"><code>files:
  "/etc/nginx/conf.d/https_custom.conf":
    mode: "000644"
    owner: root
    group: root
    content: |
      server {
          listen 443 ssl;
          server_name 도메인;
<pre><code>      ssl_certificate /etc/letsencrypt/live/도메인/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/도메인/privkey.pem;

      location / {
          proxy_pass http://127.0.0.1:8080;
          proxy_set_header Host $host;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      }
  }
</code></pre>
<p>container_commands:
01_restart_nginx:
command: &quot;sudo service nginx restart&quot;</code></pre></p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>6. 자동 인증서 갱신 설정</b></h3>
<p data-ke-size="size16">Certbot의 인증서를 자동 갱신하도록 설정합니다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Crontab에 작업 추가</b>:아래 내용을 추가:</li>
<li><code class="language-bash"> 0 0 28-31 * * [ "$(date +\%d -d tomorrow)" == "01" ] &amp;&amp; certbot renew --quiet &amp;&amp; systemctl reload nginx</code></li>
<li><code class="language-bash"> sudo crontab -e</code></li>
<li><b>테스트</b>: 인증서 갱신 테스트:</li>
<li><code class="language-bash"> sudo certbot renew --dry-run</code></li>
</ol>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>요약</b></h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>처음 배포</b>: <code>.ebextensions</code> 없이 애플리케이션 배포.</li>
<li><b>SSL 인증서 발급</b>: Certbot으로 인증서 생성 및 Nginx 설정 적용.</li>
<li><b>HTTPS 적용</b>: <code>/etc/nginx/conf.d/https_custom.conf</code> 설정 및 테스트.</li>
<li><b>자동 설정 유지</b>: <code>.ebextensions/https-instance.config</code> 추가.</li>
<li><b>자동 인증서 갱신</b>: Crontab에 Certbot 갱신 설정 추가.</li>
</ol>
<hr data-ke-style="style1" />
<p data-ke-size="size16">위 과정을 순서대로 진행하면 HTTPS를 안정적으로 설정하고 유지할 수 있습니다!</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23"><b>추가</b></h3>
<p data-ke-size="size16">.ebextensions 디렉토리에 여러 설정들을 넣고 배포해도 안될 경우<br />로컬에서</p>
<pre class="jboss-cli"><code>mkdir -p .platform/hooks/postdeploy  
echo "sudo service nginx restart" &gt; .platform/hooks/postdeploy/restart_nginx.sh
chmod +x .platform/hooks/postdeploy/restart_nginx.sh</code></pre>
<p data-ke-size="size16">하고 restart_nginx.sh 아래처럼 수정</p>
<pre class="nginx"><code>#!/bin/bash
cat &lt;&lt;EOF | sudo tee /etc/nginx/conf.d/https_custom.conf
server {
    listen 443 ssl;
    server_name 도메인;
<pre><code>ssl_certificate /etc/letsencrypt/live/도메인/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/도메인/privkey.pem;

location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
}
</code></pre>
<p>}
EOF</p>
<p>sudo service nginx restart</code></pre></p>
