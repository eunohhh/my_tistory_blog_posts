<h2 data-ke-size="size26">openai api 로 이미지 생성 후 supabase 에 쓰기(route handler)</h2>
<p data-ke-size="size16">대략 아래와 같이 하면 됩니다.<br />근데 한번 생성할 때 마다 돈나가고 10달러 충천해놔야 합니다.</p>
<pre class="javascript"><code>if (!tripImageFile &amp;&amp; mode === 'new' &amp;&amp; tripData) {
    const openai = new OpenAI({
        apiKey: OPEN_AI_SECRET_KEY,
    });
<pre><code>// [서울/경기, 서울시] 이런 값입니다 대충
const [continent, country] =
tripData.trip_final_destination?.split(' ') || [];

// OpenAI를 사용하여 이미지를 생성
const imageGeneration = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `고공에서 바라본 ${country} 도시의 경관, 높은 앵글에서의 촬영`,
    n: 1,
    // size: '512x512', 달리3 는 이미지 크기 직접 설정 불가하다고 하네요??
    response_format: 'url', // URL로 이미지 반환
});

// 달리3가 정확히 어떤 프로프트를 생성했는지 아래 콘솔로 찍어볼 수 있습니다
console.log('revised prompt ====&amp;gt;', imageGeneration.data[0].revised_prompt);

const imageUrl = imageGeneration.data[0].url;

if (!imageUrl) {
    return NextResponse.json(
        { error: '이미지 생성 중 오류 발생' },
        { status: 500 },
    );
}

// 이미지 다운로드
const response = await fetch(imageUrl);
const blob = await response.blob();

// 웹피로 변환(sharp 사용)
const imageBuffer = await convertToWebP(blob, 1024);
// 파일명 설정
const filePath = `trips_${Date.now()}.webp`;

if (!imageBuffer) {
    return NextResponse.json(
        { error: '이미지 변환 중 오류 발생' },
        { status: 500 },
    );
}

const { data: imageData, error: imageError } =
    await supabase.storage
        .from('trips')
        .upload(filePath, imageBuffer, {
            contentType: 'image/webp',
        });

if (imageError) {
    return NextResponse.json(
        { error: '이미지 업로드 중 오류 발생' },
        { status: 500 },
    );
}

const { data: publicUrl } = supabase.storage
.from('trips')
.getPublicUrl(filePath);

tripData.trip_thumbnail = publicUrl.publicUrl;
</code></pre>
<p>}</code></pre></p>
