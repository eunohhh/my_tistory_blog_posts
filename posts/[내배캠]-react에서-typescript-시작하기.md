<h2 data-ke-size="size26">타입스크립트의 기초</h2>
<h3 data-ke-size="size23">타입스크립트란?</h3>
<p data-ke-size="size16">타입스크립트란 자바스크립트에 타입 시스템을 추가한 것.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">타입 시스템이란, 프로그램이 실행되기 전(컴파일 타임)에 모든 변수와 표현식의 타입을 확인하고 고정하는 방식이다.</p>
<p data-ke-size="size16">자바스크립트의 유연성을 막아주고 엄격하게 검사하기 때문에 프로그램의 에러를 상당 부분 예방해줄 수 있다는 장점이 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719281888648" class="bash" data-ke-language="bash" data-ke-type="codeblock"><code>type Wonyoung = '장원영';
<p>const userName: Wonyoung = '안유진'; // 에러</code></pre></p>
<h3 data-ke-size="size23">타입스크립트를 사용하는 이유</h3>
<p data-ke-size="size16"><b>1. 에러를 코드 작성 시에 미리 발견할 수 있다.</b></p>
<p data-ke-size="size16">자바스크립트의 경우 타입이 잘못 되더라도 일단 코드는 실행되기 때문에 프로젝트가 커지면 커질 수록 디버깅이 불가능에 가까워질 수 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>2. 더 빠른 실행 가능</b></p>
<p data-ke-size="size16">자바스크립트에서 변수나 표현식의 타입은 코드가 실행되는 시점에 정해진다. 그런데 타입스크립트는 미리 정하고 시작하기 때문에 컴파일러에 따라 다르지만 정적 언어의 특성인, 실행 속도가 빠르다는 장점이 있을 수도 있다.</p>
<h3 data-ke-size="size23">타입스크립트는 다른 언어인가?</h3>
<p data-ke-size="size16">타입스크립트는 100% 자바스크립트 언어이다. 다만 코드 에디터에서 변수나 표현식에 type만 지정해주는 것이다.</p>
<p data-ke-size="size16">웹 브라우저는 타입스크립트를 해석하지 못한다. 자바스크립트만 해석할 수 있다. 따라서 타입스크립트는 파일을 웹 브라우저로 보낼 때 자바스크립트로 변환해서 보낸다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">즉 타입스크립트에서 타입을 빼더라도 에러가 나는 것은 아니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">하지만 타입을 지정하는 것만으로도 엄청난 장점이 있기 때문에 사용한다.</p>
<h2 data-ke-size="size26">타입스크립트 리액트 프로젝트 셋업</h2>
<pre id="code_1719282488827" class="bash" data-ke-language="bash" data-ke-type="codeblock"><code>yarn create vite@latest</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">패키지 설치 후 TypeScript 또는 TypeScript + SWC(개선된 언어)를 선택하면 타입스크립트용 리액트 프로젝트가 셋업된다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">기존 자바스크립트 프로젝트에서는 없던 파일이 생긴다. tsconfig.app.json, tsconfig.json 파일이 생긴다.</p>
<p data-ke-size="size16">그리고 package.json에서 devDependencies에 typescript가 설치되어 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">특히 tsconfig.json에 들어가면 여러 줄로 작성된 옵션들이 보인다.</p>
<p data-ke-size="size16">어떤 옵션들이 있는지 정도만 참고하고, 깊게는 몰라도 프로젝트를 진행하는 데 큰 어려움이 없다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">tsconfig 옵션은 아래에서 확인할 수 있다.</p>
<h3 data-ke-size="size23">기존 자바스크립트 프로젝트에서 타입스크립트로 전환하는 방법</h3>
<p data-ke-size="size16">package.json에 의존성에 typescript 줄을 그대로 복사해서 붙여 넣은 후, tsconfig.json 파일을 만들고 내용을 복붙해주면 된다.</p>
<h2 data-ke-size="size26">기초 문법</h2>
<h3 data-ke-size="size23">타입의 종류</h3>
<p data-ke-size="size16">엄청 많다. 그런데 실제로 많이 사용하는 것은 아래와 같다.</p>
<h4 data-ke-size="size20">원시 타입(내장 타입, built-in type)</h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>number</li>
<li>string</li>
<li>boolean</li>
<li>object
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>array</li>
<li>function</li>
</ul>
</li>
<li>void : return값이 없는 함수의 타입.</li>
<li>undefined</li>
<li>any : 타입 검사를 무시함. 치트키 같은 개념. 가급적 사용 지양.</li>
<li>null</li>
</ul>
<h4 data-ke-size="size20">커스텀 타입(type alias, interface)</h4>
<p data-ke-size="size16"><b>type alias (타입 별칭)</b></p>
<pre id="code_1719283250251" class="bash" data-ke-language="bash" data-ke-type="codeblock"><code>// type alias(타입 별칭)
<p>type UserName = string;
const userName: UserName = '장원영';</p>
<p>// type alias 객체 타입</p>
<p>type MyObj = {
name: string,
age: number
}</p>
<p>const myObj: MyObj = {
name: '장원영'
age: 21
}</code></pre></p>
<p data-ke-size="size16"><b>interface</b></p>
<pre id="code_1719283283422" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// interface
<p>interface ExampleInterface {
example : string;
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">type alias와 interface는 얼핏 비슷해보이는데, 어떤 것을 사용해야 하는 지는 아직도 논란이다. 그런 타입스크립트 공식문서에서는 둘의 성격이 매우 비슷하니 취향에 맞게 사용해도 된다고 말하고 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그러나 꼭 하나만 선택해서 혼란을 줄이고자 한다면 type을 사용하는 것이 초보자 입장에서 더 직관적일 것이다.</p>
<h3 data-ke-size="size23">타입 추론과 타입 명시</h3>
<h4 data-ke-size="size20">타입 추론</h4>
<pre id="code_1719283565703" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>const [count, setCount] = useState(0);
<p>setCount(''); // 에러</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위 상태를 보면 useState의 initialState로 타입을 지정하지 않았지만 0이라는 초기값을 할당해줌으로써 타입스크립트 파일에서는 count라는 상태의 타입은 number라고 추론해준다. 타입을 명시하지 않았을 때 타입이 추론이 잘 되었는지 확인해보려면 에디터에서 해당 변수나 표현식에 마우스를 hover 해보면 된다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그리고 function App () {}과 같은 함수형 컴포넌트에는 어떤 타입을 지정해주어야 하는지 잘 모를 수 있는데, 자동으로 추론해주기 때문에 잘 모르겠는데 명시를 해주고 싶으면 마우스를 hover해서 추론된 것을 그대로 명시해주면 된다.</p>
<h4 data-ke-size="size20">타입 명시</h4>
<p data-ke-size="size16">그런데 중요한 것은 타입스크립트 파일에서 변수나 표현식의 타입을 자동으로 추론해준다고 하더라도, 명시해주는 것을 습관화하면 좋다. 타입을 이렇게 명시해주는 것을 <b>타입 어노테이션</b>이라 한다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719283928786" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// Type annortation
<p>const subtract = (a: number, b: number) :number =&gt; {
return a - b;
}</code></pre></p>
<h2 data-ke-size="size26">구조적 타입</h2>
<p data-ke-size="size16">타입스크립트는 구조적으로 같으면 같은 타입으로 간주한다.</p>
<p data-ke-size="size16">덕 타이핑이라고도 한다.</p>
<h2 data-ke-size="size26">제네릭</h2>
<p data-ke-size="size16">타입을 클래스나 함수에서 파라미터처럼 사용하는 것.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719284293698" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>function sum(a:number, b:number): number {
  return a + b;
}
<p>sum(1, 2); // 3</p>
<p>// Generic</p>
<p>type Generic&lt;T&gt; = {
name: T
}</p>
<p>type Example = Generic&lt;string&gt;;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위 제네릭 예시에서 &lt;string&gt;으로 타입을 명시하면 마치 이것은 Generic이라는 함수의 파라미터처럼 작동해서 &lt;T&gt; 자리에 전달된다. 따라서 Generic이라는 객체의 name 프로퍼티의 값은 string 타입으로 지정된다.</p>
<h2 data-ke-size="size26">리액트에서 사용하기</h2>
<h3 data-ke-size="size23">Todo List에서 실습하기</h3>
<h4 data-ke-size="size20">타입 지정하기</h4>
<pre id="code_1719284857458" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// App.jsx
<p>type Todo = {
id: string;
title: string;
description: string;
};</p>
<p>const mockTodo: Todo = {
id: crypto.randomUUID(),
title: '할 일 제목',
description: '할 일 내용'
};</p>
<p>function App () {
return(...)
};</code></pre></p>
<p data-ke-size="size16">이 예시는 카드 하나를 만든 거고 리스트를 만들려면 배열을 사용해야 한다.</p>
<h4 data-ke-size="size20">리스트 만들기(배열)</h4>
<pre id="code_1719284981725" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// App.jsx
<p>type Todo = {
id: string;
title: string;
description: string;
};</p>
<p>type TodoList = Todo[]; // TodoList라는 배열 타입 지정</p>
<p>const mockTodo: Todo = {
id: crypto.randomUUID(),
title: '할 일 제목',
description: '할 일 내용'
};</p>
<p>const todoList: TodoList = [mockTodo]; // 배열 만들기</p>
<p>function App () {
return(...)
};</code></pre></p>
<h4 data-ke-size="size20">상태의 초기값 지정하기</h4>
<pre id="code_1719285128708" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>type TodoList = Todo[]; // TodoList라는 배열 타입 지정
<p>// 타입 추론 : 초기값을 빈 배열로 두어서 빈 배열로 됨.</p>
<p>const [todoList, setTodoList] = useState([]);</p>
<p>// 타입 지정(제네릭)</p>
<p>const [todoList, setTodoList] = useState&lt;TodoList&gt;(todoList);</code></pre></p>
<h4 data-ke-size="size20">배열로 렌더링 하기</h4>
<pre id="code_1719285266410" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>return (
  &lt;&gt;
    {todoList.map(( {id, title, content} )=&gt;(
      &lt;div key={id}&gt;
        &lt;h1&gt;{title}&lt;/h1&gt;
        &lt;p&gt;{content}&lt;p&gt;
      &lt;/div&gt;
    ))}
  &lt;/&gt;
)</code></pre>
<h4 data-ke-size="size20">이벤트 핸들러 함수의 매개 변수 타입 지정하기</h4>
<pre id="code_1719285328129" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>const onTitleChange = (e) =&gt; {
  setTitle(e.target.value);
} // 에러</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">매개 변수 e의 타입을 지정해주지 않아서 에러가 발생한다.</p>
<p data-ke-size="size16">만약 event의 타입이 무엇인지 모르겠다면 입력 필드에 onChange에 연결해보고 마우스를 hover 해보면 타입의 종류를 알려준다. 그것을 그대로 복붙해주면 된다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719285428021" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>const onTitleChange = (e: React.ChangeEvent) =&gt; {
  setTitle(e.target.value);
} // 에러</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그런데 setTitle의 매개 변수인 e.target.value 또한 타입을 지정해주어야 하기 때문에 또 에러가 뜬다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>