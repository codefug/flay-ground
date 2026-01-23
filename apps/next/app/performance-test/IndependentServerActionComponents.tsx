"use client";

import { useEffect, useRef, useState } from "react";
import { IndependentDataItemServerAction } from "./IndependentDataItemServerAction";
import { usePerformanceTest } from "./PerformanceTestContext";

export function IndependentServerActionComponents() {
  const { requestCount } = usePerformanceTest();
  const [isMounted, setIsMounted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const completedCountRef = useRef(0);
  const endTimeSetRef = useRef(false);

  const handleComplete = () => {
    completedCountRef.current += 1;
    if (
      completedCountRef.current === requestCount &&
      startTime &&
      !endTimeSetRef.current
    ) {
      endTimeSetRef.current = true;
      const end = performance.now();
      setEndTime(end);
    }
  };

  const handleMount = () => {
    setIsMounted(true);
    const start = performance.now();
    setStartTime(start);
    completedCountRef.current = 0;
    endTimeSetRef.current = false;
  };

  useEffect(() => {
    // 마운트 해제 시 리셋
    if (!isMounted) {
      completedCountRef.current = 0;
      endTimeSetRef.current = false;
    }
  }, [isMounted]);

  const duration =
    endTime && startTime ? (endTime - startTime).toFixed(2) : null;

  return (
    <div
      style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}
    >
      <h2>Server Action + 독립 컴포넌트</h2>
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
        ⚠️ <strong>주의:</strong> 각 컴포넌트가 독립적으로 Server Action을
        호출하지만, Server Action의 순차 실행 특성으로 인해 전체적으로는
        순차적으로 처리될 수 있습니다. 컴포넌트가 마운트되면 자동으로 query가
        실행됩니다.
      </div>
      <button
        type="button"
        onClick={handleMount}
        disabled={isMounted}
        style={{
          padding: "10px 20px",
          background: isMounted ? "#ccc" : "#007bff",
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
            탭에서 요청 순서를 확인할 수 있습니다.
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
            <IndependentDataItemServerAction
              key={`server-action-${i + 1}`}
              id={i + 1}
              onComplete={handleComplete}
            />
          ))}
      </div>
    </div>
  );
}
