<h2 data-ke-size="size26">상황</h2>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1128" data-origin-height="596"><span data-url="https://blog.kakaocdn.net/dn/cQivt0/btsIiSj1YPy/MMfZE4Pcl36c1RKBBVD67k/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/cQivt0/btsIiSj1YPy/MMfZE4Pcl36c1RKBBVD67k/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcQivt0%2FbtsIiSj1YPy%2FMMfZE4Pcl36c1RKBBVD67k%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1128" data-origin-height="596"/></span></figure>
</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>supabase에 민감한 자료가 있다.</li>
<li>그런데 이것을 API 호출로 받아와서 렌더링 해야 하는데 부담스러운 상황이다.</li>
<li>일단 데이터를 받아오고 프론트엔드에서 코드로 텍스트를 변환하는 방법도 있겠지만, CSR을 하지 않는 이상 네트워크 탭에서 응답값을 전부 볼 수 있기 때문에 SSR에서는 해결책이 아니다.</li>
<li>처음부터 별표처리된 데이터를 받아오는 것이 가장 안전하겠다.</li>
<li>그런데 원본 데이터를 훼손시킬 순 없으니 별표 처리 된 데이터 컬럼을 만들어서 그것을 가져오려고 한다.</li>
</ul>
<h2 data-ke-size="size26">방법</h2>
<pre id="code_1719659627202" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>UPDATE bankstatement
SET securedname = CONCAT(
  LEFT(name, 2),
  REPEAT('*', GREATEST(LENGTH(name) - 2, 0))
);</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>bankstatement : 데이터 베이스 테이블 이름</li>
<li>scuredname : 새롭게 별표 처리해서 복제할 컬럼 이름</li>
<li>LEFT(name, 2) : 원본 데이터가 있는 name 컬럼에서 왼쪽에서 2글자를 가져옴.</li>
<li>LENGTH(name) : name 컬럼의 전체 길이를 가져옴.</li>
<li>GREATEST(LENGTH(name) - 2, 0) : name의 전체 길이에서 두 글자를 뺀 값과 0 중 큰 값을 선택함. 즉 name 컬럼이 2글자 이하일 때도 음수가 되지 않게 하기 위함.</li>
<li>REPEAT('*', GREATEST(LENGTH(name) - 2, 0)) : 나머지 글자 수만큼 별표를 반복함.</li>
<li>CONCAT(LEFT(name, 2), REPEAT('*', GREATEST(LENGTH(name) - 2, 0))) : 첫 두 글자와 별표 문자열을 합쳐 새로운 문자열을 생성함.</li>
</ul>
<p data-ke-size="size16">이 쿼리를 만들어 놓고 필요할 때마다 계속 add를 눌러가면서 사용하면 될 것 같다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="942" data-origin-height="560"><span data-url="https://blog.kakaocdn.net/dn/EKZfQ/btsIhUCVFZb/80gHTPwtCoPxX4mQUTnRO1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/EKZfQ/btsIhUCVFZb/80gHTPwtCoPxX4mQUTnRO1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FEKZfQ%2FbtsIhUCVFZb%2F80gHTPwtCoPxX4mQUTnRO1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="942" data-origin-height="560"/></span></figure>
</p>