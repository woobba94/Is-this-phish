# 🛡️ Is This Phish?

AI와 정적 규칙을 결합한 실시간 피싱 이메일/URL 탐지 서비스

## 🌟 프로젝트 개요

**Is This Phish?**는 OpenAI GPT-4o와 정적 보안 규칙을 활용하여 이메일 및 URL의 피싱 위험도를 실시간으로 분석하는 웹 서비스입니다. 3초 이내에 의심스러운 구간을 하이라이트하고, A~F 등급으로 위험도를 평가하여 사용자의 보안 의사결정을 돕습니다.

### 📊 서비스 배경
- 2024년 한국 피싱 메일 신고 건수 61% 증가 (사이버수사국 통계)
- 보안 FAQ 링크를 통한 회사 IT 팀·학교 재방문 유도 MAU 증대 전략

## ✨ 주요 기능

### 🤖 AI 기반 분석
- **OpenAI GPT-4o** function-call을 활용한 고도화된 자연어 처리
- 피싱 패턴, 언어적 특징, 사회공학적 기법 탐지
- 실시간 의심 구간 하이라이트 및 이유 제공

### ⚡ 정적 규칙 엔진
- 한글·영문 도메인 불일치 탐지
- 퍼블릭 이메일 제공업체 발신자 검증
- 은행·결제 키워드 + 단축 URL 조합 감지
- HTML form action 외부 도메인 검사
- 긴급성 조작 키워드 패턴 매칭
- 의심스러운 무료 도메인 확장자 체크

### 🛡️ 보안 및 성능
- **IP 단위 rate-limit**: 일일 1회 분석 제한
- **Vercel Edge Function**: 전 세계 빠른 응답속도
- **입력 크기 제한**: 최대 20KB 검증
- **html2canvas**: 결과 이미지 저장 및 공유

## 🚀 기술 스택

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **TailwindCSS**
- **react-quill** (read-only 뷰어)
- **html2canvas** (스크린샷)

### Backend
- **Vercel Edge Function** (Runtime: edge)
- **OpenAI GPT-4o** (function-call)
- **IP 기반 rate-limiting**

### Testing
- **Vitest** + **@testing-library/react**
- **100% 코드 커버리지** 목표

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/is-this-phish.git
cd is-this-phish
```

### 2. 종속성 설치
```bash
yarn install
```

### 3. 환경변수 설정
```bash
# .env.local 파일 생성
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. 개발 서버 실행
```bash
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 서비스를 확인하세요.

## 🧪 테스트

### 단위 테스트 실행
```bash
yarn test
```

### 커버리지 보고서 생성
```bash
yarn test:coverage
```

### 테스트 UI 실행
```bash
yarn test:ui
```

## 📁 프로젝트 구조

```
Is-this-phish/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # OpenAI 분석 API 엔드포인트
│   ├── globals.css               # 전역 스타일
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 메인 페이지
├── components/
│   ├── EmailAnalyzer.tsx         # 메인 분석 컴포넌트
│   ├── AnalysisResult.tsx        # 결과 표시 컴포넌트
│   └── PhishingBadge.tsx         # 위험도 뱃지 컴포넌트
├── utils/
│   ├── types.ts                  # TypeScript 타입 정의
│   ├── staticRules.ts            # 정적 규칙 엔진
│   └── rateLimit.ts              # IP 기반 rate-limit
├── __tests__/                    # 테스트 파일들
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vitest.config.ts
└── README.md
```

## 🚀 Vercel 배포

### 1. Vercel CLI 설치
```bash
yarn global add vercel
```

### 2. 프로젝트 배포
```bash
vercel
```

### 3. 환경변수 설정
Vercel 대시보드에서 `OPENAI_API_KEY` 환경변수를 설정하세요.

### 4. 프로덕션 배포
```bash
vercel --prod
```

## 🔧 환경변수

| 변수명 | 설명 | 필수 여부 |
|--------|------|-----------|
| `OPENAI_API_KEY` | OpenAI API 키 | ✅ 필수 |

## 📊 API 사용법

### POST /api/analyze

피싱 분석을 수행합니다.

**요청 예시:**
```json
{
  "content": "From: admin@gmail.com\nSubject: 긴급 - 계정 확인 필요\n\n안녕하세요. 보안을 위해 즉시 bit.ly/account123 링크를 클릭하여 계정을 확인해주세요.",
  "type": "email"
}
```

**응답 예시:**
```json
{
  "success": true,
  "result": {
    "score": "B",
    "highlights": [
      {
        "text": "admin@gmail.com",
        "reason": "퍼블릭 이메일에서 공식 업무 메일로 가장"
      },
      {
        "text": "긴급",
        "reason": "긴급성을 조작하는 의심스러운 표현"
      },
      {
        "text": "bit.ly/account123",
        "reason": "단축 URL 사용"
      }
    ],
    "summary": "이 이메일은 여러 피싱 지표를 포함하고 있습니다. 퍼블릭 이메일 주소 사용, 긴급성 조작, 단축 URL 등이 발견되었습니다."
  }
}
```

## 🏆 위험도 등급

| 등급 | 의미 | 설명 |
|------|------|------|
| **A** | 매우 위험 | 확실한 피싱으로 판단됨 |
| **B** | 위험 | 피싱 가능성이 높음 |
| **C** | 주의 | 의심스러운 요소가 있음 |
| **D** | 보통 | 약간의 위험 요소 |
| **E** | 낮음 | 경미한 주의사항 |
| **F** | 안전 | 정상적인 이메일/URL |

## ⚠️ 주의사항

- **IP당 일일 1회** 분석 제한
- **최대 20KB** 입력 크기 제한
- **개인정보** 포함 내용 입력 시 주의
- **참고용 서비스**로 최종 보안 판단은 사용자 책임

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: 새로운 기능 추가'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의 및 지원

- **이슈 리포트**: [GitHub Issues](https://github.com/your-username/is-this-phish/issues)
- **기능 요청**: [GitHub Discussions](https://github.com/your-username/is-this-phish/discussions)

---

## 🚀 다음 단계

1. **패키지 설치**: `yarn install`
2. **환경변수 설정**: `.env.local`에 `OPENAI_API_KEY` 추가
3. **개발 서버 실행**: `yarn dev`
4. **테스트 실행**: `yarn test:coverage`
5. **Vercel 배포**: `vercel --prod`

---

⚡ **Is This Phish?**와 함께 더 안전한 인터넷 환경을 만들어가세요! 

*이 서비스는 참고용이며, 최종 보안 판단은 항상 사용자의 책임입니다.* 