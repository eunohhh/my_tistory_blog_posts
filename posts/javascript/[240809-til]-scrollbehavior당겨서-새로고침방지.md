<h2 data-ke-size="size26">당겨서 새로고침을 막고싶을 때</h2>
<p data-ke-size="size16">모바일 버전 개발을 하다보면<br />당겨서 새로고침이 되는 것이 매우 귀찮습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">특히 화면내에서 드래그 해야하는 요소들이 있을 때<br />자꾸만 새로고침 되어서 짜증납니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그래서 방법을 찾아 보았습니다.</p>
<p data-ke-size="size16">역시 방법이 있었고요..</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">전에는 div 같은 걸로 감싸서 높이를 제한하고 뭐 어쩌고 했던것 같은데<br />그냥 간단하게 해결하는 방법이 있었습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">검색해보면 body 에다가 넣든지 html 에다 넣든지 하라고하는데<br />저는 특정페이지에서만 막고 싶어서<br />아래처럼 해보았습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre class="javascript"><code>useEffect(() =&gt; {
    document.documentElement.style.overscrollBehavior = 'none';
    return () =&gt; {
        document.documentElement.style.overscrollBehavior = 'auto';
    };
}, []);</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">물론 useEffect 라 잠시 틈이 있는 것은 어쩔수 없겠네요.<br />그것도 막고 싶으면 그냥 html 에 넣든지 해야겠어요.</p>