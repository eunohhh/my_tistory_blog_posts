<p data-ke-size="size16">Docker Desktop에서 <code>&lt;none&gt;</code> 이미지가 "in use" 상태로 표시되어 삭제되지 않는 문제</p>
<h2 data-ke-size="size26">1. 숨겨진 컨테이너 확인 및 정리</h2>
<p data-ke-size="size16">터미널에서 다음 명령어로 모든 컨테이너(중지된 것 포함)를 확인해보세요:</p>
<pre class="properties"><code># 모든 컨테이너 확인 (중지된 것 포함)
docker ps -a
<h1>중지된 모든 컨테이너 삭제</h1>
<p>docker container prune -f</code></pre></p>
<h2 data-ke-size="size26">2. Dangling 이미지 정리</h2>
<p data-ke-size="size16">태그가 없는 이미지들을 정리합니다:</p>
<pre class="vala"><code># dangling 이미지 확인
docker images -f "dangling=true"
<h1>dangling 이미지 삭제</h1>
<p>docker image prune -f</code></pre></p>
<h2 data-ke-size="size26">3. 네트워크 및 볼륨 정리</h2>
<p data-ke-size="size16">이미지가 네트워크나 볼륨에 연결되어 있을 수 있습니다:</p>
<pre class="routeros"><code># 사용하지 않는 네트워크 정리
docker network prune -f
<h1>사용하지 않는 볼륨 정리</h1>
<p>docker volume prune -f</code></pre></p>
<h2 data-ke-size="size26">4. 빌드 캐시 정리</h2>
<p data-ke-size="size16">Docker 빌드 캐시가 이미지를 참조하고 있을 수 있습니다:</p>
<pre class="mipsasm"><code># 빌드 캐시 정리
docker builder prune -f</code></pre>
<h2 data-ke-size="size26">5. 전체 시스템 정리 (강력한 방법)</h2>
<p data-ke-size="size16">위 방법들이 효과가 없다면, 전체적으로 정리합니다:</p>
<pre class="routeros"><code># 사용하지 않는 모든 리소스 정리
docker system prune -a -f
<h1>또는 더 강력하게 (볼륨 포함)</h1>
<p>docker system prune -a --volumes -f</code></pre></p>
<h2 data-ke-size="size26">6. Docker Desktop 재시작</h2>
<p data-ke-size="size16">여전히 문제가 해결되지 않으면:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>Docker Desktop을 완전히 종료</li>
<li>잠시 기다린 후 다시 시작</li>
<li>이미지 목록 새로고침</li>
</ol>
<h2 data-ke-size="size26">7. 특정 이미지 강제 삭제</h2>
<p data-ke-size="size16">이미지 ID를 알고 있다면 강제로 삭제할 수 있습니다:</p>
<pre class="properties"><code># 이미지 ID 확인
docker images
<h1>강제 삭제 (IMAGE_ID를 실제 ID로 교체)</h1>
<p>docker rmi -f &lt;IMAGE_ID&gt;</code></pre></p>
<p data-ke-size="size16">대부분의 경우 1-4번 단계를 순서대로 실행하면 문제가 해결됩니다. 특히 <code>docker container prune -f</code>와 <code>docker image prune -f</code> 명령어가 가장 효과적입니다.</p>