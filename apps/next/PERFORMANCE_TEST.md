# 성능 테스트 문서

## 개요

이 프로젝트는 Next.js의 **Server Actions**와 **Route Handlers**의 성능 차이를 비교하는 테스트 페이지를 제공합니다. 특히 Server Actions의 순차 실행 특성과 Route Handlers의 병렬 실행 특성을 실제로 측정하고 비교할 수 있습니다.

## 테스트 시나리오

### 1. 직접 호출 테스트
- **Server Action (직접 호출)**: `Promise.all`을 사용해도 순차 실행됨
- **Route Handler (직접 호출)**: HTTP 요청이므로 병렬 실행 가능

### 2. React Query 통합 테스트
- **Server Action + React Query**: `useQuery`를 사용해도 순차 실행의 영향
- **Route Handler + React Query**: 병렬 실행으로 최적 성능

### 3. 독립 컴포넌트 테스트
- 각 컴포넌트가 독립적으로 `useQuery`를 실행할 때의 동작 비교

## 주요 발견사항

### Server Actions의 순차 실행 특성

Next.js 공식 문서에 따르면:

> **"Server Actions are queued. Using them for data fetching introduces sequential execution."**
> 
> 출처: [Next.js Backend for Frontend Guide](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#caveats)

또한:

> **"The client currently dispatches and awaits them one at a time. This is an implementation detail and may change. If you need parallel data fetching, use data fetching in Server Components, or perform parallel work inside a single Server Function or Route Handler."**
> 
> 출처: [Next.js Updating Data Guide](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#invoking-server-functions)

### Route Handlers의 병렬 실행

Route Handlers는 일반적인 HTTP 요청이므로 브라우저의 네트워크 스택이 병렬로 처리합니다. `Promise.all`을 사용하면 여러 요청을 동시에 처리할 수 있습니다.

## 테스트 구성

### Express 프록시 서버

모든 테스트는 Express 서버(`http://localhost:3002`)를 프록시로 사용합니다:

```typescript
// Express API 엔드포인트
app.get("/api/data", (req, res) => {
  const id = req.query.id;
  // 10ms 지연 시뮬레이션
  setTimeout(() => {
    res.json({
      id: Number(id),
      data: `Express Data ${id}`,
      timestamp: Date.now(),
    });
  }, 10);
});
```

### Server Action 구현

```typescript
"use server";

export async function serverActionFetchData(id: number) {
  const response = await fetch(`${EXPRESS_API_URL}/api/data?id=${id}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
}
```

### Route Handler 구현

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  const response = await fetch(`${EXPRESS_API_URL}/api/data?id=${id}`, {
    cache: "no-store",
  });
  
  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch from Express" },
      { status: response.status }
    );
  }
  
  const data = await response.json();
  return NextResponse.json(data);
}
```

## 실행 방법

1. Express 서버와 Next.js 앱을 동시에 실행:
   ```bash
   pnpm dev:next-express
   ```

2. 브라우저에서 `http://localhost:3000` 접속

3. 요청 개수를 조절하고 각 테스트를 실행하여 성능 비교

## 참고 문서

### 공식 문서

1. **Server Actions Caveats**
   - URL: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#caveats
   - 핵심 내용: "Server Actions are queued. Using them for data fetching introduces sequential execution."

2. **Invoking Server Functions**
   - URL: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#invoking-server-functions
   - 핵심 내용: "The client currently dispatches and awaits them one at a time."

3. **Route Handlers**
   - URL: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
   - 핵심 내용: Route Handlers는 일반적인 HTTP 요청으로 처리되므로 병렬 실행 가능

4. **Parallel Data Fetching**
   - URL: https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#parallel-data-fetching
   - 핵심 내용: `Promise.all`을 사용하여 병렬 데이터 페칭 구현 방법

### GitHub 소스 코드

- [Next.js Backend for Frontend Guide](https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/backend-for-frontend.mdx)
- [Next.js Updating Data Guide](https://github.com/vercel/next.js/blob/canary/docs/01-app/01-getting-started/08-updating-data.mdx)

## 결론

- **Server Actions**: 데이터 페칭에 사용하면 순차 실행되어 성능 저하 발생
- **Route Handlers**: 병렬 실행이 가능하여 더 빠른 성능 제공
- **권장사항**: 병렬 처리가 필요한 경우 Route Handler 사용 권장

## 추가 분석 포인트

1. **네트워크 탭 확인**: 브라우저 개발자 도구의 Network 탭에서 요청 순서 확인
2. **타이밍 측정**: 각 테스트의 총 소요 시간과 평균 시간 비교
3. **컴포넌트별 동작**: 독립 컴포넌트가 마운트될 때의 동작 패턴 관찰
