<h2 data-ke-size="size26">Hasura(v2) GraphQL + Next.js + Apollo Client</h2>
<p data-ke-size="size16">Hasura(v2) 로 GraphQL API서버를 만들고, DB는 local PostgreSQL 을 docker 로 띄울 것입니다.<br />대충 반려동물 주제로 유저, 포스트, 좋아요, 댓글, 동물정보 테이블을 만들고,<br />seeding은 faker.js 이용하여 typescript 로 합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">쿼리와 뮤테이션 작성후 codegen까지 완료되면 Next.js 15 app router 에 맞게<br />apollo cilent 설정을 하고 프론트 개발을 하면 됩니다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">순서</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>프로젝트 init</li>
<li>의존성 설치</li>
<li><a href="https://hasura.io/docs/2.0/getting-started/docker-simple/">여기</a> 참고하여 curl 로 docker-compose 파일 받기</li>
<li>docker 띄우기(시딩용 ports: - "5432:5432" 추가필요)</li>
<li>localhost:8080/console 로 접근</li>
<li>sql 로 테이블 생성 후 table, relation &gt; track</li>
<li>seed.ts 작성</li>
<li>codegen.ts 작성</li>
<li>package.json scripts 업데이트</li>
<li>queries.ts, mutations.ts GQL 쿼리, 뮤테이션 작성</li>
<li>pnpm seed</li>
<li>pnpm codegen</li>
<li>apollo client 설정</li>
<li>기본 쿼리 훅 작성</li>
<li>서버사이드 fetch 적용</li>
<li>~ ~ ~ 마음대로 만들기 ^0^</li>
</ol>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">순서별 상세</h2>
<h3 data-ke-size="size23">2. 의존성 설정</h3>
<pre id="code_1758957017329" class="bash" data-ke-language="bash" data-ke-type="codeblock"><code>pnpm add @faker-js/faker
pnpm add -D tsx
pnpm add pg 
pnpm add -D @types/pg
pnpm add @apollo/client graphql rxjs @apollo/client-integration-nextjs graphql-request
pnpm add -D @graphql-codegen/cli @graphql-codegen/client-preset @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-typed-document-node/core</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">3. SQL</h3>
<pre id="code_1758957062347" class="sql" data-ke-language="sql" data-ke-type="codeblock"><code>-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
<p>-- 반려동물 정보 테이블
CREATE TABLE pets (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name VARCHAR(100) NOT NULL,
species VARCHAR(50) NOT NULL, -- 'dog', 'cat', 'bird', 'rabbit', etc.
breed VARCHAR(100),
age INTEGER,
gender VARCHAR(10), -- 'male', 'female', 'unknown'
weight DECIMAL(5,2), -- kg 단위
color VARCHAR(50),
personality TEXT, -- 성격 설명
photo_url TEXT,
owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
is_adopted BOOLEAN DEFAULT false,
adoption_date DATE,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
);</p>
<p>-- 포스트 테이블
CREATE TABLE posts (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
title VARCHAR(255) NOT NULL,
content TEXT NOT NULL,
image_url TEXT,
category VARCHAR(50), -- 'daily', 'medical', 'training', 'adoption', 'lost', 'found'
location VARCHAR(100), -- 위치 정보 (산책, 분실 등에 활용)
author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
pet_id UUID REFERENCES pets(id) ON DELETE SET NULL, -- 특정 반려동물과 관련된 포스트
is_published BOOLEAN DEFAULT true,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
);</p>
<p>-- 좋아요 테이블
CREATE TABLE post_likes (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
created_at TIMESTAMPTZ DEFAULT NOW(),
UNIQUE(post_id, user_id) -- 중복 좋아요 방지
);</p>
<p>-- 댓글 테이블
CREATE TABLE comments (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
content TEXT NOT NULL,
post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- 대댓글 기능
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
);</p>
<p>-- 댓글 좋아요 테이블 (선택사항)
CREATE TABLE comment_likes (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
created_at TIMESTAMPTZ DEFAULT NOW(),
UNIQUE(comment_id, user_id)
);</p>
<p>-- 팔로우 관계 테이블 (선택사항)
CREATE TABLE user_follows (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
created_at TIMESTAMPTZ DEFAULT NOW(),
UNIQUE(follower_id, following_id),
CHECK(follower_id != following_id) -- 자기 자신 팔로우 방지
);</p>
<p>-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_pet_id ON posts(pet_id);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_pets_owner_id ON pets(owner_id);
CREATE INDEX idx_pets_species ON pets(species);</p>
<p>-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';</p>
<p>-- 트리거 설정
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">7.&nbsp;seed.ts</h3>
<pre class="typescript" data-ke-language="typescript"><code>// scripts/seed.ts
import { faker } from '@faker-js/faker';
import { Client } from 'pg';
<p>const client = new Client({
host: 'localhost',
port: 5432,
database: 'petapp_db',
user: 'postgres',
password: 'petapp_password',
});</p>
<p>// 반려동물 관련 데이터
const petSpecies = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'turtle'];
const dogBreeds = ['골든 리트리버', '래브라도', '푸들', '말티즈', '치와와', '비글', '시바견', '진돗개'];
const catBreeds = ['페르시안', '메인쿤', '러시안 블루', '브리티시 숏헤어', '샴', '벵갈', '코리안 숏헤어'];
const birdBreeds = ['앵무새', '카나리아', '십자매', '문조', '잉꼬'];
const personalities = ['활발함', '온순함', '장난기 많음', '독립적', '애교쟁이', '경계심 많음', '느긋함', '영리함'];
const postCategories = ['daily', 'medical', 'training', 'adoption', 'lost', 'found'];
const colors = ['흰색', '검은색', '갈색', '회색', '노란색', '주황색', '얼룩무늬', '삼색'];</p>
<p>interface User {
id: string;
username: string;
email: string;
full_name: string;
}</p>
<p>interface Pet {
id: string;
name: string;
species: string;
owner_id: string;
}</p>
<p>async function seed() {
try {
await client.connect();
console.log('  반려동물 앱 시딩을 시작합니다...\n');</p>
<pre><code>// 기존 데이터 삭제 (개발용)
console.log(' ️  기존 데이터 삭제 중...');
await client.query(`
  TRUNCATE users, pets, posts, comments, post_likes, comment_likes, user_follows RESTART IDENTITY CASCADE;
`);

// 1. 사용자 생성
console.log('  사용자 생성 중...');
const users: User[] = [];

for (let i = 0; i &amp;lt; 30; i++) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const username = faker.internet.userName(firstName, lastName);

  const userData = {
    username: `${username}_${i}`, // 중복 방지
    email: faker.internet.email(firstName, lastName),
    full_name: `${firstName} ${lastName}`,
    avatar_url: faker.image.avatar(),
    bio: faker.lorem.sentence(),
    location: faker.location.city(),
  };

  const result = await client.query(`
    INSERT INTO users (username, email, full_name, avatar_url, bio, location)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, full_name
  `, [userData.username, userData.email, userData.full_name, userData.avatar_url, userData.bio, userData.location]);

  users.push(result.rows[0]);
  console.log(`  ✅ ${userData.full_name} (@${userData.username})`);
}

// 2. 반려동물 생성
console.log('\n  반려동물 생성 중...');
const pets: Pet[] = [];

for (let i = 0; i &amp;lt; 50; i++) {
  const species = faker.helpers.arrayElement(petSpecies);
  let breed = '';

  // 종에 따른 품종 설정
  switch (species) {
    case 'dog':
      breed = faker.helpers.arrayElement(dogBreeds);
      break;
    case 'cat':
      breed = faker.helpers.arrayElement(catBreeds);
      break;
    case 'bird':
      breed = faker.helpers.arrayElement(birdBreeds);
      break;
    default:
      breed = faker.animal.type();
  }

  const petData = {
    name: faker.animal.petName(),
    species,
    breed,
    age: faker.number.int({ min: 1, max: 15 }),
    gender: faker.helpers.arrayElement(['male', 'female', 'unknown']),
    weight: parseFloat(faker.number.float({ min: 0.5, max: 50, fractionDigits: 1 }).toString()),
    color: faker.helpers.arrayElement(colors),
    personality: faker.helpers.arrayElements(personalities, { min: 1, max: 3 }).join(', '),
    photo_url: faker.image.urlLoremFlickr({ category: 'animals' }),
    owner_id: faker.helpers.arrayElement(users).id,
    is_adopted: faker.datatype.boolean(0.3), // 30% 확률로 입양
    adoption_date: faker.datatype.boolean(0.3) ? faker.date.recent({ days: 365 }) : null,
  };

  const result = await client.query(`
    INSERT INTO pets (name, species, breed, age, gender, weight, color, personality, photo_url, owner_id, is_adopted, adoption_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id, name, species, owner_id
  `, [petData.name, petData.species, petData.breed, petData.age, petData.gender, 
      petData.weight, petData.color, petData.personality, petData.photo_url, 
      petData.owner_id, petData.is_adopted, petData.adoption_date]);

  pets.push(result.rows[0]);
  console.log(`    ${petData.name} (${petData.species} - ${breed})`);
}

// 3. 포스트 생성
console.log('\n  포스트 생성 중...');
const posts: string[] = [];

for (let i = 0; i &amp;lt; 100; i++) {
  const category = faker.helpers.arrayElement(postCategories);
  const pet = faker.helpers.arrayElement(pets);

  // 카테고리에 따른 제목 생성
  let title = '';
  switch (category) {
    case 'daily':
      title = `${pet.name}의 일상 - ${faker.lorem.words(3)}`;
      break;
    case 'medical':
      title = `${pet.name} 건강 체크 및 ${faker.lorem.word()}`;
      break;
    case 'training':
      title = `${pet.name} 훈련일지 - ${faker.lorem.words(2)}`;
      break;
    case 'adoption':
      title = `사랑스러운 ${pet.species} ${pet.name} 입양 보내요`;
      break;
    case 'lost':
      title = `긴급! ${pet.name} 실종 - ${faker.location.city()} 일대`;
      break;
    case 'found':
      title = `발견! ${pet.species} 보호 중 - 주인을 찾습니다`;
      break;
  }

  const postData = {
    title,
    content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 4 })),
    image_url: faker.image.urlLoremFlickr({ category: 'animals' }),
    category,
    location: faker.location.city(),
    author_id: pet.owner_id,
    pet_id: faker.datatype.boolean(0.8) ? pet.id : null, // 80% 확률로 특정 반려동물과 연관
    is_published: faker.datatype.boolean(0.95), // 95% 확률로 게시
    created_at: faker.date.recent({ days: 30 }),
  };

  const result = await client.query(`
    INSERT INTO posts (title, content, image_url, category, location, author_id, pet_id, is_published, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
  `, [postData.title, postData.content, postData.image_url, postData.category, 
      postData.location, postData.author_id, postData.pet_id, postData.is_published, postData.created_at]);

  posts.push(result.rows[0].id);
  console.log(`    ${title.substring(0, 50)}...`);
}

