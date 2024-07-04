<h2 data-ke-size="size26">layout.tsx</h2>
<h3 data-ke-size="size23">전체 공통 레이아웃</h3>
<p data-ke-size="size16">layout 파일을 작성하면 segment와 그 자식 node에 있는 요소들이 공통적으로 적용받게 할 UI를 작성할 수 있다.</p>
<p data-ke-size="size16">예를 들어 header나 footer같은 공통 요소를 말한다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1114" data-origin-height="524"><span data-url="https://blog.kakaocdn.net/dn/bU3Gf4/btsIjfUWQ8o/mQyWZPfRk8i91Z1xzkgXkk/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/bU3Gf4/btsIjfUWQ8o/mQyWZPfRk8i91Z1xzkgXkk/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbU3Gf4%2FbtsIjfUWQ8o%2FmQyWZPfRk8i91Z1xzkgXkk%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1114" data-origin-height="524"/></span></figure>
</p>
<p data-ke-size="size16">Next.js 프로젝트를 생성하고 나면 src/app/layout.tsx가 자동으로 생성되어 있다.</p>
<p data-ke-size="size16">이 파일에 레이아웃을 작성하면 라우팅을 몇 개를 해놨든 모든 페이지에 공통적으로 적용된다.</p>
<p data-ke-size="size16">그리고 그 라우팅 된 페이지들에서 상태가 변경되더라도 이 layout.tsx 파일은 최상위 부모 컴포넌트이기 때문에 리렌더링이 되지 않아 깜빡임 없는 사용성을 제공할 수 있다.</p>
<h3 data-ke-size="size23">라우트별 공통 레이아웃</h3>
<p data-ke-size="size16">앱 라우팅 별로도 레이아웃을 지정할 수 있다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1120" data-origin-height="590"><span data-url="https://blog.kakaocdn.net/dn/YPpB3/btsIjaGeUO5/836QuLeSiL7jTbK8uqkst0/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/YPpB3/btsIjaGeUO5/836QuLeSiL7jTbK8uqkst0/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FYPpB3%2FbtsIjaGeUO5%2F836QuLeSiL7jTbK8uqkst0%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1120" data-origin-height="590"/></span></figure>
</p>
<p data-ke-size="size16">위 폴더 트리를 보면</p>
<pre id="tree-panel" class="css" style="color: #383a42; text-align: start;"><code> about
 ┣  company
 ┃ ┗  page.tsx
 ┣  customer
 ┃ ┗  page.tsx
 ┗  layout.tsx</code></pre>
<p data-ke-size="size16">이런 형태로 되어 있는데, about 폴더 안에 두 개의 라우트가 존재한다.</p>
<p data-ke-size="size16">그렇지만 layout.tsx는 about 폴더 내에 위치하고 있기 때문에 여기에 레이아웃을 작성하면 about 폴더 내에 있는 모든 라우트에 공통 레이아웃이 적용된다.</p>
<h3 data-ke-size="size23">layout.tsx 작성법</h3>
<pre id="code_1719851131514" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    &lt;section&gt;
      {/* 이곳에 헤더나 사이드바 같은 공통 레이아웃 작성 */}
      &lt;nav&gt;&lt;/nav&gt;
<pre><code>  {children}
&amp;lt;/section&amp;gt;
</code></pre>
<p>)
}</code></pre></p>
<p data-ke-size="size16">타입스크립트의 경우, 함수형 컴포넌트의 매개 변수 children의 타입을 React.ReactNode로 지정해주고, {children} 위에서 공통적으로 적용될 레이아웃을 작성해주면 된다.</p>
<h2 data-ke-size="size26">template.tsx</h2>
<p data-ke-size="size16">layout.tsx와 자주 비교되는 개념이다. layout.tsx 파일을 template.tsx로 이름을 바꿔서 사용할 수 있다.</p>
<p data-ke-size="size16">layout.tsx는 children 간 이동을 하며 상태를 리렌더링 시켜도 layout.tsx는 리렌더링이 이루어지지 않는다.</p>
<p data-ke-size="size16">즉 자식 컴포넌트의 영향을 받지 않는다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">하지만 template.tsx는 children의 상태가 변경되면 리렌더링이 발생한다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">웬만해서는 공통 레이아웃을 children의 영향을 받도록 작성하는 일이 없어 template.tsx를 사용할 일이 없겠지만,</p>
<p data-ke-size="size16">자식 컴포넌트 간 이동을 할 때 애니메이션을 순차적으로 파도타기 식으로 적용시킨다든지, 이런 상황에서는 use-case가 있다.</p>
<p data-ke-size="size16">이런 특수한 상황을 제외하고는 공통 컴포넌트는 layout.tsx에 작성한다.</p>