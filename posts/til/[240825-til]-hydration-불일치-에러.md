<p>이 오류는 <code>React</code>의 <strong>Hydration</strong> 과정에서 발생하는 문제로, 서버에서 렌더링된 HTML과 클라이언트에서 렌더링된 HTML이 일치하지 않을 때 발생합니다. 주어진 상황에서 오류가 발생하는 원인으로는 다음과 같은 가능성을 고려할 수 있습니다:</p>
<h3>1. <strong>비동기 렌더링</strong></h3>
<p>클라이언트 컴포넌트 <code>EveryWorks</code>의 <code>map</code> 함수 내에서 <code>async</code> 함수를 사용하고 있습니다. <code>map</code> 함수 내에서 비동기 작업을 처리하게 되면, <code>React</code>는 서버와 클라이언트 간의 UI가 일치하지 않는다고 인식할 수 있습니다. <code>map</code> 함수 내에서 <code>async</code>를 사용하는 것은 권장되지 않습니다.</p>
<h4>해결 방법:</h4>
<p><code>blurredImages</code>는 이미 서버 컴포넌트에서 비동기 처리로 생성되었기 때문에, 클라이언트 컴포넌트에서는 추가적으로 비동기 처리를 하지 않는 것이 좋습니다.</p>
<pre><code class="language-javascript">{worksData[year].map((image, idx) =&gt; (
    &lt;div
        key={image.txt}
        className=&quot;relative w-[80%] h-auto cursor-pointer&quot;
    &gt;
        &lt;Image
            className={styles.image}
            src={blurredImages[idx].img.imgPath}
            alt={image.txt}
            width={blurredImages[idx].img.width}
            height={blurredImages[idx].img.height}
            onClick={handleClick(image)}
            loading=&quot;lazy&quot;
            placeholder=&quot;blur&quot;
            sizes=&quot;100vw&quot;
            blurDataURL={blurredImages[idx].base64}
        /&gt;
    &lt;/div&gt;
))}</code></pre>
<p>이렇게 수정하면 <code>map</code> 함수 내에서 비동기 작업이 제거되어 <code>React</code>의 Hydration 문제가 발생하지 않습니다.</p>
<h3>2. <strong>상태 동기화 문제</strong></h3>
<p><code>useState</code>로 관리되는 <code>selected</code> 상태와 관련된 동기화 문제도 원인일 수 있습니다. 이 상태가 초기 렌더링과 클라이언트 측에서 다르게 해석될 가능성이 있습니다. 그러나 주로 이 문제는 비동기 작업과 관련이 깊습니다.</p>
<h3>3. <strong>컴포넌트 구조 및 조건부 렌더링</strong></h3>
<p>컴포넌트가 조건에 따라 다른 렌더링 구조를 가질 경우, 서버와 클라이언트에서 서로 다른 렌더링 결과를 초래할 수 있습니다. 예를 들어, 특정 연도에 따라 렌더링 구조가 완전히 다르다면 Hydration 오류가 발생할 수 있습니다.</p>
<h3>해결 방법:</h3>
<ul>
<li><p><strong>조건부 렌더링을 간소화</strong>: 조건부 렌더링을 너무 복잡하게 만들지 않고, 서버에서와 클라이언트에서 일관된 구조로 렌더링되도록 유지하는 것이 좋습니다.</p>
</li>
<li><p><strong>Suspense 처리</strong>: 서버 컴포넌트에서 <code>Suspense</code>를 사용할 때, <code>fallback</code>이 적절히 처리되지 않으면 클라이언트와 서버 간의 미스매치가 발생할 수 있습니다. Suspense의 <code>fallback</code>이 올바르게 작동하는지 확인하십시오.</p>
</li>
</ul>
<h3>결론:</h3>
<ol>
<li><strong>비동기 작업</strong>을 <code>map</code> 함수 내에서 하지 않도록 수정합니다.</li>
<li><strong>조건부 렌더링</strong>이 서버와 클라이언트에서 동일하게 수행되는지 확인합니다.</li>
<li><strong>Suspense</strong> 관련 처리가 올바르게 되어 있는지 검토합니다.</li>
</ol>
<p>이러한 방법으로 문제를 해결할 수 있을 것입니다. Hydration 문제는 서버와 클라이언트 렌더링의 불일치에서 발생하므로, 두 렌더링이 일관되게 동작하도록 유지하는 것이 핵심입니다.</p>