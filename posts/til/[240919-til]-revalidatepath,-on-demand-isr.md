<p data-ke-size="size16">새로 나온 chatGPT-o1 에게 ISR 에 관해 물어봤습니다.<br />revalidatePath 를 통해 데이터가 업데이트 되면 메인페이지를 ISR 하도록 하였습니다.<br />이것이 next.js 에서 적용되는 원리와 과정에 대해 물어보았습니다.</p>
<h2 data-ke-size="size26">GPT 쌤의 답변</h2>
<p data-ke-size="size16">당신은 Next.js 14 프로젝트에서 App Router를 사용하고 있으며, 라우트 핸들러 내에서 <code>revalidatePath</code> 함수를 구현하여 서버 데이터가 업데이트될 때 Incremental Static Regeneration(ISR)을 트리거했습니다. 이 메커니즘은 전체 재빌드나 수동 개입 없이도 정적으로 생성된 페이지가 최신 데이터를 반영하도록 보장합니다. 이제 이것이 어떻게 작동하는지 원리와 과정을 자세히 살펴보겠습니다.</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>Incremental Static Regeneration(ISR)의 이해</b></h3>
<p data-ke-size="size16"><b>Next.js에서의 ISR</b>은 사이트를 빌드한 후에도 정적 페이지를 생성하거나 업데이트할 수 있게 해줍니다. ISR을 사용하면 정적 사이트 생성(SSG)의 이점(빠른 로딩 시간 및 SEO 혜택 등)을 유지하면서도 데이터 변경에 따라 런타임에 페이지를 업데이트할 수 있습니다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>정적 생성(Static Generation)</b>: 페이지는 빌드 시에 생성되어 정적 파일로 제공됩니다.</li>
<li><b>Revalidation(재검증)</b>: 페이지는 지정된 시간(<code>revalidate</code> 기간) 후 또는 <code>revalidatePath</code>와 같은 함수를 사용하여 프로그래밍 방식으로 백그라운드에서 다시 생성될 수 있습니다.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b><code>revalidatePath</code>의 역할</b></h3>
<p data-ke-size="size16"><code>revalidatePath</code> 함수는 특정 경로의 캐시를 프로그래밍 방식으로 무효화하는 데 사용되며, Next.js가 다음 요청 시 최신 데이터로 해당 페이지를 다시 생성하도록 합니다.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>구문(Syntax)</b>: <code>revalidatePath(path: string, options?: { unstable_onlyGenerated: boolean })</code></li>
<li><b>매개변수</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><code>path</code>: 다시 검증할 페이지의 경로(예: 홈 페이지의 경우 <code>/</code>).</li>
<li><code>options</code>: 추가 옵션(예: 레이아웃 지정 또는 생성된 페이지만 선택).</li>
</ul>
</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>코드에서 <code>revalidatePath</code>가 작동하는 방식</b></h3>
<p data-ke-size="size16">제공된 코드에서의 과정을 분석해보겠습니다.</p>
<h4 data-ke-size="size20"><b>1. GET 요청 처리</b></h4>
<pre class="lua"><code>export async function GET(req: Request) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("number", { ascending: true });
<pre><code>if (error) {
    revalidatePath(&quot;/&quot;, &quot;layout&quot;);
    return NextResponse.json({ error: error.message }, { status: 500 });
}

