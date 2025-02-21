<h3 data-ke-size="size23">  <code>Number.EPSILON</code> 이란?</h3>
<p data-ke-size="size16"><code>Number.EPSILON</code>은 <b>JavaScript에서 부동소수점 연산의 오차를 처리하기 위해 사용되는 상수</b>입니다.<br />이 값은 <b>1과 가장 가까운 부동소수점 숫자 사이의 차이</b>를 나타내며, <b><code>2^(-52)</code> (약 <code>2.220446049250313e-16</code>)</b>의 값을 가집니다.</p>
<pre class="fortran"><code>console.log(Number.EPSILON); // 2.220446049250313e-16</code></pre>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">  왜 필요한가?</h3>
<p data-ke-size="size16">JavaScript에서 숫자는 <b>IEEE 754 부동소수점 방식</b>으로 저장됩니다.<br />이 때문에 <b>정확한 실수 연산이 어려워 미세한 오차가 발생</b>할 수 있습니다.</p>
<h4 data-ke-size="size20">❌ 부동소수점 오차 예시</h4>
<pre class="angelscript"><code>console.log(0.1 + 0.2); // 0.30000000000000004
console.log(0.3 === (0.1 + 0.2)); // false (예상과 다름)</code></pre>
<p data-ke-size="size16">위처럼 <b>0.1 + 0.2가 정확히 0.3이 되지 않는 문제</b>가 발생합니다.</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">  <code>Number.EPSILON</code>을 활용한 오차 보정</h3>
<p data-ke-size="size16">이런 오차를 해결하기 위해 <code>Number.EPSILON</code>을 사용하여 비교할 수 있습니다.</p>
<pre class="javascript"><code>function isEqual(a, b) {
    return Math.abs(a - b) &lt; Number.EPSILON;
}
<p>console.log(isEqual(0.1 + 0.2, 0.3)); // true</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>Math.abs(a - b) &lt; Number.EPSILON</code> &rarr; 두 수의 차이가 매우 작으면 같은 값으로 간주</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">  정리</h3>
<p data-ke-size="size16">✅ <code>Number.EPSILON</code>은 <b>부동소수점 오차를 해결할 때 사용</b><br />✅ <code>0.1 + 0.2 !== 0.3</code> 같은 문제를 해결하기 위한 <b>오차 보정 기준</b><br />✅ 비교 시 <code>Math.abs(a - b) &lt; Number.EPSILON</code> 형태로 활용  </p>