# Next.js tRPC + MSW + Storybook + Playwright Example

이 프로젝트는 Next.js App Router에서 tRPC를 BFF로 사용하고, MSW로 모킹하며, Storybook과 Playwright로 테스트하는 환경을 구축한 예제입니다.

## 아키텍처

```
Next.js Client ←→ Next.js Server (tRPC BFF) ←→ Express API (REST)
                      ↓
                    MSW (Mocking)
```

- **Next.js 클라이언트 ↔ Next.js 서버**: tRPC로 통신
- **Next.js 서버 ↔ Express API**: REST API로 통신
- **MSW**: tRPC 엔드포인트를 모킹하여 Storybook과 Playwright에서 사용

## 설치된 패키지

### tRPC 관련
- `@trpc/server` - tRPC 서버
- `@trpc/client` - tRPC 클라이언트
- `@trpc/tanstack-react-query` - React Query 통합
- `@tanstack/react-query` - 데이터 fetching 라이브러리
- `zod` - 스키마 검증
- `superjson` - Date 등 복잡한 타입 직렬화

### MSW 관련
- `msw` - Mock Service Worker
- `msw-trpc` - tRPC용 MSW 어댑터
- `msw-storybook-addon` - Storybook MSW 애드온

### Storybook
- `@storybook/nextjs-vite` - Next.js + Vite 프레임워크
- `@storybook/addon-*` - 다양한 애드온

### Playwright
- `@playwright/test` - E2E 테스트 프레임워크

## 프로젝트 구조

```
apps/next/
├── app/
│   ├── api/trpc/[trpc]/route.ts  # tRPC API 라우트 핸들러
│   ├── layout.tsx                 # TRPCReactProvider 적용
│   └── page.tsx                   # 메인 페이지
├── components/
│   ├── LoginForm.tsx              # 예제 컴포넌트
│   └── LoginForm.stories.tsx      # Storybook 스토리
├── trpc/
│   ├── init.ts                    # tRPC 초기화
│   ├── routers/_app.ts            # tRPC 라우터 정의
│   ├── query-client.ts            # React Query 클라이언트
│   ├── client.tsx                 # 클라이언트용 Provider
│   └── server.tsx                 # 서버용 헬퍼
├── lib/
│   └── express-client.ts          # Express API 클라이언트
├── mocks/
│   ├── handlers.ts                # MSW + tRPC 핸들러
│   ├── browser.ts                 # 브라우저용 MSW worker
│   └── server.ts                  # Node.js용 MSW server
├── e2e/
│   └── login.spec.ts              # Playwright 테스트
├── .storybook/
│   ├── main.ts                    # Storybook 설정
│   └── preview.tsx                # MSW + tRPC Provider 설정
└── playwright.config.ts           # Playwright 설정
```

## 사용 방법

### 1. 개발 서버 실행

```bash
# Express API 서버 실행 (포트 3002)
cd apps/express
pnpm dev

# Next.js 개발 서버 실행 (포트 3000)
cd apps/next
pnpm dev
```

브라우저에서 `http://localhost:3000` 접속

### 2. Storybook 실행

```bash
pnpm storybook
```

브라우저에서 `http://localhost:6006` 접속

MSW가 자동으로 활성화되어 tRPC 엔드포인트를 모킹합니다.

### 3. Playwright E2E 테스트

```bash
# 헤드리스 모드로 테스트 실행
pnpm test:e2e

# UI 모드로 테스트 실행
pnpm test:e2e:ui

# 디버그 모드로 테스트 실행
pnpm test:e2e:debug
```

## tRPC 라우터 예제

```typescript
// trpc/routers/_app.ts
export const appRouter = createTRPCRouter({
  // Query - Express API 호출
  hello: baseProcedure.query(async () => {
    const data = await expressClient.hello();
    return data;
  }),

  // Mutation - Express API 호출
  login: baseProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      const data = await expressClient.login(input.userId);
      return data;
    }),
});
```

## MSW 핸들러 예제

```typescript
// mocks/handlers.ts
export const handlers = [
  // Query 모킹
  trpcMsw.hello.query(() => ({
    message: 'Hello from MSW!',
    data: {
      framework: 'Express (Mocked)',
      version: '4.x',
    },
  })),

  // Mutation 모킹
  trpcMsw.login.mutation(({ input }) => ({
    accessToken: \`mock-token-\${input.userId}\`,
    refreshToken: \`mock-refresh-\${input.userId}\`,
    expiresIn: 900,
  })),
];
```

## Storybook에서 MSW 사용

```typescript
// components/LoginForm.stories.tsx
export const LoginSuccess: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcMsw.login.mutation(({ input }) => ({
          accessToken: \`storybook-token-\${input.userId}\`,
          refreshToken: \`storybook-refresh-\${input.userId}\`,
          expiresIn: 900,
        })),
      ],
    },
  },
};
```

## Playwright에서 MSW 사용

```typescript
// e2e/login.spec.ts
test('should successfully login', async ({ page }) => {
  server.use(
    trpcMsw.login.mutation(({ input }) => ({
      accessToken: \`e2e-token-\${input.userId}\`,
      refreshToken: \`e2e-refresh-\${input.userId}\`,
      expiresIn: 900,
    })),
  );

  await page.goto('/');
  await page.fill('input[placeholder="Enter user ID"]', 'testuser');
  await page.click('button:has-text("Login")');

  await expect(page.getByText('Access Token:')).toBeVisible();
});
```

## 핵심 포인트

1. **단일 MSW 핸들러**: `mocks/handlers.ts`에서 모든 모킹 정의
2. **일관된 API**: Storybook, Playwright, 개발 환경 모두 동일한 MSW 핸들러 사용
3. **타입 안전성**: tRPC + msw-trpc로 모킹에서도 타입 체크
4. **독립적 테스트**: 실제 Express API 없이도 프론트엔드 개발/테스트 가능

## 참고 자료

- [tRPC 공식 문서](https://trpc.io/docs)
- [MSW 공식 문서](https://mswjs.io/)
- [msw-trpc GitHub](https://github.com/maloguertin/msw-trpc)
- [Storybook MSW Addon](https://storybook.js.org/addons/msw-storybook-addon)
- [Playwright 공식 문서](https://playwright.dev/)
