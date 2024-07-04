<h2 data-ke-size="size26">구현하고자 하는 기능</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>GitHub Actions를 이용.</li>
<li>Tistory의 RSS를 이용하여 최신 게시글을 자동으로 md 파일로 변환하여 깃허브 리포지토리에 수집하고자 함.</li>
<li>수동으로 수집할 수도 있고, 시간마다 자동 실행되게 할 수 있음.</li>
<li>원리는 GitHub에서 인식 가능한 소스코드를 작성해서 GitHub Actions가 코드를 읽고 실행하게 하는 것임. 내가 실행하는 것이 아님.</li>
<li>제목은 티스토리라고 한정지었지만 RSS를 이용하는 것이기 때문에 티스토리, 벨로그, 네이버 그 어떤 플랫폼의 서비스여도 RSS만 발급되면 주소만 바꿔주면 동작함.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>심지어 RSS를 공개하는 기상청 같은 공공기관이나 뉴스 사이트 등 모든 곳을 이런 방식으로 게시글을 박제(?), 아카이빙(?) 할 수도 있음.</li>
<li>이것을 응용해서 남의 블로그 RSS도 수집할 수 있는데 어차피 공개된 데이터지만 남의 글을 내 깃허브에 박제 하지는 말자.</li>
</ul>
</li>
</ul>
<h2 data-ke-size="size26">티스토리 RSS 설정</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>티스토리 설정 페이지에서 RSS를 공개로 전환.</li>
<li>여기서 설정하는 게시글 개수에 따라서 최신글 기준으로 n개를 최초 변환하여 저장함.</li>
<li>이후로는 게시글이 새로 등록되면 RSS에서 게시글을 밀어내면서 현재 수집된 파일 정보와 비교해서 없는 파일, 즉 최신 게시글을 수집함.</li>
<li>만약 RSS가 비공개면 검색 엔진에서 내 블로그가 노출되지 않음.</li>
<li>RSS란 검색 엔진에서 수집할 수 있는 게시글을 말함. 검색엔진은 RSS에서 게시글 정보를 가져감.</li>
<li>RSS 기본 세팅이 10개로 되어 있을 것인데, 이것은 검색엔진에 내 최신 게시글 10개를 노출시키겠다는 의미임.</li>
<li>50개가 최대이므로 50개로 세팅하면 더 많이 노출되니 SEO에도 도움이 됨. 네이버 기준으로 RSS 수집 개수가 최대 50개임.</li>
</ul>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2146" data-origin-height="836"><span data-url="https://blog.kakaocdn.net/dn/buhQmr/btsInvDQJvd/QnuY0rihLESbakMB55cILk/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/buhQmr/btsInvDQJvd/QnuY0rihLESbakMB55cILk/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbuhQmr%2FbtsInvDQJvd%2FQnuY0rihLESbakMB55cILk%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="2146" data-origin-height="836"/></span></figure>
</p>
<h2 data-ke-size="size26">자동 수집할 리포지토리 생성</h2>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2150" data-origin-height="1222"><span data-url="https://blog.kakaocdn.net/dn/bnimWZ/btsIoPVgiVt/moAkjsLsgTxci2jklxrkD0/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/bnimWZ/btsIoPVgiVt/moAkjsLsgTxci2jklxrkD0/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbnimWZ%2FbtsIoPVgiVt%2FmoAkjsLsgTxci2jklxrkD0%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="2150" data-origin-height="1222"/></span></figure>
</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>리포지토리를 만들고 에디터로 연결한다.</li>
<li>비공개 리포지토리로 생성해도 잘 작동한다.</li>
</ul>
<h2 data-ke-size="size26">기능 구현</h2>
<h3 data-ke-size="size23">최종 프로젝트 파일구조</h3>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="904" data-origin-height="678"><span data-url="https://blog.kakaocdn.net/dn/dDGwLe/btsIpjBJW2b/PTsgRqeZqz8L8Eh862tlW1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/dDGwLe/btsIpjBJW2b/PTsgRqeZqz8L8Eh862tlW1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdDGwLe%2FbtsIpjBJW2b%2FPTsgRqeZqz8L8Eh862tlW1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="904" data-origin-height="678"/></span></figure>
</p>
<p data-ke-size="size16">posts는 내가 만드는 것이 아님. 프로젝트를 다 만들고 나서 깃허브 액션이 자동으로 생성해주는 것임. 이 글을 끝까지 따라해보면 알게 됨.</p>
<h3 data-ke-size="size23">.gitignore 파일 작성 (옵션)</h3>
<pre id="code_1720121115838" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>.DS_Store
node_modules
dist</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>선택사항이나 vite 등으로 만드는 패키지가 아니므로 백지 상태에서 제작할 텐데, .gitignore 파일이 없으면 리포지토리가 망가짐.</li>
<li>참고로 이번 프로젝트에서는 node_modules는 없으나 그냥 습관처럼 써 놓은 것.</li>
</ul>
<h3 data-ke-size="size23">package.json 파일 작성</h3>
<pre id="code_1720121550635" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>{
  "name": "tistory-rss-to-md",
  "version": "1.0.0",
  "description": "Convert Tistory RSS feed to markdown files",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "axios": "^0.21.1",
    "markdown-it": "^12.0.6",
    "slugify": "^1.6.6",
    "xml2js": "^0.4.23"
  }
}</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>의존성을 패키지 매니저로 설치하라는 의미가 아님.</li>
<li>이 파일을 그냥 복붙하면 됨. 그러나 게시글 작성 시점과 라이브러리의 버전이 현저하게 차이나거나 해당 라이브러리에서 지원 중단한 경우 이 파일을 직접 수정하거나, 패키지 매니저로 라이브러리를 프로젝트에 설치해서 자동으로 package.json 의존성 부분에 추가시켜도 됨.</li>
<li>프로젝트에 굳이 설치할 필요가 없는 이유는, 코드 실행을 내가 하는 것이 아니라 GitHub Actions가 하는 것이기에 깃허브 액션이 이 파일을 읽어서 코드 실행할 때 라이브러리를 설치할 수 있도록 돕는 것임.</li>
<li>axios는 RSS를 fetch 할 때 사용함. 라이브러리를 설치하지 않고 해보려고 했는데 이유를 모르겠으나 406 거부가 됨.</li>
<li>markdown-it은 마크다운으로 변환할 때 사용함.</li>
<li>slugify는 티스토리에서 글 제목을 한글로 썼을 때 한글을 못 불러오고 깨지는데, 이를 잘 불러오도록 변환해주는 기능을 함.</li>
<li>xml2js: RSS를 보면 알겠지만 xml 형태로 되어 있는데 이것을 JSON으로 파싱하는 기능을 함.</li>
</ul>
<h3 data-ke-size="size23">.github/workflows/tistory_rss.yml 파일 작성</h3>
<pre id="code_1720120662862" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>name: Tistory RSS to Markdown
<p>on:
schedule:
- cron: '0 */6 * * *' # 6시간마다 한 번씩 자동으로 워크플로우 실행
workflow_dispatch: {} # 자동 시간 외 워크플로우 수동으로 트리거하는 기능 추가</p>
<p>jobs:
build:
runs-on: ubuntu-latest</p>
<pre><code>steps:
  - name: Checkout repository
    uses: actions/checkout@v4

  - name: Set up Node.js
    uses: actions/setup-node@v3
    with:
      node-version: '20' # 이 게시글 작성 시점과 노드 버전이 많이 차이나면 에러날 수 있음

  - name: Install dependencies
    run: npm install

  - name: Convert RSS to Markdown
    run: npm start

  - name: Commit and push changes
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    run: |
      git config --global user.name &quot;Captain-Kim&quot; # 자신의 깃허브 계정 이름
      git config --global user.email &quot;brighthero@kakao.com&quot; # 자신의 깃허브 계정 메일
      git add -A posts/ || echo &quot;No files to add&quot;
      git status
      git commit -m &quot;티스토리 블로그 포스트 업데이트&quot; || echo &quot;No changes to commit&quot;
      git push origin main || echo &quot;No changes to push&quot;&lt;/code&gt;&lt;/pre&gt;
