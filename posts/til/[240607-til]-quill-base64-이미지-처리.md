<h3 data-ke-size="size23">문제상황1 - Quill의 기본 base64 이미지 처리</h3>
<p data-ke-size="size16">팀프로젝트를 진행하던 중, 편집기 라이브러리가 필요해 Quill 을 채택했습니다.<br />그런데 편집기에서 이미지를 삽입할 시 기본 처리 방식이 base64 로 변환하는 방식이었습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">저희가 원한 것은 삽입된 이미지가 폼 제출을 할 때 supabase storage에 업로드되고,<br />해당 publicUrl 을 받아와 기본 base64 이미지의 src 를 대체하여 DB에 insert 되는 것이었습니다.</p>
<h3 data-ke-size="size23">해결방법 1 - custom image handler</h3>
<p data-ke-size="size16">이 문제를 해결하려고 찾아보던중 Quill 라이브러리에서 이미지 처리 방식을 custom handler 로 대체 할 수<br />있음 을 알게 되었고, 처음에는 custom handler 함수 안에서 모든 생각한 로직을 처리 하려고 하였습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그러나 막상 어느정도 구현해보니, custom handler 는 이미지가 텍스트 편집기에 삽입될 때에 동작하기 때문에,<br />이 단계에서 이미지를 storage 에 쓰게되면, 사용자가 이미지를 썼다 지웠다 하면서 텍스트를 편집해도 그동안의<br />이미지가 모두 storage에 업로드 되는 문제를 발견했습니다.</p>
<h3 data-ke-size="size23">해결방법2 - 업로드시 일괄 처리</h3>
<p data-ke-size="size16">그리하여 다시 생각한 방법은, 제어컴포넌트의 state 로 저장하고 있는 에디터 본문 string 을, onSubmit 일 때 다시 html 객체 다루듯이 임시 div 에 넣고, 거기서 getElementsByTagName 을 활용해 img 태그를 모두 선택한 뒤 순서대로 base64 를 blob 으로 변환시키는 방법을 생각했고 이 방법은 성공적이었습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그렇지만 custom handler 는 그대로 사용하기로 하였습니다. 왜냐하면 이미지를 삽입했을 때, 커서 위치가 부자연 스러운 문제가 있었기 때문입니다. 그래서 custom handler 에는 이미지처리 로직 보다 오히려 이미지 삽입시 커서를 자동으로 개행해주는 로직을 추가하였습니다.</p>
<h3 data-ke-size="size23">예시 코드</h3>
<h4 data-ke-size="size20">custom handler</h4>
<pre class="reasonml"><code>// 이미지 처리를 하는 핸들러
const imageHandler = (quill, onTextChangeRef) =&gt; 
    console.log('에디터에서 이미지 버튼을 클릭하면 이 핸들러가 시작됩니다!');
<pre><code>// 1. 이미지를 저장할 input type=file DOM을 만든다.
const input = document.createElement('input');
// 속성 써주기
input.setAttribute('type', 'file');
input.setAttribute('accept', 'image/*');
input.click(); // 에디터 이미지버튼을 클릭하면 이 input이 클릭된다.
// input이 클릭되면 파일 선택창이 나타난다.

// input에 변화가 생긴다면 = 이미지를 선택
input.addEventListener('change', async () =&amp;gt; {
    const file = input.files[0];
    const formData = new FormData();
    formData.append('img', file); // formData는 키-밸류 구조
    try {
        const base64 = await getDataUrl(file);

        // 1. 현재 에디터 커서 위치값을 가져온다
        const range = quill.getSelection();
        // 2. 가져온 위치에 이미지를 삽입한다
        quill.insertEmbed(range.index, 'image', base64);
        // 3. 커서를 이미지 다음으로 이동시키기
        quill.setSelection(range.index + 1);
        // 4. 강제로 TEXT_CHANGE 이벤트 트리거
        quill.insertText(range.index + 1, '\n');

        // quill.root.innerHTML을 사용하여 onTextChangeRef 호출
        onTextChangeRef.current?.(quill.root.innerHTML);

    } catch (error) {
        console.log('실패했어요ㅠ', error);
    }
});
</code></pre>
<p>};</code></pre></p>
<h4 data-ke-size="size20">form onSubmit</h4>
<pre class="javascript"><code>const handleSubmit = async (e) =&gt; {
    e.preventDefault();
<pre><code>if (!user) return alert('로그인이 필요합니다!');
if (!title || !contents) return alert('내용이 입력되지 않았습니다!');
const yes = confirm(blog ? '글을 수정하시겠습니까?' : '글을 출간하시겠습니까?');

if (!yes) return;

// 여기서 임시 div 를 만들고
// innerHTML 로 contents(제어컴포넌트의 input 값)를 임시 div에 담기
// 담긴 HTML 에서 img 태그만 추출
const tempDiv = document.createElement('div');
tempDiv.innerHTML = contents;
const imgTags = tempDiv.getElementsByTagName('img');

// HTML collection 을 node list 화 하여 map
// base64ToFile 함수는 base64 를 blob으로 만들어줍니다
const filePromises = [...imgTags].map(async (imgTag, index) =&amp;gt; {
    const base64String = imgTag.src;
    const fileName = `image_${index}.jpg`; // 이미지 파일명 임시...
    return await base64ToFile(base64String, fileName);
});

// 모든 프로미스를 해결하여 파일 객체 배열을 반환합니다.
const files = await Promise.all(filePromises);
// 여기서 수파베이스 스토리지 업로드 합니다.
// updatedContenents 는 base64 src 자리를 publicUrl 로 대체한 새로운 글 본문 입니다.
const updatedContents = await uploadFilesAndReplaceImageSrc(files, contents);

// blog 가 트루면, 즉 업데이트면
if (blog) {
    const tempDiv = document.createElement('div');

    tempDiv.innerHTML = updatedContents;

    const imgTags = tempDiv.getElementsByTagName('img');
    const imgSrcToUpdate = imgTags &amp;amp;&amp;amp; imgTags.length &amp;gt; 0 ? imgTags[0].src : null;

    const temp = {
        newBlog: {
            id: blog.id,
            title: title,
            contents: updatedContents,
            created_at: new Date().toISOString(),
            user_id: user.email,
            nick_name: user.nickName
        },
        file: files.length &amp;gt; 0 &amp;amp;&amp;amp; files[0].size &amp;gt; 0 ? files[0] : imgSrcToUpdate
    };
    upBlogs(temp);
// 신규 이면
} else {
    const temp = {
        newBlog: {
            title: title,
            contents: updatedContents,
            created_at: new Date().toISOString(),
            user_id: user.email,
            nick_name: user.nickName
        },

        file: files[0].size &amp;gt; 0 ? files[0] : null
    };
    addBlogs(temp);
}
navigate('/');
</code></pre>
<p>};</code></pre></p>
