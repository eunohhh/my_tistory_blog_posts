<h2>패스워드 저장 방법</h2>
<p>패스워드는 <strong>절대 평문으로 저장하면 안 되고</strong>, 해싱해서 저장해야 합니다.</p>
<h3>1. bcrypt 설치</h3>
<pre><code class="language-bash">pnpm add bcrypt
pnpm add -D @types/bcrypt</code></pre>
<h3>2. 회원가입 시 패스워드 해싱</h3>
<pre><code class="language-typescript">// app/api/auth/signup/route.ts
import bcrypt from &#39;bcrypt&#39;;
import { prisma } from &#39;@/lib/prisma&#39;;
<p>export async function POST(request: Request) {
const { email, nickname, password } = await request.json();</p>
<p>// 패스워드 해싱 (saltRounds: 10~12 권장)
const hashedPassword = await bcrypt.hash(password, 10);</p>
<p>const user = await prisma.user.create({
data: {
email,
nickname,
password: hashedPassword, // 해싱된 패스워드 저장
},
});</p>
<p>return Response.json({ user: { id: user.id, email: user.email } });
}</code></pre></p>
<h3>3. 로그인 시 패스워드 검증</h3>
<pre><code class="language-typescript">// 로그인 시
const isValidPassword = await bcrypt.compare(inputPassword, user.password);</code></pre>
<p><strong>핵심</strong>:</p>
<ul>
<li>DB에는 해싱된 패스워드만 저장</li>
<li>로그인 시에는 입력받은 평문 패스워드를 bcrypt.compare()로 검증</li>
<li>saltRounds는 10~12 정도가 적당 (보안 vs 성능 균형)</li>
</ul>