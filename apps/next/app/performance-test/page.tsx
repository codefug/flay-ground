"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { serverActionFetchData } from "../actions/data";

const REQUEST_COUNT = 30;

async function fetchRouteHandlerData(id: number) {
  const response = await fetch(`/api/data?id=${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch");
  }
  return response.json();
}

function ServerActionTest() {
  const [results, setResults] = useState<{
    startTime: number | null;
    endTime: number | null;
    data: Array<{ id: number; data: string }>;
  }>({
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
      serverActionFetchData(i + 1)
    );

    const data = await Promise.all(promises);
    const endTime = performance.now();

    setResults({ startTime, endTime, data });
    setIsRunning(false);
  };

  const duration = results.endTime && results.startTime
    ? (results.endTime - results.startTime).toFixed(2)
    : null;

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Server Action + React Query</h2>
      <button
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
          <strong>평균 시간: {(Number(duration) / REQUEST_COUNT).toFixed(2)}ms</strong>
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

function RouteHandlerTest() {
  const [results, setResults] = useState<{
    startTime: number | null;
    endTime: number | null;
    data: Array<{ id: number; data: string }>;
  }>({
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

  const duration = results.endTime && results.startTime
    ? (results.endTime - results.startTime).toFixed(2)
    : null;

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Route Handler + React Query</h2>
      <button
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
          <strong>평균 시간: {(Number(duration) / REQUEST_COUNT).toFixed(2)}ms</strong>
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

function ServerActionWithReactQuery() {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);

  const queries = Array.from({ length: REQUEST_COUNT }, (_, i) =>
    useQuery({
      queryKey: ["server-action", i + 1],
      queryFn: () => serverActionFetchData(i + 1),
      enabled,
    })
  );

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

  const duration = endTime && startTime ? (endTime - startTime).toFixed(2) : null;

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Server Action + React Query (useQuery)</h2>
      <button
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
          <strong>평균 시간: {(Number(duration) / REQUEST_COUNT).toFixed(2)}ms</strong>
        </div>
      )}

      <div style={{ maxHeight: "300px", overflow: "auto" }}>
        {queries.map((query, index) => (
          <div key={index} style={{ padding: "5px", fontSize: "12px" }}>
            {query.data?.data || "대기 중..."}
          </div>
        ))}
      </div>
    </div>
  );
}

function RouteHandlerWithReactQuery() {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);

  const queries = Array.from({ length: REQUEST_COUNT }, (_, i) =>
    useQuery({
      queryKey: ["route-handler", i + 1],
      queryFn: () => fetchRouteHandlerData(i + 1),
      enabled,
    })
  );

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

  const duration = endTime && startTime ? (endTime - startTime).toFixed(2) : null;

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Route Handler + React Query (useQuery)</h2>
      <button
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
          <strong>평균 시간: {(Number(duration) / REQUEST_COUNT).toFixed(2)}ms</strong>
        </div>
      )}

      <div style={{ maxHeight: "300px", overflow: "auto" }}>
        {queries.map((query, index) => (
          <div key={index} style={{ padding: "5px", fontSize: "12px" }}>
            {query.data?.data || "대기 중..."}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PerformanceTestPage() {
  return (
    <div style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "30px" }}>
        성능 비교 테스트 (30개 요청)
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <ServerActionTest />
        <RouteHandlerTest />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        <ServerActionWithReactQuery />
        <RouteHandlerWithReactQuery />
      </div>
    </div>
  );
}
