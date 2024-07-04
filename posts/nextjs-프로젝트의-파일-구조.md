<h2 data-ke-size="size26">app 폴더</h2>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1600" data-origin-height="363"><span data-url="https://blog.kakaocdn.net/dn/bYHza8/btsIo1gTJll/g0f7fFzqc0xQyxnYO0T511/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/bYHza8/btsIo1gTJll/g0f7fFzqc0xQyxnYO0T511/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbYHza8%2FbtsIo1gTJll%2Fg0f7fFzqc0xQyxnYO0T511%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1600" data-origin-height="363"/></span></figure>
</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Next.js 프로젝트를 세팅하면 src/app 폴더가 생성된다.</li>
<li>앱 라우팅을 담당한다.</li>
<li>이곳의 폴더는 자동으로 라우팅 되며 URL path를 폴더명으로 갖게 된다.</li>
</ul>
<h3 data-ke-size="size23">layout.tsx 파일과 page.tsx</h3>
<p data-ke-size="size16">이곳에 layout.tsx 파일을 만들면 프로젝트의 모든 파일에 영향을 줄 수 있는 파일을 만들 수 있다.</p>
<p data-ke-size="size16">그리고 page.tsx는 src/app 폴더에 있는 파일은 자동으로 '/'라는 URL path를 갖게 된다. 즉 홈 페이지의 역할을 한다는 것이다.</p>
<p data-ke-size="size16">app 폴더는 '/' home이다.</p>
<pre id="code_1720094495514" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// app/layout.tsx
<p>export default function RootLayout({
children,
}: {
children: React.ReactNode
}) {
return (
&lt;html lang=&quot;en&quot;&gt;
&lt;body&gt;{children}&lt;/body&gt;
&lt;/html&gt;
)
}</code></pre></p>
<pre id="code_1720094519702" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// app/page.tsx

