<h2 data-ke-size="size26">CORS? SOP?</h2>
<h3 data-ke-size="size23">1. SOP(동일 출처 정책, Same-Origin Policy)</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>웹 보안 모델의 핵심으로, 다른 출처의 리소스에 대한 접근을 제한</li>
<li>브라우저에서 실행되는 JavaScript가 다른 출처의 API나 리소스에 접근하지 못하도록 함</li>
<li><b>동일 출처의 정의</b>: 프로토콜, 호스트, 포트가 모두 같은 경우 <a href="https://docs.tosspayments.com/resources/glossary/cors">참고링크</a></li>
<li><b>SOP의 목적</b>: 악의적인 스크립트가 민감한 정보에 접근하는 것을 방지하기 위함</li>
</ul>
<h3 data-ke-size="size23">2. CORS(교차 출처 리소스 공유, Cross-Origin Resource Sharing)</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>SOP의 제한을 일부 해제하기 위한 보안 정책</li>
<li>서버측에서 특정 출처에 대한 접근을 허용할 수 있게 해줌</li>
<li><b>동작방식</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>클라이언트 측 요청: 요청이 발생할 때 브라우저는 요청이 안전한지 확인하기 위해 CORS 확인</li>
<li>서버 측 응답: 특정 클라이언트가 자신의 리소스에 접근 가능한지 허용 여부 설정 가능</li>
</ul>
</li>
<li><b>요청의 종류</b> :
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>단순요청: GET, POST</li>
<li>Preflight 요청: PUT, DELETE 등(OPTIONS 로 먼저 Preflight 요청 날아감)</li>
</ul>
</li>
<li>주요 헤더 설정:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Access-Control-Allow-Origin: 어떤 출처에서 리소스 접근 가능한지 명시</li>
<li>Access-Control-Allow-Methods: 허용된 메서드 명시</li>
<li>Access-Control-Allow-Credentials: 불린, 쿠키 및 인증 정보 허용 여부</li>
<li>Access-Control-Allow-Headers: 사용가능한 커스텀헤더 명시</li>
</ul>
</li>
</ul>
<h3 data-ke-size="size23">3. CORS 에러 대응하기</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>서버에서 Access-Control-Allow-Origin 응답 헤더에 직접 허용할 출처 추가</li>
<li>프록시 서버 사용 - 프록시 서버로 경유하는건데 해보면 귀찮고 잘 안됨. 그냥 응답헤더 추가하든 하자...</li>
</ul>
<h2 data-ke-size="size26">참고: Next.js Route Handler의 경우</h2>
<p data-ke-size="size16">Next.js Route Handler 로 CORS 를 설정하여 다른 출처에서도 사용할 수 있게 할 수 있음</p>
<pre class="javascript"><code>// /api/example/route.ts
export const dynamic = 'force-dynamic' 
<p>export async function GET(request: Request) {
return NextResponse.json({ message: 'Hello, Next.js!'}, {
status: 200,
headers: {
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type, Authorization',
},
})
}</code></pre></p>
<p data-ke-size="size16">그리고 각 Route Handler 의 정책을 next.config 에서 한번에 설정할 수도 있음</p>
<pre class="dts"><code>// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Set your origin
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
}</code></pre>
<p data-ke-size="size16"><a href="https://nextjs.org/docs/app/building-your-application/routing/route-handlers">참고-라우트핸들러</a><br /><a href="https://nextjs.org/docs/app/api-reference/next-config-js/headers#cors">참고-넥스트컨피그</a></p>