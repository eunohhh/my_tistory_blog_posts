<h2 data-ke-size="size26">lodash 의 debounce</h2>
<p data-ke-size="size16">사용자의 반복 클릭을 막아야 하는 상황은 흔하게 발생하고, 기법으로는 쓰로틀링과 디바운싱이 대표적입니다.<br />이번에는 디바운싱(마지막 이벤트 이 후 특정시간 동안 이벤트가 발생하지 않을때 함수 호출)을 알아보려고 합니다.<br />대표적으로 <code>lodash</code> 라이브러리의 <code>debounce</code> 함수를 사용하면 디바운싱을 적용할 수 있습니다.</p>
<h4 data-ke-size="size20">설치:</h4>
<pre class="cmake"><code>npm install lodash</code></pre>
<h4 data-ke-size="size20">예제 코드</h4>
<p data-ke-size="size16"><code>debounce</code>를 사용하여 <code>updateMemo</code> 호출을 지연시키고, <code>useEffect</code>를 통해 <code>text</code> 상태가 변경될 때만 렌더링하도록 합니다.</p>
<pre class="javascript"><code>import { useState, useEffect, ChangeEvent } from "react";
import { useMemoApp } from "@/hooks/useMemoApp";
import { debounce } from "lodash";
import styled from "styled-components";
<p>function Article() {
const { memos, selected, updateMemo } = useMemoApp();
const [text, setText] = useState(&quot;&quot;);
const textAreaRef = useRef&lt;HTMLTextAreaElement | null&gt;(null);</p>
<pre><code>debounce((input: string) =&amp;gt; {
    updateMemo(input);
}, 500)

const handleChange = (e: ChangeEvent&amp;lt;HTMLTextAreaElement&amp;gt;) =&amp;gt; {
    const input = e.target.value;
    setText(input);
    debounce((input: string) =&amp;gt; {
        updateMemo(input);
    }, 500) // 입력이 멈춘 후 500ms 후에 updateMemo 호출
};

const handleKeyUp = () =&amp;gt; {
    console.log(&quot;key up&quot;);
};

useEffect(() =&amp;gt; {
    const selectedMemo = memos.find((memo) =&amp;gt; memo.id === selected);
    if (selectedMemo) {
        setText(selectedMemo.contents);
    }
}, [memos, selected]);

useEffect(() =&amp;gt; {
    if (textAreaRef.current) textAreaRef.current.focus();
}, []);

return (
    &amp;lt;StyledArticle&amp;gt;
        &amp;lt;StyledSpan&amp;gt;{new Date().toLocaleString()}&amp;lt;/StyledSpan&amp;gt;
        &amp;lt;StyledTextArea
            ref={textAreaRef}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            value={text}
        /&amp;gt;
    &amp;lt;/StyledArticle&amp;gt;
);
</code></pre>
<p>}</p>
<p>export default Article;</code></pre></p>
<h3 data-ke-size="size23">debounce 와 useRef 함께 사용</h3>
<p data-ke-size="size16">하지만 위 방식으로 lodash의 debounce 를 적용하는 과정에서 타이머가 계속 재설정되는 문제를 만났습니다.<br />이 문제를 해결하기 위해 useMemo, useRef 훅 중에서 고민하다가 useRef 가 더 적합한 방법이라고 판단했습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>useRef</code>를 사용하여 <code>debounce</code> 함수의 인스턴스를 유지하려고 한 이유는, 컴포넌트가 리렌더링될 때마다 새로운 <code>debounce</code> 함수가 생성되지 않도록 하기 위해서 입니다. <code>debounce</code> 함수는 호출될 때마다 새로운 타이머를 설정하므로, 컴포넌트가 리렌더링될 때마다 새로운 <code>debounce</code> 함수가 생성되면, 의도하지 않은 동작이 발생합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>useRef</code>를 사용하면 컴포넌트가 리렌더링되어도 <code>debounce</code> 함수의 인스턴스는 유지됩니다.<br />따라서 동일한 <code>debounce</code> 함수가 계속 사용되어, 입력이 멈춘 후 설정한 밀리세컨드 동안 새로운 입력이 없을 때만 <code>updateMemo</code>가 호출됩니다.</p>
<h3 data-ke-size="size23">이유 1: 동일한 함수 인스턴스 유지</h3>
<pre class="moonscript"><code>const debouncedUpdateMemo = useRef(
    debounce((input: string) =&gt; {
        updateMemo(input);
    }, 500)
).current;</code></pre>
<p data-ke-size="size16">이 코드는 <code>debouncedUpdateMemo</code>가 컴포넌트의 생명주기 동안 동일한 <code>debounce</code> 함수 인스턴스를 유지하도록 합니다. <code>useRef</code>는 컴포넌트가 리렌더링될 때도 변경되지 않는 값을 유지할 수 있습니다. 따라서 <code>debouncedUpdateMemo</code>는 컴포넌트가 리렌더링되어도 동일한 <code>debounce</code> 함수 인스턴스를 가리키게 됩니다.</p>
<h3 data-ke-size="size23">이유 2: 불필요한 리렌더링 방지</h3>
<p data-ke-size="size16">만약 <code>debounce</code> 함수를 <code>useEffect</code>나 다른 방식으로 매번 생성한다면, 컴포넌트가 리렌더링될 때마다 새로운 <code>debounce</code> 함수가 생성되어 불필요한 타이머가 설정되고, 이전 타이머는 무효화될 수 있습니다. 이를 방지하기 위해 <code>useRef</code>를 사용하여 동일한 <code>debounce</code> 함수 인스턴스를 유지합니다.</p>
<h3 data-ke-size="size23">코드 예시</h3>
<pre class="javascript"><code>import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useMemoApp } from "@/hooks/useMemoApp";
import { debounce } from "lodash";
import styled from "styled-components";
<p>function Article() {
const { memos, selected, updateMemo } = useMemoApp();
const [text, setText] = useState(&quot;&quot;);
const textAreaRef = useRef&lt;HTMLTextAreaElement | null&gt;(null);</p>
<pre><code>// useRef를 사용하여 debounce 함수 인스턴스를 유지
const debouncedUpdateMemo = useRef(
    debounce((input: string) =&amp;gt; {
        updateMemo(input);
    }, 500)
).current;

const handleChange = (e: ChangeEvent&amp;lt;HTMLTextAreaElement&amp;gt;) =&amp;gt; {
    const input = e.target.value;
    setText(input);
    debouncedUpdateMemo(input); // 입력이 멈춘 후 500ms 후에 updateMemo 호출
};

const handleKeyUp = () =&amp;gt; {
    console.log(&quot;key up&quot;);
};

useEffect(() =&amp;gt; {
    const selectedMemo = memos.find((memo) =&amp;gt; memo.id === selected);
    if (selectedMemo) {
        setText(selectedMemo.contents);
    }
}, [memos, selected]);

useEffect(() =&amp;gt; {
    if (textAreaRef.current) textAreaRef.current.focus();
}, []);

return (
    &amp;lt;StyledArticle&amp;gt;
        &amp;lt;StyledSpan&amp;gt;{new Date().toLocaleString()}&amp;lt;/StyledSpan&amp;gt;
        &amp;lt;StyledTextArea
            ref={textAreaRef}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            value={text}
        /&amp;gt;
    &amp;lt;/StyledArticle&amp;gt;
);
</code></pre>
<p>}</p>
<p>export default Article;</p>
<p>const StyledArticle = styled.article<code>    display: flex;     flex-direction: column;     padding: 20px;     width: 100%;</code>;</p>
<p>const StyledSpan = styled.span<code>    color: rgb(128, 128, 128);     font-size: 10px;     margin: 0px auto 24px;</code>;</p>
<p>const StyledTextArea = styled.textarea<code>    all: unset;     flex-grow: 1;     font-size: 15px;     line-height: 1.66;</code>;</code></pre></p>
<h3 data-ke-size="size23">요약</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>useRef</code>를 사용하여 <code>debounce</code> 함수의 인스턴스를 컴포넌트 생명주기 동안 유지합니다.</li>
<li>이를 통해 컴포넌트가 리렌더링될 때마다 새로운 <code>debounce</code> 함수가 생성되지 않도록 합니다.</li>
<li>이는 불필요한 타이머 생성과 무효화를 방지하고, 의도한 대로 <code>debounce</code>가 작동하도록 보장합니다.</li>
</ul>