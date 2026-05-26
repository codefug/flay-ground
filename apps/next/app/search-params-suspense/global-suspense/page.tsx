import { Suspense } from "react";
import { SearchParamsConsumer } from "../_components/SearchParamsConsumer";

export default function GlobalSuspensePage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "24px" }}>
        <h1>케이스 B: 전역 Suspense</h1>
        <p>렌더링되었는지 확인하는 플래그</p>
        <SearchParamsConsumer />
      </main>
    </Suspense>
  );
}
