<h2 data-ke-size="size26">질문:</h2>
<p data-ke-size="size16">스키마 새로 작성시 마이그레이션, 클라이언트 생성 은 맨날 반복하면 되남유?</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">답변:</h2>
<p data-ke-size="size16">네 맞습니다! 스키마를 변경할 때마다 반복해야 해요.</p>
<h2 data-ke-size="size26">스키마 변경 시 워크플로우</h2>
<pre class="smali"><code># 1. schema.prisma 수정
<h1>2. 마이그레이션 생성 &amp; 적용</h1>
<p>npx prisma migrate dev --name add-user-model</p>
<h1>3. Prisma Client 재생성 (보통 자동으로 됨)</h1>
<p>npx prisma generate</code></pre></p>
<h2 data-ke-size="size26">중요한 점들</h2>
<h3 data-ke-size="size23">migrate dev의 장점</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>npx prisma migrate dev</code>는 마이그레이션 파일 생성 + DB 적용 + 클라이언트 생성을 한 번에 처리해요</li>
<li><code>--name</code> 옵션으로 마이그레이션에 의미있는 이름을 부여하세요</li>
</ul>
<h3 data-ke-size="size23">실제 사용 예시</h3>
<pre class="dsconfig"><code># 처음 User 모델 만들 때
npx prisma migrate dev --name create-user-table
<h1>나중에 Post 모델 추가할 때</h1>
<p>npx prisma migrate dev --name add-post-model</p>
<h1>User에 avatar 필드 추가할 때</h1>
<p>npx prisma migrate dev --name add-user-avatar</code></pre></p>
<h3 data-ke-size="size23">참고사항</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>prisma generate</code>는 대부분 <code>migrate dev</code> 실행 시 자동으로 실행됩니다</li>
<li>만약 자동 실행이 안 되면 수동으로 <code>npx prisma generate</code> 실행</li>
<li>Prisma Studio로 DB 확인: <code>npx prisma studio</code></li>
</ul>