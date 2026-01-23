# 성능 테스트 문서

> **빠른 시작**: 테스트 페이지는 `http://localhost:3000`에서 확인할 수 있습니다.  
> **관련 파일**: `app/page.tsx`, `app/actions/data.ts`, `app/api/data/route.ts`

## 목차

- [개요](#개요)
- [빠른 참조](#빠른-참조)
- [테스트 시나리오](#테스트-시나리오)
- [주요 발견사항](#주요-발견사항)
- [테스트 구성](#테스트-구성)
- [실행 방법](#실행-방법)
- [참고 문서](#참고-문서)
- [결론](#결론)
- [키워드 인덱스](#키워드-인덱스)

## 개요

이 프로젝트는 Next.js의 **Server Actions**와 **Route Handlers**의 성능 차이를 비교하는 테스트 페이지를 제공합니다. 특히 Server Actions의 순차 실행 특성과 Route Handlers의 병렬 실행 특성을 실제로 측정하고 비교할 수 있습니다.

## 빠른 참조

### 핵심 개념

| 개념 | 설명 | 관련 파일 |
|------|------|-----------|
| **Server Actions** | 순차 실행됨. 데이터 페칭에 사용 시 성능 저하 | `app/actions/data.ts` |
| **Route Handlers** | 병렬 실행 가능. HTTP 요청으로 처리 | `app/api/data/route.ts` |
| **useQueries** | 여러 쿼리를 병렬로 실행 | `app/performance-test/*.tsx` |

### 테스트 유형

1. **직접 호출**: `Promise.all`로 직접 호출 비교
2. **React Query 통합**: `useQueries`를 사용한 비교
3. **독립 컴포넌트**: 각 컴포넌트가 독립적으로 실행하는 경우

### 주요 키워드

- `Server Actions` - 순차 실행, 데이터 페칭 비권장
- `Route Handlers` - 병렬 실행, 성능 최적화
- `useQueries` - 병렬 쿼리 실행
- `Promise.all` - 병렬 처리 (Route Handler에서만 효과적)

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

**파일 위치**: `apps/express/src/index.ts`

모든 테스트는 Express 서버(`http://localhost:3002`)를 프록시로 사용합니다:

```typescript
// apps/express/src/index.ts
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

**파일 위치**: `app/actions/data.ts`

```typescript
// app/actions/data.ts
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

**사용 예시**: `app/performance-test/ServerActionTest.tsx`, `app/performance-test/ServerActionWithReactQuery.tsx`

### Route Handler 구현

**파일 위치**: `app/api/data/route.ts`

```typescript
// app/api/data/route.ts
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

**사용 예시**: `app/performance-test/RouteHandlerTest.tsx`, `app/performance-test/RouteHandlerWithReactQuery.tsx`

### 테스트 컴포넌트 구조

```
app/performance-test/
├── PerformanceTestContext.tsx      # 요청 개수 관리 Context
├── RequestCountControl.tsx         # 요청 개수 조절 UI
├── ServerActionTest.tsx            # Server Action 직접 호출 테스트
├── RouteHandlerTest.tsx            # Route Handler 직접 호출 테스트
├── ServerActionWithReactQuery.tsx  # Server Action + useQueries
├── RouteHandlerWithReactQuery.tsx  # Route Handler + useQueries
├── IndependentServerActionComponents.tsx  # 독립 컴포넌트 (Server Action)
├── IndependentRouteHandlerComponents.tsx  # 독립 컴포넌트 (Route Handler)
├── IndependentDataItemServerAction.tsx    # 개별 아이템 컴포넌트
└── IndependentDataItemRouteHandler.tsx    # 개별 아이템 컴포넌트
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

## 키워드 인덱스

### 검색 키워드

다음 키워드로 관련 내용을 빠르게 찾을 수 있습니다:

- **순차 실행** → [Server Actions의 순차 실행 특성](#server-actions의-순차-실행-특성)
- **병렬 실행** → [Route Handlers의 병렬 실행](#route-handlers의-병렬-실행)
- **useQueries** → [React Query 통합 테스트](#2-react-query-통합-테스트)
- **Promise.all** → [직접 호출 테스트](#1-직접-호출-테스트)
- **독립 컴포넌트** → [독립 컴포넌트 테스트](#3-독립-컴포넌트-테스트)
- **성능 비교** → [결론](#결론)
- **Next.js 공식 문서** → [참고 문서](#참고-문서)

### 파일별 검색

특정 파일을 찾고 싶다면:

- **Server Action 코드**: `app/actions/data.ts`
- **Route Handler 코드**: `app/api/data/route.ts`
- **테스트 페이지**: `app/page.tsx`
- **테스트 컴포넌트**: `app/performance-test/*.tsx`
- **Express 서버**: `apps/express/src/index.ts`

### 문제 해결

| 문제 | 해결 방법 | 관련 섹션 |
|------|-----------|-----------|
| Server Action이 느림 | Route Handler 사용 | [결론](#결론) |
| 병렬 실행이 안됨 | `useQueries` 또는 Route Handler 사용 | [테스트 시나리오](#테스트-시나리오) |
| 테스트 페이지 접속 불가 | Express 서버 실행 확인 | [실행 방법](#실행-방법) |
