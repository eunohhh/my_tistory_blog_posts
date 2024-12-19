<h2 data-ke-size="size26">Q1</h2>
<p data-ke-size="size16">props 로 특정한 정수 값을 받고 그 값이 변경될 때 화면에 숫자가 올라가거나 내려가면서 표시되는 애니메이션을 구현하고 싶어요.</p>
<p data-ke-size="size16">&nbsp;</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">A1</h2>
<p data-ke-size="size16"><code>AnimatedNumberFramerMotion</code> 컴포넌트를 수정해서, <b>props로 전달된 <code>value</code>가 변경될 때 화면에 숫자가 올라가거나 내려가면서 표시</b>되도록 만들 수 있습니다.</p>
<h3 data-ke-size="size23">방법:</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b><code>motionValue</code></b>와 <code>useEffect</code>를 사용하여 <code>value</code>의 변화를 감지.</li>
<li><b><code>useSpring</code></b>으로 부드러운 애니메이션 적용.</li>
<li><code>motion.span</code>에 숫자가 연속적으로 보이도록 <code>useTransform</code> 사용.</li>
</ol>
<p data-ke-size="size16">&nbsp;</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">코드:</h3>
<pre class="javascript"><code>'use client';
<p>import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';</p>
<p>const spring = { damping: 5, stiffness: 50, restDelta: 0.001 };</p>
<p>function AnimatedNumberFramerMotion({ value }: { value: number }) {
const motionValue = useMotionValue(value); // motionValue 초기화
const springNumber = useSpring(motionValue, spring);
const transformingNumber = useTransform(springNumber, (x) =&gt; Math.round(x));</p>
<p>// value가 변경될 때마다 motionValue에 애니메이션으로 적용
useEffect(() =&gt; {
motionValue.set(value);
}, [value, motionValue]);</p>
<p>return (
&lt;motion.span&gt;
{transformingNumber} {/* 실시간으로 변화하는 숫자 표시 */}
&lt;/motion.span&gt;
);
}</p>
<p>function FramerMotionAnimateNumberPage() {
const [num, setNum] = useState(0);</p>
<p>// 3초마다 랜덤 숫자 설정
useEffect(() =&gt; {
const interval = setInterval(() =&gt; {
const newNum = Math.floor(Math.random() * 100); // 0~99 사이의 랜덤 숫자
setNum(newNum);
}, 3000);
return () =&gt; clearInterval(interval);
}, []);</p>
<p>return (
&lt;div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}&gt;
&lt;span&gt;Target Number: {num}&lt;/span&gt;
&lt;AnimatedNumberFramerMotion value={num} /&gt;
&lt;/div&gt;
);
}</p>
<p>export default FramerMotionAnimateNumberPage;</code></pre></p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>주요 사항 설명</b>:</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b><code>motionValue.set(value)</code></b><br /><code>useEffect</code>를 사용해 <code>value</code>가 변경될 때마다 <code>motionValue</code>를 업데이트합니다.</li>
<li><b><code>useSpring</code> 적용</b><br />숫자가 부드럽게 올라가거나 내려가는 애니메이션을 적용했습니다.</li>
<li><b><code>Math.round</code> 사용</b><br /><code>useTransform</code>을 사용해 부동소수점 값을 정수로 변환하여 화면에 표시합니다.</li>
</ol>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">실행 결과:</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>value</code>가 <code>0</code>에서 <code>3</code>으로 변경되면 <b>0 &rarr; 1 &rarr; 2 &rarr; 3</b> 순서로 부드럽게 증가합니다.</li>
<li>반대로 <code>3</code>에서 <code>0</code>으로 변경되면 <b>3 &rarr; 2 &rarr; 1 &rarr; 0</b> 순서로 감소합니다.</li>
</ul>
<p data-ke-size="size16">이제 애니메이션이 자연스럽게 숫자의 변화에 따라 표시됩니다.  </p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">Q2</h2>
<p data-ke-size="size16"><code>const motionValue = useMotionValue(value);</code> 이 부분은 value 를 받아서 초기화되잖아요? 그러면 부모에서 props 가 바뀔때마다 새로 실행될텐데 useEffect 에서 또 motionValue.set 을 해줘야 하는 이유가 궁금해요.</p>
<p data-ke-size="size16">&nbsp;</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">A2</h2>
<p data-ke-size="size16">좋은 질문이에요! <code>const motionValue = useMotionValue(value);</code>는 <code>value</code>를 초기값으로 설정하지만, 부모 컴포넌트에서 <b><code>value</code>가 변경될 때마다</b> <code>motionValue</code>가 새로 설정되지는 않습니다.</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">이유: <code>useMotionValue</code>는 상태를 <b>초기화할 때만 실행</b>됩니다.</h3>
<p data-ke-size="size16"><code>useMotionValue</code>는 React의 <b>상태</b>와 비슷한 방식으로 동작하기 때문에, <b>초기 렌더링 시</b>에만 <code>value</code>를 초기값으로 설정합니다. 이후 부모에서 <code>value</code>가 변경되어도 <code>useMotionValue</code>는 새로 호출되지 않아요.</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><code>useEffect</code>에서 <code>motionValue.set(value)</code>가 필요한 이유:</h3>
<p data-ke-size="size16"><code>motionValue</code>는 React 상태와 달리 <b>직접 업데이트</b>해줘야 하는 객체입니다. <code>value</code>가 변경될 때 <b><code>motionValue</code>에 반영되도록</b> <code>motionValue.set(value)</code>를 호출하는 것입니다.</p>
<pre class="lisp"><code>useEffect(() =&gt; {
  motionValue.set(value);
}, [value, motionValue]);</code></pre>
<p data-ke-size="size16">이 코드의 역할:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>value</code>가 변경되면 <code>motionValue</code>를 새로운 값으로 업데이트합니다.</li>
<li><code>useEffect</code>가 <code>value</code>를 감지하고, 애니메이션이 부드럽게 적용될 수 있도록 합니다.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">요약:</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>useMotionValue</code>는 <b>초기값</b>만 설정하고, 이후 상태 변화는 반영되지 않음.</li>
<li><code>useEffect</code>에서 <code>motionValue.set(value)</code>를 호출해야 부모에서 받은 <code>value</code>가 <code>motionValue</code>에 반영됩니다.</li>
</ul>
<p data-ke-size="size16">이렇게 해야 <code>motionValue</code>가 항상 최신 상태를 유지하면서 애니메이션이 자연스럽게 동작합니다!  </p>