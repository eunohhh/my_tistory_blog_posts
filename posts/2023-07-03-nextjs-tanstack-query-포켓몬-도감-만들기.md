<h2 data-ke-size="size26">시연</h2>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="692" data-origin-height="800"><span data-url="https://blog.kakaocdn.net/dn/72wWg/btsIk1Jr3Nb/PTJmxJjlWo5FlAj4XGflJK/img.gif" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/72wWg/btsIk1Jr3Nb/PTJmxJjlWo5FlAj4XGflJK/img.gif" srcset="https://blog.kakaocdn.net/dn/72wWg/btsIk1Jr3Nb/PTJmxJjlWo5FlAj4XGflJK/img.gif" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="692" data-origin-height="800"/></span></figure>
<figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="800" data-origin-height="347"><span data-url="https://blog.kakaocdn.net/dn/bBmUIc/btsIm2NEaHW/tcBmHKv3eLZWvPfw5t6b0k/img.gif" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/bBmUIc/btsIm2NEaHW/tcBmHKv3eLZWvPfw5t6b0k/img.gif" srcset="https://blog.kakaocdn.net/dn/bBmUIc/btsIm2NEaHW/tcBmHKv3eLZWvPfw5t6b0k/img.gif" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" width="692" height="300" data-origin-width="800" data-origin-height="347"/></span></figure>
</p>
<h2 data-ke-size="size26">프로젝트 셋업</h2>
<p data-ke-size="size16">터미널 열기</p>
<pre id="code_1719983865219" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>npx create-next-app@latest</code></pre>
<p data-ke-size="size16">cd 프로젝트폴더명 으로 디렉토리 이동</p>
<h2 data-ke-size="size26">필요 패키지 설치</h2>
<pre id="code_1719984084364" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>yarn add axios @tanstack/react-query</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">의존성 설치</h2>
<pre id="code_1719985543289" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>yarn</code></pre>
<h2 data-ke-size="size26">폴더 구조 만들기</h2>
<pre id="code_1719986543694" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>  pokenon_project 
├─&nbsp;.eslintrc.json
├─&nbsp;.gitignore
├─&nbsp;README.md
├─&nbsp;next.config.mjs
├─&nbsp;package-lock.json
├─&nbsp;package.json
├─&nbsp;pokemon_project ✅
│&nbsp;&nbsp;│&nbsp;&nbsp;└─&nbsp;types
│&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─&nbsp;package.json  
│&nbsp;&nbsp;└─&nbsp;src
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─&nbsp;app
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├─&nbsp;globals.css
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─&nbsp;page.tsx
├─&nbsp;postcss.config.mjs
├─&nbsp;public
│&nbsp;&nbsp;└─&nbsp;pokemon_ball.gif  
├─&nbsp;src
│&nbsp;&nbsp;├─&nbsp;app
│&nbsp;&nbsp;│&nbsp;&nbsp;├─&nbsp;api
│&nbsp;&nbsp;│&nbsp;&nbsp;│&nbsp;&nbsp;└─&nbsp;pokemons
│&nbsp;&nbsp;│&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├─&nbsp;[id]
│&nbsp;&nbsp;│&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;└─&nbsp;route.ts  
│&nbsp;&nbsp;│&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─&nbsp;route.ts  
│&nbsp;&nbsp;│&nbsp;&nbsp;├─&nbsp;favicon.ico
│&nbsp;&nbsp;│&nbsp;&nbsp;├─&nbsp;globals.css
│&nbsp;&nbsp;│&nbsp;&nbsp;├─&nbsp;layout.tsx
│&nbsp;&nbsp;│&nbsp;&nbsp;├─&nbsp;page.tsx
│&nbsp;&nbsp;│&nbsp;&nbsp;├─&nbsp;pokemons
│&nbsp;&nbsp;│&nbsp;&nbsp;│&nbsp;&nbsp;└─&nbsp;[id]
│&nbsp;&nbsp;│&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─&nbsp;page.tsx  
│&nbsp;&nbsp;│&nbsp;&nbsp;└─&nbsp;provider.tsx
│&nbsp;&nbsp;├─&nbsp;components
│&nbsp;&nbsp;│&nbsp;&nbsp;├─&nbsp;LoadingSpinner.tsx  
│&nbsp;&nbsp;│&nbsp;&nbsp;└─&nbsp;PokemonPageClient.tsx  
│&nbsp;&nbsp;└─&nbsp;hooks
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├─&nbsp;useFetchPokemonId.ts  
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─&nbsp;useFetchPokemonList.ts  
├─&nbsp;tailwind.config.ts
├─&nbsp;tsconfig.json
├─&nbsp;types
│&nbsp;&nbsp;└─&nbsp;pokemon.ts  
└─&nbsp;yarn.lock</code></pre>
<p data-ke-size="size16">  표시는 새로 만드는 파일.</p>
<h2 data-ke-size="size26">스타일링 등 기본 세팅 지우기</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>public 폴더에 있는 아이콘 2개 삭제</li>
<li>app 폴더에 있는 파비콘 삭제</li>
<li>global.css에 있는 스타일링 내용 삭제 (TailWind Import 문은 계속 사용 할 것이면 일단 주석으로 놔둠)</li>
</ul>
<h2 data-ke-size="size26">API 반환값 타입 지정하기</h2>
<pre id="code_1719984248495" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// types/pokemon.ts
export type Pokemon = {
  // 1번 API : 포켓몬 기본 정보
  id: number;
  name: string;
  korean_name: string;
  height: number;
  weight: number;
  sprites: { front_default: string };
  types: { type: { name: string; korean_name: string } }[];
  abilities: { ability: { name: string; korean_name: string } }[];
  moves: { move: { name: string; korean_name: string } }[];
  // 2번 API : 포켓몬 한글 설명
  description: string;
};</code></pre>
<p data-ke-size="size16">포켓몬 기본 정보를 가져오는 API 하나, 포켓몬 한글 이름을 가져오는 API 하나 두 개를 호출할 것임.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">썬더 클라이언트 등을 이용해 API 주소에 GET 요청을 보내 보고, 반환 값을 미리 파악하며 작성한다.</p>
<p data-ke-size="size16">그런데 이 API의 반환 값은 살벌하기 때문에 필요한 값만 남겨 둔 형태가 위와 같다.</p>
<h2 data-ke-size="size26">API GET 메소드 생성</h2>
<h3 data-ke-size="size23">공통 route.tsx</h3>
<p data-ke-size="size16">기본 데이터와 설명 데이터 2개.</p>
<pre id="code_1720010576386" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// src/app/api/route.tsx
<p>import { NextResponse } from &quot;next/server&quot;;</p>
<p>const TOTAL_POKEMON = 151;</p>
<p>export const GET = async (request: Request) =&gt; {
try {
const allPokemonPromises = Array.from({ length: TOTAL_POKEMON }, (_, index) =&gt; {
const id = index + 1;
return Promise.all([
fetch(<code>https://pokeapi.co/api/v2/pokemon/${id}</code>).then(res =&gt; res.json()),
fetch(<code>https://pokeapi.co/api/v2/pokemon-species/${id}</code>).then(res =&gt; res.json())
]);
});</p>
<pre><code>const allPokemonResponses = await Promise.all(allPokemonPromises);

const allPokemonData = allPokemonResponses.map(([response, speciesResponse], index) =&amp;gt; {
  const koreanName = speciesResponse.names.find(
      (name: any) =&amp;gt; name.language.name === &quot;ko&quot;
  );
  return { ...response, korean_name: koreanName?.name || null };
});

return NextResponse.json(allPokemonData);
</code></pre>
<p>} catch (error) {
return NextResponse.json({ error: &quot;Failed to fetch data&quot; });
}
};</code></pre></p>
<p data-ke-size="size16">Next.js의 API Router Handler 기능을 사용하여 GET 메소드 로직을 작성한다.</p>
<p data-ke-size="size16">단순 GET 요청의 로직 치고는 다소 복잡해 보이는데, 포켓몬 API는 일반적인 API와는 다르게 전체적인 리스트를 보내주지 않는다.</p>
<p data-ke-size="size16">포켓몬 한 마리씩 데이터를 보내주기 때문에 필요한 개수를 직접 설정해서 한 마리씩 데이터를 가져와 새로운 json으로 가공하여 반환하는 로직이다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>import { NextResponse } from "next/server";
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Next.js에서 API 응답을 생성하는 데 이용된다.</li>
</ul>
</li>
<li>const TOTAL_POKEMON = 151;
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>151 마리의 포켓몬 데이터를 가져올 것이라는 상수를 선언한다.</li>
<li>이 상수를 이용해서 뒤 로직에서 데이터를 가져 올 포켓몬의 마릿수를 조절한다.</li>
</ul>
</li>
<li>export const GET = async (request: Request) =&gt; { ... }
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>GET 요청을 처리하는 비동기 함수 GET을 선언.</li>
<li>이 함수는 Request 객체를 인자로 받아야 함.</li>
</ul>
</li>
<li>try...catch
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>데이터를 다루는 비동기 함수이기 때문에 에러 상황에 대비해서 try...catch 문으로 작성.</li>
</ul>
</li>
<li>const allPokemonPromises = Array.from({ length: TOTAL_POKEMON }, (_, index)) =&gt; {...}
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Array.from 메서드를 사용해서 배열의 length가 TOTAL_POKEMON(151)인 배열을 생성함.</li>
<li>즉 151마리의 포켓몬 정보가 들어 갈 배열을 미리 만들어 놓는 것임.</li>
<li>두번째 인자 (_, index)는 배열의 각 요소를 어떻게 생성할 지 정의하는 부분임.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>첫 번째 인자는 현재 요소의 값을 나타냄. _ 언더 스코어를 넣었기에 여기서는 사용하지 않겠다는 의미임.</li>
<li>두 번째 인자 index는 현재 요소의 인덱스를 의미함.</li>
</ul>
</li>
</ul>
</li>
<li>const id = index + 1;
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>API 엔드 포인트에 반환 받을 포켓몬의 id값을 만들어 주기 위한 로직이다.</li>
<li>포켓몬 API에서 포켓몬의 id는 0이 아닌 1부터 시작하기 때문에 +1로 시작한다. 컴퓨터의 index는 0부터 시작하기에, 자연스럽게 id는 0 + 1이 되어 1부터 시작하게 된다.</li>
</ul>
</li>
<li>return Promise.all()
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>두 개의 fetch를 보낼 것이기 때문에 Promise.all 메서드를 사용해서 두 개의 fetch 요청을 병렬로 처리한다.</li>
<li>Promise.all 메서드는 배열을 인자로 받고, 이 배열에는 Promise 객체가 포함된다.</li>
</ul>
</li>
<li>fetch(`<a href="https://pokeapi.co/api/v2/pokemon/$" target="_blank" rel="noopener&nbsp;noreferrer">https://pokeapi.co/api/v2/pokemon/$</a>{id}`).then(res&nbsp;=&gt;&nbsp;res.json()),</li>
<li>fetch(`<a href="https://pokeapi.co/api/v2/pokemon-species/$" target="_blank" rel="noopener&nbsp;noreferrer">https://pokeapi.co/api/v2/pokemon-species/$</a>{id}`).then(res&nbsp;=&gt;&nbsp;res.json())
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>배열 안에 포함된 fetch 요청이다.</li>
<li>각각의 URL 엔드 포인트로 HTTP GET 요청을 보낸다.</li>
<li>요청이 완료되면 응답 객체를 반환받는다.</li>
<li>then 메서드를 이용하여 응답 객체를 JSON 형식으로 파싱한다.</li>
<li>이 과정은 비동기적으로 처리되고, Promise 객체를 반환한다.</li>
<li>Promise.all은 이 두 개의 Promise가 완료될 때까지 기다리고, 각각의 결과를 포함하는 새로운 Promise를 반환한다.</li>
</ul>
</li>
<li>const allPokemonResponses = await Promise.all(allPokemonPromises);
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>위 Promise.all 과정이 완료되면 그 결과를 담은 allPokemonPromises를 allPokemonResponses에 담는다.</li>
</ul>
</li>
<li>const allPokemonData = allPokemonResponses.map(([response, speciesResponse], index) =&gt; {...})
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>두 fetch 요청이 완료되어 담긴 allPokemonResponses 배열을 map 메서드로 순회한다.</li>
<li>첫번째 인자에서 response는 response는 포켓몬 기본 데이터 정보이고, speciesResponse는 포켓몬 한글 설명이 담긴 API의 반환 값을 의미한다.</li>
</ul>
</li>
<li>const koreanName = speciesResponse.names.find((name: any) =&gt; name.language.name === "ko");
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>speciesResponse에서 한국어 이름을 찾아서 각 포켓몬 데이터에 한국어 이름을 find 메서드로 찾아와서 response라는 배열에 korean_name 필드를 만들고 포켓몬의 한국 이름을 넣는다.</li>
<li>그리고 이렇게 만들어진 새로운 배열 allPokemonData를 JSON 형식으로 클라이언트에게 보내준다.</li>
</ul>
</li>
</ul>
<h3 data-ke-size="size23">디테일 route.tsx</h3>
<pre id="code_1720015753797" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// src/app/api/detail/[id]/route.tsx
<p>const TOTAL_POKEMON = 151;</p>
<p>export const GET = async (request: Request, { params }: { params: { id: string } }) =&gt; {
const { id } = params;</p>
<p>try {
const [response, speciesResponse] = await Promise.all([
fetch(<code>https://pokeapi.co/api/v2/pokemon/${id}</code>).then(res =&gt; res.json()),
fetch(<code>https://pokeapi.co/api/v2/pokemon-species/${id}</code>).then(res =&gt; res.json())
]);</p>
<pre><code>const koreanName = speciesResponse.names.find(
  (name: any) =&amp;gt; name.language.name === &quot;ko&quot;
);

const koreanDescription = speciesResponse.flavor_text_entries.find(
  (entry: any) =&amp;gt; entry.language.name === &quot;ko&quot;
);

const typesWithKoreanNames = await Promise.all(
  response.types.map(async (type: any) =&amp;gt; {
    const typeResponse = await fetch(type.type.url).then(res =&amp;gt; res.json());
    const koreanTypeName =
      typeResponse.names.find(
        (name: any) =&amp;gt; name.language.name === &quot;ko&quot;
      )?.name || type.type.name;
    return { ...type, type: { ...type.type, korean_name: koreanTypeName } };
  })
);

const abilitiesWithKoreanNames = await Promise.all(
  response.abilities.map(async (ability: any) =&amp;gt; {
    const abilityResponse = await fetch(ability.ability.url).then(res =&amp;gt; res.json());
    const koreanAbilityName =
      abilityResponse.names.find(
        (name: any) =&amp;gt; name.language.name === &quot;ko&quot;
      )?.name || ability.ability.name;
    return {
      ...ability,
      ability: { ...ability.ability, korean_name: koreanAbilityName },
    };
  })
);

const movesWithKoreanNames = await Promise.all(
  response.moves.map(async (move: any) =&amp;gt; {
    const moveResponse = await fetch(move.move.url).then(res =&amp;gt; res.json());
    const koreanMoveName =
      moveResponse.names.find(
        (name: any) =&amp;gt; name.language.name === &quot;ko&quot;
      )?.name || move.move.name;
    return { ...move, move: { ...move.move, korean_name: koreanMoveName } };
  })
);

const pokemonData = {
  ...response,
  korean_name: koreanName?.name || response.name,
  description: koreanDescription?.flavor_text || &quot;No description available&quot;,
  types: typesWithKoreanNames,
  abilities: abilitiesWithKoreanNames,
  moves: movesWithKoreanNames,
};

return new Response(JSON.stringify(pokemonData));
</code></pre>
<p>} catch (error) {
console.error(&quot;Error fetching Pokemon data:&quot;, error);
return new Response(JSON.stringify({ error: &quot;Failed to fetch data&quot; }));
}
};</code></pre></p>
<h2 data-ke-size="size26">리액트 쿼리 useQueryPokemonList 커스텀 훅 작성</h2>
<p data-ke-size="size16">fetch 함수를 작성했으니, 메인 페이지부터 포켓몬 리스트를 잘 불러오는지 확인해봐야겠다.</p>
<p data-ke-size="size16">그런데 그냥 불러오면 트래픽이 아까우니 TanStack Query를 통해 캐싱해주겠다.</p>
<p data-ke-size="size16">page에서 바로 작업해도 되지만, 코드를 분리해서 깔끔하게 유지하고 추후 프로젝트의 규모가 커졌을 때 재사용 할 수 있도록 커스텀 훅으로 제작하겠다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">참고로 Next.js에서는 TanStack Query를 클라이언트 컴포넌트에서만 사용할 수 있다.</p>
<p data-ke-size="size16">그런데 우리 과제 조건에서 메인 페이지는 클라이언트 컴포넌트로, 디테일 페이지는 서버 컴포넌트로 작성하라고 했으니</p>
<p data-ke-size="size16">메인 페이지는 리액트에서 사용하던 대로 사용하면 되겠다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">먼저 TanStack Query를 설치하고 아무런 세팅을 하지 않았으니 세팅부터 해주겠다.</p>
<p data-ke-size="size16">단, 아래의 설정은 디테일 페이지를 위해 서버 컴포넌트에서도 사용하기 위한 설정이고, 리액트에서 하던 세팅 방법을 그대로 사용하면 그것은 클라이언트 컴포넌트에서만 사용이 가능하다.</p>
<h3 data-ke-size="size23">Provider 생성</h3>
<p data-ke-size="size16">서버 컴포넌트에서도 사용할 수 있는 Provider를 생성한다.</p>
<pre id="code_1720017266943" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// src/app/provider.tsx
<p>&quot;use client&quot;</p>
<p>import { QueryClient ,QueryClientProvider, isServer } from &quot;@tanstack/react-query&quot;;</p>
<p>function makeQueryClient() {
return new QueryClient({
defaultOptions: {
queries: {
staleTime: 60 * 1000,
},
},
});
}</p>
<p>let browserQueryClient: QueryClient  | undefined = undefined</p>
<p>function getQueryClient() {
if (isServer) {
return makeQueryClient()
} else {
if(!browserQueryClient) {
browserQueryClient = makeQueryClient()
}
return browserQueryClient
}
}</p>
<p>const QueryProvider = ({ children }: { children: React.ReactNode }) =&gt; {</p>
<pre><code>const queryClient = getQueryClient()

return (
    &amp;lt;QueryClientProvider client={queryClient}&amp;gt;
        {children}
    &amp;lt;/QueryClientProvider&amp;gt;
)
</code></pre>
<p>}</p>
<p>export default QueryProvider;</code></pre></p>
<h3 data-ke-size="size23">Provider 전달 설정</h3>
<pre id="code_1720017436064" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// src/app/layout.tsx
<p>import type { Metadata } from &quot;next&quot;;
import { Inter } from &quot;next/font/google&quot;;
import &quot;./globals.css&quot;;
import QueryProvider from &quot;./provider&quot;;</p>
<p>const inter = Inter({ subsets: [&quot;latin&quot;] });</p>
<p>export const metadata: Metadata = {
title: &quot;Create Next App&quot;,
description: &quot;Generated by create next app&quot;,
};</p>
<p>export default function RootLayout({
children,
}: Readonly&lt;{
children: React.ReactNode;
}&gt;) {
return (
&lt;html lang=&quot;en&quot;&gt;
&lt;body className={inter.className} style={{ maxWidth: &quot;800px&quot;, margin: &quot;0 auto&quot; }}&gt;</p>
<pre><code>    &amp;lt;QueryProvider&amp;gt;
        {children}
    &amp;lt;/QueryProvider&amp;gt;

  &amp;lt;/body&amp;gt;
&amp;lt;/html&amp;gt;
</code></pre>
<p>);
}</code></pre></p>
<h2 data-ke-size="size26">메인 페이지 작성</h2>
<h3 data-ke-size="size23">Image 컴포넌트 사용을 위한 외부 이미지 사용 허가 설정</h3>
<pre id="code_1720017684650" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// src/next.config.mjs
<p>/** @type {import('next').NextConfig} */
const nextConfig = {
images: {
remotePatterns: [
{
protocol: &quot;https&quot;,
hostname: &quot;raw.githubusercontent.com&quot;,
},
{
protocol: &quot;https&quot;,
hostname: &quot;assets.pokemon.com&quot;,
}
]
}
};</p>
<p>export default nextConfig;</code></pre></p>
<h3 data-ke-size="size23">스타일링을 위한 Tailwind 설정</h3>
<h4 data-ke-size="size20">global.css</h4>
<pre id="code_1720018095451" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// global.css
<p>@tailwind base;
@tailwind components;
@tailwind utilities;</p>
<p>:root {
--foreground-rgb: 0, 0, 0;
--background-start-rgb: 214, 219, 220;
--background-end-rgb: 255, 255, 255;
}</p>
<p>@media (prefers-color-scheme: dark) {
:root {
--foreground-rgb: 255, 255, 255;
--background-start-rgb: 0, 0, 0;
--background-end-rgb: 0, 0, 0;
}
}</p>
<p>body {
}</p>
<p>@layer utilities {
.text-balance {
text-wrap: balance;
}
}</code></pre></p>
<h4 data-ke-size="size20">tailwind.config.ts</h4>
<pre id="code_1720018154012" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// tailwind.config.ts
<p>import type { Config } from &quot;tailwindcss&quot;;</p>
<p>const config: Config = {
content: [
&quot;./src/pages/<strong>/*.{js,ts,jsx,tsx,mdx}&quot;,
&quot;./src/components/</strong>/<em>.{js,ts,jsx,tsx,mdx}&quot;,
&quot;./src/app/**/</em>.{js,ts,jsx,tsx,mdx}&quot;,
],
theme: {
extend: {
backgroundImage: {
&quot;gradient-radial&quot;: &quot;radial-gradient(var(--tw-gradient-stops))&quot;,
&quot;gradient-conic&quot;:
&quot;conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))&quot;,
},
keyframes: {
bounceY: {
'0%, 100%': { transform: 'translateY(0)' },
'50%': { transform: 'translateY(-20px)' },
},
},
animation: {
bounceY: 'bounceY 1s infinite',
},
},
},
plugins: [],
};
export default config;</code></pre></p>
<h3 data-ke-size="size23">메인 페이지 작성</h3>
<pre id="code_1720018236766" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// src/app/page.tsx
<p>'use client';</p>
<p>import Link from &quot;next/link&quot;;
import Image from &quot;next/image&quot;;
import { useQueryPokemonList } from &quot;../../hooks/useQueryPokemonList&quot;;
import { useState, useEffect } from &quot;react&quot;;</p>
<p>export default function MainPage() {</p>
<p>const { data: pokemonList, isPending, isError } = useQueryPokemonList();
const [searchText, setSearchText] = useState(&quot;&quot;);
const [debouncedSearchText, setDebouncedSearchText] = useState(&quot;&quot;);</p>
<p>useEffect(() =&gt; {
const handler = setTimeout(() =&gt; {
setDebouncedSearchText(searchText);
}, 1000);</p>
<pre><code>return () =&amp;gt; {
  clearTimeout(handler);
};
</code></pre>
<p>}, [searchText]);</p>
<p>const filteredPokemonList = pokemonList?.filter(pokemon =&gt;
pokemon.korean_name.includes(debouncedSearchText)
);</p>
<p>if (isPending) return &lt;div&gt;로딩중&lt;/div&gt;;
if (isError) return &lt;div&gt;에러남&lt;/div&gt;;</p>
<p>return (
&lt;div className=&quot;bg-blue-900&quot;&gt;
&lt;nav className=&quot; top-0 w-full max-w-800px bg-purple-600 shadow-lg py-1 px-6 flex justify-center items-center gap-4 z-10&quot;&gt;
&lt;h1 id=&quot;button-home&quot; className=&quot;text-white font-bold text-2xl cursor-pointer&quot;&gt;나만의 포켓몬 도감&lt;/h1&gt;
&lt;input
type=&quot;text&quot;
id=&quot;search-text&quot;
placeholder=&quot;포켓몬 이름을 검색하세요&quot;
className=&quot;p-1 bg-red-900 text-white border border-black rounded-md shadow-inner&quot;
value={searchText}
onChange={(e) =&gt; setSearchText(e.target.value)}
/&gt;
&lt;button id=&quot;search-button&quot; className=&quot;text-white font-bold text-xl&quot;&gt; &lt;/button&gt;
&lt;/nav&gt;
&lt;main id=&quot;main&quot; className=&quot;mt-20 p-4 flex flex-wrap justify-center gap-4&quot;&gt;
&lt;div className=&quot;poke-list flex flex-wrap justify-center gap-4&quot;&gt;
{filteredPokemonList &amp;&amp; filteredPokemonList.map((pokemon) =&gt; (
&lt;Link href={<code>/detail/${pokemon.id}</code>} key={pokemon.id}&gt;
&lt;div className=&quot;card w-48 min-h-48 bg-red-900 text-cyan-200 border border-black rounded-lg shadow-md p-2 cursor-pointer transform transition-all hover:scale-105&quot;&gt;
&lt;h3 className=&quot;text-lg font-bold flex justify-between&quot;&gt;
&lt;span&gt;{pokemon.korean_name}&lt;/span&gt;
&lt;span&gt;No. {pokemon.id}&lt;/span&gt;
&lt;/h3&gt;
&lt;Image src={pokemon.sprites.front_default} alt={pokemon.name} width={128} height={128} className=&quot;mx-auto&quot; /&gt;
&lt;/div&gt;
&lt;/Link&gt;
))}
&lt;/div&gt;
&lt;/main&gt;
&lt;/div&gt;
);
}</code></pre></p>
<h2 style="color: #000000; text-align: start;" data-ke-size="size26">리액트 쿼리 useQueryPokemonId 커스텀 훅 작성</h2>
<pre id="code_1720019112018" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// src/hooks/useQueryPokemonId.ts
<p>&quot;use client&quot;;</p>
<p>import { useQuery } from &quot;@tanstack/react-query&quot;;
import type { Pokemon } from &quot;../types/pokemon&quot;;
import axios from &quot;axios&quot;;</p>
<p>async function fetchPokemon(id: string): Promise&lt;Pokemon&gt; {
try {
const response = await axios.get(<code>http://localhost:3000/api/pokemons/${id}</code>);
return response.data;
} catch (error) {
throw new Error(&quot;Failed to fetch Pokemon&quot;);
}
}</p>
<p>export const useQueryPokemonId = (id: number) =&gt; {
const { data, isPending, isError } = useQuery({
queryKey: ['pokemonId', id],
queryFn: () =&gt; fetchPokemon(id.toString()),
staleTime: Infinity,
});</p>
<pre><code>return { data, isPending, isError };
</code></pre>
<p>}</code></pre></p>
<h2 data-ke-size="size26">&nbsp;</h2>
<h2 data-ke-size="size26">디테일 페이지 작성</h2>
<pre id="code_1720021313294" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>import Image from 'next/image';
import Link from 'next/link';
import type { Pokemon } from '@/types/pokemon';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { Metadata } from 'next';
<p>async function fetchPokemon(id: string): Promise&lt;Pokemon&gt; {
const response = await fetch(<code>http://localhost:3000/api/pokemons/${id}</code>);
if (!response.ok) {
throw new Error(&quot;Failed to fetch data&quot;);
}
const data: Pokemon = await response.json();
return data;
}</p>
<p>export async function generateMetadata({ params }: { params: { id: string } }): Promise&lt;Metadata&gt; {
const pokemon = await fetchPokemon(params.id);
return {
title: <code>${pokemon.korean_name} - 포켓몬 도감</code>,
description: <code>${pokemon.korean_name}의 상세 정보입니다.</code>,
};
}</p>
<p>const PokemonPage = async ({ params }: { params: { id: string } }) =&gt; {
const id = Number(params.id);</p>
<p>const queryClient = new QueryClient();</p>
<p>await queryClient.prefetchQuery({
queryKey: ['pokemon', id],
queryFn: () =&gt; fetchPokemon(id.toString()),
});</p>
<p>const pokemon: Pokemon | undefined = await queryClient.getQueryData(['pokemon', id]);</p>
<p>return (
&lt;div className=&quot;max-w-2xl mx-auto p-4&quot;&gt;
&lt;HydrationBoundary state={dehydrate(queryClient)}&gt;</p>
<pre><code>    &amp;lt;div className=&quot;card-big max-w-2xl mx-auto bg-blue-900 text-cyan-200 border border-black rounded-lg shadow-md p-6 space-y-4&quot;&amp;gt;
      &amp;lt;h2 className=&quot;text-2xl font-bold text-center&quot;&amp;gt;{pokemon?.korean_name ?? '이름 없음'}&amp;lt;/h2&amp;gt;
      &amp;lt;Image src={pokemon?.sprites.front_default ?? '/default-image.png'} alt={pokemon?.name ?? '포켓몬'} width={300} height={300} className=&quot;mx-auto&quot; /&amp;gt;
      &amp;lt;p className=&quot;text-center mb-4&quot;&amp;gt;{pokemon?.description ?? '설명 없음'}&amp;lt;/p&amp;gt;
      &amp;lt;div className=&quot;card-stats space-y-2&quot;&amp;gt;
        &amp;lt;div className=&quot;info flex justify-between bg-black bg-opacity-75 p-2 rounded-md&quot;&amp;gt;
          &amp;lt;h3 className=&quot;height&quot;&amp;gt;키: {pokemon?.height ? pokemon.height / 10 : '정보 없음'}m&amp;lt;/h3&amp;gt;
          &amp;lt;h3 className=&quot;weight&quot;&amp;gt;몸무게: {pokemon?.weight ? pokemon.weight / 10 : '정보 없음'}kg&amp;lt;/h3&amp;gt;
        &amp;lt;/div&amp;gt;
        &amp;lt;div className=&quot;types bg-black p-2 rounded-md flex justify-around&quot;&amp;gt;
          {pokemon?.types.map((type) =&amp;gt; (
            &amp;lt;h3 key={type.type.name}&amp;gt;{type.type.korean_name}&amp;lt;/h3&amp;gt;
          ))}
        &amp;lt;/div&amp;gt;
        &amp;lt;div className=&quot;bg-black bg-opacity-75 p-2 rounded-md &quot;&amp;gt;
          &amp;lt;div className=&quot;flex flex-wrap gap-2&quot;&amp;gt;
            {pokemon?.moves.map((move) =&amp;gt; {
              const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];
              return (
                &amp;lt;span key={move.move.name} className={`inline-block ${randomColor} text-white px-3 py-1 rounded-full`}&amp;gt;
                  {move.move.korean_name}
                &amp;lt;/span&amp;gt;
              );
            })}
          &amp;lt;/div&amp;gt;
        &amp;lt;/div&amp;gt;
      &amp;lt;/div&amp;gt;
      &amp;lt;div className=&quot;mt-4 text-center&quot;&amp;gt;
        &amp;lt;Link href=&quot;/&quot;&amp;gt;뒤로 가기&amp;lt;/Link&amp;gt;
      &amp;lt;/div&amp;gt;
    &amp;lt;/div&amp;gt;

  &amp;lt;/HydrationBoundary&amp;gt;
&amp;lt;/div&amp;gt;
</code></pre>
<p>);
};</p>
<p>export default PokemonPage;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">동적 메타데이터를 생성한 김에 루트 폴더의 layout.tsx에서 정적 메타데이터를 수정하는 것을 마지막으로 프로젝트를 마감한다.</p>