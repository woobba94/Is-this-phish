# 배포 설정 가이드

## 환경 구성

### 1. GitHub Repository Settings

#### Environments 설정

1. GitHub 리포지토리 → Settings → Environments
2. 두 개 환경 생성:
   - `development`
   - `production` (Protection rules 설정 권장)

#### Secrets 설정

1. GitHub 리포지토리 → Settings → Secrets and variables → Actions
2. Repository secrets 추가:
   ```
   VERCEL_TOKEN=vercel_token_here
   ```

### 2. Vercel 설정

#### Vercel Token 생성

1. [vercel.com](https://vercel.com) → Settings → Tokens
2. Create Token → 복사하여 GitHub Secrets에 추가

#### Vercel Project 연결

```bash
# 로컬에서 한 번만 실행
vercel
# 프로젝트 설정 완료 후 .vercel/ 폴더 생성됨
```

## 배포 플로우

### Dev 배포 (자동)

- **트리거**: `main` 브랜치에 push
- **주소**: `your-project-git-hash.vercel.app`
- **환경변수**: Preview 환경 사용

### Prod 배포 (수동)

1. GitHub → Actions → "Deploy to Production"
2. "Run workflow" 클릭
3. 확인 텍스트 `DEPLOY` 입력
4. **주소**: `your-project.vercel.app` (커스텀 도메인 설정 가능)

## 환경변수 설정

### Vercel Dashboard에서 설정

1. vercel.com → 프로젝트 → Settings → Environment Variables
2. 환경별로 설정:

**Preview (Dev) 환경:**

```
OPENAI_API_KEY=sk-your-dev-key
NODE_ENV=development
```

**Production 환경:**

```
OPENAI_API_KEY=sk-your-prod-key
NODE_ENV=production
```

## 주의사항

- `.env` 파일은 로컬 개발용 (Git에서 제외됨)
- 실제 배포는 Vercel Dashboard의 환경변수 사용
- Prod 배포는 반드시 테스트 통과 후 진행
