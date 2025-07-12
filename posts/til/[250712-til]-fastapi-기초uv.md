<h2 data-ke-size="size26">uv를 사용한 FastAPI 도서 관리 API 만들기</h2>
<h3 data-ke-size="size23">1단계: uv 설치 및 프로젝트 초기화</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>uv 설치</li>
<li><code class="language-zsh"># uv 설치
brew install uv</code></li>
<li>프로젝트 초기화</li>
<li><code class="language-zsh">uv init fastapi-practice
cd fastapi-practice</code></li>
</ul>
<h3 data-ke-size="size23">2단계: 필요한 의존성 추가</h3>
<pre class="dockerfile"><code># FastAPI 관련 패키지들 (따옴표 필수!)
uv add fastapi "uvicorn[standard]"
<h1>데이터베이스 관련</h1>
<p>uv add sqlalchemy &quot;psycopg[binary]&quot; alembic</p>
<h1>환경변수 관리</h1>
<p>uv add python-dotenv</p>
<h1>개발용 도구</h1>
<p>uv add --dev pytest httpx</code></pre></p>
<p data-ke-size="size16"><b>주의</b>: zsh 쉘에서는 <code>[]</code>가 포함된 패키지명을 반드시 따옴표로 감싸야 합니다!</p>
<h3 data-ke-size="size23">3단계: DB - Docker 설정 (PostgreSQL)</h3>
<pre class="less"><code>version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: fastapi_practice
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d fastapi_practice"]
      interval: 10s
      timeout: 5s
      retries: 5
<p>volumes:
postgres_data:</code></pre></p>
<h3 data-ke-size="size23">4단계: 프로젝트 구조 및 환경 설정</h3>
<pre class="stata"><code>mkdir app
touch app/__init__.py app/main.py app/database.py app/models.py app/schemas.py app/crud.py app/config.py</code></pre>
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
<li>env 알아서 설정
<pre class="python" data-ke-language="python"><code># 데이터베이스 설정
DATABASE_URL=postgresql://user:password@localhost:5432/fastapi_practice
<p>#또는 개별 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fastapi_practice
DB_USER=user
DB_PASSWORD=password</p>
<p>#애플리케이션 설정
APP_NAME=&quot;도서 관리 API&quot;
APP_VERSION=&quot;1.0.0&quot;
DEBUG=True</code></pre></p>
</li>
<li>gitignore 알아서 잘 설정</li>
</ol>
<h3 data-ke-size="size23">5단계: 환경변수 설정 파일(config.py)</h3>
<pre class="python" data-ke-language="python"><code>import os
from dotenv import load_dotenv
<h1>.env 파일 로드</h1>
<p>load_dotenv()</p>
<p>class Settings:
# 데이터베이스 설정
DATABASE_URL: str = os.getenv(&quot;DATABASE_URL&quot;, &quot;&quot;)</p>
<pre><code># 개별 DB 설정 (필요시 사용)
DB_HOST: str = os.getenv(&quot;DB_HOST&quot;, &quot;&quot;)
DB_PORT: int = int(os.getenv(&quot;DB_PORT&quot;, &quot;&quot;))
DB_NAME: str = os.getenv(&quot;DB_NAME&quot;, &quot;&quot;)
DB_USER: str = os.getenv(&quot;DB_USER&quot;, &quot;&quot;)
DB_PASSWORD: str = os.getenv(&quot;DB_PASSWORD&quot;, &quot;&quot;)

# 애플리케이션 설정
APP_NAME: str = os.getenv(&quot;APP_NAME&quot;, &quot;도서 관리 API&quot;)
APP_VERSION: str = os.getenv(&quot;APP_VERSION&quot;, &quot;1.0.0&quot;)
DEBUG: bool = os.getenv(&quot;DEBUG&quot;, &quot;False&quot;).lower() == &quot;true&quot;

# 개별 설정으로 DATABASE_URL 구성하는 메서드
@property
def database_url_from_parts(self) -&amp;gt; str:
    return f&quot;postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}&quot;
