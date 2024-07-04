<h2 data-ke-size="size26">주의</h2>
<p data-ke-size="size16">혹시 모르니 데이터 백업은 꼭 하고 진행할 것.</p>
<p data-ke-size="size16">전체 데이터 선택 후 export CSV를 해서 파일로 남겨두면 추후에 다시 import 할 수 있음.</p>
<h2 data-ke-size="size26">상황</h2>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2104" data-origin-height="876"><span data-url="https://blog.kakaocdn.net/dn/cadhob/btsIfyUf5nk/kd9s7F4xhI0nGT27MioQr1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/cadhob/btsIfyUf5nk/kd9s7F4xhI0nGT27MioQr1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fcadhob%2FbtsIfyUf5nk%2Fkd9s7F4xhI0nGT27MioQr1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="2104" data-origin-height="876"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>사진과 같이 지출내용1~3이라는 컬럼에 각 내용을 하나씩 관리하고 있었다.</li>
<li>이 내용은 단순한 스프레드시트로 관리하고 있던 것이라 한 셀에 json 형식으로 관리하고 있지 않았다.</li>
<li>이렇게 되면 지출내용을 사용자가 여러 개 입력하면 입력한 만큼 컬럼을 미리 만들어줘야 하고, 입력값이 없는 경우에는 null이 너무 많이 생긴다.</li>
</ul>
<h2 data-ke-size="size26">개선</h2>
<p data-ke-size="size16">supabase와 같은 SQL은 json 보다 jsonb 형식을 더 권장한다고 경고창이 나온다. 아래와 같은 형식으로 입력 가능하다.</p>
<pre id="code_1719507749849" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>{
  "details": [
    "&lt;나몽이&gt; 중성화 수술 책임비 입금",
    "2번 내용",
    "3번 내용",
  ]
}</code></pre>
<p data-ke-size="size16">이렇게 되면 사용자가 몇 개를 입력했든 데이터 테이블을 좀 더 자유롭게 배열 형태로 사용할 수 있다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">그런데 본인은 이런 데이터의 레코드가 575개이다. 수작업으론 불가능에 가깝다.</p>
<p data-ke-size="size16">다행이도 supabase는 SQL 쿼리를 지원하기 때문에 아래와 같은 명령어로 한꺼번에 개선해보겠다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">supabase web에서 수동으로 입력해도 되는 경우, jsonb는 큰 따옴표만 됨.</p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">사이드 바 - SQL Editor 클릭</h3>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="702" data-origin-height="924"><span data-url="https://blog.kakaocdn.net/dn/dd2Rsn/btsIfIPPBHb/dka6y3fUSIDyRZ4Wii7Vz1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/dd2Rsn/btsIfIPPBHb/dka6y3fUSIDyRZ4Wii7Vz1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fdd2Rsn%2FbtsIfIPPBHb%2Fdka6y3fUSIDyRZ4Wii7Vz1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="702" data-origin-height="924"/></span></figure>
</p>
<h3 data-ke-size="size23">New Query 클릭</h3>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="762" data-origin-height="528"><span data-url="https://blog.kakaocdn.net/dn/uVuum/btsIgoi26Y0/8Od3DKJI0dcr8KqLJofeQ1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/uVuum/btsIgoi26Y0/8Od3DKJI0dcr8KqLJofeQ1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FuVuum%2FbtsIgoi26Y0%2F8Od3DKJI0dcr8KqLJofeQ1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="762" data-origin-height="528"/></span></figure>
</p>
<h3 data-ke-size="size23">Query 정보 변경</h3>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1072" data-origin-height="1028"><span data-url="https://blog.kakaocdn.net/dn/dmZjcf/btsIfIWDiZc/gUGaFmoW0dd1mZphPRNjt0/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/dmZjcf/btsIfIWDiZc/gUGaFmoW0dd1mZphPRNjt0/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdmZjcf%2FbtsIfIWDiZc%2FgUGaFmoW0dd1mZphPRNjt0%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1072" data-origin-height="1028"/></span></figure>
</p>
<p data-ke-size="size16">혹시라도 쿼리가 잘못 되었을 때 쿼리만 삭제하면 복구되지 않는다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">지금은 해당사항 없지만 복구하는 명령어를 다시 입력해야 할 수 있으니,&nbsp; 습관적으로 쿼리명과 설명을 자세히 기록하는 습관을 들이도록 한다.</p>
<h3 data-ke-size="size23">병합명령어 입력</h3>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2014" data-origin-height="1426"><span data-url="https://blog.kakaocdn.net/dn/cWye7u/btsIfjbYiT0/ZmJxeudRuaJklJoiFaWYB1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/cWye7u/btsIfjbYiT0/ZmJxeudRuaJklJoiFaWYB1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcWye7u%2FbtsIfjbYiT0%2FZmJxeudRuaJklJoiFaWYB1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="2014" data-origin-height="1426"/></span></figure>
</p>
<pre id="code_1719508292197" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>UPDATE bankstatement
SET details = jsonb_build_object(
    '지출내용1', 지출내용1,
    '지출내용2', 지출내용2,
    '지출내용3', 지출내용3
);</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>bankstatement</b> : 진행할 데이터 테이블 이름으로 바꾼다.</li>
<li>SET <b>details</b> : 새로 만들 컬럼명을 지정한다.</li>
<li><b>'지출내용1', 지출내용1,</b> : 어떤 컬럼의 내용을 넣을 것인지 입력한다. 따옴표 안에 있는 지출내역은 미리 만들어 놓을 컬럼 개수이다. 본인은 default로 최대 개수를 3개까지는 사용하고 있기 때문에 3개까지는 만들어 두겠다. 필요에 따라 1개만 만들어 두고 코드 작성 시에 새로 만들어서 밀어 넣어도 될 것 같다.</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">다시 데이터 테이블로 가서 보면 마법과 같은 일이 벌어져있을 것이다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1860" data-origin-height="1714"><span data-url="https://blog.kakaocdn.net/dn/b1VEZz/btsIe1o41vf/APjJMcVADtikJy3URb6lKk/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/b1VEZz/btsIe1o41vf/APjJMcVADtikJy3URb6lKk/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fb1VEZz%2FbtsIe1o41vf%2FAPjJMcVADtikJy3URb6lKk%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1860" data-origin-height="1714"/></span></figure>
</p>
<h3 data-ke-size="size23">기존 컬럼 삭제하기</h3>
<p data-ke-size="size16">이제 지출내용1~3은 필요 없으니 수동으로 supabase에서 삭제해줘도 되고, 개수가 많다면 SQL 쿼리로 한 번에 작업해도 된다.</p>
<pre id="code_1719508592599" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>ALTER TABLE bankstatement
DROP COLUMN 지출내용1,
DROP COLUMN 지출내용2,
DROP COLUMN 지출내용3;</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">개인적으로는 쿼리로 작업하는 것이 좋을 것 같다.</p>
<p data-ke-size="size16">왜냐면 쿼리 명령어의 기록이 남기 때문에 추후 문제가 생기면 어느 과정에서 문제가 생겼는지 추적하기가 쉬울 것으로 생각된다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2026" data-origin-height="1450"><span data-url="https://blog.kakaocdn.net/dn/dBsRFn/btsId65KCpr/3VE5sKrEwjQYMzdxc0wbw1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/dBsRFn/btsId65KCpr/3VE5sKrEwjQYMzdxc0wbw1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdBsRFn%2FbtsId65KCpr%2F3VE5sKrEwjQYMzdxc0wbw1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="2026" data-origin-height="1450"/></span></figure>
</p>
<h2 data-ke-size="size26">복구하기</h2>
<h3 data-ke-size="size23">삭제한 컬럼 다시 만들기</h3>
<pre id="code_1719508869016" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>ALTER TABLE statement
ADD COLUMN 지출내용1 text,
ADD COLUMN 지출내용2 text,
ADD COLUMN 지출내용3 text;</code></pre>
<h3 data-ke-size="size23">jsonb 데이터 다시 컬럼으로 분리하기</h3>
<pre id="code_1719508908584" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>UPDATE statement
SET
    지출내용1 = details-&gt;&gt;'지출내용1',
    지출내용2 = details-&gt;&gt;'지출내용2',
    지출내용3 = details-&gt;&gt;'지출내용3';</code></pre>