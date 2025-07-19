<h2 data-ke-size="size26">질문:</h2>
<p data-ke-size="size16">src/generated/prisma/index.d.ts 에 다음 코드가 있는 걸 확인 했는데,</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>export type Post = $Result.DefaultSelection&lt;Prisma.$PostPayload&gt;<br /></code>src/generated/prisma 는 gitignore 처리 되어 있어요.<br /><br />그러면 이거.. git 에 올라가지 않으니 vercel 배포시 오류날 것 같은데,<br />저 export type Post 부분을 prisma 에서 제공하는 인터페이스? 등을 활용해서 제가 작성해야 하나유?</p>
<p data-ke-size="size16">&nbsp;</p>
<hr contenteditable="false" data-ke-type="horizontalRule" data-ke-style="style1" />
<h2 data-ke-size="size26">답변:</h2>
<p data-ke-size="size16">아니요! Vercel 배포 시 자동으로 해결돼요. 걱정하지 마세요!</p>
<h2 data-ke-size="size26">Vercel 배포 과정</h2>
<h3 data-ke-size="size23">1. 빌드 시 자동 생성</h3>
<pre class="json"><code>// package.json
{
  "scripts": {
    "build": "next build",
    "postinstall": "prisma generate --no-engine" // 또는 build 스크립트에 포함
  }
}</code></pre>
<h3 data-ke-size="size23">2. Vercel이 자동으로 실행</h3>
<pre class="sql"><code># Vercel에서 배포 시 자동 실행 순서
1. pnpm install
2. prisma generate  # generated 폴더 자동 생성!
3. next build</code></pre>
<h2 data-ke-size="size26">권장 설정</h2>
<h3 data-ke-size="size23">package.json 스크립트 수정</h3>
<pre class="json"><code>{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate &amp;&amp; next build",
    "postinstall": "prisma generate"
  }
}</code></pre>
<h3 data-ke-size="size23">.gitignore는 그대로 유지</h3>
<pre class="crystal"><code># Prisma
/prisma/generated/
/src/generated/prisma/</code></pre>
<h2 data-ke-size="size26">타입 사용법</h2>
<h3 data-ke-size="size23">생성된 타입 그대로 사용</h3>
<pre class="javascript"><code>// route handler
import { Post, User } from '@prisma/client'
<p>export async function GET(): Promise&lt;Response&gt; {
const posts: Post[] = await prisma.post.findMany()
return Response.json(posts)
}</code></pre></p>
<h3 data-ke-size="size23">프론트엔드에서도 동일하게</h3>
<pre class="angelscript"><code>// components/post-list.tsx
import { Post } from '@prisma/client'
<p>interface Props {
posts: Post[]
}</code></pre></p>
<h2 data-ke-size="size26">결론</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>✅ <code>generated</code> 폴더는 gitignore 유지</li>
<li>✅ Vercel이 배포 시 자동으로 <code>prisma generate</code> 실행</li>
<li>✅ <code>@prisma/client</code>에서 타입 import해서 사용</li>
</ul>
<p data-ke-size="size16">별도로 타입을 만들 필요 없어요!</p>