<p data-ke-size="size16">Supabase를 사용하여 데이터를 가져온 후, 변경된 값을 업데이트할 수 있습니다. 그러나 데이터 객체를 직접 수정하기보다는 새로운 객체를 만들어서 업데이트하는 것이 더 안전합니다. 다음은 그 예제입니다:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>데이터를 가져와 필요한 필드를 업데이트합니다.</li>
<li>업데이트된 데이터를 Supabase를 통해 <code>upsert</code>로 저장합니다.</li>
</ol>
<p data-ke-size="size16">아래는 코드 예제입니다:</p>
<pre class="cs"><code>import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Tables } from '@/types/supabase.ts'
import useAuth from "@/context/auth.context.ts"
<p>const supabase = createClient('your-supabase-url', 'your-supabase-anon-key');</p>
<p>type User = Tables&lt;&quot;users&quot;&gt;;</p>
<p>function UserProfile() {
const { me } = useAuth();
const [profileImg, setProfileImg] = useState&lt;string&gt;('/default-image.png')
const [nickname, setNickname] = useState&lt;string | null&gt;(null);
const [avatarFile, setAvatarFile] = useState&lt;File | null&gt;(null);
const [introduction, setIntroduction] = useState&lt;string | null&gt;(null);
const dataRef = useRef&lt;User | null&gt;(null);</p>
<pre><code>const handleSubmit = async () =&amp;gt; {
    const updatedFields: Record&amp;lt;string, any&amp;gt; = {};

    if (avatarFile !== null) {
        const fileName = `avatars_${me.id}.jpg`;
        const { error } = await supabase
            .storage
            .from('profile')
            .upload(fileName, avatarFile, {
                cacheControl: '3600',
                upsert: true
            });

        // 실제로는 아래처럼 그냥 리턴시키시보다는 뭔가 로직이 필요할 것 같습니다. 
        if(error) return;

        const { data } = supabase
            .storage
            .from('profile')
            .getPublicUrl(fileName);

        updatedFields.avatarFile =  data.publicUrl;
        // optimstic update ?
        setProfileImage(data.publicUrl);
    }

    if (nickname !== null) updatedFields.nickname = nickname;
    if (introduction !== null) updatedFields.introduction = introduction;

    const updatedData = {
      ...dataRef.current,
      ...updatedFields,
    };

    const { data, error: updateError } = await supabase
      .from('users')
      .upsert(updatedData)
      .select();

    if (updateError) {
      console.error(updateError);
      return;
    }

    setProfileImg(data.avatar);
    setNickname(data.nickname);
    setIntroduction(data.introduction);

    console.log('User updated:', data);
};

useEffect(() =&amp;gt; {
   const fetchUserData = async () =&amp;gt; {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', me.id)
          .single();

        if (error) {
          console.error(error);
          return;
        }

        dataRef.current = data;

        setProfileImg(data.avatar);
        setNickname(data.nickname);
        setIntroduction(data.introduction);
    };
    fetchUserData();
}, []);

return (
    &amp;lt;div&amp;gt;
        &amp;lt;img src={profileImg} alt=&quot;profile-image&quot; /&amp;gt;
        &amp;lt;input
            type=&quot;text&quot;
            value={nickname ?? ''}
            onChange={(e) =&amp;gt; setNickname(e.target.value)}
            placeholder=&quot;Nickname&quot;
        /&amp;gt;
        &amp;lt;input type=&quot;file&quot; onChange={(e) =&amp;gt; setAvatarFile(e.target.files?.[0] ?? null)} /&amp;gt;
        &amp;lt;textarea
            value={introduction ?? ''}
            onChange={(e) =&amp;gt; setIntroduction(e.target.value)}
            placeholder=&quot;Introduction&quot;
        /&amp;gt;
        &amp;lt;button onClick={handleSubmit}&amp;gt;Submit&amp;lt;/button&amp;gt;
    &amp;lt;/div&amp;gt;
  );
</code></pre>
<p>}</p>
<p>export default UserProfile;</code></pre></p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>데이터 가져오기</b>: <code>fetchUserData</code> 함수는 현재 유저 데이터를 가져와서 로컬 상태를 설정합니다.</li>
<li><b>상태 업데이트</b>: 각 입력 필드가 변경될 때마다 로컬 상태를 업데이트합니다.</li>
<li><b>업데이트할 필드 준비</b>: <code>handleSubmit</code> 함수는 변경된 필드만 모아서 <code>updatedFields</code> 객체를 만듭니다.</li>
<li><b>기존 데이터와 병합</b>: 기존 데이터를 가져와 <code>updatedFields</code>와 병합합니다.</li>
<li><b>데이터 업데이트</b>: <code>upsert</code>를 사용하여 업데이트된 데이터를 Supabase에 저장합니다.</li>
</ol>
<p data-ke-size="size16">이 방식으로 기존 데이터와 변경된 데이터를 안전하게 병합하고, 필요한 필드만 업데이트할 수 있습니다.</p>