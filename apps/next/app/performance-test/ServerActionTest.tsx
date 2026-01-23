/**
 * Server Action 직접 호출 테스트 컴포넌트
 *
 * ⚠️ 주의: Server Action은 순차 실행되므로 Promise.all을 사용해도
 * 내부적으로는 순차 실행되어 총 소요 시간이 길어집니다.
 *
 * @see PERFORMANCE_TEST.md - 성능 테스트 문서
 * @see RouteHandlerTest - 병렬 실행 가능한 Route Handler 테스트
 */
"use client";

import { useState } from "react";
import { serverActionFetchData } from "../actions/data";
import { type TestResult } from "./constants";
import { usePerformanceTest } from "./PerformanceTestContext";

export function ServerActionTest() {
  const { requestCount } = usePerformanceTest();
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

    const promises = Array.from({ length: requestCount }, (_, i) =>
      serverActionFetchData(i + 1)
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
      <h2>Server Action (직접 호출)</h2>
      <div
        style={{
          padding: "10px",
          marginBottom: "15px",
          background: "#fff3cd",
          borderRadius: "4px",
          fontSize: "12px",
          color: "#856404",
        }}
      >
        ⚠️ <strong>주의:</strong> Server Action은 Next.js에서 순차적으로
        실행됩니다. Promise.all을 사용해도 내부적으로는 순차 실행되어 총 소요
        시간이 길어집니다.
      </div>
      <button
        type="button"
        onClick={handleTest}
        disabled={isRunning}
        style={{
          padding: "10px 20px",
          background: isRunning ? "#ccc" : "#007bff",
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
            평균 시간: {(Number(duration) / requestCount).toFixed(2)}ms
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
