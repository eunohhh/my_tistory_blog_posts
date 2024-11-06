<h2 data-ke-size="size26">Math.sin, cos, tan</h2>
<p data-ke-size="size16">이전에 작성했던 Three.js 코드 중에 이해가 안되고 넘어간 부분이 있어 정리합니다.<br />문제의 코드는 다음과 같습니다.</p>
<pre class="kotlin"><code>// 오브젝트02 서서히 올라갔다 내려갔다
octaAnimation() {
  if (this.objGroup &amp;&amp; this.objGroup.getObjectByName('object02')) {
    const to = this.objGroup.getObjectByName('object02');
    if (to) {
      to.rotation.y += 0.001;
      to.position.y = -9 + Math.sin(Date.now() / 1000) * 1; 
    }
  }
}</code></pre>
<p data-ke-size="size16">그냥 매우 간단한 수학(Math.sin)을 이용한 것이지만<br />바로 이해가 되지 않았습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그래서 라디안과 원주율 부터 하나씩 정리해봅니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">라디안 (Radian) 과 Math.PI (원주율)</h2>
<p data-ke-size="size16">우리가 흔히 사용하는 각의 단위는 도수(30도, 60, 90도) 입니다.<br />하지만 자바스크립트 Math 에서는 라디안을 사용합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">라디안은 반지름과 호의 길이가 같을 때의 중심각의 크기 입니다.</p>
<p data-ke-size="size16">도수를 라디안으로 변환하거나, 반대로 변환하는 경우에 원주율이 필요합니다.</p>
<p data-ke-size="size16"><br />수학에서 원주율은 &pi;(파이)로 표시 합니다.<br />자바스크립트에서는 <b>Math.PI</b>를 사용합니다.</p>
<pre class="javascript" data-ke-language="javascript"><code>// 원주율
const pi = Math.PI;
console.log(pi) // 3.141592653589793</code></pre>
<pre class="arcade"><code>// 도 정보만 알고 있는 경우
var degree = 30;
var radian = (degree * Math.PI) / 180;</code></pre>
<pre class="arcade"><code>// 역으로 반환하고 싶은 경우
var radian = 0.5235987755982988;
var degree = (radian * 180) / Math.PI;</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>변환 공식 없이도 라디안 값을 알 수도 있습니다.</li>
<li><b>Math.PI</b> : 180&ordm;의 라디안 값</li>
<li><b>Math.PI / 2</b> : 90&ordm; 의 라디안 값</li>
<li><b>Math.PI / 3</b> : 60&ordm; 의 라디안 값</li>
<li><b>Math.PI / 4</b> : 45&ordm; 의 라디안 값</li>
<li><b>Math.PI / 6</b> : 30&ordm; 의 라디안 값</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">기본 삼각함수의 정의</h2>
<p data-ke-size="size16">삼각함수의 값들은 보통 단위원(circle)을 기준으로 설명됩니다.<br />단위원은 반지름이 1인 원으로, 이 원을 기준으로 삼각함수를 정의할 수 있습니다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>단위원에서의 각도</b>: 단위원의 중심에서 원의 둘레로 선을 그린 후, 이 선이 x축과 이루는 각도를 기준으로 삼각함수를 계산합니다.</li>
<li><b>사인(Sine)</b>: 주어진 각도에서 <b>y축 방향</b>의 값.</li>
<li><b>코사인(Cosine)</b>: 주어진 각도에서 <b>x축 방향</b>의 값.</li>
<li><b>탄젠트(Tangent)</b>: 사인 값을 코사인 값으로 나눈 값, 즉 ( \tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)} )로 정의됩니다.</li>
</ul>
<p data-ke-size="size16">삼각함수는 <b>삼각형의 각도와 변의 길이 간의 관계</b>를 나타내며, 특히 회전이나 주기적인 동작을 표현할 때 유용하게 사용됩니다. <code>Math.sin()</code>, <code>Math.cos()</code>, <code>Math.tan()</code>은 JavaScript에서 삼각함수를 계산하는 메서드로, 주로 <b>각도에 따른 x와 y 좌표 변화를 표현하거나 애니메이션에서 주기적인 동작을 구현</b>할 때 많이 쓰입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26"><code>Math.sin()</code>, <code>Math.cos()</code>, <code>Math.tan()</code>의 특징과 활용</h2>
<h3 data-ke-size="size23"><code>Math.sin(라디안)</code></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>의미</b>: 사인 함수는 y축 방향의 높이 값을 나타내며, 특정 각도에서 위아래로 이동하는 값을 표현합니다.</li>
<li><b>범위</b>: -1에서 1 사이를 반복합니다.</li>
<li><b>주기</b>: <code>2&pi;</code>(360도)를 기준으로 한 번의 주기가 반복됩니다.</li>
<li><b>활용 예</b>: 오브젝트를 위아래로 반복적으로 움직일 때, 사인 함수를 사용하여 자연스러운 애니메이션을 만들 수 있습니다.</li>
</ul>
<p data-ke-size="size16"><b>예시</b>:</p>
<pre class="javascript" data-ke-language="javascript"><code>const y = Math.sin(Date.now() / 1000);</code></pre>
<h3 data-ke-size="size23"><code>Math.cos(라디안)</code></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>의미</b>: 코사인 함수는 x축 방향의 위치를 나타내며, 특정 각도에서 좌우 이동을 표현하는 데 사용됩니다.</li>
<li><b>범위</b>: -1에서 1 사이를 반복합니다.</li>
<li><b>주기</b>: 사인 함수와 동일하게 <code>2&pi;</code>(360도)를 기준으로 반복됩니다.</li>
<li><b>활용 예</b>: 원형으로 오브젝트를 회전시키거나, 좌우로 자연스럽게 이동하는 애니메이션에 유용합니다.</li>
</ul>
<p data-ke-size="size16"><b>예시</b>:</p>
<pre class="javascript" data-ke-language="javascript"><code>const x = Math.cos(Date.now() / 1000);</code></pre>
<h3 data-ke-size="size23"><code>Math.tan(라디안)</code></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>의미</b>: 탄젠트 함수는 각도에 따른 기울기를 나타내며, 특정 각도에서 가파르게 상승하거나 하강하는 효과를 표현할 때 쓰입니다.</li>
<li><b>범위</b>: 무한대로 증가하거나 감소할 수 있습니다. 따라서 <code>&pi;/2</code>(90도)나 <code>3&pi;/2</code>(270도)에서 값이 발산합니다.</li>
<li><b>활용 예</b>: 기울기나 각도 기반의 계산이 필요한 경우에 유용하지만, 값이 급격하게 변할 수 있으므로 그래픽 애니메이션에는 잘 사용되지 않습니다.</li>
</ul>
<p data-ke-size="size16"><b>예시</b>:</p>
<pre class="cpp"><code>const slope = Math.tan(angle); // 기울기 계산</code></pre>
<h2 data-ke-size="size26">사인과 코사인 함수의 관계</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>위상 차이</b>: 사인과 코사인은 동일한 주기를 갖지만, <b>90도(&pi;/2)의 위상 차이</b>가 있습니다.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>예를 들어, <code>sin(0)</code>은 0이지만 <code>cos(0)</code>은 1입니다.</li>
</ul>
</li>
<li>원형 회전: 사인과 코사인을 함께 사용하면 원형 궤도로 오브젝트를 이동시킬 수 있습니다.</li>
<li>예를 들어, <code>x = Math.cos(t)</code>, <code>y = Math.sin(t)</code> 형태로 사용하면, <code>t</code>가 증가함에 따라 (x, y) 좌표가 원형을 그리며 움직입니다.</li>
</ul>
<pre class="javascript" data-ke-language="javascript"><code>const radius = 5;
const x = radius * Math.cos(Date.now() / 1000);
const y = radius * Math.sin(Date.now() / 1000);</code></pre>
<h2 data-ke-size="size26">시각적 예시: 위아래와 좌우 움직임</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>위아래로 이동</b>: <code>Math.sin()</code>을 사용하여 오브젝트가 주기적으로 위아래로 움직이게 할 수 있습니다.</li>
<li><b>좌우로 이동</b>: <code>Math.cos()</code>을 사용하여 좌우로 이동하게 할 수 있습니다.</li>
<li><b>원형 궤도 이동</b>: <code>Math.sin()</code>과 <code>Math.cos()</code>을 함께 사용하면 오브젝트가 원형을 그리며 이동하게 됩니다.</li>
</ul>
<h2 data-ke-size="size26">각 메서드 사용법 요약</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>Math.sin()</code>과 <code>Math.cos()</code>는 주기적인 이동을 쉽게 구현할 수 있는 함수이며, <code>Math.tan()</code>은 기울기나 급격한 값 변화가 필요한 경우에 사용됩니다.</li>
<li>이 삼각함수들은 각도와 시간을 입력받아 반복적인 움직임을 만드는 데 적합하며, 애니메이션이나 주기적인 동작을 구현할 때 매우 유용합니다.</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">참고) 특정 값을 알고 싶을 때 예시</h2>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-filename="20231030141511_000.webp" data-origin-width="1300" data-origin-height="1300"><span data-url="https://blog.kakaocdn.net/dn/s0HA6/btsKygdwiHM/uMrS4Z1VYC3SN8TtJ2qkpk/img.webp" data-phocus="https://blog.kakaocdn.net/dn/s0HA6/btsKygdwiHM/uMrS4Z1VYC3SN8TtJ2qkpk/img.webp"><img src="https://blog.kakaocdn.net/dn/s0HA6/btsKygdwiHM/uMrS4Z1VYC3SN8TtJ2qkpk/img.webp" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fs0HA6%2FbtsKygdwiHM%2FuMrS4Z1VYC3SN8TtJ2qkpk%2Fimg.webp" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" width="400" height="400" data-filename="20231030141511_000.webp" data-origin-width="1300" data-origin-height="1300"/></span></figure>
</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>각도 A와 밑변의 길이 a를 알고 있는 경우<br />높이 b와 빗변 c를 구하는 식은 다음과 같습니다.</li>
</ol>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>빗변 c를 구하는 공식 : a / Math.cos((A / 180) * Math.PI)</li>
<li>높이 b를 구하는 공식 : a * Math.tan((A / 180) * Math.PI)</li>
</ul>
<ol style="list-style-type: decimal;" start="2" data-ke-list-type="decimal">
<li>각도 A와 높이 b를 알고 있는 경우<br />밑변 a 와 빗변 c의 길이를 구하는 식은 다음과 같습니다.</li>
</ol>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>밑변 a를 구하는 공식 : b / Math.tan((A / 180) * Math.PI)</li>
<li>빗변 c를 구하는 공식 : b / Math.sin((A / 180) * Math.PI)</li>
</ul>
<ol style="list-style-type: decimal;" start="3" data-ke-list-type="decimal">
<li>각도 A와 빗변 c를 알고 있는 경우<br />밑변 a 와 높이 b의 길이를 구하는 식은 다음과 같습니다.</li>
</ol>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>밑변 a를 구하는 공식 : c * Math.cos((A / 180) * Math.PI)</li>
<li>높이 b를 구하는 공식 : c * Math.sin((A / 180) * Math.PI)</li>
</ul>
<ol style="list-style-type: decimal;" start="4" data-ke-list-type="decimal">
<li>빗변 c와 높이 b를 알고 있는 경우 밑변 a를 구하려면<br />각도 A를 먼저 알아낸 이후 2, 3번의 공식을 사용하면 됩니다.</li>
</ol>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>각도 A를 구하는 공식 : (Math.asin(b / c) * 180) / Math.PI</li>
</ul>
<ol style="list-style-type: decimal;" start="5" data-ke-list-type="decimal">
<li>빗변 c와 밑변 a를 알고 있는 경우 높이 b를 구하려면<br />각도 A를 먼저 알아낸 이후 1, 3번의 공식을 사용하면 됩니다.</li>
</ol>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>각도 A를 구하는 공식 : (Math.acos(a / c) * 180) / Math.PI</li>
</ul>
<ol style="list-style-type: decimal;" start="6" data-ke-list-type="decimal">
<li>밑변 a와 높이 b를 알고 있는 경우 빗변 c를 구하려면<br />각도 A를 먼저 알아낸 이후 1, 2번의 공식을 사용하면 됩니다.</li>
</ol>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>각도 A를 구하는 공식 : (Math.atan(b / a) * 180) / Math.PI</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<h2 style="color: #000000; text-align: start;" data-ke-size="size26">결론</h2>
<p data-ke-size="size16">Math.sin(Date.now() / 1000) * 1 부분을 하나씩 살펴보면:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Date.now() / 1000:</b><br />&nbsp;&nbsp;&nbsp;- Date.now()는 밀리초(ms) 단위의 현재 시간을 반환하며, 1000으로 나누어 초 단위로 바꿉니다.<br />&nbsp;&nbsp;&nbsp;- requestAnimationFrame에 의해 이 함수가 매 프레임 호출되므로, 시간이 흐를수록 Date.now() / 1000의 값은 점차 증가하게 됩니다.</li>
<li><b>&nbsp;Math.sin(Date.now() / 1000):</b><br />&nbsp;&nbsp;&nbsp;-&nbsp;사인&nbsp;함수는&nbsp;주기적이기&nbsp;때문에,&nbsp;이&nbsp;값은&nbsp;`-1`에서&nbsp;`1`&nbsp;사이를&nbsp;계속&nbsp;반복하며&nbsp;변화합니다.<br />&nbsp;&nbsp;&nbsp;- 시간이 지남에 따라 사인 값이 `0 &rarr; 1 &rarr; 0 &rarr; -1 &rarr; 0`의 순서로 변하는 것을 매 프레임마다 계산합니다.</li>
<li><b>* 1:</b><br />&nbsp;&nbsp;&nbsp;-&nbsp; 1은 사인 함수의 출력을 그대로 유지해 -1과 1 사이에서 변동하게 만듭니다.<br />&nbsp;&nbsp;&nbsp;- 만약 * 2를 했다면 -2와 2 사이를 오가게 되었을 것입니다.</li>
</ol>
<p data-ke-size="size16">결과적으로, Math.sin(Date.now() / 1000) * 1은 시간이 지남에 따라 -1과 1 사이의 값을</p>
<p data-ke-size="size16">반복적으로 반환하게 되고, 이를 to.position.y = -9 + ...에 더해 주기적으로 위아래로 움직이게 합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><a href="https://ui.toast.com/weekly-pick/ko_20160325">참고링크-Math</a><br /><a href="https://chowonpapa.tistory.com/entry/%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Math-%EC%82%BC%EA%B0%81%ED%95%A8%EC%88%98-1">참고링크-사용례</a><br /><a href="https://m.blog.naver.com/scyan2011/221604956473">참고링크-삼각함수</a><br /><a href="https://dico.me/article/java-script/402/ko">참고링크-경우별예시</a></p>