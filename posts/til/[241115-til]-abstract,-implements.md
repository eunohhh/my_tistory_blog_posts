<h2 data-ke-size="size26">abstract</h2>
<p data-ke-size="size16"><code>abstract</code> 키워드를 사용한 클래스는 <b>추상 클래스</b>라고 하며, 다음과 같은 특징과 목적을 가지고 있습니다.</p>
<h3 data-ke-size="size23">1. <b>인스턴스화가 불가능</b></h3>
<p data-ke-size="size16">추상 클래스는 직접 인스턴스화할 수 없습니다. 즉, <code>new</code> 키워드로 객체를 생성할 수 없습니다. 오직 다른 클래스가 이를 상속하고 구체적인 구현을 제공할 때만 인스턴스를 만들 수 있습니다.</p>
<pre class="cs"><code>   abstract class Animal {
     abstract makeSound(): void; // 추상 메서드
     move(): void {
       console.log("Moving...");
     }
   }
<p>const animal = new Animal(); // 오류 발생: 추상 클래스는 인스턴스화할 수 없습니다.</code></pre></p>
<h3 data-ke-size="size23">2. <b>추상 메서드 포함 가능</b></h3>
<p data-ke-size="size16">추상 클래스는 <b>추상 메서드</b>를 포함할 수 있습니다. 추상 메서드는 선언만 하고 구현하지 않은 메서드입니다. 추상 메서드는 하위 클래스에서 반드시 구현해야 하며, 추상 메서드를 포함하는 클래스는 반드시 <code>abstract</code>로 선언해야 합니다.</p>
<pre class="scala"><code>   abstract class Animal {
     abstract makeSound(): void; // 하위 클래스에서 구현해야 하는 추상 메서드
<pre><code> move(): void {
   console.log(&quot;Moving...&quot;);
 }
</code></pre>
<p>}</p>
<p>class Dog extends Animal {
makeSound(): void {
console.log(&quot;Woof!&quot;);
}
}</p>
<p>const dog = new Dog();
dog.makeSound(); // &quot;Woof!&quot;
dog.move();      // &quot;Moving...&quot;</code></pre></p>
<p data-ke-size="size16">위 예시에서 <code>Dog</code> 클래스는 <code>Animal</code> 클래스를 상속받아 <code>makeSound()</code> 메서드를 구현했습니다.</p>
<h3 data-ke-size="size23">3. <b>상속의 기본 틀 제공</b></h3>
<p data-ke-size="size16">추상 클래스는 기본적인 동작이나 메서드를 포함하면서도 구체적인 동작은 하위 클래스에서 구현하도록 하는 <b>기본 틀</b>을 제공합니다. 이를 통해 상속을 사용하는 클래스들 간의 일관성을 보장할 수 있습니다.</p>
<pre class="scala"><code>   abstract class Shape {
     abstract getArea(): number;
<pre><code> describe(): void {
   console.log(&quot;This shape has an area of:&quot;, this.getArea());
 }
</code></pre>
<p>}</p>
<p>class Circle extends Shape {
constructor(private radius: number) {
super();
}</p>
<pre><code> getArea(): number {
   return Math.PI * this.radius * this.radius;
 }
</code></pre>
<p>}</p>
<p>const circle = new Circle(5);
circle.describe(); // This shape has an area of: 78.53981633974483</code></pre></p>
<h3 data-ke-size="size23">4. <b>공통 기능의 정의와 일관성 유지</b></h3>
<p data-ke-size="size16">추상 클래스는 <b>공통 기능을 정의</b>하고, <b>일관된 인터페이스를 제공</b>하여 여러 하위 클래스들이 동일한 방식으로 동작할 수 있도록 합니다.</p>
<h3 data-ke-size="size23">요약</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>인스턴스화 불가</b>: 직접적으로 객체 생성이 불가능합니다.</li>
<li><b>추상 메서드 포함 가능</b>: 하위 클래스가 구현해야 할 메서드를 선언할 수 있습니다.</li>
<li><b>기본 틀 제공</b>: 공통 메서드를 제공하고, 하위 클래스에서 구체적인 구현을 강제합니다.</li>
</ul>
<h2 data-ke-size="size26">implements</h2>
<p data-ke-size="size16"><code>implements</code>와 <code>extends</code>는 클래스가 다른 클래스나 인터페이스와 관계를 정의하는 방식에서 중요한 차이점을 가지고 있습니다.</p>
<h3 data-ke-size="size23"><code>extends</code>: 클래스 상속</h3>
<p data-ke-size="size16"><code>extends</code> 키워드는 <b>클래스를 상속</b>하여 새로운 클래스를 생성할 때 사용됩니다. 이를 통해 기존 클래스의 속성 및 메서드를 가져오면서 추가 기능을 정의하거나 기존 기능을 재정의할 수 있습니다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>부모 클래스의 속성과 메서드 상속</b>: 하위 클래스는 부모 클래스의 모든 속성과 메서드를 상속받습니다.</li>
<li><b>상속받은 메서드 재정의 가능</b>: 하위 클래스는 상속받은 메서드를 <b>오버라이딩</b>(재정의)하여 동작을 수정할 수 있습니다.</li>
<li><b>다중 상속 불가</b>: JavaScript와 TypeScript에서는 한 클래스만 상속할 수 있습니다.</li>
</ul>
<h4 data-ke-size="size20">예시</h4>
<pre class="scala"><code>class Animal {
  move(): void {
    console.log("Moving...");
  }
}
<p>class Dog extends Animal {
bark(): void {
console.log(&quot;Woof!&quot;);
}
}</p>
<p>const dog = new Dog();
dog.move(); // &quot;Moving...&quot; (Animal의 메서드)
dog.bark(); // &quot;Woof!&quot; (Dog의 메서드)</code></pre></p>
<p data-ke-size="size16">여기서 <code>Dog</code> 클래스는 <code>Animal</code> 클래스를 상속받았기 때문에, <code>move</code> 메서드도 사용할 수 있습니다.</p>
<h3 data-ke-size="size23"><code>implements</code>: 인터페이스 구현</h3>
<p data-ke-size="size16"><code>implements</code> 키워드는 <b>인터페이스의 구조를 구현</b>할 때 사용됩니다. 인터페이스는 메서드와 속성의 구조만 정의하고, 실제 구현은 포함하지 않으며, 클래스에서 이를 구현하도록 강제합니다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>구조 강제</b>: <code>implements</code>는 클래스가 특정 메서드와 속성을 포함하도록 강제하지만, 실제 구현은 클래스 내에서 정의됩니다.</li>
<li><b>다중 구현 가능</b>: 클래스는 여러 인터페이스를 동시에 <code>implements</code> 할 수 있습니다.</li>
<li><b>코드 공유 없음</b>: 인터페이스는 구조만 제공하고 실제 코드는 없으므로 <code>extends</code>와 달리 코드가 공유되지 않습니다.</li>
</ul>
<h4 data-ke-size="size20">예시</h4>
<pre class="angelscript"><code>interface Swimmer {
  swim(): void;
}
<p>interface Runner {
run(): void;
}</p>
<p>class Person implements Swimmer, Runner {
swim(): void {
console.log(&quot;Swimming...&quot;);
}</p>
<p>run(): void {
console.log(&quot;Running...&quot;);
}
}</p>
<p>const person = new Person();
person.swim(); // &quot;Swimming...&quot;
person.run();  // &quot;Running...&quot;</code></pre></p>
<p data-ke-size="size16">위 예시에서 <code>Person</code> 클래스는 <code>Swimmer</code>와 <code>Runner</code> 인터페이스를 구현하여 두 인터페이스에서 정의한 <code>swim</code>과 <code>run</code> 메서드를 반드시 포함해야 합니다.</p>
<h3 data-ke-size="size23">요약</h3>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>기능</th>
<th><code>extends</code></th>
<th><code>implements</code></th>
</tr>
</thead>
<tbody>
<tr>
<td>목적</td>
<td>클래스 상속을 통해 코드 재사용</td>
<td>인터페이스의 구조 강제</td>
</tr>
<tr>
<td>코드 공유</td>
<td>부모 클래스의 코드 사용 가능</td>
<td>인터페이스는 구현을 포함하지 않음</td>
</tr>
<tr>
<td>메서드 재정의</td>
<td>메서드를 재정의할 수 있음</td>
<td>인터페이스의 구현만 포함</td>
</tr>
<tr>
<td>다중 사용</td>
<td>단일 상속 가능</td>
<td>여러 인터페이스 구현 가능</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">따라서, <code>extends</code>는 클래스 간의 상속을 통해 기능을 재사용하거나 확장할 때 사용하고, <code>implements</code>는 인터페이스를 통해 클래스가 특정 구조를 갖추도록 할 때 사용합니다.</p>