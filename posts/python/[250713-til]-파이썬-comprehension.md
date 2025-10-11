<h2 data-ke-size="size26">Q1) 파이썬에는 반복문이 for in 밖에 없나요?</h2>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">A1) while 도 있습니다.</h2>
<p data-ke-size="size16">아니요, 파이썬에는 <code>for in</code> 외에도 <code>while</code> 반복문이 있습니다.</p>
<p data-ke-size="size16"><b>파이썬의 주요 반복문:</b></p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>for 반복문</b></li>
</ol>
<pre class="routeros"><code># 리스트 순회
fruits = ['apple', 'banana', 'orange']
for fruit in fruits:
    print(fruit)
<h1>range 사용</h1>
<p>for i in range(5):
print(i)</p>
<h1>딕셔너리 순회</h1>
<p>person = {'name': '오이', 'job': '개발자'}
for key, value in person.items():
print(f&quot;{key}: {value}&quot;)</code></pre></p>
<ol style="list-style-type: decimal;" start="2" data-ke-list-type="decimal">
<li><b>while 반복문</b></li>
</ol>
<pre class="gradle"><code># 조건이 참인 동안 반복
count = 0
while count &lt; 5:
    print(count)
    count += 1
<h1>무한루프 (break로 탈출)</h1>
<p>while True:
user_input = input(&quot;입력하세요 (q로 종료): &quot;)
if user_input == 'q':
break
print(f&quot;입력값: {user_input}&quot;)</code></pre></p>
<p data-ke-size="size16"><b>반복문 제어문:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>break</code>: 반복문 즉시 종료</li>
<li><code>continue</code>: 현재 반복을 건너뛰고 다음 반복으로</li>
<li><code>else</code>: 반복문이 정상적으로 완료되었을 때 실행</li>
</ul>
<pre class="angelscript"><code>for i in range(10):
    if i == 3:
        continue  # 3일 때 건너뛰기
    if i == 7:
        break     # 7일 때 종료
    print(i)
else:
    print("반복문이 정상 완료됨")  # break로 종료되면 실행되지 않음</code></pre>
<p data-ke-size="size16">파이썬은 다른 언어의 C스타일 for문(<code>for(int i=0; i&lt;10; i++)</code>)은 없지만, <code>range()</code>를 사용하면 비슷한 효과를 낼 수 있습니다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">Q2) 내장 메서드는 없나요?</h2>
<p data-ke-size="size16">그러면 자바스크립트처럼 배열 내장 메서드(map, forEach, filter 등) 은 없나요?</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">A2) 있지만 조금 다르고 Comprehension 을 많이 사용합니다.</h2>
<p data-ke-size="size16">파이썬에도 비슷한 기능들이 있지만, 자바스크립트와는 조금 다른 방식입니다.</p>
<p data-ke-size="size16"><b>파이썬의 함수형 프로그래밍 도구들:</b></p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>map() - JS의 map()과 동일</b></li>
</ol>
<pre class="angelscript"><code># JavaScript: [1,2,3].map(x =&gt; x * 2)
numbers = [1, 2, 3]
doubled = list(map(lambda x: x * 2, numbers))
print(doubled)  # [2, 4, 6]
<h1>더 파이썬다운 방식 (리스트 컴프리헨션)</h1>
<p>doubled = [x * 2 for x in numbers]</code></pre></p>
<ol style="list-style-type: decimal;" start="2" data-ke-list-type="decimal">
<li><b>filter() - JS의 filter()와 동일</b></li>
</ol>
<pre class="angelscript"><code># JavaScript: [1,2,3,4,5].filter(x =&gt; x % 2 === 0)
numbers = [1, 2, 3, 4, 5]
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)  # [2, 4]
<h1>리스트 컴프리헨션 방식</h1>
<p>evens = [x for x in numbers if x % 2 == 0]</code></pre></p>
<ol style="list-style-type: decimal;" start="3" data-ke-list-type="decimal">
<li><b>forEach 대신 for 반복문 사용</b></li>
</ol>
<pre class="livecodeserver"><code># JavaScript: arr.forEach(item =&gt; console.log(item))
arr = ['a', 'b', 'c']
for item in arr:
    print(item)</code></pre>
