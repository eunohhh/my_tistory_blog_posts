<p data-ke-size="size16">이미지를 10px 사이즈의 base64 문자열로 변환하는 함수를 작성하기 위해, 먼저 이미지를 불러와서 크기를 조정한 후 base64 형식으로 인코딩해야 합니다. 서버 사이드에서 이미지를 처리하기 위해 <code>sharp</code> 라이브러리를 사용할 수 있습니다. 이를 Next.js API 라우트를 통해 구현할 수 있습니다.</p>
<p data-ke-size="size16">다음은 이미지를 10px 사이즈로 변환하고 base64 문자열로 반환하는 API 라우트를 작성하는 방법입니다:</p>
<h3 data-ke-size="size23">1. <code>sharp</code> 라이브러리 설치</h3>
<p data-ke-size="size16">먼저 <code>sharp</code> 라이브러리를 설치합니다.</p>
<pre class="cmake"><code>npm install sharp</code></pre>
<h3 data-ke-size="size23">2. API 라우트 작성</h3>
<p data-ke-size="size16"><code>src/pages/api/getBase64.ts</code> 파일을 생성하고 다음 코드를 추가합니다:</p>
<pre class="typescript"><code>import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
<p>const fetchImageAsBuffer = async (src: string): Promise&lt;Buffer&gt; =&gt; {
const response = await fetch(src);
if (!response.ok) {
throw new Error(<code>Failed to fetch image: ${response.statusText}</code>);
}
const arrayBuffer = await response.arrayBuffer();
return Buffer.from(arrayBuffer);
};</p>
<p>const resizeImageToBase64 = async (buffer: Buffer, size: number): Promise&lt;string&gt; =&gt; {
const resizedBuffer = await sharp(buffer)
.resize(size, size)
.toBuffer();
return <code>data:image/png;base64,${resizedBuffer.toString('base64')}</code>;
};</p>
<p>export default async function handler(req: NextApiRequest, res: NextApiResponse) {
const { src } = req.query;
if (typeof src !== 'string') {
res.status(400).json({ error: 'Invalid src' });
return;
}</p>
<pre><code>try {
    const buffer = await fetchImageAsBuffer(src);
    const base64 = await resizeImageToBase64(buffer, 10);

    res.status(200).json({ base64 });
} catch (error) {
    res.status(500).json({ error: error.message });
}
</code></pre>
<p>}</code></pre></p>
<h3 data-ke-size="size23">3. 클라이언트에서 API 호출</h3>
<p data-ke-size="size16">이제 클라이언트에서 API를 호출하여 이미지를 base64 형식으로 가져오는 함수를 작성합니다:</p>
<pre class="typescript"><code>// utils/getBase64Client.ts
const getBase64Client = async (src: string) =&gt; {
    const response = await fetch(`/api/getBase64?src=${encodeURIComponent(src)}`);
    if (!response.ok) {
        throw new Error('Failed to fetch base64 data');
    }
    const data = await response.json();
    return data.base64;
};
<p>export default getBase64Client;</code></pre></p>
<h3 data-ke-size="size23">4. 컴포넌트에서 API 호출</h3>
<p data-ke-size="size16">이제 컴포넌트에서 <code>getBase64Client</code> 함수를 사용하여 이미지를 가져오고 표시합니다:</p>
<pre class="javascript"><code>import React, { useEffect, useState } from 'react';
import getBase64Client from '@/utils/getBase64Client';
<p>const ImageComponent = ({ src }: { src: string }) =&gt; {
const [base64, setBase64] = useState&lt;string | null&gt;(null);</p>
<pre><code>useEffect(() =&amp;gt; {
    const fetchData = async () =&amp;gt; {
        try {
            const base64Data = await getBase64Client(src);
            setBase64(base64Data);
        } catch (error) {
            console.error(error);
        }
    };

    fetchData();
}, [src]);

if (!base64) {
    return &amp;lt;div&amp;gt;Loading...&amp;lt;/div&amp;gt;;
}

return (
    &amp;lt;img src={base64} alt=&quot;Image&quot; /&amp;gt;
);
</code></pre>
<p>};</p>
<p>export default ImageComponent;</code></pre></p>
<p data-ke-size="size16">이제 API 라우트를 통해 이미지를 10px 크기로 변환하고 base64 형식으로 인코딩한 다음, 클라이언트에서 이를 호출하여 사용할 수 있습니다. 이 접근 방식은 이미지를 클라이언트에서 직접 처리하는 대신 서버 사이드에서 처리하여 클라이언트로 전달합니다.</p>