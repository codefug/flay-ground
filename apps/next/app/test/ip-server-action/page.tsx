"use client";

import { useState } from "react";
import { getIpFromHeaders, getIpFromExpress } from "@/app/actions/ip";

export default function IpServerActionTest() {
  const [headerIp, setHeaderIp] = useState<any>(null);
  const [expressIp, setExpressIp] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetIpFromHeaders = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getIpFromHeaders();
      setHeaderIp(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleGetIpFromExpress = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getIpFromExpress();
      setExpressIp(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Server Action IP 테스트</h1>

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <div style={{ flex: 1, border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
          <h2>1. Server Action에서 직접 IP 가져오기</h2>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            Next.js headers() 함수를 사용하여 요청 헤더에서 IP를 추출합니다.
          </p>

          <button
            onClick={handleGetIpFromHeaders}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              marginTop: "1rem",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "로딩 중..." : "IP 가져오기 (headers)"}
          </button>

          {headerIp && (
            <pre style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              overflow: "auto"
            }}>
              {JSON.stringify(headerIp, null, 2)}
            </pre>
          )}
        </div>

        <div style={{ flex: 1, border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
          <h2>2. Express API를 통해 IP 가져오기</h2>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            Server Action에서 Express 백엔드 API를 호출하여 IP를 가져옵니다.
          </p>

          <button
            onClick={handleGetIpFromExpress}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              marginTop: "1rem",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "로딩 중..." : "IP 가져오기 (Express)"}
          </button>

          {expressIp && (
            <pre style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              overflow: "auto"
            }}>
              {JSON.stringify(expressIp, null, 2)}
            </pre>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          marginTop: "1rem",
          padding: "1rem",
          backgroundColor: "#fee",
          border: "1px solid #fcc",
          borderRadius: "4px",
          color: "#c00"
        }}>
          오류: {error}
        </div>
      )}

      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
        <h3>📝 설명</h3>
        <ul style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
          <li>
            <strong>방법 1 (직접 가져오기):</strong> Server Action 내에서 <code>headers()</code> 함수를
            사용하여 요청 헤더에 접근합니다. 이 방법은 Next.js 자체 기능만 사용합니다.
          </li>
          <li>
            <strong>방법 2 (Express API 호출):</strong> Server Action에서 Express 백엔드 API를
            호출합니다. 이는 BFF 패턴을 따르며, 백엔드에서 추가 로직을 처리할 수 있습니다.
          </li>
          <li>
            로컬 환경에서는 IPv6 형식(<code>::1</code> 또는 <code>::ffff:127.0.0.1</code>)으로
            표시될 수 있습니다.
          </li>
          <li>
            프로덕션 환경에서는 프록시나 로드밸런서를 거칠 경우 <code>x-forwarded-for</code>
            헤더에 실제 클라이언트 IP가 포함됩니다.
          </li>
        </ul>
      </div>
    </div>
  );
}
