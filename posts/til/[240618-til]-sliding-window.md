<p data-ke-size="size16">슬라이딩 윈도우(Sliding Window)는 알고리즘 문제 풀이에서 자주 사용되는 기법으로, 고정된 크기의 윈도우(부분 배열)를 사용하여 배열이나 문자열을 순회하면서 부분 배열의 합이나 최대값, 최소값 등을 효율적으로 계산할 때 사용됩니다.</p>
<p data-ke-size="size16">슬라이딩 윈도우 기법의 기본 아이디어는 다음과 같습니다:</p>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>윈도우의 크기를 설정합니다.</li>
<li>처음 윈도우의 값들을 계산합니다.</li>
<li>이후로는 윈도우를 한 칸씩 오른쪽으로 이동하면서 새로운 값을 추가하고, 이전 값을 제거하여 계산을 갱신합니다.</li>
</ol>
<p data-ke-size="size16">예를 들어, 배열에서 고정된 크기 <code>k</code>의 부분 배열의 합을 구하는 문제를 슬라이딩 윈도우 기법으로 해결해 보겠습니다.</p>
<h3 data-ke-size="size23">예제 문제: 길이가 <code>k</code>인 부분 배열의 최대 합을 구하기</h3>
<p data-ke-size="size16">주어진 배열에서 길이가 <code>k</code>인 모든 부분 배열의 합을 계산하여 그 중 최대 합을 반환하는 함수를 구현해 보겠습니다.</p>
<h3 data-ke-size="size23">자바스크립트 코드 예제</h3>
<pre class="javascript"><code>function maxSumSubarray(arr, k) {
    if (arr.length &lt; k) {
        return null; // 배열의 길이가 k보다 작으면 null 반환
    }
<pre><code>let maxSum = 0;
let windowSum = 0;

// 처음 윈도우의 합 계산
for (let i = 0; i &amp;lt; k; i++) {
    windowSum += arr[i];
}

maxSum = windowSum;

// 슬라이딩 윈도우: 한 칸씩 오른쪽으로 이동하면서 합을 계산
for (let i = k; i &amp;lt; arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
}

return maxSum;
</code></pre>
<p>}</p>
<p>// 예제 테스트
const arr = [1, 3, 2, 5, 1, 1, 2, 3, 4];
const k = 3;
console.log(maxSumSubarray(arr, k)); // 출력: 9 (부분 배열 [2, 3, 4]의 합)</code></pre></p>
<h3 data-ke-size="size23">설명</h3>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li><b>초기 윈도우 합 계산</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>처음 <code>k</code>개의 요소의 합을 계산하여 <code>windowSum</code>에 저장합니다.</li>
<li><code>maxSum</code>을 <code>windowSum</code>으로 초기화합니다.</li>
</ul>
</li>
<li><b>슬라이딩 윈도우 적용</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>윈도우를 한 칸씩 오른쪽으로 이동하면서 새로운 요소를 추가하고 이전 요소를 제거하여 <code>windowSum</code>을 갱신합니다.</li>
<li>매번 <code>maxSum</code>을 갱신하여 최대 합을 유지합니다.</li>
</ul>
</li>
</ol>
<p data-ke-size="size16">이 예제에서는 슬라이딩 윈도우 기법을 사용하여 길이 <code>k</code>인 부분 배열의 최대 합을 효율적으로 구할 수 있습니다. 초기 윈도우 합 계산은 O(k) 시간이 소요되며, 이후 각 요소에 대해 한 번씩만 계산하므로 전체 시간 복잡도는 O(n)입니다.</p>