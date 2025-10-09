<h1>Terraform으로 Neon DB + Hasura GraphQL API 서버 구축하기</h1>
<h2 data-ke-size="size26">프로젝트 개요</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>백엔드 인프라</b>: Neon PostgreSQL + Hasura (EC2) + AWS Secret Manager + IAM</li>
<li><b>프론트엔드</b>: Next.js (Vercel 배포 예정) + Apollo Client + GraphQL Code Generator</li>
<li><b>패키지 매니저</b>: pnpm</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">1. 인프라 구축 (Terraform)</h2>
<h3 data-ke-size="size23">1.1 사전 준비</h3>
<h4 data-ke-size="size20">Neon DB</h4>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><a href="https://neon.tech/">neon.tech</a> 가입 및 프로젝트 생성</li>
<li>Connection string 복사</li>
<li><code> postgresql://[user]:[password]@[endpoint]/[dbname]?sslmode=require</code></li>
</ol>
<h4 data-ke-size="size20">SSH 키 준비</h4>
<pre class="awk"><code># SSH 키가 없다면 생성
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa
<h1>공개키 확인</h1>
<p>cat ~/.ssh/id_rsa.pub</code></pre></p>
<h4 data-ke-size="size20">내 IP 확인</h4>
<pre class="css"><code>curl ifconfig.me
# 출력 예: 123.456.789.012</code></pre>
<h3 data-ke-size="size23">1.2 Terraform 파일 구성</h3>
<h4 data-ke-size="size20">프로젝트 디렉토리 생성</h4>
<pre class="dos"><code>mkdir hasura-terraform
cd hasura-terraform</code></pre>
<h4 data-ke-size="size20">주요 파일</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>main.tf</code>: 메인 Terraform 설정 (EC2, Security Group, IAM 등)</li>
<li><code>user_data.sh</code>: EC2 초기화 스크립트 (Docker, Hasura 설치)</li>
<li><code>terraform.tfvars</code>: 변수 값 정의 (⚠️ 절대 git에 커밋하지 말 것!)</li>
</ul>
<h4 data-ke-size="size20">terraform.tfvars 작성</h4>
<pre class="ini"><code>aws_region = "ap-northeast-2"  # 서울 리전
<h1>Neon DB 연결 URL</h1>
<p>neon_database_url = &quot;postgresql://user:password@ep-xxx.aws.neon.tech/neondb?sslmode=require&quot;</p>
<h1>Hasura 관리자 비밀번호</h1>
<p>hasura_admin_secret = &quot;your-super-secret-password-here&quot;</p>
<h1>내 IP 주소 (SSH 접속용, /32 붙이기)</h1>
<p>my_ip = &quot;123.456.789.012/32&quot;</code></pre></p>
<h3 data-ke-size="size23">1.3 AWS Secret Manager 설정</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>main.tf</code>에서 AWS Secret Manager 리소스 정의</li>
<li>Neon DB URL, Hasura Admin Secret 저장</li>
<li>EC2가 접근할 수 있도록 IAM Role 설정</li>
</ul>
<h3 data-ke-size="size23">1.4 IAM 설정</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>EC2 인스턴스 프로파일 생성</li>
<li>Secret Manager 읽기 권한 부여</li>
<li><code class="language-hcl">  # 예시- secretsmanager:GetSecretValue- secretsmanager:DescribeSecret</code></li>
</ul>
<h3 data-ke-size="size23">1.5 Security Group 설정</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>8080 포트</b>: Hasura Console 및 GraphQL 엔드포인트 (내 IP만 허용)</li>
<li><b>22 포트</b>: SSH 접속 (내 IP만 허용)</li>
</ul>
<h3 data-ke-size="size23">1.6 Terraform 실행</h3>
<pre class="properties"><code># 초기화
terraform init
<h1>실행 계획 확인</h1>
<p>terraform plan -out=myplan.tfplan</p>
<h1>인프라 배포</h1>
<p>terraform apply myplan.tfplan</p>
<h1>출력 정보 확인</h1>
<p>terraform output</code></pre></p>
<p data-ke-size="size16">출력 예시:</p>
<pre class="ini"><code>ec2_public_ip = "13.125.123.456"
hasura_console_url = "http://13.125.123.456:8080/console"
hasura_graphql_endpoint = "http://13.125.123.456:8080/v1/graphql"
ssh_command = "ssh -i ~/.ssh/id_rsa ubuntu@13.125.123.456"</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">2. Hasura 설정 및 데이터베이스 스키마</h2>
<h3 data-ke-size="size23">2.1 Hasura Console 접속</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>브라우저에서 <code>hasura_console_url</code> 접속</li>
<li><code>hasura_admin_secret</code> 값으로 로그인</li>
</ul>
<h3 data-ke-size="size23">2.2 데이터베이스 연결 확인</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Neon DB 자동 연결 확인 (user_data.sh에서 환경 변수로 설정됨)</li>
</ul>
<h3 data-ke-size="size23">2.3 SQL 스키마 작성 시 주의사항 ⚠️</h3>
<p data-ke-size="size16"><b>문제 상황</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>SQL로 테이블 생성 시 <code>uuid</code> 컬럼을 PK로 의도했으나</li>
<li>실제로는 <code>no</code> 같은 다른 컬럼이 PK로 설정되는 문제 발생</li>
<li>Hasura가 테이블을 제대로 인식하지 못함</li>
</ul>
<p data-ke-size="size16"><b>해결 방법</b>:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>잘못된 테이블 모두 DROP</li>
<li>SQL 다시 작성 - <b>PRIMARY KEY를 명시적으로 지정</b></li>
<li><code class="language-sql"> CREATE TABLE users (  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  name TEXT NOT NULL,  email TEXT UNIQUE NOT NULL,  created_at TIMESTAMPTZ DEFAULT NOW());</code></li>
<li>Hasura Console에서 SQL 실행</li>
<li>테이블 Track 확인</li>
</ol>
<p data-ke-size="size16"><b>핵심</b>: <code>uuid</code>를 PK로 사용하려면 반드시 <code>PRIMARY KEY</code>를 명시!</p>
<h3 data-ke-size="size23">2.4 Permissions 설정  </h3>
<p data-ke-size="size16"><b>반드시 설정해야 함</b>: 각 테이블마다 Role 기반 권한 설정</p>
<h4 data-ke-size="size20">Role 구분</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>admin</b>: 모든 CRUD 권한</li>
<li><b>user</b>: 제한된 권한 (자신의 데이터만)</li>
</ul>
<h4 data-ke-size="size20">각 테이블별 설정 항목</h4>
<p data-ke-size="size16"><b>Insert</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>user</code> role: 자신의 데이터만 삽입 가능</li>
<li>Check 조건 예: <code>{"user_id": {"_eq": "X-Hasura-User-Id"}}</code></li>
</ul>
<p data-ke-size="size16"><b>Select</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Row level filter: <code>{"user_id": {"_eq": "X-Hasura-User-Id"}}</code></li>
<li>Column 권한: 민감한 컬럼 제외</li>
</ul>
<p data-ke-size="size16"><b>Update</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Filter + Check 조건 설정</li>
<li>예: 자신의 데이터만 수정 가능</li>
</ul>
<p data-ke-size="size16"><b>Delete</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Filter 조건으로 제한</li>
<li>필요시 soft delete 사용</li>
</ul>
<h4 data-ke-size="size20">설정 예시</h4>
<pre class="sql"><code>users 테이블:
- admin: 모든 권한
- user: 
  - select: WHERE user_id = X-Hasura-User-Id
  - update: WHERE user_id = X-Hasura-User-Id (email, name만 수정)
  - insert: user_id는 자동 설정
  - delete: 불가</code></pre>
