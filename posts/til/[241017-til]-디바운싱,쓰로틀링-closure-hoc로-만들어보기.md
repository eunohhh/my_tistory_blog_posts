<h2>0. Closure + HOC</h2>
<ul>
<li>클로저: 이벤트가 발생할 때마다 이전의 상태를 기억해야 하기 때문에 클로저가 필요. 반환된 함수가 실행될 때마다 클로저를 사용하여 함수 실행여부를 결정할 수 있음</li>
<li>고차 함수: 인자로 실행하려는 함수를 받아, 이 함수를 조건에 따라 실행하는 새로운 함수를 반환</li>
</ul>
<h2>1. Debouncing</h2>
<pre><code class="language-ts">type Debounce = (...args: any[]) =&gt; void;
// 콜백함수와 딜레이를 인자로 받는 HOC
const debounce = (func: (...args: any[]) =&gt; void, delay: number): Debounce =&gt; {
  let timer : NodeJS.Timeout | null = null; // 클로저로 유지될 변수(타이머)
  return (...args : any[]) =&gt; {
    if(timer !== null) clearTimeout(timer); // 이전 타이머가 있으면 취소
    timer = setTimeout(() =&gt; {
      func(...args); // 일정시간 후 실행, this 참조 대비하여 apply
    }, delay);
  };
}
// HOC 에 함수와 딜레이를 넣어서 호출
const handleInput: Debounce = debounce(() =&gt; {
  console.log(&#39;API 호출&#39;);
}, 300);
<p>document.querySelector('input').addEventListener('input', handleInput);</code></pre></p>
<h2>2. Throttling</h2>
<pre><code class="language-ts">type Throttle = (...args: any[]) =&gt; void;
// 콜백함수와 리미트를 인자로 받는 HOC
const throttle = (func: (...args: any[]) =&gt; void, limit: number): Throttle =&gt; {
  let lastTimer: NodeJS.Timeout | null = null; // 클로저로 유지될 변수(타이머)
  let lastRan: number | null = null; // 클로저로 유지될 변수(마지막 실행시점)
  return (...args: any[]) =&gt; {
    if(lastRan !== null){
      func(...args); // 처음 호출될 때 바로 실행
      lastRan = Date.now(); // 마지막 실행 시점을 현재 시간으로 기록
      return;
    } 
    if(lastTimer !== null) clearTimeout(lastTimer); // 이전에 설정된 타이머 취소
    lastTimer = setTimeout(() =&gt; {
      if((Date.now() - lastRan) &gt;= limit) { // 제한 시간 이후에만 실행
        func(...args); // 콜백함수 실행
        lastRan = Date.now(); // 마지막 실행 시점 업데이트
      } 
    }, limit - (Date.now() - lastRan))
    // 위 setTimeout의 2번째 인자 부분은,
    // 마지막으로 함수가 실행된 시점(lastRan)에서 얼마나 시간이 지났는지 계산하여, 
    // 정확히 limit 간격만큼 대기한 후에 함수를 실행시키기 위한 계산임
  };
}
<p>// HOC 에 함수와 리미트를 넣어서 호출
const handleScroll: Throttle = throttle(() =&gt; {
console.log(&quot;스크롤 이벤트 처리&quot;);
}, 1000);</p>
<p>window.addEventListener(&quot;scroll&quot;, handleScroll);</code></pre></p>
