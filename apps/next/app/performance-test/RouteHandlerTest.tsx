"use client";

import { useState } from "react";
import { REQUEST_COUNT, type TestResult } from "./constants";
import { fetchRouteHandlerData } from "./utils";

export function RouteHandlerTest() {
  const [results, setResults] = useState<TestResult>({
    startTime: null,
    endTime: null,
    data: [],
  });
  const [isRunning, setIsRunning] = useState(false);

  const handleTest = async () => {
    setIsRunning(true);
    const startTime = performance.now();
    setResults({ startTime, endTime: null, data: [] });

    const promises = Array.from({ length: REQUEST_COUNT }, (_, i) =>
      fetchRouteHandlerData(i + 1)
    );

    const data = await Promise.all(promises);
    const endTime = performance.now();

    setResults({ startTime, endTime, data });
    setIsRunning(false);
  };

  const duration =
    results.endTime && results.startTime
      ? (results.endTime - results.startTime).toFixed(2)
      : null;

  return (
    <div
      style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}
    >
      <h2>Route Handler (직접 호출)</h2>
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
        ✓ <strong>병렬 실행:</strong> Route Handler는 HTTP 요청이므로
        Promise.all을 사용하면 병렬로 실행되어 더 빠른 성능을 보입니다.
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
        {results.data.map((item) => (
          <div key={item.id} style={{ padding: "5px", fontSize: "12px" }}>
            {item.data}
          </div>
        ))}
      </div>
    </div>
  );
}
