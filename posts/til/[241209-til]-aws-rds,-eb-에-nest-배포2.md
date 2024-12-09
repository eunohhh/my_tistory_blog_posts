<h2>4. CD 구축(github actions)</h2>
<p>깃헙 레포 settings &gt; Secrets and variables &gt; actions 에 환경변수 등록 해야함</p>
<pre><code class="language-yml"># .github/workflows/deploy.yml
name: Deploy to AWS Elastic Beanstalk
<p>on:
push:
branches:
- main</p>
<p>jobs:
build-and-deploy:
runs-on: ubuntu-latest</p>
<pre><code>steps:
  - name: Checkout code
    uses: actions/checkout@v3

  - name: Set up NodeJS
    uses: actions/setup-node@v3
    with:
      node-version: &amp;#39;22&amp;#39;

  - name: Install dependencies
    run: npm install

  - name: Build
    run: npm run build

  - name: Zip Artifacts for Deployment
    run: zip -r deploy.zip .

  - name: Upload to S3
    env:
      AWS_ACCESS_KEY_ID: ${{secrets.AWS_ACCESS_KEY_ID}}
      AWS_SECRET_ACCESS_KEY: ${{secrets.AWS_SECRET_ACCESS_KEY}}
      AWS_REGION: ${{secrets.AWS_REGION}}
    run: |
      aws configure set region $AWS_REGION
      aws s3 cp deploy.zip s3://s3버킷명/deploy.zip

  - name: Deploy to Elastic Beanstalk
    env:
      AWS_ACCESS_KEY_ID: ${{secrets.AWS_ACCESS_KEY_ID}}
      AWS_SECRET_ACCESS_KEY: ${{secrets.AWS_SECRET_ACCESS_KEY}}
      AWS_REGION: ${{secrets.AWS_REGION}}

    run: |
      aws elasticbeanstalk create-application-version \
        --application-name &amp;quot;eb어플리케이션명&amp;quot; \
        --version-label $GITHUB_SHA \
        --source-bundle S3Bucket=&amp;quot; s3버킷명&amp;quot;,S3Key=&amp;quot;deploy.zip&amp;quot;

      aws elasticbeanstalk update-environment \
        --application-name &amp;quot;eb어플리케이션명&amp;quot; \
        --environment-name &amp;quot;eb환경명&amp;quot; \
        --version-label $GITHUB_SHA&lt;/code&gt;&lt;/pre&gt;
</code></pre>
