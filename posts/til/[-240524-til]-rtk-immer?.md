<p data-ke-size="size16">오늘은 Redux Toolkit 사용 중에 궁금한 것이 생겨 정리해 보려고 합니다.<br />보통 리액트에서 setState 를 할 때는 불변성 관리를 위해 ... 펼침연산자를 사용해 원본 객체를<br />건드리지 않는게 일반적이라고 알고 있습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그런데 Redux Toolkit 에서는 원본배열에 push 한다거나 하는 패턴이 나타납니다.<br />이것이 궁금하여 조사해 보았습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">결과적으로 Redux Toolkit은 Immer를 내부적으로 사용하여 불변성을 자동으로 관리해준다고 합니다.<br />이를 통해 개발자는 불변성을 직접 관리할 필요 없이, 더 간단하고 직관적인 방식으로 상태를 업데이트할 수 있습니다.</p>
<h3 data-ke-size="size23">Immer와 Redux Toolkit</h3>
<p data-ke-size="size16">Redux Toolkit은 <code>createSlice</code>와 같은 함수를 사용할 때 Immer를 사용합니다.<br />Immer는 상태를 직접 수정하는 것처럼 보이지만, 실제로는 불변성을 유지하면서 상태를 업데이트하는 라이브러리입니다. 즉, <code>state</code> 객체를 직접 수정하는 것처럼 코드를 작성하더라도, Immer가 이를 감지하고 불변성을 유지하면서 새로운 상태를 생성합니다.</p>
<h3 data-ke-size="size23">예제 코드</h3>
<p data-ke-size="size16"><code>reducers</code> 부분에서 <code>push</code>를 사용하거나, <code>find</code>와 같은 메서드를 사용하여 상태를 직접 수정하는 것처럼 보이지만, Immer가 이를 처리하여 불변성을 유지합니다.</p>
<pre class="pf"><code>const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addToDo: (state, action: PayloadAction&lt;ToDo&gt;) =&gt; {
      state.items.push(action.payload); // Immer가 불변성을 관리
    },
    deleteToDo: (state, action: PayloadAction&lt;string&gt;) =&gt; {
      state.items = state.items.filter(
        (todo) =&gt; todo.id !== action.payload
      ); // Immer가 불변성을 관리
    },
    toggleIsDone: (state, action: PayloadAction&lt;string&gt;) =&gt; {
      const todo = state.items.find((todo) =&gt; todo.id === action.payload);
      if (todo) {
        todo.isDone = !todo.isDone; // Immer가 불변성을 관리
      }
    },
  },
  extraReducers: (builder) =&gt; {
    builder
      .addCase(fetchTodos.pending, (state) =&gt; {
        state.loading = true;
      })
      .addCase(fetchTodos.fulfilled, (state, action: PayloadAction&lt;ToDo[]&gt;) =&gt; {
        state.loading = false;
        state.items = action.payload; // Immer가 불변성을 관리
      })
      .addCase(fetchTodos.rejected, (state, action) =&gt; {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch todos';
      });
  }
});</code></pre>
<h3 data-ke-size="size23">Immer 없이 상태 업데이트</h3>
<p data-ke-size="size16">만약 Redux Toolkit을 사용하지 않고, 불변성을 직접 관리해야 하는 경우, 다음과 같이 코드를 작성해야 합니다.</p>
<pre class="pf"><code>const addToDo = (state, action) =&gt; {
  return {
    ...state,
    items: [...state.items, action.payload]
  };
};
<p>const deleteToDo = (state, action) =&gt; {
return {
...state,
items: state.items.filter(todo =&gt; todo.id !== action.payload)
};
};</p>
<p>const toggleIsDone = (state, action) =&gt; {
return {
...state,
items: state.items.map(todo =&gt;
todo.id === action.payload ? { ...todo, isDone: !todo.isDone } : todo
)
};
};</code></pre></p>
<h3 data-ke-size="size23">결론</h3>
<p data-ke-size="size16">Redux Toolkit을 사용하면 Immer가 불변성을 자동으로 관리해주기 때문에 상태를 직접 수정하는 것처럼 코드를 작성할 수 있습니다. 이는 코드를 더 간결하고 이해하기 쉽게 만들어줍니다. 따라서 Redux Toolkit을 사용할 때는 불변성을 직접 관리하지 않아도 되며, Immer가 이를 자동으로 처리해줍니다.</p>