export default function Page() {
  return &lt;h1&gt;Hello, Next.js!&lt;/h1&gt;
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>layout.tsx 파일은 삭제하더라도 개발 모드를 실행하면 프레임워크에 의해 자동 재생성 됨.</li>
<li>src/app 폴더 내에 폴더를 만들면 그게 /path가 됨.</li>
</ul>
<h3 data-ke-size="size23">app routing 파일 명명 규칙</h3>
<p data-ke-size="size16">Next.js는 프레임워크이기 때문에 마음대로 명명하면 안 된다. 프레임워크가 정의한 대로 파일 이름을 작성해야 개발자 의도대로 정상 작동하고, 메타데이터도 자동으로 세팅되어 SEO에 유리해짐.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>layout : 레이아웃 파일
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>app 라우트 최상단에 위치할 시 모든 페이지에서 보이는 레이아웃임. 예를 들어 헤더, 푸터.</li>
<li>app/아무폴더/layout.tsx 처럼 만들면 /아무폴더 라는 path에 접근했을 때만 보이는 레이아웃임.</li>
</ul>
</li>
<li>page : 해당 라우트의 페이지
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>app/아무폴더 말고 app 폴더 최상단에 있는 페이지는 / path 를 갖고 홈페이지가 됨.</li>
<li>여기에 홈 페이지를 직접 구성해도 되고, home 폴더를 만들든지 해서 그곳의 page.tsx를 작성하고 이곳에서 컴포넌트를 import만 해도 됨.</li>
</ul>
</li>
<li>loading : 로딩 UI</li>
<li>not-found : 404 Not found UI</li>
<li>error : 특정 페이지에서 보여 줄 에러 UI
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>특정 게시글을 못 불러온다거나, 게시글을 열람할 권한이 없는 사용자이거나 할 때 보여 줄 에러 등.</li>
</ul>
</li>
</ul>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>global-error : 전역에 사용되는 에러 UI
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>예를 들어 HTTP 네트워크 에러 등은 공통으로 적용되는 에러임.</li>
</ul>
</li>
<li>route : API 엔드포인트 설정 파일
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>API fetch는 page.tsx 각 파일에서 하겠지만, 이곳에서 API 엔드 포인트를 지정해놓는다.</li>
</ul>
</li>
<li>template : 리렌더링 된 레이아웃 파일
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>특정 경로 또는 페이지에서만 적용되는 레이아웃.</li>
<li>template.tsx 파일은 layout.tsx 파일과 사실상 똑같다. 그러나 시멘틱하게, layout 파일은 공통 레이아웃, template 파일은 특정 레이아웃을 설정한다는 의미를 파일에서부터 내포하기 때문에 적절하게 사용하는 것이 좋다.</li>
<li>layout 파일이 공통 레이아웃을 지정하는 파일이기 때문에 이곳에 사용된 state는 하위 폴더로 이동하면서도 계속 유지된다. 그러나 template 파일은 하위 폴더로 이동하면 새 인스턴스를 만들면서 상태를 변경시키기 때문에 페이지의 리렌더링이 발생한다.</li>
<li>따라서 페이지 이동에 따라서 동적인 전환 애니메이션이 필요한 경우에는 template 파일을 사용한다. 그러나 vercel 에서는 꼭 필요한 경우가 아니라면 layout 사용을 권장하고 있다.</li>
</ul>
</li>
<li>default : 병렬 경로 폴백 페이지
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>not-found는 사용자가 있지도 않은 url path를 입력했을 때 경로를 찾지 못한다는 에러를 반환하는 페이지이고, default는 경로는 있긴 있는데 특정 id나 게시글 번호 등을 잘못 입력했거나 하는 이유로 찾지 못할 때 보여주는 기본 페이지이다.</li>
</ul>
</li>
</ul>
<h4 data-ke-size="size20">error와 global-error의 차이</h4>
<pre id="code_1720097316810" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// app/
//  └─ blog/
//      └─ [id]/
//          └─ page.tsx
//          └─ error.tsx
<p>'use client';</p>
<p>import { useState, useEffect } from 'react';</p>
<p>const BlogPost = ({ params }) =&gt; {
const { id } = params;
const [post, setPost] = useState(null);
const [error, setError] = useState(null);</p>
<p>useEffect(() =&gt; {
fetch(<code>/api/blog/${id}</code>)
.then(response =&gt; {
if (!response.ok) {
throw new Error('Network response was not ok');
}
return response.json();
})
.then(data =&gt; setPost(data))
.catch(err =&gt; setError(err));
}, [id]);</p>
<p>if (error) {
return &lt;ErrorComponent message=&quot;블로그 게시글을 불러오는 중 오류가 발생했습니다.&quot; /&gt;;
}</p>
<p>if (!post) {
return &lt;div&gt;Loading...&lt;/div&gt;;
}</p>
<p>return (
&lt;div&gt;
&lt;h1&gt;{post.title}&lt;/h1&gt;
&lt;p&gt;{post.content}&lt;/p&gt;
&lt;/div&gt;
);
};</p>
<p>const ErrorComponent = ({ message }) =&gt; (
&lt;div&gt;
&lt;h1&gt;오류 발생&lt;/h1&gt;
&lt;p&gt;{message}&lt;/p&gt;
&lt;/div&gt;
);</p>
<p>export default BlogPost;</code></pre></p>
<pre id="code_1720097340899" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// app/global-error.tsx

'use client';

import React from 'react';

export default function GlobalError({ error, reset }) {
  React.useEffect(() =&gt; {
    console.error(error);
  }, [error]);

  return (
    &lt;html&gt;
      &lt;body&gt;
        &lt;div&gt;
          &lt;h1&gt;에러가 발생했습니다.&lt;/h1&gt;
          &lt;p&gt;{error.message}&lt;/p&gt;
          &lt;button onClick={() =&gt; reset()}&gt;다시 시도하기&lt;/button&gt;
        &lt;/div&gt;
      &lt;/body&gt;
    &lt;/html&gt;
  );
}</code></pre>
<h4 data-ke-size="size20">layout과 tamplate 파일 구조 예시</h4>
<pre id="code_1720098126870" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>app/
  ├─ layout.tsx
  ├─ blog/
      ├─ layout.tsx
      ├─ [id]/
          ├─ layout.tsx (또는 template.tsx)
          ├─ page.tsx</code></pre>
<h4 data-ke-size="size20">not-found와 default 페이지 차이</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>작성 방법 차이
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>not-found : app/not-found.tsx에 작성</li>
<li>dafault : app/blog/[id]/default.tsx에 작성. /blog path의 기본 UI가 됨.</li>
</ul>
</li>
<li>의미의 차이
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>not-found : app 폴더 내에 wonyoung이라는 폴더는 있지도 않음. 근데 사용자가 /wonyoung 이런 식으로 접근하면 not-found 에러가 출력되며 이 페이지가 렌더링 됨.</li>
<li>dafault : 사용자가 /blog/1234 라고 입력했을 때 /blog 라는 app 폴더는 있다고 가정. 만약 뒤에 붙이는 [id]가 있는 id면 그 id를 받아서 렌더링 하는 app/blog/[id]/page.tsx가 렌더링 될 것이고, 없는 id면 default 페이지가 보이게 됨.</li>
</ul>
</li>
</ul>
<h3 data-ke-size="size23">Pages 폴더 (라우팅 구버전 방식)</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>App Router vs Pages Router 구분
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>App Router : src/app 폴더 내에 폴더와 page.tsx 파일이 있음.</li>
<li>Pages Router : src/pages/index.tsx 와 같이 라우팅이 됨.</li>
</ul>
</li>
<li>두 라우팅 방식을 혼용하면 App Router가 Pages Router 보다 우선되기 때문에 개발자의 의도대로 라우팅이 되지 않을 수 있음.</li>
</ul>
<h2 data-ke-size="size26">public 폴더</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>assets 폴더와 같다. 프로젝트에서 사용 할 이미지, 폰트 등을 저장한다.</li>
<li>변하지 않고, 사용자 등급과 관련없이 모두가 볼 수 있는 파일만 넣는 게 좋다.</li>
<li>폴더는 있어도 되고 없어도 됨.</li>
</ul>
<h2 data-ke-size="size26">src 폴더</h2>
<p data-ke-size="size16">소스 폴더를 의미하는데, 있어도 되고 없어도 된다.</p>
<h2 data-ke-size="size26">개발 모드</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>yarn dev, npm run dev 등의 명령어로 실행 됨.</li>
<li>localhost:3000 포트를 사용함.</li>
</ul>
<h2 data-ke-size="size26">그 외 최상위 파일들</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>next.config.js : Next.js를 구성하는 파일.</li>
<li>package.json : 프로젝트의 의존성과 스크립트(명령어)들이 정의되어 있음.</li>
<li>intumentation.ts : 분석 파일</li>
<li>middleware.ts : Next.js의 미들웨어 요청 파일</li>
<li>환경 변수 파일들
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>.env : 환경 변수 파일.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>로컬, 프로덕션, 개발 모드에서 공통적으로 사용되는 환경 변수를 지정함.</li>
<li>API_URL=https://api.example.com</li>
</ul>
</li>
<li>.env.local : 로컬 환경 변수 파일
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>로컬 환경에서만 사용되는 환경 변수</li>
<li>API_URL=http://localhost:3000/api</li>
</ul>
</li>
<li>.env.production : 프로덕션 환경 변수 파일
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>프로덕션(실제 서비스) 환경에서만 사용되는 환경 변수</li>
<li>built, start 명령어를 실행할 때 사용됨.</li>
<li>API_URL=https://api.example.com</li>
</ul>
</li>
<li>.env.development : 개발 환경 변수 파일
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>개발 환경에서만 사용되는 환경 변수</li>
<li>API_URL=http://dev.example.com/api</li>
<li>dev 명령어를 실행할 때 사용됨.</li>
</ul>
</li>
</ul>
</li>
<li>.gitignore : Git에 올리지 않을 파일과 폴더 지정</li>
<li>next-env.d.ts : Next.js용 타입스크립트 선언 파일</li>
<li>tsconfig.json : 타입스크립트 설정 파일</li>
<li>jsconfig.json : 자바스크립트 설정 파일</li>
</ul>
<h2 data-ke-size="size26">폴더 구조에 따른 라우팅</h2>
<h3 data-ke-size="size23">&nbsp;app 폴더에 폴더를 만들면 그 폴더 이름으로 자동으로 라우팅이 생성됨.</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>app/ive : localhost:3000/ive</li>
<li>app/ive/wonyoung : localhost:3000/ive/wonyoung</li>
</ul>
<h3 data-ke-size="size23">동적 라우팅</h3>
<p data-ke-size="size16">이 개념은 아직 잘 이해가 안 되고 있음. 제대로 이해 되면 추후 수정하겠음.</p>
<p data-ke-size="size16">현재 이해한 정도로 기술하자면...</p>
<h4 data-ke-size="size20">[folder] : app/blog/[id]/page.tsx</h4>
<p data-ke-size="size16">특정 게시물을 만들 때 사용함.</p>
<pre id="code_1720099338437" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>import React from 'react';
<p>const BlogPost = ({ params }: { params: { id: string } }) =&gt; {
return (
&lt;div&gt;
&lt;h1&gt;블로그 게시물 ID: {params.id}&lt;/h1&gt;
&lt;p&gt;이것은 {params.id}번 블로그 게시물입니다.&lt;/p&gt;
&lt;/div&gt;
);
};</p>
<p>export default BlogPost;</code></pre></p>
<h4 data-ke-size="size20">[...folder] : app/blog/[...categories]/page.tsx</h4>
<p data-ke-size="size16">카테고리를 만들 때 사용함.</p>
<pre id="code_1720099429150" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>import React from 'react';
<p>const BlogCategories = ({ params }: { params: { categories: string[] } }) =&gt; {
return (
&lt;div&gt;
&lt;h1&gt;카테고리: {params.categories.join(' &gt; ')}&lt;/h1&gt;
&lt;p&gt;이것은 {params.categories.join(', ')} 카테고리에 있는 블로그 게시물입니다.&lt;/p&gt;
&lt;/div&gt;
);
};</p>
<p>export default BlogCategories;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<h4 data-ke-size="size20">[[...folder]] : app/blog/[[...categories]]/page.tsx</h4>
<p data-ke-size="size16">URL path에 이 path는 넣어도 되고 안 넣어도 작동하도록 할 때. 넣으면 이곳에 있는 page가 보이고, 안 넣으면 blog의 page를 보여줌.</p>
<pre id="code_1720099529707" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>import React from 'react';
<p>const Blog = ({ params }: { params: { categories?: string[] } }) =&gt; {
return (
&lt;div&gt;
&lt;h1&gt;
{params.categories ? <code>카테고리: ${params.categories.join(' &amp;gt; ')}</code> : '전체 블로그'}
&lt;/h1&gt;
&lt;p&gt;
{params.categories
? <code>이것은 ${params.categories.join(', ')} 카테고리에 있는 블로그 게시물입니다.</code>
: '이것은 전체 블로그 게시물입니다.'}
&lt;/p&gt;
&lt;/div&gt;
);
};</p>
<p>export default Blog;</code></pre></p>
<h2 data-ke-size="size26">Route Group과 Private Folders</h2>
<h3 data-ke-size="size23">Route Group</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>app 폴더 내에 (폴더이름) 소괄호로 폴더를 만들고 이 안에 파일을 만들면 이 소괄호는 라우팅이 되지 않음. 즉 URL 주소로 만들어지지 않음.</li>
<li>Next.js에서는 App 폴더 내에서 폴더를 만들면 자동으로 URL path가 생성되며 라우팅이 되나, 소괄호는 단순히 그룹핑 목적임.</li>
<li>비슷한 관심사의 폴더와 페이지 파일을 하나의 폴더로 묶어서 정리할 때 사용.</li>
</ul>
<pre id="code_1720099760169" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>app/
  ├─ (info)/
      ├─ about/
      │   └─ page.tsx
      ├─ contact/
      │   └─ page.tsx</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>위와 같이 작성하면 라우팅은 (info)는 무시되고 라우팅이 두 개 생기는 것임.</li>
<li>/about, /contact</li>
</ul>
<h3 data-ke-size="size23">Private Folders</h3>
<pre id="code_1720099861280" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>app/
  ├─ _utils/
      ├─ helper.ts
      ├─ constants.ts</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>라우트 그룹과 유사해보이지만 라우트 그룹은 이미 만들어진 라우트들을 묶는 용도로 사용하는 것이고,</li>
<li>프라이빗 폴더즈는 라우트와 전혀 상관 없는 유틸 파일들을 라우팅에서 제외 시킬 때 _ 언더 스코어를 넣어서 폴더를 만들어 제외시키는 방법임.</li>
</ul>
<h2 data-ke-size="size26">메타 데이터 관련 파일</h2>
<h3 data-ke-size="size23">앱 아이콘</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>favicon : 대표 파비콘 .ico</li>
<li>icon : 앱 아이콘 .ico .jpg .jpeg. .png .svg</li>
<li>icon : JS, TS로 만드는 앱 아이콘 .js .ts. tsx</li>
<li>apple-icon : 애플용 앱 아이콘 .jpg .jpeg .png</li>
<li>apple-icon : JS, TS로 만드는 애플용 앱 아이콘 .js .ts. tsx</li>
</ul>
<h2 data-ke-size="size26">SEO 관련 파일</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>sitemap : 정적, 동적 사이트맵 파일 .xml .js .ts</li>
<li>robots : 검색 엔진이 어떤 부분을 크롤링 할 수 있는지 없는지 알려주는 파일 .txt .js .ts</li>
</ul>
<pre id="code_1720101739579" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// public/sitemap.xml
<p>&lt;urlset xmlns=&quot;http://www.sitemaps.org/schemas/sitemap/0.9&quot;&gt;
&lt;url&gt;
&lt;loc&gt;https://www.example.com/&lt;/loc&gt;
&lt;lastmod&gt;2024-01-01&lt;/lastmod&gt;
&lt;priority&gt;1.00&lt;/priority&gt;
&lt;/url&gt;
&lt;url&gt;
&lt;loc&gt;https://www.example.com/about&lt;/loc&gt;
&lt;lastmod&gt;2024-01-01&lt;/lastmod&gt;
&lt;priority&gt;0.80&lt;/priority&gt;
&lt;/url&gt;
&lt;/urlset&gt;</code></pre></p>
<pre id="code_1720101765273" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// public/robots.txt

User-agent: *
Disallow: /admin/
Allow: /</code></pre>