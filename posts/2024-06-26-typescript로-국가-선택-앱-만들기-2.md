<h2 id="section-8" style="color: #3a4954; text-align: start;" data-ke-size="size26">CountryList.tsx 컴포넌트 구현</h2>
<h3 style="color: #3a4954; text-align: start;" data-ke-size="size23">기본 레이아웃 구성</h3>
<pre id="code_1719402406335" class="javascript" style="background-color: #f8f8f8; color: #383a42;" data-ke-type="codeblock" data-ke-language="javascript"><code>// src/components/CountryList.tsx
<p>import styled from 'styled-components';
import CountryCard from './CountryCard';</p>
<p>const CardSection = styled.div<code>  display: flex;   flex-wrap: wrap;   gap: 20px;</code>;</p>
<p>const CountryList = () =&gt; {</p>
<pre><code>return (
    &amp;lt;&amp;gt;
        &amp;lt;h1&amp;gt;내가 고른 카드&amp;lt;/h1&amp;gt;
        &amp;lt;CardSection&amp;gt;
            &amp;lt;CountryCard /&amp;gt;
        &amp;lt;/CardSection&amp;gt;
        &amp;lt;h1&amp;gt;국가 목록&amp;lt;/h1&amp;gt;
        &amp;lt;CardSection&amp;gt;
            &amp;lt;CountryCard /&amp;gt;
        &amp;lt;/CardSection&amp;gt;
    &amp;lt;/&amp;gt;
)
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">기본적으로 위 아래로 섹션이 나누어져 있고, 아래 국가목록 영역에 전체 카드가 렌더링 되고, 선택하면 내가 고른 카드 영역으로 이동되게 구현할 것이다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">스타일드 컴포넌츠를 통해서 카드들이 주르륵 정렬되도록 flex로 기본 정렬 방법만 잡고 있다.</p>
<h3 style="color: #3a4954; text-align: start;" data-ke-size="size23">데이터 받아오기</h3>
<pre id="code_1719402406338" class="javascript" style="background-color: #f8f8f8; color: #383a42;" data-ke-type="codeblock" data-ke-language="javascript"><code>import useCountryQuery from '../hooks/useCountryQuery';
<p>...</p>
<pre><code>const { data: countries, isPending, isError } = useCountryQuery();

if (isPending) return &amp;lt;div&amp;gt;로딩 중&amp;lt;/div&amp;gt;;
if (isError) return &amp;lt;div&amp;gt;에러&amp;lt;/div&amp;gt;;&lt;/code&gt;&lt;/pre&gt;
</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">커스텀 훅으로 작성해 둔 useCountryQuery()라는 useQuery() 훅을 불러오도록 한다.</p>
<p data-ke-size="size16">그리고 data라는 이름은 헷갈리니 countries라는 이름으로 바꿔서 사용하겠다.</p>
<p data-ke-size="size16">그리고 바뀐 지 오래 되지 않은 것 같아 찾아보면 isLoading으로 로딩 처리를 하는 경우가 많은데, 공식문서에서는 isPending이라는 명칭으로 바뀌었다.</p>
<h3 style="color: #000000;" data-ke-size="size23">위 아래 선택 로직 작성하기</h3>
<h4 style="color: #000000;" data-ke-size="size20">상태 만들기</h4>
<pre id="code_1719402406338" class="javascript" style="background-color: #f8f8f8; color: #383a42;" data-ke-type="codeblock" data-ke-language="javascript"><code>import { useState } from 'react';
import { CountryData } from '../types/countryTypes';
<p>const [favoriteCountries, setFavoriteCountries] = useState&lt;CountryData[]&gt;([]);
const [allCountries, setAllCountries] = useState&lt;CountryData[]&gt;([]);</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">1) 내가 고른 카드 영역에 올라 갈 상태가 필요하고 : favoriteCountries</p>
<p data-ke-size="size16">2) 처음 fetch 받아올 때 아래 영역에 모두 렌더링 될 상태가 필요하다 : allCountries</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">useState 훅을 사용하는데, React.js에서 정의하는 방법과는 다르다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>useState의 초기값으로는 ([]) 배열이 들어갈 것임을 명시해준다.</li>
<li>&lt;CountryData[]&gt; useState 훅은 제네릭으로 설정해준다. 이 제네릭은 이미 CountryData로 정의해둔 것으로 불러온다.</li>
</ul>
<h4 data-ke-size="size20">최초 API 응답값 전부 아래 상태에 할당하기</h4>
<pre id="code_1719402942774" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>import { useState, useEffect } from 'react';
<p>const { data: countries, isPending, isError } = useCountryQuery();</p>
<p>useEffect(() =&gt; {
if (countries) {
setAllCountries(countries);
}
}, [countries]);</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">useCountryQuery() 커스텀 훅을 사용해서 받아 온 데이터인 countries가 존재하면 allCountries라는 상태에 전부 할당해서 2단으로 나뉜 화면 중 아래에 위치할 수 있게 할당해준다.</p>
<p data-ke-size="size16">그런데 이 과정이 이 List 컴포넌트의 상태가 바뀔 때마다 리렌더링 되면 안 되기 때문에 useEffect 훅으로 만들어주고, 의존성 배열에 이 상태 자체를 넣어주어서 fetch 받아 오는 이 데이터 자체가 바뀌지 않는 이상은 컴포넌트가 마운트 됐을 때에만 상태에 저장하는 로직이 실행되도록 해준다.</p>
<h4 data-ke-size="size20">이벤트 핸들러 정의하기</h4>
<p data-ke-size="size16">상태를 만들었다면 이제 그 상태를 어떻게 관리할 것인지 이벤트 핸들러를 정의해주어야 한다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">상태를 두 개 만들었다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>페이지 상단 : 내가 고른 나라들을 렌더링 해주는 영역에 들어갈 나라 리스트</li>
<li>페이지 하단 : API 요청으로 받아 온 모든 나라 리스트</li>
</ul>
<p data-ke-size="size16">1) 최초 API를 받아오면 페이지 하단에 allCountries 상태에 있는 나라들로 포함되어 렌더링 된다.</p>
<p data-ke-size="size16">2) allCountries에서 사용자가 아이템을 클릭하면 allCountries -&gt; favoriteCountries로 상태가 바뀌면서 화면 상단으로 위치가 바뀐다.</p>
<p data-ke-size="size16">3) 다시 favoriteCountries 에서 아이템을 클릭하면 favoriteCountries -&gt; allCountries로 아이템이 옮겨 가면서 화면 하단에서 렌더링 된다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">여기서 2, 3번에 해당하는 이벤트 핸들러가 필요하다. 각각 이름은 아래처럼 한다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>addFavotrieCountry</li>
<li>removeFavoriteCountry</li>
</ul>
<pre id="code_1719403681561" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>const addFavoriteCountry = (country: CountryData) =&gt; {
  setFavoriteCountries([...favoriteCountries, country]);
  setAllCountries(allCountries.filter(c =&gt; c.cca3 !== country.cca3));
};
<p>const removeFavoriteCountry = (country: CountryData) =&gt; {
setFavoriteCountries(favoriteCountries.filter(c =&gt; c.cca3 !== country.cca3));
setAllCountries([...allCountries, country]);
};</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>addFavoriteCountry 함수 : allCountries -&gt; favoriteCountries</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>const addFavoriteCountry = (country: CountryData) =&gt; { ... }
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>내가 좋아하는 나라 목록(화면 상단)에 추가하는 함수이다.</li>
<li>내가 좋아하는 나라를 추가하려면 사용자가 클릭한 나라 즉 country를 매개 변수로 받아야 한다.</li>
<li>매개 변수의 타입을 지정해주어야 한다. 이 타입은 이미 CountryData 타입 파일에 지정했다. 그러나 위에 했던 것들과 차이가 있다면, 객체 하나(아이템)이기 때문에 CountryData[] 이렇게 배열 표시를 하지 않는다.</li>
</ul>
</li>
<li>setFavoriteCountries([...favoriteCountries, country]);
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>사용자가 아이템을 클릭해서 country 아이템 하나를 매개 변수로 전달해주면, 기존 favoriteCountries에는 변화를 주지 않고 그대로 둔 상태에서, 즉 불변성을 spread operator로 유지하면서 하나씩 아이템을 추가해 나가는 로직을 작성한다.</li>
</ul>
</li>
<li>setAllCountires(allCountries.filter(c =&gt; c.cca3 !== country.cca3));
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>그리고 방금 넘겨 준 아이템을 원래 있던 상태(하단부)인 allCountries 상태에서 빼내는 로직을 작성한다.</li>
<li>allCountries 배열 상태를 filter 메서드로 순회하면서 아이템 중 cca3 라는 key가 지금 현재 클릭한 아이템의 cca3와 일치하지 않는 아이템들만 싹 다 모아서 새로운 배열로 만들어 내고, 그 배열을 allCountries에 다시 할당한다.</li>
<li>즉 지금 클릭한 아이템만 빼고 나머지만 재할당하는 건 지금 클릭한 아이템을 빼고 새로 저장하겠다는 의미이다.</li>
</ul>
</li>
</ul>
<p data-ke-size="size16"><b>removeFavoriteCountry 함수 : <b>favoriteCountries <b><b>-&gt;<span>&nbsp;</span></b></b> </b>allCountries&nbsp;</b></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>const removeFavoriteCountry = (country: CountryData) =&gt; { ... }
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>내가 좋아하는 나라 목록(화면 상단)에서 사용자가 아이템을 클릭하면 다시 allCountries 상태로 바꿔서 화면 하단부에 렌더링 시키는 로직을 작성한다.</li>
<li>마찬가지로 사용자가 클릭한 아이템을 매개 변수로 전달해주고 타입을 지정해주어야 한다.</li>
</ul>
</li>
<li>setFavorieCountries(favoriteCountries.filter(c =&gt; c.cca3 !== country.cca3))
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>favoriteCountries 배열 상태에서 사용자가 지금 클릭한 아이템의 cca3 key와 일치하지 않는 아이템들만 filter 메서드로 새로운 배열로 만든 뒤 favoriteCountries 상태로 재할당한다.</li>
<li>즉 사용자가 클릭한 아이템만 빼고 나머지만으로 상태를 다시 구성하는 로직이니, 삭제시키는 로직이다.</li>
</ul>
</li>
<li>setAllCountries([...allCountries, country])
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>위에서는 뺐으니 아래에서는 다시 받아서 추가시켜야 한다. 그 로직이다.</li>
</ul>
</li>
</ul>
<h3 data-ke-size="size23">List 컴포넌트 렌더링 하기</h3>
<pre id="code_1719405806645" class="html xml" data-ke-language="html" data-ke-type="codeblock"><code>return (
  &lt;&gt;
    &lt;h1&gt;내가 좋아하는 나라들&lt;/h1&gt;
    &lt;StyledCardSection&gt;
      {favoriteCountries.map((country) =&gt; (
        &lt;CountryCard key={country.cca3} country={country} onCountryClick={removeFavoriteCountry} selected /&gt;
      ))}
    &lt;/StyledCardSection&gt;
    &lt;h1&gt;여기서 나라를 골라 보세요&lt;/h1&gt;
    &lt;StyledCardSection&gt;
      {allCountries.map((country) =&gt; (
        &lt;CountryCard key={country.cca3} country={country} onCountryClick={addFavoriteCountry} /&gt;
      ))}
    &lt;/StyledCardSection&gt;
  &lt;/&gt;
);</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>각각 적절한 위치를 잡고, 컴포넌트를 flex로 레이아웃을 잡아 줄 StyledCardSection 컴포넌트로 감싸서 렌더링 해준다.</li>
<li>그리고 CountryCard를 각각의 위치에 렌더링 해준다.</li>
<li>CountryCard에서는 실질적으로 map을 통해 카드 아이템 리스트를 렌더링 할 것이다. 그런데 fetch도 여기서 받아 왔고, 카드를 위 아래로 상태를 바꿔가며 추가하고 제거하는 로직도 이곳에 작성되어 있다. 따라서 이런 것들을 props로 전달해주어야 한다. Card 자식 컴포넌트에서 필요한 props는 아래와 같다.<br />
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>아이템 그 자체 (country)</li>
<li>각각의 영역에서 이벤트 핸들러에 연결 시킬 함수 (onCountryClick)</li>
<li>카드 선택 여부 (selected) : 카드를 선택했을 때 테두리 색깔을 바꿔주는 조건부 스타일링을 하기 위해 favoriteCard에만 필요하다.</li>
</ul>
</li>
<li>API 응답값은 안 내려도 된다. 전체적인 카드 리스트는 List 컴포넌트에서 map 메서드를 통해 렌더링 하고 있고, Card 컴포넌트에서는 카드 하나만 만들 것이기 때문에 카드 하나를 만들 때 필요한 정보는 저게 다이다.</li>
</ul>
<p data-ke-size="size16">그런데 여기까지 하면 props와 관련해서 컴파일 에러가 뜰 것이다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1804" data-origin-height="782"><span data-url="https://blog.kakaocdn.net/dn/dGAQb2/btsIeVnveQm/Rn1cdQa0J335MwIJkUGKR0/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/dGAQb2/btsIeVnveQm/Rn1cdQa0J335MwIJkUGKR0/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdGAQb2%2FbtsIeVnveQm%2FRn1cdQa0J335MwIJkUGKR0%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1804" data-origin-height="782"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">도무지 이해할 수 없는 외계어 같지만, 이런 류의 에러는 props를 만들어 놓고 Card 컴포넌트에서 props를 받지 않았기 때문에 발생하는 에러다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">원래 과제 구현 순서가 아래에서 위로 올라가야 함이 맞는 것 같은데, 과제 필수 구현 과제를 구현하느라 List 컴포넌트에서 API 호출을 받았기 때문에 여기에서 바로 작성을 하고 거꾸로 들어갔기 때문에 이런 에러가 발생했다. Card 컴포넌트를 제대로 작성하면 에러는 사라진다.</p>
<h2 id="section-8" style="color: #3a4954; text-align: start;" data-ke-size="size26">CountryCard.tsx 컴포넌트 구현</h2>
<h3 data-ke-size="size23">컴포넌트 뼈대 잡기</h3>
<pre id="code_1719407239133" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// src/components/CountryCard.tsx
<p>const CountryCard = ({ country, onCountryClick, selected }) =&gt; {
return(
&lt;&gt;
&lt;/&gt;
)
}</p>
<p>export default CountryCard;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">List 컴포넌트에서 props 세 개를 내려줬다. 그걸 구조 분해 할당 해서 받아 오는 형태는 자바스크립트에서는 위와 같았다.</p>
<p data-ke-size="size16">그런데 타입스크립트 프로젝트이기 때문에 1) 함수형 컴포넌트 자체의 타입과 2) 매개 변수의 타입을 모두 지정해주어야 한다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이런 것은 외우지 않아도 컴포넌트 이름에 마우스 오버하면 도움말로 나온다. 이것을 복붙 해도 좋다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1220" data-origin-height="414"><span data-url="https://blog.kakaocdn.net/dn/b94GR9/btsIcTLHTpE/VuyqKJ0I8gzhu3R0HfqA5K/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/b94GR9/btsIcTLHTpE/VuyqKJ0I8gzhu3R0HfqA5K/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fb94GR9%2FbtsIcTLHTpE%2FVuyqKJ0I8gzhu3R0HfqA5K%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1220" data-origin-height="414"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그리고 매개 변수가 세 개나 되기 때문에 일일이 매개 변수에 타입을 지정하는 것보다는 별도로 props용 type alias나 interface를 설정하고 가져오는 것이 좋겠다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719407587665" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>import { CountryData } from '../types/countryTypes';
<p>// interface 일 때
interface CountryCardProps {
country: CountryData;
onCountryClick: (country: CountryData) =&gt; void;
selected?: boolean;
}</p>
<p>// type alias 일 때
type CountryCardProps = {
country: CountryData;
onCountryClick: (country: CountryData) =&gt; void;
selected: boolean;
}</p>
<p>const CountryCard: React.FC&lt;CountryCardProps&gt; = ({ country, onCountryClick, selected }) =&gt; {
return(
&lt;&gt;
&lt;/&gt;
)
}</p>
<p>export default CountryCard;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>country: CountryData
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>아이템 하나를 만들 때 필요한 API 요청 응답값 배열에서 하나의 아이템인 객체 하나를 의미한다.</li>
<li>이것은 이미 CountryData라는 타입으로 지정해놨고 import 해서 그 타입을 지정해준다. 지금 가만 생각해보니 타입의 이름을 잘못 지은 것 같다. 파일 이름과 달라서 살짝 헷갈렸다.</li>
</ul>
</li>
<li>onCountryClick: (country: CountryData) =&gt; voide
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>내가 좋아하는 나라 목록(상단), 전체 나라 목록(하단)에 내려가는 이벤트 핸들러가 add, remove로 다른데, 둘 다 매개 변수로 country를 받는다. 아이템 하나를 이야기한다. 이 매개 변수의 타입을 지정해주어야 하고 함수의 return 값 타입을 지정해주어야 한다.</li>
<li>매개 변수의 타입은 CountryData로 타입을 지정 해 놓은 것 그 자체로 사용하면 되고, 이 이벤트 핸들러는 setState를 하는 함수이지 값을 return 하는 함수가 아니기 때문에 이벤트 핸들러 함수의 타입은 void이다.</li>
</ul>
</li>
<li>selected?: boolean
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>카드가 선택 됐을 때 테두리를 바꾸는 조건부 스타일링을 하기 위해 필요한 속성이다. 카드가 선택되지 않았을 땐 false이다가 선택 되었을 때 true로 바뀌면서 조건부 스타일링이 이루어지기 때문에 이 prop의 타입은 boolean이다.</li>
<li>이 항목이 옵셔널 한 이유는 아래 사진을 보자. favoriteCountries에는 selected의 불리언 값이 조건부 스타일링을 위해 필요하고, allCountries에는 selected의 불리언 값이 필요가 없기 때문에 선택적으로 있을 수도 있고 없을 수도 있기 때문이다.</li>
<li>매개 변수 타입을 지정할 때 옵셔널 처리를 안 하면 아래처럼 에러가 뜬다.</li>
</ul>
</li>
</ul>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="3106" data-origin-height="996"><span data-url="https://blog.kakaocdn.net/dn/blOsZt/btsIdVWi8jO/CP1pdYy4b7PdM8vbb969p0/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/blOsZt/btsIdVWi8jO/CP1pdYy4b7PdM8vbb969p0/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FblOsZt%2FbtsIdVWi8jO%2FCP1pdYy4b7PdM8vbb969p0%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="3106" data-origin-height="996"/></span></figure>
</p>
<h3 data-ke-size="size23">카드 렌더링하기</h3>
<p data-ke-size="size16">기능을 붙이기 전에 카드가 잘 렌더링 되는지 눈으로 확인해봐야겠다.</p>
<pre id="code_1719409491352" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// src/components/CountryCard.tsx
<p>import styled from 'styled-components';</p>
<p>const StyledCard = styled.div&lt;{ selected?: boolean }&gt;<code>  border: 1px solid black;   border-radius: 20px;   width: 250px;   height: 150px;   padding: 16px;   display: flex;   flex-direction: column;   align-items: center;   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);</code>;</p>
<p>const StyledFlagImg = styled.div<code>  width: 100px;   height: 50px;   img {     width: 100%;     height: 100%;     object-fit: cover;   }</code>;</p>
<p>const StyledTitle = styled.div<code>  font-size: 25px;   font-weight: 800;   margin-top: 10px;   white-space: nowrap;   overflow: hidden;   text-overflow: ellipsis;   width: 100%;</code>;</p>
<p>return (
&lt;StyledCard&gt;
&lt;StyledFlagImg&gt;
&lt;img src={country.flags.png} alt={<code>국기 이미지</code>} /&gt;
&lt;/StyledFlagImg&gt;
&lt;StyledTitle&gt;{country.name.common}&lt;/StyledTitle&gt;
&lt;p&gt;{country.capital?.[0] ?? '수도 정보가 없습니다'}&lt;/p&gt;
&lt;/StyledCard&gt;
);</code></pre></p>
<pre id="code_1719409846631" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// App.tsx

