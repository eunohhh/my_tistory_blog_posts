<h2 data-ke-size="size26">interface</h2>
<p data-ke-size="size16">객체의 type을 지정하는 방법이다. type alias 사용법과는 type이냐 interface냐 키워드 차이와 type alias에는 등호가 들어간다는 것 외에 전체적인 구조는 유사하다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">type alias로도 객체 타입이 지정이 가능한데, 이 점에서는 중복되지만 약간의 기능 차이는 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719306204788" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>const user = {
  name: '장원영',
  age: 21,
  isFemale: true,
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위외 같은 속성이 있다고 가정하자. 이것을 interface와 type alias로 타입을 지정하면 아래와 같다. 그리고 사용하는 건 type명(파스칼케이스)를 사용하면 돼서 같다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719306332306" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// interface
<p>interface User {
name: string;
age: number;
isFemale: boolean;
}</p>
<p>// type alias</p>
<p>type User = {
name: string;
age: number;
isFemale: boolean;
}</p>
<p>// 갖다 쓰기</p>
<p>const user: User = {
name: '장원영',
age: 21,
isFemale: true,
}</code></pre></p>
<h2 data-ke-size="size26">extends</h2>
<p data-ke-size="size16">이미 만들어진 interface끼리 병합하는 방법이다.</p>
<pre id="code_1719306667039" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>interface Student {
  name: string,
}
<p>interface Teacher {
name: string,
age: number
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위 interface를 보니, name: string이 겹치고 다른 건 Teacher interface에 age: number가 추가된 것만 다르다. 이럴 땐 Teacher interface를 정의할 때 Student interface를 extends로 재사용하면 된다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719306758744" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>interface Student {
  name: string,
}
<p>interface Teacher extends Student {
age: number,
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그런데 type alias에서는 병합이 안 되는 게 아니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719306829139" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>type Student = {
  name: string,
}
<p>type Teacher = Student &amp; {
age: number,
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위 처럼 &amp; 기호로 병합이 가능하다. interface도 위 기호로 병합이 가능하다.</p>
<p data-ke-size="size16">상당히 기능이 많이 유사하다.</p>
<h2 data-ke-size="size26">두 방식의 결정적인 차이</h2>
<p data-ke-size="size16">그러면 언제 type alias를 사용하고 언제 interface를 사용해야 하는지 헷갈릴 수 있다.</p>
<p data-ke-size="size16">사실 이 부분은 개발자 사이에서도 뜨거운 논쟁이 수년 째 이어져 오고 있는데 명확한 차이점은 존재하니 그 점을 알고 상황에 맞게 사용하면 된다.</p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">type명을 중복 선언할 때의 차이</h3>
<pre id="code_1719307169980" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// type alias
<p>type Student = {
name: string,
}</p>
<p>type Student = {
age: number,
} // 에러</p>
<p>// interface</p>
<p>interface Student {
name: string,
}</p>
<p>interface Student {
age: number,
} // 에러 안 남.</p>
<p>// 위는 extends로 병합해서 하나의 Student 타입을 만든 것처럼 자동으로 병합된다.</p>
<p>interface Student {
name: string,
age: number,
}</p>
<p>// 이거 만든 거랑 똑같이 여겨짐.</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">type alias가 조금 더 타입의 이름에 대해서는 엄격하다.</p>
<p data-ke-size="size16">이런 게 더 안정적으로 느껴질 수 있지만, 오히려 타입스크립트를 이용한 라이브러리는 interface 위주로 사용하고 있다는 것을 알 수 있는데 이유는 타입명의 중복선언이 가능하다보니 조금 더 유연하기 때문인데,</p>
<p data-ke-size="size16">남이 만들어 놓은 것을 다른 개발자들이 재사용한다거나 가공해야 할 때는 interface가 조금 더 유연하기 때문에 편리하다.</p>
<h3 data-ke-size="size23">프로퍼티가 중복될 때의 차이</h3>
<p data-ke-size="size16">타입명 말고, 객체 안의 프로퍼티가 중복되면서 타입이 다른 경우에는 반대로 interface가 에러를 낸다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719307408490" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>interface Student {
  name: string;
}
<p>interface Teacher extends Student {
name: number;
} // 에러</code></pre></p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2888" data-origin-height="628"><span data-url="https://blog.kakaocdn.net/dn/uqoaP/btsH93OQ9wH/7pw0njYDJ8fn0UQyg9qaY1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/uqoaP/btsH93OQ9wH/7pw0njYDJ8fn0UQyg9qaY1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FuqoaP%2FbtsH93OQ9wH%2F7pw0njYDJ8fn0UQyg9qaY1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="2888" data-origin-height="628"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">물론 name: string으로 둘 다 프로퍼티와 타입이 동일하면 하나로 병합해준다.</p>