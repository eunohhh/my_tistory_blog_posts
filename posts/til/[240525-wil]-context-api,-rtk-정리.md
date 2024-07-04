<p data-ke-size="size16">폭풍같은 한 주가 지나갔습니다!<br />한 주를 정리하며 이번 주의 메인 테마(?) 였던 Context API 와 Redux-Toolkit 의 사용법을 다시한번 정리해 보려고 합니다.</p>
<h2 data-ke-size="size26">Context API</h2>
<h3 data-ke-size="size23">기본설정</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>Context 생성 : <code>createContext()</code></li>
<li>Provider 로 상위 컴포넌트 감싸기 : <code>&lt;콘텍스트명.Provider&gt;&lt;/콘텍스트명.Provider&gt;</code></li>
<li>사용할 컴포넌트에서 사용 : <code>useContext(콘텍스트명)</code></li>
</ol>
<p data-ke-size="size16">이게 끝! 인데, 편하게 사용하려면 파일을 커스텀 훅까지 2개 만들면 좋습니다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>src/context/콘텍스트.tsx</li>
<li>src/hooks/커스텀훅.tsx</li>
</ol>
<h3 data-ke-size="size23">콘텍스트.tsx</h3>
<pre class="javascript"><code>//context.tsx
import { ReactNode, createContext, useEffect, useState } from "react";
<p>interface Props {
children: ReactNode;
}</p>
<p>// 콘텍스트 생성
const MyContext = createContext&lt;사용할타입인터페이스 | null&gt;(null);</p>
<p>// 프로바이더 생성!
export const MyProvider = ({ children }: Props) =&gt; {
// 여러가지 스테이트 등등 할 일들 ....
return(
&lt;MyContext.Provider value={
// 여기다 스테이트 등등 이것저것 넣어줍니다.
}&gt;
{children}
&lt;/MyContext.Provider&gt;
)
})</code></pre></p>
<p data-ke-size="size16">그리고, 사용할 범위(최상이라면 App.tsx 등)에서 <code>MyProvider</code> 로 감싸주고...</p>
<h3 data-ke-size="size23">커스텀훅.tsx</h3>
<pre class="javascript"><code>//cutomHook.tsx
import MyContext from "@/context/MyContext";
import { useContext } from "react";
<p>const useMyContext = () =&gt; {
const context = useContext(MyContext);</p>
<pre><code>if (context === null) {
    throw new Error(&quot;오류 발생! 오류발생! 훅은 프로바이더 안에서 써줘요잉&quot;);
}

return context;
</code></pre>
<p>};</p>
<p>export default useMyContext;</code></pre></p>
<h3 data-ke-size="size23">사용법</h3>
<p data-ke-size="size16">이렇게 하면 아래와 같이 한 층 편하게 쓸 수 있습니다~!</p>
<pre class="javascript"><code>// 사용할 컴포넌트.tsx
import useMyContext from "@/hooks/useMyContext";
<p>export default function MyComponents () {</p>
<pre><code>const { 쓸것, 쓸것등등등 } = useMyContext();

// 마음껏 쓰세요~~
return(
    {/* 마음껏 쓰세요~~ */}
)
</code></pre>
<p>}</code></pre></p>
<h2 data-ke-size="size26">Redux-Tool Kit</h2>
<h3 data-ke-size="size23">기본설정</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>slice 생성 <code>createSlice({ options })</code></li>
<li>store 생성 <code>configureStore({ options })</code></li>
<li>Provider 로 상위 컴포넌트 감싸기</li>
<li>사용할 컴포넌트에서 사용 <code>useDispatch(), useSelector</code></li>
</ol>
<p data-ke-size="size16">역시 이게 끝! 인데 커스텀 훅을 하나 만들었더니 사용하기 편리합니다(action creator)</p>
<h3 data-ke-size="size23">slice.tsx</h3>
<pre class="typescript"><code>// slice.tsx
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
<p>// initialState 정의
const initialState: { count : number } = {
// 초기값 정의~~~
// 예시로 카운트
count : 0;
};</p>
<p>// 슬라이스 만들기
export const mySlice = createSlice({
name : &quot;슬라이스명&quot;, // 슬라이스의 이름을 정의합니다. 이 이름은 액션 타입을 생성할 때 사용됩니다.
initialState, // 위에서 만든 초기값 넣어주고
reducers : { // 리듀서 정의: 상태를 변경하는 함수들을 정의합니다.
// 만약 addCount 라는 더하기 리듀서를 만든다면 아래처럼
// 각 리듀서는 state, action 을 인자로 받는다
addCount: (state, action: PayloadAction&lt;number&gt;) =&gt; {
// immer 덕분에 불변성 신경은 안써도 됨
state.count += action.payload;
}
}
});</p>
<p>// 리듀서 액션들 내보내기
// 여러개라면 모두 내보내 줘야 함
export const { addCount } = mySlice.actions;</p>
<p>// 리듀서 자체 내보내기
const myReducer = mySlice.reducer;
export default myReducer;</code></pre></p>
<h3 data-ke-size="size23">store.tsx</h3>
<pre class="typescript"><code>// store.tsx
import { configureStore } from "@reduxjs/toolkit";
import myReducer from "./Slice";
<p>// 스토어에 리듀서 등록
const store = configureStore({
reducer: {
// 프로퍼티명 작명은 자유이나 예시로 myCount
myCount: myReducer,
},
});</p>
<p>export type RootState = ReturnType&lt;typeof store.getState&gt;;
export type AppDispatch = typeof store.dispatch;</p>
<p>export default store;</code></pre></p>
<h3 data-ke-size="size23">Provider 로 상위 컴포넌트 감싸기</h3>
<pre class="javascript"><code>// App.tsx
import { Provider } from "react-redux";
import store from "./redux/Store";
<p>function App(){
// store에 위에서 만든 store를 넣어준다
return(
&lt;Provider store={store}&gt;
{/* 뭔가 요소들 */}
&lt;/Provider&gt;
)
}</code></pre></p>
<h3 data-ke-size="size23">일반적인 사용법</h3>
<pre class="javascript"><code>// 사용할 컴포넌트
import { AppDispatch, RootState } from "@/redux/Store";
import { useDispatch, useSelector } from "react-redux";
import { addCount } from "@/redux/Slice";
<p>export default MyComponent () {
const dispatch = useDispatch&lt;AppDispatch&gt;();
// 요기 useSelector 콜백 패턴에 주의
const counts = useSelector((state: RootState) =&gt; state.myCount.count);</p>
<pre><code>const handleClick = (num : number) =&amp;gt; () =&amp;gt; {
    // 아래와 같이 사용 
    dispatch(addCount(num));
    // rtk 의 전역 state 에 접근 가능
    console.log(counts)
}

return(
    &amp;lt;&amp;gt;
        &amp;lt;button onClick={handleClick(1)}&amp;gt;눌러봐&amp;lt;/button&amp;gt;
    &amp;lt;/&amp;gt;
)
</code></pre>
<p>}</code></pre></p>
<h3 data-ke-size="size23">커스텀 훅(Action Creator) 사용법</h3>
<pre class="javascript"><code>// src/hooks/useCount.tsx
import { AppDispatch, RootState } from "@/redux/Store";
import { useDispatch, useSelector } from "react-redux";
import { addCount } from "@/redux/Slice";
<p>// 커스텀 훅 정의
function useCount() {
// Redux의 dispatch 함수를 사용하기 위한 설정
const dispatch = useDispatch&lt;AppDispatch&gt;();</p>
<pre><code>// Redux의 상태를 선택하기 위한 설정
const counts = useSelector((state: RootState) =&amp;gt; state.myCount.count);

// 아래와 같이 Action Creator를 만듭니다!
const increaseCount = (value: number) =&amp;gt; dispatch(addCount(value));

// 현재 카운트 값을 반환하고, Action Creator를 반환합니다.
return {
    counts, // 현재 상태 값 반환
    increaseCount, // 상태 변경 함수 반환
};
</code></pre>
<p>}</p>
<p>export default useCount;
</code></pre></p>
<pre class="javascript"><code>// 사용할 컴포넌트에서 커스텀 훅 사용하듯이 사용하면 됩니다.
import useCount from "@/hooks/useCount";

export default function MyComponent () {
    const { counts, increaseCount } = useCount();

    const handleClick = (num : number) =&gt; () =&gt; {
        increaseCount(num);
        console.log(counts);
    }

    return (
        &lt;&gt;
            &lt;button onClick={handleClick(1)}&gt;눌러봐&lt;/button&gt;
        &lt;/&gt;
    )
}</code></pre>