<p data-ke-size="size16"><b>주의</b>: 각 작업(Insert/Select/Update/Delete)마다 개별 설정 필요!</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">3. Next.js 프론트엔드 설정</h2>
<h3 data-ke-size="size23">3.1 프로젝트 생성 및 패키지 설치</h3>
<pre class="routeros"><code># Next.js 프로젝트 생성
pnpm create next-app@latest
<h1>Apollo Client 설치</h1>
<p>pnpm add @apollo/client graphql rxjs @apollo/client-integration-nextjs</p>
<h1>GraphQL Code Generator 설치</h1>
<p>pnpm add -D @graphql-codegen/cli <br>
@graphql-codegen/typescript <br>
@graphql-codegen/typescript-operations <br>
@graphql-codegen/typescript-react-apollo</code></pre></p>
<h3 data-ke-size="size23">3.2 Apollo Client 설정</h3>
<pre class="javascript"><code>// lib/apollo-client.ts
import { HttpLink } from "@apollo/client";
import {
    ApolloClient,
    InMemoryCache,
    registerApolloClient,
} from "@apollo/client-integration-nextjs";
<p>export const { getClient, query, PreloadQuery } = registerApolloClient(() =&gt; {
return new ApolloClient({
cache: new InMemoryCache(),
link: new HttpLink({
uri:
process.env.HASURA_GRAPHQL_ENDPOINT ??
&quot;http://localhost:8080/v1/graphql&quot;,
}),
});
});</code></pre></p>
<h3 data-ke-size="size23">3.3 GraphQL Code Generator 설정</h3>
<h4 data-ke-size="size20">codegen.ts 작성</h4>
<pre class="typescript" data-ke-language="typescript"><code>import type { CodegenConfig } from "@graphql-codegen/cli";
<p>const config: CodegenConfig = {
overwrite: true,
schema: [
{
[
process.env.HASURA_GRAPHQL_ENDPOINT ??
&quot;http://localhost:8080/v1/graphql&quot;
]: {
headers: {
&quot;x-hasura-admin-secret&quot;: process.env.HASURA_ADMIN_SECRET ?? &quot;&quot;,
},
},
},
],
documents: [&quot;src/**/*.{ts,tsx,graphql}&quot;],
generates: {
&quot;src/generated/graphql.ts&quot;: {
plugins: [&quot;typescript&quot;, &quot;typescript-operations&quot;, &quot;typed-document-node&quot;],
config: {
fetcher: &quot;graphql-request&quot;,
exposeDocument: true,
exposeQueryKeys: true,
exposeMutationKeys: true,
// hasura scalar 맵핑 필수!
scalars: {
uuid: &quot;string&quot;,
timestamptz: &quot;string&quot;,
jsonb: &quot;Record&lt;string, any&gt;&quot;,
numeric: &quot;number&quot;,
},
},
},
},
}</p>
<p>export default config;</code></pre></p>
<h4 data-ke-size="size20">package.json에 스크립트 추가</h4>
<p data-ke-size="size16">Root 에 둘거면 dotenv 설치 필요</p>
<pre class="json"><code>{
  "scripts": {
    "codegen": "dotenv -e .env.local -- graphql-codegen --config codegen.ts",
  }
}</code></pre>
<h3 data-ke-size="size23">3.4 GraphQL 쿼리 작성 및 Codegen 실행</h3>
<p data-ke-size="size16">예시 쿼리임.. 필요에 맞게 작성해야 함</p>
<pre class="routeros"><code># src/queries/users.graphql
query GetUsers {
  users {
    id
    name
    email
  }
}
<p>mutation CreateUser($name: String!, $email: String!) {
insert_users_one(object: {name: $name, email: $email}) {
id
name
email
}
}</code></pre></p>
<pre class="nginx"><code># Codegen 실행 ✅
pnpm codegen</code></pre>
<p data-ke-size="size16">생성 결과:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>TypeScript 타입 자동 생성</li>
<li><code>useGetUsersQuery</code>, <code>useCreateUserMutation</code> 훅 자동 생성</li>
<li>완벽한 타입 안정성 확보</li>
</ul>
<h3 data-ke-size="size23">3.5 환경 변수 설정</h3>
<pre class="ini"><code># .env.local
HASURA_ENDPOINT=http://13.125.123.456:8080/v1/graphql
HASURA_ADMIN_SECRET=your-super-secret-password-here</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">4. Vercel 배포</h2>
<h3 data-ke-size="size23">4.1 환경 변수 설정</h3>
<p data-ke-size="size16">Vercel 대시보드에서:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>NEXT_PUBLIC_HASURA_ENDPOINT</code></li>
<li><code>HASURA_ADMIN_SECRET</code></li>
</ul>
<h3 data-ke-size="size23">4.2 배포</h3>
<p data-ke-size="size16">cli로 하든... github 연동 하든.. 알아서</p>
<pre class="ebnf"><code>pnpm vercel</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">5. 인프라 관리</h2>
<h3 data-ke-size="size23">사용 후 삭제 (비용 절약)</h3>
<pre class="ebnf"><code>terraform destroy</code></pre>
<h3 data-ke-size="size23">다시 시작</h3>
<pre class="coq"><code>terraform apply</code></pre>
<h3 data-ke-size="size23">SSH 접속 (문제 해결)</h3>
<pre class="jboss-cli"><code>ssh -i ~/.ssh/id_rsa ubuntu@&lt;EC2_IP&gt;
cd ~/hasura
docker-compose logs -f</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">핵심 포인트 정리</h2>
<p data-ke-size="size16">✅ <b>Terraform으로 인프라를 코드화</b> - Secret Manager, IAM, EC2를 한 번에 구성<br />⚠️ <b>Hasura SQL 실행 시 PK 설정 명시</b> - <code>uuid PRIMARY KEY</code> 명시적 선언 필수<br />  <b>Permissions 필수 설정</b> - admin/user role 구분, 각 CRUD 작업마다 개별 권한 설정<br />  <b>Apollo + Codegen으로 타입 안전성</b> - pnpm으로 패키지 관리<br />  <b>tfvars 파일 보안</b> - <code>.gitignore</code>에 반드시 추가</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">예시 디렉터리 구조</h2>
<pre class="crystal"><code>프로젝트/
├── hasura-terraform/
│   ├── main.tf
│   ├── user_data.sh
│   ├── terraform.tfvars  # ⚠️ git ignore
│   └── .gitignore
│
└── frontend/
    ├── src/
    │   ├── queries/
    │   │   └── users.graphql
    │   ├── generated/
    │   │   └── graphql.ts  # codegen 결과
    │   └── lib/
    │       └── apollo-client.ts
    ├── codegen.yml
    ├── .env.local  # ⚠️ git ignore
    └── package.json</code></pre>