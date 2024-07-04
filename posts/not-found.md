<h2 data-ke-size="size26">404 Not-fount란?</h2>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1642" data-origin-height="918"><span data-url="https://blog.kakaocdn.net/dn/c7FTV5/btsIibMzyu5/dzquweO8e9twegDKlgdWRk/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/c7FTV5/btsIibMzyu5/dzquweO8e9twegDKlgdWRk/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fc7FTV5%2FbtsIibMzyu5%2FdzquweO8e9twegDKlgdWRk%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1642" data-origin-height="918"/></span></figure>
</p>
<p data-ke-size="size16">위 이미지는 Next.js를 셋업하면 기본적으로 나오는 404 페이지이다.</p>
<p data-ke-size="size16">404 에러는 없는 url path로 접근을 시도할 때 띄워주는 에러이다.</p>
<p data-ke-size="size16">즉, 클라이언트가 요청한 페이지를 찾을 수 없을 때 발생하는 에러다.</p>
<h3 data-ke-size="size23">참고) HTTP 상태 코드</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>1xx: 정보 응답
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>100 Countinue : 클라이언트가 요청을 계속 할 수 있음.</li>
<li>101 Switching Protocols : 서버가 클라이언트의 프로토콜 전환 요청을 승인함.</li>
</ul>
</li>
<li>2xx : 성공 응답
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>200 OK : 요청이 성공적으로 수행됨.</li>
<li>201 Created : 요청이 성공적으로 수행되었고, 새로운 리소스가 생성됨.</li>
<li>202 Accepted : 요청이 접수되었으나 아직 처리되지 않음.</li>
<li>204 No Content : 요청이 성공적으로 수행되었으나 반환할 내용은 없음.</li>
</ul>
</li>
<li>3xx : 리다이렉션
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>300 Multiple Choices : 요청한 리소스에 대한 여러 가지 선택 사항이 있음.</li>
<li>301 Moved Permanently : 요청한 리소스가 영구적으로 새로운 위치로 이동되었음.</li>
<li>302 Found : 요청한 리소스가 일시적으로 다른 위치에서 제공됨.</li>
<li>304 Not Modified : 클라이언트가 캐시된 리소스를 사용할 수 있음.</li>
</ul>
</li>
<li>4xx : 클라이언트 오류
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>400 Bad Request : 클라이언트의 잘못된 요청을 서버가 인식하지 못함.</li>
<li>401 Unauthorized : 클라이언트가 서버의 응답을 확인하려면 인증이 필요함.</li>
<li>403 Forbidden : 클라이언트의 요청을 서버가 이해했지만, 서버가 승인을 거부함.</li>
<li>404 Not Found : 클라이언트가 요청한 리소스를 서버가 찾을 수 없음.</li>
<li>405 Method Not Allowed : 클라이언트가 서버에 요청한 메서드가 허용되지 않음.</li>
<li>408 Request Timeout : 서버가 클라이언트의 요청을 기다리다가 시간이 초과됨.</li>
</ul>
</li>
<li>5xx : 서버 오류
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>500 Internal Server Error : 서버에서 일반적인 오류가 발생함.</li>
<li>501 Not Implemented : 클라이언트의 요청을 서버가 수행할 수 있는 기능을 갖추고 있지 않음.</li>
<li>502 Bad Gateway : 서버가 게이트웨이나 프록시로 작동하면서 받은 잘못된 응답을 나타냄.</li>
<li>503 Service Unavailable : 서버가 일시적으로 과부하가 걸렸거나 유지보수 중임.</li>
<li>504 Gateway Timeout : 게이트웨이 또는 프록시 서버가 상위 서버로부터 응답을 받는 데 시간이 초과됨.</li>
</ul>
</li>
</ul>
<h2 data-ke-size="size26">리액트에서의 Not-found</h2>
<p data-ke-size="size16">리액트에서는 아래와 같이 Not-found 페이지를 만들었음.</p>
<p data-ke-size="size16">위 라우트 외 모든 접속 경로에 대해서는 이 엘리먼트를 렌더링 하라는 의미임.</p>
<pre id="code_1719852108016" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>&lt;Router&gt;
  &lt;Routes&gt;
    &lt;Route path={"/home"} element={&lt;Home /&gt;} /&gt;
    &lt;Route path={"/*"} element={&lt;h1&gt;404: Not Found&lt;/h1&gt;} /&gt;
  &lt;/Routes&gt;
&lt;/Router&gt;</code></pre>
<h2 data-ke-size="size26">Next.js에서의 Not-found</h2>
<p data-ke-size="size16">넥스트에서는 아래 경로에서 not-found 페이지를 작성할 수 있음. 파일명과 함수형 컴포넌트 이름만 제대로 설정하면, 프레임워크가 자동으로 페이지를 읽음.</p>
<pre id="code_1719852214355" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// src&gt;app&gt;not-found.tsx
import React from "react";
<p>const NotFound = () =&gt; {
return &lt;div&gt;존재하지 않는 페이지입니다.&lt;/div&gt;;
};</p>
<p>export default NotFound;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>