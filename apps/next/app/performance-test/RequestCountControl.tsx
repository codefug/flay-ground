"use client";

import { usePerformanceTest } from "./PerformanceTestContext";

export function RequestCountControl() {
  const { requestCount, setRequestCount, minRequestCount, maxRequestCount } =
    usePerformanceTest();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequestCount(Number.parseInt(e.target.value, 10));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10);
    if (!Number.isNaN(value)) {
      setRequestCount(value);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px",
        color: "white",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h3
        style={{
          margin: "0 0 16px 0",
          fontSize: "18px",
          fontWeight: 600,
        }}
      >
        요청 개수 조절
      </h3>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <label
          htmlFor="request-count-slider"
          style={{
            fontSize: "14px",
            fontWeight: 500,
            minWidth: "80px",
          }}
        >
          개수:
        </label>
        <input
          id="request-count-slider"
          type="range"
          min={minRequestCount}
          max={maxRequestCount}
          value={requestCount}
          onChange={handleSliderChange}
          style={{
            flex: "1",
            minWidth: "200px",
            height: "8px",
            borderRadius: "4px",
            background: "rgba(255, 255, 255, 0.3)",
            outline: "none",
            cursor: "pointer",
          }}
        />
        <input
          type="number"
          min={minRequestCount}
          max={maxRequestCount}
          value={requestCount}
          onChange={handleInputChange}
          style={{
            width: "80px",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            background: "rgba(255, 255, 255, 0.2)",
            color: "white",
            fontSize: "14px",
            fontWeight: 600,
            textAlign: "center",
            outline: "none",
          }}
        />
        <div
          style={{
            fontSize: "12px",
            opacity: 0.9,
            minWidth: "120px",
          }}
        >
          범위: {minRequestCount} ~ {maxRequestCount}
        </div>
      </div>
    </div>
  );
}
