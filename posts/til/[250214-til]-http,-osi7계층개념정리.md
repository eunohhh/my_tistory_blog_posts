<h3 data-ke-size="size23"><b>HTTP란 무엇인가?</b></h3>
<p data-ke-size="size16">HTTP(HyperText Transfer Protocol)는 <b>클라이언트-서버 간의 요청/응답을 처리하는 프로토콜</b>입니다.</p>
<p data-ke-size="size16">HTTP는 클라이언트와 서버 간의 요청-응답을 처리하는 애플리케이션 계층 프로토콜입니다. 기본적으로 stateless하며, 요청 방식(메서드)과 응답 코드, 헤더, 바디 등의 개념을 포함합니다. GET, POST, PUT, DELETE 같은 메서드를 사용해 리소스를 요청하고 조작합니다. 또한, HTTP/1.1, HTTP/2, HTTP/3 등의 버전이 있으며 성능과 보안 측면에서 차이를 보입니다.</p>
<h3 data-ke-size="size23"><b>주요 개념</b></h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>HTTP의 특징</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Stateless (기본적으로 상태를 유지하지 않음)</li>
<li>Request-Response 구조</li>
<li>메서드(GET, POST, PUT, DELETE 등)와 역할</li>
</ul>
</li>
<li><b>HTTP 메시지 구조</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>요청(Request): <code>메서드 + URL + 헤더 + 바디</code></li>
<li>응답(Response): <code>상태코드 + 헤더 + 바디</code></li>
<li>주요 헤더 (Content-Type, Cache-Control, Authorization 등)</li>
</ul>
</li>
<li><b>HTTP 상태 코드</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>2xx (성공): 200 OK, 201 Created</li>
<li>3xx (리디렉션): 301 Moved Permanently, 302 Found</li>
<li>4xx (클라이언트 오류): 400 Bad Request, 401 Unauthorized, 404 Not Found</li>
<li>5xx (서버 오류): 500 Internal Server Error, 503 Service Unavailable</li>
</ul>
</li>
<li><b>HTTP와 HTTPS 차이</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>HTTPS는 TLS/SSL을 적용해 보안을 강화한 HTTP</li>
</ul>
</li>
<li><b>HTTP/1.1 vs HTTP/2 vs HTTP/3 차이점</b>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>HTTP/2: 멀티플렉싱, 서버 푸시</li>
<li>HTTP/3: QUIC 프로토콜 사용, 더 빠른 연결</li>
</ul>
</li>
</ol>
<h3 data-ke-size="size23"><b>OSI 7 계층이란?</b></h3>
<p data-ke-size="size16">OSI 7 계층(Open Systems Interconnection Model)은 <b>네트워크 통신을 7개의 계층으로 나눈 모델</b>입니다. 각 계층은 특정한 역할을 하며, 네트워크 데이터가 어떻게 송수신되는지를 설명하는 데 사용됩니다.</p>
<h3 data-ke-size="size23"><b>OSI 7 계층 구조</b></h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>응용 계층 (Application Layer)</b> &ndash; HTTP, FTP, SMTP</li>
<li><b>표현 계층 (Presentation Layer)</b> &ndash; 데이터 암호화/복호화 (SSL/TLS)</li>
<li><b>세션 계층 (Session Layer)</b> &ndash; 연결 유지, 세션 관리 (소켓 통신)</li>
<li><b>전송 계층 (Transport Layer)</b> &ndash; TCP(연결형) / UDP(비연결형)</li>
<li><b>네트워크 계층 (Network Layer)</b> &ndash; IP 주소 지정 및 라우팅 (IP, ICMP)</li>
<li><b>데이터 링크 계층 (Data Link Layer)</b> &ndash; MAC 주소, 이더넷 (ARP, 스위치)</li>
<li><b>물리 계층 (Physical Layer)</b> &ndash; 실제 신호 전송 (케이블, Wi-Fi)</li>
</ol>
<p data-ke-size="size16">OSI 7 계층은 네트워크 통신을 7개의 계층으로 나눈 개념 모델입니다. 각 계층은 데이터를 송수신하는 역할을 나누며, 예를 들어 HTTP는 응용 계층, TCP/UDP는 전송 계층, IP는 네트워크 계층에서 동작합니다. 이 모델을 통해 데이터 흐름을 단계적으로 이해할 수 있습니다.</p>