// 4. 좋아요 생성
console.log('\n❤️  좋아요 생성 중...');
for (let i = 0; i &amp;lt; 300; i++) {
  try {
    await client.query(`
      INSERT INTO post_likes (post_id, user_id, created_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (post_id, user_id) DO NOTHING
    `, [
      faker.helpers.arrayElement(posts),
      faker.helpers.arrayElement(users).id,
      faker.date.recent({ days: 20 })
    ]);
  } catch (error) {
    // 중복 좋아요는 무시
  }
}

// 5. 댓글 생성
console.log('\n  댓글 생성 중...');
const comments: string[] = [];

for (let i = 0; i &amp;lt; 200; i++) {
  const commentData = {
    content: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
    post_id: faker.helpers.arrayElement(posts),
    author_id: faker.helpers.arrayElement(users).id,
    parent_comment_id: faker.datatype.boolean(0.2) &amp;amp;&amp;amp; comments.length &amp;gt; 0 
      ? faker.helpers.arrayElement(comments) : null, // 20% 확률로 대댓글
    created_at: faker.date.recent({ days: 15 }),
  };

  const result = await client.query(`
    INSERT INTO comments (content, post_id, author_id, parent_comment_id, created_at)
    VALUES ($1, $2, $3, $4, $5) RETURNING id
  `, [commentData.content, commentData.post_id, commentData.author_id, 
      commentData.parent_comment_id, commentData.created_at]);

  comments.push(result.rows[0].id);
  console.log(`    댓글 ${i + 1}: ${commentData.content.substring(0, 30)}...`);
}

