<p data-ke-size="size16">모노레포(monorepo) 환경에서 Turborepo를 사용하고 계시며, <code>packages/config-tailwind</code> 경로에 Tailwind CSS 설정을 공유하는 패키지인 <code>@repo/tailwind-config</code>가 있다고 하셨습니다. 이 패키지의 <code>package.json</code>은 다음과 같습니다:</p>
<pre class="javascript" data-ke-language="javascript"><code>{
  "name": "@repo/tailwind-config",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": "./tailwind.config.ts"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "tailwindcss": "^3.4.1"
  }
}</code></pre>
<p data-ke-size="size16">이 상황에서 <b><code>packages/config-tailwind</code> 디렉토리에 <code>public</code> 폴더를 생성해야 하는지 궁금</b>하신 것이군요.</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>결론부터 말씀드리자면, <code>packages/config-tailwind</code>에 <code>public</code> 디렉토리를 생성하는 것은 권장되지 않습니다.</b></h3>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>이유 및 자세한 설명</b></h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b><code>public</code> 디렉토리는 각 애플리케이션별로 존재해야 합니다:</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>public</code> 디렉토리는 일반적으로 <b>웹 애플리케이션의 루트 디렉토리</b>에 위치하며, 정적 자산(이미지, 폰트, 기타 파일 등)을 제공하는 역할을 합니다.</li>
<li><b>공유 패키지(<code>@repo/tailwind-config</code>)는 정적 자산을 직접 제공하는 역할을 하지 않으며</b>, 따라서 <code>public</code> 디렉토리를 갖는 것이 일반적이지 않습니다.</li>
</ul>
</li>
<li><b>공유 패키지에서 정적 자산을 관리하는 것은 복잡성을 증가시킵니다:</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>공유 패키지에 <code>public</code> 디렉토리를 만들고 폰트 파일을 포함시키면, 각 애플리케이션에서 해당 파일에 접근하기 위한 경로 설정과 빌드 설정이 복잡해집니다.</li>
<li>또한, 공유 패키지의 변경이 모든 애플리케이션에 영향을 미칠 수 있어 관리가 어려워집니다.</li>
</ul>
</li>
<li><b>Tailwind CSS의 <code>@font-face</code>에서 경로는 애플리케이션의 <code>public</code> 디렉토리를 기준으로 합니다:</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>@font-face</code>에서 <code>src: url(/fonts/Roboto.woff2)</code>와 같이 절대 경로로 지정하면, 이는 웹사이트의 루트 경로(즉, 애플리케이션의 <code>public</code> 디렉토리)를 기준으로 합니다.</li>
<li>따라서 폰트 파일은 <b>각 애플리케이션의 <code>public/fonts</code> 디렉토리에 위치해야 합니다.</b></li>
</ul>
</li>
</ol>
<h3 data-ke-size="size23"><b>권장되는 해결 방법</b></h3>
<p data-ke-size="size16"><b>각 애플리케이션의 <code>public/fonts</code> 디렉토리에 폰트 파일을 복사하고, 공유 Tailwind 설정에서는 해당 경로를 참조하도록 합니다.</b></p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>폰트 파일을 애플리케이션의 <code>public/fonts</code> 디렉토리에 복사:</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>각 애플리케이션(<code>apps/my-app</code> 등)의 <code>public/fonts</code> 디렉토리에 필요한 폰트 파일(<code>Roboto.woff2</code> 등)을 복사합니다.</li>
<li>이렇게 하면 <code>src: url(/fonts/Roboto.woff2)</code> 경로가 올바르게 해당 파일을 참조할 수 있습니다.</li>
</ul>
</li>
<li><b>공유 Tailwind 설정에서 <code>@font-face</code> 정의 유지:</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>@repo/tailwind-config</code> 패키지의 Tailwind 설정에서 <code>@font-face</code>를 정의할 때 경로를 그대로 사용합니다.</li>
</ul>
<pre class="css" data-ke-language="css"><code>/* packages/config-tailwind/tailwind.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
<p>@layer base {
@font-face {
font-family: 'Roboto';
font-style: normal;
font-weight: 400;
font-display: swap;
src: url(/fonts/Roboto.woff2) format('woff2');
}
}</code></pre></p>
</li>
<li><b>추가적인 설정 없이 폰트 적용 가능:</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>각 애플리케이션은 공유 Tailwind 설정을 사용하면서도, 폰트 파일을 <code>public</code> 디렉토리에 포함함으로써 폰트가 정상적으로 적용됩니다.</li>
</ul>
</li>
</ol>
<h3 data-ke-size="size23"><b>대안 방법</b></h3>
<p data-ke-size="size16">만약 폰트 파일을 공유 패키지에서 관리하고 싶으시다면, 다음과 같은 방법을 고려할 수 있습니다:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>폰트 파일을 NPM 패키지로 배포하고 애플리케이션에서 복사:</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>폰트 파일을 포함하는 별도의 패키지를 만들고, 애플리케이션에서 해당 패키지를 설치합니다.</li>
<li>빌드 스크립트나 설정을 통해 폰트 파일을 애플리케이션의 <code>public/fonts</code> 디렉토리로 복사합니다.</li>
</ul>
</li>
<li><b>CDN이나 외부 경로 사용:</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>폰트 파일을 CDN이나 외부 서버에 호스팅하고, <code>@font-face</code>에서 해당 URL을 사용합니다.</li>
<li>예:</li>
<li><code class="language-css">@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://your-cdn.com/fonts/Roboto.woff2') format('woff2');
}</code></li>
</ul>
</li>
<li><b>상대 경로 사용 및 빌드 설정 조정:</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>@font-face</code>에서 상대 경로를 사용하고, 빌드 도구(Webpack 등)의 설정을 조정하여 폰트 파일을 번들링합니다.</li>
<li>그러나 이 방법은 설정이 복잡해질 수 있으며, 공유 패키지에서 정적 자산을 관리하는 것은 권장되지 않습니다.</li>
</ul>
</li>
</ol>
<h3 data-ke-size="size23"><b>권장 방안 요약</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>폰트 파일은 각 애플리케이션의 <code>public/fonts</code> 디렉토리에 포함시킵니다.</b></li>
<li><b>공유 Tailwind 설정은 폰트의 경로를 <code>/fonts/Roboto.woff2</code>와 같이 절대 경로로 유지합니다.</b></li>
<li><b>애플리케이션별로 별도의 설정이나 추가 작업 없이 폰트가 정상적으로 적용됩니다.</b></li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>추가적인 고려 사항</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>모노레포 환경에서의 정적 자산 관리:</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>모노레포에서 공유 패키지는 일반적으로 코드나 설정을 공유하며, 정적 자산(이미지, 폰트 등)은 각 애플리케이션에서 관리하는 것이 좋습니다.</li>
<li>이는 애플리케이션별로 필요한 자산만 포함할 수 있고, 빌드 및 배포 과정에서 불필요한 파일을 제외할 수 있기 때문입니다.</li>
</ul>
</li>
<li><b>빌드 도구 및 프레임워크의 특성 고려:</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Next.js나 CRA(Create React App) 등 사용 중인 프레임워크의 정적 자산 처리 방식을 이해하고, 그에 맞게 폰트 파일을 배치합니다.</li>
<li>빌드 설정을 복잡하게 변경하지 않고도 폰트가 적용되도록 하는 것이 유지보수에 유리합니다.</li>
</ul>
</li>
<li><b>폰트 파일의 라이선스 확인:</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>사용하는 폰트 파일이 라이선스상 재배포나 공유에 문제가 없는지 확인하시기 바랍니다.</li>
</ul>
</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>결론</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b><code>packages/config-tailwind</code> 디렉토리에 <code>public</code> 폴더를 생성하지 않는 것이 좋습니다.</b></li>
<li><b>폰트 파일은 각 애플리케이션의 <code>public</code> 디렉토리에 포함시키고, 공유 Tailwind 설정에서는 해당 경로를 참조하도록 합니다.</b></li>
<li><b>이렇게 하면 모노레포 환경에서의 복잡성을 줄이고, 각 애플리케이션에서 폰트가 정상적으로 적용될 수 있습니다.</b></li>
</ul>
<hr data-ke-style="style1" />
<p data-ke-size="size16"><b>도움이 되었길 바랍니다!</b> 추가적인 질문이나 더 자세한 설명이 필요하시면 언제든지 말씀해 주세요.</p>