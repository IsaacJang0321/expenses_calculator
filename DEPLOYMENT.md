# Vercel 배포 가이드

## ✅ 현재 상태 확인

코드는 배포 가능한 상태입니다. 환경 변수는 올바르게 `process.env.XXX` 형식으로 사용되고 있습니다.

## 🔑 필요한 환경 변수

Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:

### 1. 네이버 맵 API
- `NAVER_CLIENT_ID` - 네이버 클라우드 플랫폼 Client ID
- `NAVER_CLIENT_SECRET` - 네이버 클라우드 플랫폼 Client Secret

### 2. 오피넷 API
- `OPINET_API_KEY` - 오피넷 API 키

## 📝 Vercel 배포 단계

### 1. Vercel에 프로젝트 연결
1. [Vercel](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. GitHub/GitLab/Bitbucket에서 저장소 선택
4. 프로젝트 import

### 2. 환경 변수 설정
1. 프로젝트 설정 → "Environment Variables" 섹션
2. 다음 변수들을 추가:
   ```
   NAVER_CLIENT_ID=your_client_id
   NAVER_CLIENT_SECRET=your_client_secret
   OPINET_API_KEY=your_opinet_api_key
   ```
3. 각 환경(Production, Preview, Development)에 적용할지 선택

### 3. 빌드 설정
- Framework Preset: Next.js (자동 감지됨)
- Build Command: `npm run build` (기본값)
- Output Directory: `.next` (기본값)
- Install Command: `npm install` (기본값)

### 4. 배포
- "Deploy" 버튼 클릭
- 빌드가 완료되면 자동으로 배포됩니다

## ⚠️ 주의사항

1. **환경 변수 보안**: 환경 변수는 서버 사이드에서만 사용되므로 클라이언트에 노출되지 않습니다.
2. **API 키 관리**: 환경 변수는 Vercel 대시보드에서만 설정하고, 코드에 직접 하드코딩하지 마세요.
3. **빌드 테스트**: 로컬에서 `npm run build`를 실행하여 빌드가 성공하는지 확인하세요.

## 🧪 로컬 빌드 테스트

배포 전에 로컬에서 빌드를 테스트하세요:

```bash
npm run build
```

빌드가 성공하면 배포 가능한 상태입니다.

## 📚 참고사항

- 환경 변수가 설정되지 않으면:
  - 네이버 맵 API: 에러 메시지 표시
  - 오피넷 API: 기본값(휘발유 1850원 등) 반환

