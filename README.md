# 출장 경비 계산기 (Trip Expenses Calculator)

출장 및 여행 경비를 체계적으로 계산하고 관리할 수 있는 웹 애플리케이션입니다. 네이버 맵 API를 활용한 경로 검색, 실시간 유가 조회, 그리고 다양한 형식의 내보내기 기능을 제공합니다. <br>
check here -> https://expenses-calculator-five.vercel.app/

## 🚀 주요 기능

### 경비 계산
- **경로 검색**: 네이버 맵 API를 통한 자동 경로 검색 또는 수동 입력
- **왕복 옵션**: 왕복 여행 시 거리, 통행료, 소요시간 자동 계산
- **차량 정보**: 브랜드/모델 선택 또는 연비 직접 입력
- **실시간 유가**: OPINET API를 통한 실시간 유가 조회
- **추가 비용**: 주차비, 식비, 숙박비, 기타 비용 추가
- **메모**: 각 경비 항목에 대한 메모 작성

### 경비 관리
- **경비 내역 목록**: 계산된 경비를 목록으로 관리
- **수정/삭제**: 저장된 경비 내역 수정 및 삭제
- **로컬 저장**: 브라우저 로컬 스토리지를 통한 데이터 영구 저장
- **날짜별 관리**: 날짜별로 경비 내역 정리

### 내보내기
- **다양한 형식**: CSV, XLSX, PNG, PDF 형식으로 내보내기
- **다중 페이지**: 대량 데이터의 경우 자동으로 다중 페이지 생성
- **공식 문서**: 공식적인 경비 지출내역서 형식으로 출력
- **커스터마이징**: 작성자, 작성일자, 기간 선택 가능

### 사용자 경험
- **다크 모드**: 시스템 설정에 따른 자동 다크 모드 지원
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기 지원
- **부드러운 애니메이션**: 직관적인 UI 전환 효과
- **스크롤 네비게이션**: 페이지 상단/하단 빠른 이동 버튼

## 🛠️ 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Hooks
- **Data Export**: 
  - `xlsx` - Excel 파일 생성
  - `jspdf` & `jspdf-autotable` - PDF 생성
  - `html2canvas` - 이미지 변환
  - `jszip` - 다중 파일 압축
- **APIs**:
  - Naver Map API (경로 검색)
  - OPINET API (실시간 유가)

## 📋 사전 요구사항

- Node.js 18.0 이상
- npm 또는 yarn
- (선택) Naver Cloud Platform 계정 (경로 검색 기능 사용 시)
- (선택) OPINET API 키 (실시간 유가 조회 시)

## 🔧 설치 및 실행

### 1. 저장소 클론

```bash
git clone https://github.com/IsaacJang0321/expenses_calculator.git
cd expenses_calculator
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정 (선택사항)

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 추가하세요:

```env
# 네이버 맵 API (경로 검색 기능)
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret

# OPINET API (실시간 유가 조회)
OPINET_API_KEY=your_opinet_api_key
```

**참고**: 
- 환경 변수가 설정되지 않아도 기본 기능은 사용 가능합니다
- 네이버 맵 API 미설정 시: 경로를 수동으로 입력해야 합니다
- OPINET API 미설정 시: 기본 유가가 사용됩니다

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 5. 프로덕션 빌드

```bash
npm run build
npm start
```

## 📖 사용 방법

### 경비 계산하기

1. **"추가" 버튼 클릭**: 경비 계산기 화면 열기
2. **날짜 선택**: 여행 날짜 선택
3. **경로 입력**:
   - "지도로 검색": 네이버 맵 API를 통한 자동 경로 검색
   - "주소를 입력": 출발지/도착지를 직접 입력
   - "왕복" 체크: 왕복 여행 시 자동 계산
4. **차량 선택**: 브랜드와 모델 선택 또는 연비 직접 입력
5. **추가 비용 입력**: 주차비, 식비, 숙박비, 기타 비용 추가
6. **메모 작성**: (선택사항) 경비에 대한 메모 작성
7. **"완료" 버튼 클릭**: 경비 내역에 저장

### 경비 내역 관리

- **수정**: 경비 내역 항목 클릭하여 수정
- **삭제**: 항목의 X 버튼 클릭하여 삭제
- **전체 삭제**: "내역 전체 삭제" 버튼으로 모든 내역 삭제

### 내보내기

1. **"내보내기" 버튼 클릭**
2. **정보 입력**:
   - 작성자 이름
   - 작성일자
   - 기간 (시작일 ~ 종료일)
3. **형식 선택**: CSV, XLSX, PNG, PDF 중 선택
4. **"내보내기" 버튼 클릭**: 파일 다운로드

## 🔑 API 키 발급 방법

### 네이버 맵 API

1. [Naver Cloud Platform](https://www.ncloud.com/) 접속 및 로그인
2. "Services" → "AI·NAVER API" → "Application" 생성
3. "Directions API" 서비스 구독
4. Application의 "인증 정보"에서 Client ID와 Client Secret 확인

### OPINET API

1. [OPINET](https://www.opinet.co.kr/) 접속
2. 회원가입 및 로그인
3. "Open API" 메뉴에서 API 키 발급

## 📁 프로젝트 구조

```
expenses_calculator/
├── app/
│   ├── api/              # API 라우트
│   │   ├── routes/       # 네이버 맵 경로 검색 API
│   │   └── fuel-prices/  # OPINET 유가 조회 API
│   ├── components/       # React 컴포넌트
│   │   ├── RouteSelector.tsx
│   │   ├── VehicleForm.tsx
│   │   ├── ExpenseList.tsx
│   │   ├── ExportModal.tsx
│   │   └── ...
│   ├── lib/              # 유틸리티 함수
│   │   ├── calculations.ts
│   │   ├── exportUtils.ts
│   │   ├── vehicleData.ts
│   │   └── ...
│   └── page.tsx          # 메인 페이지
├── public/               # 정적 파일
├── vercel.json           # Vercel 배포 설정
└── package.json
```

## 🧪 테스트

```bash
# 빌드 테스트
npm run build

# 린트 검사
npm run lint
```

## 📝 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 🤝 기여

버그 리포트나 기능 제안은 GitHub Issues를 통해 제출해주세요.

## 📞 문의

프로젝트 관련 문의사항은 GitHub Issues를 통해 남겨주세요.

---

**Made with ❤️ by Isaac**
