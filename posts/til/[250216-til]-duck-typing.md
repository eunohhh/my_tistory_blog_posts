<h3 data-ke-size="size23"><b>자바스크립트의 덕 타이핑(Duck Typing) 개념</b></h3>
<p data-ke-size="size16"><b>덕 타이핑(Duck Typing)</b>은 <b>객체의 실제 타입이 아니라, "어떤 속성과 메서드를 가지고 있는지"에 따라 타입을 결정하는 개념</b>입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">  <b>철학:</b><br /><i>"오리처럼 걷고, 오리처럼 꽥꽥거린다면, 그것은 오리다."</i>  </p>
<p data-ke-size="size16">즉, 객체의 타입을 확인할 때 <b>클래스나 명시적인 타입 정보가 아니라, 객체가 특정 속성이나 메서드를 가지고 있는지</b>를 기준으로 판단합니다.</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>자바와 자바스크립트의 차이</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>자바 (명시적 타입 시스템)</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>객체가 특정 클래스에서 상속받거나 인터페이스를 구현해야 해당 타입으로 간주됨</li>
<li>클래스 이름이 다르면, 같은 속성을 가지고 있어도 다른 타입으로 인식됨</li>
</ul>
</li>
<li><b>자바스크립트 (덕 타이핑 기반의 동적 타입 시스템)</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>특정 클래스에서 파생되지 않아도 <b>속성과 메서드만 맞으면 해당 타입처럼 사용 가능</b></li>
<li>객체의 구조가 타입을 결정함</li>
</ul>
</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>예제 코드 (덕 타이핑 적용 예시)</b></h3>
<pre class="javascript"><code>function quack(duck) {
  if (typeof duck.quack === "function") {
    duck.quack();
  } else {
    console.log("이 객체는 오리가 아닙니다.");
  }
}
<p>const realDuck = {
quack: () =&gt; console.log(&quot;꽥꽥!&quot;),
};</p>
<p>const toyDuck = {
quack: () =&gt; console.log(&quot;장난감 오리 소리!&quot;),
};</p>
<p>const cat = {
meow: () =&gt; console.log(&quot;야옹!&quot;),
};</p>
<p>quack(realDuck); // 출력: 꽥꽥!
quack(toyDuck);  // 출력: 장난감 오리 소리!
quack(cat);      // 출력: 이 객체는 오리가 아닙니다.</code></pre></p>
<p data-ke-size="size16">✅ <code>realDuck</code>과 <code>toyDuck</code>은 <b>클래스가 다르지만</b> <code>quack</code> 메서드를 가지고 있으므로 <code>quack</code> 함수에서 오리처럼 인식됨.<br />❌ <code>cat</code>은 <code>quack</code> 메서드가 없으므로 오리로 인식되지 않음.</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>TypeScript에서의 덕 타이핑 (구조적 타이핑)</b></h3>
<p data-ke-size="size16">TypeScript에서는 <b>"구조적 타이핑(Structural Typing)"</b> 을 기반으로 덕 타이핑을 지원합니다.</p>
<pre class="typescript"><code>interface Duck {
  quack: () =&gt; void;
}
<p>function makeDuckNoise(duck: Duck) {
duck.quack();
}</p>
<p>const toyDuck = { quack: () =&gt; console.log(&quot;장난감 오리 소리!&quot;) };
const cat = { meow: () =&gt; console.log(&quot;야옹!&quot;) };</p>
<p>makeDuckNoise(toyDuck); // 정상 작동
// makeDuckNoise(cat);  // 오류: 'meow' 속성만 있고 'quack'이 없음</code></pre></p>
<p data-ke-size="size16">✅ <code>toyDuck</code>은 <code>Duck</code> 타입이 아니지만, <b>quack 메서드를 가지고 있기 때문에</b> <code>makeDuckNoise</code> 함수에 전달 가능<br />❌ <code>cat</code>은 <code>quack</code> 메서드가 없어서 타입 오류 발생</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>덕 타이핑의 장점과 단점</b></h3>
<p data-ke-size="size16">✅ <b>장점</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>유연한 코드 작성 가능 (클래스 기반 상속 없이도 특정 기능을 수행하는 객체를 사용할 수 있음)</li>
<li>JavaScript의 동적 특성과 잘 맞음 (유형 제한이 적어 코드 확장이 쉬움)</li>
<li>TypeScript에서 <b>인터페이스를 강제하지 않고도 객체의 구조만 맞으면 사용 가능</b></li>
</ul>
<p data-ke-size="size16">❌ <b>단점</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>타입 안정성이 낮아 <b>런타임 오류 발생 가능</b> (타입스크립트를 사용하면 해결 가능)</li>
<li>객체가 특정 속성과 메서드를 가졌다고 해서, 기대하는 동작을 한다는 보장이 없음</li>
<li>코드 가독성이 낮아질 수 있음 (클래스 기반 OOP에 익숙한 개발자들에게 직관적이지 않을 수 있음)</li>
</ul>