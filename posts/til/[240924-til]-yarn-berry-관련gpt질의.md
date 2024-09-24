<h2 data-ke-size="size26">Q1 yarn berry 적용법</h2>
<p data-ke-size="size16">yarn berry 도입에 대한 질문이 있습니다.<br />점차 개발 폴더들이 많아 지면서 용량을 많이 차지하기 시작했습니다.<br />여기서 가장 크게 용량을 반복적으로 차지하는 것은 node_modules 입니다.<br />그래서 yarn berry 를 도입하려고 합니다.<br />방법을 순차적으로 알려주세요.</p>
<h2 data-ke-size="size26">A1</h2>
<p data-ke-size="size16">Yarn Berry(또는 Yarn 2)는 <code>node_modules</code> 폴더를 제거하고 패키지 종속성을 효율적으로 관리하는 데 도움을 줍니다. 이는 프로젝트의 용량을 줄이고 성능을 개선하는 데 유리합니다. Yarn Berry를 도입하는 방법을 순차적으로 설명하겠습니다.</p>
<h3 data-ke-size="size23">1. Yarn 설치 확인</h3>
<p data-ke-size="size16">먼저, Yarn이 시스템에 설치되어 있는지 확인합니다. 터미널에서 다음 명령어를 실행해보세요:</p>
<pre class="ada"><code>yarn --version</code></pre>
<p data-ke-size="size16">Yarn이 설치되어 있지 않다면, 다음 명령어를 통해 Yarn을 설치할 수 있습니다:</p>
<pre class="cmake"><code>npm install -g yarn</code></pre>
<h3 data-ke-size="size23">2. 프로젝트에 Yarn Berry(또는 Yarn 2) 설정</h3>
<p data-ke-size="size16">프로젝트에서 Yarn Berry로 마이그레이션하려면 프로젝트 루트에서 다음 명령어를 실행하세요:</p>
<pre class="applescript"><code>yarn set version berry</code></pre>
<p data-ke-size="size16">이 명령어를 실행하면 <code>.yarn/releases</code> 폴더에 <code>yarn-X.Y.Z.cjs</code> 파일이 생성되며, Yarn 버전이 Berry로 설정됩니다.</p>
<h3 data-ke-size="size23">3. <code>.yarnrc.yml</code> 파일 생성</h3>
<p data-ke-size="size16">프로젝트 루트에 <code>.yarnrc.yml</code> 파일이 생성됩니다. 이 파일에서 Yarn 설정을 관리할 수 있습니다. 기본적으로 아래와 같은 설정이 포함될 수 있습니다:</p>
<pre class="groovy"><code>nodeLinker: 'pnp'</code></pre>
<p data-ke-size="size16">이 설정은 Yarn Berry가 <code>node_modules</code> 폴더 대신 Plug'n'Play(PnP) 모드를 사용하도록 지정합니다.</p>
<h3 data-ke-size="size23">4. PnP 사용 설정</h3>
<p data-ke-size="size16">PnP는 <code>node_modules</code> 폴더를 생성하지 않고, 필요한 모듈을 바로 참조하는 방식입니다. 이미 설정된 것처럼 <code>.yarnrc.yml</code>에 <code>nodeLinker: 'pnp'</code> 설정이 되어 있다면 추가 설정은 필요하지 않습니다.</p>
<h3 data-ke-size="size23">5. <code>.gitignore</code> 설정</h3>
<p data-ke-size="size16"><code>.yarn/</code> 폴더와 <code>.pnp.cjs</code> 파일을 Git에 커밋해야 합니다. <code>.gitignore</code> 파일에 다음 내용을 추가해 주세요:</p>
<pre class="jboss-cli"><code>.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions
.pnp.cjs</code></pre>
<h3 data-ke-size="size23">6. 의존성 설치</h3>
<p data-ke-size="size16">이제 프로젝트의 의존성을 설치하세요. 기존 <code>node_modules</code>를 삭제한 후, 다음 명령어를 실행합니다:</p>
<pre class="cmake"><code>yarn install</code></pre>
<p data-ke-size="size16">이 명령어는 의존성을 설치하고 PnP 캐시를 생성합니다.</p>
<h3 data-ke-size="size23">7. 에디터 설정</h3>
<p data-ke-size="size16">PnP 모드에서는 IDE 또는 텍스트 에디터가 설정되어 있어야 합니다. VSCode를 사용 중이라면 <code>Yarn PnP</code> 플러그인을 설치하고, <code>.vscode/settings.json</code>에 다음을 추가하세요:</p>
<pre class="json"><code>{
  "typescript.tsdk": ".yarn/sdks/typescript/lib"
}</code></pre>
<h3 data-ke-size="size23">8. PnP 환경에서의 명령어 사용</h3>
<p data-ke-size="size16">기존 명령어는 그대로 사용할 수 있으며, <code>yarn add &lt;패키지명&gt;</code> 명령어로 패키지를 추가하고, <code>yarn remove &lt;패키지명&gt;</code> 명령어로 패키지를 제거할 수 있습니다.</p>
<h3 data-ke-size="size23">9. 기존 프로젝트 마이그레이션 (선택 사항)</h3>
<p data-ke-size="size16">기존 프로젝트에서 <code>node_modules</code>가 필요하다면, <code>nodeLinker</code> 옵션을 <code>node-modules</code>로 변경할 수 있습니다:</p>
<pre class="crmsh"><code>nodeLinker: 'node-modules'</code></pre>
<p data-ke-size="size16">이후 <code>yarn install</code>을 실행하면 기존 방식대로 <code>node_modules</code> 폴더가 생성됩니다.</p>
<h3 data-ke-size="size23">10. 추가 설정 및 최적화 (선택 사항)</h3>
<p data-ke-size="size16">추가적으로 <code>.yarnrc.yml</code> 파일에서 필요한 플러그인 설치, 캐시 최적화 등의 설정을 추가할 수 있습니다. 예를 들어:</p>
<pre class="less"><code>plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-interactive-tools.cjs
    spec: "@yarnpkg/plugin-interactive-tools"</code></pre>