</code></pre>
<h1>설정 인스턴스 생성</h1>
<p>settings = Settings()</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">6단계: 데이터베이스 연결 파일(database.py)</h3>
<pre class="routeros"><code>from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings
<p>SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL</p>
<h1>SQLite의 경우 추가 설정</h1>
<p>if SQLALCHEMY_DATABASE_URL.startswith(&quot;sqlite&quot;):
engine = create_engine(
SQLALCHEMY_DATABASE_URL,
connect_args={&quot;check_same_thread&quot;: False}  # SQLite용 설정
)
else:
# PostgreSQL용 설정
engine = create_engine(
SQLALCHEMY_DATABASE_URL,
pool_pre_ping=True,  # 연결 상태 확인
pool_recycle=300,    # 5분마다 연결 재생성
)</p>
<p>SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()</p>
<h1>의존성 주입용 함수</h1>
<p>def get_db():
db = SessionLocal()
try:
yield db
finally:
db.close()</code></pre></p>
<h3 data-ke-size="size23">7단계: 데이터베이스 모델 정의(models.py)</h3>
<pre class="routeros"><code>from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from .database import Base
<p>class Book(Base):
<strong>tablename</strong> = &quot;books&quot;</p>
<pre><code>id = Column(Integer, primary_key=True, index=True)
title = Column(String(200), nullable=False, index=True)
author = Column(String(100), nullable=False)
description = Column(Text, nullable=True)
isbn = Column(String(13), unique=True, nullable=True)
published_year = Column(Integer, nullable=True)
created_at = Column(DateTime(timezone=True), server_default=func.now())
updated_at = Column(DateTime(timezone=True), onupdate=func.now())&lt;/code&gt;&lt;/pre&gt;
</code></pre>
<h3 data-ke-size="size23">8단계: Pydantic 스키마 정의(schema.py)</h3>
<pre class="python"><code>from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
<p>class BookBase(BaseModel):
title: str = Field(..., min_length=1, max_length=200)
author: str = Field(..., min_length=1, max_length=100)
description: Optional[str] = None
isbn: Optional[str] = Field(None, regex=r'^\d{13}$')
published_year: Optional[int] = Field(None, ge=1000, le=2024)</p>
<p>class BookCreate(BookBase):
pass</p>
<p>class BookUpdate(BookBase):
title: Optional[str] = Field(None, min_length=1, max_length=200)
author: Optional[str] = Field(None, min_length=1, max_length=100)</p>
<p>class BookResponse(BookBase):
id: int
created_at: datetime
updated_at: Optional[datetime]</p>
<pre><code>class Config:
    from_attributes = True&lt;/code&gt;&lt;/pre&gt;
