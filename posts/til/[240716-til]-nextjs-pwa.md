<p>nextjs 14버전에서 pwa 를 셋업하는 방법에 대해 알아보았습니다.</p>
<h2>1. next-pwa 설치</h2>
<pre><code class="language-zsh">yarn add next-pwa 
yarn add -D webpack</code></pre>
<h2>2. next.config.mjs 수정</h2>
<p>아래와 같이 수정합니다.</p>
<pre><code class="language-tsx">import withPWAInit from &quot;next-pwa&quot;;
<p>const withPWA = withPWAInit({
dest: &quot;public&quot;,
});</p>
<p>/** @type {import('next').NextConfig} */
const nextConfig = {};</p>
<p>export default withPWA(nextConfig);</code></pre></p>
<h2>3. 퍼블릭에 manifest.json</h2>
<p>/public 폴더에 아래와 같이 manifest.json 파일을 작성합니다.</p>
<pre><code class="language-json">{
    &quot;name&quot;: &quot;My Next.js PWA&quot;,
    &quot;short_name&quot;: &quot;NextPWA&quot;,
    &quot;description&quot;: &quot;My awesome Next.js PWA!&quot;,
    &quot;icons&quot;: [
        {
            &quot;src&quot;: &quot;/test_icon.png&quot;,
            &quot;type&quot;: &quot;image/png&quot;,
            &quot;sizes&quot;: &quot;192x192&quot;
        },
        {
            &quot;src&quot;: &quot;/test_icon.png&quot;,
            &quot;type&quot;: &quot;image/png&quot;,
            &quot;sizes&quot;: &quot;512x512&quot;
        }
    ],
    &quot;start_url&quot;: &quot;/&quot;,
    &quot;background_color&quot;: &quot;#ffffff&quot;,
    &quot;theme_color&quot;: &quot;#000000&quot;,
    &quot;display&quot;: &quot;standalone&quot;
}</code></pre>
<h2>4. layout.tsx</h2>
<p>루트 layout.tsx 에 아래와 같이 viewport 와 metadata 를 설정해줍니다.</p>
<pre><code class="language-tsx">export const viewport: Viewport = {
    themeColor: &quot;black&quot;,
    width: &quot;device-width&quot;,
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: &quot;cover&quot;,
};
<p>export const metadata: Metadata = {
title: &quot;Create Next App&quot;,
description: &quot;Generated by create next app&quot;,
manifest: &quot;/manifest.json&quot;,
icons: {
icon: &quot;/test_icon.png&quot;,
shortcut: &quot;/test_icon.png&quot;,
apple: &quot;/test_icon.png&quot;,
other: {
rel: &quot;apple-touch-icon-precomposed&quot;,
url: &quot;/test_icon.png&quot;,
},
},
};</code></pre></p>
<h2>5. 설치 유도</h2>
<h3>public/sw.js</h3>
<p>설치 유도를 하려면, service worker와 BeforeInstallPromptEvent를 사용해야 합니다.</p>
<p><a href="https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent">https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent</a></p>
<p>먼저, public/sw.js 파일을 작성합니다.</p>
<pre><code class="language-js">// public/sw.js
import { clientsClaim } from &#39;workbox-core&#39;;
import { precacheAndRoute } from &#39;workbox-precaching&#39;;
import { registerRoute } from &#39;workbox-routing&#39;;
import { NetworkFirst, CacheFirst } from &#39;workbox-strategies&#39;;
import { ExpirationPlugin } from &#39;workbox-expiration&#39;;
import { CacheableResponsePlugin } from &#39;workbox-cacheable-response&#39;;
<p>clientsClaim();</p>
<p>// self.__WB_MANIFEST is injected by workbox-build during the build process
precacheAndRoute(self.__WB_MANIFEST || []);</p>
<p>// Cache CSS, JS, and web worker requests with a network-first strategy.
registerRoute(
({ request }) =&gt; request.destination === 'style' || request.destination === 'script' || request.destination === 'worker',
new NetworkFirst({
cacheName: 'static-resources',
})
);</p>
<p>// Cache image files with a cache-first strategy.
registerRoute(
({ request }) =&gt; request.destination === 'image',
new CacheFirst({
cacheName: 'images',
plugins: [
new ExpirationPlugin({
maxEntries: 50,
}),
],
})
);</p>
<p>// Cache API calls with a network-first strategy.
registerRoute(
({ url }) =&gt; url.pathname.startsWith('/api/'),
new NetworkFirst({
cacheName: 'api',
networkTimeoutSeconds: 10,
plugins: [
new CacheableResponsePlugin({
statuses: [0, 200],
}),
],
})
);</p>
<p>// Cache the start URL with a network-first strategy.
registerRoute(
'/',
new NetworkFirst({
cacheName: 'start-url',
plugins: [
{
cacheWillUpdate: async ({ request, response }) =&gt; {
if (response &amp;&amp; response.type === 'opaqueredirect') {
return new Response(response.body, {
status: 200,
statusText: 'OK',
headers: response.headers,
});
}
return response;
},
},
],
})
);</p>
<p>// Cache everything else with a network-only strategy.
registerRoute(
({ request }) =&gt; true,
new CacheFirst({
cacheName: 'catch-all',
})
);</code></pre></p>
<h3>utils/isPWA.ts</h3>
<pre><code class="language-ts">export const isPWA = (): boolean =&gt; {
    return (
        window.matchMedia(&quot;(display-mode: standalone)&quot;).matches ||
            (window.navigator as any).standalone === true
    );
};</code></pre>
<p>위 코드는 주소창 존재 여부를 판별해 줍니다.<br>그리하여 현재 앱이 pwa 모드로 작동되고있는지를 판별할 수 있습니다.</p>
<h3>응용.useCheckPwa</h3>
<p>유틸함수를 응용하여 아래처럼 훅을 만들 수 있을 것 같습니다.</p>
<pre><code class="language-tsx">import { useEffect, useState } from &#39;react&#39;;
<p>const useCheckPwa = (): boolean =&gt; {
const [isPwa, setIsPwa] = useState(false);</p>
<pre><code>useEffect(() =&amp;gt; {
    const checkPwa = (): boolean =&amp;gt; {
    return window.matchMedia(&amp;#39;(display-mode: standalone)&amp;#39;).matches 
    || (window.navigator as any).standalone === true;
};

setIsPwa(checkPwa());
}, []);

return isPwa;
</code></pre>
<p>};</p>
<p>export default useCheckPwa;</code></pre></p>
<h3>버튼 컴포넌트</h3>
<p>실험결과, 자동으로 판단해서 설치프롬프트를 띄워줄 수는 없습니다.<br>특히 모바일에서 사용자 상호작용이 없이는 안되더라고요.</p>
<p>그래서 아래처럼 버튼 컴포넌트로 만들 수 있습니다.</p>
<pre><code class="language-tsx">&quot;use client&quot;;
<p>import useCheckPwa from '@/hooks/useCheckPwa';
import { useEffect, useState } from 'react';</p>
<p>const InstallPromptHandler = () =&gt; {
const [deferredPrompt, setDeferredPrompt] = useState&lt;Event | null&gt;(null);
const isPwa = useCheckPwa();</p>
<pre><code>useEffect(() =&amp;gt; {
    const handler = (e: Event) =&amp;gt; {
        e.preventDefault();
        setDeferredPrompt(e);
    };

    window.addEventListener(&amp;#39;beforeinstallprompt&amp;#39;, handler as any);

    return () =&amp;gt; {
        window.removeEventListener(&amp;#39;beforeinstallprompt&amp;#39;, handler as any);
    };
}, []);


const handleInstallClick = () =&amp;gt; {
    if (deferredPrompt) {
        (deferredPrompt as any).prompt();
        (deferredPrompt as any).userChoice.then((choiceResult: any) =&amp;gt; {
            if (choiceResult.outcome === &amp;#39;accepted&amp;#39;) {
                console.log(&amp;#39;User accepted the install prompt&amp;#39;);
            } else {
                console.log(&amp;#39;User dismissed the install prompt&amp;#39;);
            }
            setDeferredPrompt(null);
        });
    }
};


if (isPwa) {
    return null;
}


if (!isPwa) {
    return (
        &amp;lt;button
            onClick={handleInstallClick}
            className=&amp;quot;bg-blue-500 text-white px-4 py-2 rounded-md&amp;quot;
        &amp;gt;            
        홈 화면에 추가하기
        &amp;lt;/button&amp;gt;
    &amp;lt;/&amp;gt;
    )
}
</code></pre>
<p>};</p>
<p>export default InstallPromptHandler;</code></pre></p>
<p>그런데 아직 모바일에서 프롬프트가 잘 안표시되는 증상이 있어서 개선이 필요합니다!</p>