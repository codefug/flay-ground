"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { REQUEST_COUNT } from "./constants";
import { fetchRouteHandlerData } from "./utils";

export function RouteHandlerWithReactQuery() {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);

  // 모든 쿼리를 항상 생성하되 enabled로 제어
  const queries = Array.from({ length: REQUEST_COUNT }, (_, i) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery({
      queryKey: ["route-handler", i + 1],
      queryFn: () => fetchRouteHandlerData(i + 1),
      enabled,
    });
  });

  const handleTest = async () => {
    setIsRunning(true);
    const start = performance.now();
    setStartTime(start);
    setEnabled(true);

    await Promise.all(queries.map((query) => query.refetch()));

    const end = performance.now();
    setEndTime(end);
    setIsRunning(false);
  };

  const duration =
    endTime && startTime ? (endTime - startTime).toFixed(2) : null;

  return (
    <div
      style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}
    >
      <h2>Route Handler + React Query (useQuery)</h2>
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
        ✓ <strong>병렬 실행:</strong> Route Handler는 HTTP 요청이므로 useQuery를
        사용하면 각 쿼리가 병렬로 실행되어 최적의 성능을 보입니다.
      </div>
      <button
        type="button"
        onClick={handleTest}
        disabled={isRunning}
        style={{
          padding: "10px 20px",
          background: isRunning ? "#ccc" : "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isRunning ? "not-allowed" : "pointer",
          marginBottom: "20px",
        }}
      >
        {isRunning ? "테스트 실행 중..." : "테스트 시작"}
      </button>

      {duration && (
        <div style={{ marginBottom: "20px" }}>
          <strong>총 소요 시간: {duration}ms</strong>
          <br />
          <strong>
            평균 시간: {(Number(duration) / REQUEST_COUNT).toFixed(2)}ms
          </strong>
        </div>
      )}

      <div style={{ maxHeight: "300px", overflow: "auto" }}>
        {queries.map((query, index) => (
          <div
            key={`route-handler-${index + 1}`}
            style={{ padding: "5px", fontSize: "12px" }}
          >
            {query.data?.data || "대기 중..."}
          </div>
        ))}
      </div>
    </div>
  );
}
