<h2 data-ke-size="size26">Next.js에서 사용되는 라우팅 필수 용어</h2>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1600" data-origin-height="832"><span data-url="https://blog.kakaocdn.net/dn/t69Pb/btsIoYYQsn2/ZQixlH0YZJvL1yF8Jh3hUk/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/t69Pb/btsIoYYQsn2/ZQixlH0YZJvL1yF8Jh3hUk/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Ft69Pb%2FbtsIoYYQsn2%2FZQixlH0YZJvL1yF8Jh3hUk%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1600" data-origin-height="832"/></span></figure>
</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Tree
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>계층 구조를 시각화하기 위한 규칙.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>부모-자식 컴포넌트가 있는 컴포넌트 트리나 폴더 트리와 같이 사용된다.</li>
<li>나무가 뿌리를 내리는 모습과 비슷하게 생겨서 Tree 구조라고 함.</li>
</ul>
</li>
</ul>
</li>
<li>Subtree
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>app 폴더를 제외하고 그 다음 디렉토리 부터... 트리의 일부분.</li>
<li>root(첫 번째 시작점)에서 leaf(끝 지점), 즉 뿌리에서 잎까지 포함하는 개념임.</li>
<li>이 Subtree 들이 모여서 하나의 Tree를 만듦.</li>
</ul>
</li>
<li>Root
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Subtree의 시작점.</li>
<li>app 폴더 바로 다음 계층을 말함. 즉 첫번째 노드를 말함.</li>
<li>그러나 개발자들이 특정 Subtree를 지목하지 않고 '루트 폴더'라고 말하면 프로젝트 폴더의 가장 바깥을 의미함.</li>
</ul>
</li>
<li>Leaf
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>URL path의 가장 마지막 노드임.</li>
<li>더 이상 children이 없는 경로의 끝.</li>
</ul>
</li>
</ul>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1600" data-origin-height="371"><span data-url="https://blog.kakaocdn.net/dn/ZqiSm/btsIoYExKH3/CRbYZBz1S2X1GQ2hj3SSHK/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/ZqiSm/btsIoYExKH3/CRbYZBz1S2X1GQ2hj3SSHK/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FZqiSm%2FbtsIoYExKH3%2FCRbYZBz1S2X1GQ2hj3SSHK%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1600" data-origin-height="371"/></span></figure>
</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>URL Segment
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>URL path 중 슬래시로 구분되는 것들 중 하나의 경로를 차지하는 곳을 의미.</li>
<li>즉 폴더 구조에서 app 폴더 내부의 폴더 하나, 하나를 세그먼트라고 함.</li>
</ul>
</li>
<li>URL Path
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>URL에서 도메인을 제외한 뒷 부분을 말함.</li>
<li>즉 세그먼트들의 합을 의미함.</li>
<li>우리 말로 하면 URL 경로.</li>
</ul>
</li>
<li>Domain
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>일반적인 그 도메인 맞음.</li>
<li>http://localhost:3000/segment
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>위 URL에서 http는 프로토콜, /localhost:3000 이 도메인임.</li>
</ul>
</li>
</ul>
</li>
</ul>