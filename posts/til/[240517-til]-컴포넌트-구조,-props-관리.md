<p data-ke-size="size16">어제 리액트 특강을 들으면서, 작동여부는 둘째 치더라도 잘 정렬된 props와 컴포넌트 구조를 가져야 하고 이로부터<br />가독성이 담보된다는 사실을 다시 한번 느꼈습니다. 물론 작동도 잘 해야겠죠? 아래 내용을 정리해 보려고 합니다.</p>
<h3 data-ke-size="size23">기존 코드</h3>
<p data-ke-size="size16">일단 제가 작성했던 todo list는 App.tsx 와 Card.tsx 두 개로 되어 있었고,<span style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Apple SD Gothic Neo', Arial, sans-serif; letter-spacing: 0px;">컴포넌트화는 Card 만 한 상태였습니다. </span></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><span style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Apple SD Gothic Neo', Arial, sans-serif; letter-spacing: 0px;">부모 컴포넌트가 되는 App.tsx 에서 2개의 useState 를 만들었습니다.</span></p>
<p data-ke-size="size16">toDos 배열(전체 todo들)과 개별 toDo 객체 이렇게 2개 였고, 이렇게 생각한 이유는</p>
<p data-ke-size="size16">Form 을 컴포넌트로 분리하기가 어렵다고 생각했습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">Form 컴포넌트에서 다루는 데이터는 어차피 부모로부터 props 로 받아야 할 것이고,</p>
<p data-ke-size="size16">그러면 state 와 setState 함수 모두 내려받아야 해서 현재 단계에서 불필요할 것으로 생각했습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그래서, App.tsx 에서는 form을 처리합니다.</p>
<p data-ke-size="size16">onChange 핸들러인 handleChange와 onSubmit 핸들러인 handleSubmit 이 있습니다.</p>
<pre class="typescript" data-ke-language="typescript"><code>function App() {
    // 모든 투두 객체들을 포함할 배열
    const [toDos, setToDos] = useState&lt;ToDo[]&gt;(baseToDos);
    // 인풋 값으로 계속 변경될 하나의 투두 객체
    const [todo, setTodo] = useState&lt;ToDo&gt;({
        id: "",
        title: "",
        body: "",
        isDone: false,
    });
<pre><code>// 인풋 체인지 핸들러
// 인풋 값이 변경될 때마다 불변성 유지하며 객체 생성
const handleChange = (e: React.ChangeEvent&amp;lt;HTMLInputElement&amp;gt;) =&amp;gt; {
    const { name, value } = e.target;
    const newTodo = {
        ...todo,
        [name]: value,
    };
    setTodo(newTodo);
};

// 폼 서브밋 핸들러
// 인풋핸들러에서 설정된 투두 객체를 투두스 배열에 추가
const handleSubmit = (e: React.FormEvent&amp;lt;HTMLFormElement&amp;gt;) =&amp;gt; {
    e.preventDefault();
    if (todo) setToDos([...toDos, { ...todo, id: uuidv4() }]);
};

return (
    &amp;lt;&amp;gt;
        &amp;lt;div className=&quot;top_wrapper&quot;&amp;gt;
            &amp;lt;header className=&quot;my_header&quot;&amp;gt;
                &amp;lt;h3&amp;gt;My Todo List&amp;lt;/h3&amp;gt;
                &amp;lt;p&amp;gt;React&amp;lt;/p&amp;gt;
            &amp;lt;/header&amp;gt;

            &amp;lt;section className=&quot;input_section&quot;&amp;gt;
                &amp;lt;form className=&quot;submit_form&quot; onSubmit={handleSubmit}&amp;gt;
                    &amp;lt;div className=&quot;input_area&quot;&amp;gt;
                        &amp;lt;label htmlFor=&quot;title&quot;&amp;gt;제목&amp;lt;/label&amp;gt;
                        &amp;lt;input
                            type=&quot;text&quot;
                            name=&quot;title&quot;
                            required
                            onChange={handleChange}
                            value={todo.title}
                        &amp;gt;&amp;lt;/input&amp;gt;
                        &amp;lt;label htmlFor=&quot;body&quot;&amp;gt;내용&amp;lt;/label&amp;gt;
                        &amp;lt;input
                            type=&quot;text&quot;
                            name=&quot;body&quot;
                            required
                            onChange={handleChange}
                            value={todo.body}
                        &amp;gt;&amp;lt;/input&amp;gt;
                    &amp;lt;/div&amp;gt;

                    &amp;lt;button type=&quot;submit&quot;&amp;gt;추가하기&amp;lt;/button&amp;gt;
                &amp;lt;/form&amp;gt;
            &amp;lt;/section&amp;gt;

            &amp;lt;section className=&quot;content_section&quot;&amp;gt;
                &amp;lt;div className=&quot;content_box&quot;&amp;gt;
                    &amp;lt;h2&amp;gt;Working... &amp;lt;/h2&amp;gt;
                    &amp;lt;div className=&quot;content&quot;&amp;gt;
                        {toDos
                            .filter((e) =&amp;gt; !e.isDone)
                            .map((e, i) =&amp;gt; (
                                &amp;lt;Card
                                    key={i}
                                    todo={e}
                                    toDos={toDos}
                                    inputted={todo}
                                    setToDos={setToDos}
                                /&amp;gt;
                            ))}
                    &amp;lt;/div&amp;gt;
                &amp;lt;/div&amp;gt;

                &amp;lt;div className=&quot;content_box&quot;&amp;gt;
                    &amp;lt;h2&amp;gt;Done... &amp;lt;/h2&amp;gt;
                    &amp;lt;div className=&quot;content&quot;&amp;gt;
                        {toDos
                            .filter((e) =&amp;gt; e.isDone)
                            .map((e, i) =&amp;gt; (
                                &amp;lt;Card
                                    key={i}
                                    todo={e}
                                    toDos={toDos}
                                    inputted={todo}
                                    setToDos={setToDos}
                                /&amp;gt;
                            ))}
                    &amp;lt;/div&amp;gt;
                &amp;lt;/div&amp;gt;
            &amp;lt;/section&amp;gt;
        &amp;lt;/div&amp;gt;
    &amp;lt;/&amp;gt;
);
</code></pre>
<p>}</p>
<p>export default App;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이렇게 하다보니, Card 로 보내야하는 props 도 자연히 많았습니다. todo, toDos, inputted, setToDos 이렇게 4가지나 되었고, 그 중에서 setState 함수인 setToDos 또한 직접 내려주는 방법을 생각했습니다.</p>
<pre class="typescript" data-ke-language="typescript"><code>const Card = memo(({ todo, toDos, inputted, setToDos }: TodoProps) =&gt; {
    // 투두 토글
    const completeToDo = (copied: ToDo[]) =&gt; {
        const mapped = copied.map((e) =&gt; {
            if (e.id === todo.id) e.isDone = !e.isDone;
            return e;
        });
        setToDos(mapped);
    };
<pre><code>// 투두 업데이트
// 업데이트할 내용은 props 로 받은 input
const updateToDo = (copied: ToDo[]) =&amp;gt; {
    if (inputted.title === todo.title &amp;amp;&amp;amp; inputted.body === todo.body) {
        alert(&quot;바뀐 내용이 없네요!&quot;);
        return;
    } else if (inputted.title === &quot;&quot; || inputted.body === &quot;&quot;) {
        alert(&quot;입력 값이 없는 것 같아요 확인 부탁&quot;);
        return;
    } else {
        // 현재 컴포넌트 데이터(todo)의 id 와 일치하는 id를 가진 객체를 toDos 배열에서 찾아서
        // 찾은 객체의 title, body 값을 변경
        const mapped = copied.map((e) =&amp;gt; {
            if (e.id === todo.id) {
                return {
                    ...e,
                    title: inputted.title,
                    body: inputted.body,
                };
            } else {
                return e;
            }
        });
        setToDos(mapped);
    }
};

// 투두 삭제
const deleteToDo = (copied: ToDo[]) =&amp;gt; {
    // 현재 컴포넌트 데이터의 id 와 일치하지 않는 값만 반환(현재 값은 삭제해야 하므로)
    const filtered = copied.filter((e) =&amp;gt; e.id !== todo.id);
    setToDos(filtered);
};

// 클릭 핸들러
const handleClick = (e: React.MouseEvent&amp;lt;HTMLDivElement&amp;gt;) =&amp;gt; {
    // 불변성 유지
    const copied = [...toDos];

    if (e.currentTarget.id === &quot;fin_cancel&quot;) {
        completeToDo(copied);
    } else if (e.currentTarget.id === &quot;update&quot;) {
        updateToDo(copied);
    } else if (e.currentTarget.id === &quot;del&quot;) {
        deleteToDo(copied);
    }
};

return (
    &amp;lt;section className={`card ${todo.isDone ? &quot;done&quot; : &quot;work&quot;}`}&amp;gt;
        &amp;lt;div className=&quot;card_top&quot;&amp;gt;
            &amp;lt;h3&amp;gt;{todo.title}&amp;lt;/h3&amp;gt;
            &amp;lt;p&amp;gt;{todo.body}&amp;lt;/p&amp;gt;
        &amp;lt;/div&amp;gt;
        &amp;lt;div className=&quot;card_buttons&quot;&amp;gt;
            &amp;lt;div className=&quot;btn del&quot; id=&quot;del&quot; onClick={handleClick}&amp;gt;
                삭제
            &amp;lt;/div&amp;gt;
            &amp;lt;div className=&quot;btn update&quot; id=&quot;update&quot; onClick={handleClick}&amp;gt;
                수정
            &amp;lt;/div&amp;gt;
            &amp;lt;div className=&quot;btn fin&quot; id=&quot;fin_cancel&quot; onClick={handleClick}&amp;gt;
                {todo.isDone ? &quot;취소&quot; : &quot;완료&quot;}
            &amp;lt;/div&amp;gt;
        &amp;lt;/div&amp;gt;
    &amp;lt;/section&amp;gt;
);
</code></pre>
<p>});</p>
<p>export default Card;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">4가지 props 를 받은 Card 는 위와 같이 처리하고 있었습니다.</p>
<p data-ke-size="size16">완성은 했지만 무언가 찝찝했었는데, 특강을 통해 관점을 크게 바꿀 수 있었습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">수정한 코드</h3>
<p data-ke-size="size16">특강에서 여러가지를 배웠지만 요약하면 다음과 같습니다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>setState 를 prop으로 주는 것은 좋지 않은 생각 - 자식 컴포넌트에서 setState 할일이 엄청 많지 않다면.</li>
<li>form 의 값들을 처리하는 state 는 그냥 form 컴포넌트에 있어도 충분하다.</li>
<li>container 컴포넌트에서 배열 state 하나만 만들고 이것을 변경하는 custom 함수들을 만들어서 얘네를 내려줘서 처리.</li>
</ul>
<p data-ke-size="size16">이 중 먼저 첫번째 문제는 setState를 상습적으로 내려주곤 했던 저에게 좋은 가르침이 되었습니다.<br />혼자 코드를 작성하면서 의문점이 이런 부분이었는데, 컨벤션을 새롭게 배운 느낌입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">두번째 문제는 이렇게 생각하긴 했는데 Form 으로 분리해서 관리하려면 더 복잡하고 redux 든 context API 든 상태관리를 따로 해줘야 될 것 같았습니다. 하지만! 역시 그냥 가능했습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">첫번째, 두번째 문제를 해결하는 방안이 세번째 항목의 요점인 것 같습니다.</p>
<p data-ke-size="size16">부모 컴포넌트에서 state 하나만 만들고 이를 변경하는 setState 는 custom 함수로 감싸서(?) 사용하는 것입니다.</p>
<p data-ke-size="size16">이렇게 하면 props 로 내려줄 때에도 setState 를 바로 내려주지 않아도 되고, 함수의 목적 또한 명확하게 제한해서 사용할 수 있었습니다.</p>
<pre class="typescript" data-ke-language="typescript"><code>function App() {
// 모든 투두 객체들을 포함할 배열
const [toDos, setToDos] = useState&lt;ToDo[]&gt;(baseToDos);
<p>// 투두 추가
const addToDo = (newTodo: ToDo) =&gt; setToDos((prevToDos) =&gt; [...prevToDos, newTodo]);
// 투두 삭제
const deleteToDo = (toDoId: string) =&gt; setToDos((prevToDos) =&gt;
prevToDos.filter((todo) =&gt; todo.id !== toDoId));
// 투두 상태 토글
const toggleIsDone = (toDoId: string) =&gt;
setToDos((prevToDos) =&gt;
prevToDos.map((todo) =&gt;
todo.id === toDoId ? { ...todo, isDone: !todo.isDone } : todo));</p>
<p>const workingToDos = toDos.filter((todo) =&gt; !todo.isDone);
const doneToDos = toDos.filter((todo) =&gt; todo.isDone);</p>
<pre><code>return (
    &amp;lt;&amp;gt;
        &amp;lt;div className=&quot;top_wrapper&quot;&amp;gt;
            &amp;lt;header className=&quot;my_header&quot;&amp;gt;
                &amp;lt;h3&amp;gt;My Todo List&amp;lt;/h3&amp;gt;
                &amp;lt;p&amp;gt;React&amp;lt;/p&amp;gt;
            &amp;lt;/header&amp;gt;

            &amp;lt;Form addToDo={addToDo} /&amp;gt;

            &amp;lt;section className=&quot;content_section&quot;&amp;gt;
                &amp;lt;div className=&quot;content_box&quot;&amp;gt;
                    &amp;lt;h2&amp;gt;Working... &amp;lt;/h2&amp;gt;
                    &amp;lt;div className=&quot;content&quot;&amp;gt;
                    {workingToDos.map((e, i) =&amp;gt; (
                        &amp;lt;Card
                            key={i}
                            deleteToDo={deleteToDo}
                            toggleIsDone={toggleIsDone}
                            todo={e}
                        /&amp;gt;
                    ))}
                    &amp;lt;/div&amp;gt;
                &amp;lt;/div&amp;gt;



                &amp;lt;div className=&quot;content_box&quot;&amp;gt;
                    &amp;lt;h2&amp;gt;Done... &amp;lt;/h2&amp;gt;
                    &amp;lt;div className=&quot;content&quot;&amp;gt;
                    {doneToDos.map((e, i) =&amp;gt; (
                        &amp;lt;Card
                            key={i}
                            deleteToDo={deleteToDo}
                            toggleIsDone={toggleIsDone}
                            todo={e}
                        /&amp;gt;
                    ))}
                    &amp;lt;/div&amp;gt;
                &amp;lt;/div&amp;gt;
            &amp;lt;/section&amp;gt;
        &amp;lt;/div&amp;gt;
    &amp;lt;/&amp;gt;
);
</code></pre>
<p>}</p>
<p>export default App;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위처럼 추가, 삭제, 토글 함수를 만들어 주고, 부모 컴포넌트에는 toDos 배열 state 하나만 사용합니다.<br />그리고 Form 에서,</p>
<pre class="typescript" data-ke-language="typescript"><code>const Form = ({ addToDo }: FormProps) =&gt; {
    // 인풋 값으로 계속 변경될 하나의 투두 객체
    const [todo, setTodo] = useState&lt;ToDo&gt;({
        id: "",
        title: "",
        body: "",
        isDone: false,
    });
<pre><code>// 폼 체인지 핸들러
const handleChange = (e: React.ChangeEvent&amp;lt;HTMLInputElement&amp;gt;) =&amp;gt; {
    const { name, value } = e.target;
    const newTodo = {
        ...todo,
        [name]: value,
    };
    setTodo(newTodo);
};

// 폼 서브밋 핸들러
// 인풋핸들러에서 설정된 투두 객체를 투두스 배열에 추가
const handleSubmit = (e: React.FormEvent&amp;lt;HTMLFormElement&amp;gt;) =&amp;gt; {
    e.preventDefault();
    if (todo) addToDo({ ...todo, id: uuidv4() });
};

return (

    &amp;lt;section className=&quot;input_section&quot;&amp;gt;
        &amp;lt;form className=&quot;submit_form&quot; onSubmit={handleSubmit}&amp;gt;
            &amp;lt;div className=&quot;input_area&quot;&amp;gt;
                &amp;lt;label htmlFor=&quot;title&quot;&amp;gt;제목&amp;lt;/label&amp;gt;
                &amp;lt;input    
                    type=&quot;text&quot;
                    name=&quot;title&quot;
                    required
                    onChange={handleChange}
                    value={todo.title}&amp;gt;&amp;lt;/input&amp;gt;
                &amp;lt;label htmlFor=&quot;body&quot;&amp;gt;내용&amp;lt;/label&amp;gt;
                &amp;lt;input
                    type=&quot;text&quot;
                    name=&quot;body&quot;
                    required
                    onChange={handleChange}
                    value={todo.body}&amp;gt;&amp;lt;/input&amp;gt;
            &amp;lt;/div&amp;gt;
            &amp;lt;button type=&quot;submit&quot;&amp;gt;추가하기&amp;lt;/button&amp;gt;
        &amp;lt;/form&amp;gt;
    &amp;lt;/section&amp;gt;
);
</code></pre>
<p>};</p>
<p>export default Form;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이전에 부모컴포넌트에 있던 개별 toDo 객체 state를 만들고, 이 안에서만 처리하도록 합니다.<br />어차피 form 에서는 생각해보면 toDo 의 추가만 이루어지기 때문에, setState 를 통째로 받을 필요 없이,<br />addToDo 만 받으면 되는 것이었습니다!</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">Card 컴포넌트는 아래와 같습니다.</p>
<pre class="typescript" data-ke-language="typescript"><code>const Card = memo(({ todo, deleteToDo, toggleIsDone }: TodoProps) =&gt; {
    // 클릭 핸들러
    const handleClick = (e: React.MouseEvent&lt;HTMLDivElement&gt;) =&gt; {
        if (e.currentTarget.id === "fin_cancel") {
            toggleIsDone(todo.id);
        } else if (e.currentTarget.id === "del") {
            deleteToDo(todo.id);
        }
    };
<p>return (
&lt;section className={<code>card ${todo.isDone ? &quot;done&quot; : &quot;work&quot;}</code>}&gt;
&lt;div className=&quot;card_top&quot;&gt;
&lt;h3&gt;{todo.title}&lt;/h3&gt;
&lt;p&gt;{todo.body}&lt;/p&gt;
&lt;/div&gt;
&lt;div className=&quot;card_buttons&quot;&gt;
&lt;div className=&quot;btn del&quot; id=&quot;del&quot; onClick={handleClick}&gt;삭제&lt;/div&gt;
&lt;div className=&quot;btn fin&quot; id=&quot;fin_cancel&quot; onClick={handleClick}&gt;
{todo.isDone ? &quot;취소&quot; : &quot;완료&quot;}
&lt;/div&gt;
&lt;/div&gt;
&lt;/section&gt;
);
});</p>
<p>export default Card;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">역시 여기서도 처리해야하는 일은 완료여부 토글과 삭제 뿐이므로, 해당 기능을 하는 custom 함수 deleteToDo, toggleIsDone 을 내려주고 두가지 일만 처리합니다!</p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">요약</h3>
<p data-ke-size="size16">리액트 특강을 통해 props와 컴포넌트 구조의 중요성을 재인식했습니다.</p>
<p data-ke-size="size16">주요 개선 사항은 state 관리를 부모 컴포넌트에서 일관되게 하고,<br />필요한 기능을 custom 함수로 정의하여 자식 컴포넌트에 전달하는 것입니다.</p>
<p data-ke-size="size16">이를 통해 props의 수를 줄이고, 각 컴포넌트의 역할을 명확히 하여 코드의 가독성과 유지보수성을 높였습니다.</p>
<p data-ke-size="size16"><br />이렇게 할 경우 구체적 이점은 다음과 같습니다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>구조적 명확성</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>각 함수가 무엇을 하는지 명확하게 알 수 있어 코드의 가독성이 높아집니다. 예를 들어, <code>addToDo</code>, <code>deleteToDo</code>, <code>toggleIsDone</code> 등의 함수명은 각 함수의 목적을 분명히 드러냅니다.</li>
<li>부모 컴포넌트에서 상태 관리를 일관되게 할 수 있으며, 상태 변경 로직이 분산되지 않습니다.</li>
</ul>
</li>
<li><b>캡슐화와 재사용성</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>custom 함수는 상태 변경 로직을 캡슐화하므로, 필요할 때마다 쉽게 재사용할 수 있습니다.</li>
<li>자식 컴포넌트는 필요한 기능만 props로 받아 사용하므로, 불필요한 상태 변경 로직을 알 필요가 없습니다.</li>
</ul>
</li>
<li><b>유지보수 용이성</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>상태 변경 로직이 부모 컴포넌트에 집중되어 있어 수정이 필요할 때 해당 부분만 변경하면 됩니다.</li>
<li>코드의 한 부분만 수정하면 되므로 버그 발생 가능성이 줄어듭니다.</li>
</ul>
</li>
<li><b>테스트 용이성</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>상태 변경 함수가 분리되어 있어 각각의 함수를 독립적으로 테스트할 수 있습니다.</li>
<li>특정 기능을 하는 함수만 테스트하면 되므로 테스트 코드 작성이 수월합니다.</li>
</ul>
</li>
</ol>