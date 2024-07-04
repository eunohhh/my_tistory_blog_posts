<h2 data-ke-size="size26">Layout 컴포넌트</h2>
<pre id="code_1719597890968" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>// src/components/Layout.tsx
<p>import React, { ReactNode } from 'react';</p>
<p>type LayoutProps = {
children: ReactNode;
}</p>
<p>const Layout : React.FC&lt;LayoutProps&gt; = ({ children }) =&gt; {
return (
&lt;div className=&quot;container mx-auto px-4 sm:px-6 md:px-8 py-8 max-w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl&quot;&gt;
{children}
&lt;/div&gt;
);
};</p>
<p>export default Layout;</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>max-w-full: 모바일 장치에서 컨테이너가 전체 너비를 차지하도록 설정</li>
<li>sm:max-w-screen-sm: 작은 화면에서 최대 너비를 screen-sm으로 설정</li>
<li>md:max-w-screen-md: 중간 크기 화면에서 최대 너비를 screen-md로 설정</li>
<li>lg:max-w-screen-lg: 큰 화면에서 최대 너비를 screen-lg로 설정</li>
<li>xl:max-w-screen-xl: 아주 큰 화면에서 최대 너비를 screen-xl로 설정</li>
</ul>
<h2 data-ke-size="size26">라우트 설정</h2>
<pre id="code_1719598007636" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import SponsorDetail from '../pages/SponsorDetail';
import SponsorList from '../pages/SponsorList';
import BankStatement from '../pages/BankStatement';
import ExpenseList from '../pages/ExpenseList';
import ExpenseDetail from '../pages/ExpenseDetail';
import Layout from '../layouts/MainLayout';
<p>const AppRoutes: React.FC = () =&gt; {
return (
&lt;Router&gt;
&lt;Header /&gt;
&lt;Layout&gt;
&lt;Routes&gt;
&lt;Route path=&quot;/&quot; element={&lt;BankStatement /&gt;} /&gt;
&lt;Route path=&quot;/sponsorlist&quot; element={&lt;SponsorList /&gt;} /&gt;
&lt;Route path=&quot;/sponsorlist/detail/:uuid&quot; element={&lt;SponsorDetail /&gt;} /&gt;
&lt;Route path=&quot;/expensedetail&quot; element={&lt;ExpenseDetail /&gt;} /&gt;
&lt;Route path=&quot;/expenselist/detail/:uuid&quot; element={&lt;ExpenseList /&gt;} /&gt;
&lt;/Routes&gt;
&lt;/Layout&gt;
&lt;/Router&gt;
);
};</p>
<p>export default AppRoutes;</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>