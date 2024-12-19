<p data-ke-size="size16"><b>pnpm</b>은 <code>node_modules</code>를 효율적으로 관리하여 디스크 용량을 절약합니다.<br />이는 pnpm의 핵심 아키텍처인 <b>"symlinked node_modules"</b> 덕분입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">pnpm의 동작 방식</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>글로벌 스토리지 사용 (pnpm store)</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>pnpm은 모든 패키지를 한 번 다운로드한 뒤, 전역 스토리지(예: <code>~/.pnpm-store</code>)에 저장합니다.</li>
<li>이 스토리지는 <b>압축된 캐시 파일</b> 형태로 유지되며, 여러 프로젝트가 동일한 의존성을 공유하도록 설계되었습니다.</li>
</ul>
</li>
<li><b><code>node_modules</code>는 심볼릭 링크로 구성</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>프로젝트의 <code>node_modules</code>에는 실제 파일이 아니라, <b>pnpm store</b>의 실제 패키지 파일을 가리키는 심볼릭 링크(Symlink)가 생성됩니다.</li>
<li>이 방식 덕분에 <b>실제 파일의 복사본</b>이 아니라 <b>참조만 포함</b>되므로, 디스크 용량이 크게 절약됩니다.</li>
</ul>
</li>
</ol>
<p data-ke-size="size16">&nbsp;</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">디스크 용량 절약 효과</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>동일한 버전의 패키지를 여러 프로젝트에서 사용할 때, 패키지 파일은 <b>한 번만 저장</b>되고 모든 프로젝트가 이를 참조합니다.</li>
<li>일반적인 <code>npm</code>이나 <code>yarn</code>에서 각 프로젝트별로 의존성이 복사되는 것과 비교했을 때, <b>pnpm은 디스크 사용량을 획기적으로 줄이는</b> 효과가 있습니다.</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">예시 비교 (pnpm vs npm)</h3>
<h4 data-ke-size="size20">예를 들어, 두 프로젝트가 동일한 패키지 버전(<code>lodash@4.17.21</code>)을 사용한다고 가정할 때:</h4>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>npm</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>각 프로젝트의 <code>node_modules</code>에 독립적으로 패키지 파일이 복사됨.</li>
<li><code>lodash@4.17.21</code>의 파일이 두 번 저장되므로, 디스크 용량을 더 많이 차지함.</li>
</ul>
</li>
<li><b>pnpm</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>lodash@4.17.21</code>은 전역 스토리지(<code>~/.pnpm-store</code>)에 한 번만 저장됨.</li>
<li>각 프로젝트의 <code>node_modules</code>는 해당 전역 스토리지의 파일을 가리키는 <b>심볼릭 링크</b>만 포함.</li>
<li>따라서, 디스크 용량은 최소화되고, 패키지 관리는 효율적.</li>
</ul>
</li>
</ol>
<p data-ke-size="size16">&nbsp;</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">확인 방법</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>pnpm store의 위치 확인</b>이 명령어로 전역 스토리지의 위치를 확인할 수 있습니다.</li>
<li><code class="language-bash"> pnpm store path</code></li>
<li><b>스토리지 사용량 확인</b><br />전역 스토리지(<code>~/.pnpm-store</code>)와 프로젝트의 <code>node_modules</code> 디렉토리의 용량을 비교하면, pnpm이 디스크 용량을 절약하는 것을 직접 확인할 수 있습니다.</li>
</ol>
<p data-ke-size="size16">&nbsp;</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23">결론</h3>
<p data-ke-size="size16"><code>pnpm i</code>로 생성된 <code>node_modules</code>는 참조용으로 구성되며, 실제 패키지 파일은 <b>글로벌 스토리지</b>에 저장되므로 디스크 용량을 적게 차지합니다. 이는 pnpm이 <code>npm</code>이나 <code>yarn</code>에 비해 큰 장점으로, 대규모 프로젝트나 여러 프로젝트를 관리할 때 매우 유용합니다.</p>