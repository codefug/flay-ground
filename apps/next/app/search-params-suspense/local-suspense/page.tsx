import { Suspense } from "react";
import { SearchParamsConsumer } from "../_components/SearchParamsConsumer";

export default function LocalSuspensePage() {
  return (
    <main style={{ maxWidth: "720px", margin: "0 auto", padding: "24px" }}>
      <h1>케이스 C: 최소 범위 Suspense</h1>
      <p>렌더링되었는지 확인하는 플래그</p>
      <Suspense fallback={<div>useSearchParams 영역 로딩 중...</div>}>
        <SearchParamsConsumer />
      </Suspense>
    </main>
  );
}
