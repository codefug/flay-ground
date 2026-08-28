# tRPC BFF + SSE

## 구조

```
[browser]  apps/next (localhost:3000)
    │  tRPC — query/mutation은 httpBatchLink, 구독은 httpSubscriptionLink(SSE)
    ▼
[BFF]  app/api/trpc/[trpc]/route.ts  →  server/trpc/router.ts
    │  fetch() — server/downstream.ts
    ▼
[도메인]  apps/express (localhost:3002)
    /api/chat/messages (REST)
    /api/chat/stream   (SSE 원본 스트림)
    /api/auth/*        (JWT)
```

브라우저는 express를 직접 호출하지 않는다. 전부 BFF를 통한다.

## 핵심 포인트

**splitLink** — 구독만 SSE로 보내고 나머지는 배치 HTTP로 보낸다.
구독을 배치 링크에 태우면 스트림이 배칭에 갇혀서 동작하지 않는다.

**tracked()** — 이벤트에 id를 붙이면 브라우저가 재연결할 때
`Last-Event-ID` 헤더를 보내고, tRPC가 이를 `input.lastEventId`로 넘겨준다.
BFF는 그 값을 downstream 스트림에 그대로 전달해 놓친 메시지를 복구한다.

**onData의 인자 모양** — `tracked()`로 보낸 이벤트는 `{ id, data }`로 도착한다.
페이로드는 `event.data`에 들어있다.

**route handler 설정** — SSE 스트림이 잘리지 않도록
`runtime = "nodejs"`, `dynamic = "force-dynamic"`을 지정했다.

**opts.signal** — 구독이 끊길 때 downstream 연결과 이벤트 리스너를 정리한다.
이걸 빼먹으면 연결이 샌다.

## 실행

```bash
pnpm dev:express   # 도메인 서버 :3002
pnpm dev:next      # BFF + 프론트 :3000
```

`http://localhost:3000/sse` 접속.

## 프로덕션 전 확인할 것

- `apps/express/src/events.ts`의 인메모리 이벤트 버스는 데모용이다.
  서버 인스턴스가 여러 개면 Redis pub/sub 같은 외부 브로커로 교체해야 한다.
- 메시지 로그가 무한히 쌓인다. 실제로는 보관 기간/개수 제한이 필요하다.
- `maxDuration = 60`은 배포 플랫폼의 함수 실행 시간 제한과 맞춰야 한다.
  서버리스에서는 긴 SSE 연결이 끊길 수 있다.
