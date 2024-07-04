<p>오늘은 전역 상태관리 라이브러리인 Redux 그리고 사용성을 강화한<br>Redux Toolkit 의 기본에 대해 정리해보려고 합니다.</p>
<h3>1. Redux 설치</h3>
<p>먼저 필요한 패키지를 설치합니다.</p>
<pre><code class="language-bash">npm install @reduxjs/toolkit react-redux</code></pre>
<h3>2. 기본적인 파일 구조</h3>
<pre><code class="language-plaintext">src/
├── store/
│   ├── todoSlice.ts
│   └── store.ts
├── App.tsx
└── index.tsx</code></pre>
<h3>3. store.ts 설정</h3>
<p>store.ts` 파일을 생성하고 다음과 같이 설정합니다.</p>
<pre><code class="language-typescript">// store.ts
import { configureStore } from &#39;@reduxjs/toolkit&#39;;
import todoSlice from &#39;./todoSlice&#39;;
<p>export const store = configureStore({
reducer: {
todos: todoSlice,
},
});</p>
<p>export type RootState = ReturnType&lt;typeof store.getState&gt;;
export type AppDispatch = typeof store.dispatch;</code></pre></p>
<h3>4. slice.ts 설정</h3>
<p>todoSlice.ts` 파일을 생성하고 다음과 같이 설정합니다.</p>
<pre><code class="language-typescript">// todoSlice.ts
import { createSlice, PayloadAction } from &#39;@reduxjs/toolkit&#39;;
import { RootState } from &#39;../../app/store&#39;;
import { ToDo } from &quot;../d&quot;;
<p>interface ToDoState {
toDos: ToDo[];
}</p>
<p>const initialState: ToDoState = {
toDos: []
};</p>
<p>const todoSlice = createSlice({
name: 'todos',
initialState,
reducers: {
addToDo: (state, action: PayloadAction&lt;ToDo&gt;) =&gt; {
state.toDos.push(action.payload);
},
deleteToDo: (state, action: PayloadAction&lt;string&gt;) =&gt; {
state.toDos = state.toDos.filter(
(todo) =&gt; todo.id !== action.payload
);
},
toggleIsDone: (state, action: PayloadAction&lt;string&gt;) =&gt; {
const todo = state.toDos.find((todo) =&gt; todo.id === action.payload);
if (todo) {
todo.isDone = !todo.isDone;
}
},
},
});</p>
<p>export const { addToDo, deleteToDo, toggleIsDone } = todoSlice.actions;
export default todoSlice.reducer;</code></pre></p>
<h3>5. Counter 컴포넌트 설정</h3>
<p>.tsx` 파일을 생성하고 다음과 같이 설정합니다.</p>
<pre><code class="language-typescript">// TodoContainer.tsx
import { useDispatch, useSelector } from &quot;react-redux&quot;;
import &quot;../../App.css&quot;;
import { ToDo } from &quot;../../d&quot;;
import { AppDispatch, RootState } from &quot;../../store/store&quot;;
import {
addToDo,
deleteToDo,
fetchToDos,
toggleIsDone,
} from &quot;../../store/todoSlice&quot;;
import CardList from &quot;../CardList&quot;;
import Form from &quot;../Form&quot;;import { useEffect } from &quot;react&quot;;
<p>const TodoContainer: React.FC = () =&gt; {
const dispatch: AppDispatch = useDispatch();
const { toDos, loading, error } = useSelector(
(state: RootState) =&gt; state.toDos
);</p>
<p>//...하략...</code></pre></p>
<h3>6. main.tsx 설정</h3>
<p><code>src/main.tsx</code> 파일에서 Redux Store를 Provider로 감싸줍니다.</p>
<pre><code class="language-typescript">// src/main.tsx
import React from &#39;react&#39;;
import ReactDOM from &#39;react-dom&#39;;
import { Provider } from &#39;react-redux&#39;;
import { store } from &#39;./app/store&#39;;
import App from &#39;./App&#39;;
<p>ReactDOM.render(
&lt;Provider store={store}&gt;
&lt;App /&gt;
&lt;/Provider&gt;,
document.getElementById('root')
);</code></pre></p>
<p>이제 애플리케이션을 실행하면 기본적인 Redux Toolkit을 사용한 전역 상태 관리를 확인할 수 있습니다.<br>필요한 경우 더 복잡한 상태 관리 및 비동기 작업을 추가할 수 있습니다.</p>