"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface PerformanceTestContextValue {
  requestCount: number;
  setRequestCount: (count: number) => void;
  minRequestCount: number;
  maxRequestCount: number;
}

const PerformanceTestContext = createContext<
  PerformanceTestContextValue | undefined
>(undefined);

const MIN_REQUEST_COUNT = 1;
const MAX_REQUEST_COUNT = 100;
const DEFAULT_REQUEST_COUNT = 30;

export function PerformanceTestProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [requestCount, setRequestCountState] = useState(DEFAULT_REQUEST_COUNT);

  const setRequestCount = useCallback((count: number) => {
    const clampedCount = Math.max(
      MIN_REQUEST_COUNT,
      Math.min(MAX_REQUEST_COUNT, count)
    );
    setRequestCountState(clampedCount);
  }, []);

  return (
    <PerformanceTestContext.Provider
      value={{
        requestCount,
        setRequestCount,
        minRequestCount: MIN_REQUEST_COUNT,
        maxRequestCount: MAX_REQUEST_COUNT,
      }}
    >
      {children}
    </PerformanceTestContext.Provider>
  );
}

export function usePerformanceTest() {
  const context = useContext(PerformanceTestContext);
  if (context === undefined) {
    throw new Error(
      "usePerformanceTest must be used within a PerformanceTestProvider"
    );
  }
  return context;
}
