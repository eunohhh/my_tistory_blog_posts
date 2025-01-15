<h3 data-ke-size="size23">1. 설치</h3>
<pre class="javascript" data-ke-language="javascript"><code>pnpm add -D @testing-library/dom @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest jest jest-environment-jsdom msw
pnpm create jest@latest</code></pre>
<h3 data-ke-size="size23">2. jest.config 설정</h3>
<pre class="typescript"><code>import type { Config } from 'jest';
import nextJest from 'next/jest.js';
<p>const createJestConfig = nextJest({
dir: './',
});</p>
<p>const config: Config = {
// Automatically clear mock calls, instances, contexts and results before every test
clearMocks: true,</p>
<p>// Indicates whether the coverage information should be collected while
// executing the test
collectCoverage: true,</p>
<p>// The directory where Jest should output its coverage files
coverageDirectory: 'coverage',</p>
<p>// Indicates which provider should be used to instrument code for coverage
coverageProvider: 'v8',</p>
<p>// A map from regular expressions to module names or to arrays of module names
// that allow to stub out resources with a single module
moduleNameMapper: {
'^@/(.*)$': '&lt;rootDir&gt;/src/$1',
},</p>
<p>// The test environment that will be used for testing
testEnvironment: 'jsdom',</p>
<p>// The glob patterns Jest uses to detect test files
testMatch: ['**/*.test.(ts|tsx)'],
};</p>
<p>export default createJestConfig(config);</code></pre></p>
<h3 data-ke-size="size23">3. Mock Query Client 설정</h3>
<pre class="javascript"><code>import { QueryClient } from '@tanstack/react-query';
<p>const createTestQueryClient = () =&gt;
new QueryClient({
defaultOptions: {
queries: {
retry: false,
staleTime: Infinity,
},
},
});</p>
<p>const testQueryClient = createTestQueryClient();</code></pre></p>
<h3 data-ke-size="size23">4. Mock Router 설정</h3>
<pre class="rust"><code>import '@testing-library/jest-dom';
<p>const createRouter = () =&gt; ({
push: jest.fn(),
replace: jest.fn(),
back: jest.fn(),
forward: jest.fn(),
refresh: jest.fn(),
prefetch: jest.fn(),
});</p>
<p>export const router = createRouter();</code></pre></p>
<h3 data-ke-size="size23">5. Render 잘 되는지 기본 테스트</h3>
<p data-ke-size="size16">만약 테스트할 컴포넌트가 SignInForm 이라면 아래처럼...</p>
<pre class="javascript"><code>import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
<p>describe('SignIn', () =&gt; {
const renderWithRouterAndQueryClient = () =&gt;
render(
&lt;AppRouterContext.Provider value={{ ...router }}&gt;
&lt;QueryClientProvider client={testQueryClient}&gt;
&lt;SignInForm /&gt;
&lt;/QueryClientProvider&gt;
&lt;/AppRouterContext.Provider&gt;,
);</p>
<p>it('renders correctly', () =&gt; {
renderWithRouterAndQueryClient();
});
});</code></pre></p>
