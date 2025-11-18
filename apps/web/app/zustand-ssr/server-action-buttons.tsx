"use client";

import { useRouter } from "next/navigation";
import {
  incrementServerCount,
  decrementServerCount,
  resetServerCount,
} from "./server-actions";

/**
 * 서버 액션 버튼들
 *
 * 이 버튼들은 서버 액션을 호출하여
 * 서버의 싱글톤 store를 직접 조작합니다.
 *
 * 문제: 서버 store를 변경하면 모든 요청에 영향을 줍니다!
 */
export function ServerActionButtons() {
  const router = useRouter();

  const handleServerIncrement = async () => {
    // 서버 액션을 호출하여 서버의 싱글톤 store를 조작
    await incrementServerCount();
    // 페이지를 새로고침하여 서버 컴포넌트가 다시 렌더링되도록 함
    router.refresh();
  };

  const handleServerDecrement = async () => {
    await decrementServerCount();
    router.refresh();
  };

  const handleServerReset = async () => {
    await resetServerCount();
    router.refresh();
  };

  return (
    <div>
      <div style={{ marginBottom: "0.5rem", fontSize: "0.9em", color: "#c00" }}>
        <strong>⚠️ 서버 Store 직접 조작:</strong>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          onClick={handleServerIncrement}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.9em",
          }}
        >
          서버 + 증가
        </button>
        <button
          onClick={handleServerDecrement}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.9em",
          }}
        >
          서버 - 감소
        </button>
        <button
          onClick={handleServerReset}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#666",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.9em",
          }}
        >
          서버 리셋
        </button>
      </div>
      <div
        style={{
          marginTop: "0.5rem",
          fontSize: "0.8em",
          color: "#c00",
          padding: "0.5rem",
          backgroundColor: "#fee",
          borderRadius: "4px",
        }}
      >
        ⚠️ 이 버튼들은 서버의 싱글톤 store를 직접 조작합니다. 다른
        브라우저/탭에서도 영향을 받습니다!
      </div>
    </div>
  );
}
