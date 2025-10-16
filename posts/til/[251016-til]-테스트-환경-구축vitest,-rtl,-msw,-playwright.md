<h1>Next.js 15 테스트 환경 구축 가이드</h1>
<h2>0단계: 조합</h2>
<ul>
<li>유닛테스트: Vitest</li>
<li>통합테스트: React Testing Library + MSW</li>
<li>E2E테스트: Playwright</li>
</ul>
<h2>1단계: 테스트 환경 구축</h2>
<h3>1️⃣ Vitest 설정 (유닛 테스트)</h3>
<pre><code class="language-bash">pnpm add -D vitest @vitejs/plugin-react jsdom
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event</code></pre>
<p><strong>vitest.config.ts</strong></p>
<pre><code class="language-typescript">import { defineConfig } from &#39;vitest/config&#39;
import react from &#39;@vitejs/plugin-react&#39;
import path from &#39;path&#39;
<p>export default defineConfig({
plugins: [react()],
test: {
environment: 'jsdom',
globals: true,
setupFiles: ['./tests/setup.ts'],
},
resolve: {
alias: {
'@': path.resolve(__dirname, './src'),
},
},
})</code></pre></p>
<p><strong>tests/setup.ts</strong></p>
<pre><code class="language-typescript">import &#39;@testing-library/jest-dom&#39;
import { afterEach } from &#39;vitest&#39;
import { cleanup } from &#39;@testing-library/react&#39;
<p>afterEach(() =&gt; {
cleanup()
})</code></pre></p>
<h3>2️⃣ MSW 설정 (API 모킹)</h3>
<pre><code class="language-bash">pnpm add -D msw@latest</code></pre>
<p><strong>tests/mocks/handlers.ts</strong></p>
<pre><code class="language-typescript">import { http, HttpResponse } from &#39;msw&#39;
<p>export const handlers = [
http.post('<em>/auth/v1/token</em>', () =&gt; {
return HttpResponse.json({
access_token: 'mock-token',
user: { id: 'user-1', email: 'test@example.com' },
})
}),
]</code></pre></p>
<p><strong>tests/mocks/server.ts</strong></p>
<pre><code class="language-typescript">import { setupServer } from &#39;msw/node&#39;
import { handlers } from &#39;./handlers&#39;
<p>export const server = setupServer(...handlers)</code></pre></p>
<p><strong>tests/setup.ts에 추가</strong></p>
<pre><code class="language-typescript">import { server } from &#39;./mocks/server&#39;
import { beforeAll, afterAll, afterEach } from &#39;vitest&#39;
<p>beforeAll(() =&gt; server.listen({ onUnhandledRequest: 'error' }))
afterEach(() =&gt; server.resetHandlers())
afterAll(() =&gt; server.close())</code></pre></p>
<h3>3️⃣ Playwright 설정 (E2E)</h3>
<pre><code class="language-bash">pnpm add -D @playwright/test
pnpm dlx playwright install</code></pre>
<p><strong>playwright.config.ts</strong></p>
<pre><code class="language-typescript">import { defineConfig, devices } from &#39;@playwright/test&#39;
<p>export default defineConfig({
testDir: './tests/e2e',
fullyParallel: true,
forbidOnly: !!process.env.CI,
retries: process.env.CI ? 2 : 0,
use: {
baseURL: 'http://localhost:3000',
trace: 'on-first-retry',
},
projects: [
{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
],
webServer: {
command: 'pnpm dev',
url: 'http://localhost:3000',
reuseExistingServer: !process.env.CI,
},
})</code></pre></p>
<h3>4️⃣ 디렉토리 구조</h3>
<pre><code>project/
├── tests/
│   ├── setup.ts
│   ├── mocks/
│   │   ├── handlers.ts
│   │   └── server.ts
│   ├── helpers/
│   │   └── test-utils.tsx
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── src/
│   └── app/</code></pre><h3>5️⃣ package.json 스크립트</h3>
<pre><code class="language-json">{
  &quot;scripts&quot;: {
    &quot;test&quot;: &quot;vitest&quot;,
    &quot;test:ui&quot;: &quot;vitest --ui&quot;,
    &quot;test:coverage&quot;: &quot;vitest --coverage&quot;,
    &quot;test:e2e&quot;: &quot;playwright test&quot;,
    &quot;test:e2e:ui&quot;: &quot;playwright test --ui&quot;
  }
}</code></pre>
<h2>2단계: TDD로 테스트 작성하기</h2>
<h3>TDD 사이클</h3>
<ol>
<li><strong>Red</strong>: 실패하는 테스트 작성</li>
<li><strong>Green</strong>: 최소한의 코드로 테스트 통과</li>
<li><strong>Refactor</strong>: 코드 개선</li>
</ol>
<h3>유닛 테스트 작성</h3>
<p><strong>위치</strong>: <code>tests/unit/</code> 또는 <code>src/**/__tests__/</code></p>
<h4>예시 1: 유틸 함수</h4>
<pre><code class="language-typescript">// tests/unit/format-price.test.ts
import { describe, it, expect } from &#39;vitest&#39;
import { formatPrice } from &#39;@/lib/format-price&#39;
<p>describe('formatPrice', () =&gt; {
it('숫자를 통화 형식으로 변환한다', () =&gt; {
expect(formatPrice(10000)).toBe('10,000원')
})</p>
<p>it('0을 올바르게 처리한다', () =&gt; {
expect(formatPrice(0)).toBe('0원')
})
})</code></pre></p>
<h4>예시 2: 컴포넌트</h4>
<pre><code class="language-typescript">// tests/unit/button.test.tsx
import { describe, it, expect, vi } from &#39;vitest&#39;
import { render, screen } from &#39;@testing-library/react&#39;
import userEvent from &#39;@testing-library/user-event&#39;
import { Button } from &#39;@/components/ui/button&#39;
<p>describe('Button', () =&gt; {
it('클릭 이벤트를 처리한다', async () =&gt; {
const handleClick = vi.fn()
const user = userEvent.setup()</p>
<pre><code>render(&amp;lt;Button onClick={handleClick}&amp;gt;클릭&amp;lt;/Button&amp;gt;)
await user.click(screen.getByRole(&amp;#39;button&amp;#39;))

expect(handleClick).toHaveBeenCalledTimes(1)
</code></pre>
<p>})</p>
<p>it('disabled 상태에서는 클릭이 동작하지 않는다', async () =&gt; {
const handleClick = vi.fn()
const user = userEvent.setup()</p>
<pre><code>render(&amp;lt;Button onClick={handleClick} disabled&amp;gt;클릭&amp;lt;/Button&amp;gt;)
await user.click(screen.getByRole(&amp;#39;button&amp;#39;))

expect(handleClick).not.toHaveBeenCalled()
</code></pre>
<p>})
})</code></pre></p>
<h4>예시 3: Next.js 컴포넌트 모킹</h4>
<pre><code class="language-typescript">// tests/unit/product-card.test.tsx
import { vi } from &#39;vitest&#39;
import { render, screen } from &#39;@testing-library/react&#39;
<p>// Next.js 모킹
vi.mock('next/image', () =&gt; ({
default: (props: any) =&gt; &lt;img {...props} /&gt;
}))</p>
<p>vi.mock('next/link', () =&gt; ({
default: ({ children, href }: any) =&gt; &lt;a href={href}&gt;{children}&lt;/a&gt;
}))</p>
<p>describe('ProductCard', () =&gt; {
it('상품 정보를 렌더링한다', () =&gt; {
const product = { id: '1', name: '상품', price: 10000 }
render(&lt;ProductCard product={product} /&gt;)</p>
<pre><code>expect(screen.getByText(&amp;#39;상품&amp;#39;)).toBeInTheDocument()
</code></pre>
<p>})
})</code></pre></p>
<p><strong>실행</strong>:</p>
<pre><code class="language-bash">pnpm test                          # 전체 테스트
pnpm test --watch                  # watch 모드
pnpm test tests/unit/button        # 특정 파일</code></pre>
<h3>통합 테스트 작성</h3>
<p><strong>위치</strong>: <code>tests/integration/</code></p>
<h4>테스트 헬퍼 작성</h4>
<pre><code class="language-typescript">// tests/helpers/test-utils.tsx
import { ReactElement } from &#39;react&#39;
import { render } from &#39;@testing-library/react&#39;
import { QueryClient, QueryClientProvider } from &#39;@tanstack/react-query&#39;
<p>export function createTestQueryClient() {
return new QueryClient({
defaultOptions: {
queries: { retry: false },
mutations: { retry: false },
},
})
}</p>
<p>export function renderWithProviders(ui: ReactElement) {
const queryClient = createTestQueryClient()</p>
<p>return render(
&lt;QueryClientProvider client={queryClient}&gt;
{ui}
&lt;/QueryClientProvider&gt;
)
}</code></pre></p>
<h4>예시: 로그인 폼 통합 테스트</h4>
<pre><code class="language-typescript">// tests/integration/login-form.test.tsx
import { describe, it, expect, vi } from &#39;vitest&#39;
import { screen, waitFor } from &#39;@testing-library/react&#39;
import userEvent from &#39;@testing-library/user-event&#39;
import { server } from &#39;../mocks/server&#39;
import { http, HttpResponse } from &#39;msw&#39;
import { renderWithProviders } from &#39;../helpers/test-utils&#39;
import { LoginForm } from &#39;@/components/auth/login-form&#39;
<p>describe('LoginForm 통합 테스트', () =&gt; {
it('로그인에 성공한다', async () =&gt; {
const onSuccess = vi.fn()
const user = userEvent.setup()</p>
<pre><code>renderWithProviders(&amp;lt;LoginForm onSuccess={onSuccess} /&amp;gt;)

await user.type(screen.getByLabelText(/이메일/i), &amp;#39;test@example.com&amp;#39;)
await user.type(screen.getByLabelText(/비밀번호/i), &amp;#39;password123&amp;#39;)
await user.click(screen.getByRole(&amp;#39;button&amp;#39;, { name: /로그인/i }))

await waitFor(() =&amp;gt; {
  expect(onSuccess).toHaveBeenCalled()
})
</code></pre>
<p>})</p>
<p>it('잘못된 credentials는 에러를 표시한다', async () =&gt; {
server.use(
http.post('<em>/auth/v1/token</em>', () =&gt; {
return HttpResponse.json(
{ error: '인증 실패' },
{ status: 401 }
)
})
)</p>
<pre><code>const user = userEvent.setup()
renderWithProviders(&amp;lt;LoginForm /&amp;gt;)

await user.type(screen.getByLabelText(/이메일/i), &amp;#39;wrong@example.com&amp;#39;)
await user.type(screen.getByLabelText(/비밀번호/i), &amp;#39;wrong&amp;#39;)
await user.click(screen.getByRole(&amp;#39;button&amp;#39;, { name: /로그인/i }))

await waitFor(() =&amp;gt; {
  expect(screen.getByRole(&amp;#39;alert&amp;#39;)).toHaveTextContent(&amp;#39;인증 실패&amp;#39;)
})
</code></pre>
<p>})
})</code></pre></p>
<p><strong>실행</strong>:</p>
<pre><code class="language-bash">pnpm test tests/integration</code></pre>
<h3>E2E 테스트 작성</h3>
<p><strong>위치</strong>: <code>tests/e2e/</code></p>
<h4>예시: 로그인 플로우</h4>
<pre><code class="language-typescript">// tests/e2e/auth.spec.ts
import { test, expect } from &#39;@playwright/test&#39;
<p>test.describe('인증 플로우', () =&gt; {
test('사용자가 로그인하고 대시보드로 이동한다', async ({ page }) =&gt; {
// API 모킹
await page.route('<strong>/auth/v1/token</strong>', async route =&gt; {
await route.fulfill({
status: 200,
body: JSON.stringify({
access_token: 'token',
user: { email: 'test@example.com' }
})
})
})</p>
<pre><code>await page.goto(&amp;#39;/login&amp;#39;)

await page.getByLabel(&amp;#39;이메일&amp;#39;).fill(&amp;#39;test@example.com&amp;#39;)
await page.getByLabel(&amp;#39;비밀번호&amp;#39;).fill(&amp;#39;password123&amp;#39;)
await page.getByRole(&amp;#39;button&amp;#39;, { name: &amp;#39;로그인&amp;#39; }).click()

await expect(page).toHaveURL(&amp;#39;/dashboard&amp;#39;)
await expect(page.getByText(&amp;#39;test@example.com&amp;#39;)).toBeVisible()
</code></pre>
<p>})</p>
<p>test('잘못된 credentials로는 로그인할 수 없다', async ({ page }) =&gt; {
await page.route('<strong>/auth/v1/token</strong>', async route =&gt; {
await route.fulfill({
status: 401,
body: JSON.stringify({ error: '인증 실패' })
})
})</p>
<pre><code>await page.goto(&amp;#39;/login&amp;#39;)

await page.getByLabel(&amp;#39;이메일&amp;#39;).fill(&amp;#39;wrong@example.com&amp;#39;)
await page.getByLabel(&amp;#39;비밀번호&amp;#39;).fill(&amp;#39;wrong&amp;#39;)
await page.getByRole(&amp;#39;button&amp;#39;, { name: &amp;#39;로그인&amp;#39; }).click()

await expect(page.getByRole(&amp;#39;alert&amp;#39;)).toContainText(&amp;#39;인증 실패&amp;#39;)
await expect(page).toHaveURL(&amp;#39;/login&amp;#39;)
</code></pre>
<p>})
})</code></pre></p>
<p><strong>실행</strong>:</p>
<pre><code class="language-bash">pnpm test:e2e                    # 전체 E2E 테스트
pnpm test:e2e --headed           # 브라우저 보면서 실행
pnpm test:e2e --debug            # 디버그 모드
pnpm test:e2e --ui               # UI 모드</code></pre>
<h2>3단계: 테스트 실행과 유지보수</h2>
<h3>일상적인 워크플로우</h3>
<p><strong>개발 중</strong>:</p>
<pre><code class="language-bash">pnpm test --watch                # 유닛/통합 테스트 watch</code></pre>
<p><strong>커밋 전</strong>:</p>
<pre><code class="language-bash">pnpm test                        # 전체 유닛/통합 테스트
pnpm test:e2e                    # 주요 플로우 변경 시</code></pre>
<p><strong>CI/CD</strong>:</p>
<pre><code class="language-bash">pnpm test:coverage               # 커버리지 리포트
pnpm test:e2e                    # 전체 E2E 테스트</code></pre>
<h3>MSW 핸들러 관리</h3>
<p>새로운 API 추가 시:</p>
<pre><code class="language-typescript">// tests/mocks/handlers.ts
export const handlers = [
  // 기본 핸들러
  http.get(&#39;/api/users&#39;, () =&gt; {
    return HttpResponse.json({ users: [] })
  }),
]</code></pre>
<p>특정 테스트에서 오버라이드:</p>
<pre><code class="language-typescript">server.use(
  http.get(&#39;/api/users&#39;, () =&gt; {
    return HttpResponse.json({ users: [/* ... */] })
  })
)</code></pre>
<h3>커버리지 확인</h3>
<pre><code class="language-bash">pnpm test:coverage</code></pre>
<ul>
<li>수치보다는 <strong>누락된 시나리오</strong>에 집중</li>
<li>특히 에러 케이스, 경계 조건 확인</li>
</ul>
<h3>회귀 방지</h3>
<p>버그 발견 시:</p>
<ol>
<li>버그를 재현하는 테스트 작성 (실패 확인)</li>
<li>버그 수정</li>
<li>테스트 통과 확인</li>
<li>테스트를 코드베이스에 유지</li>
</ol>
<h3>테스트 작성 팁</h3>
<ul>
<li><strong>유닛</strong>: 순수 함수, 단일 컴포넌트</li>
<li><strong>통합</strong>: 여러 컴포넌트 + API 상호작용</li>
<li><strong>E2E</strong>: 실제 사용자 시나리오</li>
</ul>
<p><strong>Given-When-Then 구조 활용</strong>:</p>
<pre><code class="language-typescript">it(&#39;사용자가 장바구니에 상품을 추가한다&#39;, async () =&gt; {
  // Given: 상품 페이지에서
  renderWithProviders(&lt;ProductPage /&gt;)
<p>// When: 장바구니 버튼을 클릭하면
await user.click(screen.getByRole('button', { name: '장바구니' }))</p>
<p>// Then: 성공 메시지가 표시된다
expect(screen.getByText('추가되었습니다')).toBeInTheDocument()
})</code></pre></p>
<h3>자주 하는 실수</h3>
<p>❌ <strong>너무 많은 것을 한 번에 테스트</strong></p>
<pre><code class="language-typescript">// 나쁜 예
it(&#39;전체 앱이 동작한다&#39;, () =&gt; { /* ... */ })</code></pre>
<p>✅ <strong>작고 집중된 테스트</strong></p>
<pre><code class="language-typescript">// 좋은 예
it(&#39;이메일 유효성 검사를 수행한다&#39;, () =&gt; { /* ... */ })
it(&#39;로그인 API를 호출한다&#39;, () =&gt; { /* ... */ })</code></pre>
<p>❌ <strong>구현 세부사항 테스트</strong></p>
<pre><code class="language-typescript">// 나쁜 예
expect(component.state.isLoading).toBe(true)</code></pre>
<p>✅ <strong>사용자가 보는 것 테스트</strong></p>
<pre><code class="language-typescript">// 좋은 예
expect(screen.getByText(&#39;로딩 중...&#39;)).toBeInTheDocument()</code></pre>
<h3>유용한 명령어 모음</h3>
<pre><code class="language-bash"># 특정 테스트만 실행
pnpm test button
<h1>변경된 파일만 테스트</h1>
<p>pnpm test --changed</p>
<h1>실패한 테스트만 재실행</h1>
<p>pnpm test --reporter=verbose --bail=1</p>
<h1>Playwright 특정 브라우저</h1>
<p>pnpm test:e2e --project=chromium</p>
<h1>Playwright 트레이스 보기</h1>
<p>npx playwright show-trace trace.zip</code></pre></p>