return NextResponse.json(data, { status: 200 });
</code></pre>
<p>}</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>데이터 가져오기</b>: Supabase 데이터베이스에서 프로젝트 데이터를 가져옵니다.</li>
<li><b>에러 처리</b>: 데이터 가져오기 중 에러가 발생하면 <code>revalidatePath("/", "layout");</code>을 호출합니다.</li>
<li><b>재검증</b>: 에러 시 재검증을 호출하는 것은 일반적이지 않을 수 있지만, 코드에서는 오래된 데이터나 불일치한 데이터를 새로 고침하기 위해 이를 사용합니다.</li>
</ul>
<h4 data-ke-size="size20"><b>2. POST 요청 처리</b></h4>
<pre class="lua"><code>export async function POST(req: Request) {
    // ... (이미지 처리 및 업로드)
<pre><code>const { data, error } = await supabase
    .from(&quot;projects&quot;)
    .upsert({ ...newProject, images: uploadResults.length === 0 ? newProject.images : uploadResults })
    .select()
    .single();

if (error) {
    revalidatePath(&quot;/&quot;, &quot;layout&quot;);
    return NextResponse.json({ error: error.message }, { status: 500 });
}

return NextResponse.json(data, { status: 201 });
</code></pre>
<p>}</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>데이터 수정</b>: 데이터베이스에 프로젝트 항목을 삽입하거나 업데이트합니다.</li>
<li><b>에러 시 재검증</b>: GET 핸들러와 유사하게 에러 시 경로를 재검증합니다.</li>
<li><b>성공 응답</b>: 업데이트된 데이터를 <code>201</code> 상태 코드와 함께 반환합니다.</li>
</ul>
<h4 data-ke-size="size20"><b>3. 재검증 과정</b></h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>재검증 트리거</b>: <code>revalidatePath("/", "layout");</code>을 호출함으로써 Next.js에게 홈 페이지와 그 레이아웃의 캐시 버전을 무효화하도록 지시합니다.</li>
<li><b>다음 요청</b>: 다음에 사용자가 홈 페이지(<code>/</code>)를 요청하면, Next.js는 해당 페이지를 온디맨드로 최신 데이터로 다시 생성합니다.</li>
<li><b>업데이트된 콘텐츠 제공</b>: 전체 재빌드나 배포 없이도 사용자에게 새로운 프로젝트 데이터가 반영된 페이지를 제공합니다.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>기본 메커니즘</b></h3>
<h4 data-ke-size="size20"><b>정적 페이지 생성</b></h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>빌드 시</b>: Next.js는 빌드 시점의 코드와 데이터를 기반으로 정적 페이지를 생성합니다.</li>
<li><b>캐싱</b>: 이러한 페이지는 캐시되어 사용자에게 제공되어 빠른 응답 시간을 제공합니다.</li>
</ul>
<h4 data-ke-size="size20"><b>온디맨드 재검증</b></h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>캐시 무효화</b>: <code>revalidatePath</code>가 호출되면 Next.js는 해당 캐시된 페이지를 오래된 것으로 표시합니다.</li>
<li><b>백그라운드 재생성</b>: 해당 경로에 대한 다음 요청 시, Next.js는 오래된 페이지를 제공하고(구성된 경우) 백그라운드에서 페이지를 재생성하기 시작합니다.</li>
<li><b>즉시 재생성</b>: 또는 Next.js는 페이지가 재생성될 때까지 응답을 차단하여 사용자가 항상 최신 콘텐츠를 받도록 할 수 있습니다.</li>
</ul>
<h4 data-ke-size="size20"><b>재생성 중 데이터 가져오기</b></h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>최신 데이터 가져오기</b>: 재생성 과정에서 모든 데이터 가져오기 함수(예: 데이터베이스 쿼리)가 다시 실행됩니다.</li>
<li><b>캐시 업데이트</b>: 새로 생성된 페이지는 캐시에서 오래된 페이지를 대체합니다.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>과정 시각화</b></h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>초기 요청</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>사용자가 <code>/</code>를 요청합니다.</li>
<li>Next.js는 캐시에서 정적으로 생성된 페이지를 제공합니다.</li>
</ul>
</li>
<li><b>데이터 업데이트</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>POST 요청으로 데이터베이스의 프로젝트 데이터가 업데이트됩니다.</li>
<li><code>revalidatePath("/", "layout");</code>이 호출되어 <code>/</code>의 캐시를 무효화합니다.</li>
</ul>
</li>
<li><b>후속 요청</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>다른 사용자가 <code>/</code>를 요청합니다.</li>
<li>Next.js는 페이지가 오래되었음을 감지합니다.</li>
<li>Next.js는 페이지를 재생성합니다:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>최신 프로젝트 데이터를 가져옵니다.</li>
<li>업데이트된 콘텐츠로 페이지를 다시 렌더링합니다.</li>
</ul>
</li>
<li>새 페이지는 캐시되어 사용자에게 제공됩니다.</li>
</ul>
</li>
</ol>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>자동으로 보이는 이유</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>매끄러운 경험</b>: 재검증은 백그라운드에서 수동 개입 없이 이루어집니다.</li>
<li><b>일관된 데이터</b>: 재검증이 트리거된 후 사용자는 항상 최신 데이터를 받습니다.</li>
<li><b>전체 재빌드 불필요</b>: 영향을 받는 페이지만 재생성되어 리소스와 시간을 절약합니다.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>고려사항 및 모범 사례</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>에러 처리</b>: 일반적으로 데이터 업데이트가 성공한 후 재검증하는 것이 좋습니다. 코드에서는 에러 시 재검증하여 잠재적인 불일치를 해결합니다.</li>
<li><b>선택적 재검증</b>: 성능을 최적화하기 위해 정확히 어떤 경로를 재검증할지 지정할 수 있습니다.</li>
<li><b>재검증 제한</b>: 빈번한 재검증을 트리거할 때의 속도 제한이나 성능 영향을 주의하세요.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>요약</b></h3>
<p data-ke-size="size16">라우트 핸들러에서 <code>revalidatePath</code>를 사용함으로써, Next.js의 ISR 기능을 활용하여 정적 페이지가 데이터베이스의 최신 데이터와 동기화되도록 합니다. 이 과정은:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>캐시된 페이지 무효화</b>: 데이터 변경이 발생할 때 지정된 경로를 오래된 것으로 표시합니다.</li>
<li><b>온디맨드 재생성</b>: 다음 요청 시 Next.js가 최신 데이터로 페이지를 재생성합니다.</li>
<li><b>업데이트된 콘텐츠 제공</b>: 전체 사이트 재빌드 없이도 사용자에게 페이지의 최신 버전을 제공합니다.</li>
</ol>
<p data-ke-size="size16">이 메커니즘은 정적 사이트의 성능 이점과 서버 렌더링 애플리케이션의 동적 특성을 결합하여 매끄럽고 효율적인 사용자 경험을 제공합니다.</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>추가 자료</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Next.js의 ISR 문서</b>: <a href="https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration">Incremental Static Regeneration</a></li>
<li><b><code>revalidatePath</code> 함수</b>: <a href="https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration#using-on-demand-revalidation">온디맨드 재검증</a></li>
</ul>
<hr data-ke-style="style1" />
<p data-ke-size="size16">Next.js의 ISR과 <code>revalidatePath</code>와 같은 함수를 이해하고 활용함으로써, 데이터 소스와 동기화되는 고성능 애플리케이션을 구축하여 콘텐츠 제공에서 속도와 신선함을 모두 제공할 수 있습니다.</p>
<hr data-ke-style="style1" />