// 6. 팔로우 관계 생성
console.log('\n  팔로우 관계 생성 중...');
for (let i = 0; i &amp;lt; 80; i++) {
  try {
    const follower = faker.helpers.arrayElement(users);
    const following = faker.helpers.arrayElement(users);

    if (follower.id !== following.id) {
      await client.query(`
        INSERT INTO user_follows (follower_id, following_id, created_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (follower_id, following_id) DO NOTHING
      `, [follower.id, following.id, faker.date.recent({ days: 60 })]);
    }
  } catch (error) {
    // 중복 팔로우는 무시
  }
}

console.log('\n  시딩 완료!');
console.log(`
</code></pre>
<p>생성된 데이터:</p>
<ul>
<li>사용자: ${users.length}명</li>
<li>반려동물: ${pets.length}마리</li>
<li>포스트: ${posts.length}개</li>
<li>댓글: ${comments.length}개</li>
<li>좋아요: ~300개</li>
<li>팔로우: ~80개</li>
</ul>
<p>Hasura Console: http://localhost:8080
pgAdmin: http://localhost:5050 (admin@petapp.com / admin)
`);</p>
<p>} catch (error) {
console.error('❌ 시딩 중 오류 발생:', error);
} finally {
await client.end();
}
}</p>
<p>seed();</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">8. codegen.ts</h3>
<pre id="code_1758957159134" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>import type { CodegenConfig } from "@graphql-codegen/cli";
<p>const config: CodegenConfig = {
overwrite: true,
schema: process.env.HASURA_GRAPHQL_ENDPOINT ?? &quot;http://localhost:8080/v1/graphql&quot;,
documents: [&quot;src/**/*.{ts,tsx,graphql}&quot;],
generates: {
&quot;src/generated/graphql.ts&quot;: {
plugins: [&quot;typescript&quot;, &quot;typescript-operations&quot;, &quot;typed-document-node&quot;],
config: {
fetcher: &quot;graphql-request&quot;,
exposeDocument: true,
exposeQueryKeys: true,
exposeMutationKeys: true,
},
},
},
}</p>
<p>export default config;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">9.&nbsp;package.json</h3>
<pre class="typescript" data-ke-language="typescript"><code>{
    "scripts": {
        "dev": "next dev --turbopack",
        "build": "next build --turbopack",
        "start": "next start",
        "lint": "biome check",
        "format": "biome format --write",
        "# ===== 통합 환경 관리 =====": "",
        "backend:up": "docker-compose up -d",
        "backend:down": "docker-compose down",
        "backend:restart": "docker-compose restart",
        "backend:logs": "docker-compose logs -f",
        "# ===== 시딩 =====": "",
        "seed": "tsx scripts/seed.ts",
        "seed:fresh": "pnpm db:reset &amp;&amp; sleep 5 &amp;&amp; pnpm seed",
        "# ===== GraphQL 코드 생성 =====": "",
        "codegen": "graphql-codegen --config codegen.ts",
        "codegen:watch": "graphql-codegen --config codegen.ts --watch"
    },
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<h4 data-ke-size="size20">10. apollo client 설정</h4>
<pre id="code_1758957202160" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// /lib/apollo-client.ts
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
<pre class="typescript" data-ke-language="typescript"><code>// /lib/apollo-provider.tsx
"use client";

import { HttpLink } from "@apollo/client";
import {
    ApolloClient,
    ApolloNextAppProvider,
    InMemoryCache,
} from "@apollo/client-integration-nextjs";

function makeClient() {
    const httpLink = new HttpLink({
    // this needs to be an absolute url, as relative urls cannot be used in SSR
        uri:
        process.env.HASURA_GRAPHQL_ENDPOINT ?? "http://localhost:8080/v1/graphql",
    });

    return new ApolloClient({
        cache: new InMemoryCache(),
        link: httpLink,
    });
}

export function ApolloProvider({ children }: { children: React.ReactNode }) {

    return (
        &lt;ApolloNextAppProvider makeClient={makeClient}&gt;
            {children}
        &lt;/ApolloNextAppProvider&gt;
    );
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">14. 기본 쿼리 훅 작성</h3>
<pre id="code_1758957233553" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// ===== POSTS =====
export function usePostsQuery(
	limit?: number,
	offset?: number,
	category?: string,
) {
	return useQuery&lt;GetPostsQuery, GetPostsQueryVariables&gt;(GET_POSTS, {
	variables: { limit, offset, category },
  });
}
<p>export function usePostsSuspenseQuery(
limit?: number,
offset?: number,
category?: string,
) {
return useSuspenseQuery&lt;GetPostsQuery, GetPostsQueryVariables&gt;(GET_POSTS, {
variables: { limit, offset, category },
});
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">15.&nbsp;서버사이드&nbsp;fetch&nbsp;적용</h3>
<pre class="typescript" data-ke-language="typescript"><code>// /app/(public)/page.tsx
import { Suspense } from "react";
import { GET_POSTS } from "@/graphql/queries";
import { PreloadQuery } from "@/lib/apollo-client";
import MainTemplate from "@/templates/main-templates";
<p>export default function Home() {
return (
&lt;PreloadQuery
query={GET_POSTS}
variables={{
limit: 10,
offset: 0,
}}&gt;
&lt;Suspense fallback={&lt;div&gt;loading&lt;/div&gt;}&gt;
&lt;MainTemplate /&gt;
&lt;/Suspense&gt;
&lt;/PreloadQuery&gt;
);
}</code></pre></p>
<pre class="javascript"><code>// /src/templates/main-template.tsx
"use client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePostsSuspenseQuery } from "@/hooks/queries";

function MainTemplate() {
    const { data, error } = usePostsSuspenseQuery(10, 0);

    if (error) return &lt;div&gt;Error: {error.message}&lt;/div&gt;;

    return (
        &lt;div className="grid grid-cols-3 gap-4"&gt;
            {data.posts?.map((post) =&gt; (
                &lt;Card key={post?.id}&gt;
                    &lt;CardHeader&gt;
                        &lt;CardTitle&gt;{post?.title}&lt;/CardTitle&gt;
                    &lt;/CardHeader&gt;
                    &lt;CardContent className="max-h-[100px] overflow-hidden text-ellipsis whitespace-nowrap"&gt;
                        &lt;Skeleton className="h-[100px] w-full" /&gt;
                        &lt;p&gt;{post?.content}&lt;/p&gt;
                    &lt;/CardContent&gt;
                    &lt;CardFooter&gt;{post?.location}&lt;/CardFooter&gt;
                &lt;/Card&gt;
            ))}
        &lt;/div&gt;
    );
}


export default MainTemplate;</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">happy coding ~</p>