</code></pre>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>위 경로에 위 파일을 그대로 붙여 넣는다.</li>
<li>파일 이름을 tistory_rss라고 했지만, 알아서 편하신대로 해도 됨.</li>
<li>name에 작성된 것이 actions에 등록될 이름임. 입맛에 맞게 변경 가능.</li>
<li>위 코드 예제에서는 6시간마다 자동으로 워크플로우를 실행하도록 cron 식이 설정 되어 있음.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>필요에 따라 cron 식을 변경한다. 샘플 몇 개 올려놓겠다. 그리고 이 모든 식을 중복해서 작성할 수도 있다.</li>
<li>30분마다:&nbsp;*/30&nbsp;*&nbsp;*&nbsp;*&nbsp;*</li>
<li>1시간마다:&nbsp;0&nbsp;*&nbsp;*&nbsp;*&nbsp;*</li>
<li>3시간마다:&nbsp;0&nbsp;*/3&nbsp;*&nbsp;*&nbsp;*</li>
<li>6시간마다: 0 */6 * * *</li>
<li>12시간마다:&nbsp;0&nbsp;*/12&nbsp;*&nbsp;*&nbsp;*</li>
<li>하루에&nbsp;한&nbsp;번:&nbsp;0&nbsp;0&nbsp;*&nbsp;*&nbsp;*</li>
</ul>
</li>
<li>노드 버전을 샘플에서는 20으로 설정했는데, 이것보다 아래로 설정하면 GitHub Actions에서 에러를 발생시킴.</li>
<li>게시글 작성 시점과 이 글을 보고 적용해보는 시점에서 저 버전 차이가 많이나면 GitHub에서 에러를 발생시킬 수 있으니 그 때는 수정하면 됨.</li>
<li>예제 코드에서 깃허브 토큰은 액션에서 자동으로 가져옴. 환경 변수를 따로 작성할 필요 없음.</li>
<li>user.name과 email은 아무 내용이나 써도 됨. 그러나 깃허브에 등록된 것으로 일치 시켜놔야 커밋로그가 생성될 때 잔디가 심어짐.</li>
<li>echo 명령어는 만약 RSS를 수집했는데 변경사항이 없어서 git 명령어 사용에 실패했을 때 워크플로우가 중지되는 것을 막기 위함임. 워크플로우가 중지되면 먹통이 됨.</li>
<li>커밋 메시지 한글로 작성해두었는데, 변경사항이 있어서 수집하고 나면 저 메시지대로 수정이 됨. 글 제목까지 동적으로 바꾸고 싶다면 자바스크립트 파일에서 수정해보시길.</li>
</ul>
<h3 data-ke-size="size23">index.js 파일 작성</h3>
<pre id="code_1720121890748" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>const axios = require('axios');
const xml2js = require('xml2js');
const md = require('markdown-it')({
  html: true,
});
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
<p>const RSS_URL = 'https://infistudy.tistory.com/rss';</p>
<p>(async () =&gt; {
try {
const response = await axios.get(RSS_URL, {
headers: {
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
'Accept': '<em>/</em>'
}
});</p>
<pre><code>const feed = await xml2js.parseStringPromise(response.data);
const items = feed.rss.channel[0].item;
console.log(`Fetched ${items.length} items from RSS feed.`);

if (!fs.existsSync('posts')) {
  fs.mkdirSync('posts');
  console.log('Created posts directory.');
} else {
  console.log('Posts directory already exists.');
}

items.forEach(item =&amp;gt; {
  const title = item.title[0];
  const content = item.description[0];
  console.log(`Processing item: ${title}`);

  const markdownContent = md.render(content);
  const fileName = path.join('posts', `${slugify(title, { remove: /[*+~.()'&quot;!:@]/g, lower: true })}.md`);
  fs.writeFileSync(fileName, markdownContent, 'utf8');
  console.log(`Created file: ${fileName}`);
});

console.log('RSS feed converted to markdown files.');
</code></pre>
<p>} catch (error) {
console.error('Failed to fetch and convert RSS feed:', error);
}
})();</code></pre></p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>위 코드 전부 필요함.</li>
<li>html : true를 빼면 한글 제목이 깨짐.</li>
<li>중간 중간에 있는 콘솔로그는 워크플로우가 실패했을 때 깃허브 액션이 로그를 남기도록 한 것임.</li>
<li>로직이 복잡하기 때문에 워크플로우가 에러로 작동하지 않으면 어느 부분까지 잘 되었는지 확인해서 안 되고 있는 곳을 디버깅 해야 함.</li>
<li>RSS_URL은 자신의 블로그 도메인/rss로 변경.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>그 전에 먼저 그 url을 브라우저에 입력해보고 xml이 잘 출력되는지 확인.</li>
<li>중간에 fs.mkdirSync('posts')라는 코드가 깃허브 리포지토리에 블로그 글을 모아 놓을 폴더 이름임. 입맛에 맞게 변경해도 됨.</li>
</ul>
</li>
</ul>
<h2 data-ke-size="size26">깃허브에 push</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>여기까지 완료되면 깃허브 리포지토리에 프로젝트를 push.</li>
</ul>
<pre id="code_1720122267787" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>git add . &amp;&amp; git commit -m "feat: add 티스토리 RSS 수집 bot 제작" &amp;&amp; git push</code></pre>
<h2 data-ke-size="size26">깃허브 액션 권한 풀기</h2>
<p data-ke-size="size16">방금 만든 리포지토리에서 settings - actions - general - workflow permissions - read and write permission - save</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2224" data-origin-height="1306"><span data-url="https://blog.kakaocdn.net/dn/bH7Yua/btsInlarYPn/kNrIWVXlCo040JbAVNxxK0/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/bH7Yua/btsInlarYPn/kNrIWVXlCo040JbAVNxxK0/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbH7Yua%2FbtsInlarYPn%2FkNrIWVXlCo040JbAVNxxK0%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="2224" data-origin-height="1306"/></span></figure>
<figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1646" data-origin-height="1044"><span data-url="https://blog.kakaocdn.net/dn/8CaOg/btsInDV3oYz/HnNvgYLE8lEgFk9kOGwqG0/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/8CaOg/btsInDV3oYz/HnNvgYLE8lEgFk9kOGwqG0/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F8CaOg%2FbtsInDV3oYz%2FHnNvgYLE8lEgFk9kOGwqG0%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1646" data-origin-height="1044"/></span></figure>
</p>
<h2 data-ke-size="size26">액션 트리거 해보기</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>repository - actions - 워크플로우 이름 - Run workflow</li>
<li>아까 수동 트리거 코드를 만들어줬기 때문에 이 버튼이 보이는 것이고, 안 했으면 그냥 시간 기다리는 수밖에 없음.</li>
</ul>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2338" data-origin-height="1058"><span data-url="https://blog.kakaocdn.net/dn/boBVPg/btsIotSBVPy/krgxPLMA61d8ykH145Kex1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/boBVPg/btsIotSBVPy/krgxPLMA61d8ykH145Kex1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FboBVPg%2FbtsIotSBVPy%2FkrgxPLMA61d8ykH145Kex1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="2338" data-origin-height="1058"/></span></figure>
</p>
<p data-ke-size="size16">수동 트리거 버튼 누르면 시간이 조금 걸림. 안 보인다고 광클하면 안 됨.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1632" data-origin-height="508"><span data-url="https://blog.kakaocdn.net/dn/cMtWtx/btsInix1tSv/h0cq4q6E1mjLIzqy9B2rH1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/cMtWtx/btsInix1tSv/h0cq4q6E1mjLIzqy9B2rH1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcMtWtx%2FbtsInix1tSv%2Fh0cq4q6E1mjLIzqy9B2rH1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1632" data-origin-height="508"/></span></figure>
</p>
<p data-ke-size="size16">잘 되면 아래처럼 체크 표시로 바뀜.</p>
<p data-ke-size="size16">그런데 코드 실행이 에러 없이 잘 됐다는 의미이고, 파일 생성이 안 됐을 수 있으니, 리포지토리로 가서 의도한 대로 posts 폴더가 생기고 파일이 잘 들어갔는지 내용물까지 확인해봐야 함.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1632" data-origin-height="508"><span data-url="https://blog.kakaocdn.net/dn/cYyyQk/btsInmmGiyc/o7N1Kn3BB2q8ScUWkEtWp1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/cYyyQk/btsInmmGiyc/o7N1Kn3BB2q8ScUWkEtWp1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcYyyQk%2FbtsInmmGiyc%2Fo7N1Kn3BB2q8ScUWkEtWp1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1632" data-origin-height="508"/></span></figure>
</p>
<h2 data-ke-size="size26">결과</h2>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="3458" data-origin-height="2122"><span data-url="https://blog.kakaocdn.net/dn/cyNCBK/btsIm4s21NY/H4OCy1kUU5Y2mn67LN4rw1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/cyNCBK/btsIm4s21NY/H4OCy1kUU5Y2mn67LN4rw1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcyNCBK%2FbtsIm4s21NY%2FH4OCy1kUU5Y2mn67LN4rw1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="3458" data-origin-height="2122"/></span></figure>
<figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="3434" data-origin-height="1966"><span data-url="https://blog.kakaocdn.net/dn/bg2B06/btsInxhqHz6/2mTUGI4oajeAHdhePVyKp1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/bg2B06/btsInxhqHz6/2mTUGI4oajeAHdhePVyKp1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbg2B06%2FbtsInxhqHz6%2F2mTUGI4oajeAHdhePVyKp1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="3434" data-origin-height="1966"/></span></figure>
</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>티스토리 기본 글쓰기 에디터로 글을 써도 변환이 잘 됨.</li>
<li>원래는 안 되는데 본인이 라이브러리를 끌어 써서 잘 되는 것임.</li>
<li>단순 이미지는 물론이고 gif도 잘 불러와짐.</li>
</ul>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2922" data-origin-height="912"><span data-url="https://blog.kakaocdn.net/dn/DONyF/btsIm38IAzX/WbArsvjTQBY9fo3JLve9n0/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/DONyF/btsIm38IAzX/WbArsvjTQBY9fo3JLve9n0/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FDONyF%2FbtsIm38IAzX%2FWbArsvjTQBY9fo3JLve9n0%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="2922" data-origin-height="912"/></span></figure>
</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>커밋도 잘 올라감. 이제부터는 자동으로 돌아가기 때문에 프로젝트 파일은 지워도 되지만, 프로젝트 파일을 갖고 있을 것이면 커밋이 새로 올라갔기에 pull을 자주 해주면 됨. 그러면 마크다운 파일이 후두둑 생김.</li>
<li>참고로 RSS에 올라 간 게시글이 수정되었을 때에도 변경사항이 있다고 보고 이미 수집된 게시글을 수정시킴.</li>
</ul>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="952" data-origin-height="1120"><span data-url="https://blog.kakaocdn.net/dn/b80NHE/btsIor8pgnI/PMMEx7WK9COerOpua29r0K/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/b80NHE/btsIor8pgnI/PMMEx7WK9COerOpua29r0K/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fb80NHE%2FbtsIor8pgnI%2FPMMEx7WK9COerOpua29r0K%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="952" data-origin-height="1120"/></span></figure>
</p>
<h2 data-ke-size="size26">한계</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>마크다운으로 지원이 안 되는 태그는 파싱 안 됨. 아래 사진은 본인이 기타치면서 노래 불렀던 영상인데, iframe 태그는 마크다운으로 파싱이 안 됨.</li>
<li>그리고 코드블럭이 많이 들어가면 게시글이 깨질 수도 있음. 이것은 GPT나 슬랙, 디스코드 등에서도 자주 발생하는 문제인데 해결 방법이 없는 것 같음.</li>
</ul>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2708" data-origin-height="1096"><span data-url="https://blog.kakaocdn.net/dn/y4TYs/btsIoQNn2U8/nyPo3kbkVAKjL1DKr4k1U0/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/y4TYs/btsIoQNn2U8/nyPo3kbkVAKjL1DKr4k1U0/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fy4TYs%2FbtsIoQNn2U8%2FnyPo3kbkVAKjL1DKr4k1U0%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="2708" data-origin-height="1096"/></span></figure>
</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>RSS로 작성된 것만 XML을 마크다운으로 파싱하는 코드인지라 최대 50개 최신글 이외의 기존 글들은 못 불러옴.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>위 코드 예제는 Tistory에서 제공하는 RSS에 API 요청을 통해서 자동으로 하는 방식이라 그렇고, 로직은 XML을 md 파일로 파싱하는 로직이라 눈치 빠르신 분들이면 이전 게시글을 파싱하는 방법으로도 응용하실 수 있으실 듯. 티스토리 관리자 메뉴에서 게시글을 xml로 전체 글을 백업할 수 있음.</li>
</ul>
</li>
<li>이미 마크다운으로 파싱되고 나면 게시글을 삭제해서 RSS에서 삭제되더라도 리포지토리에서 삭제되지 않음.</li>
</ul>
<h2 data-ke-size="size26">추가로 구현해볼 수 있는 것들</h2>
<p data-ke-size="size16">로직을 자바스크립트로 작성했기 때문에 아래 사항을 추가 구현하는 데 어려움이 없을 것임.</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>추가한 게시글을 커밋로그 제목으로 동적으로 남기기</li>
<li>추가한 게시글들의 리스트를 readme에 자동으로 리스트 생성하기</li>
</ul>
<h2 data-ke-size="size26">수정사항</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>위 코드대로 index.js 파일을 작성하면 posts 폴더에 글을 마구잡이로 저장해서 카테고리 별로 저장하도록 수정함.</li>
<li>다른 파일은 그대로 두고 index.js만 아래처럼 수정하면 됨.</li>
</ul>
<pre id="code_1720124209975" class="typescript" data-ke-language="typescript" data-ke-type="codeblock"><code>// index.js
<p>const axios = require('axios');
const xml2js = require('xml2js');
const md = require('markdown-it')({
html: true,
});
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');</p>
<p>const RSS_URL = 'https://infistudy.tistory.com/rss';</p>
<p>(async () =&gt; {
try {
const response = await axios.get(RSS_URL, {
headers: {
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
'Accept': '<em>/</em>'
}
});</p>
<pre><code>const feed = await xml2js.parseStringPromise(response.data);
const items = feed.rss.channel[0].item;
console.log(`Fetched ${items.length} items from RSS feed.`);

if (!fs.existsSync('posts')) {
  fs.mkdirSync('posts');
  console.log('Created posts directory.');
} else {
  console.log('Posts directory already exists.');
}

items.forEach(item =&amp;gt; {
  const title = item.title[0];
  const content = item.description[0];
  const category = item.category ? item.category[0] : 'uncategorized';
  const categorySlug = slugify(category, { remove: /[*+~.()'&quot;!:@]/g, lower: true });
  const categoryPath = path.join('posts', categorySlug);

  if (!fs.existsSync(categoryPath)) {
    fs.mkdirSync(categoryPath, { recursive: true });
    console.log(`Created category directory: ${categoryPath}`);
  }

  console.log(`Processing item: ${title}`);
  const markdownContent = md.render(content);
  const fileName = path.join(categoryPath, `${slugify(title, { remove: /[*+~.()'&quot;!:@]/g, lower: true })}.md`);
  fs.writeFileSync(fileName, markdownContent, 'utf8');
  console.log(`Created file: ${fileName}`);
});

console.log('RSS feed converted to markdown files.');
</code></pre>
<p>} catch (error) {
console.error('Failed to fetch and convert RSS feed:', error);
}
})();</code></pre></p>
<h2 data-ke-size="size26">리포지토리 링크</h2>
<p data-ke-size="size16">리포지토리를 참고해보고 싶으면 위 프로젝트에서 사용한 리포지토리를 참고바람.</p>
<p data-ke-size="size16"><a href="https://github.com/Captain-Kim/my_Tistory_blog_posts" target="_blank" rel="noopener&nbsp;noreferrer">https://github.com/Captain-Kim/my_Tistory_blog_posts</a></p>
<figure id="og_1720124349706" contenteditable="false" data-ke-type="opengraph" data-ke-align="alignCenter" data-og-type="object" data-og-title="GitHub - Captain-Kim/my_Tistory_blog_posts: 티스토리 블로그 자동 수집" data-og-description="티스토리 블로그 자동 수집. Contribute to Captain-Kim/my_Tistory_blog_posts development by creating an account on GitHub." data-og-host="github.com" data-og-source-url="https://github.com/Captain-Kim/my_Tistory_blog_posts" data-og-url="https://github.com/Captain-Kim/my_Tistory_blog_posts" data-og-image="https://scrap.kakaocdn.net/dn/FNsei/hyWvKMzCle/BhTWjBrOd90BEr8uZAWEek/img.png?width=1200&amp;height=600&amp;face=0_0_1200_600"><a href="https://github.com/Captain-Kim/my_Tistory_blog_posts" target="_blank" rel="noopener" data-source-url="https://github.com/Captain-Kim/my_Tistory_blog_posts">
<div class="og-image" style="background-image: url('https://scrap.kakaocdn.net/dn/FNsei/hyWvKMzCle/BhTWjBrOd90BEr8uZAWEek/img.png?width=1200&amp;height=600&amp;face=0_0_1200_600');">&nbsp;</div>
<div class="og-text">
<p class="og-title" data-ke-size="size16">GitHub - Captain-Kim/my_Tistory_blog_posts: 티스토리 블로그 자동 수집</p>
<p class="og-desc" data-ke-size="size16">티스토리 블로그 자동 수집. Contribute to Captain-Kim/my_Tistory_blog_posts development by creating an account on GitHub.</p>
<p class="og-host" data-ke-size="size16">github.com</p>
</div>
</a></figure>
<p data-ke-size="size16">&nbsp;</p>