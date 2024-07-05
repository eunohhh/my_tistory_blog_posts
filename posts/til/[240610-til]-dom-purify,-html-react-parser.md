<h3>Dompurify 라이브러리</h3>
<h4>사용 목적</h4>
<p>Dompurify는 악성 코드 삽입 공격(XSS)을 방지하기 위해 HTML, SVG, MathML 등의 사용자 입력을 정화하는 라이브러리입니다. 이를 통해 웹 애플리케이션에서 안전하게 사용자 콘텐츠를 렌더링할 수 있습니다.</p>
<h4>사용 방법</h4>
<ol>
<li><p><strong>설치</strong>:</p>
<pre><code class="language-bash">npm install dompurify</code></pre>
</li>
<li><p><strong>사용 예시</strong>:</p>
<pre><code class="language-javascript">import DOMPurify from &#39;dompurify&#39;;
<p>const dirty = '&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt; &lt;b&gt;bold&lt;/b&gt;';
const clean = DOMPurify.sanitize(dirty);</p>
<p>document.getElementById('content').innerHTML = clean;</code></pre></p>
</li>
<li><p><strong>CDN 사용</strong>:</p>
<pre><code class="language-html">&lt;script src=&quot;https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.3.3/purify.min.js&quot;&gt;&lt;/script&gt;
&lt;script&gt;
  const dirty = &#39;&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt; &lt;b&gt;bold&lt;/b&gt;&#39;;
  const clean = DOMPurify.sanitize(dirty);
  document.getElementById(&#39;content&#39;).innerHTML = clean;
&lt;/script&gt;</code></pre>
</li>
</ol>
<h3>Html-React-Parser 라이브러리</h3>
<h4>사용 목적</h4>
<p><code>html-react-parser</code>는 HTML 문자열을 React 요소로 변환하는 라이브러리입니다. 이를 통해 서버나 외부 소스로부터 받은 HTML 코드를 안전하게 React 컴포넌트 내에서 렌더링할 수 있습니다. 이 라이브러리는 단순한 HTML 파싱을 넘어, 특정 HTML 태그를 사용자 정의 React 컴포넌트로 대체하거나, 태그의 속성을 수정하는 등의 커스터마이징이 가능합니다.</p>
<h3>사용 예시</h3>
<pre><code class="language-javascript">import parse from &#39;html-react-parser&#39;;
<p>const htmlString = '&lt;div&gt;&lt;h1&gt;Hello, World!&lt;/h1&gt;&lt;p&gt;This is a paragraph.&lt;/p&gt;&lt;/div&gt;';
const parsedContent = parse(htmlString);</p>
<p>const MyComponent = () =&gt; (
&lt;div&gt;
{parsedContent}
&lt;/div&gt;
);</p>
<p>export default MyComponent;</code></pre></p>
<p>이렇게 <code>html-react-parser</code>를 사용하면, 동적으로 받은 HTML 콘텐츠를 React에서 안전하게 렌더링할 수 있습니다.</p>
<h3>함께 사용</h3>
<p>리액트에서 <code>html-react-parser</code>와 <code>DOMPurify</code>를 함께 사용하는 방법을 정리하면 다음과 같습니다:</p>
<h3>1. 라이브러리 설치</h3>
<pre><code class="language-bash">npm install html-react-parser dompurify</code></pre>
<h3>2. 코드 작성</h3>
<pre><code class="language-jsx">import React, { useMemo } from &#39;react&#39;;
import parse, { domToReact } from &#39;html-react-parser&#39;;
import DOMPurify from &#39;dompurify&#39;;
<p>const BlogContent = ({ blog }) =&gt; {
const cleanHTML = useMemo(() =&gt; {
if (blog) {
return DOMPurify.sanitize(blog.contents);
}
return '';
}, [blog]);</p>
<p>const replaceImgTag = (node) =&gt; {
if (node.name === 'img') {
const { src } = node.attribs;
const item = {
image: src,
title: 'blog_image'
};
return &lt;CustomImage item={item} /&gt;;
}</p>
<pre><code>if (node.name === &amp;#39;p&amp;#39;) {
    return &amp;lt;StyledP&amp;gt;{domToReact(node.children || [], { replace: replaceImgTag })&amp;lt;/StyledP&amp;gt;
}
return domToReact(node.children || [], { replace: replaceImgTag });
</code></pre>
<p>};
return (
&lt;div&gt;
{parse(cleanHTML, { replace: replaceImgTag })}
&lt;/div&gt;
);
};</p>
<p>export default BlogContent;</code></pre></p>
<h3>설명</h3>
<ol>
<li><strong>라이브러리 임포트</strong>: <code>html-react-parser</code>와 <code>DOMPurify</code>를 가져옵니다.</li>
<li><strong>HTML 정화</strong>: <code>useMemo</code> 훅을 사용하여 <code>blog.contents</code>를 정화합니다.</li>
<li><strong>이미지 태그 대체</strong>: <code>replaceImgTag</code> 함수로 <code>img</code> 태그를 대체합니다.</li>
<li><strong>파싱 및 렌더링</strong>: <code>parse</code> 함수를 사용하여 정화된 HTML을 JSX로 변환하여 렌더링합니다.</li>
</ol>