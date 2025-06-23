# GitHub Pages 배포 가이드

## 🚀 배포 단계별 가이드

### 1. GitHub 저장소 생성

1. [GitHub.com](https://github.com)에 로그인
2. 우측 상단 '+' 버튼 → 'New repository' 클릭
3. Repository 설정:
   - Repository name: `workshop-2025`
   - Description: "2025년 상반기 팀 워크샵 웹사이트"
   - Public 선택 (무료 GitHub Pages 사용)
   - Initialize this repository with: 체크하지 않음
4. 'Create repository' 클릭

### 2. 로컬 저장소를 GitHub에 연결

터미널에서 다음 명령어 실행:

```bash
cd workshop-2025
git remote add origin https://github.com/[your-username]/workshop-2025.git
git branch -M main
git push -u origin main
```

### 3. GitHub Pages 활성화

1. GitHub 저장소 페이지에서 'Settings' 탭 클릭
2. 좌측 메뉴에서 'Pages' 클릭
3. Source 섹션에서:
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
4. 'Save' 클릭

### 4. 배포 확인

- 약 5-10분 후 다음 URL로 접속:
  ```
  https://[your-username].github.io/workshop-2025/
  ```

- Settings → Pages에서 배포 상태 확인 가능
- 녹색 체크 표시가 나타나면 배포 완료

## 📱 모바일 테스트

배포 후 다음 기기에서 테스트:
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] iPad Safari
- [ ] 태블릿 Chrome

## 🔗 공유 방법

### 1. 직접 링크 공유
```
https://[your-username].github.io/workshop-2025/
```

### 2. QR 코드 생성
- [QR Code Generator](https://www.qr-code-generator.com/)에서 URL 입력
- QR 코드 이미지 다운로드 후 공유

### 3. 단축 URL 생성 (선택사항)
- [Bitly](https://bitly.com/) 또는 [TinyURL](https://tinyurl.com/) 사용
- 예: `bit.ly/2025-workshop`

## ✅ 최종 체크리스트

### 기능 테스트
- [ ] 메인 워크샵 사이트
  - [ ] 참가자 이름 입력
  - [ ] 모든 7개 질문 네비게이션
  - [ ] 자동 저장 기능
  - [ ] JSON/PDF 내보내기
  
- [ ] 평가 사이트
  - [ ] 평가자 등록
  - [ ] 14개 아이디어 평가
  - [ ] 커스텀 아이디어 추가
  - [ ] 결과 차트 표시
  - [ ] 평가 데이터 내보내기

### 반응형 디자인
- [ ] 모바일 (320px ~ 767px)
- [ ] 태블릿 (768px ~ 1023px)
- [ ] 데스크톱 (1024px ~)

### 브라우저 호환성
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge

## 🛠️ 문제 해결

### 404 오류 발생 시
1. 저장소 이름과 URL 확인
2. GitHub Pages 설정 재확인
3. 10분 정도 대기 후 재시도

### CSS/JS 로드 실패 시
1. 상대 경로 확인 (`../common/styles.css`)
2. 파일명 대소문자 확인
3. 브라우저 캐시 삭제 (Ctrl+F5)

### 로컬 저장 문제
1. 브라우저 설정에서 LocalStorage 활성화 확인
2. 시크릿/프라이빗 모드에서는 제한될 수 있음

## 📄 추가 파일 생성

필요 시 다음 파일들을 추가로 생성할 수 있습니다:

### 1. 커스텀 도메인 설정 (CNAME)
```
workshop.yourcompany.com
```

### 2. 404 페이지 (404.html)
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>페이지를 찾을 수 없습니다</title>
    <meta http-equiv="refresh" content="5;url=/">
</head>
<body>
    <h1>페이지를 찾을 수 없습니다</h1>
    <p>5초 후 메인 페이지로 이동합니다...</p>
</body>
</html>
```

## 🎉 배포 완료!

모든 단계를 완료하면 팀원들과 링크를 공유하여 워크샵을 진행할 수 있습니다.

문의사항이 있으면 Issues 탭에서 문의해주세요.