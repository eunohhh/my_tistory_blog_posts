<h1>class 프로퍼티 선언방법 두가지</h1>
<h3 data-ke-size="size23">방식 1:</h3>
<pre class="typescript"><code>class Book {
    constructor(
        public title: string,
        public author: string,
        public publishedDate: Date
    ) {}
}</code></pre>
<h3 data-ke-size="size23">방식 2:</h3>
<pre class="typescript"><code>class Book {
    public title: string;
    public author: string;
    public publishedDate: Date;
<pre><code>constructor(
    title: string = '타이틀',
    author: string = '저자',
    publishedDate: Date = new Date()
) {
    this.title = title;
    this.author = author;
    this.publishedDate = publishedDate;
}
</code></pre>
<p>}</code></pre></p>
<h3 data-ke-size="size23">차이점:</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>기본 값 제공</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>방식 2는 생성자 매개변수에 기본 값을 제공하여, 인스턴스를 생성할 때 모든 매개변수를 전달하지 않아도 기본 값이 설정됩니다. 방식 1은 기본 값을 제공하지 않습니다.</li>
</ul>
</li>
<li><b>코드 간결성</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>방식 1은 TypeScript의 매개변수 프로퍼티 선언을 사용하여 코드가 더 간결하고 직관적입니다. 생성자에서 매개변수를 바로 클래스 프로퍼티로 선언하고 초기화합니다.</li>
<li>방식 2는 기본 값을 설정할 수 있는 장점이 있지만, 프로퍼티를 생성자 안에서 명시적으로 할당해야 하므로 코드가 더 길어집니다.</li>
</ul>
</li>
</ol>
<h3 data-ke-size="size23">어느 쪽이 좋은가?</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>기본 값이 필요한 경우</b>: 방식 2가 더 유용합니다. 생성자에서 기본 값을 제공함으로써 인스턴스 생성 시 매개변수를 생략할 수 있어 유연합니다.</li>
<li><b>코드 간결성 및 명확성</b>: 기본 값이 필요하지 않다면 방식 1이 더 좋습니다. 코드가 더 간결하고 읽기 쉬워 유지보수에 유리합니다.</li>
</ul>
<p data-ke-size="size16">따라서 상황에 따라 적절한 방식을 선택하는 것이 좋습니다. 기본 값이 필요한 경우 방식 2를 사용하고, 그렇지 않다면 방식 1을 사용하는 것이 좋습니다.</p>