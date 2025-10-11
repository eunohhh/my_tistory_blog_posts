<h2 data-ke-size="size26">  문제정의</h2>
<p data-ke-size="size16">React에서 디바운스 기능이 필요한 상황에 대응하기 위해 직접 커스텀 훅 <code>useDebounce</code>를 만들어 사용하고 있었습니다.<br />기본적으로 <code>useCallback</code>과 <code>useRef</code>만으로 구현했기 때문에 간단하고 직관적이었으나,<br />콜백이 최신 상태를 반영하지 않거나 props로 전달 시 리렌더링을 유발하는 등의 <b>숨겨진 안정성 문제</b>가 있었습니다.</p>
<p data-ke-size="size16">원래 코드</p>
<pre class="typescript" data-ke-language="typescript"><code>import { useCallback, useRef } from "react";
<p>type Debounce&lt;T extends unknown[]&gt; = (...args: T) =&gt; void;</p>
<p>export const useDebounce = &lt;T extends unknown[]&gt;(
func: (...args: T) =&gt; void,
delay: number,
): Debounce&lt;T&gt; =&gt; {
const timerRef = useRef&lt;ReturnType&lt;typeof setTimeout&gt; | null&gt;(null);</p>
<pre><code>return useCallback(
    (...args: T) =&amp;gt; {
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() =&amp;gt; {
            func(...args);
        }, delay);
    },
    [func, delay],
);
</code></pre>
<p>};</code></pre></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">  해결과정</h2>
<h3 data-ke-size="size23">  오픈소스 코드 분석</h3>
<p data-ke-size="size16"><a href="https://github.com/Kiranism/next-shadcn-dashboard-starter">Next.js 기반 대시보드 오픈소스 프로젝트</a>에서<br /><code>useDebouncedCallback</code>과 <code>useCallbackRef</code>라는 조합이 더 안정적이고 범용적인 형태로 사용되고 있는 것을 발견했습니다.</p>
<h3 data-ke-size="size23">  주요 개선점</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>명확한 네이밍</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>useDebounce</code> &rarr; <code>useDebouncedCallback</code>으로 변경하여 역할을 보다 명확히 표현</li>
<li><code>func</code> &rarr; <code>callback</code>으로 의미를 명확히 드러냄</li>
</ul>
</li>
<li><b><code>useCallbackRef</code> 도입</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>callback을 ref로 고정하여 최신 상태를 유지하면서도 불필요한 re-render를 막음</li>
<li>내부적으로 <code>useMemo</code>로 클로저를 고정하여 prop으로 전달해도 안전함</li>
</ul>
</li>
<li><b>타입 안정성 강화</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>&lt;T extends unknown[]&gt;</code> &rarr; <code>&lt;T extends (...args: never[]) =&gt; unknown&gt;</code> 변경</li>
<li>전달받는 함수 전체를 제네릭 타입으로 제한하여 <code>Parameters&lt;T&gt;</code>와 <code>ReturnType&lt;T&gt;</code>를 더 정확히 사용할 수 있게 함</li>
</ul>
</li>
</ol>
<p data-ke-size="size16">개선된 코드</p>
<pre class="javascript"><code>// use-callback-ref.ts
<p>/**</p>
<ul>
<li>
<p>콜백을 참조로 변환하여 prop으로 전달될 때 리렌더링을 방지하거나,</p>
</li>
<li>
<p>deps로 전달될 때 효과를 재실행하지 않도록 하는 커스텀훅
*/
export function useCallbackRef&lt;T extends (...args: never[]) =&gt; unknown&gt;(
callback: T | undefined
): T {
const callbackRef = useRef(callback);</p>
<p>useEffect(() =&gt; {
callbackRef.current = callback;
});</p>
<p>// https://github.com/facebook/react/issues/19240
// useCallback이 아닌 useMemo를 쓰는 이유는 위 링크 참고
return useMemo(
() =&gt; ((...args) =&gt; callbackRef.current?.(...args)) as T,
[]
);
}</code></pre></p>
</li>
</ul>
<pre class="javascript"><code>// use-debounced-callback.ts
import { useCallbackRef } from '@/hooks/use-callback-ref';

export function useDebouncedCallback&lt;T extends (...args: never[]) =&gt; unknown&gt;(
    callback: T,
    delay: number
) {
    const handleCallback = useCallbackRef(callback);
    const debounceTimerRef = useRef(0);

    useEffect(() =&gt; {
        return () =&gt; clearTimeout(debounceTimerRef.current);
    }, []);

    return useCallback((...args: Parameters&lt;T&gt;) =&gt; {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(
            () =&gt; handleCallback(...args),
            delay
        );
    }, [handleCallback, delay]);
}</code></pre>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">  배운점 &amp; 인사이트</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>단순히 동작하는 코드와 안전하게 동작하는 코드의 차이</b>를 실감할 수 있었습니다.</li>
<li><code>useCallbackRef</code>와 같은 추상화는 코드 재사용성과 안정성을 동시에 높이는 좋은 패턴임을 알게 되었습니다.</li>
<li>제네릭 타입 설계에서 <code>never[]</code>를 활용한 함수 타입 제약은 타입 추론 정확도를 높이고 실수를 방지할 수 있었습니다.</li>
<li>직접 만든 간단한 훅도, 오픈소스의 관용적인 패턴과 비교해보며 개선 여지를 탐색해보는 습관이 중요하다는 것을 다시 한 번 깨달았습니다.</li>
</ul>