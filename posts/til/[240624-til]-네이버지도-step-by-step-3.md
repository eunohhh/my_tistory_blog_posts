<p>네이버 지도 관련 마지막입니다.<br>네이버 지도 api 에서 정보창을 만들 때 기본적으로 문자열만 받는데,<br>이부분을 리액트 컴포넌트로 할 수 없을까 고민하다가 나온 결론입니다.</p>
<h2>React.createRoot, React.render 조합</h2>
<pre><code class="language-javascript">function SetInfoWindowContent(
    type,
    searchedValue,
    htmlAddresses,
    infoWindow,
    place = null,
    navigate = null,
    marker = null,
    user = null,
    contracts = []
) {
    // 임시 컨테이너 생성
    const container = document.createElement(&#39;div&#39;);
<pre><code>container.style.padding = &amp;#39;10px&amp;#39;;
container.style.width = &amp;#39;100%&amp;#39;;
container.style.height = &amp;#39;100%&amp;#39;;
container.style.boxShadow = &amp;#39;rgba(0, 0, 0, 0.1) 0px 4px 16px 0px&amp;#39;;

// React 컴포넌트를 임시 컨테이너에 렌더링
const root = ReactDOM.createRoot(container);

if (type === &amp;#39;address&amp;#39;) {
    root.render(
        &amp;lt;AddressInfoWindow
            searchedValue={searchedValue}
            htmlAddresses={htmlAddresses}
            infoWindow={infoWindow}
            marker={marker}
        /&amp;gt;
    );
} else if (type === &amp;#39;coord&amp;#39;) {
    root.render(
        &amp;lt;CoordInfoWindow 
            htmlAddresses={htmlAddresses} 
            infoWindow={infoWindow} 
            marker={marker} 
        /&amp;gt;
    );
} else if (type === &amp;#39;place&amp;#39;) {
    root.render(
        &amp;lt;InfoWindow place={place} 
            infoWindow={infoWindow} 
            navigate={navigate} 
            user={user} 
            contracts={contracts} 
        /&amp;gt;
    );
}
// 컨테이너를 리턴
return container;
</code></pre>
<p>}</p>
<p>export default SetInfoWindowContent;</code></pre></p>
<h2>사용하는 곳에서</h2>
<pre><code class="language-javascript">//...중략...
<p>// setInfoWindowContent 함수 호출
const container = SetInfoWindowContent(
'address',
'',
htmlAddresses,
infoWindow,
null,
null,
marker,
user
);
// 네이버에서 제공하는 setContent의 인자로 container 를 넣어주면 됨
infoWindow.setContent(container);</code></pre></p>
