# Trade Signal 배포 가이드

프로젝트는 **정적 파일(HTML/JS/CSS)** 와 **Python Flask API**(주가 조회) 로 구성됩니다.

---

## 1. 방식 선택

| 방식 | 주가 API | 난이도 | 추천 |
|------|----------|--------|------|
| **Vercel만 (전체)** | Yahoo Finance 연동 (서버리스) | 쉬움 | 한 곳에서 다 배포하고 싶을 때 |
| **정적만 (Vercel 등)** | 없음 (주가 추이는 시뮬레이션) | 쉬움 | 미리보기·데모 |
| **전체 한곳 (Railway)** | Yahoo Finance 연동 | 보통 | Flask 그대로 쓰고 싶을 때 |
| **Vercel + Railway** | 프론트는 Vercel, API는 Railway | 보통 | 프론트/API 분리하고 싶을 때 |

---

## 2. Vercel만으로 전체 배포 (정적 + 주가 API)

**Railway 없이 Vercel 하나로** 웹과 주가 API를 모두 서비스하는 방법입니다.  
이미 프로젝트에 `api/stock.py`(서버리스 함수)와 `vercel.json`(SPA 라우팅)이 들어 있어서, 저장소만 연결하면 됩니다.

1. [vercel.com](https://vercel.com) 로그인 → **Add New → Project**
2. **GitHub**에서 이 저장소 선택 후 Import
3. **Build Command**·**Output Directory**는 비워 두고 **Deploy** 클릭
4. 배포가 끝나면 나온 URL(예: `https://trade-xxx.vercel.app`)로 접속

**동작 방식**

- `/api/stock?ticker=AAPL&from=...&to=...` → `api/stock.py`가 Yahoo Finance에서 주가를 가져와 JSON으로 응답
- 그 외 경로 → `index.html`로 보내서 SPA 라우팅

**주의**

- 루트 `requirements.txt`에 `yfinance`가 있어야 합니다. (이미 포함돼 있음)
- Python 서버리스는 Beta이며, 콜드 스타트 시 첫 요청이 조금 느릴 수 있습니다.

---

## 3. 정적만 배포 (주가 API 없이)

의원/종목 목록, 프로필, 거래 내역은 그대로 동작하고, **거래 상세의 주가 추이**만 시뮬레이션 데이터로 표시됩니다.  
(이 프로젝트는 기본으로 `api/stock.py` 가 있어서 Vercel에 올리면 **2. Vercel만으로 전체 배포**가 됩니다. 정적만 쓰려면 `api/` 폴더를 제거하거나, Netlify/Pages 등 다른 곳에 올리면 됩니다.)

### 3-1. Vercel (정적만 쓰는 경우)

`api/` 폴더를 쓰지 않는다면, 루트에 `vercel.json` 만 다음처럼 두고 배포합니다:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 3-2. Netlify

1. [netlify.com](https://netlify.com) → **Add new site → Import existing project**
2. 빌드 설정 없이 **Publish directory** 만 프로젝트 루트(`.`)로 두고 배포
3. SPA이면 `netlify.toml` 추가:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3-3. GitHub Pages

1. 저장소 **Settings → Pages** 에서 Source를 **GitHub Actions** 또는 **브랜치**로 설정
2. 브랜치 배포일 경우, 배포하는 브랜치와 디렉터리는 `/ (root)` 등으로 지정
3. 해시 라우트(`#/`)만 쓰면 `index.html` 하나로 동작하므로 별도 rewrite 없이 가능

---

## 4. 전체 배포 (Flask + 주가 API 포함)

정적 파일과 `/api/stock/<ticker>` 를 한 도메인에서 서빙하려면 **Python 앱**으로 같이 배포해야 합니다.

### 4-1. Render (무료 티어 가능)

1. 코드를 **GitHub** 등에 올려두기
2. [render.com](https://render.com) → **New → Web Service** → 저장소 연결
3. 설정:
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn server:app`  
     (gunicorn 미포함 시: `pip install gunicorn` 후 `requirements.txt`에 추가)
4. **Environment**: `PORT`는 Render가 자동으로 넣어 줌
5. 배포 후 생성된 URL로 접속 (예: `https://trade-signal-xxx.onrender.com`)

**참고**: 무료 서비스는 15분 비활성 시 슬립 → 다음 요청 시 수십 초 정도 지연될 수 있습니다.

### 4-2. Railway

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. 연결한 뒤 **Settings**에서:
   - **Build**: `pip install -r requirements.txt`
   - **Start**: `gunicorn server:app` 또는 `python server.py`
3. **Variables**에 `PORT`가 있으면 `server.py`가 이미 `os.environ.get("PORT", 8000)` 을 쓰므로 추가 설정 없이 동작

### 4-3. 직접 서버 (VPS / EC2 등)

```bash
# 서버에 코드 올린 뒤
pip install -r requirements.txt
# 포어그라운드 실행
python server.py

# 또는 gunicorn 사용 (권장)
pip install gunicorn
gunicorn -w 2 -b 0.0.0.0:8000 server:app
```

리버스 프록시(Nginx 등) 뒤에 두면 `http://your-domain/` 와 `http://your-domain/api/stock/...` 를 같은 호스트로 묶을 수 있습니다.

---

## 5. Vercel(프론트) + Railway(API) 분리 배포

프론트는 Vercel, 주가 API는 Railway에 두고 **한 도메인처럼** 쓰는 방법입니다. 브라우저는 Vercel만 바라보고, `/api/*` 요청만 Vercel이 Railway로 넘겨줍니다 (CORS 불필요).

### 5-1. Railway에 API 먼저 배포

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → 이 저장소 선택
2. **Settings**:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn server:app`
3. **Variables**: `PORT`는 Railway가 알아서 넣어 줌
4. 배포가 끝나면 **Settings → Domains**에서 URL 확인 (예: `https://trade-xxx-production.up.railway.app`)
5. **이 URL을 복사해 둠** (아래 5-2에서 사용)

### 5-2. Vercel에 프론트 배포 + API 프록시

1. [vercel.com](https://vercel.com) → **Add New → Project** → 같은 저장소 연결
2. **Build Command**·**Output Directory**는 비워 두거나 루트 그대로
3. 프로젝트 **루트**에 `vercel.json`을 다음처럼 넣고, **`YOUR_RAILWAY_URL` 부분만 5-1에서 복사한 Railway URL로 바꿔서 저장**한 뒤 커밋·푸시:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://YOUR_RAILWAY_URL/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

예시 (실제 URL이 `https://trade-signal-api.up.railway.app` 인 경우):

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://trade-signal-api.up.railway.app/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

4. Vercel이 자동으로 다시 배포한 뒤, **Vercel 쪽 URL**(예: `https://trade-xxx.vercel.app`)로 접속하면 됩니다.  
   - 페이지·라우팅은 Vercel  
   - `/api/stock/AAPL` 같은 요청은 Railway로 넘어가서 주가 데이터를 가져옵니다.

### 5-3. 정리

- **Railway**: Flask 앱 전체(`server.py`)를 올리는 것이므로 `index.html`·`js/`·`data/` 등도 같이 들어 있습니다. 다만 사용자는 **Vercel URL로만 접속**하면 됩니다.
- **Vercel**: 정적 파일 + `/(.*)` → `index.html` 로 SPA 동작, `/api/:path*` 만 Railway로 rewrites.
- Railway URL을 나중에 바꾸면 `vercel.json`의 `destination`만 새 URL로 고친 뒤 다시 배포하면 됩니다.

---

## 6. 체크리스트

- [ ] `data/sp500_close.json`, CSV 파일 등이 배포 경로에 포함되는지 확인
- [ ] **전체 배포** 시 `requirements.txt`에 `gunicorn` 추가 후 `gunicorn server:app` 로 실행
- [ ] 실제 도메인 쓰려면 호스팅 쪽에서 **Custom Domain** 설정
- [ ] 로그인/결제 등 백엔드가 붙으면 별도 API 서버와 CORS·환경 변수 설정 필요

---

## 7. requirements.txt (전체 배포 시)

이미 있는 `requirements.txt`에 gunicorn만 있으면 됩니다:

```
flask>=2.0.0
yfinance>=0.2.0
gunicorn>=21.0.0
```

Render/Railway에서는 **Start Command**를 `gunicorn server:app` 로 두면 됩니다.
