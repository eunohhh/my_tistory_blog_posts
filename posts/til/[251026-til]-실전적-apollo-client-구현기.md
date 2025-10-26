<h1>실전적 Apollo Client 구현기</h1>
<h2 data-ke-size="size26">1. 문제 상황</h2>
<h3 data-ke-size="size23">기술 스택</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Next.js 15</b> (App Router)</li>
<li><b>Hasura GraphQL</b></li>
<li><b>Apollo Client</b> with <code>@apollo/client-integration-nextjs</code></li>
</ul>
<h3 data-ke-size="size23">해결해야 했던 문제들</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>중복 코드 문제</b>: 서버용, 어드민용, 클라이언트용 총 3개의 Apollo Client 인스턴스가 필요했는데, 각각에 대해 Apollo Links를 별도로 작성하면 코드 중복이 심각함</li>
<li><b>서버/클라이언트 경계 처리</b>: RSC(React Server Components) 환경에서 서버와 클라이언트의 인증 방식이 달라 각각 다른 처리가 필요</li>
<li><b>토큰 갱신 로직</b>: 클라이언트에서만 토큰 갱신이 가능하므로 환경별로 다른 에러 처리 필요</li>
</ol>
<hr contenteditable="false" data-ke-type="horizontalRule" data-ke-style="style1" />
<h2 data-ke-size="size26">2. 해결 방안: 팩토리 패턴과 의존성 주입</h2>
<h3 data-ke-size="size23">2.1 팩토리 함수 설계</h3>
<pre class="typescript"><code>export interface CreateLinksOptions {
  isServer: boolean;
  getToken?: () =&gt; Promise&lt;string | null | undefined&gt; | string | null | undefined;
  hasuraAdminSecret?: string;
  hasuraGraphQLEndpoint?: string;
  refreshTokenManager?: {
    refreshAccessToken: () =&gt; Promise&lt;boolean&gt;;
  };
}</code></pre>
<p data-ke-size="size16">의존성을 외부에서 주입받아 다양한 환경에 대응할 수 있도록 설계</p>
<h3 data-ke-size="size23">2.2 핵심 구현 포인트</h3>
<p data-ke-size="size16"><b>1) 환경별 분기 처리</b></p>
<pre class="routeros"><code>const prefix = isServer ? " ️ [Server]" : "  [Client]";</code></pre>
<p data-ke-size="size16"><b>2) 조건부 링크 구성</b></p>
<pre class="inform7"><code>const links = [
  loggerLink,
  errorLink,
  ...(retryLink ? [retryLink] : []),  // 클라이언트만
  ...(ssrMultipartLink ? [ssrMultipartLink] : []),  // 서버만
  authLink.concat(httpLink),
];</code></pre>
<p data-ke-size="size16"><b>3) 토큰 갱신 처리 (클라이언트 전용)</b></p>
<pre class="coffeescript"><code>if (!isServer &amp;&amp; extensions?.code === "invalid-jwt") {
  return new Observable((observer) =&gt; {
    refreshTokenManager.refreshAccessToken()
      .then((success) =&gt; {
        if (success) {
          forward(operation).subscribe(observer);  // 재시도
        }
      });
  });
}</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<hr contenteditable="false" data-ke-type="horizontalRule" data-ke-style="style1" />
<h2 data-ke-size="size26">3. 실제 사용 예시</h2>
<h3 data-ke-size="size23">3.1 서버 컴포넌트용 클라이언트</h3>
<pre class="dart"><code>export const { getClient, query, PreloadQuery } = registerApolloClient(() =&gt; {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: createApolloLinks({
      isServer: true,
      getToken: async () =&gt; {
        const token = (await cookies()).get('access-token')?.value;
        return token;
      },
      hasuraGraphQLEndpoint: env.HASURA_GRAPHQL_ENDPOINT,
    }),
    incrementalHandler: new Defer20220824Handler(),
  });
});</code></pre>
<h3 data-ke-size="size23">3.2 클라이언트 컴포넌트용 클라이언트</h3>
<pre class="dart"><code>const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: createApolloLinks({
    isServer: false,
    hasuraGraphQLEndpoint: env.NEXT_PUBLIC_HASURA_GRAPHQL_ENDPOINT,
    refreshTokenManager: {
      refreshAccessToken: async () =&gt; {
        // 토큰 갱신 로직
        return await refreshToken();
      }
    },
  }),
});</code></pre>
<h3 data-ke-size="size23">3.3 어드민용 클라이언트 (서버 전용)</h3>
<pre class="yaml"><code>const adminClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: createApolloLinks({
    isServer: true,
    hasuraAdminSecret: env.HASURA_ADMIN_SECRET,
    hasuraGraphQLEndpoint: env.HASURA_GRAPHQL_ENDPOINT,
  }),
});</code></pre>
<h3 data-ke-size="size23">3.4 Apollo-Links 전체 예시</h3>
<pre class="typescript"><code>import { ApolloLink, HttpLink, Observable } from "@apollo/client";
import {
    CombinedGraphQLErrors,
    CombinedProtocolErrors,
} from "@apollo/client/errors";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { SSRMultipartLink } from "@apollo/client-integration-nextjs";
import { tap } from "rxjs/operators";
<p>export interface CreateLinksOptions {
isServer: boolean;
getToken?: () =&gt;
| Promise&lt;string | null | undefined&gt;
| string
| null
| undefined;
hasuraAdminSecret?: string;
hasuraGraphQLEndpoint?: string;
refreshTokenManager?: {
refreshAccessToken: () =&gt; Promise&lt;boolean&gt;;
};
}</p>
<p>// 아폴로 링크 팩토리 함수
export function createApolloLinks(options: CreateLinksOptions) {
const {
isServer,
getToken,
hasuraAdminSecret,
hasuraGraphQLEndpoint,
refreshTokenManager,
} = options;
const prefix = isServer ? &quot; ️ [Server]&quot; : &quot;  [Client]&quot;;
const endpoint = hasuraGraphQLEndpoint;</p>
<pre><code>// 1. Auth Link
// 서버: 쿠키에서 토큰을 읽어 Authorization 헤더 설정
const authLink = new SetContextLink(async (prevContext, _operation) =&amp;gt; {
    let token: string | null | undefined;

    // 명시적으로 토큰을 헤더에 추가
    if (getToken) {
         console.log(`${prefix}   apollo-links에서 헤더에 토큰 추가 시도 시작`);
         token = await getToken();
         console.log(
             `${prefix}   apollo-links에서 토큰 조회 성공:`,
             token ? `${token.substring(0, 20)}...` : &quot;null&quot;,
         );
     } else {
         console.log(`${prefix}   getToken 함수가 제공되지 않았습니다`);
     }

    const headers = {
        ...prevContext.headers,
        ...(token &amp;amp;&amp;amp; { authorization: `Bearer ${token}` }),
        &quot;x-request-from&quot;: isServer ? &quot;server&quot; : &quot;client&quot;,
    };

    return {
        headers,
    };
});

// 2. Error Link - 인증 에러 발생 시 토큰 갱신 및 재시도
const errorLink = new ErrorLink(({ error, operation, forward }) =&amp;gt; {
    if (CombinedGraphQLErrors.is(error)) {
        for (const err of error.errors) {
            const { message, locations, path, extensions } = err;
            console.log(
                `${prefix} ❌ [GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
            );

            // ** 클라이언트 토큰 갱신 처리 **
            if (!isServer &amp;amp;&amp;amp; typeof window !== &quot;undefined&quot;) {
                // invalid-jwt 또는 UNAUTHENTICATED 에러 감지
                if (
                    extensions?.code === &quot;invalid-jwt&quot; ||
                    extensions?.code === &quot;UNAUTHENTICATED&quot;
                ) {
                    console.log(
                        `${prefix}   apollo-links에서 토큰 갱신 시도 시작: ${operation.operationName}`,
                    );

                    // Observable을 반환하여 토큰 갱신 후 재시도
                    return new Observable((observer) =&amp;gt; {
                        if (!refreshTokenManager) {
                            console.error(`${prefix} ❌ refreshTokenManager 없음`);
                            observer.error(error);
                            return;
                        }
                        refreshTokenManager
                            .refreshAccessToken()
                            .then((success: boolean) =&amp;gt; {
                                if (success) {
                                    // 토큰 갱신 성공 - 원래 요청 재시도
                                    console.log(
                                        `${prefix} ♻️ 토큰 갱신 성공, ${operation.operationName} 재시도 시작`,
                                    );
                                    const subscriber = {
                                        next: observer.next.bind(observer),
                                        error: observer.error.bind(observer),
                                        complete: observer.complete.bind(observer),
                                    };
                                    forward(operation).subscribe(subscriber);
                                } else {
                                    // 토큰 갱신 실패 - 에러 전달
                                    observer.error(error);
                                }
                            })
                            .catch((refreshError: unknown) =&amp;gt; {
                                console.error(`${prefix} ❌ 토큰 갱신 에러:`, refreshError);
                                observer.error(error);
                            });
                    });
                }
                if (extensions?.code === &quot;FORBIDDEN&quot;) {
                    // 권한 부족 에러
                    console.warn(`${prefix} ⛔ Forbidden 인가 검토 필요: ${message}`);
                    // TODO: forbidden 일때 처리 방법 논의 필요 ***
                    // toast.error('권한이 없습니다?')
                }
            } else {
                // 서버에서는 토큰 갱신 불가 - 클라이언트에서 처리해야 함
                // 1. 서버는 브라우저 쿠키에 직접 접근 불가
                // 2. RSC는 이미 렌더링 중이라 쿠키 수정 불가
                // 3. 에러를 자동으로 전파하여 클라이언트에서 재인증 처리
                // (ErrorLink에서 아무것도 반환하지 않으면 에러가 자동 전파됨)
            }
        }
    } else if (CombinedProtocolErrors.is(error)) {
        for (const err of error.errors) {
            const { message, extensions } = err;
            console.log(
                `${prefix} ❌ [Protocol] ${operation.operationName}: ${message}`,
                { extensions },
            );
        }
    } else {
        console.error(`${prefix}   [Network error]:`, error);
    }
});

// 3. HTTP Link
const httpLink = new HttpLink({
    uri: endpoint,
    credentials: &quot;include&quot;,
    ...(isServer &amp;amp;&amp;amp; {
        fetch: fetch,
        fetchOptions: {
            cache: &quot;no-store&quot;,
        },
    }),
    ...(!!hasuraAdminSecret &amp;amp;&amp;amp; {
        headers: {
            &quot;x-hasura-admin-secret&quot;: hasuraAdminSecret,
        },
    }),
});

// 4. Retry Link (클라이언트만)
const retryLink = !isServer
    ? new RetryLink({
            delay: {
                initial: 300,
                max: 5000,
                jitter: true,
            },
            attempts: {
                max: 3,
                retryIf: (error) =&amp;gt;
                    !!error &amp;amp;&amp;amp; error.message.includes(&quot;Network error&quot;),
            },
        })
    : null;

// 5. SSR Multipart Link
const ssrMultipartLink = isServer
    ? new SSRMultipartLink({
            stripDefer: true,
        })
    : null;

// 6. Logger Link - 개발 환경에서만 GraphQL 작업 로깅
// Apollo Client 4.0에서 asyncMap이 제거되어 rxjs의 tap 연산자 사용
// tap은 사이드 이펙트(로깅)만 처리하고 응답은 그대로 전달
const loggerLink = new ApolloLink((operation, forward) =&amp;gt; {
    // 프로덕션 환경에서는 로깅 비활성화
    if (process.env.NODE_ENV !== &quot;development&quot;) {
        return forward(operation);
    }

    // 요청 시작 로그 (작업 이름과 변수 출력)
    console.log(`${prefix}   ${operation.operationName}`, {
        variables: operation.variables,
    });
    const start = Date.now();

    // 응답 완료 시 소요 시간 로그
    // 1초 이상 걸리면  , 그 이하면 ⚡ 이모지 표시
    return forward(operation).pipe(
        tap(() =&amp;gt; {
            const duration = Date.now() - start;
            const emoji = duration &amp;gt; 1000 ? &quot; &quot; : &quot;⚡&quot;;
            console.log(
                `${prefix} ${emoji} ${operation.operationName} (${duration}ms)`,
            );
        }),
    );
});

// 최종적으로 링크들 배열 생성
const links = [
    loggerLink,
    errorLink,
    ...(retryLink ? [retryLink] : []),
    ...(ssrMultipartLink ? [ssrMultipartLink] : []),
    authLink.concat(httpLink),
];

return ApolloLink.from(links);
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<hr contenteditable="false" data-ke-type="horizontalRule" data-ke-style="style1" />
<h2 data-ke-size="size26">4. 이 접근 방식의 장점</h2>
<p data-ke-size="size16">팩토리 패턴과 의존성 주입을 통해 복잡한 Apollo Client 설정을 깔끔하게 관리할 수 있었습니다. 특히 Next.js 15의 App Router와 RSC 환경에서 서버/클라이언트 경계를 명확히 구분하여 처리한 것이 핵심이었습니다.</p>
<h3 data-ke-size="size23">4.1 코드 재사용성</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>하나의 팩토리 함수로 3가지 클라이언트 구성을 모두 처리</li>
<li>링크 구성 로직의 중복 제거</li>
</ul>
<h3 data-ke-size="size23">4.2 유지보수성</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>의존성이 명확히 정의되어 있어 테스트 용이</li>
<li>새로운 링크 추가나 기존 링크 수정이 한 곳에서만 이루어짐</li>
</ul>
<h3 data-ke-size="size23">4.3 타입 안정성</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>TypeScript 인터페이스로 옵션을 정의하여 컴파일 타임에 오류 방지</li>
<li>IDE 자동완성 지원으로 개발 생산성 향상</li>
</ul>
<h3 data-ke-size="size23">4.4 환경별 최적화</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>서버: SSR Multipart Link 사용으로 스트리밍 지원</li>
<li>클라이언트: Retry Link로 네트워크 안정성 향상</li>
<li>개발 환경: Logger Link로 디버깅 편의성 제공</li>
</ul>
<hr contenteditable="false" data-ke-type="horizontalRule" data-ke-style="style1" />
<h2 data-ke-size="size26">6. 주의사항</h2>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>서버에서의 토큰 갱신 불가</b>: RSC는 이미 렌더링 중이므로 쿠키 수정 불가능. 에러를 클라이언트로 전파하여 처리해야 함</li>
<li><b>rxjs 의존성</b>: Apollo Client 4.0에서 <code>asyncMap</code>이 제거되어 rxjs의 <code>tap</code> 연산자 사용 필요</li>
<li><b>캐싱 전략</b>: 서버에서는 <code>cache: "no-store"</code> 설정으로 항상 최신 데이터 fetch</li>
</ol>