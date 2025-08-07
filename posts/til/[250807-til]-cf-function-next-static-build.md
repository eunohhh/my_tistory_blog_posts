<h2 data-ke-size="size26">Next.js static build + s3 조합에서 라우팅이 안된다?</h2>
<p data-ke-size="size16">그렇습니다. 아래처럼 next.config 설정하고</p>
<pre class="yaml"><code>const nextConfig: NextConfig = {
    output: "export", // 정적 파일만
    trailingSlash: true,
    images: { unoptimized: true },
};</code></pre>
<p data-ke-size="size16">빌드하여 s3 에 올리고 CF 붙이면<br />메인 index.html 은 잘 나오는데 라우팅이 안됩니다.<br />클로드쌤과 함께 해결했습니다.</p>
<h2 data-ke-size="size26">CloudFront Functions</h2>
<p data-ke-size="size16">Lambda@Edge보다 비용이 저렴한 CloudFront Functions를 사용해 보았습니다.</p>
<pre class="actionscript"><code>function handler(event) {
    var request = event.request;
    var uri = request.uri;
<pre><code>// 파일 확장자가 없으면 index.html 추가
if (!uri.includes('.')) {
    request.uri = uri.endsWith('/') 
        ? uri + 'index.html' 
        : uri + '/index.html';
}

return request;
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">요런 간단한 핸들러 함수를</p>
<h3 data-ke-size="size23">1. 함수 생성</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>CloudFront 콘솔</b> &rarr; 왼쪽 메뉴에서 <b>Functions</b> 클릭</li>
<li><b>Create function</b> 버튼 클릭</li>
<li>함수 이름 입력 (예: <code>redirect-to-index</code>)</li>
<li><b>Create function</b> 클릭</li>
</ol>
<h3 data-ke-size="size23">2. 코드 작성</h3>
<p data-ke-size="size16">생성된 함수 페이지에서:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Build</b> 탭 선택</li>
<li>위 코드 붙여넣기</li>
<li><b>Save changes</b> 클릭<br /><br /></li>
</ol>
<h3 data-ke-size="size23">3. 테스트 (선택사항)</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Test</b> 탭 클릭</li>
<li>Event type: <code>Viewer Request</code> 선택</li>
<li>URL path에 <code>/about</code> 입력</li>
<li><b>Test function</b> 클릭</li>
<li>결과에서 <code>/about/index.html</code>로 변환되는지 확인<br /><br /></li>
</ol>
<h3 data-ke-size="size23">4. 배포 (Publish)</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>테스트 완료 후 <b>Publish</b> 탭 클릭</li>
<li><b>Publish function</b> 버튼 클릭<br /><br /></li>
</ol>
<h3 data-ke-size="size23">5. CloudFront 배포에 연결</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Associate</b> 탭 클릭 또는 CloudFront 배포 설정으로 이동</li>
<li>CloudFront 배포 &rarr; <b>Behaviors</b> &rarr; <b>Default (*)</b> 선택 &rarr; <b>Edit</b></li>
<li><b>Function associations</b> 섹션에서:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Event type: <b>Viewer Request</b></li>
<li>Function type: <b>CloudFront Functions</b></li>
<li>Function ARN/Name: 방금 만든 함수 선택</li>
</ul>
</li>
<li><b>Save changes<br /><br /></b></li>
</ol>
<h3 data-ke-size="size23">6. 배포 대기</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>CloudFront 배포가 업데이트되는데 5-10분 정도 걸려요</li>
<li>Status가 <b>Deployed</b>가 되면 완료!</li>
</ul>
<p data-ke-size="size16">끝~!</p>