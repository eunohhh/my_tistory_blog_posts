<p data-ke-size="size16">오늘부터 next.js 공식문서를 하나씩 파헤쳐보려고 합니다.<br />시작으로, 제가 잘 몰랐던 Template.tsx 부터 해보겠습니다.</p>
<h2 data-ke-size="size26">template.js</h2>
<p data-ke-size="size16">템플릿 파일은 각 하위 레이아웃 또는 페이지를 래핑한다는 점에서 레이아웃과 유사합니다.<br />경로 전체에서 지속적으로 상태를 유지하는 레이아웃과 달리 템플릿은 탐색 시(on Navigation) 각 하위 레이아웃에 대해 새 인스턴스를 만듭니다.</p>
<pre class="javascript"><code>export default function Template({ children }: { children: React.ReactNode }) {
  return &lt;div&gt;{children}&lt;/div&gt;
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1600" data-origin-height="444"><span data-url="https://blog.kakaocdn.net/dn/V4zYu/btsInx8dxm4/4dNS1DSwifXwfkUVQXpWDK/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/V4zYu/btsInx8dxm4/4dNS1DSwifXwfkUVQXpWDK/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FV4zYu%2FbtsInx8dxm4%2F4dNS1DSwifXwfkUVQXpWDK%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1600" data-origin-height="444"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">흔하지는 않지만 원하는 경우 레이아웃 대신 템플릿을 선택할 수 있습니다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>사용 효과(예: 페이지 조회 수 기록) 및 사용 상태(예: 페이지별 피드백 양식)에 의존하는 기능입니다.</li>
<li>기본 프레임워크 동작을 변경하려면 다음과 같이 하세요. 예를 들어 레이아웃 내부의 서스펜스 경계(Suspense Boundaries)는 레이아웃을 처음 로드할 때만 fallback을 표시하고 페이지를 전환할 때는 표시하지 않습니다.</li>
<li>하지만 template.tsx의 경우 모든 탐색(each Navigation)에 fallback이 표시됩니다.</li>
</ul>
<h3 data-ke-size="size23">Props</h3>
<p data-ke-size="size16">props는 필수 이며 layout 과 같이 children 을 받습니다.</p>
<h3 data-ke-size="size23">알아두면 좋은 정보:</h3>
<p data-ke-size="size16">기본적으로  template.tsx는 서버 컴포넌트이지만 "use client"를 통해 클라이언트 컴포넌트로도 사용할 수 있습니다.</p>
<p data-ke-size="size16">사용자가  template.tsx를 공유하는 경로를 탐색하면 컴포넌트의 새 인스턴스가 마운트되고, DOM 요소는 다시 생성되며, state 가 보존되지 않고, effect 는 다시 실행됩니다.</p>
<h3 data-ke-size="size23">결론</h3>
<p data-ke-size="size16">매번 리렌더링이 되고 싶으면 template.tsx<br />아니면 layout.tsx</p>