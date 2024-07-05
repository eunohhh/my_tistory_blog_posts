<h2 data-ke-size="size26">Structural Typing</h2>
<p data-ke-size="size16">TypeScript에서 타입을 축약해도 작동하는 이유는 TypeScript의 구조적 타이핑(structural typing) 덕분입니다. TypeScript는 객체의 실제 형태(shape)를 기반으로 타입을 확인합니다. 즉, 필요한 속성만 지정해도, 해당 속성들이 존재하면 타입이 유효하다고 판단합니다.</p>
<h3 data-ke-size="size23">축약한 타입이 작동하는 이유</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>부분 타입 매칭</b>: TypeScript는 객체가 정의된 타입을 충족하는지 확인할 때, 필요한 속성만 일치하면 타입이 맞다고 판단합니다. 축약된 타입 정의에서도 필요한 속성만 일치하면 타입이 유효하다고 판단합니다.</li>
<li><b>유연한 타입 시스템</b>: TypeScript는 유연하게 타입을 해석하므로, 특정 속성만 필요한 경우 전체 타입을 정의하지 않아도 됩니다.</li>
</ul>
<h3 data-ke-size="size23">예제 설명</h3>
<p data-ke-size="size16">축약된 타입 정의:</p>
<pre class="routeros"><code>export type CountryData = {
    name: {
        common: string;
        official: string;
    };
    cca3: string;
    capital?: string[];
    flags: {
        png: string;
    };
};</code></pre>
<p data-ke-size="size16">이 타입 정의는 <code>CountryData</code> 객체에 필요한 몇 가지 속성만 지정합니다. 만약 API 응답 객체에 이 속성들이 포함되어 있으면, TypeScript는 타입이 올바르다고 판단합니다. 나머지 속성은 무시됩니다.</p>
<h3 data-ke-size="size23">타입 축약 예제</h3>
<h4 data-ke-size="size20">전체 타입 정의</h4>
<p data-ke-size="size16">전체 타입 정의를 사용하면 API 응답의 모든 속성을 지정해야 합니다. 예를 들어:</p>
<pre class="gauss"><code>export type FullCountryData = {
    name: {
        common: string;
        official: string;
        nativeName: {
            [key: string]: {
                official: string;
                common: string;
            };
        };
    };
    cca3: string;
    capital?: string[];
    flags: {
        png: string;
        svg: string;
    };
    // 기타 속성들...
};</code></pre>
<h4 data-ke-size="size20">축약된 타입 정의</h4>
<p data-ke-size="size16">하지만 필요한 속성만 사용할 경우, 타입을 축약할 수 있습니다:</p>
<pre class="routeros"><code>export type CountryData = {
    name: {
        common: string;
        official: string;
    };
    cca3: string;
    capital?: string[];
    flags: {
        png: string;
    };
};</code></pre>
<p data-ke-size="size16">이렇게 축약된 타입 정의를 사용하면, TypeScript는 <code>CountryData</code> 객체가 필요한 속성을 포함하고 있으면 올바른 타입으로 간주합니다.</p>
<h3 data-ke-size="size23">축약된 타입을 사용하는 예제 코드</h3>
<pre class="angelscript"><code>// api.ts
import axios from 'axios';
import { CountryData } from '../types/countryTypes';
<p>export const fetchCountry = async (): Promise&lt;CountryData[]&gt; =&gt; {
const response = await axios.get('https://restcountries.com/v3.1/all');
return response.data;
};</p>
<p>// useCountryQuery.ts
import { useQuery } from '@tanstack/react-query';
import { fetchCountry } from '../api/api';
import { CountryData } from '../types/countryTypes';</p>
<p>const useCountryQuery = () =&gt; {
return useQuery&lt;CountryData[], Error&gt;('countries', fetchCountry);
};</p>
<p>export default useCountryQuery;</p>
<p>// CountryCard.tsx
import React from 'react';
import styled, { css } from 'styled-components';
import { CountryData } from '../types/countryTypes';</p>
<p>const StyledCard = styled.div&lt;{ selected?: boolean }&gt;`
border: 1px solid black;
border-radius: 20px;
width: 250px;
height: 150px;
padding: 16px;
display: flex;
flex-direction: column;
align-items: center;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
cursor: pointer;
transition: transform 0.3s ease, box-shadow 0.3s ease;</p>
<p>${(props) =&gt;
props.selected &amp;&amp;
css<code>      border-color: blue;    </code>}</p>
<p>&amp;:hover {
transform: scale(1.05);
box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
`;</p>
<p>const FlagImg = styled.img<code>  width: 100px;   height: 50px;   object-fit: cover;</code>;</p>
<p>const Title = styled.div<code>  font-size: 20px;   font-weight: 800;   margin-top: 10px;   white-space: nowrap;   overflow: hidden;   text-overflow: ellipsis;   width: 100%;   text-align: center;</code>;</p>
<p>interface CountryCardProps {
country: CountryData;
onCountryClick?: (country: CountryData) =&gt; void;
selected?: boolean;
}</code></pre></p>
<pre class="javascript"><code>// 위와 이어지는 코드
const CountryCard: React.FC&lt;CountryCardProps&gt; = ({ country, onCountryClick, selected }) =&gt; {
  const handleClick = () =&gt; {
    if (onCountryClick) {
      onCountryClick(country);
    }
  };

  return (
    &lt;StyledCard onClick={handleClick} selected={selected}&gt;
      &lt;FlagImg src={country.flags.png} alt={`Flag of ${country.name.common}`} /&gt;
      &lt;Title&gt;{country.name.common}&lt;/Title&gt;
      &lt;p&gt;{country.capital?.[0] ?? 'No capital'}&lt;/p&gt;
    &lt;/StyledCard&gt;
  );
};

