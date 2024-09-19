<p data-ke-size="size16">pnpm 설치가 중복으로 되어서..<br />쓸데없이 시간을 잡아먹은 부분을<br />역시 GPT o1쌤과 함께 해결해봤고 이 내용을 정리합니다..</p>
<hr data-ke-style="style1" />
<p data-ke-size="size16">알겠습니다. <code>npm uninstall -g pnpm</code> 명령어가 제대로 작동하지 않는다면, 몇 가지 이유가 있을 수 있습니다. 다음 단계를 통해 문제를 해결해보세요.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>pnpm의 설치 방법 확인하기</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Homebrew를 통해 설치된 경우</b>:위 명령어를 실행했을 때 pnpm이 나열된다면 Homebrew를 통해 설치된 것입니다.</li>
<li><code class="language-bash">brew list pnpm</code></li>
</ul>
</li>
<li>pnpm이 npm을 통해 설치되지 않았을 수 있습니다. 예를 들어, Homebrew나 다른 패키지 매니저를 사용하여 설치했을 수 있습니다.</li>
<li><b>Homebrew를 통해 pnpm 제거하기</b>:
<pre class="armasm"><code>brew uninstall pnpm</code></pre>
</li>
<li>만약 pnpm이 Homebrew로 설치되었다면 다음 명령어로 제거할 수 있습니다.</li>
<li><b>npm 글로벌 패키지 목록 확인하기</b>:
<pre class="applescript"><code>npm list -g --depth=0</code></pre>
출력된 목록에 pnpm이 없다면 npm을 통해 설치되지 않은 것입니다.</li>
<li>pnpm이 npm을 통해 설치되었는지 확인하려면 다음 명령어를 사용하세요.</li>
<li><b>pnpm 실행 파일의 위치 확인하기</b>:
<pre class="bash"><code>which -a pnpm</code></pre>
여러 경로가 나올 수 있습니다. 각 경로에서 pnpm의 버전을 확인해보세요.오래된 버전을 나타내는 실행 파일이 있다면 해당 파일을 수동으로 제거할 수 있습니다.</li>
<li><code class="language-bash">/경로/첫번째/pnpm --version
/경로/두번째/pnpm --version</code></li>
<li>시스템에 설치된 pnpm의 경로를 확인합니다.</li>
<li><b>수동으로 pnpm 제거하기</b>:
<pre class="awk"><code>rm /usr/local/bin/pnpm  # 실제 경로를 사용하세요</code></pre>
</li>
<li>오래된 pnpm 실행 파일의 경로를 알았다면, 해당 파일을 삭제합니다.</li>
<li><b>pnpm 캐시 및 설정 정리하기</b>:</li>
<li><code class="language-bash">rm -rf ~/.pnpm
rm -rf ~/Library/pnpm</code></li>
<li><b>최신 버전의 pnpm 설치하기</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>npm을 통해 설치하기</b>:</li>
<li><code class="language-bash">npm install -g pnpm@9.10.0</code></li>
<li><b>Homebrew를 통해 설치하기</b> (원하는 경우):</li>
<li><code class="language-bash">brew install pnpm</code></li>
</ul>
</li>
<li>이제 최신 버전의 pnpm을 설치합니다.</li>
<li><b>환경 변수 및 셸 재시작</b>:
<pre class="bash"><code>source ~/.bashrc  # 또는 source ~/.zshrc</code></pre>
</li>
<li>터미널을 재시작하거나 셸 설정을 다시 로드합니다.</li>
<li><b>버전 확인하기</b>:이제 버전이 9.10.0으로 표시되어야 합니다.</li>
<li><code class="language-bash">pnpm --version</code></li>
</ol>
<hr data-ke-style="style1" />
<p data-ke-size="size16"><b>추가 확인 사항</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>npm 버전 확인</b>:
<pre class="coffeescript"><code>npm --version
npm install -g npm</code></pre>
</li>
<li>npm 자체의 버전이 오래되었을 경우 문제가 발생할 수 있습니다.</li>
<li><b>nvm을 사용하는 경우</b>:
<pre class="properties"><code>nvm ls
nvm use [버전]</code></pre>
</li>
<li>Node.js 버전 매니저(nvm)를 사용하고 있다면, 글로벌 패키지가 Node.js 버전에 따라 다를 수 있습니다. 사용 중인 Node.js 버전을 확인하고 필요하다면 변경하세요.</li>
</ul>
<p data-ke-size="size16"><b>요약</b>:</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>pnpm이 어떻게 설치되었는지에 따라 제거 방법이 달라집니다.</li>
<li><code>which -a pnpm</code>을 사용하여 pnpm의 모든 설치 경로를 확인하고 오래된 버전을 제거하세요.</li>
<li>필요한 경우 수동으로 실행 파일을 삭제하고 캐시를 정리한 후 최신 버전을 설치하세요.</li>
</ul>