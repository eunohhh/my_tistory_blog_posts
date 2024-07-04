<h2 data-ke-size="size26">Literal type</h2>
<p data-ke-size="size16">기존의 타입이 변수나 표현식의 자료형을 지정해주는 방법이었다고 하면,</p>
<p data-ke-size="size16">literal types는 아예 그 자료형의 값까지 지정해주는 방법이다.</p>
<pre id="code_1719297343625" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// type alias (타입 별칭)
<p>type UserID = string;</p>
<p>type User = {
id: UserID;
name: string;
age: number;
isAdmin: boolean;
};</p>
<p>const user: User = {
id: &quot;12345&quot;,
name: &quot;장원영&quot;,
age: 21,
isAdmin: true,
};</p>
<p>// literal types</p>
<p>type Direction = 'north' | 'south' | 'east' | 'west';</p>
<p>function move(direction: Direction) {
console.log(<code>현재 방향은 ${direction} 방향입니다.</code>);
}</p>
<p>move('north');
move('북쪽'); // 에러</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위 예제를 보면 direction이라는 매개 변수에는 동서남북 4방향 외에는 올 값이 없다고 확정되는 경우,</p>
<p data-ke-size="size16">literal types로 string, number, boolean과 같은 타입을 지정해주는 것이 아니라 문자형으로 'north' | 'south' ... 와 같이 값 자체를 지정해버릴 수도 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이렇게 되면 direction이라는 매개 변수는 string 타입인 것 같지만 'north' | 'south' ... 타입을 모두 갖는 union 타입이 된다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1572" data-origin-height="638"><span data-url="https://blog.kakaocdn.net/dn/dHqToZ/btsIa4sPm3M/6igIbfKfhmksuA5ZWZPLdk/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/dHqToZ/btsIa4sPm3M/6igIbfKfhmksuA5ZWZPLdk/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdHqToZ%2FbtsIa4sPm3M%2F6igIbfKfhmksuA5ZWZPLdk%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1572" data-origin-height="638"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1572" data-origin-height="638"><span data-url="https://blog.kakaocdn.net/dn/GEYAK/btsH90j7pI0/1ekCWHgRW5hVgkxaXy7M81/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/GEYAK/btsH90j7pI0/1ekCWHgRW5hVgkxaXy7M81/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FGEYAK%2FbtsH90j7pI0%2F1ekCWHgRW5hVgkxaXy7M81%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1572" data-origin-height="638"/></span></figure>
</p>
<h3 data-ke-size="size23">const 상수에서의 사용</h3>
<p data-ke-size="size16">const로 선언한 상수는 원래 한 번 값이 할당되면 다시는 값을 재할당 할 수 없다.</p>
<p data-ke-size="size16">하지만 점 표기법이나 대괄호 표기법 등으로 일부의 값을 바꿀 수 있어서 readonly를 사용했었고,</p>
<p data-ke-size="size16">처음부터 값을 여러 개 중 하나가 될 수 있다는 식으로 설정할 수도 있다.</p>
<pre id="code_1719297769212" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>const userName: '장원영' | '안유진' = '안유진';</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이런 식으로 약간은 덜 엄격한 이상한 형태로 상수를 선언할 수도 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">as const</h2>
<p data-ke-size="size16">객체에서 특정 프로퍼티의 값을 바꾸지 못하게 할 때, 배열 전체의 값을 바꾸지 못하게 할 때 readonly라는 키워드를 사용했다.</p>
<pre id="code_1719298231838" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// 객체에서의 readonly
<p>type User = {
readonly name: string;
age: number;
}</p>
<p>const user: User = {
name: '장원영',
age: 21
}</p>
<p>user.name; = '안유진' // 에러. name 프로퍼티는 읽기 전용이라 값을 바꿀 수 없음.
user.age: 31; // 가능.</p>
<p>// 배열에서의 readonly</p>
<p>type Numbers = readonly number[];</p>
<p>const numbers: Numbers = [1, 2, 3];</p>
<p>numbers.push(4); // 에러. numbers 배열은 전체가 읽기 전용.
numbers[0] = 10; // 에러. numbers 배열은 전체가 읽기 전용.</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">as const도 비슷한 역할을 한다. 그런데 객체는 특정 프로퍼티에만 읽기 전용을 걸어줄 수 있었지만, as const는 타입을 전부 지정하고 객체나 배열의 맨 끝에 키워드를 붙여주기만 함으로써 객체나 배열 전체를 읽기 전용 상태로 만들 수 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719298395136" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// 객체에서의 as const
<p>const user = {
name: '장원영',
age: 21,
} as const;</p>
<p>user.name = '안유진'; // 에러
user.age = 31; // 에러</p>
<p>// 배열에서의 as const</p>
<p>const colors = ['read', 'green', 'blue'] as const;</p>
<p>colors.push('red'); // 에러.
colors[0]; // 에러</code></pre></p>