<p data-ke-size="size16">위의 과정을 통해 Yarn Berry를 프로젝트에 성공적으로 도입할 수 있습니다. Yarn Berry를 사용하면 패키지 관리가 더 효율적으로 이루어지며, <code>node_modules</code> 폴더로 인한 용량 부담이 크게 줄어들 것입니다.</p>
<h2 data-ke-size="size26">&nbsp;</h2>
<h2 data-ke-size="size26">Q2 corepack 설정 관련</h2>
<p data-ke-size="size16">yarn set version berry 에서 다음 오류가 발생합니다.<br /><code>YN0000: You don't seem to have Corepack enabled; we'll have to rely on yarnPath instead</code></p>
<h2 data-ke-size="size26">A2</h2>
<p data-ke-size="size16">이 오류는 <code>Corepack</code>이 활성화되지 않은 상태에서 Yarn Berry를 설치하려고 할 때 발생하는 경고 메시지입니다. Corepack은 Yarn과 같은 패키지 관리 도구를 쉽게 사용할 수 있도록 도와주는 유틸리티입니다. 이 오류는 크게 문제되지 않으며, <code>yarnPath</code>를 통해 Yarn을 사용할 수 있도록 설정하겠다는 뜻입니다. 다음 단계를 따라 문제를 해결할 수 있습니다.</p>
<h3 data-ke-size="size23">1. Corepack 활성화</h3>
<p data-ke-size="size16">Corepack을 활성화하려면 다음 명령어를 터미널에 입력하세요:</p>
<pre class="bash"><code>corepack enable</code></pre>
<p data-ke-size="size16">이 명령어를 실행하면 Corepack이 활성화되고, 이후 Yarn 명령어들이 올바르게 작동할 것입니다.</p>
<h3 data-ke-size="size23">2. Yarn Berry 설치 다시 시도</h3>
<p data-ke-size="size16">이제 다시 Yarn Berry를 설치해 보세요:</p>
<pre class="applescript"><code>yarn set version berry</code></pre>
<h3 data-ke-size="size23">3. Corepack이 없는 경우</h3>
<p data-ke-size="size16">만약 <code>corepack enable</code> 명령어가 작동하지 않는다면, Node.js 버전을 확인하세요. Corepack은 Node.js 16.10.0 이후 버전에 포함되어 있습니다. 만약 더 낮은 버전을 사용 중이라면 Node.js를 업데이트하세요.</p>
<h3 data-ke-size="size23">4. .yarn/releases 폴더 확인</h3>
<p data-ke-size="size16"><code>yarn set version berry</code> 명령어를 실행한 후 <code>.yarn/releases/</code> 폴더에 <code>yarn-X.X.X.cjs</code> 파일이 생성됩니다. 이 파일이 생성되었다면 Yarn Berry 설치는 완료된 것입니다. 경고 메시지에도 불구하고 프로젝트에서 Yarn Berry를 사용할 수 있습니다.</p>
<h3 data-ke-size="size23">5. .yarnrc.yml 파일 수정</h3>
<p data-ke-size="size16"><code>.yarnrc.yml</code> 파일이 생성되었는지 확인하세요. 파일이 없다면 다음 내용을 직접 추가하세요:</p>
<pre class="reasonml"><code>yarnPath: .yarn/releases/yarn-X.X.X.cjs</code></pre>
<p data-ke-size="size16">이 설정은 Yarn 명령어를 실행할 때 이 파일을 사용하도록 지정합니다.</p>
<h3 data-ke-size="size23">6. 의존성 설치 및 테스트</h3>
<p data-ke-size="size16">이제 프로젝트에서 Yarn을 사용하여 의존성을 설치하고 정상적으로 작동하는지 확인하세요:</p>
<pre class="cmake"><code>yarn install</code></pre>
<p data-ke-size="size16">이 과정에서 추가적인 경고나 오류가 발생하지 않는다면 Yarn Berry 설치가 성공적으로 완료된 것입니다.</p>
<p data-ke-size="size16">이 단계를 완료한 후에도 문제가 지속된다면 Node.js 버전이나 Yarn 설정을 다시 확인해보시길 권장합니다.</p>