<h2 data-ke-size="size26">terraform provider 공유 캐시 - 7GB가 44KB가 되기까지</h2>
<p data-ke-size="size16">맥북 용량이 부족해서 <code>du -sh</code>로 <code>/projects</code> 아래를 한 칸씩 내려가 봤다.<br />node_modules가 범인일 줄 알았다.</p>
<p data-ke-size="size16"><b>그런데 제일 큰 게 전부 terraform 디렉토리였다.</b></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">1. 뭐가 이렇게 클까?</h2>
<p data-ke-size="size16"><code>.terraform</code> 디렉토리를 모아서 재 봤다.</p>
<pre class="crystal"><code>763M  ****/infra-serving/.terraform
648M  ****/terraform/.terraform
782M  ****/infra/.terraform
826M  ****/infra/shared/.terraform
791M  ****/infra/envs/prod/.terraform
1.5G  ****/infra/envs/dev/.terraform
774M  ****/infra/modules/secrets/.terraform
774M  ****/infra/modules/ecs/.terraform
...</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">한 개에 800MB 가까이 된다.</p>
<p data-ke-size="size16">안을 파 보니 거의 전부 파일 <b>하나</b>였다.</p>
<pre class="angelscript"><code>.terraform/providers/registry.terraform.io/hashicorp/aws/6.47.0/darwin_arm64/
  terraform-provider-aws_v6.47.0_x5    782M</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">AWS provider 바이너리다.</p>
<h3 data-ke-size="size23">왜 이렇게 클까?</h3>
<p data-ke-size="size16">provider는 Go로 빌드한 <b>단일 바이너리</b>다.<br />AWS provider는 수백 개 AWS 서비스의 SDK 클라이언트를 전부 정적 링크해서 들고 있다.<br />ECS 하나만 쓰든 S3 하나만 쓰든 상관없다. 통째로 받는다.</p>
<h3 data-ke-size="size23">그리고 디렉토리마다 따로 받는다</h3>
<p data-ke-size="size16"><code>terraform init</code>은 기본적으로 <b>그 디렉토리의 <code>.terraform/</code> 안에</b> provider를 내려받는다.<br />공유하지 않는다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그래서 레포 하나에 같은 aws 6.45.0이 다섯 벌 있었다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>infra/shared</code></li>
<li><code>infra/envs/prod</code></li>
<li><code>infra/envs/dev</code></li>
<li><code>infra/modules/ecs</code> &larr; 모듈인데?</li>
<li><code>infra/modules/secrets</code> &larr; 이것도?</li>
</ul>
<p data-ke-size="size16">모듈 디렉토리 둘은 backend도 없는 그냥 모듈이다.<br />언젠가 거기서 <code>init</code>을 한 번 쳐서 생긴 흔적 같다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>envs/dev</code>가 1.5GB인 건 aws가 <b>두 버전</b>(6.45.0, 6.53.0) 있어서였다.<br />lock 파일엔 6.45.0만 있다. 6.53.0은 올렸다가 되돌린 잔재였던 것 같다...</p>
<p data-ke-size="size16">&nbsp;</p>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><code>.terraform/</code>은 캐시다. 지워도 <code>init</code>으로 다시 만들어진다.<br />그런데 캐시가 디렉토리 수만큼 복제되고 있었다.</p>
</blockquote>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">2. pnpm 같은 게 있다?</h2>
<p data-ke-size="size16">terraform에도 전역 캐시 설정이 있다. 몰랐다.</p>
<pre class="ini"><code># ~/.terraformrc
plugin_cache_dir = "$HOME/.terraform.d/plugin-cache"</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이걸 켜면 이렇게 바뀐다.</p>
<pre class="typescript" data-ke-language="typescript"><code>~/.terraform.d/plugin-cache/
  registry.terraform.io/hashicorp/aws/6.45.0/darwin_arm64/   &larr; 실제 파일 (한 벌)
