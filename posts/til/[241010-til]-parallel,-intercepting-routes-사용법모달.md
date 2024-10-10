<p data-ke-size="size16">자주써도 헷갈리는 parallel routes 와 intercepting routes 로<br />기본적인 modal 만드는 법을 정리해보려고 합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">1. Parallel Routes</h2>
<p data-ke-size="size16">Parallel Routes 는 모달을 만들기 위한 기능은 아닙니다.</p>
<p data-ke-size="size16">공식문서에 따르면,</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<blockquote data-ke-style="style2">Parallel Routes를 사용하면 동일한 레이아웃 내에서 하나 이상의 페이지를 동시에 <br />또는 조건부로 렌더링할 수 있습니다. 대시보드나 피드와 같이 앱의 매우 동적인 섹션에 유용합니다. 예를 들어 대시보드에서 Parallel Routes를 사용하여팀 페이지와 분석 페이지를 동시에 렌더링할 수 있습니다</blockquote>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">라고 합니다.</p>
<p data-ke-size="size16">만드는 법은 아래처럼 @ 를 붙여서(슬롯이라고 합니다) 폴더를 생성하고 page.tsx 만들면 됩니다.</p>
<pre class="typescript" data-ke-language="typescript"><code>app/
  ├─ @modal/
  │   ├─ example/       
  │   │    └─ page.tsx 
  │   └─ default.tsx
  ├─ example/  
  │   └─ page.tsx
  ├─ layout.tsx    
  └─ page.tsx</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그리고 layout.tsx 에 아래처럼 설정합니다.</p>
<pre class="typescript" data-ke-language="typescript"><code>interface LayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
};
<p>function Layout({ children, modal }: LayoutProps) {
return (
&lt;&gt;
{children}
{modal}
&lt;/&gt;
)
};</p>
<p>export default Layout;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">주의점은 슬롯은 경로 세그먼트가 아니며 URL 구조에 영향을 미치지 않습니다.<br />예를 들어 /@modal/example 의 경우 @modal 이 슬롯이므로 URL은 /example 가 됩니다.</p>
<p data-ke-size="size16">(슬롯은 url 에 영향을 주지 않고 무시됩니다)</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 예시에서는, /example 로 접속시 children 부분에는 <code>/example</code> 이,<br />modal 부분에는 <code>/@modal/example</code> 이 매핑됩니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">만약 / 로 접속한다면 children 부분에는 app/page.tsx 가 맵핑되고<br />{modal} 부분에는 default.tsx 가 맵핑될 것입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">default.tsx 는 Parallel Routes가 이용되지 않을 때(경로가 unmatched 일 때)<br />이 페이지를 디폴트로 보여줍니다.</p>
<p data-ke-size="size16">(하드네비게이션, 소프트네비게이션 차이가 있는데 <a href="https://nextjs.org/docs/app/building-your-application/routing/parallel-routes">공식문서</a> 를 참조하면 좋습니다)</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">여기까지 아주 기본적인 Parallel Routes 의 개념입니다.</p>
<p data-ke-size="size16"><br />그러나 이 상태로는 /example 로 소프트 네비게이션시 병렬적으로(동시에)<br /><code>/example</code> 과 <code>/@modal/example</code> 이 렌더링 되므로 모달과는 다릅니다.</p>
<p data-ke-size="size16">여기서부터 Intercepting Routes 를 알아보아야 합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">2. Intercepting Routes</h2>
<p data-ke-size="size16">Intercepting Routes 는 이름처럼 라우트를 '가로챕'니다.<br />공식문서에서는 다음처럼 설명하고 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<blockquote data-ke-style="style2">Intercepting Routes는 현재 레이아웃 내에서 애플리케이션의 다른 부분의 경로를 로드할 수 있습니다.<br />이 라우팅 패러다임은 사용자가 다른 컨텍스트로 전환하지 않고도 경로의 콘텐츠를 표시하려는 경우에 <br />유용할 수 있습니다.</blockquote>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">즉, 현재 페이지 컨텍스트를 유지한 채로 새로운 라우트를 렌더링 해줍니다.<br />따라서 주소를 바꾸지않고 다른 주소의 페이지들을 렌더링 할 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">Intercepting Routes 는 <code>(..)</code> 와 같은 컨벤션으로 정의됩니다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>(.)</code> 동일한 라우팅 레벨 세그먼트에 매칭</li>
<li><code>(..)</code> 부모 라우팅 레벨 세그먼트에 매칭</li>
<li><code>(..)(..)</code> 2단계 윗 레벨</li>
<li><code>(&hellip;)</code> app 디렉토리 루트 요소에 매칭</li>
</ul>
<p data-ke-size="size16">이때 기준은 경로 세그먼트(브라우저 주소...) 이므로 폴더구조와 혼동되면 안됩니다.<br />따라서 아래처럼 될 수 있습니다.</p>
<pre class="typescript" data-ke-language="typescript"><code>app/
  ├─ @modal/
  │   ├─ (.)example/         
  │   │    └─ page.tsx 
  │   └─ default.tsx
  ├─ example/  
  │   └─ page.tsx
  ├─ layout.tsx    
  └─ page.tsx</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">폴더 구조상으로는 app/@modal/(.)example 로 app/example 과 다른 레벨에 있는 것 같지만<br />경로 세그먼트 기준이므로, @modal은 무시되어 둘은 같은 레벨임에 주의하면 됩니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이렇게 모달을 만들시 좋은 점은 공식문서에 따르면 다음과 같습니다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>뒤로가기(router.back())로 모달을 열고 닫을 수 있음</li>
<li>URL 공유를 통해 모달 내용 공유 가능</li>
<li>페이지 새로고침 시 모달 안닫힘</li>
</ul>
<p data-ke-size="size16">즉, 경로로 접근시 모달이 뜨기 때문에 모달 자체를 url 로 관리할 수 있습니다.</p>
<p data-ke-size="size16"><br />많이 쓰는 방법인 createPortal 에 비해 분명한 장점이 있습니다.</p>
<p data-ke-size="size16">그러나 방법이 어떻게 보면 더 난해(?) 할 수도 있기 때문에<br />필요에 따라 쓰면 좋을 것 같습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">추가로, Parallel, Intercepting routes 의 사용법은 모달을 만들기 위한 것은 아닙니다.<br />그냥 모달로 쓰면 좋고 공식문서에도 예제로 나올 뿐이라고 생각됩니다.<br />이외에도 사용법이 많으니 공식문서를 한번 정리해봐야겠습니다...</p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">+ 각 파일의 내용</h2>
<pre class="javascript"><code>// app/@modal/default.tsx
export default function Default() {
  return null
}</code></pre>
<pre class="javascript"><code>// app/@modal/(.)example/page.tsx
import { Sample, Modal } from "@/components";
<p>function InterceptingPage() {
return (
&lt;Modal&gt;
&lt;Sample /&gt;
&lt;/Modal&gt;
);
}
export default InterceptingLoginPage;</code></pre></p>
<pre class="typescript" data-ke-language="typescript"><code>// app/example/page.tsx
import { Sample } from "@/components";

function Page() {
  return (
   &lt;Sample /&gt;
  );
}
export default Page;</code></pre>
<pre class="typescript" data-ke-language="typescript"><code>// app/layout.tsx
interface LayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
};

function Layout({ children, modal }: LayoutProps) {
  return (
    &lt;&gt;
      {children}
      {modal}
    &lt;/&gt;
  );
}

export default Layout;</code></pre>