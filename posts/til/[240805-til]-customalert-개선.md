<p data-ke-size="size16">얼러트 모달이 여기저기 필요해서<br />서버, 클라이언트 관계없이 아무데서나 호출해서 쓸 수 있도록<br />아래처럼 사용하고 있었습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그런데 이 방법에 문제가 조금 있었습니다.<br />그냥 써도 무방한 정도였지만 해결해보기로 하였습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">문제는 번들 사이즈가 너무 크다는 점 이었습니다.<br />여기저기서 호출 하는 함수인데 무거우면 안될 것이라 판단했습니다.</p>
<h2 data-ke-size="size26">원래 버전</h2>
<p data-ke-size="size16">원일을 찾아보니 createRoot 를 하기 위해 가져온<br />ReactDom 이 번들사이즈가 132kb 정도로 무거웠습니다.</p>
<p data-ke-size="size16">그래서 이것을 제거하고 다른 방법을 사용하기로 했습니다.</p>
<p data-ke-size="size16"><br />하지만 그러면 컴포넌트를 사용해서 아무데서나 body에<br />얼러트 모달을 부착할 수가 없었습니다.</p>
<pre class="javascript"><code>import CustomAlert from '@/components/organisms/common/CustomAlert';
import React from 'react';
import ReactDOM from 'react-dom/client';
<p>let alertContainer: HTMLDivElement | null = null;
let root: ReactDOM.Root | null = null;</p>
<p>interface AlertProps {
onConfirm?: () =&gt; void;
isConfirm?: boolean;
}</p>
<p>export function showAlert(
title: 'success' | 'caution' | 'error', // 얼러트 타이틀
description: string, // 얼러트 설명
options: AlertProps = {}, // 옵션 객체
): void {
const { onConfirm = null, isConfirm = false } = options;</p>
<pre><code>if (!alertContainer) {
    alertContainer = document.createElement('div');        
    document.body.appendChild(alertContainer);        
    root = ReactDOM.createRoot(alertContainer);    
}

const onClose = () =&amp;gt; {
    if (root &amp;amp;&amp;amp; alertContainer) {
        root.unmount();
        document.body.removeChild(alertContainer);
        alertContainer = null;
        root = null;
    }
};

const handleConfirm = () =&amp;gt; {
    onClose();
    if (onConfirm) onConfirm(); // 확인 버튼을 눌렀을 때 추가 동작 실행
};

if (root) {
    root.render(
        React.createElement(CustomAlert, {
            title: title,
            description: description,
            isConfirm: isConfirm,
            onClose: handleConfirm,
            onJustClose: onClose,
        }),
    );
}
</code></pre>
<p>}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그래서 그냥 contextAPI로 만들기로 하였습니다.</p>
<p data-ke-size="size16">커스텀모달을 서버에서 호출하는 것도 조금 이상하기도 하여<br />클라이언트에서만 호출하도록 변경하게 되었습니다.</p>
<h2 data-ke-size="size26">문제 - 현재 파일 구조를 유지할 것</h2>
<p data-ke-size="size16">그런데 문제는 context 로 구성하면 커스텀 훅을 써야 할 것인데,<br />이미 프로젝트가 중반쯤 진행되었고, 여기저기서 쓰이고 있었기에<br />구조를 바꿔버리면 팀원들이 사용하는 컴포넌트에서<br />훅을 불러오는 부분을 다 추가해줘야만 했습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그래서 저는 현재 구조를 똑같이 유지해서<br />팀원들이나 추후 컴포넌트에서도 똑같이 사용할 수 있게 하고 싶었습니다.</p>
<p data-ke-size="size16">그러기 위해서는 약간 트리키한 접근이 필요했습니다.</p>
<h2 data-ke-size="size26">modal.context.tsx</h2>
<p data-ke-size="size16">먼저 아래처럼 기본적인 모달 콘텍스트를 만들어 주었습니다.</p>
<pre class="javascript"><code>const initialValue: ModalContextType = {
    open: () =&gt; {},
    close: () =&gt; {},
};
<p>export const ModalContext = createContext&lt;ModalContextType&gt;(initialValue);</p>
<p>export const useModal = () =&gt; useContext(ModalContext);</p>
<p>export const ModalProviderDefault: React.FC&lt;{ children: React.ReactNode }&gt; = ({
children,
}) =&gt; {
const [modalOptions, setModalOptions] = useState&lt;ModalOptions | null&gt;(null);</p>
<pre><code>const { setLock } = useLockBodyScroll();

const open = useCallback(
    (options: ModalOptions) =&amp;gt; {
        setModalOptions(options);
        setLock(true);
    },
    [setLock],
);

const close = useCallback(() =&amp;gt; {
    if (modalOptions?.options.onConfirm) modalOptions.options.onConfirm();
    setLock(false);
    setModalOptions(null);
}, [modalOptions, setLock]);

useEffect(() =&amp;gt; {
    setLock(false);
}, [setLock]);

return (
    &amp;lt;ModalContext.Provider value={{ open, close }}&amp;gt;
        {children}
        {modalOptions &amp;amp;&amp;amp; (
            &amp;lt;CustomAlert
                title={modalOptions.title}
                description={modalOptions.description}
                isConfirm={modalOptions.options.isConfirm}
                onJustClose={() =&amp;gt; setModalOptions(null)}
                onClose={close}
            /&amp;gt;
        )}
    &amp;lt;/ModalContext.Provider&amp;gt;
);
</code></pre>
<p>};</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">위에서 컴포넌트명을 ModalProviderDefault 로 한 이유는<br />약간의 편법을 쓰기 위해 Provider 컴포넌트가 하나 더 필요해서<br />그냥 default 라는 단어를 붙여준 것입니다.</p>
<p data-ke-size="size16"><br />작명이 역시 항상 어렵습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">ModalProviderSetter</h2>
<p data-ke-size="size16">사용을 편리하게 하고 현행 구조를 유지하기 위해서<br />provider 를 하나 더 만듭니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이 녀석이 useModal 을 대신 해줌으로써<br />자식 컴포넌트에서는 매번 훅을 호출하지 않아도 되게 됩니다.</p>
<pre class="javascript"><code>export const ModalProviderSetter: React.FC&lt;{ children: React.ReactNode }&gt; = ({
    children,
}) =&gt; {
    const modal = useModal();
<pre><code>useEffect(() =&amp;gt; {
    setModalContext(modal);
}, [modal]);

return &amp;lt;&amp;gt;{children}&amp;lt;/&amp;gt;;
</code></pre>
<p>};</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">이런 간단한 구조입니다.<br />그렇다면 setModalContext 함수를 봐야겠죠</p>
<p data-ke-size="size16">&nbsp;</p>
<h2 data-ke-size="size26">setModalContext</h2>
<pre class="javascript"><code>let modalContext: ModalContextType;
<p>export function setModalContext(context: ModalContextType) {
modalContext = context;
}
export const showAlert = (
title: 'success' | 'caution' | 'error',
description: string,
options: AlertProps = {},
): void =&gt; {
if (!modalContext) {
console.error(
'Modal context is not set. Ensure ModalProvider is initialized.',
);
return;
}</p>
<pre><code>modalContext.open({
    title,
    description,
    options,
});
</code></pre>
<p>};</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">역시 단순한 구조입니다.</p>
<p data-ke-size="size16"><br />useState 같지만 그냥 이름만 set 이고<br />저쪽 파일의 어휘환경에서 동작하며 modalContext 에<br />값을 담아주는 역할 입니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">얼러트모달 호출이 contextAPI 가<br />init 되고 난 후에 가능하게 해주는 것이죠.</p>
<h2 data-ke-size="size26">감싸는 구조</h2>
<p data-ke-size="size16">그래서 이것들을 어떻게 감싸면 되는가 하면 아래와 같습니다.</p>
<pre class="javascript"><code>const 어쩌구Layout : React.FC&lt;PropsWithChidren&gt; = async ({ childern }) =&gt; {
// ...중략...
    return (
        &lt;ModalProviderDefault&gt;
            &lt;ModalProviderSetter&gt;
                { childern }
            &lt;/ModalProviderSetter&gt;
        &lt;/ModalProviderDefault&gt;
    )
}
export default 어쩌구Layout;</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">set 하는 친구를 default 의 자식으로 설정해 줍니다.</p>
<p data-ke-size="size16">여담으로 gpt는 자꾸 얘를 부모로 하라고 해서 상당히 헤맸습니다 ㅎㅎ</p>