<p>****/infra/envs/dev/.terraform/providers/.../aws/6.45.0/
darwin_arm64 -&gt; ~/.terraform.d/plugin-cache/.../aws/6.45.0/darwin_arm64   ← 링크</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>전역 저장소에 버전별로 한 벌 두고, 프로젝트엔 링크만 건다.</b><br />pnpm의 content-addressable store랑 같은 발상이다.</p>
<p data-ke-size="size16"><br />(pnpm은 하드링크, terraform은 버전 디렉토리 단위 심볼릭 링크라는 차이는 있다.)</p>
<p data-ke-size="size16">주의할 점이 둘 있다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>캐시 디렉토리는 직접 만들어야 한다.</b> 없으면 terraform이 만들어 주지 않는다. <code>mkdir -p</code> 먼저.</li>
<li><b>이미 받아 둔 <code>.terraform</code>에는 소급 적용되지 않는다.</b> 지우고 다시 <code>init</code>해야 링크로 바뀐다.</li>
</ol>
<p data-ke-size="size16">그리고 lock 파일과의 관계.<br />Terraform 1.4부터는 <code>.terraform.lock.hcl</code>에 그 provider의 해시가 <b>이미 있을 때만</b> 캐시를 쓴다고 알고 있다.</p>
<p data-ke-size="size16"><br />lock에 없는 새 provider를 추가하면 그때 한 번은 평소처럼 받는다.<br />(문서에서 이 부분을 직접 찾진 못했다. 우리 레포들은 lock이 전부 커밋되어 있어서 걸릴 일이 없었다.)</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">3. 적용</h2>
<p data-ke-size="size16">대상은 내가 terraform을 직접 만지는 쪽 셋으로 좁혔다.</p>
<p data-ke-size="size16">순서는 이렇게 잡았다.</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><code>~/.terraformrc</code> 생성 + 캐시 디렉토리 생성</li>
<li>루트 모듈 6곳에서 <code>.terraform/providers/</code><b>만</b> 삭제
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>backend 설정이 든 <code>.terraform/terraform.tfstate</code>, <code>modules/</code>는 남긴다</li>
</ul>
</li>
<li>각 루트에서 <code>terraform init -lockfile=readonly</code>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>-lockfile=readonly</code>: lock 파일이 바뀌지 않게 막는다. git diff가 안 생긴다</li>
</ul>
</li>
<li>모듈 디렉토리 두 곳은 <code>.terraform/</code> 통째로 삭제, 다시 init 안 함</li>
</ol>
<h3 data-ke-size="size23">3-1. 첫 번째 실수 - zsh는 단어를 안 쪼갠다</h3>
<pre class="routeros"><code>ROOTS="a/infra b/infra c/infra"
for p in $ROOTS; do ... done</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">루프가 <b>한 번만</b> 돌았다.<br />bash라면 <code>$ROOTS</code>가 공백으로 쪼개지는데, zsh는 기본적으로 안 쪼갠다.<br /><code>"a/infra b/infra c/infra"</code>라는 존재하지 않는 경로 하나로 돌았고, 다행히 아무것도 안 지워졌다.</p>
<pre class="ini"><code>ROOTS=(a/infra b/infra c/infra)   # 배열로</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>rm -rf</code>가 들어간 루프에서 이러면 식은땀이 난다.<br /><b>zsh에서 목록은 배열로 쓴다.</b></p>
<h3 data-ke-size="size23">3-2. 두 번째 실수 - <code>-backend=false</code>는 backend를 안 보는 게 아니었다</h3>
<p data-ke-size="size16">처음엔 <code>-backend=false</code>를 붙였다.<br />provider만 다시 받으면 되니까, S3에 접속할 필요가 없을 거라고 생각했다.</p>
<pre class="subunit"><code>Error: Error refreshing state: Unable to access object
"envs/dev/terraform.tfstate" in S3 bucket "...":
operation error S3: HeadObject, https response error StatusCode: 403</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">6곳 전부 403.</p>
<p data-ke-size="size16"><code>-backend=false</code>는 "backend를 <b>새로 초기화하지 않는다</b>"는 뜻이었다.</p>
<p data-ke-size="size16"><br />이미 init된 디렉토리에서는 <code>.terraform/terraform.tfstate</code>에 저장된 backend 설정을 그대로 불러오고,<br />state를 읽으려고 S3에 간다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">4. 결과</h2>
<p data-ke-size="size16">init 출력이 이렇게 바뀌었다.</p>
<pre class="typescript" data-ke-language="typescript"><code>===== ****/infra
- Installing hashicorp/aws v6.47.0...          &larr; 처음 한 번만 다운로드
===== ****/infra/shared
- Using hashicorp/aws v6.47.0 from the shared cache directory
===== ****/infra/shared
- Installing hashicorp/aws v6.45.0...          &larr; 버전이 달라서 한 번
===== ****/infra/envs/prod
- Using hashicorp/aws v6.45.0 from the shared cache directory
===== ****/infra/envs/dev
- Using hashicorp/aws v6.45.0 from the shared cache directory</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>from the shared cache directory</code>가 보이면 성공이다.</p>
<pre class="groovy"><code>$ ls -l .../aws/6.45.0/
darwin_arm64 -&gt; /Users/eunoh/.terraform.d/plugin-cache/.../aws/6.45.0/darwin_arm64</code></pre>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>&nbsp;</th>
<th>전</th>
<th>후</th>
</tr>
</thead>
<tbody>
<tr>
<td>세 레포의 <code>.terraform</code> 합계</td>
<td><b>6.9GB</b></td>
<td><b>44KB</b></td>
</tr>
<tr>
<td>공유 캐시</td>
<td>-</td>
<td>1.6GB</td>
</tr>
<tr>
<td>실제 확보</td>
<td>&nbsp;</td>
<td><b>약 5.3GB</b></td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">캐시에 남은 건 aws 6.45.0, 6.47.0 한 벌씩과 random, archive 정도다.<br />dev에 굴러다니던 6.53.0, shared의 tls 두 버전 같은 잔재는 lock에 없어서 다시 안 받아졌다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">정리하면서 청소까지 된 셈이다.</p>
<p data-ke-size="size16">세 레포 모두 <code>git status</code>는 변경 0건. lock 파일은 그대로다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">5. 정리</h2>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b><code>.terraform/providers</code>는 node_modules다. 그리고 terraform에도 pnpm store가 있다.</b></p>
</blockquote>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>AWS provider는 원래 크다. 한 벌에 700~800MB.</li>
<li>기본 설정에서는 <code>init</code>한 디렉토리마다 한 벌씩 받는다. envs&middot;shared&middot;modules로 쪼갠 레포일수록 불어난다.</li>
<li><code>~/.terraformrc</code>의 <code>plugin_cache_dir</code> 한 줄이면 버전당 한 벌로 줄어든다.</li>
<li>캐시는 자동 정리가 없다. 안 쓰는 옛 버전이 쌓이면 캐시 폴더에서 버전 디렉토리를 직접 지운다.</li>
</ul>
<p data-ke-size="size16">그리고 덤으로 배운 두 가지.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>zsh에서 <code>for p in $STR</code>은 쪼개지지 않는다.</b> 목록은 배열로.</li>
<li><b><code>init -backend=false</code>도 저장된 backend의 state는 읽으러 간다.</b> 자격증명이 필요하다.</li>
</ul>
<p data-ke-size="size16">이 맥에서 이제 새로 <code>init</code>하는 terraform 디렉토리는 전부 캐시를 탄다.<br />data-serving, thesmc-apps에 남은 1.4GB는 다음에 거기서 작업할 때 지우고 다시 받으면 된다.</p>