<p data-ke-size="size16">과제를 처음부터 끝까지 자세히 기록해보고자 한다. 따라서 글이 길어질 수 있고 여러 편으로 나눠서 작성할 수 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">과제 요구사항 확인하기</h2>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1280" data-origin-height="661"><span data-url="https://blog.kakaocdn.net/dn/1tOIR/btsIbpDWyDn/3D72PRSBw5fkGwCEYCkcoK/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/1tOIR/btsIbpDWyDn/3D72PRSBw5fkGwCEYCkcoK/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F1tOIR%2FbtsIbpDWyDn%2F3D72PRSBw5fkGwCEYCkcoK%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1280" data-origin-height="661"/></span></figure>
</p>
<h3 data-ke-size="size23">사용 기술 스택</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>패키지 매니저 : vite</li>
<li>라이브러리 : react</li>
<li>언어 : typescript</li>
</ul>
<h3 data-ke-size="size23">필수 구현 사항</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>제공된 API를 호출하여 응답값을 useState를 통한 상태 관리
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>적절한 타입이 꼭 명시되어 있어야 함</li>
</ul>
</li>
<li>useState로 상태 관리 되고 있는 값들을 화면에 렌더링</li>
<li>사용자와 인터렉션(선택/해제)가 가능하여야 함</li>
<li>이 모든 과정에서 사용하는 함수에는 타입이 적절하게 명시되어 있어야 함.</li>
</ul>
<h3 data-ke-size="size23">과제 구현 순서</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>프로젝트 셋업 (vtie + react + typescript)</li>
<li>API 호출 설정
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>API URL : https://restcountries.com/v3.1/all</li>
<li>요청 : GET</li>
<li>API 응답값을 src/types 폴더에 타입을 지정</li>
<li>API 호출 로직을 담당하는 함수롸 응답값에 적절한 타입 명시</li>
</ul>
</li>
<li>CountryList 컴포넌트 작성
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>API에서 받아온 각 나라들에 대한 기본 정보를 렌더링 할 리스트 컴포넌트 제작</li>
<li>제작한 CountryList는 App.tsx에 렌더링</li>
<li>API를 호출하고 useState를 이용해 응답값을 CountryList 컴포넌트 내부에서 상태관리</li>
<li>위 모든 로직에서 적절한 타입을 명시</li>
</ul>
</li>
<li>CountryCard 컴포넌트 작성
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>CountryList에서 map 메서드를 통해 렌더링 할 카드를 제작</li>
<li>CountryList 컴포넌트에서 호출받은 API 응답값을 관리하는 상태를 prop으로 받아와 화면에 카드를 렌더링</li>
<li>위 모든 로직에서 적절한 타입을 명시</li>
</ul>
</li>
<li>추가 로직
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>각 카드가 클릭 되었을 때 선택된 카드를 저장할 수 있는 state를 만들고 관리. [selectedCountries, setSelectedCountries]</li>
<li>Country를 클릭하면 selectedCountries에 해당 나라정보를 등록해주고 다시 클릭하면 제거 되도록 함</li>
<li>위 모든 로직에서 적절한 타입을 명시</li>
</ul>
</li>
</ul>
<h2 data-ke-size="size26">과제 구현하기</h2>
<h3 data-ke-size="size23">프로젝트 셋업하기</h3>
<p data-ke-size="size16">VSCode 우클릭 - 새 창</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1250" data-origin-height="862"><span data-url="https://blog.kakaocdn.net/dn/ZyxtR/btsIcA5B9la/20KXyKofG7sN4KtHWkmG70/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/ZyxtR/btsIcA5B9la/20KXyKofG7sN4KtHWkmG70/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FZyxtR%2FbtsIcA5B9la%2F20KXyKofG7sN4KtHWkmG70%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" width="750" height="517" data-origin-width="1250" data-origin-height="862"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">열기</p>
<p data-ke-size="size16">&nbsp;</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1020" data-origin-height="656"><span data-url="https://blog.kakaocdn.net/dn/cGDTUZ/btsIcqWihyp/40lbOR9g2q72hC95rCyiDk/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/cGDTUZ/btsIcqWihyp/40lbOR9g2q72hC95rCyiDk/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcGDTUZ%2FbtsIcqWihyp%2F40lbOR9g2q72hC95rCyiDk%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" width="779" height="501" data-origin-width="1020" data-origin-height="656"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">데스크톱 또는 만들고자 하는 폴더를 선택 - 열기</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="756" data-origin-height="704"><span data-url="https://blog.kakaocdn.net/dn/bp7K3C/btsIcR667xG/mQiRtKqYWayPwM1P9imyXK/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/bp7K3C/btsIcR667xG/mQiRtKqYWayPwM1P9imyXK/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbp7K3C%2FbtsIcR667xG%2FmQiRtKqYWayPwM1P9imyXK%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" width="795" height="740" data-origin-width="756" data-origin-height="704"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">터미널 열고 (Mac 기준 option + shift + `)</p>
<pre id="code_1719323907467" class="css" data-ke-language="css" data-ke-type="codeblock"><code>yarn create vite</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">원하는 폴더명(프로젝트명) 설정</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1140" data-origin-height="450"><span data-url="https://blog.kakaocdn.net/dn/8S0Zs/btsIbTq2jji/Kp0NYZ3CDppCjUUTO56Ua1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/8S0Zs/btsIbTq2jji/Kp0NYZ3CDppCjUUTO56Ua1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F8S0Zs%2FbtsIbTq2jji%2FKp0NYZ3CDppCjUUTO56Ua1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1140" data-origin-height="450"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">프레임워크 선택 (React)</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1216" data-origin-height="690"><span data-url="https://blog.kakaocdn.net/dn/dyvXPN/btsIbP99bGL/zd7RPILIGGvdg53a0kWpy0/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/dyvXPN/btsIbP99bGL/zd7RPILIGGvdg53a0kWpy0/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdyvXPN%2FbtsIbP99bGL%2Fzd7RPILIGGvdg53a0kWpy0%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1216" data-origin-height="690"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">언어 선택(TypeScript)</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">+ SWC는 개선된 버전이라고 하나 큰 차이 체감 못하겠음. 필요하면 자세히 알아보기.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1202" data-origin-height="608"><span data-url="https://blog.kakaocdn.net/dn/TXSbE/btsIdhqHRJk/kHaGq8wfjLHKjmdUZWD3H1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/TXSbE/btsIdhqHRJk/kHaGq8wfjLHKjmdUZWD3H1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FTXSbE%2FbtsIdhqHRJk%2FkHaGq8wfjLHKjmdUZWD3H1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1202" data-origin-height="608"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">셋업이 완료되면 뭘 더 해야하는지 터미널에서 힌트를 준다.</p>
<p data-ke-size="size16">먼저 cd 프로젝트폴더명 을 입력해서 디렉토리를 이동시킨다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">다음 yarn 또는 yarn install 을 입력해서 의존성을 전부 설치한다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1156" data-origin-height="582"><span data-url="https://blog.kakaocdn.net/dn/bvM1se/btsIbJCedsk/nzbRjBQd96AG8GJWjnhP00/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/bvM1se/btsIbJCedsk/nzbRjBQd96AG8GJWjnhP00/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbvM1se%2FbtsIbJCedsk%2FnzbRjBQd96AG8GJWjnhP00%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1156" data-origin-height="582"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">리액트 + 타입스크립트 셋업이 잘 됐는지 보려면 tsconfig.json 파일과</p>
<p data-ke-size="size16">src 폴더 내에 jsx 파일이 아닌 tsx 파일이 잘 만들어졌는지 확인한다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2014" data-origin-height="1366"><span data-url="https://blog.kakaocdn.net/dn/bdSe93/btsIdfNbPSr/MZoIqWmqTwiwOnP36kqtwK/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/bdSe93/btsIdfNbPSr/MZoIqWmqTwiwOnP36kqtwK/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbdSe93%2FbtsIdfNbPSr%2FMZoIqWmqTwiwOnP36kqtwK%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="2014" data-origin-height="1366"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그리고 app.css와 같은 불필요한 파일을 전부 지워준다.</p>
<h3 data-ke-size="size23">폴더 구조 설정하기</h3>
<pre id="code_1719330630705" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>src/
├── api/
│   └── api.ts
├── components/
│   ├── CountryCard.tsx
│   └── CountryList.tsx
├── hooks/
│   └── useCountryQuery.ts
├── types/
│   └── countryTypes.ts
├── App.tsx
└── index.tsx</code></pre>
<h3 data-ke-size="size23">API 호출하기</h3>
<h4 data-ke-size="size20">응답값 확인하기</h4>
<p data-ke-size="size16">API 응답값이 어떻게 되는지 미리 확인을 해본다.</p>
<p data-ke-size="size16">크롬 확장 프로그램을 설치하고 웹 브라우저에서 직접 주소를 넣어서 접속해봐도 되고, VSCode Extension에서 THUNDER CLIENT라는 확장 프로그램으로 미리 API 요청을 보내고 응답값을 확인해봐도 좋다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">사실 가장 좋은 것은 API 명세서를 보고 파악하는 것이겠지만, 본인이 못 찾는 것인지 위 API에서는 명세만 보고 파악하기가 어려웠다.</p>
<p data-ke-size="size16">썬더 클라이언트를 설치하면 VSCode 좌측 메뉴 아래에 아래와 같은 아이콘이 생기는데 이곳에서 New Request를 누른다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="882" data-origin-height="1130"><span data-url="https://blog.kakaocdn.net/dn/Xvp3Z/btsIaF1pfuf/94soOyngySWlNu44obgHYK/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/Xvp3Z/btsIaF1pfuf/94soOyngySWlNu44obgHYK/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FXvp3Z%2FbtsIaF1pfuf%2F94soOyngySWlNu44obgHYK%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="882" data-origin-height="1130"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그 다음 별도로 파라미터(엔드포인트)를 설정할 것은 없으니, 해당 URL로 GET 요청을 보내보면 응답값과 용량, HTTP 상태와 응답에 소요된 시간까지 출력해준다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1862" data-origin-height="1790"><span data-url="https://blog.kakaocdn.net/dn/buSz3u/btsIcDumS5a/M0lSkZPKX9JE05sNJARDh1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/buSz3u/btsIcDumS5a/M0lSkZPKX9JE05sNJARDh1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbuSz3u%2FbtsIcDumS5a%2FM0lSkZPKX9JE05sNJARDh1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1862" data-origin-height="1790"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">국가 카드를 렌더링 하기 위해서 나에게 필요한 정보는 (1) 국기 이미지 파일 url (2) 국가명 (3) 수도이다. 이게 어떤 필드에 담겨 있는지 체크해봐야 한다.</p>
<h4 data-ke-size="size20">응답값 타입 지정하기</h4>
<p data-ke-size="size16">그리고 해당 필드가 값이 있을 수도 있고 없을 수도 있기 때문에 API 요청의 타입을 지정해줄 때 프로퍼티에 ? 물음표를 붙이든 | undefined 처리를 해주든 union 타입으로 설정해주는 것이 제일 best practice이긴 하나, API 명세에서도 그 내용을 알려주지 않는 것 같고(못 찾는 것일 수도 있다) 데이터 양이 너무 많아 다 검토하기 어려우니, 일단 모든 필드가 있다고 가정하고 API 응답값의 타입을 지정해주겠다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">여기서 두 가지 방법이 있을 것 같다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">1. API 응답값 전체 프로퍼티를 모두 타입 지정하기</p>
<p data-ke-size="size16">2. 그 응답값 중 필요한 프로퍼티만 타입을 지정하기</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">API 응답값이 너무 길어 읽기가 어렵다면 노동력이 많이 필요하겠지만 1번을 하고 2번처럼 지워도 될 것 같다.</p>
<p data-ke-size="size16">이번 API가 그렇다. 너무 API 응답값이 길어서 필요한 것만 추려내기가 어렵다. 물론 API 명세에 가보면 해당 필드만 응답 받을 수 있는 파라미터를 제공한다. 하지만 이번 과제의 요구조건이 엔드포인트 /all 로 API 요청을 보내는 것이기에 일단 보내고 응답받은 데이터 중 필요한 데이터를 추려내도록 한다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1719335336060" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// src/types/countryTypes.ts
<p>export type CountryData = {
name: {
common: string;
official: string;
};
cca3: string;
capital: string[];
flags: {
png: string;
};
};</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">API의 응답값 중 하나의 아이템(인덱스)가 어디까지인지 response 를 보고 파악해야 하고, 그 만큼을 긁어 와서 타입을 만들어 줄 파일에 넣고 응답값을 보고 타입을 지정해주면 된다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">여기서 중복되는 타입이나 객체들은 extends 등으로 더 축약해도 좋다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">가장 먼저 해야 할 일은 <b>API 응답값 중 어떤 필드가 중복되지 않는 고유한 값</b>인지 파악해서 그 값을 map 돌릴 때 id로 사용해야 한다. map 메서드를 사용할 때 파라미터로 index를 주고 그것을 key로 줘도 되지만, 추후 페이지가 많아져서 URL 파라미터의 값으로 넘겨야 할 때, 원본 데이터 배열의 값이 바뀌어서 인덱스가 틀어지면 고유한 값이 아니게 되기 때문에 좋은 방법은 아닌 것 같다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위 API에서는 cca3가 국가별 고유한 코드라고 하니 이것을 아이템의 id로 사용하면 될 것 같다.</p>
<h4 data-ke-size="size20">API 요청 함수 작성하기</h4>
<pre id="code_1719336770253" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// src/api/api.tsx
<p>import axios from &quot;axios&quot;;
import { CountryData } from &quot;../types/countryTypes&quot;;</p>
<p>export const fetchCountries = async () : Promise&lt;CountryData[]&gt; =&gt; {
const response = await axios.get('https://restcountries.com/v3.1/all');
return response.data;
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>import axios from "axios";
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>fetch 함수 대신 axios 라이브러리를 사용할 것이니 axios를 먼저 설치해주어야 한다. (yarn add axios)</li>
<li>이번 과제는 GET 요청 하나 뿐이라 axios 인스턴스는 별도로 설정하지 않겠다.</li>
</ul>
</li>
<li>import { CountryData } from ".../types/countryTypes";
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>CountryData는 아까 만든 API 요청값에 대한 타입을 지정해준 파일이다. 함수의 return 값을 Generic으로 설정해주기 위해 필요하다.</li>
<li>제네릭이란, 타입스크립트에서 함수나 클래스의 타입을 지정해줄 때 사용하는 것인데,&nbsp; 타입을 여기서 지정하지 않고 사용하는 시점에 정하겠다는 의미이다. 쉽게 이야기하자면 다른 곳에서 지정하겠다는 이야기이다.</li>
<li>CountryData라는 타입은 하나의 객체다. 응답값 전체의 타입을 지정한 게 아니라 대표로 아이템 하나만 뽑아서 지정해준 것이다. 그리고 그것들이 모여서 API의 전체 응답값인 배열이 된다. 따라서 CountryData라는 타입이 모여서 [] 배열로 반환될 것이라고는 알려준 것인데, CountryData는 외부에서 지정되었기 때문에 어떤 타입이 오는 지는 이 fetch 함수에서 정할 게 아니라 그곳에서 정하는 것이다. 제네릭에 대한 자세한 설명은 바로 밑에서 더 다뤄보겠다.</li>
</ul>
</li>
<li>export const fetchCountries = async () : Promise&lt;CountryData[]&gt; =&gt; { ... }<br />
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이 부분이 타입스크립트에서 가장 핵심이다.</li>
<li>fetch 함수의 return값은 Promise 타입이다. 따라서 return 값의 타입으로 Promise를 지정해주고, &lt;CountryData[]&gt; 과 같이 Generic으로 아까 만든 API 요청 응답값의 타입을 지정해주면 된다. 그리고 이 API 응답값은 하나의 배열로 반환되기에 대괄호까지 넣어준다.</li>
</ul>
</li>
<li>const response = await axios.get('url...');
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>이 외에는 자바스크립트에서 axios로 API 요청하는 패턴과 동일하다.</li>
</ul>
</li>
</ul>
<p data-ke-size="size16"><b>Generic(제네릭)이란?</b></p>
<p data-ke-size="size16">타입스크립트에서는 함수든 변수든 표현식이든 타입을 지정해주어야 한다. 그런데 아래와 같이 제네릭으로 설정하면 함수를 선언하는 당시에 타입을 지정하는 것이 아니라 사용하는 시점에서 제네릭을 받아서 타입을 지정해줄 수 있기 때문에 조금 더 유연하게 함수를 작성할 수 있다.</p>
<p data-ke-size="size16">단, 어떤 타입의 결과값이 오는지 [] 배열인지 정도는 작성해주어야 한다. 단일 타입, 객체 타입, 배열 타입 모두 가능하다. 이는 내용이 길어지므로 별도 포스트로 다뤄보겠다.</p>
<pre id="code_1719338216202" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>function getArray&lt;T&gt;(items: T[]): T[] {
    return new Array&lt;T&gt;().concat(items);
}
<p>// 사용 예시
let numberArray = getArray&lt;number&gt;([1, 2, 3, 4]);
let stringArray = getArray&lt;string&gt;([&quot;hello&quot;, &quot;world&quot;]);</code></pre></p>
<h4 data-ke-size="size20">TanStack Query 커스텀 훅 작성하기</h4>
<p data-ke-size="size16">이 과제에 이 과정이 필요할 지 잘 모르겠지만, 팀 프로젝트에서의 경험을 기반으로 API 요청 중 특히 GET 요청에 해당하는 내용은 탄스택쿼리로 작성하면 캐싱을 통하여 대역폭을 절약할 수 있어 매우 도움이 되었고, 또 이것을 커스텀 훅으로 작성해두면 데이터가 필요하거나 캐싱된 데이터가 필요한 곳에서 커스텀 훅만 import 하면 되기 때문에 매우 편리했다.</p>
<p data-ke-size="size16">+ 참고로 탄스택 쿼리가 데이터를 stale하다고 판단해서 데이터 fetch를 새로 요청하는 조건이 세 가지 정도 있는데, 그것은 React 카테고리에서 별도로 작성하였다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">어쨌든 탄스택쿼리 사용 습관을 들이기 위해 이번에도 이 과정을 추가해보았다.</p>
<pre id="code_1719338724916" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// src/hooks/useCountryQuery.ts
<p>import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchCountries } from '../api/api';
import { CountryData } from '../types/countryTypes';</p>
<p>const useCountryQuery = (): UseQueryResult&lt;CountryData[], Error&gt; =&gt; {
return useQuery&lt;CountryData[], Error&gt;({
queryKey: ['country'],
queryFn: fetchCountries,
});
};</p>
<p>export default useCountryQuery;</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>먼저 탄스택 쿼리를 설치한다. (yarn add @tanstack/react-query)</li>
<li>import { useQuery, UseQueryResult } from '@tanstack/react-query';
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>useQuery 훅을 사용하는 것은 자바스크립트 때와 같다. 근데 처음 보는 UseQueryResult 때문에 애를 많이 먹었는데, 파스칼 케이스로 작성된 것을 보아 타입임을 알 수 있다.</li>
<li>UseQueryResult는 tanstack에서 제공하는 useQuery의 반환값 타입이다. 편하게 갖다 쓰면 된다.</li>
</ul>
</li>
<li>import { fetchCountires } from '../api/api';
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>아까 만든 axios GET 요청 함수이다. 쿼리 펑션에 넣기 위해 필요하다.</li>
</ul>
</li>
<li>import { CountryData } from '../types/countryTypes';
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>API 요청으로 받은 응답값의 타입을 지정했던 것이다.</li>
</ul>
</li>
<li>const useCountryQuery = () : UseQueryResult&lt;CountryData[], Error&gt; =&gt; { ... }
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>useCountryQuery라는 커스텀 훅을 만들 것이다. 나중에 다른 컴포넌트에서 이 쿼리 키를 호출할 때는 이 훅을 호출한다.</li>
<li>이 함수의 반환 값은 탄스택 쿼리에서 제공하는 UseQueryResult를 사용한다.</li>
<li>그리고 제네릭으로 아까 만든 CountryData라는 응답값의 타입을 사용하고 배열로 지정한다.</li>
<li>Promise는 Error 도 반환하기 때문에 명시해준다.</li>
</ul>
</li>
<li>return useQuery&lt;CountryData[], Error&gt;( { ... } )
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>useQuery 훅으로 쿼리 키와 쿼리 펑션을 지정할 것인데, 이렇게 fetch 해서 나온 반환 값을 제네릭으로 설정해준다.</li>
<li>그 외 나머지 쿼리 키와 쿼리 펑션은 자바스크립트에서 쓰던 패턴과 동일하다.</li>
</ul>
</li>
</ul>
<h3 data-ke-size="size23">CountryList.tsx 컴포넌트 구현</h3>
<h4 data-ke-size="size20">기본 레이아웃 구성</h4>
<pre id="code_1719341015772" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// src/components/CountryList.tsx
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
<h2 data-ke-size="size26">과제 하다 생긴 궁금중</h2>
<p data-ke-size="size16"><b>첫번째</b></p>
<pre id="code_1719332296372" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// types/countryTypes.ts
<p>// 물음표 없는 것</p>
<p>export type CountryData = {
name: {
common: string;
official: string;
};
cca3: string;
capital: string[];
flags: {
png: string;
};
};</p>
<p>// 전부 다 물음표 있는 것</p>
<p>export type CountryData = {
name?: {
common?: string;
official?: string;
};
cca3?: string;
capital?: string[];
flags?: {
png?: string;
};
};</p>
<p>// 없을 수도 있을 것 같은 필드에만 물음표 붙이는 것</p>
<p>export type CountryData = {
name: {
common: string;
official: string;
};
cca3: string;
capital?: string[];
flags: {
png: string;
};
};</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>위 세 개가 전부 동일하게 작동하는 점</li>
<li>그렇다면 API 명세에서 필드의 값이 있을 수도 있고 없을 수도 있다는 정보를 불성실하게 주는 경우 어떤 것이 best practice인지? 일일이 샘플링 한다는 것은 말이 안 되는 것 같은데...</li>
</ul>
<p data-ke-size="size16"><b>두번째</b></p>
<pre id="code_1719332661139" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// types/countryTypes.ts
<p>export type CountryData = {
name: {
common: number;
official: string;
};
cca3: string;
capital: string[];
flags: {
png: string;
};
};</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>위에서 common 필드의 타입이 원래는 string이 맞는데 number로 바꿔도 컴파일 에러도 없고 브라우저 에러도 없음. 잘 작동됨. 이러면 타입스크립트에서 API 호출값의 타입을 지정하는 이유가 무엇인가?</li>
<li>타입 자체를 없애버리면 컴파일 에러는 나는데 자바스크립트(브라우저) 작동은 됨.</li>
</ul>
<p data-ke-size="size16"><b>세번째</b></p>
<pre id="code_1719332807214" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>  const test = () =&gt; {
    if (countries) {
      console.log(countries[0].name.common + 1111);
    } else {console.log('no')}
  }
<p>useEffect() =&gt; {
test();
, []}</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>common의 타입을 string으로 지정한 상태에서 number 타입을 더했을 때, 타입스크립트에서는 number 타입 간의 연산만을 허용하는 것으로 알고 있는데, 콘솔에 아래처럼 찍힘.</li>
</ul>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1362" data-origin-height="378"><span data-url="https://blog.kakaocdn.net/dn/c55306/btsIaDCEOde/Mj8zg62hV184IJkh4KXgVK/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/c55306/btsIaDCEOde/Mj8zg62hV184IJkh4KXgVK/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fc55306%2FbtsIaDCEOde%2FMj8zg62hV184IJkh4KXgVK%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1362" data-origin-height="378"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>타입스크립트에서 타입을 지정하는 이유가 아래와 같은 계산을 코드 작성하는 단계에서 막기 위함으로 알고 있는데, 잘못 알고 있었던 것인가? 에러가 뜨지 않음!</li>
</ul>
<pre id="code_1719334279043" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>const a : number = 1;
const b : string = "1";
console.log(a + b);</code></pre>
<p data-ke-size="size16">&nbsp;</p>