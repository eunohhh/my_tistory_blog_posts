<p data-ke-size="size16">무료 세팅법</p>
<h2 data-ke-size="size26">1. IAM 세팅 - roles</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>create role &gt; AWS service &gt; permission policies 검색</li>
<li>multicontainer 검색 &gt; AWSElasticBeanstalkMulticontainerDocker 선택</li>
<li>elasticbeanstalkworker 검색 &gt; AWSElasticBeanstalkWorkerTier 선택</li>
<li>elasticbeanstalkwebtier 검색 &gt; AWSElasticBeanstalkWebTier 선택</li>
<li>amazonec2fullaccess 검색 &gt; AmazonEC2FullAccess 선택</li>
<li>4개 선택하고 next &gt; Role name: "aws-elasticbeanstalk-ec2-role" 입력</li>
</ol>
<h2 data-ke-size="size26">2. RDS 세팅 - database</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>create database &gt; standard create &gt; postgresql &gt; 버전 선택(aurora 가 더 좋다고 함)</li>
<li>(무료로 쓸것이므로)free tier 선택</li>
<li>계속 내려가서, Settings 에 DB instance identifier 에 db 명 입력(env 에 DB_DATABASE등에 해당)</li>
<li>self managed 선택 &gt; password 잘 입력(env, pgadmin에도 이 비번 쓰면됨)</li>
<li>무료이므로 instance configuration 는 선택된것 그대로</li>
<li>connectivity &gt; Don't connect.. 선택 &gt; VPC 디폴트로 선택</li>
<li>중요) public access &gt; Yes 선택(아무튼 올려봐야하므로 보안 문제 패스) </li>
<li>나머지 그대로 하고 생성</li>
<li>connectivity &amp; security &gt; security &gt; VPC security groups 에서 VPC 링크 클릭</li>
<li>edit inbound rules &gt; 추가 &gt; all traffic, anywhere IPv4 선택 하고 save rules</li>
</ol>
<h2 data-ke-size="size26">3. Elastic Beanstalk 세팅</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>create application &gt; 이름 설정</li>
<li>create new environment &gt; web server environment &gt; 이름 그냥 그대로 두고</li>
<li>platform &gt; managed platform &gt; platform: Node.js 선택</li>
<li>그냥 sample application 선택그대로</li>
<li>무료이므로 Single instance 선택 &gt; next</li>
<li>Service access &gt; create and new service role &gt;</li>
<li>EC2 instance profile &gt; 1. IAM 세팅에서 설정한 role name 선택 &gt; next</li>
<li>VPC 기본 선택 &gt; instance subnet 4개 선택 &gt;</li>
<li>database 는 RDS 생성했으므로 선택 안함 &gt; next</li>
<li>Root volume &gt; 중요! 24년 10월 이후 가입자는 루트볼륨타입gp3로 설정해야함 &gt; 범용 3(ssd) 선택</li>
<li>EC2 security group &gt; default 선택</li>
<li>Capacity &gt; 그냥 single instance 선택</li>
<li>t3.micro 선택해제 하고 t3.small 남기기(돈이 좀 나온다고 하지만 t3.micro 로는 메모리 부족하다고함)</li>
<li>next 하고 계속 내려가서 Environment properties(환경변수) 알맞게 추가 &gt; next</li>
<li>connectivity &amp; security &gt; security &gt; VPC security groups 에서 VPC 링크 클릭</li>
<li>edit inbound rules &gt; 추가 &gt; HTTPS, anywhere IPv4 선택 하고 save rules</li>
</ol>
<p data-ke-size="size16">10번관련 참고 블로그 <a href="https://billtech.tistory.com/23">링크</a></p>