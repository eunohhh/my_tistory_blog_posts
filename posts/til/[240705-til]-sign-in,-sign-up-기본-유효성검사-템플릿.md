<p>로그인, 회원가입, 인풋의 기본 템플릿을 정리합니다.</p>
<h2>인풋</h2>
<pre><code class="language-tsx">// Input.tsx
import { ComponentProps, useId } from &quot;react&quot;;
<p>type InputProps = {
label?: string;
required?: boolean;
type? : &quot;text&quot; | &quot;password&quot;;
} &amp; ComponentProps&lt;&quot;input&quot;&gt;;</p>
<p>function Input({ label, required, id, type = &quot;text&quot;, ...props }: InputProps) {
const inputUid = useId();
const inputId = id || inputUid;</p>
<pre><code>return (
    &amp;lt;div className=&amp;quot;flex flex-col gap-y-1.5 [&amp;amp;+&amp;amp;]:mt-4&amp;quot;&amp;gt;
        {label &amp;amp;&amp;amp; (
            &amp;lt;label htmlFor={inputId} className=&amp;quot;text-sm font-semibold&amp;quot;&amp;gt;
            &amp;lt;span&amp;gt;{label}&amp;lt;/span&amp;gt;
            {required &amp;amp;&amp;amp; &amp;lt;span className=&amp;quot;text-red-500&amp;quot;&amp;gt;*&amp;lt;/span&amp;gt;}
            &amp;lt;/label&amp;gt;
        )}

        &amp;lt;input
            id={inputId}
            name={inputId}
            type={type}
            {...props}
            className=&amp;quot;border border-gray-400 rounded px-4 py-2.5 focus:outline-none focus:border-gray-950 transition&amp;quot;
        /&amp;gt;
    &amp;lt;/div&amp;gt;
);
</code></pre>
<p>}</p>
<p>export default Input;</code></pre></p>
<h2>로그인</h2>
<pre><code class="language-tsx">// Login.tsx
&quot;use client&quot;;
<p>import supabaseClient from &quot;@/supabase/supabaseClient&quot;;
import { useRouter } from &quot;next/router&quot;;
import { ComponentProps } from &quot;react&quot;;
import Input from &quot;../_components/Input&quot;;</p>
<p>function LogInPage() {
const router = useRouter()
const handleSubmit: ComponentProps&lt;&quot;form&quot;&gt;[&quot;onSubmit&quot;] = async (e) =&gt; {
e.preventDefault();
const form = e.currentTarget;
const formData = new FormData(form);
const email = formData.get(&quot;email&quot;) as string;
const password = formData.get(&quot;password&quot;) as string;</p>
<pre><code>    if (!email || !password) return alert(&amp;quot;빈 값이 없도록 해주세요&amp;quot;);
    if (/\s/.test(email) || /\s/.test(password)) 
        return alert(&amp;quot;공백을 포함할 수 없습니다!&amp;quot;);

    if (!emailRegex.test(email)) 
        return alert(&amp;quot;유효한 이메일 주소를 입력하세요!&amp;quot;);

    if (password.length &amp;lt; 4 || password.length &amp;gt; 15) 
        return alert(&amp;quot;비밀번호는 4~15 글자로 해야합니다!&amp;quot;);

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
    });

    if (error) return alert(error.message);
    if (data) return router.push(&amp;quot;/&amp;quot;);
};

