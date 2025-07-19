<h2 data-ke-size="size26">질문:</h2>
<p data-ke-size="size16">seed.ts 를 작성했는데, 이거 자동 반영되나유??</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">답변:</h2>
<p data-ke-size="size16">아니요! 시드 스크립트는 <b>앱 시작과는 별개로 수동 실행</b>해야 해요.</p>
<h2 data-ke-size="size26">시드 실행 방법</h2>
<h3 data-ke-size="size23">1. 직접 실행</h3>
<pre class="crmsh"><code>npx tsx seed.ts
# 또는
node --loader ts-node/esm seed.ts</code></pre>
<h3 data-ke-size="size23">2. package.json에 스크립트 추가 (권장)</h3>
<pre class="json"><code>{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "seed": "tsx seed.ts"
  }
}</code></pre>
<p data-ke-size="size16">그러면 이렇게 실행:</p>
<pre class="dockerfile"><code>pnpm run seed</code></pre>
<h3 data-ke-size="size23">3. Prisma 공식 방법</h3>
<p data-ke-size="size16"><code>package.json</code>에 prisma 설정 추가:</p>
<pre class="json"><code>{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}</code></pre>
<p data-ke-size="size16">그러면 이렇게 실행:</p>
<pre class="ebnf"><code>npx prisma db seed</code></pre>
<h2 data-ke-size="size26">언제 시드를 실행하나요?</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>개발 시작할 때</b>: 테스트 데이터 필요할 때</li>
<li><b>DB 초기화 후</b>: <code>prisma migrate reset</code> 후</li>
<li><b>새로운 테스트 데이터 필요할 때</b>: 언제든 수동 실행</li>
</ul>
<h2 data-ke-size="size26">참고</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>시드는 <b>개발/테스트용</b>이에요</li>
<li>프로덕션에서는 절대 실행하면 안 됩니다 (기존 데이터 삭제하니까요!)</li>
<li><code>deleteMany()</code>가 있어서 기존 데이터를 모두 지우고 새로 만들어요</li>
</ul>