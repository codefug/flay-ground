import { useProblematicStore } from "../store/problematic-store";
import { ServerActionButtons } from "./server-action-buttons";

/**
 * ⚠️ 서버 컴포넌트에서 Zustand 사용 (문제 발생)
 *
 * Next.js 13+ App Router에서는 서버 컴포넌트가 기본이지만,
 * Zustand는 클라이언트 전용 라이브러리입니다.
 *
 * 이 컴포넌트는 'use client'가 없어서 서버 컴포넌트로 실행되지만,
 * Zustand hook을 사용하려고 하면 에러가 발생합니다.
 *
 * 하지만 만약 서버에서 store에 직접 접근한다면,
 * 모든 요청이 같은 싱글톤 인스턴스를 공유하게 됩니다.
 */

// 서버 컴포넌트에서는 hook을 사용할 수 없으므로,
// store의 getState를 직접 사용하는 방식으로 문제를 보여줍니다.
export function ProblematicServerComponent() {
  // 서버 컴포넌트에서는 hook을 사용할 수 없지만,
  // store 인스턴스에 직접 접근하면 문제가 발생합니다.
  // 이 값은 모든 요청이 공유하는 싱글톤 인스턴스에서 읽어옵니다!
  const store = useProblematicStore.getState();

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <strong>서버에서 읽은 값:</strong>
      </div>
      <div
        style={{
          padding: "1rem",
          backgroundColor: "#fff",
          borderRadius: "4px",
          marginBottom: "1rem",
        }}
      >
        <div>
          서버 Count:{" "}
          <strong style={{ fontSize: "1.2em" }}>{store.serverCount}</strong>
        </div>
        <div style={{ fontSize: "0.9em", color: "#666", marginTop: "0.5rem" }}>
          Request ID: <code>{store.requestId}</code>
        </div>
        <div style={{ fontSize: "0.9em", color: "#666", marginTop: "0.5rem" }}>
          User Agent: {store.userAgent || "(없음)"}
        </div>
        <div style={{ fontSize: "0.8em", color: "#999", marginTop: "0.5rem" }}>
          Timestamp: {store.timestamp}
        </div>
      </div>

      <div
        style={{
          fontSize: "0.85em",
          color: "#c00",
          padding: "0.5rem",
          backgroundColor: "#fee",
          borderRadius: "4px",
        }}
      >
        ⚠️ 이 값은 모든 요청이 공유하는 싱글톤 인스턴스에서 읽어옵니다. 다른
        사용자가 값을 변경하면 여기에도 반영됩니다!
      </div>

      <div style={{ marginTop: "1rem", fontSize: "0.9em", color: "#666" }}>
        <p>서버 컴포넌트는 매 요청마다 실행되지만,</p>
        <p>
          store는 모듈 레벨 싱글톤이므로 모든 요청이 같은 인스턴스를 공유합니다.
        </p>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <ServerActionButtons />
      </div>
    </div>
  );
}