import CountryList from './components/CountryList';

function App() {

  return (
    &lt;&gt;
          &lt;CountryList /&gt;
    &lt;/&gt;
  )
}

export default App</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">전체적으로 보면 쉽게 이해할 수 있을 것이다.</p>
<p data-ke-size="size16">API에서 common 필드가 해당 국가의 공용 이름인 것 같고, capital이 수도인 것 같다.</p>
<p data-ke-size="size16">그런데 문제가 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">본인이 못 찾는 것인지 모르겠지만 API 명세서에 capital 필드가 있을 수도 있고, 없을 수도 있다는 정보가 없다.</p>
<p data-ke-size="size16">이 API의 response 중 아이템 하나가 값이 너무 길어서 어떤 필드가 있는지 없는지 알기가 어렵다.</p>
<p data-ke-size="size16">근데 렌더링을 이렇게 미리 해보면 저 값이 빠지는 국가가 있음을 알 수 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719409709100" class="html xml" data-ke-language="html" data-ke-type="codeblock"><code>&lt;p&gt;{country.capital}&lt;/p&gt;</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">처음에는 심플하게 이 상태로 렌더링을 했다.</p>
<p data-ke-size="size16">그리고 렌더링을 해보니 중간에 수도 정보가 undefined인 이런 나쁜 아이가 있음을 발견했다. 250개가 넘는 응답값 중 이 아이만 그런 것으로 파악했다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2134" data-origin-height="748"><span data-url="https://blog.kakaocdn.net/dn/bC1uoq/btsIcDClkGK/xKQVDt9EMWs5nqv2s4CKjK/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/bC1uoq/btsIcDClkGK/xKQVDt9EMWs5nqv2s4CKjK/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbC1uoq%2FbtsIcDClkGK%2FxKQVDt9EMWs5nqv2s4CKjK%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="2134" data-origin-height="748"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><span style="color: #333333; text-align: start;">하마터면 놓칠 뻔했다. 이렇게 렌더링 해도 상관은 없지만 사용자 경험을 높이기 위해 옵셔널 설정을 해주고 undefined일 때 렌더링 조건을 설정해주겠다.</span></p>
<pre id="code_1719409943799" class="html xml" data-ke-language="html" data-ke-type="codeblock"><code>&lt;p&gt;{country.capital?.[0] ?? '수도 정보가 없습니다'}&lt;/p&gt;</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">API 응답값을 보면 capital 필드는 배열로 반환된다. 그런데 country.captital?[0] 이라는 수식은 말이 안 되므로, 앞에 마침표를 찍어준 것 뿐이다.</p>
<h3 data-ke-size="size23">이벤트 핸들러 정하기</h3>
<pre id="code_1719410603996" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>const handleClick = () =&gt; {
  if (onCountryClick) {
    onCountryClick(country);
  }
};
<p>// return문...
&lt;StyledCard onClick={handleClick} selected={selected}&gt;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">클릭 이벤트 핸들러를 정의해준다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">함수는 이미 List 컴포넌트에서 onCountryClick props로 위 아래 카드 컴포넌트가 add, remove로 다른 이벤트 핸들러를 내려주고 있다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2496" data-origin-height="1000"><span data-url="https://blog.kakaocdn.net/dn/C5jCy/btsId5j1KNr/UXhb4pC5VcEe3cW65QfZyk/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/C5jCy/btsId5j1KNr/UXhb4pC5VcEe3cW65QfZyk/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FC5jCy%2FbtsId5j1KNr%2FUXhb4pC5VcEe3cW65QfZyk%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="2496" data-origin-height="1000"/></span></figure>
</p>
<p data-ke-size="size16">이 함수가 있으면 그 함수의 매개 변수로 country를 전달하라는 간단한 로직이다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">개발 서버를 열고 카드를 클릭해보면 잘 작동한다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">작동하는 데는 문제가 없지만 여기서 끝이 아니다.</p>
<p data-ke-size="size16">카드를 클릭했을 때 카드 테두리 색이 변하면서 클릭했다는 것을 직관적으로 알려주는 조건부 스타일링이 빠져있다. selected를 props로 내려준 것을 CSS 처리를 하지 않았다.</p>
<h3 data-ke-size="size23">사용자 경험 증대를 위한 CSS 추가</h3>
<h4 data-ke-size="size20">선택된 카드 테두리 색상 바꾸기</h4>
<pre id="code_1719411252191" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>import styled, { css } from 'styled-components';
<p>const StyledCard = styled.div&lt;{ selected?: boolean }&gt;`
/* ... */</p>
<p>${(props) =&gt;
props.selected &amp;&amp;
css<code>      border-color: blue;    </code>}
`</code></pre></p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="800" data-origin-height="796"><span data-url="https://blog.kakaocdn.net/dn/bay0ih/btsIcBR6Hnl/cVcrUicf23EjdqKBHKRzv0/img.gif" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/bay0ih/btsIcBR6Hnl/cVcrUicf23EjdqKBHKRzv0/img.gif" srcset="https://blog.kakaocdn.net/dn/bay0ih/btsIcBR6Hnl/cVcrUicf23EjdqKBHKRzv0/img.gif" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" width="400" height="398" data-origin-width="800" data-origin-height="796"/></span></figure>
</p>
<h4 data-ke-size="size20">마우스 호버 시 클릭 커서로 바꾸고 카드가 커지는 호버 효과</h4>
<pre id="code_1719411434379" class="css" data-ke-language="css" data-ke-type="codeblock"><code>  const StyledCard = styled.div&lt;{ selected?: boolean }&gt;`
  /* ... */
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
<p>&amp;:hover {
transform: scale(1.05);
box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}</p>
<p>${(props) =&gt;
props.selected &amp;&amp;
css<code>      border-color: blue;    </code>}
`;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>