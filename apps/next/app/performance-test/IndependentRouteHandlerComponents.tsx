"use client";

import { useState } from "react";
import { usePerformanceTest } from "./PerformanceTestContext";
import { IndependentDataItemRouteHandler } from "./IndependentDataItemRouteHandler";

export function IndependentRouteHandlerComponents() {
  const { requestCount } = usePerformanceTest();
  const [isMounted, setIsMounted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const handleMount = () => {
    setIsMounted(true);
    const start = performance.now();
    setStartTime(start);

    // 모든 쿼리가 완료될 때까지 대기
    setTimeout(() => {
      const end = performance.now();
      setEndTime(end);
    }, 5000); // 충분한 시간 대기
  };

  const duration =
    endTime && startTime ? (endTime - startTime).toFixed(2) : null;

  return (
    <div
      style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}
    >
      <h2>Route Handler + 독립 컴포넌트</h2>
      <div
        style={{
          padding: "10px",
          marginBottom: "15px",
          background: "#d1ecf1",
          borderRadius: "4px",
          fontSize: "12px",
          color: "#0c5460",
        }}
      >
        ✓ <strong>병렬 실행:</strong> 각 컴포넌트가 독립적으로 HTTP 요청을
        보내므로, 브라우저의 HTTP 클라이언트가 병렬로 처리하여 빠른 성능을
        보입니다. 컴포넌트가 마운트되면 자동으로 query가 실행됩니다.
      </div>
      <button
        type="button"
        onClick={handleMount}
        disabled={isMounted}
        style={{
          padding: "10px 20px",
          background: isMounted ? "#ccc" : "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isMounted ? "not-allowed" : "pointer",
          marginBottom: "20px",
        }}
      >
        {isMounted ? "컴포넌트 마운트됨" : "컴포넌트 마운트하기"}
      </button>

      {isMounted && (
        <div style={{ marginBottom: "15px" }}>
          <div
            style={{ fontSize: "12px", color: "#6c757d", marginBottom: "10px" }}
          >
            각 컴포넌트가 독립적으로 query를 실행합니다. 개발자 도구의 Network
            탭에서 요청이 병렬로 처리되는 것을 확인할 수 있습니다.
          </div>
          {duration && (
            <div>
              <strong>측정 시간: {duration}ms</strong>
              <br />
              <small style={{ color: "#6c757d" }}>
                (모든 컴포넌트가 마운트되고 query가 완료될 때까지의 시간)
              </small>
            </div>
          )}
        </div>
      )}

      <div style={{ maxHeight: "400px", overflow: "auto" }}>
        {isMounted &&
          Array.from({ length: requestCount }, (_, i) => (
            <IndependentDataItemRouteHandler
              key={`route-handler-${i + 1}`}
              id={i + 1}
            />
          ))}
      </div>
    </div>
  );
}
