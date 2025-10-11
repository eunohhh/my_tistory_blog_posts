<h2 data-ke-size="size26">axios client 의 실전적 구성</h2>
<h3 data-ke-size="size23">1. 문제 정의</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>axios 클라이언트 구성을 매번 그때그때 하다보니 문제가 생길때가 많음</li>
<li>그러다보니 구조화가 되어있지 않아 어떻게했었지 하고 또 찾아봄</li>
<li>요청, 응답 interceptor 작성을 관성적으로 했더니 사용할때 제네릭을 두번씩 api.get&lt;타입, 타입&gt; 이런식으로 쓰고 있었음</li>
<li>2개 이상의 axios 클라이언트를 만들때(ex 서버용, 클라이언트용 등) 계층화가 안되어있어 불편</li>
<li>타입 안전성 부족과 에러 처리가 일관성이 없음</li>
<li>환경별 설정 관리가 어려움</li>
</ul>
<h3 data-ke-size="size23">2. 해결 방안</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>클래스로 axios api 클라이언트를 구성한다</li>
<li>api-client 추상 클래스 에서는 axios instance 를 생성하고 기본 메서드를 오버라이드한다</li>
<li>기본메서드를 오버라이드 하는 이유는 사용시 제네릭 입력 두번 안하고 편하게 하기 위해서</li>
<li>실제 사용할 api 메서드들은 base-api-client 를 extends 한 클래스에 작성</li>
<li>타입 안전성 강화와 커스텀 에러 클래스 도입</li>
<li>환경별 설정을 구조화하여 관리</li>
<li>요청 취소 및 재시도 로직 추가</li>
</ul>
<h3 data-ke-size="size23">3. 타입 정의</h3>
<pre class="typescript"><code>// API 응답 구조 정의
interface ApiResponse&lt;T&gt; {
  data: T;
  access_token?: string;
  message?: string;
  status?: string;
}
<p>// 에러 응답 구조 정의
interface ApiErrorResponse {
message: string;
detail?: string;
code?: string;
}</p>
<p>// 환경별 설정 인터페이스
interface ApiConfig {
apiUrl: string;
adminUrl: string;
timeout?: number;
retryAttempts?: number;
enableLogging?: boolean;
}</p>
<p>// 커스텀 에러 클래스
class ApiError extends Error {
constructor(
public status: number,
public message: string,
public data?: any
) {
super(message);
this.name = 'ApiError';
}
}</code></pre></p>
<h3 data-ke-size="size23">4. base-api-client.ts 추상클래스</h3>
<pre class="typescript"><code>export abstract class BaseApiClient {
  protected readonly apiInstance: AxiosInstance;
  protected readonly adminInstance: AxiosInstance;
  private readonly config: ApiConfig;
<p>constructor(config: ApiConfig) {
this.config = config;</p>
<pre><code>// 원하는 만큼 인스턴스 생성 (환경별 설정 적용)
this.apiInstance = axios.create({ 
  baseURL: config.apiUrl,
  timeout: config.timeout || 10000,
});

this.adminInstance = axios.create({ 
  baseURL: config.adminUrl,
  timeout: config.timeout || 10000,
});

// 여러 인스턴스에 동일 인터셉터 적용
this.applyRequestInterceptor(this.apiInstance);
this.applyRequestInterceptor(this.adminInstance);
this.applyResponseInterceptor(this.apiInstance);
this.applyResponseInterceptor(this.adminInstance);
</code></pre>
<p>}</p>
<p>private applyRequestInterceptor(instance: AxiosInstance): void {
// 요청시 로컬스토리지에 토큰 있으면 자동 적용
instance.interceptors.request.use((config) =&gt; {
if (typeof window !== &quot;undefined&quot;) {
const token = getLocalStorage(TOKEN_KEY);
if (token) {
config.headers = config.headers || {};
(config.headers as any).Authorization = <code>Bearer ${token}</code>;
}
}
return config;
});
}</p>
<p>private applyResponseInterceptor(instance: AxiosInstance): void {
instance.interceptors.response.use(
(response: AxiosResponse&lt;ApiResponse&lt;any&gt;&gt;) =&gt; {
// 응답 구조 검증
if (this.isValidApiResponse(response.data)) {
// 토큰이 있으면 자동 저장
if (typeof window !== &quot;undefined&quot; &amp;&amp; response.data?.access_token) {
setLocalStorage(TOKEN_KEY, response.data.access_token);
}
// 실제 데이터만 반환 (data 래핑 해제)
return response.data.data || response.data;
}
return response.data;
},
(error: AxiosError&lt;ApiErrorResponse&gt;) =&gt; {
return this.handleApiError(error);
}
);
}</p>
<p>// API 응답 구조 검증
private isValidApiResponse(data: any): data is ApiResponse&lt;any&gt; {
return data &amp;&amp; typeof data === 'object';
}</p>
<p>// 통합 에러 처리
private handleApiError(error: AxiosError&lt;ApiErrorResponse&gt;): never {
const { status = 500, data } = error.response || {};
const message = data?.message || error.message;</p>
<pre><code>// 로깅 (개발 환경에서만)
if (this.config.enableLogging &amp;amp;&amp;amp; process.env.NODE_ENV === 'development') {
  console.error(`API Error [${status}]:`, message, data);
}

// 상태별 처리
switch (status) {
  case 400:
    throw new ApiError(status, message || &quot;잘못된 요청입니다.&quot;, data);
  case 401: 
    // 토큰 만료 처리
    if (typeof window !== &quot;undefined&quot;) {
      removeLocalStorage(TOKEN_KEY);
    }
    throw new ApiError(status, message || &quot;인증이 필요합니다.&quot;, data);
  case 403:
    throw new ApiError(status, message || &quot;접근 권한이 없습니다.&quot;, data);
  case 404:
    throw new ApiError(status, message || &quot;요청한 리소스를 찾을 수 없습니다.&quot;, data);
  case 500:
    throw new ApiError(status, message || &quot;서버 오류가 발생했습니다.&quot;, data);
  default:
    throw new ApiError(status, message || &quot;알 수 없는 오류가 발생했습니다.&quot;, data);
}
</code></pre>
<p>}</p>
<p>// 재시도 로직
private async retryRequest&lt;T&gt;(
requestFn: () =&gt; Promise&lt;T&gt;,
maxRetries: number = this.config.retryAttempts || 3
): Promise&lt;T&gt; {
for (let i = 0; i &lt; maxRetries; i++) {
try {
return await requestFn();
} catch (error) {
if (
i === maxRetries - 1 ||
error instanceof ApiError &amp;&amp; error.status &lt; 500
) {
throw error;
}
// 지수 백오프 (1초, 2초, 4초...)
await this.delay(1000 * Math.pow(2, i));
}
}
throw new Error('Max retries reached');
}</p>
<p>private delay(ms: number): Promise&lt;void&gt; {
return new Promise(resolve =&gt; setTimeout(resolve, ms));
}</p>
<p>// HTTP 메서드 (타입 안전성 및 요청 취소 지원)
protected getAdmin&lt;T = unknown&gt;(
url: string,
config?: AxiosRequestConfig &amp; { signal?: AbortSignal }
): Promise&lt;T&gt; {
return this.retryRequest(() =&gt;
this.adminInstance.get(url, config) as Promise&lt;T&gt;
);
}</p>
<p>protected get&lt;T = unknown&gt;(
url: string,
config?: AxiosRequestConfig &amp; { signal?: AbortSignal }
): Promise&lt;T&gt; {
return this.retryRequest(() =&gt;
this.apiInstance.get(url, config) as Promise&lt;T&gt;
);
}</p>
<p>protected delete&lt;T = unknown&gt;(
url: string,
config?: AxiosRequestConfig &amp; { signal?: AbortSignal }
): Promise&lt;T&gt; {
return this.retryRequest(() =&gt;
this.apiInstance.delete(url, config) as Promise&lt;T&gt;
);
}</p>
<p>protected post&lt;T = unknown&gt;(
url: string,
data?: unknown,
config?: AxiosRequestConfig &amp; { signal?: AbortSignal }
): Promise&lt;T&gt; {
return this.retryRequest(() =&gt;
this.apiInstance.post(url, data, config) as Promise&lt;T&gt;
);
}</p>
<p>protected put&lt;T = unknown&gt;(
url: string,
data?: unknown,
config?: AxiosRequestConfig &amp; { signal?: AbortSignal }
): Promise&lt;T&gt; {
return this.retryRequest(() =&gt;
this.apiInstance.put(url, data, config) as Promise&lt;T&gt;
);
}</p>
<p>protected patch&lt;T = unknown&gt;(
url: string,
data?: unknown,
config?: AxiosRequestConfig &amp; { signal?: AbortSignal }
): Promise&lt;T&gt; {
return this.retryRequest(() =&gt;
this.apiInstance.patch(url, data, config) as Promise&lt;T&gt;
);
}
}</code></pre></p>
<h3 data-ke-size="size23">5. apis.ts</h3>
<pre class="qml"><code>class ApiClient extends BaseApiClient {
  constructor() {
    // 환경별 설정
    const config: ApiConfig = {
      apiUrl: API_URL || '',
      adminUrl: ADMIN_API_URL || '',
      timeout: 15000,
      retryAttempts: 3,
      enableLogging: process.env.NODE_ENV === 'development'
    };
<pre><code>if (!config.apiUrl || !config.adminUrl) {
  throw new Error(&quot;API_URL과 ADMIN_API_URL이 설정되지 않았습니다.&quot;);
}

super(config);
</code></pre>
<p>}</p>
<p>// == 도메인 메서드 (AbortSignal 지원) ==</p>
<p>// 유저 체크
public getUserCheck(signal?: AbortSignal): Promise&lt;UserCheckResponse&gt; {
return this.get&lt;UserCheckResponse&gt;(<code>/api/auth/user-check</code>, { signal });
}</p>
<p>// 닉네임 또는 메시지 비속어 체크
public postProhibitedCheck(
text: string,
signal?: AbortSignal
): Promise&lt;ProhibitedCheckResponse&gt; {
return this.post&lt;ProhibitedCheckResponse&gt;(
<code>/api/poster/prohibited-check?text=${text}</code>,
undefined,
{ signal }
);
}</p>
<p>// 레디스 체크
public postRedisCheck(signal?: AbortSignal): Promise&lt;RedisCheckResponse&gt; {
return this.post&lt;RedisCheckResponse&gt;(<code>/api/poster/redis-status</code>, undefined, { signal });
}</p>
<p>// 생성 여부 체크
public getPosterCheck(signal?: AbortSignal): Promise&lt;PosterCheckResponse&gt; {
return this.get&lt;PosterCheckResponse&gt;(<code>/api/auth/poster-check</code>, { signal });
}</p>
<p>// 여기에 계속 추가...
}</p>
<p>const api = new ApiClient();
export default api;</code></pre></p>
<h3 data-ke-size="size23">6. 사용 예시</h3>
<pre class="javascript"><code>// 기본 사용
try {
  const userData = await api.getUserCheck();
  console.log(userData);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API 오류 [${error.status}]: ${error.message}`);
    // 상태별 처리
    if (error.status === 401) {
      // 로그인 페이지로 리다이렉트
    }
  }
}
<p>// 요청 취소
const controller = new AbortController();
const userData = api.getUserCheck(controller.signal);</p>
<p>// 5초 후 취소
setTimeout(() =&gt; controller.abort(), 5000);</code></pre></p>
<h3 data-ke-size="size23">7. 해결되는 문제</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>제네릭 입력 편리</li>
<li>가독성 향상</li>
<li>적절한 추상화, 캡슐화로 사용성 향상</li>
<li><b>타입 안전성 확보</b> (ApiResponse, ApiError 타입 정의)</li>
<li><b>환경별 설정 관리</b> (ApiConfig 인터페이스)</li>
<li><b>통일된 에러 처리</b> (커스텀 ApiError 클래스)</li>
<li><b>자동 재시도 및 요청 취소</b> (AbortSignal, 지수 백오프)</li>
<li><b>개발 환경 로깅</b> (디버깅 편의성)</li>
</ul>