export default CountryCard;</code></pre>
<p data-ke-size="size16">이 코드에서 <code>CountryData</code> 타입은 필요한 최소한의 속성만 정의되어 있습니다. TypeScript는 이 속성들만 일치하면 올바른 타입으로 간주하므로 축약된 타입 정의가 문제없이 작동합니다. 이는 TypeScript의 구조적 타이핑 시스템 덕분입니다.</p>
<h2 data-ke-size="size26">있을 수도 있고 없을 수도 있는 속성을 옵셔널 처리하지 않았는데 왜 컴파일에서도 런타임에서도 에러가 안나는 건가요?</h2>
<p data-ke-size="size16">컴파일 및 런타임에서 에러가 발생하지 않는 이유는 <code>country.capital</code>이 정의되지 않은 경우에도 TypeScript와 JavaScript가 이를 처리할 수 있기 때문입니다. TypeScript 인터페이스에서 <code>capital</code> 필드가 선택적(optional)로 정의되어 있지 않다면, 이 필드가 항상 존재한다고 가정합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그러나 실제 데이터에서는 이 필드가 없을 수도 있습니다. 이러한 경우, <code>undefined</code> 값을 사용할 때 발생할 수 있는 에러를 피하기 위해 코드를 약간 수정하는 것이 좋습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">컴파일러가 에러를 발생시키지 않는 이유는 기본적으로 <code>undefined</code> 값이 허용되기 때문입니다. 런타임에서 에러가 발생하지 않는 이유는 <code>undefined</code>를 직접 렌더링할 때 React가 이를 무시하고 아무것도 렌더링하지 않기 때문입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그러나, 타입 안전성을 높이고 예상치 못한 버그를 방지하기 위해 선택적 체이닝(optional chaining)을 사용하여 <code>country.capital</code>이 정의되어 있는지 확인하는 것이 좋습니다. 다음은 이를 고려한 수정된 코드입니다:</p>
<pre class="javascript"><code>function CountryCard({ country, isSelected, onClick }: CountryCardProps) {
    return (
        &lt;div
            onClick={() =&gt; onClick(country)}
            className={clsx(
                "p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-transform transform cursor-pointer",
                isSelected &amp;&amp; "border-2 border-blue-500"
            )}
        &gt;
            &lt;img className="w-20 h-auto mx-auto mb-4" src={country.flags.svg} alt={country.flag} /&gt;
            &lt;h3 className="text-xl font-semibold mb-2"&gt;{country.name.common}&lt;/h3&gt;
            &lt;p className="text-gray-600"&gt;{country.capital?.[0] || "No capital available"}&lt;/p&gt;
        &lt;/div&gt;
    );
}</code></pre>
<p data-ke-size="size16">여기서 <code>country.capital?.[0]</code>은 <code>country.capital</code>이 <code>undefined</code> 또는 빈 배열일 경우 <code>"No capital available"</code>를 표시합니다. 이와 같이 선택적 체이닝과 기본값을 사용하여 코드의 안정성을 높일 수 있습니다.</p>
<p data-ke-size="size16">또한, 인터페이스 정의에서 <code>capital</code>을 선택적 필드로 만들면 타입 안전성을 더욱 강화할 수 있습니다:</p>
<pre class="angelscript"><code>export interface Country {
    // ... other properties ...
    capital?: string[];
    // ... other properties ...
}</code></pre>
<p data-ke-size="size16">이렇게 하면 <code>capital</code> 필드가 있을 수도 있고 없을 수도 있다는 것을 명시적으로 나타낼 수 있습니다.</p>