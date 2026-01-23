This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Inter, a custom Google Font.

## 성능 테스트

이 프로젝트는 Next.js의 **Server Actions**와 **Route Handlers**의 성능 차이를 비교하는 테스트 페이지를 포함합니다.

### 빠른 시작

1. **테스트 실행**
   ```bash
   pnpm dev:next-express
   ```
   브라우저에서 `http://localhost:3000` 접속

2. **주요 발견사항**
   - Server Actions는 순차 실행되어 데이터 페칭에 비효율적
   - Route Handlers는 병렬 실행 가능하여 더 빠른 성능 제공
   - 병렬 처리가 필요한 경우 Route Handler 사용 권장

### 문서

- 📖 [상세 문서](./PERFORMANCE_TEST.md) - 전체 가이드 및 참고 자료
- 🔍 [키워드 인덱스](./PERFORMANCE_TEST.md#키워드-인덱스) - 빠른 검색
- 📁 [코드 위치](./PERFORMANCE_TEST.md#테스트-구성) - 파일 구조 및 예제

### 관련 파일

- 테스트 페이지: `app/page.tsx`
- Server Action: `app/actions/data.ts`
- Route Handler: `app/api/data/route.ts`
- 테스트 컴포넌트: `app/performance-test/*.tsx`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
