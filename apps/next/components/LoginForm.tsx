"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";

type HelloData = {
  message: string;
  data: {
    framework: string;
    version: string;
  };
};

export function LoginForm() {
  const trpc = useTRPC();
  const [userId, setUserId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const loginMutation = useMutation(trpc.login.mutationOptions());
  const { data: helloData } = useQuery(trpc.hello.queryOptions());

  const handleLogin = () => {
    loginMutation.mutate(
      { userId },
      {
        onSuccess: (data) => {
          setAccessToken(data.accessToken);
        },
      }
    );
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px" }}>
      <h2>tRPC + MSW Example</h2>

      {helloData && (
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            background: "#f0f0f0",
          }}
        >
          <strong>Hello API:</strong>{" "}
          {(helloData as unknown as HelloData).message}
          <br />
          <strong>Framework:</strong>{" "}
          {(helloData as unknown as HelloData).data.framework}
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <label>
          User ID:
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID"
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleLogin}
        disabled={loginMutation.isPending || !userId}
        style={{
          padding: "10px 20px",
          background: loginMutation.isPending ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loginMutation.isPending ? "not-allowed" : "pointer",
        }}
      >
        {loginMutation.isPending ? "Logging in..." : "Login"}
      </button>

      {loginMutation.isError && (
        <div style={{ marginTop: "10px", color: "red" }}>
          Error: {loginMutation.error.message}
        </div>
      )}

      {accessToken && (
        <div
          style={{ marginTop: "20px", padding: "10px", background: "#d4edda" }}
        >
          <strong>Access Token:</strong>
          <div
            style={{
              wordBreak: "break-all",
              marginTop: "5px",
              fontSize: "12px",
            }}
          >
            {accessToken}
          </div>
        </div>
      )}
    </div>
  );
}
