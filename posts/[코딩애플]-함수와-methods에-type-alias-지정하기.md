<h2 data-ke-size="size26">함수의 type alias</h2>
<p data-ke-size="size16">아래 방식은&nbsp; 함수 표현식에서 type alias를 적용하는 예시이다.</p>
<pre id="code_1719304231250" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>const addNumber = (x) =&gt; {
  return x + 2;
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위와 같이 변수에 할당해서 쓰는 듯 보이는 함수 방식을 함수 표현식이라 한다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719304309677" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>type MathOperation = (a: number) =&gt; number;
<p>const addNumber: MathOperation = (a) =&gt; x + 2;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">함수 표현식 작성하는 방법에서 변수 선언 키워드와 함수명만 지우고 type을 붙이면 된다. 그리고 매개 변수와 return 값이 어떤 타입인지 지정해주면 된다.</p>
<h2 data-ke-size="size26">콜백 함수의 type alias</h2>
<p data-ke-size="size16">함수의 매개 변수로 함수가 전달 되는 것을 call back function이라 한다.</p>
<pre id="code_1719304718551" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>const showMessage = () =&gt; {
  alert('안녕하세요');
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">예를 들어 위와 같이 함수를 실행하면 alert 창에 메시지를 띄우는 함수가 있다고 가정하자.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719304823380" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>const delay = (second, callback) =&gt; {
  setTimeout(callback, second * 1000);
}
<p>delay(3, showMessage);</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그리고 setTimeout() 내장 함수로 딜레이를 주는 함수가 있다고 가정하자. 매개 변수에 showMessage()라는 함수가 들어가서 setTimeout() 함수의 매개 변수로 전달되고 있는데, 이 때 showMessages() 함수처럼 다른 함수의 매개 변수로 전달되는 것을 콜백 함수라고 한다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">다소 복잡해보이지만 아래와 같이 하나씩 정리해가면 type alias를 설정할 수 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719305084815" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// 함수 선언식의 경우
<p>type Callback = () =&gt; void;</p>
<p>function delay(second: number, callback: Callback): void {
setTimeout(callback, seconds * 1000);
}</p>
<p>function showMessage() : void {
console.log('안녕하세요.');
}</p>
<p>delay(3, showMessage);</code></pre></p>
<pre id="code_1719305242251" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// 함수 표현식의 경우

type Callback = () =&gt; void;

const delay = (seconds: number, callback: Callback): void =&gt; {
  setTitmeout(callback, seconds * 1000);
}

...</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">콜백 함수의 매개 변수가 없고, return값도 없어서 void 정도로 타입을 지정한 예시이다. 만약 명확하게 매개 변수에 어떤 타입이 들어가고 return값의 자료형이 분명하다면 맨 위 예시처럼 작성하면 된다.</p>