return (
    &amp;lt;&amp;gt;
        &amp;lt;form 
            onSubmit={handleSubmit} 
            className=&amp;quot;max-w-sm mx-auto flex flex-col gap-y-8&amp;quot;&amp;gt;

            &amp;lt;div&amp;gt;
                &amp;lt;Input label=&amp;quot;아이디&amp;quot; required id=&amp;quot;email&amp;quot; /&amp;gt;
                &amp;lt;Input label=&amp;quot;비밀번호&amp;quot; required id=&amp;quot;password&amp;quot; type=&amp;quot;password&amp;quot;/&amp;gt;
            &amp;lt;/div&amp;gt;

            &amp;lt;button 
                className=&amp;quot;w-full bg-blue-500 text-white p-2 rounded-md&amp;quot;
                type=&amp;quot;submit&amp;quot;
            &amp;gt;로그인하기&amp;lt;/button&amp;gt;
        &amp;lt;/form&amp;gt;
    &amp;lt;/&amp;gt;
);
</code></pre>
<p>}</p>
<p>export default LogInPage;</code></pre></p>
<h2>회원가입</h2>
<pre><code class="language-tsx">// Signup.tsx
&quot;use client&quot;;
<p>import validateInputs from &quot;@/app/utils/validateInput&quot;;
import supabaseClient from &quot;@/supabase/supabaseClient&quot;;
import { ComponentProps } from &quot;react&quot;;
import Input from &quot;../_components/Input&quot;;</p>
<p>const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;</p>
<p>function SignUpPage() {
const handleSubmit: ComponentProps&lt;&quot;form&quot;&gt;[&quot;onSubmit&quot;] = async (e) =&gt; {
e.preventDefault();</p>
<pre><code>    const form = e.currentTarget;
    const formData = new FormData(form);

    const email = formData.get(&amp;quot;email&amp;quot;) as string;
    const password = formData.get(&amp;quot;password&amp;quot;) as string;
    const passwordCheck = formData.get(&amp;quot;password-check&amp;quot;) as string;
    const nickname = formData.get(&amp;quot;nickname&amp;quot;) as string;

    if (!email || !password || !passwordCheck || !nickname) 
    return alert(&amp;quot;빈 값이 없도록 해주세요&amp;quot;);

    if (password !== passwordCheck) return alert(&amp;quot;비밀번호가 일치하지 않습니다&amp;quot;);

    const hasWhiteSpace = validateInputs(
        [email, password, passwordCheck, nickname]);

    if (hasWhiteSpace) return alert(&amp;quot;공백을 포함할 수 없습니다!&amp;quot;);

    if (!emailRegex.test(email)) alert(&amp;quot;유효한 이메일 주소를 입력하세요!&amp;quot;);
    if (password.length &amp;lt; 4 || password.length &amp;gt; 15) 
        return alert(&amp;quot;비밀번호는 4~15 글자로 해야합니다!&amp;quot;);
    if (nickname.length &amp;lt; 1 || nickname.length &amp;gt; 10) 
        return alert(&amp;quot;닉네임은 1~10 글자로 해야합니다!&amp;quot;);
    if (password !== passwordCheck) return alert(&amp;quot;비밀번호가 일치하지 않습니다.&amp;quot;);

    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: {
                display_name: nickname,
            },
        },
    });

    if (error) return alert(error.message);

    console.dir(data);
};

return (
    &amp;lt;form 
        onSubmit={handleSubmit} 
        className=&amp;quot;max-w-sm mx-auto flex flex-col gap-y-8&amp;quot;&amp;gt;
        &amp;lt;div&amp;gt;
            &amp;lt;Input label=&amp;quot;아이디&amp;quot; required id=&amp;quot;email&amp;quot; /&amp;gt;
            &amp;lt;Input label=&amp;quot;비밀번호&amp;quot; required id=&amp;quot;password&amp;quot; type=&amp;quot;password&amp;quot; /&amp;gt;
            &amp;lt;Input label=&amp;quot;비밀번호 확인&amp;quot; 
                required id=&amp;quot;password-check&amp;quot; type=&amp;quot;password&amp;quot; /&amp;gt;
            &amp;lt;Input label=&amp;quot;닉네임&amp;quot; required id=&amp;quot;nickname&amp;quot; /&amp;gt;
        &amp;lt;/div&amp;gt;
        &amp;lt;button 
            className=&amp;quot;w-full bg-blue-500 text-white p-2 rounded-md&amp;quot; 
            type=&amp;quot;submit&amp;quot;
        &amp;gt;회원가입하기&amp;lt;/button&amp;gt;
    &amp;lt;/form&amp;gt;
);
</code></pre>
<p>}</p>
<p>export default SignUpPage;</code></pre></p>
<h2>기타유용한 함수 등</h2>
<pre><code class="language-ts">// validateInputs.ts
const validateInputs = (inputs: string[]) =&gt; 
    inputs.some((input) =&gt; /\s/.test(input));
<p>export default validateInputs;</code></pre></p>
<pre><code class="language-ts">export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;</code></pre>