<h2 data-ke-size="size26">a 태그란?</h2>
<p data-ke-size="size16">HTML에서 페이지를 이동시키는 방법.</p>
<p data-ke-size="size16">그러나 깜빡임이 발생하기 때문에 사용성은 떨어진다.</p>
<pre id="code_1719897290321" class="html xml" data-ke-language="html" data-ke-type="codeblock"><code>&lt;a href="/"&gt;홈으로&lt;/a&gt;</code></pre>
<h2 data-ke-size="size26">Link 컴포넌트란?</h2>
<p data-ke-size="size16">React에서 추가된 기능이다. a태그를 깜빡임 없이 이용할 수 있는 신통방통한 기능이다.</p>
<p data-ke-size="size16">Next.js 역시 React 기반이기에 동일하게 사용할 수 있다.</p>
<p data-ke-size="size16">Link를 사용하더라도 브라우저에는 a태그로 생성되기 때문에 라이브러리에서 추가된 기능이라 할 지라도 검색 엔진이 읽어들이는 데 문제가 없다. 따라서 SEO 최적화에도 좋다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">Link가 a태그임에도 깜빡임이 없는 이유는, Link로 작성된 페이지 이동 링크는 사용자의 뷰포트(화면)에 나타나는 순간 prefetching한다. 즉 사용자가 분명 누를 것 같기 때문에 누르지 않았음에도 미리 그 페이지의 코드와 데이터를 가져와서 로드해 놓는다. 따라서 사용자가 Link 태그를 누르면 마치 준비된 것처럼 신속하게 페이지를 볼 수 있게 해준다.</p>
<pre id="code_1719897323159" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>import Link from 'next/link';
<p>&lt;Link href=&quot;/&quot;&gt;홈으로&lt;/Link&gt;</code></pre></p>
<h2 data-ke-size="size26">useRouter 훅</h2>
<p data-ke-size="size16">페이지 이동을 시켜주는 기능은 위와 같으나, 사용법이 다르다.</p>
<p data-ke-size="size16">a 태그나 Link 컴포넌트가 다른 페이지로 이동을 시켜주는 내비게이션의 역할만을 수행한다면,</p>
<p data-ke-size="size16">useRouter 훅은 특정 action들과 함께 묶어서 처리하는 로직에 사용된다. 쉽게 말해서 코드로 페이지 이동 외의 동작들을 제어할 수 있다는 말인데, 주로 onClick과 같은 이벤트 핸들러에서 사용된다.</p>
<pre id="code_1719897622367" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>import { useRouter } from 'next/router';
<p>export default function Home() {
const router = useRouter();</p>
<p>const handleClick = () =&gt; {
alert('about 페이지로 이동합니다.')
router.push('/about');
};</p>
<p>return (
&lt;div&gt;
&lt;button onClick={handleClick}&gt;Go to About&lt;/button&gt;
&lt;/div&gt;
);
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">사용 방법은</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>useRouter를 import</li>
<li>const router = useRouter(); 함수 선언</li>
<li>이벤트 핸들러 함수 정의 할 때 router.push('/');과 같이 사용</li>
</ul>
<p data-ke-size="size16">useRouter 훅은 a 태그를 만들어주지 않는다. 즉 SEO에는 불리하다. 그래서 내비게이션 등에서의 사용보다는 버튼 클릭 등의 액션에서, 다른 함수들과 함께 묶어서 사용하는 경우가 많다.</p>
<h3 data-ke-size="size23">useRouter 메서드</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>push : 브라우저 히스토리에 이동하는 페이지로 추가함. 따라서 페이지 이동 후 뒤로가기를 누르면 이전 페이지로 이동이 됨.</li>
<li>replace : 현재 페이지를 대체하는 개념이라 브라우저 히스토리에 추가하지 않아 뒤로가기가 안 됨.</li>
<li>prefetch : 사용자가 링크를 클릭하기 전에 prefetch함. Link 컴포넌트에서는 기본적으로 제공하는 동작임.</li>
<li>back : 브라우저 히스토리 상에서 이전 페이지로 이동 시킴.</li>
<li>forward : 브라우저 히스토리 상에서 다음 페이지로 이동 시킴.</li>
<li>reload : 현재 페이지를 다시 로드함.</li>
</ul>