import { SessionClient } from "./session-client";

export const dynamic = "force-dynamic";

export default function SessionPage() {
  return (
    <main>
      <h1>Session 테스트 페이지</h1>
      <p>세션 만료 시 "세션이 만료되었습니다" 토스트가 노출되는지 검증</p>
      <SessionClient />
    </main>
  );
}
