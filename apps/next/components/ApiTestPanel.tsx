"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";

export function ApiTestPanel() {
  const trpc = useTRPC();
  const [userId, setUserId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  // Queries
  const { data: healthData, refetch: refetchHealth } = useQuery(
    trpc.health.queryOptions()
  );
  const { data: helloData, refetch: refetchHello } = useQuery(
    trpc.hello.queryOptions()
  );
  const { data: allTokensData, refetch: refetchAllTokens } = useQuery(
    trpc.auth.getAllTokens.queryOptions()
  );
  const { data: tokenByUserIdData, refetch: refetchTokenByUserId } = useQuery(
    trpc.auth.getTokenByUserId.queryOptions(
      { userId: selectedUserId },
      { enabled: false }
    )
  );
  const { data: protectedData, refetch: refetchProtected } = useQuery(
    trpc.auth.getProtectedData.queryOptions(
      { accessToken } as unknown as undefined,
      {
        enabled: !!accessToken,
      }
    )
  );

  // Mutations
  const loginMutation = useMutation(trpc.auth.login.mutationOptions());
  const refreshTokenMutation = useMutation(trpc.auth.refreshToken.mutationOptions());
  const logoutMutation = useMutation(trpc.auth.logout.mutationOptions());

  const handleLogin = () => {
    loginMutation.mutate(
      { userId },
      {
        onSuccess: (data) => {
          setAccessToken(data.accessToken);
          setRefreshToken(data.refreshToken);
        },
      }
    );
  };

  const handleRefreshToken = () => {
    if (!refreshToken) return;
    refreshTokenMutation.mutate(
      { refreshToken },
      {
        onSuccess: (data) => {
          setAccessToken(data.accessToken);
        },
      }
    );
  };

  const handleLogout = () => {
    if (!userId) return;
    logoutMutation.mutate(
      { userId },
      {
        onSuccess: () => {
          setAccessToken("");
          setRefreshToken("");
          setUserId("");
        },
      }
    );
  };

  const handleGetTokenByUserId = () => {
    if (!selectedUserId) return;
    refetchTokenByUserId();
  };

  const handleGetProtectedData = () => {
    if (!accessToken) return;
    refetchProtected();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px" }}>
      <h1>Express API 테스트 패널</h1>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {/* 왼쪽: API 테스트 */}
        <div>
          <h2>API 테스트</h2>

          {/* Health Check */}
          <section
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <h3>1. Health Check</h3>
            <button
              type="button"
              onClick={() => refetchHealth()}
              style={{
                marginBottom: "10px",
                padding: "8px 16px",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              GET /health
            </button>
            {healthData && (
              <pre
                style={{
                  background: "#f5f5f5",
                  padding: "10px",
                  borderRadius: "4px",
                  overflow: "auto",
                }}
              >
                {JSON.stringify(healthData, null, 2)}
              </pre>
            )}
          </section>

          {/* Hello */}
          <section
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <h3>2. Hello</h3>
            <button
              type="button"
              onClick={() => refetchHello()}
              style={{
                marginBottom: "10px",
                padding: "8px 16px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              GET /api/hello
            </button>
            {helloData && (
              <pre
                style={{
                  background: "#f5f5f5",
                  padding: "10px",
                  borderRadius: "4px",
                  overflow: "auto",
                }}
              >
                {JSON.stringify(helloData, null, 2)}
              </pre>
            )}
          </section>

          {/* Login */}
          <section
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <h3>3. Login</h3>
            <div style={{ marginBottom: "10px" }}>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="User ID"
                style={{ padding: "8px", width: "200px", marginRight: "10px" }}
              />
              <button
                type="button"
                onClick={handleLogin}
                disabled={loginMutation.isPending || !userId}
                style={{
                  padding: "8px 16px",
                  background: loginMutation.isPending ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loginMutation.isPending ? "not-allowed" : "pointer",
                }}
              >
                {loginMutation.isPending
                  ? "Logging in..."
                  : "POST /api/auth/login"}
              </button>
            </div>
            {loginMutation.isError && (
              <div style={{ color: "red", marginTop: "10px" }}>
                Error: {loginMutation.error.message}
              </div>
            )}
            {loginMutation.data && (
              <pre
                style={{
                  background: "#d4edda",
                  padding: "10px",
                  borderRadius: "4px",
                  overflow: "auto",
                  marginTop: "10px",
                }}
              >
                {JSON.stringify(loginMutation.data, null, 2)}
              </pre>
            )}
          </section>

          {/* Refresh Token */}
          <section
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <h3>4. Refresh Token</h3>
            <button
              type="button"
              onClick={handleRefreshToken}
              disabled={refreshTokenMutation.isPending || !refreshToken}
              style={{
                marginBottom: "10px",
                padding: "8px 16px",
                background: refreshTokenMutation.isPending ? "#ccc" : "#ffc107",
                color: "black",
                border: "none",
                borderRadius: "4px",
                cursor: refreshTokenMutation.isPending
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {refreshTokenMutation.isPending
                ? "Refreshing..."
                : "POST /api/auth/refresh"}
            </button>
            {refreshTokenMutation.isError && (
              <div style={{ color: "red", marginTop: "10px" }}>
                Error: {refreshTokenMutation.error.message}
              </div>
            )}
            {refreshTokenMutation.data && (
              <pre
                style={{
                  background: "#fff3cd",
                  padding: "10px",
                  borderRadius: "4px",
                  overflow: "auto",
                  marginTop: "10px",
                }}
              >
                {JSON.stringify(refreshTokenMutation.data, null, 2)}
              </pre>
            )}
          </section>

          {/* Get Protected Data */}
          <section
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <h3>5. Get Protected Data</h3>
            <button
              type="button"
              onClick={handleGetProtectedData}
              disabled={!accessToken}
              style={{
                marginBottom: "10px",
                padding: "8px 16px",
                background: !accessToken ? "#ccc" : "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: !accessToken ? "not-allowed" : "pointer",
              }}
            >
              GET /api/protected
            </button>
            {protectedData && (
              <pre
                style={{
                  background: "#d1ecf1",
                  padding: "10px",
                  borderRadius: "4px",
                  overflow: "auto",
                  marginTop: "10px",
                }}
              >
                {JSON.stringify(protectedData, null, 2)}
              </pre>
            )}
          </section>

          {/* Get All Tokens */}
          <section
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <h3>6. Get All Tokens (Dev Only)</h3>
            <button
              type="button"
              onClick={() => refetchAllTokens()}
              style={{
                marginBottom: "10px",
                padding: "8px 16px",
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              GET /api/auth/tokens
            </button>
            {allTokensData && (
              <pre
                style={{
                  background: "#e9ecef",
                  padding: "10px",
                  borderRadius: "4px",
                  overflow: "auto",
                  maxHeight: "200px",
                }}
              >
                {JSON.stringify(allTokensData, null, 2)}
              </pre>
            )}
          </section>

          {/* Get Token By User ID */}
          <section
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <h3>7. Get Token By User ID</h3>
            <div style={{ marginBottom: "10px" }}>
              <input
                type="text"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                placeholder="User ID"
                style={{ padding: "8px", width: "200px", marginRight: "10px" }}
              />
              <button
                type="button"
                onClick={handleGetTokenByUserId}
                disabled={!selectedUserId}
                style={{
                  padding: "8px 16px",
                  background: !selectedUserId ? "#ccc" : "#6f42c1",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: !selectedUserId ? "not-allowed" : "pointer",
                }}
              >
                GET /api/auth/tokens/:userId
              </button>
            </div>
            {tokenByUserIdData && (
              <pre
                style={{
                  background: "#e7d4f8",
                  padding: "10px",
                  borderRadius: "4px",
                  overflow: "auto",
                  marginTop: "10px",
                }}
              >
                {JSON.stringify(tokenByUserIdData, null, 2)}
              </pre>
            )}
          </section>

          {/* Logout */}
          <section
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <h3>8. Logout</h3>
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending || !userId}
              style={{
                marginBottom: "10px",
                padding: "8px 16px",
                background: logoutMutation.isPending ? "#ccc" : "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: logoutMutation.isPending ? "not-allowed" : "pointer",
              }}
            >
              {logoutMutation.isPending
                ? "Logging out..."
                : "POST /api/auth/logout"}
            </button>
            {logoutMutation.isError && (
              <div style={{ color: "red", marginTop: "10px" }}>
                Error: {logoutMutation.error.message}
              </div>
            )}
            {logoutMutation.data && (
              <pre
                style={{
                  background: "#f8d7da",
                  padding: "10px",
                  borderRadius: "4px",
                  overflow: "auto",
                  marginTop: "10px",
                }}
              >
                {JSON.stringify(logoutMutation.data, null, 2)}
              </pre>
            )}
          </section>
        </div>

        {/* 오른쪽: 현재 상태 */}
        <div>
          <h2>현재 상태</h2>
          <div
            style={{
              padding: "15px",
              background: "#f8f9fa",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <h3>토큰 정보</h3>
            {accessToken && (
              <div style={{ marginBottom: "15px" }}>
                <strong>Access Token:</strong>
                <div
                  style={{
                    wordBreak: "break-all",
                    fontSize: "12px",
                    marginTop: "5px",
                    padding: "8px",
                    background: "white",
                    borderRadius: "4px",
                  }}
                >
                  {accessToken}
                </div>
              </div>
            )}
            {refreshToken && (
              <div>
                <strong>Refresh Token:</strong>
                <div
                  style={{
                    wordBreak: "break-all",
                    fontSize: "12px",
                    marginTop: "5px",
                    padding: "8px",
                    background: "white",
                    borderRadius: "4px",
                  }}
                >
                  {refreshToken}
                </div>
              </div>
            )}
            {!accessToken && !refreshToken && (
              <div style={{ color: "#6c757d" }}>
                로그인하여 토큰을 받으세요.
              </div>
            )}
          </div>

          <div
            style={{
              padding: "15px",
              background: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <h3>사용 가이드</h3>
            <ol style={{ lineHeight: "1.8" }}>
              <li>Health Check로 서버 상태 확인</li>
              <li>Hello API로 기본 통신 테스트</li>
              <li>User ID를 입력하고 Login하여 토큰 발급</li>
              <li>발급받은 Access Token으로 Protected Data 접근</li>
              <li>Refresh Token으로 토큰 갱신</li>
              <li>Get All Tokens로 모든 토큰 조회 (개발용)</li>
              <li>특정 User ID로 토큰 조회</li>
              <li>Logout으로 토큰 삭제</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