<p data-ke-size="size16"><b>파이썬만의 강력한 기능들:</b></p>
<ol style="list-style-type: decimal;" start="4" data-ke-list-type="decimal">
<li><b>리스트 컴프리헨션 (List Comprehension)</b></li>
</ol>
<pre class="angelscript"><code># 매우 간결하고 파이썬다운 방식
numbers = [1, 2, 3, 4, 5]
<h1>map + filter를 한번에</h1>
<p>result = [x * 2 for x in numbers if x % 2 == 0]
print(result)  # [4, 8]</p>
<h1>중첩 반복문도 가능</h1>
<p>matrix = [[1, 2], [3, 4], [5, 6]]
flattened = [item for row in matrix for item in row]
print(flattened)  # [1, 2, 3, 4, 5, 6]</code></pre></p>
<ol style="list-style-type: decimal;" start="5" data-ke-list-type="decimal">
<li><b>기타 유용한 내장 함수들</b></li>
</ol>
<pre class="makefile"><code>numbers = [1, 2, 3, 4, 5]
<h1>reduce는 functools에서 import</h1>
<p>from functools import reduce
sum_all = reduce(lambda x, y: x + y, numbers)</p>
<h1>하지만 파이썬에는 더 직관적인 방법들이 있음</h1>
<p>sum_all = sum(numbers)  # 합계
max_val = max(numbers)  # 최댓값
min_val = min(numbers)  # 최솟값</p>
<h1>any, all</h1>
<p>booleans = [True, False, True]
print(any(booleans))  # True (하나라도 True면)
print(all(booleans))  # False (모두 True여야)</code></pre></p>
<p data-ke-size="size16"><b>딕셔너리 컴프리헨션</b></p>
<pre class="angelscript"><code># 딕셔너리도 컴프리헨션 가능
numbers = [1, 2, 3, 4, 5]
squared_dict = {x: x**2 for x in numbers if x % 2 == 0}
print(squared_dict)  # {2: 4, 4: 16}</code></pre>
<p data-ke-size="size16"><b>정리:</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>파이썬도 <code>map()</code>, <code>filter()</code> 등이 있지만, <b>리스트 컴프리헨션</b>이 더 파이썬다운 방식으로 여겨집니다</li>
<li>자바스크립트의 체이닝 방식보다는 컴프리헨션이나 반복문을 더 선호하는 문화입니다</li>
<li>성능면에서도 리스트 컴프리헨션이 종종 더 빠릅니다</li>
<li>JS/TS에 익숙하시니까, 처음엔 <code>map()</code>, <code>filter()</code> 사용하시다가 점차 리스트 컴프리헨션에 익숙해지시는 것을 추천드려요!</li>
</ul>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">Q3) 마지막 예제(dictionary comprehension) 헷갈려요</h2>
<p data-ke-size="size16">마지막 예제에서 딕셔너리 컴프리헨션 이면 car = { name: 'avante', year: '2018' } 이런 딕셔너리에도 컴프리헨션이 가능하다는 말씀이신가요?</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">A3) 반복문을 통해 딕셔너리를 생성하는 것을 말합니다.</h2>
<p data-ke-size="size16">아니요, 제가 설명이 부족했네요! 딕셔너리 컴프리헨션은 <b>반복문을 통해 딕셔너리를 생성하는 것</b>이고, 단순한 딕셔너리 리터럴과는 다릅니다.</p>
<p data-ke-size="size16"><b>1. 일반적인 딕셔너리 생성 (JS 객체와 비슷)</b></p>
<pre class="routeros"><code># JavaScript: const car = { name: 'avante', year: '2018' }
car = {'name': 'avante', 'year': '2018'}
print(car)  # {'name': 'avante', 'year': '2018'}
<h1>또는 dict() 생성자 사용</h1>
<p>car = dict(name='avante', year='2018')</code></pre></p>
<p data-ke-size="size16"><b>2. 딕셔너리 컴프리헨션 (반복문으로 생성)</b></p>
<pre class="routeros"><code># 리스트에서 딕셔너리 생성
numbers = [1, 2, 3, 4, 5]
squared_dict = {x: x**2 for x in numbers if x % 2 == 0}
print(squared_dict)  # {2: 4, 4: 16}
<h1>문자열에서 딕셔너리 생성</h1>
<p>word = &quot;hello&quot;
char_index = {char: index for index, char in enumerate(word)}
print(char_index)  # {'h': 0, 'e': 1, 'l': 3, 'o': 4}</p>
<h1>두 리스트를 합쳐서 딕셔너리 생성</h1>
<p>keys = ['name', 'age', 'city']
values = ['오이', 25, '서울']
person = {k: v for k, v in zip(keys, values)}
print(person)  # {'name': '오이', 'age': 25, 'city': '서울'}</code></pre></p>
<p data-ke-size="size16"><b>3. 더 실용적인 예제</b></p>
<pre class="routeros"><code># 리스트의 각 항목을 변환하여 딕셔너리 생성
fruits = ['apple', 'banana', 'orange']
fruit_lengths = {fruit: len(fruit) for fruit in fruits}
print(fruit_lengths)  # {'apple': 5, 'banana': 6, 'orange': 6}
<h1>조건부 딕셔너리 생성</h1>
<p>scores = {'alice': 85, 'bob': 92, 'charlie': 78, 'diana': 96}
high_scores = {name: score for name, score in scores.items() if score &gt;= 90}
print(high_scores)  # {'bob': 92, 'diana': 96}</code></pre></p>
<p data-ke-size="size16"><b>JavaScript와 비교:</b></p>
<pre class="angelscript"><code>// JavaScript
const numbers = [1, 2, 3, 4, 5];
const squared = numbers
  .filter(x =&gt; x % 2 === 0)
  .reduce((acc, x) =&gt; ({...acc, [x]: x**2}), {});
<p>// Python (딕셔너리 컴프리헨션)
numbers = [1, 2, 3, 4, 5]
squared = {x: x**2 for x in numbers if x % 2 == 0}</code></pre></p>
<p data-ke-size="size16">정리하면:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>단순한 딕셔너리 생성: <code>{'name': 'avante', 'year': '2018'}</code></li>
<li>딕셔너리 컴프리헨션: <code>{표현식 for 항목 in 반복가능객체 if 조건}</code></li>
</ul>
<p data-ke-size="size16">컴프리헨션은 기존 데이터를 변환해서 새로운 딕셔너리를 만들 때 사용하는 방식입니다!</p>