import { getServerCaller } from "@/trpc/server/router";
import { ItemsClient } from "./items-client";

// testProxy는 런타임에만 동작하므로 정적 prerender 비활성화
export const dynamic = "force-dynamic";

// 서버 컴포넌트: tRPC caller로 axios → 외부 API 호출
// testProxy가 이 fetch를 인터셉트해서 모킹 데이터를 반환해야 함
export default async function ItemsPage() {
  const caller = await getServerCaller();
  const items = await caller.items.list();

  return (
    <main>
      <h1>Items (Server Component)</h1>
      <ul data-testid="server-items">
        {items.map((item) => (
          <li key={item.id} data-testid={`server-item-${item.id}`}>
            {item.name}
          </li>
        ))}
      </ul>

      <hr />

      <h2>Items (Client Component)</h2>
      <ItemsClient />
    </main>
  );
}
