<h3 data-ke-size="size23">1. husky 추가</h3>
<pre class="dockerfile"><code>pnpm add husky</code></pre>
<h3 data-ke-size="size23">2. husky init</h3>
<pre class="bash"><code>pnpm exec husky init</code></pre>
<h3 data-ke-size="size23">3. package.json 수정</h3>
<p data-ke-size="size16">lint 와 format 만 수정</p>
<pre class="javascript" data-ke-language="javascript"><code>{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint --cache .",
    "prepare": "husky",
    "format": "prettier --cache --write ."
  }
}</code></pre>
<h3 data-ke-size="size23">4. pre-commit, pre-push 파일 작성</h3>
<p data-ke-size="size16">pre-commit</p>
<pre class="ebnf"><code>pnpm lint</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">pre-push</p>
<pre class="dos"><code>pnpm format</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">추가. build 및 chore 커밋 자동화</h3>
<p data-ke-size="size16">위까지 설정해도 린팅 및 포맷팅이 잘 되지만 문제가 하나 있습니다.<br />매번 commit &amp; push 실행후 .eslintcache 파일이 생성되거나,</p>
<p data-ke-size="size16"><br />포맷팅으로 인해 파일이 변경되어 다시 commit &amp; push 를 해야하는 상황이 빈번합니다.</p>
<p data-ke-size="size16">또한 build 는 실행하지 않으므로, 이 과정에 build 도 추가하고 싶었습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">최종 설정은 아래와 같습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">먼저 package.json 입니다. lint-staged 부분을 추가합니다.</p>
<pre class="javascript" data-ke-language="javascript"><code>{
  //...
    "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "prepare": "husky",
    "format": "prettier --cache --write .",
    "lint": "eslint --cache .",
    "test": "jest",
    "lint-staged": "pnpm dlx lint-staged"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json,yaml,yml}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  },
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">다음으로 pre-commit 입니다.<br />.husky/pre-commit</p>
<pre class="javascript" data-ke-language="javascript"><code>pnpm lint-staged</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">다음으로 pre-push 입니다. 여기에 build가 추가되었습니다.<br />.husky/pre-push</p>
<pre class="javascript" data-ke-language="javascript"><code>pnpm format
pnpm build || exit 1</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">다음으로 post-commit 입니다.<br />여기서 commit 후 변경점이 있다면 다시 commit &amp; push 하고<br />자동으로 커밋 메시지를 남깁니다.<br />.husky/post-commit</p>
<pre class="javascript" data-ke-language="javascript"><code>git add . &amp;&amp; git commit -m "chore: apply lint/format fixes" &amp;&amp; git push</code></pre>