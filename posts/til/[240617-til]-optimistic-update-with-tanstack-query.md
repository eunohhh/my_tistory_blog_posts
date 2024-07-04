<h2 data-ke-size="size26">useMutation, Optimistic Update 패턴</h2>
<p data-ke-size="size16"><code>useMutation</code> 훅은 비동기 작업(특히 서버에 데이터를 추가, 수정, 삭제하는 작업)을 처리할 때 사용됩니다.<br />이 예제에서는 <code>addTodo</code> 함수가 서버에 새로운 할 일을 추가하는 비동기 작업을 수행합니다.<br /><code>useMutation</code> 훅을 사용하여 이러한 작업의 상태(성, 실패, 진행 중 등)를 관리하고, 해당 작업이 애플리케이션의 상태에 미치는 영향을 제어할 수 있습니다.</p>
<h3 data-ke-size="size23">주요 콜백 및 설정</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>mutationFn</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>mutationFn</code>은 실제로 변이를 수행하는 비동기 함수입니다. 여기서는 <code>addTodo</code> 함수가 이 역할을 합니다.</li>
</ul>
</li>
<li><b>onMutate</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>onMutate</code>는 변이가 시작될 때 호출됩니다.</li>
<li>서버에 요청을 보내기 전에 로컬 상태를 업데이트하여 응답 지연을 사용자에게 숨기기 위한 낙관적 업데이트(Optimistic Update)를 수행합니다.</li>
<li>쿼리를 취소하여 경쟁 상태를 방지하고, 현재의 <code>todos</code> 상태를 가져와 이전 상태로 되돌릴 수 있도록 저장합니다.</li>
<li><code>queryClient.setQueryData</code>를 사용하여 로컬 상태를 즉시 업데이트합니다.</li>
<li>반환된 객체(<code>previousTodos</code>)는 <code>onError</code> 또는 <code>onSettled</code>에서 사용할 수 있습니다.</li>
</ul>
</li>
<li><b>onError</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>변이가 실패했을 때 호출됩니다.</li>
<li>낙관적 업데이트로 인해 변경된 로컬 상태를 이전 상태로 복원합니다.</li>
<li><code>context</code> 매개변수는 <code>onMutate</code>에서 반환된 값을 포함합니다.</li>
</ul>
</li>
<li><b>onSettled</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>변이가 성공하든 실패하든 상관없이 변이가 끝나면 호출됩니다.</li>
<li><code>invalidateQueries</code>를 사용하여 <code>todos</code> 쿼리를 무효화하여, 서버에서 최신 데이터를 다시 가져오도록 합니다.</li>
</ul>
</li>
</ol>
<h3 data-ke-size="size23">예시 코드</h3>
<pre class="typescript"><code>const addMutation = useMutation({
    mutationFn: addTodo, // 실제 변이 함수
    onMutate: async (newTodo) =&gt; {
        console.log("onMutate 호출");
        await queryClient.cancelQueries({ queryKey: ["todos"] }); // 쿼리 취소
<pre><code>    const previousTodos = queryClient.getQueryData([&quot;todos&quot;]); // 현재 상태 저장

    queryClient.setQueryData([&quot;todos&quot;], (old) =&amp;gt; [...old, newTodo]); // 낙관적 업뎃

    return { previousTodos }; // 이전 상태 반환
},
onError: (err, newTodo, context) =&amp;gt; {
    console.log(&quot;onError&quot;);
    console.log(&quot;context:&quot;, context);
    queryClient.setQueryData([&quot;todos&quot;], context.previousTodos); // 오류 시 이전 상태 복원
},
onSettled: () =&amp;gt; {
    console.log(&quot;onSettled&quot;);
    queryClient.invalidateQueries({ queryKey: [&quot;todos&quot;] }); // 변이 후 쿼리 무효화
},
</code></pre>
<p>});</code></pre></p>
<h3 data-ke-size="size23">각 단계의 의미</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>onMutate</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>변이가 시작될 때 호출되며, 이 시점에서 쿼리를 취소하여 현재 요청이 충돌하지 않도록 합니다.</li>
<li>현재 <code>todos</code> 데이터를 가져와 저장한 후, 낙관적 업데이트를 수행하여 UI를 즉시 업데이트합니다.</li>
<li>낙관적 업데이트는 사용자 경험을 향상시킵니다. 서버 응답을 기다리는 동안 사용자에게 즉각적인 피드백을 제공합니다.</li>
</ul>
</li>
<li><b>onError</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>서버에 변이 요청이 실패하면 호출됩니다.</li>
<li>낙관적 업데이트로 변경된 상태를 원래 상태로 되돌립니다.</li>
<li><code>context</code> 매개변수를 통해 <code>onMutate</code>에서 반환된 <code>previousTodos</code>를 사용합니다.</li>
</ul>
</li>
<li><b>onSettled</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>변이가 성공하든 실패하든 무조건 호출됩니다.</li>
<li>쿼리를 무효화하여 서버에서 최신 데이터를 다시 가져오도록 합니다.</li>
</ul>
</li>
</ol>
<h3 data-ke-size="size23">전체 프로세스 요약</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>변이 시작</b>: <code>onMutate</code>가 호출되어 쿼리를 취소하고 낙관적 업데이트를 수행합니다.</li>
<li><b>변이 중</b>: 서버에 실제로 데이터를 추가합니다(<code>mutationFn</code>).</li>
<li><b>변이 성공/실패</b>: 변이 성공 시 <code>onSettled</code>가 호출되고, 실패 시 <code>onError</code>가 호출됩니다. 두 경우 모두 <code>onSettled</code>에서 쿼리를 무효화하여 최신 데이터를 가져옵니다.</li>
</ol>
<p data-ke-size="size16">이렇게 하면 서버와의 상호작용에서 더 나은 사용자 경험을 제공하고, 상태 관리가 간편해집니다.</p>
<h2 data-ke-size="size26">setQueryData의 시점</h2>
<p data-ke-size="size16">이렇게 하면 <code>previousTodos</code>에 <code>newTodo</code>가 추가되지 않습니다.<br /><code>previousTodos</code>는 <code>setQueryData</code>를 호출하기 전에 현재 상태를 저장한 것이기 때문입니다. <code>queryClient.getQueryData(["todos"])</code>는 현재 쿼리의 데이터를 반환하며, 이는 <code>setQueryData</code>를 호출하기 전에 실행되므로 <code>newTodo</code>가 추가되기 전의 상태입니다.</p>
<p data-ke-size="size16">이것은 <code>previousTodos</code>가 <code>setQueryData</code> 호출 이후 상태 변경에 영향을 받지 않는 이유를 설명합니다. <code>previousTodos</code>는 <code>onError</code> 핸들러에서 상태를 복원하는 데 사용됩니다.</p>
<h3 data-ke-size="size23">자세한 설명</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>현재 상태 저장</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이 줄은 <code>setQueryData</code>를 호출하기 전에 현재 <code>todos</code> 상태를 <code>previousTodos</code> 변수에 저장합니다.</li>
<li>이 시점에서 <code>previousTodos</code>에는 <code>newTodo</code>가 포함되지 않습니다.</li>
</ul>
</li>
<li><code class="language-javascript"> const previousTodos = queryClient.getQueryData(["todos"]);</code></li>
<li><b>낙관적 업데이트</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이 줄은 <code>todos</code> 쿼리 데이터를 즉시 업데이트합니다. <code>old</code>는 현재 상태를 나타내며, <code>newTodo</code>를 추가하여 새로운 상태를 생성합니다.</li>
<li>이 업데이트는 <code>queryClient</code>의 내부 캐시에만 영향을 미칩니다.</li>
</ul>
</li>
<li><code class="language-javascript"> queryClient.setQueryData(["todos"], (old) =&gt; [...old, newTodo]);</code></li>
<li><b>이전 상태 반환</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이 줄은 <code>onMutate</code> 콜백에서 <code>previousTodos</code>를 반환합니다.</li>
<li><code>previousTodos</code>는 <code>onMutate</code>가 호출된 시점에서의 상태를 나타내며, 이는 <code>newTodo</code>가 추가되기 전의 상태입니다.</li>
</ul>
</li>
<li><code class="language-javascript"> return { previousTodos };</code></li>
</ol>
<h3 data-ke-size="size23">예제 코드</h3>
<pre class="typescript"><code>const addMutation = useMutation({
    mutationFn: addTodo,
    onMutate: async (newTodo) =&gt; {
      console.log("onMutate 호출");
      await queryClient.cancelQueries({ queryKey: ["todos"] });
<pre><code>  // 현재 상태 저장
  const previousTodos = queryClient.getQueryData([&quot;todos&quot;]);

  // 낙관적 업데이트
  queryClient.setQueryData([&quot;todos&quot;], (old) =&amp;gt; [...old, newTodo]);

  // 이전 상태 반환
  return { previousTodos };
},
onError: (err, newTodo, context) =&amp;gt; {
  console.log(&quot;onError&quot;);
  console.log(&quot;context:&quot;, context);

  // 오류 시 이전 상태 복원
  queryClient.setQueryData([&quot;todos&quot;], context.previousTodos);
},
onSettled: () =&amp;gt; {
  console.log(&quot;onSettled&quot;);

  // 변이 후 쿼리 무효화
  queryClient.invalidateQueries({ queryKey: [&quot;todos&quot;] });
},
</code></pre>
<p>});</code></pre></p>
<h3 data-ke-size="size23">요약</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>previousTodos</code>는 <code>setQueryData</code> 호출 전에 저장된 상태</b>이며, <code>newTodo</code>를 포함하지 않습니다.</li>
<li><code>setQueryData</code>는 <code>queryClient</code>의 내부 캐시에만 영향을 미칩니다.</li>
<li><code>previousTodos</code>는 <code>onError</code>에서 상태를 복원하는 데 사용됩니다.</li>
</ul>
<p data-ke-size="size16">이렇게 하면 <code>onMutate</code>와 <code>onError</code> 핸들러가 적절하게 동작하고, 낙관적 업데이트를 통해 사용자 경험을 향상시키면서도 오류 시 상태를 원래대로 복원할 수 있습니다.</p>