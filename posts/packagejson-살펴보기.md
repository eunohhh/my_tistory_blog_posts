<p data-ke-size="size16">프로젝트를 세팅하고 나면 루트 폴더에 package.json 파일이 생성된다.</p>
<p data-ke-size="size16">React.js를 사용할 때는 이런 내용이 필요가 없었으나, CSR, SSR, SSG, ISR 등 렌더링 방식을 선택해서 사용할 수 있는 Next.js에서는 필요한 명령어들이 들어있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<pre id="code_1720079243312" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">본인이 편한 방식대로 yarn dev 등으로 사용할 수 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>dev : 개발 모드. 웹 브라우저를 띄워 실시간으로 코드의 변경사항이 반영되며 보여준다.</li>
<li>build : 프로덕션 레벨에서 배포하기 전에 우리가 작성한 코드를 서버에서 작동시킬 수 있도록 빌드하는 과정이 필요한데, 이것을 우리의 서버에서 해보는 것이다. React.js 등에서는 vercel 등에 배포하기 전에 이런 서비스들이 이것을 대신해주었던 경험이 있을 것. yarn start를 해서 배포되었을 때의 모습을 웹 브라우저에서 확인해보기 전에 항상 이 빌드를 먼저 해주어야 한다. dev 처럼 코드의 변경사항이 실시간으로 반영되지 않는다.</li>
<li>start : 배포 후의 모습을 브라우저에서 볼 수 있다. 코드의 변경사항이 실시간으로 반영되지 않으니, 코드 변경 후 확인하고자 한다면 build를 새로 해주어야 한다.</li>
<li>lint : Next.js에서 제공하는 ESLint 기본 구성을 사용한다.</li>
</ul>