<h3 data-ke-size="size23">Lazy Loading</h3>
<p data-ke-size="size16"><br />Lazy loading은 Next.js에서 애플리케이션의 초기 로딩 성능을 개선하는 데 도움을 주며, 경로를 렌더링하는 데 필요한 JavaScript의 양을 줄여줍니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">클라이언트 컴포넌트와 가져온 라이브러리의 로딩을 지연시킬 수 있으며, 필요할 때만 클라이언트 번들에 포함되도록 합니다. 예를 들어, 사용자가 모달을 열려고 클릭할 때까지 모달의 로딩을 지연시킬 수 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">Next.js에서 lazy loading을 구현하는 두 가지 방법이 있습니다:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>next/dynamic을 사용한 동적 가져오기</li>
<li>React.lazy()와 Suspense를 사용</li>
</ol>
<p data-ke-size="size16">기본적으로 서버 컴포넌트는 자동으로 코드 분할이 되며, 스트리밍을 사용하여 서버에서 클라이언트로 UI 조각을 점진적으로 전송할 수 있습니다. Lazy loading은 클라이언트 컴포넌트에 적용됩니다.</p>
<h3 data-ke-size="size23">next/dynamic</h3>
<p data-ke-size="size16">next/dynamic은 React.lazy()와 Suspense의 합성입니다. 점진적 마이그레이션을 허용하기 위해 앱 및 페이지 디렉토리에서 동일하게 작동합니다.</p>
<h3 data-ke-size="size23">예시</h3>
<h4 data-ke-size="size20">클라이언트 컴포넌트 가져오기</h4>
<pre class="javascript"><code>app/page.js
<p>'use client'</p>
<p>import { useState } from 'react'
import dynamic from 'next/dynamic'</p>
<p>// 클라이언트 컴포넌트:
const ComponentA = dynamic(() =&gt; import('../components/A'))
const ComponentB = dynamic(() =&gt; import('../components/B'))
const ComponentC = dynamic(() =&gt; import('../components/C'), { ssr: false })</p>
<p>export default function ClientComponentExample() {
const [showMore, setShowMore] = useState(false)</p>
<p>return (
&lt;div&gt;
{/* 즉시 로드하지만 별도의 클라이언트 번들로 */}
&lt;ComponentA /&gt;</p>
<pre><code>  {/* 조건이 충족될 때만 필요에 따라 로드 */}
  {showMore &amp;amp;&amp;amp; &amp;lt;ComponentB /&amp;gt;}
  &amp;lt;button onClick={() =&amp;gt; setShowMore(!showMore)}&amp;gt;Toggle&amp;lt;/button&amp;gt;

  {/* 클라이언트 측에서만 로드 */}
  &amp;lt;ComponentC /&amp;gt;
&amp;lt;/div&amp;gt;
</code></pre>
<p>)
}</code></pre></p>
<h3 data-ke-size="size23">SSR 건너뛰기</h3>
<p data-ke-size="size16">React.lazy()와 Suspense를 사용할 때, 클라이언트 컴포넌트는 기본적으로 SSR(서버 사이드 렌더링)됩니다.</p>
<p data-ke-size="size16">클라이언트 컴포넌트의 사전 렌더링을 비활성화하려면 ssr 옵션을 false로 설정할 수 있습니다:</p>
<pre class="coffeescript"><code>const ComponentC = dynamic(() =&gt; import('../components/C'), { ssr: false })</code></pre>
<h3 data-ke-size="size23">서버 컴포넌트 가져오기</h3>
<p data-ke-size="size16">서버 컴포넌트를 동적으로 가져오면, 서버 컴포넌트 자체가 아닌 해당 서버 컴포넌트의 자식인 클라이언트 컴포넌트만 lazy-load됩니다.</p>
<pre class="javascript"><code>app/page.js
<p>import dynamic from 'next/dynamic'</p>
<p>// 서버 컴포넌트:
const ServerComponent = dynamic(() =&gt; import('../components/ServerComponent'))</p>
<p>export default function ServerComponentExample() {
return (
&lt;div&gt;
&lt;ServerComponent /&gt;
&lt;/div&gt;
)
}</code></pre></p>
<h3 data-ke-size="size23">외부 라이브러리 로딩</h3>
<p data-ke-size="size16">외부 라이브러리는 import() 함수를 사용하여 필요할 때 로드할 수 있습니다. 이 예제에서는 fuzzy search를 위해 외부 라이브러리 fuse.js를 사용합니다. 모듈은 사용자가 검색 입력에 타이핑을 한 후 클라이언트에서만 로드됩니다.</p>
<pre class="cs"><code>app/page.js
<p>'use client'</p>
<p>import { useState } from 'react'</p>
<p>const names = ['Tim', 'Joe', 'Bel', 'Lee']</p>
<p>export default function Page() {
const [results, setResults] = useState()</p>
<p>return (
&lt;div&gt;
&lt;input
type=&quot;text&quot;
placeholder=&quot;Search&quot;
onChange={async (e) =&gt; {
const { value } = e.currentTarget
// fuse.js를 동적으로 로드
const Fuse = (await import('fuse.js')).default
const fuse = new Fuse(names)</p>
<pre><code>      setResults(fuse.search(value))
    }}
  /&amp;gt;
  &amp;lt;pre&amp;gt;Results: {JSON.stringify(results, null, 2)}&amp;lt;/pre&amp;gt;
&amp;lt;/div&amp;gt;
</code></pre>
<p>)
}</code></pre></p>
<h3 data-ke-size="size23">커스텀 로딩 컴포넌트 추가</h3>
<pre class="javascript"><code>app/page.js
<p>import dynamic from 'next/dynamic'</p>
<p>const WithCustomLoading = dynamic(
() =&gt; import('../components/WithCustomLoading'),
{
loading: () =&gt; &lt;p&gt;Loading...&lt;/p&gt;,
}
)</p>
<p>export default function Page() {
return (
&lt;div&gt;
{/* &lt;WithCustomLoading/&gt;이 로딩되는 동안 로딩 컴포넌트가 렌더링됩니다 */}
&lt;WithCustomLoading /&gt;
&lt;/div&gt;
)
}</code></pre></p>
<h3 data-ke-size="size23">Named Exports 가져오기</h3>
<p data-ke-size="size16">동적으로 named export를 가져오려면 import() 함수에서 반환된 Promise에서 해당 export를 반환할 수 있습니다:</p>
<pre class="javascript"><code>components/hello.js
<p>'use client'</p>
<p>export function Hello() {
return &lt;p&gt;Hello!&lt;/p&gt;
}</p>
<p>app/page.js</p>
<p>import dynamic from 'next/dynamic'</p>
<p>const ClientComponent = dynamic(() =&gt;
import('../components/hello').then((mod) =&gt; mod.Hello)
)</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 내용은 다음 사이트에서 가져온 것입니다: <a href="https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading">Next.js Lazy Loading</a></p>