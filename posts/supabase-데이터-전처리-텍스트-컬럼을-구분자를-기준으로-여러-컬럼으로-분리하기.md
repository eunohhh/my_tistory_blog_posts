<h2 data-ke-size="size26">주의</h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>prostgresSQL에 익숙하지 않은 경우 export CSV로 데이터 테이블을 필수로 백업을 하시고 진행하시기를 바람.</li>
<li>아래 사진을 보시고 글쓴이의 날짜 데이터 형식과 다르다면 본인 글에 있는 SQL 쿼리를 그대로 쓰지 마시기 바람.
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>오전/오후로 구분하고 시간은 각각 00~12로 나가는 방식임.</li>
<li>구분자로 마침표 (.)가 있음.</li>
<li>중간에 공백이 많이 들어 가 있음.</li>
</ul>
</li>
</ul>
<h2 data-ke-size="size26">상황</h2>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="796" data-origin-height="498"><span data-url="https://blog.kakaocdn.net/dn/9iXxZ/btsIe1CAHkb/aRc59c0qHaxKVLKC8o2c20/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/9iXxZ/btsIe1CAHkb/aRc59c0qHaxKVLKC8o2c20/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F9iXxZ%2FbtsIe1CAHkb%2FaRc59c0qHaxKVLKC8o2c20%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="796" data-origin-height="498"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">구글 스프레드시트에서 제공하는 서식을 사용하다 보니 데이터를 가공하기 어려운 형태로 되어 있어 날짜와 시간을 date 컬럼에 하나, time 컬럼에 분리하고자 한다.</p>
<h2 data-ke-size="size26">개선</h2>
<p data-ke-size="size16">SQL 쿼리를 어디서 입력해야 하는지 모르겠다면 본인이 작성한 supabase 전처리 포스트 중 첫번째 포스트를 보면 사진과 함께 자세히 남겨두었다.</p>
<pre id="code_1719510538705" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>SELECT
    trim(split_part(날짜, ' ', 1)) AS year,
    trim(split_part(날짜, ' ', 2)) AS month,
    trim(split_part(날짜, ' ', 3)) AS day,
    trim(split_part(날짜, ' ', 4)) AS period,
    trim(split_part(날짜, ' ', 5)) AS time_part
FROM bankstatement;</code></pre>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="2052" data-origin-height="2038"><span data-url="https://blog.kakaocdn.net/dn/cQV3TO/btsIgmZPS3S/Krdt4LL7lJa41GFIDZ0RW0/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/cQV3TO/btsIgmZPS3S/Krdt4LL7lJa41GFIDZ0RW0/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcQV3TO%2FbtsIgmZPS3S%2FKrdt4LL7lJa41GFIDZ0RW0%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="2052" data-origin-height="2038"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">trim으로 공백을 제거하고 발라냈더니 마침표가 포함되어 있어서 데이터 형식이 맞지 않아 에러가 났던 것이다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">마침표를 제거하면 잘 되는지도 아래 명령어로 미리 확인해볼 수 있다.</p>
<pre id="code_1719510773962" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>SELECT
    replace(trim(split_part(날짜, ' ', 1)), '.', '') AS year,
    replace(trim(split_part(날짜, ' ', 2)), '.', '') AS month,
    replace(trim(split_part(날짜, ' ', 3)), '.', '') AS day,
    trim(split_part(날짜, ' ', 4)) AS period,
    replace(trim(split_part(날짜, ' ', 5)), '.', '') AS time_part
FROM bankstatement;</code></pre>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">왜 자꾸 안 되지 싶어서 직접 검증을 해봤더니 이런 미꾸라지 같은 녀석 때문이었다.</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="1984" data-origin-height="1270"><span data-url="https://blog.kakaocdn.net/dn/nihTl/btsId4UqJWf/ROk73WAPwiTI0Olg4I3zz1/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/nihTl/btsId4UqJWf/ROk73WAPwiTI0Olg4I3zz1/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FnihTl%2FbtsId4UqJWf%2FROk73WAPwiTI0Olg4I3zz1%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="1984" data-origin-height="1270"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">본인은 이 컬럼에 null이 있으면 안 되는 컬럼이라 원본 데이터 테이블에 가서 다시 알맞게 수정해주면 해결이 되겠다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p><figure class="imageblock alignCenter" data-ke-mobileStyle="widthOrigin" data-origin-width="816" data-origin-height="692"><span data-url="https://blog.kakaocdn.net/dn/Ja7Gv/btsIeAZzbx4/VcvVdtJ3veTdUVLbvR5j8k/img.png" data-phocus="phocus"><img src="https://blog.kakaocdn.net/dn/Ja7Gv/btsIeAZzbx4/VcvVdtJ3veTdUVLbvR5j8k/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FJa7Gv%2FbtsIeAZzbx4%2FVcvVdtJ3veTdUVLbvR5j8k%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" data-origin-width="816" data-origin-height="692"/></span></figure>
</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">또 안 된다</p>
<p data-ke-size="size16">본인의 시간은 오전/오후으로 구분하고 각각 00~12으로 입력되고 있는데 이를 24시간으로 변환하는 로직으로,</p>
<p data-ke-size="size16">오전은 그대로 두고, 오후일 경우 +12시간을 해서 24시간 형태로 만드는 로직이었는데 정오(오후 12시)가 문제가 되었다.</p>
<p data-ke-size="size16">오후 12:01분에 +12시간을 하면 24:01분이라는 존재할 수 없는 시간이 되기 때문이다.</p>
<p data-ke-size="size16">따라서 오후 12시는 그대로 두고 나머지만 처리하는 로직이 필요하다.</p>
<h2 data-ke-size="size26">최종</h2>
<h3 data-ke-size="size23">최종 명령어</h3>
<pre id="code_1719512700408" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>UPDATE bankstatement
SET 
    datetime = to_timestamp(
        replace(trim(split_part(날짜, ' ', 1)), '.', '') || '-' || 
        lpad(replace(trim(split_part(날짜, ' ', 2)), '.', ''), 2, '0') || '-' || 
        lpad(replace(trim(split_part(날짜, ' ', 3)), '.', ''), 2, '0') || ' ' || 
        CASE 
            WHEN trim(split_part(날짜, ' ', 4)) = '오전' AND substring(trim(split_part(날짜, ' ', 5)), 1, 2) = '12' THEN '00' || substr(trim(split_part(날짜, ' ', 5)), 3)
            WHEN trim(split_part(날짜, ' ', 4)) = '오전' THEN trim(split_part(날짜, ' ', 5))
            WHEN trim(split_part(날짜, ' ', 4)) = '오후' AND substring(trim(split_part(날짜, ' ', 5)), 1, 2) = '12' THEN trim(split_part(날짜, ' ', 5))
            WHEN trim(split_part(날짜, ' ', 4)) = '오후' THEN lpad(((substring(trim(split_part(날짜, ' ', 5)), 1, 2)::int + 12) % 24)::text, 2, '0') || substr(trim(split_part(날짜, ' ', 5)), 3)
        END,
        'YYYY-MM-DD HH24:MI'
    );</code></pre>