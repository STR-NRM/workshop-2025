# 2025년 상반기 팀 워크샵 웹사이트

2025년 상반기 팀 워크샵을 위한 인터랙티브 웹 애플리케이션입니다.

## 🎯 프로젝트 개요

이 프로젝트는 팀 워크샵을 효과적으로 진행하기 위한 두 개의 웹사이트로 구성되어 있습니다:

1. **메인 워크샵 사이트** - 안건별 질문을 순차적으로 진행하며 팀원들의 의견을 수집
2. **안건3 평가 사이트** - AI 서비스 아이디어에 대한 다각도 평가 및 결과 집계

## 🚀 주요 기능

### 메인 워크샵 사이트
- 안건 1: 미래 AI 비즈니스
- 안건 2: 팀/팀원의 역할과 목표
- 안건 3: 차세대 AI 서비스
- 질문별 의견 기록 및 자동 저장
- 진행률 표시 및 네비게이션
- 응답 내용 내보내기 (JSON/PDF)

### 안건3 평가 사이트
- 14개 AI 서비스 아이디어 평가
- 4가지 평가 기준 (기술/수요/리소스/시장파이)
- 실시간 점수 집계 및 순위
- 인터랙티브 차트 시각화
- 커스텀 아이디어 추가 기능

## 📱 기술 스택

- **프론트엔드**: HTML5, CSS3, Vanilla JavaScript
- **스타일링**: CSS Variables, Flexbox, Grid
- **데이터 저장**: LocalStorage API
- **차트**: Chart.js
- **폰트**: Pretendard
- **호스팅**: GitHub Pages

## 🛠️ 설치 및 실행

### 로컬 실행
```bash
# 저장소 클론
git clone https://github.com/[username]/workshop-2025.git

# 디렉토리 이동
cd workshop-2025

# 로컬 서버 실행 (Python 3)
python -m http.server 8000

# 또는 Node.js http-server
npx http-server
```

브라우저에서 `http://localhost:8000` 접속

### GitHub Pages 배포
1. GitHub 저장소 Settings → Pages
2. Source: Deploy from a branch
3. Branch: main, folder: / (root)
4. Save 후 배포 대기 (약 5-10분)
5. `https://[username].github.io/workshop-2025/` 접속

## 📂 프로젝트 구조

```
workshop-2025/
├── common/              # 공통 리소스
│   ├── styles.css      # 디자인 시스템
│   └── fonts/          # 폰트 파일
├── workshop/           # 메인 워크샵 사이트
│   ├── index.html
│   ├── styles.css
│   ├── questions.js
│   ├── workshop.js
│   └── export.js
├── evaluation/         # 안건3 평가 사이트
│   ├── index.html
│   ├── styles.css
│   ├── ideas-data.js
│   ├── evaluation.js
│   ├── results.js
│   └── charts.js
├── index.html          # 랜딩 페이지
├── .gitignore
└── README.md
```

## 🎨 디자인 시스템

- **주요 색상**: 인디고(#6366f1), 보라(#8b5cf6), 파랑(#3b82f6)
- **그라데이션**: 인디고-보라 테마
- **타이포그래피**: Pretendard 폰트
- **반응형**: 모바일 우선 설계

## 💾 데이터 구조

### 워크샵 응답 데이터
```javascript
{
  participantName: "홍길동",
  timestamp: "2025-01-01T09:00:00",
  responses: {
    "question-1-1": "응답 내용...",
    "question-1-2": "응답 내용...",
    // ...
  }
}
```

### 평가 데이터
```javascript
{
  users: {
    "userId-123": {
      name: "홍길동",
      evaluations: {
        "idea-1": {
          scores: {
            tech: 5,
            demand: 4,
            resource: 3,
            market: 4
          },
          comment: "의견..."
        }
      },
      customIdeas: []
    }
  }
}
```

## 📋 브라우저 지원

- Chrome (최신)
- Safari (최신)
- Firefox (최신)
- Edge (최신)
- 모바일 브라우저

## 🤝 기여 방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 👥 팀

2025년 AI 전략팀

---

문의사항이 있으시면 이슈를 생성해주세요!