</code></pre>
<h3 data-ke-size="size23">9단계: CRUD 로직 작성(crud.py)</h3>
<pre class="python"><code>from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, schemas
<p>def get_book(db: Session, book_id: int) -&gt; Optional[models.Book]:
return db.query(models.Book).filter(models.Book.id == book_id).first()</p>
<p>def get_books(db: Session, skip: int = 0, limit: int = 100) -&gt; List[models.Book]:
return db.query(models.Book).offset(skip).limit(limit).all()</p>
<p>def create_book(db: Session, book: schemas.BookCreate) -&gt; models.Book:
db_book = models.Book(**book.dict())
db.add(db_book)
db.commit()
db.refresh(db_book)
return db_book</p>
<p>def update_book(db: Session, book_id: int, book: schemas.BookUpdate) -&gt; Optional[models.Book]:
db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
if db_book:
update_data = book.dict(exclude_unset=True)
for field, value in update_data.items():
setattr(db_book, field, value)
db.commit()
db.refresh(db_book)
return db_book</p>
<p>def delete_book(db: Session, book_id: int) -&gt; bool:
db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
if db_book:
db.delete(db_book)
db.commit()
return True
return False</p>
<p>def get_book_by_isbn(db: Session, isbn: str) -&gt; Optional[models.Book]:
return db.query(models.Book).filter(models.Book.isbn == isbn).first()</code></pre></p>
<h3 data-ke-size="size23">10단계: FastAPI 앱 작성(main.py)</h3>
<pre class="python"><code>from fastapi import FastAPI, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List
from . import crud, models, schemas
from .database import SessionLocal, engine, get_db
from .config import settings
<h1>데이터베이스 테이블 생성</h1>
<p>models.Base.metadata.create_all(bind=engine)</p>
<p>app = FastAPI(
title=settings.APP_NAME,
description=&quot;간단한 도서 관리 시스템&quot;,
version=settings.APP_VERSION,
debug=settings.DEBUG
)</p>
<p>@app.get(&quot;/&quot;, tags=[&quot;Root&quot;])
def read_root():
return {&quot;message&quot;: &quot;도서 관리 API에 오신 것을 환영합니다!&quot;}</p>
<p>@app.get(&quot;/books&quot;, response_model=List[schemas.BookResponse], tags=[&quot;Books&quot;])
def get_books(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
&quot;&quot;&quot;모든 도서 목록을 조회합니다.&quot;&quot;&quot;
books = crud.get_books(db, skip=skip, limit=limit)
return books</p>
<p>@app.post(&quot;/books&quot;, response_model=schemas.BookResponse, status_code=status.HTTP_201_CREATED, tags=[&quot;Books&quot;])
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
&quot;&quot;&quot;새로운 도서를 추가합니다.&quot;&quot;&quot;
# ISBN 중복 체크
if book.isbn and crud.get_book_by_isbn(db, isbn=book.isbn):
raise HTTPException(
status_code=status.HTTP_400_BAD_REQUEST,
detail=&quot;이미 존재하는 ISBN입니다.&quot;
)</p>
<pre><code>return crud.create_book(db=db, book=book)
</code></pre>
<p>@app.get(&quot;/books/{book_id}&quot;, response_model=schemas.BookResponse, tags=[&quot;Books&quot;])
def get_book(book_id: int, db: Session = Depends(get_db)):
&quot;&quot;&quot;특정 도서를 조회합니다.&quot;&quot;&quot;
db_book = crud.get_book(db, book_id=book_id)
if db_book is None:
raise HTTPException(
status_code=status.HTTP_404_NOT_FOUND,
detail=&quot;도서를 찾을 수 없습니다.&quot;
)
return db_book</p>
<p>@app.put(&quot;/books/{book_id}&quot;, response_model=schemas.BookResponse, tags=[&quot;Books&quot;])
def update_book(book_id: int, book: schemas.BookUpdate, db: Session = Depends(get_db)):
&quot;&quot;&quot;특정 도서 정보를 수정합니다.&quot;&quot;&quot;
db_book = crud.update_book(db, book_id=book_id, book=book)
if db_book is None:
raise HTTPException(
status_code=status.HTTP_404_NOT_FOUND,
detail=&quot;도서를 찾을 수 없습니다.&quot;
)
return db_book</p>
<p>@app.delete(&quot;/books/{book_id}&quot;, tags=[&quot;Books&quot;])
def delete_book(book_id: int, db: Session = Depends(get_db)):
&quot;&quot;&quot;특정 도서를 삭제합니다.&quot;&quot;&quot;
if not crud.delete_book(db, book_id=book_id):
raise HTTPException(
status_code=status.HTTP_404_NOT_FOUND,
detail=&quot;도서를 찾을 수 없습니다.&quot;
)
return {&quot;message&quot;: &quot;도서가 성공적으로 삭제되었습니다.&quot;}</code></pre></p>
<h3 data-ke-size="size23">11단계: 실행 및 테스트</h3>
<p data-ke-size="size16">PostgreSQL 컨테이너를 실행합니다:</p>
<pre class="ebnf"><code>docker-compose up -d</code></pre>
<p data-ke-size="size16">uv를 사용한 서버 실행</p>
<pre class="css"><code># uv 방식 (권장)
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000</code></pre>
<p data-ke-size="size16">api 테스트</p>
<pre class="applescript"><code># 도서 추가
curl -X POST "http://localhost:8000/books" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "파이썬 완전 정복",
    "author": "김개발자",
    "description": "파이썬 기초부터 실전까지",
    "isbn": "1234567890123",
    "published_year": 2024
  }'
<h1>도서 목록 조회</h1>
<p>curl &quot;http://localhost:8000/books&quot;</p>
<h1>특정 도서 조회</h1>
<p>curl &quot;http://localhost:8000/books/1&quot;</code></pre></p>
<h3 data-ke-size="size23">최종 프로젝트 구조</h3>
<pre class="jboss-cli"><code>fastapi-practice/
├── .env                 # 환경변수 (git에 올리지 않음)
├── .env.example         # 환경변수 예시
├── .gitignore
├── docker-compose.yml
├── pyproject.toml       # uv가 자동 생성
├── uv.lock             # uv가 자동 생성
└── app/
    ├── __init__.py
    ├── config.py        # 환경변수 설정
    ├── database.py      # DB 연결
    ├── main.py          # FastAPI 앱
    ├── models.py        # SQLAlchemy 모델
    ├── schemas.py       # Pydantic 스키마
    └── crud.py          # CRUD 로직</code></pre>