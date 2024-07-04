<p data-ke-size="size16">Zustand 스토어에서 <code>expends</code>의 초기값을 설정하는 방법으로 <code>useQuery</code>를 사용할 수 있지만, <code>useQuery</code>는 React 컴포넌트 내부에서만 사용할 수 있습니다. 대신 Zustand와 Tanstack Query를 함께 사용하여 상태를 관리할 수 있는 패턴을 사용할 수 있습니다.</p>
<p data-ke-size="size16">다음은 Zustand와 Tanstack Query를 함께 사용하여 초기 데이터를 설정하는 방법입니다.</p>
<h3 data-ke-size="size23">1. Tanstack Query와 Zustand 설정</h3>
<p data-ke-size="size16">먼저, <code>react-query</code> 라이브러리와 Zustand를 설치해야 합니다.</p>
<pre class="css"><code>npm install @tanstack/react-query zustand</code></pre>
<h3 data-ke-size="size23">2. Zustand 스토어 설정</h3>
<p data-ke-size="size16">Zustand 스토어를 설정하고, <code>expends</code> 상태를 관리하는 방법을 정의합니다.</p>
<pre class="typescript"><code>import { create } from "zustand";
<p>interface Ledger {
expends: any;  // 타입을 변경하세요.
month: number;
setExpends: (expends: any) =&gt; void;  // 타입을 변경하세요.
selectMonth: (selectedMonth: number) =&gt; void;
}</p>
<p>const getLsMonth = () =&gt; {
const savedMonth = localStorage.getItem(&quot;selectedMonth&quot;);
return savedMonth ? parseInt(savedMonth, 10) : 1; // 기본값 1월
};</p>
<p>export const useLedgerStore = create&lt;Ledger&gt;((set) =&gt; ({
expends: null,
month: getLsMonth(),
setExpends: (expends) =&gt; set({ expends }),
selectMonth: (selectedMonth: number) =&gt; {
localStorage.setItem(&quot;selectedMonth&quot;, selectedMonth.toString());
set({ month: selectedMonth });
},
}));</code></pre></p>
<h3 data-ke-size="size23">3. React 컴포넌트에서 Tanstack Query와 Zustand 사용</h3>
<p data-ke-size="size16">React 컴포넌트에서 Tanstack Query의 <code>useQuery</code>를 사용하여 데이터를 가져오고, Zustand 스토어에 데이터를 설정합니다.</p>
<pre class="javascript"><code>import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLedgerStore } from '@/zustand/ledgerStore';
import axios from 'axios';
<p>const fetchExpenses = async () =&gt; {
const { data } = await axios.get('https://bedecked-candy-relish.glitch.me/expenses');
return data;
};</p>
<p>const LedgerComponent = () =&gt; {
const { data, error, isLoading } = useQuery(['expenses'], fetchExpenses);
const { expends, setExpends } = useLedgerStore();</p>
<pre><code>useEffect(() =&amp;gt; {
    if (data) {
        setExpends(data);
    }
}, [data, setExpends]);

if (isLoading) return &amp;lt;div&amp;gt;Loading...&amp;lt;/div&amp;gt;;
if (error) return &amp;lt;div&amp;gt;Error: {error.message}&amp;lt;/div&amp;gt;;

return (
    &amp;lt;div&amp;gt;
        &amp;lt;h1&amp;gt;Ledger&amp;lt;/h1&amp;gt;
        {expends ? (
            &amp;lt;pre&amp;gt;{JSON.stringify(expends, null, 2)}&amp;lt;/pre&amp;gt;
        ) : (
            &amp;lt;div&amp;gt;No expenses available&amp;lt;/div&amp;gt;
        )}
    &amp;lt;/div&amp;gt;
);
</code></pre>
<p>};</p>
<p>export default LedgerComponent;</code></pre></p>
<h3 data-ke-size="size23">코드 설명</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>Zustand 스토어 설정</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>setExpends</code> 액션을 정의하여 <code>expends</code> 상태를 업데이트합니다.</li>
<li><code>selectMonth</code> 액션을 정의하여 선택된 월을 업데이트합니다.</li>
</ul>
</li>
<li><b>React 컴포넌트에서 Tanstack Query 사용</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>useQuery</code>를 사용하여 데이터를 비동기적으로 가져옵니다.</li>
<li>데이터를 가져오면 <code>useEffect</code> 훅을 사용하여 Zustand 스토어의 <code>expends</code> 상태를 업데이트합니다.</li>
</ul>
</li>
</ol>
<p data-ke-size="size16">이 패턴을 통해 Zustand와 Tanstack Query를 함께 사용하여 초기 데이터를 설정하고, 상태 관리를 효율적으로 수행할 수 있습니다.</p>