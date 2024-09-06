<h2 data-ke-size="size26">turborepo 로 monorepo 구성하기(with pnpm)</h2>
<h3 data-ke-size="size23">1) turbo 테일윈드 템플릿으로 monorepo 생성하기</h3>
<pre class="dsconfig"><code>pnpm dlx create-turbo@latest --example with-tailwind</code></pre>
<h3 data-ke-size="size23">2) packages/ui 에 storybook 설치하기</h3>
<pre class="kotlin"><code>cd packages/ui
pnpm dlx storybook@latest init</code></pre>
<h3 data-ke-size="size23">3) apps 폴더 원하는대로 바꾸고, lock파일 삭제후 다시 pnpm install</h3>
<pre class="properties"><code>rm pnpm-lock.yaml
pnpm install</code></pre>
<h3 data-ke-size="size23">4) apps 폴더 하위의 각 app 폴더의 package.json 수정</h3>
<pre class="jboss-cli"><code>"scripts": {
    "dev": "next dev --port 3001", // --port 3001, ---port 3002 등으로 적용
    //....</code></pre>
<h3 data-ke-size="size23">5) 모노레포 루트에서 의존성 설치</h3>
<pre class="stata"><code>pnpm add @tanstack/react-query @tanstack/react-query-devtools react-hook-form react-icons tailwind-merge -w</code></pre>
<h3 data-ke-size="size23">6) .vscode/settings.json 수정</h3>
<pre class="json"><code>{
    "eslint.workingDirectories": [
        {
            "mode": "auto"
        }
    ],
    "editor.codeActionsOnSave": {
        "source.organizeImports": "always",
        "source.fixAll.eslint": "always"
    },
    "editor.formatOnSave": true
}</code></pre>
<h3 data-ke-size="size23">7) .prettierrc.json 파일 설정</h3>
<pre class="json"><code>{
    "semi": true,
    "singleQuote": true,
    "trailingComma": "all",
    "printWidth": 108,
    "tabWidth": 4,
    "endOfLine": "auto",
    "arrowParens": "always"
}</code></pre>
<h3 data-ke-size="size23">참고) env 는 보통 각 app 폴더에 각각 넣는다고 합니다</h3>