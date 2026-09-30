<h2 data-ke-size="size26">vgpu로 블랙홀 세 번째 시도 - WebGPU 래퍼를 붙였더니 쉐이더를 픽셀로 테스트할 수 있게 됐다.</h2>
<p data-ke-size="size16"><code>/labs</code>에 블랙홀이 이미 두 개 있다.<br />두 번째(<code>blackhole-retry</code>)는 어디선가 찾은 소스로 raw WebGPU 돌린 건데, 모양이 좀 아쉬웠다.</p>
<p data-ke-size="size16"><br />강착원반이 뭉개지고, 빛이 휘는 느낌이 약했다.</p>
<p data-ke-size="size16">그러다 마음에 드는 쉐이더 샘플을 하나 찾았고,<br />Vercel이 만든 <code>vgpu</code>라는 WebGPU 라이브러리도 알게 됐다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>그래서 둘을 섞어 봤다.</b></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><b>결과적으로 제일 크게 얻은 건 블랙홀이 아니라, 쉐이더를 테스트하는 방법이었다.</b></p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">1. 샘플은 왜 retry보다 멋져 보였을까?</h2>
<p data-ke-size="size16">둘 다 방식은 같다.<br />화면 전체에 fragment shader 하나를 깔고, 픽셀마다 빛줄기를 거꾸로 쏴서 휘게 한다.<br />차이는 세부였다.</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>&nbsp;</th>
<th>retry</th>
<th>샘플</th>
</tr>
</thead>
<tbody>
<tr>
<td>휘는 힘</td>
<td>중심 방향 <code>1/r&sup2;</code> (뉴턴 중력 느낌)</td>
<td><code>-1.5&middot;h&sup2;&middot;p̂/r⁴</code> (h = 광자 각운동량)</td>
</tr>
<tr>
<td>원반 판정</td>
<td><code>abs(y) &lt; 0.18</code>이면 매 스텝 누적</td>
<td>적도면을 <b>통과할 때만</b> 누적, 통과마다 투과율 &frac12;</td>
</tr>
<tr>
<td>스텝</td>
<td>고정 0.05~0.07</td>
<td>지평선 근처만 촘촘하게</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">범인은 첫 줄이었다.<br />각운동량 항이 없으면 빛이 충분히 안 휜다.</p>
<p data-ke-size="size16"><br />그래서 <b>원반 뒤쪽이 그림자 위로 넘어오는 인터스텔라 모양</b>이 안 나온다.</p>
<p data-ke-size="size16">두 번째 줄도 컸다.</p>
<p data-ke-size="size16"><br />두께 안에 있을 때마다 더하면 원반이 뿌옇게 번진다.<br />평면을 지날 때만 더하면 앞 원반, 뒤 원반, 아랫면이 또렷하게 층으로 갈린다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">2. vgpu는 뭘까?</h2>
<p data-ke-size="size16">npm 기준 <code>vgpu@0.5.0</code>이다(2026-09-14 갱신).</p>
<p data-ke-size="size16"><br />WebGPU를 얇게 감싼 라이브러리이고, 브라우저와 <b>headless Node(Dawn)</b> 에서 같은 코드가 돈다.</p>
<p data-ke-size="size16">기본 단위는 <code>effect</code> &mdash; 전체 화면 fragment shader 하나다.</p>
<pre class="lisp"><code>const gpu = await init();
const canvasSurface = surface(gpu, canvas, { dpr: [1, 2] });
const fx = effect(gpu, WGSL, { set: { params: { time: 0 } } });
<p>frameLoop(gpu, (frame) =&gt; {
fx.set({ params: { time: clock(gpu).time } });
frame.pass(canvasSurface, fx);
});</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">샘플이 딱 이 모양이다. 쉐이더 하나, uniform 몇 개.<br /><b>retry가 손으로 짜 둔 어댑터, 파이프라인, 바인드 그룹 코드 수백 줄이 이걸로 대체된다..!</b></p>
<p data-ke-size="size16">재밌는 건 <b>에이전트용으로 만든 라이브러리</b>라는 점이다.</p>
<pre class="jboss-cli"><code>npx vgpu                                # 자기 사용법을 출력
npx vgpu docs cat getting-started.md   # 패키지에 문서가 같이 들어 있다
npx vgpu examples search bloom          # 검증된 예제 검색
npx vgpu examples pull black-hole --out ./ex
npx vgpu doctor                         # 이 기계가 GPU 렌더를 할 수 있나</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">문서가 설치한 버전에 묶여 있어서, 기억에 의존할 필요가 없었다.<br />그리고 예제를 검색하다가 <b>공식 블랙홀 예제가 두 개</b>(<code>black-hole</code>, <code>optimized-black-hole</code>) 있다는 걸 알았다.</p>
<p data-ke-size="size16">MIT다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">3. 모바일 문제 - 한 번 굽고, 매 프레임 칠한다</h2>
<p data-ke-size="size16"><b>표현을 낮추더라도 모바일에서도 잘 보였으면 좋겠다고 생각했다.</b></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">광선 적분은 픽셀마다 수백 스텝이다.<br />폰에서 매 프레임 돌리면 무겁다.<br />답은 <code>optimized-black-hole</code> 예제에 있었다.</p>
<h3 data-ke-size="size23">관찰 1. 적분 결과는 카메라에만 의존한다</h3>
<p data-ke-size="size16">빛이 어디서 원반을 뚫고, 어느 방향으로 탈출하는지는<br />카메라 위치와 질량이 정한다. 시간과는 상관없다.</p>
<p data-ke-size="size16"><br />원반 무늬가 도는 건 <b>색칠</b> 문제지 <b>경로</b> 문제가 아니다.</p>
<p data-ke-size="size16">그러면 경로는 한 번 구워 두고(G-buffer), 매 프레임은 그 위에 색만 칠하면 된다.</p>
<h3 data-ke-size="size23">관찰 2. 좌우 회전(yaw)은 굽지 않아도 된다</h3>
<p data-ke-size="size16">원반은 y축 대칭이다.<br />카메라를 y축으로 돌리는 것 = 세상을 반대로 돌리는 것이다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그래서 yaw는 shade 단계에서 <b>원반 교차점의 방위각과 하늘 방위각에 같은 각을 더하는 것</b>으로 끝난다.<br />자동회전 중에는 비싼 bake가 한 번도 안 돈다.<br />다시 굽는 건 위아래 드래그(pitch), 질량 슬라이더, 리사이즈뿐이다.</p>
<h3 data-ke-size="size23">관찰 3. 도플러 계수도 굽는다</h3>
<p data-ke-size="size16">도플러는 <code>dot(원반 접선, 광선 방향)</code>이다.<br />yaw로 돌리면 두 벡터가 같이 돌아서 내적이 안 변한다.<br />그래서 이것도 bake에 넣었다.</p>
<h3 data-ke-size="size23">G-buffer는 32바이트에 딱 맞췄다</h3>
<p data-ke-size="size16">WebGPU 기본 한도에서 color attachment는 샘플당 32바이트까지다.<br /><code>rgba32float</code> 두 장이 정확히 32바이트다.</p>
<pre class="css"><code>hits : (hit1.xz, hit2.xz)          원반 교차점 두 개. 없으면 (0,0)
sky  : (dir.y, 방위각, dop1, dop2)   흡수된 빛은 dir.y 자리에 4.0(범위 밖 값)</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">플래그 칸이 없어서 "없음"과 "흡수"는 범위 밖 값으로 표시했다.</p>
<p data-ke-size="size16">최종 흐름은 이렇다.</p>
<pre class="mipsasm"><code>bake(pitch&middot;mass 바뀔 때만) &rarr; shade &rarr; bright &rarr; blur &times;N &rarr; composite</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">bake는 <code>needsBake</code> 플래그만 세워 두고, <b>다음 draw 프레임 맨 앞에서</b> 한 번 인코딩한다.<br />submit을 따로 하지 않는다.</p>
<p data-ke-size="size16">품질 단계는 둘이다.</p>
<table data-ke-align="alignLeft">
<thead>
<tr>
<th>&nbsp;</th>
<th>high</th>
<th>low</th>
</tr>
</thead>
<tbody>
<tr>
<td>내부 해상도</td>
<td>1배</td>
<td>0.6배</td>
</tr>
<tr>
<td>bake 스텝</td>
<td>420</td>
<td>240(스텝 1.7배)</td>
</tr>
<tr>
<td>fbm 옥타브</td>
<td>4</td>
<td>2</td>
</tr>
<tr>
<td>블룸</td>
<td>360p, 블러 4번</td>
<td>180p, 블러 2번</td>
</tr>
<tr>
<td>fps 상한</td>
<td>60</td>
<td>30</td>
</tr>
</tbody>
</table>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">터치 기기와 짧은 변 768px 미만은 low로 시작한다.<br />데스크톱도 최근 60프레임 중앙값이 예산을 넘으면 한 번만 low로 내린다.<br />중앙값이라 첫 컴파일 같은 짧은 튐에는 반응하지 않는다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">4. 쉐이더를 픽셀로 테스트한다</h2>
<p data-ke-size="size16">이게 이번에 제일 좋았던 부분이다.</p>
<p data-ke-size="size16"><code>npx vgpu doctor</code>를 돌렸더니 이렇게 나왔다.</p>
<pre class="yaml"><code>Verdict: healthy
Adapter: Metal driver on macOS Version 26.6.2
[OK] render: Rendered and read back a 16x16 offscreen target</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">맥에서는 Node가 <b>실제 Metal GPU로</b> 렌더하고 픽셀을 읽어 온다.<br />그러면 vitest 안에서도 된다.</p>
<pre class="angelscript"><code>import { frame, target } from "vgpu";
import { init } from "vgpu/node";
<p>const gpu = await init();
const pipeline = createPipeline(gpu, { size: [240, 160], quality });
const output = target(gpu, { size: [240, 160], format: &quot;rgba8unorm&quot; });
pipeline.bake({ pitch: 0.18, mass: 0.5 });
frame(gpu, (f) =&gt; pipeline.draw(f, output, { yaw: 0, time: 1 }));
const pixels = await output.color.read({ mipLevel: 0, region: &quot;all&quot; });</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>vgpu</code>의 <code>effect</code>&middot;<code>target</code>에 <code>vgpu/node</code>에서 만든 gpu를 그대로 넘기면 된다.<br />브라우저용 파이프라인 모듈을 <b>한 줄도 안 고치고</b> 테스트에서 import한다.</p>
<p data-ke-size="size16">테스트는 "보기 좋다"가 아니라 "이 모양이 있다"를 숫자로 묻는다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>그림자 자리의 밝기가 0.03 미만인가</li>
<li>그림자 <b>위</b> 세로줄에 0.5 넘는 밝기가 있는가 &mdash; 휘어 올라온 뒤쪽 원반</li>
<li>그림자 <b>아래</b>에도 있는가 &mdash; 아랫면 고리</li>
<li>좌우 같은 위치의 원반 띠 밝기 비가 1.15를 넘는가 &mdash; 도플러</li>
</ul>
<p data-ke-size="size16">high와 low를 <code>describe.each</code>로 둘 다 돌린다.<br />"모바일도 모양은 남긴다"가 요구사항이었으니, 그게 테스트가 된다.</p>
<h3 data-ke-size="size23">테스트가 헛돌지 않는지도 확인했다</h3>
<p data-ke-size="size16">통과하는 테스트는 아무것도 안 잡고 있을 수도 있다.<br />그래서 일부러 망가뜨려 봤다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>휘는 힘을 <code>0.0 *</code>으로 끄면 &rarr; 그림자&middot;렌즈 테스트가 실패</li>
<li>도플러 빔을 끄면 &rarr; 도플러 테스트만 실패</li>
</ul>
<p data-ke-size="size16">둘 다 기대한 테스트만 빨갛게 됐다. 원본은 되돌렸다.</p>
<h3 data-ke-size="size23">첫 실패는 테스트가 틀렸다</h3>
<p data-ke-size="size16">처음 쓴 테스트는 "화면 <b>정중앙</b>이 검다"였다. 실패했다(0.098).<br />코드를 의심하기 전에 프레임을 PPM으로 떠서 <code>sips</code>로 PNG로 바꿔 봤다.</p>
<p data-ke-size="size16">이미지가 이미 맞았다.</p>
<p data-ke-size="size16"><br />pitch 0.18에서는 <b>앞쪽 원반 띠가 화면 중앙을 가로지르고</b>, 그림자는 그 위에 걸린다.<br />인터스텔라 포스터를 떠올리면 당연한 구도인데, 머릿속 그림이 틀렸던 거다.</p>
<p data-ke-size="size16">테스트 좌표를 <code>HEIGHT * 0.38</code>로 옮겼다.</p>
<p data-ke-size="size16"><br /><b>픽셀을 먼저 봤기 때문에</b> 멀쩡한 쉐이더를 고치러 가지 않았다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">5. 끼워 맞추며 부딪힌 것들</h2>
<h3 data-ke-size="size23">pnpm의 build 승인 요구 - 꺼도 됐다</h3>
<p data-ke-size="size16"><code>pnpm add vgpu</code>를 하면 이렇게 멈춘다.</p>
<pre class="css"><code>[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: @vgpu/adapter-node@0.5.0, webgpu@0.4.0</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16"><code>webgpu</code>는 Dawn 바이너리다. 승인해야 하나 싶었는데, 승인 없이도 <code>doctor</code>가 healthy였다.<br /><code>webgpu</code> 패키지에 prebuild가 들어 있다.</p>
<p data-ke-size="size16"><br />그래서 <code>pnpm-workspace.yaml</code>의 <code>allowBuilds</code>에 둘 다 <code>false</code>로 박았다.<br />Vercel 빌드에서 Dawn을 받으러 가지 않는다.</p>
<h3 data-ke-size="size23"><code>.wgsl</code> 로더 대신 TS 문자열</h3>
<p data-ke-size="size16">vgpu는 Next.js용 Turbopack 로더(<code>@vgpu/wgsl/loader-webpack</code>)를 준다.<br />안 썼다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>pnpm은 전이 의존성을 루트 <code>node_modules</code>에 안 올린다. 로더 이름 해석이 걸릴 수 있다.</li>
<li>문서에 명시돼 있다: <b><code>next build</code>/<code>next dev</code>는 WGSL을 검증하지 않는다.</b> 로더가 있어도 잘못된 쉐이더가 그대로 배포된다.</li>
<li>어차피 검증은 headless 픽셀 테스트가 한다.</li>
</ul>
<p data-ke-size="size16">그래서 쉐이더를 <code>export const BAKE_WGSL = /* wgsl */ \</code>...`<code>로 두고</code>effect()`에 문자열로 넘겼다.<br />next.config는 한 줄도 안 건드렸다.</p>
<h3 data-ke-size="size23">uv가 위에서 시작한다</h3>
<p data-ke-size="size16">vgpu <code>effect</code>의 <code>uv</code>는 <b>왼쪽 위가 (0,0)</b> 이다. WebGPU 텍스처 좌표와 같다.<br />샘플은 WebGL(<code>gl_FragCoord</code>, 아래가 0)이라 경계에서 한 번만 뒤집었다.</p>
<pre class="routeros"><code>let screen = vec2f(uv.x - 0.5, 0.5 - uv.y) * vec2f(aspect, 1.0);</code></pre>
<h3 data-ke-size="size23">WebGPU는 HTTPS에서만 켜진다</h3>
<p data-ke-size="size16">폰으로 같은 와이파이의 <code>http://192.168.x.x:3000</code>을 열면 <code>navigator.gpu</code>가 없다.<br />WebGPU는 secure context 전용이다.<br />폰 확인은 Vercel Preview(HTTPS)로 했다.</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">6. 정리</h2>
<blockquote data-ke-style="style1">
<p data-ke-size="size16"><b>vgpu를 붙여서 얻은 건 코드 절약보다, 쉐이더를 눈이 아니라 숫자로 확인하는 루프였다.</b></p>
</blockquote>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>블랙홀이 멋져 보이는지는 휘는 힘 공식(각운동량 항)과 원반을 <b>평면 통과 시에만</b> 더하는 데서 갈린다.</li>
<li>비싼 적분은 카메라에만 의존한다. <b>한 번 굽고 매 프레임 칠하면</b> 모바일도 돈다.</li>
<li>축대칭이면 yaw 회전은 방위각 덧셈이다. 도플러처럼 회전에 불변인 값은 같이 굽는다.</li>
<li><code>vgpu/node</code>는 맥에서 실제 Metal로 렌더한다. 브라우저 파이프라인을 그대로 vitest에 넣고 픽셀로 단정한다.</li>
<li>통과한 테스트는 일부러 망가뜨려서 빨개지는지 본다.</li>
<li>테스트가 실패하면 코드보다 <b>프레임부터</b> 본다. 이번엔 틀린 게 내 머릿속 구도였다.</li>
</ul>
<p data-ke-size="size16">덤으로.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>pnpm의 <code>ERR_PNPM_IGNORED_BUILDS</code>가 떠도, 실제로 필요한지 <code>doctor</code>로 먼저 확인한다.</li>
<li><code>next build</code>는 WGSL을 검증하지 않는다. 쉐이더의 검증 게이트는 따로 있어야 한다.</li>
</ul>
<p data-ke-size="size16">결과물은 <code>https://eunoh.top/labs/blackhole-vgpu</code>에 있다.<br /><code>?quality=low</code>를 붙이면 모바일 단계로 볼 수 있다.</p>