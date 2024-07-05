<h2>Redux Thunk</h2>
<p>ㄱRedux Thunk는 Redux에서 비동기 작업을 처리하기 위한 미들웨어입니다. Redux는 기본적으로 동기적으로 상태를 관리하지만, 비동기 작업(예: API 호출, 타이머, 파일 읽기 등)을 처리할 수 있는 기능이 내장되어 있지 않습니다. Redux Thunk를 사용하면 이러한 비동기 작업을 처리할 수 있습니다.</p>
<h3>Redux Thunk의 역할</h3>
<ol>
<li><strong>비동기 액션 처리</strong>: Redux Thunk를 사용하면 액션 생성자가 함수를 반환할 수 있습니다. 이 함수는 비동기 작업을 수행하고, 필요에 따라 디스패치를 여러 번 호출하여 상태를 업데이트할 수 있습니다.</li>
<li><strong>로직 캡슐화</strong>: 비동기 로직이나 조건부 로직을 액션 생성자 내부에 캡슐화하여, 컴포넌트가 간결해지고 비즈니스 로직이 분리됩니다.</li>
</ol>
<h3>기본 개념</h3>
<p>Redux Thunk는 함수 형태의 액션을 디스패치할 수 있게 합니다. 이 함수는 <code>dispatch</code>와 <code>getState</code>를 매개변수로 받아서, 비동기 작업을 수행하고 필요한 시점에 디스패치를 호출하여 상태를 업데이트합니다.</p>
<h3>설치</h3>
<p>Redux Thunk를 설치하려면 다음 명령어를 사용합니다:</p>
<pre><code class="language-bash">npm install redux-thunk</code></pre>
<h3>기본 사용법</h3>
<ol>
<li><strong>스토어 설정</strong>: Redux Thunk를 미들웨어로 적용합니다.</li>
</ol>
<pre><code class="language-javascript">// store.js
import { createStore, applyMiddleware } from &#39;redux&#39;;
import thunk from &#39;redux-thunk&#39;;
import rootReducer from &#39;./reducers&#39;;
<p>const store = createStore(rootReducer, applyMiddleware(thunk));</p>
<p>export default store;</code></pre></p>
<ol start="2">
<li><strong>비동기 액션 생성자</strong>: 비동기 작업을 수행하는 액션 생성자를 작성합니다.</li>
</ol>
<pre><code class="language-javascript">// actions.js
import axios from &#39;axios&#39;;
<p>export const fetchTodosRequest = () =&gt; ({
type: 'FETCH_TODOS_REQUEST'
});</p>
<p>export const fetchTodosSuccess = (todos) =&gt; ({
type: 'FETCH_TODOS_SUCCESS',
payload: todos
});</p>
<p>export const fetchTodosFailure = (error) =&gt; ({
type: 'FETCH_TODOS_FAILURE',
payload: error
});</p>
<p>export const fetchTodos = () =&gt; {
return async (dispatch) =&gt; {
dispatch(fetchTodosRequest());
try {
const response = await axios.get('http://localhost:3001/todos');
dispatch(fetchTodosSuccess(response.data));
} catch (error) {
dispatch(fetchTodosFailure(error.message));
}
};
};</code></pre></p>
<ol start="3">
<li><strong>리듀서</strong>: 액션 타입에 따라 상태를 업데이트합니다.</li>
</ol>
<pre><code class="language-javascript">// reducer.js
const initialState = {
  loading: false,
  todos: [],
  error: &#39;&#39;
};
<p>const todoReducer = (state = initialState, action) =&gt; {
switch (action.type) {
case 'FETCH_TODOS_REQUEST':
return {
...state,
loading: true
};
case 'FETCH_TODOS_SUCCESS':
return {
loading: false,
todos: action.payload,
error: ''
};
case 'FETCH_TODOS_FAILURE':
return {
loading: false,
todos: [],
error: action.payload
};
default:
return state;
}
};</p>
<p>export default todoReducer;</code></pre></p>
<ol start="4">
<li><strong>컴포넌트에서 디스패치</strong>: 컴포넌트에서 비동기 액션을 디스패치합니다.</li>
</ol>
<pre><code class="language-javascript">// ToDoContainer.jsx
import React, { useEffect } from &#39;react&#39;;
import { useSelector, useDispatch } from &#39;react-redux&#39;;
import { fetchTodos } from &#39;./actions&#39;;
import Form from &#39;./Form&#39;;
import CardList from &#39;./CardList&#39;;
<p>const ToDoContainer = () =&gt; {
const dispatch = useDispatch();
const { loading, todos, error } = useSelector((state) =&gt; state.todos);</p>
<p>useEffect(() =&gt; {
dispatch(fetchTodos());
}, [dispatch]);</p>
<p>if (loading) {
return &lt;div&gt;Loading...&lt;/div&gt;;
}</p>
<p>if (error) {
return &lt;div&gt;Error: {error}&lt;/div&gt;;
}</p>
<p>const addToDo = (newTodo) =&gt;
setToDos((prevToDos) =&gt; prevToDos &amp;&amp; [...prevToDos, newTodo]);</p>
<p>const deleteToDo = (toDoId) =&gt;
setToDos((prevToDos) =&gt; prevToDos &amp;&amp; prevToDos.filter((todo) =&gt; todo.id !== toDoId));</p>
<p>const toggleIsDone = (toDoId) =&gt;
setToDos((prevToDos) =&gt;
prevToDos &amp;&amp;
prevToDos.map((todo) =&gt;
todo.id === toDoId ? { ...todo, isDone: !todo.isDone } : todo
)
);</p>
<p>const workingToDos = (todos || []).filter((todo) =&gt; !todo.isDone);
const doneToDos = (todos || []).filter((todo) =&gt; todo.isDone);</p>
<p>return (
&lt;div className=&quot;top_wrapper&quot;&gt;
&lt;header className=&quot;my_header&quot;&gt;
&lt;h3&gt;My Todo List&lt;/h3&gt;
&lt;p&gt;React&lt;/p&gt;
&lt;/header&gt;
&lt;Form addToDo={addToDo} /&gt;
&lt;section className=&quot;content_section&quot;&gt;
&lt;CardList
title={&quot;Working... &quot;}
toDos={workingToDos}
deleteToDo={deleteToDo}
toggleIsDone={toggleIsDone}
/&gt;
&lt;CardList
title={&quot;Done... &quot;}
toDos={doneToDos}
deleteToDo={deleteToDo}
toggleIsDone={toggleIsDone}
/&gt;
&lt;/section&gt;
&lt;/div&gt;
);
};</p>
<p>export default ToDoContainer;</code></pre></p>
<h3>결론</h3>
<p>Redux Thunk는 비동기 작업을 처리하는 간단하고 강력한 방법을 제공합니다. 이를 통해 Redux 스토어에서 비동기 로직을 처리할 수 있으며, 비동기 작업을 수행한 후 상태를 업데이트할 수 있습니다. 이를 통해 Redux 애플리케이션에서 비동기 작업을 보다 쉽게 관리할 수 있습니다.</p>
<h2>Redux Toolkit</h2>
<p>Redux Toolkit을 사용하면 Redux의 보일러플레이트 코드를 줄이고, 비동기 작업을 쉽게 처리할 수 있습니다.<br>Redux Thunk는 Redux Toolkit에 기본적으로 포함되어 있습니다. </p>
<h3>1. 설치</h3>
<p>먼저 Redux Toolkit과 React Redux를 설치합니다.</p>
<pre><code class="language-bash">npm install @reduxjs/toolkit react-redux</code></pre>
<h3>2. 스토어 설정</h3>
<p><code>store.js</code> 파일을 생성하고 스토어를 설정합니다.</p>
<pre><code class="language-javascript">// store.js
import { configureStore } from &#39;@reduxjs/toolkit&#39;;
import todoReducer from &#39;./todoSlice&#39;;
<p>const store = configureStore({
reducer: {
todos: todoReducer
}
});</p>
<p>export default store;</code></pre></p>
<h3>3. 슬라이스 생성</h3>
<p><code>todoSlice.js</code> 파일을 생성하고 슬라이스를 설정합니다.</p>
<pre><code class="language-javascript">// todoSlice.js
import { createSlice, createAsyncThunk } from &#39;@reduxjs/toolkit&#39;;
import axios from &#39;axios&#39;;
<p>// 비동기 Thunk 액션 생성
export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () =&gt; {
const response = await axios.get('http://localhost:3001/todos');
return response.data;
});</p>
<p>const todoSlice = createSlice({
name: 'todos',
initialState: {
items: [],
loading: false,
error: null
},
reducers: {
addToDo: (state, action) =&gt; {
state.items.push(action.payload);
},
deleteToDo: (state, action) =&gt; {
state.items = state.items.filter(todo =&gt; todo.id !== action.payload);
},
toggleIsDone: (state, action) =&gt; {
const todo = state.items.find(todo =&gt; todo.id === action.payload);
if (todo) {
todo.isDone = !todo.isDone;
}
}
},
extraReducers: (builder) =&gt; {
builder
.addCase(fetchTodos.pending, (state) =&gt; {
state.loading = true;
})
.addCase(fetchTodos.fulfilled, (state, action) =&gt; {
state.loading = false;
state.items = action.payload;
})
.addCase(fetchTodos.rejected, (state, action) =&gt; {
state.loading = false;
state.error = action.error.message;
});
}
});</p>
<p>export const { addToDo, deleteToDo, toggleIsDone } = todoSlice.actions;
export default todoSlice.reducer;</code></pre></p>
<h3>4. 컴포넌트 수정</h3>
<p><code>ToDoContainer.jsx</code> 파일을 수정하여 Redux Toolkit과 연동합니다.</p>
<pre><code class="language-javascript">// ToDoContainer.jsx
import React, { useEffect } from &#39;react&#39;;
import { useSelector, useDispatch } from &#39;react-redux&#39;;
import { fetchTodos, addToDo, deleteToDo, toggleIsDone } from &#39;./todoSlice&#39;;
import Form from &#39;./Form&#39;;
import CardList from &#39;./CardList&#39;;
<p>const ToDoContainer = () =&gt; {
const dispatch = useDispatch();
const { items: todos, loading, error } = useSelector((state) =&gt; state.todos);</p>
<p>useEffect(() =&gt; {
dispatch(fetchTodos());
}, [dispatch]);</p>
<p>const handleAddToDo = (newTodo) =&gt; {
dispatch(addToDo(newTodo));
};</p>
<p>const handleDeleteToDo = (toDoId) =&gt; {
dispatch(deleteToDo(toDoId));
};</p>
<p>const handleToggleIsDone = (toDoId) =&gt; {
dispatch(toggleIsDone(toDoId));
};</p>
<p>if (loading) {
return &lt;div&gt;Loading...&lt;/div&gt;;
}</p>
<p>if (error) {
return &lt;div&gt;Error: {error}&lt;/div&gt;;
}</p>
<p>const workingToDos = todos.filter((todo) =&gt; !todo.isDone);
const doneToDos = todos.filter((todo) =&gt; todo.isDone);</p>
<p>return (
&lt;div className=&quot;top_wrapper&quot;&gt;
&lt;header className=&quot;my_header&quot;&gt;
&lt;h3&gt;My Todo List&lt;/h3&gt;
&lt;p&gt;React&lt;/p&gt;
&lt;/header&gt;
&lt;Form addToDo={handleAddToDo} /&gt;
&lt;section className=&quot;content_section&quot;&gt;
&lt;CardList
title={&quot;Working... &quot;}
toDos={workingToDos}
deleteToDo={handleDeleteToDo}
toggleIsDone={handleToggleIsDone}
/&gt;
&lt;CardList
title={&quot;Done... &quot;}
toDos={doneToDos}
deleteToDo={handleDeleteToDo}
toggleIsDone={handleToggleIsDone}
/&gt;
&lt;/section&gt;
&lt;/div&gt;
);
};</p>
<p>export default ToDoContainer;</code></pre></p>
<h3>5. Provider 설정</h3>
<p><code>index.js</code> 파일에서 Redux Provider를 설정합니다.</p>
<pre><code class="language-javascript">// index.js
import React from &#39;react&#39;;
import ReactDOM from &#39;react-dom&#39;;
import { Provider } from &#39;react-redux&#39;;
import store from &#39;./store&#39;;
import App from &#39;./App&#39;;
<p>ReactDOM.render(
&lt;Provider store={store}&gt;
&lt;App /&gt;
&lt;/Provider&gt;,
document.getElementById('root')
);</code></pre></p>
<p>Redux Toolkit을 사용하여 리액트 애플리케이션에서 비동기 작업을 처리하고, 상태를 관리할 수 있습니다. <code>fetchTodos</code> Thunk를 사용하여 비동기적으로 데이터를 가져오고, 이를 상태에 반영하는 작업을 쉽게 수행할 수 있습니다.</p>