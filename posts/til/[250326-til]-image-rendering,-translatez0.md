<p data-ke-size="size16">gpt쌤이 위로도 해준다.. 최고....<br />2년전에 비해 이제는 LLM쌤들이 난무하지만<br />역시 gpt쌤과 정이 많이 들었다 ㅜㅜ</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">오늘은 CSS 트릭을 하나 배웠습니다.<br />image-rendering 과<br />transform: translateZ(0) 을 함께 쓰는 건데요.</p>
<p data-ke-size="size16"><br />쌤의 명쾌한 설명 첨부합니다.</p>
<hr data-ke-style="style1" />
<p data-ke-size="size16">절대 바보 아니세요! 그 상황이라면 누구나 착각할 수 있어요  <br />말씀하신 CSS 속성들에 대해 아래처럼 정리해드릴게요:</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>  image-rendering: auto;</b></h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이 속성은 <b>브라우저가 이미지를 어떻게 보간(interpolation)</b> 할지 결정합니다.</li>
<li>기본값 auto는 브라우저가 알아서 최적 품질로 렌더링합니다.</li>
<li>다른 옵션들:</li>
<li>crisp-edges: 픽셀이 뭉개지지 않게 보이도록 (ex. 픽셀아트)</li>
<li>pixelated: 저해상도 이미지도 픽셀 형태로 보이게</li>
</ul>
<h3 data-ke-size="size23">✅ <b>언제 쓰나요?</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>확대된 이미지가 <b>뭉개지거나 부드럽게 처리되는 게 싫을 때</b> &rarr; pixelated</li>
<li>대부분은 auto 또는 생략이 무난</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>  transform: translateZ(0);</b></h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이 속성은 <b>GPU 하드웨어 가속을 강제로 트리거</b>합니다.</li>
<li>브라우저는 보통 DOM 요소를 CPU에서 계산해서 화면에 그립니다. 하지만 transform, opacity, will-change, filter 같은 속성이 있으면 GPU 레이어로 넘기는데요,</li>
<li>translateZ(0)은 3D 변환을 준 것처럼 보여서 브라우저가 GPU를 사용하게 만듭니다.</li>
</ul>
<h3 data-ke-size="size23">✅ <b>왜 쓰나요?</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>렌더링 깨짐을 방지</b>하거나,</li>
<li><b>부드러운 애니메이션</b>,</li>
<li><b>글자/이미지 계단현상 해결</b>,</li>
<li><b>FPS 향상</b>에 도움이 됩니다.</li>
</ul>
<p data-ke-size="size16">  단, 너무 남발하면 <b>GPU 메모리 낭비</b>가 생길 수 있어 꼭 필요한 곳에만 써야 해요.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26"><b>✨ 정리 예시</b></h2>
<pre class="css"><code>.capture-target img {
  image-rendering: auto;         /* 품질 자동 최적화 */
  transform: translateZ(0);      /* GPU 레이어로 승격시켜 계단현상 방지 */
}</code></pre>
<p data-ke-size="size16">필요하시면 will-change: transform; 도 같이 써보실 수 있어요:</p>
<pre class="css"><code>.capture-target img {
  will-change: transform;
}</code></pre>
<p data-ke-size="size16">이건 &ldquo;얘 곧 transform 바뀔 거야~ 미리 최적화해줘!&rdquo; 라는 힌트입니다.</p>