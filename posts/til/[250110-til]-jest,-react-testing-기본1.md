<h3>1. 설치</h3>
<pre><code class="language-shell">pnpm add -D @testing-library/dom @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest jest jest-environment-jsdom msw</code></pre>
<h3>2. jest.config 설정</h3>
<pre><code class="language-ts">import type { Config } from &#39;jest&#39;;
import nextJest from &#39;next/jest.js&#39;;
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
<h3>3. Mock Query Client 설정</h3>
<pre><code class="language-tsx">import { QueryClient } from &#39;@tanstack/react-query&#39;;
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
<h3>4. Mock Router 설정</h3>
<pre><code class="language-ts">import &#39;@testing-library/jest-dom&#39;;
<p>const createRouter = () =&gt; ({
push: jest.fn(),
replace: jest.fn(),
back: jest.fn(),
forward: jest.fn(),
refresh: jest.fn(),
prefetch: jest.fn(),
});</p>
<p>export const router = createRouter();</code></pre></p>
<h3>5. Render 잘 되는지 기본 테스트</h3>
<p>만약 테스트할 컴포넌트가 SignInForm 이라면 아래처럼...</p>
<pre><code class="language-tsx">import &#39;@testing-library/jest-dom&#39;;
import { render } from &#39;@testing-library/react&#39;;
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
