<h2 data-ke-size="size26">Biome 로 테일윈드 클래스 저장시 자동정렬하기</h2>
<h3 data-ke-size="size23">biome.jsonc</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>level을 error</li>
<li>fix를 safe</li>
</ul>
<pre class="prolog"><code>"nursery": {
    "useSortedClasses": {
        "level": "error",
        "fix": "safe",
        "options": {
            "attributes": [
                "classList"
            ],
            "functions": [
                "clsx",
                "cva",
                "cn"
            ]
        }
    }
}</code></pre>
<h3 data-ke-size="size23">.vscode/settings.json</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>editor.codeActionsOnSave에 아래 항목 추가</li>
</ul>
<pre class="1c"><code>"editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.fixAll.biome": "explicit",
    "source.organizeImports.biome": "explicit"
}</code></pre>