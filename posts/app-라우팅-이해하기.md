<h2 data-ke-size="size26">주요개념</h2>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2718" data-origin-height="1784"><span data-url="https://blog.kakaocdn.net/dn/oruRP/btsIigtslwV/Y8sji45nXTqcogkEwQml41/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/oruRP/btsIigtslwV/Y8sji45nXTqcogkEwQml41/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2ForuRP%2FbtsIigtslwV%2FY8sji45nXTqcogkEwQml41%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="2718" data-origin-height="1784"/></span></figure>
</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>leaf: children이 더이상 없는 node를 의미함.</li>
<li>URL Segment : / 슬래시로 분류된 URL path의 한 부분을 말함.</li>
<li>URL path : 도메인 이후 따라오는 전체 URL 부분을 말함.</li>
</ul>
<h2 data-ke-size="size26">파일(폴더) 기반의 라우팅</h2>
<h3 data-ke-size="size23">page.tsx</h3>
<p data-ke-size="size16">/ path로 접근했을 때 보여지는 페이지의 이름이다.</p>
<p data-ke-size="size16">이 이름과 파일명이 다르면 페이지가 보이지 않는다.</p>
<h3 data-ke-size="size23">static routing</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>src/app 폴더 내부에 위치한 폴더가 /path가 된다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>예 ) src/app/info 폴더가 있다면, localhost:3000/info가 path가 되고, info 폴더 안에 있는 page.tsx가 이 path에 접근했을 때 렌더링 되는 페이지.</li>
</ul>
</li>
<li>폴더를 중첩해서 /path를 여러 개 만들 수 있다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>예 ) src/app/info/welcome 폴더를 만들면 이게 path가 됨.</li>
</ul>
</li>
</ul>
<h3 data-ke-size="size23">dynamic routing</h3>
<p data-ke-size="size16">URL Params 등으로 id 값 등이 전달되어 path를 만드는 동적인 url 구성을 말함.</p>
<p data-ke-size="size16">리액트에서는 아래와 같이 라우팅을 했었음.</p>
<pre id="code_1719846611208" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>&lt;Route path="/products/:id" element={&lt;Product /&gt;} /&gt;</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">Next.js에서는 폴더명을 대괄호로 감싸면 위와 같은 동적 라우팅이 됨.</p>
<p data-ke-size="size16">예를 들어 위의 예제로는 <b>src/app/products/[id]/page.tsx</b> 로 작성하면 됨.</p>
<h3 data-ke-size="size23">폴더가 라우팅에 포함되지 않게 하는 방법</h3>
<p data-ke-size="size16">app 폴더 내에 폴더를 만들면 자동으로 페이지 라우팅이 된다고 했다.</p>
<p data-ke-size="size16">그런데 라우팅 목적이 아니라 유사한 성격의 폴더 또는 파일끼리 그룹핑하는 용도로만 폴더를 만들고 싶다면, 폴더명을 <b>(폴더명)&nbsp;</b>소괄호로 감싸서 만들면 된다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">예 ) src/app/(admin)/about/page.tsx 로 작성하면 admin은 path에 포함되지 않고, localhost:3000/about/page.tsx가 path가 된다.</p>