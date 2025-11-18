"use client";

import { useEffect } from "react";
import { useProblematicStore } from "../store/problematic-store";

/**
 * 클라이언트 컴포넌트에서 Zustand 사용
 *
 * 클라이언트 컴포넌트는 각 브라우저마다 독립적인 store 인스턴스를 가지지만,
 * 초기 SSR 시 서버의 싱글톤 값이 하이드레이션에 영향을 줄 수 있습니다.
 */
export function ProblematicClientComponent() {
  const {
    count,
    userAgent,
    timestamp,
    increment,
    decrement,
    reset,
    setUserAgent,
  } = useProblematicStore();

  useEffect(() => {
    // 클라이언트에서 User Agent 설정
    if (typeof window !== "undefined") {
      setUserAgent(navigator.userAgent);
    }
  }, [setUserAgent]);

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <strong>클라이언트 상태:</strong>
      </div>

      <div
        style={{
          padding: "1rem",
          backgroundColor: "#fff",
          borderRadius: "4px",
          marginBottom: "1rem",
        }}
      >
        <div style={{ fontSize: "1.5em", marginBottom: "0.5rem" }}>
          Count: <strong>{count}</strong>
        </div>
        <div style={{ fontSize: "0.9em", color: "#666", marginTop: "0.5rem" }}>
          User Agent:{" "}
          {userAgent ? userAgent.substring(0, 50) + "..." : "(없음)"}
        </div>
        <div style={{ fontSize: "0.8em", color: "#999", marginTop: "0.5rem" }}>
          Timestamp: {timestamp}
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          onClick={increment}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          + 증가
        </button>
        <button
          onClick={decrement}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          - 감소
        </button>
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#666",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          리셋
        </button>
      </div>

      <div
        style={{
          marginTop: "1rem",
          fontSize: "0.85em",
          color: "#006",
          padding: "0.5rem",
          backgroundColor: "#eef",
          borderRadius: "4px",
        }}
      >
        ℹ️ 클라이언트 컴포넌트는 각 브라우저마다 독립적이지만, 초기 SSR 값이
        서버 싱글톤에서 오면 문제가 될 수 있습니다.
      </div>
    </div>
  );
}
