<h2 data-ke-size="size26">webp 로 변환이 필요해</h2>
<p data-ke-size="size16">사용자가 만약 몇십메가짜리 이미지를 넣으면 어떡할 것인가?<br />라는 문제에서 이미지를 webp로 변환하는 로직을 작성해보았습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">서버로 파일을 보내면 라우트핸들러에서<br />webp로 변환하고 수파베이스에 저장하는 단순한 방법입니다.</p>
<h2 data-ke-size="size26">클라이언트 에서</h2>
<p data-ke-size="size16">일단 useState 든 뭐든 File 이 변수에 저장되어 있어야 합니다.</p>
<pre class="go"><code>const formData = new FormData();
formData.append('imageFile', imageFile);
<p>const payload: StoryData = formData;
mutate(payload);</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">클라이언트에서는 위처럼 처리합니다.</p>
<p data-ke-size="size16"><br />애초에 form 태그를 쓰고 있다면 <code>new FormData(여기에 e.target 넣을것)</code> 요렇게 하면 될 것 같고</p>
<p data-ke-size="size16">아니라면 위처럼 해도 될 것 같아요.</p>
<p data-ke-size="size16"><br />mutate 는 tanstack query 사용하는 것인데<br />fetch 든 axios 든 뭐든 아무튼 서버로 넘기면 됩니다.</p>
<p data-ke-size="size16">body에 JSON.stringify 없이 그냥 payload 채로 보냅니다.</p>
<pre class="haskell"><code>const data = await fetch(url, {
    method: 'POST',
    body: payload,
});</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이런식으로요.</p>
<h2 data-ke-size="size26">서버에서</h2>
<pre class="javascript"><code>export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('imageFile') as Blob;
<pre><code>const imageBuffer = await convertToWebP(file, 1080);

const filePath = `stories_${Date.now()}.webp`;

const { data, error } = await supabase
    .storage
    .from('stories')
    .upload(filePath, imageBuffer, { contentType: 'image/webp' });
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">POST 메서드 라우트핸들러를 만듭니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위처럼 req.formData() 를 호출하면 클라이언트에서 보낸 formData 를 사용할 수 있습니다.<br />formData 에서 File 을 blob 으로 꺼내서</p>
<p data-ke-size="size16">convertToWebP 유틸함수를 호출합니다.</p>
<p data-ke-size="size16"><br />그러면 Buffer 를 리턴하는데요.</p>
<p data-ke-size="size16">그것을 위처럼 수파베이스 스토리지에 써주면 끝입니다.</p>
<h2 data-ke-size="size26">convertToWebp 함수</h2>
<pre class="processing"><code>import sharp from 'sharp';
<p>type ConvertToWebpProps = {
inputBuffer: Buffer;
maxWidth: number;
maxHeight?: number;
};</p>
<p>export async function convertToWebPServer({
inputBuffer,
maxWidth = 720,
maxHeight = 720,
}: ConvertToWebpProps): Promise&lt;Buffer&gt; {
let image = sharp(inputBuffer, { density: 100 });</p>
<pre><code>// EXIF 데이터를 기반으로 이미지 회전
image = image.rotate();

// 이미지의 원래 크기를 가져옴
const metadata = await image.metadata();
let width = metadata.width;
let height = metadata.height;

if (width &amp;amp;&amp;amp; height) {
    const aspectRatio = width / height;
    // maxWidth와 maxHeight를 사용하여 적절한 크기를 계산
    if (aspectRatio &amp;gt; 1) {
        // 가로가 더 긴 경우
        if (width &amp;gt; maxWidth) {
            width = maxWidth;
            height = Math.floor(maxWidth / aspectRatio);
        }
    } else {
        // 세로가 더 긴 경우
        if (height &amp;gt; maxHeight) {
            height = maxHeight;
            width = Math.floor(maxHeight * aspectRatio);
        }
    }
    image = image.resize(width, height, {
        fit: 'inside', // 이미지가 잘리지 않도록 함
    });
}
const buffer = await image.toFormat('webp').toBuffer();
return buffer;
</code></pre>
<p>}</p>
<p>export default async function convertToWebP(
file: Blob,
maxWidth: number,
maxHeight?: number,
) {
try {
const arrayBuffer = await file.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);
const convertedBuffer = await convertToWebPServer({
inputBuffer: buffer,
maxWidth,
maxHeight,
});
return convertedBuffer;
} catch (error) {
console.error('이미지 변환 중 에러 발생!:', error);
return null;
}
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">실제로 이미지를 변환하는 부분은 sharp 라이브러리를 써서 처리합니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">maxWidth, maxHeight 를 파라미터로 줄 수 있고<br />가로 세로 비율을 체크한 뒤<br />어느쪽이건 인자로 전달한 값보다 크면 그 값까지 줄여줍니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그리고 다시 버퍼로 리턴합니다.</p>
<p data-ke-size="size16">전반적으로 개선이 더 필요한 코드입니다.</p>
<h2 data-ke-size="size26">sharp Vercel 빌드 에러 해결</h2>
<p data-ke-size="size16">sharp 라이브러리 최신버전(현재 0.33.4)으로 설치할 경우<br />arm64 환경에 잘 대처하지 못하는 것 같고</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">여러모로 시도해서 dev 에서는 에러를 잡았지만,<br />vercel 배포시 빌드 에러가 났습니다.</p>
<p data-ke-size="size16">역시 이유는 win64 가 어쩌고 저쩌고.. 입니다.</p>
<p data-ke-size="size16"><br />검색을 거듭하다가 버전을 낮추면 간단히 해결된다는 것을 보고</p>
<p data-ke-size="size16">"0.32.6" 버전으로 낮추어 해결하였습니다.</p>