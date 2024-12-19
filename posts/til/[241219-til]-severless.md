<h2 data-ke-size="size26">Q</h2>
<p data-ke-size="size16">vercel 등 serverless 서비스에 대해 질문이 있어요. nextjs 는 간단한 서버 기능도 있어서 풀스택 프레임워크에 가깝잖아요. 그리고 이를 vercel에 배포시 자동적으로 이러한 서버 기능이 작동하고요. 그런데 fs 같은 파일 동작은 처리하지 못하는 걸로 알고 있는데, 이게 serverless 이기 때문인 건가요? severless 이므로 저장할 server 가 없어서 파일을 다루지 못하는 걸까요?</p>
<hr data-ke-style="style1" />
<h2 data-ke-size="size26">A</h2>
<p data-ke-size="size16">맞습니다. <b>Serverless 환경</b>에서는 서버 기능을 제공하지만, 파일 시스템과 같은 지속적인 상태 관리는 제한적입니다. 이 제약은 <b>Serverless의 특성과 동작 방식</b> 때문입니다. 아래에서 이에 대한 자세한 이유를 설명드리겠습니다.</p>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>1. Serverless란?</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>Serverless</b>는 실제로 서버가 없는 것이 아니라, 서버를 사용자가 직접 관리하지 않는 <b>"Function as a Service(FaaS)"</b> 형태의 아키텍처를 의미합니다.</li>
<li>서버 인스턴스는 요청이 발생할 때 <b>자동으로 생성되고, 처리 후 종료</b>됩니다.</li>
<li>Next.js가 Vercel에서 배포될 때, <b>API Routes</b>, <code>getServerSideProps</code>, <code>app</code> 디렉토리의 서버 컴포넌트 등은 Serverless 함수로 배포됩니다.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>2. 왜 파일 시스템이 제한될까?</b></h3>
<p data-ke-size="size16">Serverless 환경에서 <b>파일 시스템 동작이 제한되는 이유</b>는 다음과 같습니다:</p>
<h4 data-ke-size="size20">1) <b>서버가 요청마다 생성되고 종료됨</b></h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Serverless 함수는 <b>짧은 수명</b>을 가집니다. 요청이 올 때만 컨테이너가 생성되고, 요청 처리가 끝나면 컨테이너가 종료됩니다.</li>
<li>이 때문에, 함수 실행 중에 생성된 파일은 요청 종료와 함께 <b>사라지며 지속되지 않습니다.</b></li>
</ul>
<h4 data-ke-size="size20">2) <b>서버 간 공유 불가</b></h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Serverless는 수평 확장이 기본 설계입니다. 동일한 Serverless 함수가 여러 인스턴스에서 실행될 수 있습니다.</li>
<li>파일 시스템은 특정 인스턴스에만 존재하므로, 다른 인스턴스에서는 동일한 파일에 접근할 수 없습니다.</li>
</ul>
<h4 data-ke-size="size20">3) <b>쓰기 가능한 파일 시스템 제공 제한</b></h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Vercel 같은 Serverless 플랫폼은 읽기 전용 파일 시스템을 제공합니다. 실행 중인 코드를 포함한 빌드 아티팩트는 읽을 수 있지만, 여기에 데이터를 <b>쓰거나 수정</b>할 수는 없습니다.</li>
<li>이유는 <b>컨테이너가 일시적이고 공유되지 않기 때문</b>입니다.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>3. Serverless 환경에서 fs를 사용할 수 있는 경우</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>읽기 작업은 가능</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Next.js의 빌드 프로세스에서 생성된 파일(예: 정적 파일, 이미지, JSON 등)을 읽는 작업은 가능합니다.</li>
<li>예: <code>fs.readFileSync</code>로 프로젝트 내 파일을 읽는 경우.</li>
</ul>
</li>
<li><b>쓰기 작업은 제한적</b>:
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>임시 파일 쓰기는 허용될 수 있지만, 이는 요청이 끝난 후 삭제됩니다.</li>
<li>예: <code>os.tmpdir()</code>로 반환된 디렉토리에서 파일 쓰기.</li>
</ul>
</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>4. Serverless 환경에서 파일 처리를 위한 대안</b></h3>
<p data-ke-size="size16">서버가 지속적으로 상태를 유지하지 않으므로, 파일 시스템 작업이 필요한 경우에는 외부 서비스를 사용하는 것이 일반적입니다.</p>
<h4 data-ke-size="size20">1) <b>클라우드 스토리지 사용</b></h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>파일을 업로드하거나 관리해야 할 경우 <b>S3, Google Cloud Storage</b> 또는 <b>Azure Blob Storage</b> 같은 클라우드 스토리지를 활용합니다.</li>
</ul>
<h4 data-ke-size="size20">2) <b>데이터베이스 사용</b></h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>파일 데이터를 직접 데이터베이스(예: PostgreSQL, MongoDB)로 저장하는 방법도 있습니다.</li>
</ul>
<h4 data-ke-size="size20">3) <b>CDN을 통한 정적 파일 제공</b></h4>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>파일이 빌드 시 생성되는 경우, 이를 CDN에 저장하여 읽기 전용으로 제공할 수 있습니다. 예: Vercel의 <code>public</code> 폴더.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>5. Next.js와 Vercel의 동작 요약</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>Next.js의 <b>서버 기능</b>은 Vercel에서 <b>Serverless 함수</b>로 작동합니다.</li>
<li>Serverless 함수는 요청마다 생성되고, 파일 시스템은 지속되지 않으므로, 파일 쓰기와 같은 동작이 제한됩니다.</li>
<li>이를 해결하려면 클라우드 스토리지나 CDN 같은 외부 서비스를 사용해야 합니다.</li>
</ul>
<hr data-ke-style="style1" />
<h3 data-ke-size="size23"><b>결론</b></h3>
<p data-ke-size="size16">Serverless 환경에서는 지속적인 파일 저장을 처리할 수 있는 "서버"가 없기 때문에, <code>fs</code>와 같은 파일 동작이 제한됩니다. 이는 <b>Serverless 아키텍처의 특성(짧은 수명, 수평 확장, 일시적 파일 시스템)</b> 때문이며, 파일 관련 작업은 외부 스토리지를 사용하는 방식으로 처리해야 합니다.</p>