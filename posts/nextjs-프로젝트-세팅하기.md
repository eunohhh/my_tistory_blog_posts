<h2 data-ke-size="size26">참고</h2>
<p data-ke-size="size16">Next.js 공식 문서</p>
<p data-ke-size="size16"><a href="https://nextjs.org/docs/getting-started/installation" target="_blank" rel="noopener&nbsp;noreferrer">https://nextjs.org/docs/getting-started/installation</a></p>
<figure id="og_1719832841490" contenteditable="false" data-ke-type="opengraph" data-ke-align="alignCenter" data-og-type="website" data-og-title="Getting Started: Installation | Next.js" data-og-description="Create a new Next.js application with &#96;create-next-app&#96;. Set up TypeScript, styles, and configure your &#96;next.config.js&#96; file." data-og-host="nextjs.org" data-og-source-url="https://nextjs.org/docs/getting-started/installation" data-og-url="https://nextjs.org/docs/getting-started/installation" data-og-image="https://scrap.kakaocdn.net/dn/cWp5aP/hyWrRFUKc7/NGrHwHjKPx77MKN6eBmlD0/img.png?width=843&amp;height=441&amp;face=0_0_843_441,https://scrap.kakaocdn.net/dn/vUXqO/hyWrWNYY6g/SlUSaXxKvbW0sL72eCfGKk/img.png?width=843&amp;height=441&amp;face=0_0_843_441,https://scrap.kakaocdn.net/dn/laFjB/hyWrOPZnaH/vDXkbrwvhOvqtkT2H2bQLk/img.png?width=1600&amp;height=363&amp;face=0_0_1600_363"><a href="https://nextjs.org/docs/getting-started/installation" target="_blank" rel="noopener" data-source-url="https://nextjs.org/docs/getting-started/installation">
<div class="og-image" style="background-image: url('https://scrap.kakaocdn.net/dn/cWp5aP/hyWrRFUKc7/NGrHwHjKPx77MKN6eBmlD0/img.png?width=843&amp;height=441&amp;face=0_0_843_441,https://scrap.kakaocdn.net/dn/vUXqO/hyWrWNYY6g/SlUSaXxKvbW0sL72eCfGKk/img.png?width=843&amp;height=441&amp;face=0_0_843_441,https://scrap.kakaocdn.net/dn/laFjB/hyWrOPZnaH/vDXkbrwvhOvqtkT2H2bQLk/img.png?width=1600&amp;height=363&amp;face=0_0_1600_363');">&nbsp;</div>
<div class="og-text">
<p class="og-title" data-ke-size="size16">Getting Started: Installation | Next.js</p>
<p class="og-desc" data-ke-size="size16">Create a new Next.js application with `create-next-app`. Set up TypeScript, styles, and configure your `next.config.js` file.</p>
<p class="og-host" data-ke-size="size16">nextjs.org</p>
</div>
</a></figure>
<h2 data-ke-size="size26">시스템 요구사항</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Node.js 18.17 이상</li>
<li>MacOS, Windows, Linux 지원</li>
</ul>
<h2 data-ke-size="size26">자동설치</h2>
<pre id="code_1719832918995" class="html xml" data-ke-language="html" data-ke-type="codeblock"><code>npx create-next-app@latest</code></pre>
<h2 data-ke-size="size26">설치 메시지 선택 (Y/N)</h2>
<pre id="code_1719833042020" class="html xml" data-ke-language="html" data-ke-type="codeblock"><code>What is your project named? my-app
// 프로젝트 이름 설정
<p>Would you like to use TypeScript? No / Yes
// 타입스크립트를 사용할 것인지</p>
<p>Would you like to use ESLint? No / Yes
// ESLint를 사용할 것인지</p>
<p>Would you like to use Tailwind CSS? No / Yes
// Tailwind CSS를 사용할 것인지</p>
<p>Would you like to use <code>src/</code> directory? No / Yes
// src/ 디렉토리를 사용할 것인지</p>
<p>Would you like to use App Router? (recommended) No / Yes
// 앱 라우터를 사용할 것인지</p>
<p>Would you like to customize the default import alias (@/*)? No / Yes
// import 기본문을 사용할 것인지</p>
<p>What import alias would you like configured? @/*
// import의 기본문을 @/*로 사용할 것인지, 아니면 별도로 설정할 것인지</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">타입스크립트나 Tailwind 를 제외하고, 특별한 예외 사항이 없는 경우 전부 Yes로 하고 시작하면 되고,</p>
<p data-ke-size="size16">마지막 import 문은 Tab키를 눌러서 저대로 사용하면 됨.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">다 끝나고는 cd 프로젝트명으로 해당 디렉토리로 이동.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="800" data-origin-height="397"><span data-url="https://blog.kakaocdn.net/dn/lOvoy/btsIkujm6fh/v8ZBlpuKa8DAL5oKhPUnX1/img.gif" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/lOvoy/btsIkujm6fh/v8ZBlpuKa8DAL5oKhPUnX1/img.gif" srcset="https://blog.kakaocdn.net/dn/lOvoy/btsIkujm6fh/v8ZBlpuKa8DAL5oKhPUnX1/img.gif" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="800" data-origin-height="397"/></span></figure>
</p>
<h2 data-ke-size="size26">폴더 구조 살펴보기</h2>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="960" data-origin-height="1288"><span data-url="https://blog.kakaocdn.net/dn/nAYmM/btsIhTL1KGM/DF5k6CZ4HcuxdkJB3n9ri1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/nAYmM/btsIhTL1KGM/DF5k6CZ4HcuxdkJB3n9ri1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FnAYmM%2FbtsIhTL1KGM%2FDF5k6CZ4HcuxdkJB3n9ri1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="960" data-origin-height="1288"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>.tsx : 타입스크립트 프로젝트로 잘 만들어짐.</li>
<li>src/app : 페이지 라우팅(앱 라우팅 방식)을 담당할 폴더임.</li>
<li>src/app/page.tsx : React.js로 치면 App.tsx를 담당하던 홈 컴포넌트(페이지)임.</li>
<li>layout.tsx : 레이아웃을 담당하는 컴포넌트임.</li>
</ul>
<pre id="code_1719833806998" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// src/app/layout.tsx
<p>import type { Metadata } from &quot;next&quot;;</p>
<p>// Inter라는 구글 폰트를 기본으로 사용.
import { Inter } from &quot;next/font/google&quot;;</p>
<p>// 프로젝트 전반에 거쳐 global하게 스타일링을 함
import &quot;./globals.css&quot;;</p>
<p>const inter = Inter({ subsets: [&quot;latin&quot;] });</p>
<p>// 웹사이트 제목과 설명을 설정함.
export const metadata: Metadata = {
title: &quot;Create Next App&quot;,
description: &quot;Generated by create next app&quot;,
};</p>
<p>// 웹사이트 기본 HTML 구조를 정의함.
export default function RootLayout({
children,
}: Readonly&lt;{
children: React.ReactNode;
}&gt;) {
return (
&lt;html lang=&quot;en&quot;&gt;
&lt;body className={inter.className}&gt;{children}&lt;/body&gt;
&lt;/html&gt;
);
}</code></pre></p>
<h2 data-ke-size="size26">개발모드</h2>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="418" data-origin-height="258"><span data-url="https://blog.kakaocdn.net/dn/bcgqPO/btsIj9ml45u/Qbl9QRk6kUEtynJgZQWpk1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/bcgqPO/btsIj9ml45u/Qbl9QRk6kUEtynJgZQWpk1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbcgqPO%2FbtsIj9ml45u%2FQbl9QRk6kUEtynJgZQWpk1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="418" data-origin-height="258"/></span></figure>
</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>package.json -&gt; scripts 명령어에 다음과 같은 명령어가 보임.</li>
<li>npm run dev / yarn dev 아무거나 사용해도 됨.</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>yarn dev : 개발 서버를 연다. 개발 서버는 에디터 상에서 입력한 코드가 실시간으로 웹 브라우저에 반영된다.</li>
<li>yarn build : 웹 사이트를 배포하기 전 컴퓨터의 언어로 변환하는 과정이다. 이걸 해야 배포 모드로 볼 수 있다.</li>
<li>yarn start : 빌드를 완료하고 입력하면 배포가 되었을 때의 웹 사이트를 웹 브라우저에서 볼 수 있다. 작동이 안 된다면 빌드가 안 되었거나 포트 3000번이 이미 열려있을 수 있으니 점검해보길 바람. 배포모드는 실시간 반영이 되지 않으며, 수정사항이 반영되지 않는다. 따라서 에디터 상에서 수정된 사항까지 반영해서 보려면 빌드 -&gt; 스타트 과정을 반복해야 함.</li>
</ul>
<h2 data-ke-size="size26">수정해보기</h2>
<p data-ke-size="size16">src/app/page.tsx 파일을 수정해보면 잘 반영된다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="884" data-origin-height="556"><span data-url="https://blog.kakaocdn.net/dn/bzRT0P/btsIkgeyIIr/A6HsPdHUO0Lbp1HBibKc80/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/bzRT0P/btsIkgeyIIr/A6HsPdHUO0Lbp1HBibKc80/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbzRT0P%2FbtsIkgeyIIr%2FA6HsPdHUO0Lbp1HBibKc80%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="884" data-origin-height="556"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이상한 줄무늬 배경을 없애고 싶다면, src/app/global.css를 수정하면 된다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="896" data-origin-height="1104"><span data-url="https://blog.kakaocdn.net/dn/uu9Pc/btsIiPWBBEq/BUg5VVUQOVQYVKUlmpjuM0/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/uu9Pc/btsIiPWBBEq/BUg5VVUQOVQYVKUlmpjuM0/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fuu9Pc%2FbtsIiPWBBEq%2FBUg5VVUQOVQYVKUlmpjuM0%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="896" data-origin-height="1104"/></span></figure>
<figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="960" data-origin-height="566"><span data-url="https://blog.kakaocdn.net/dn/uyDsc/btsIiqQevUX/CiK1kTpE5zpfFKkruV5VVk/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/uyDsc/btsIiqQevUX/CiK1kTpE5zpfFKkruV5VVk/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FuyDsc%2FbtsIiqQevUX%2FCiK1kTpE5zpfFKkruV5VVk%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="960" data-origin-height="566"/></span></figure>
</p>