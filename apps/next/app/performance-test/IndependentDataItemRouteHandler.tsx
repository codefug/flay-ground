"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRouteHandlerData } from "./utils";

interface IndependentDataItemProps {
  id: number;
}

export function IndependentDataItemRouteHandler({ id }: IndependentDataItemProps) {
  const query = useQuery({
    queryKey: ["independent-route-handler", id],
    queryFn: () => fetchRouteHandlerData(id),
  });

  return (
    <div
      style={{
        padding: "8px",
        margin: "4px 0",
        background: query.isLoading
          ? "#d1ecf1"
          : query.isError
            ? "#f8d7da"
            : "#d4edda",
        borderRadius: "4px",
        fontSize: "12px",
        border: `1px solid ${query.isLoading ? "#17a2b8" : query.isError ? "#dc3545" : "#28a745"}`,
      }}
    >
      {query.isLoading && "로딩 중..."}
      {query.isError &&
        `에러: ${query.error instanceof Error ? query.error.message : "Unknown error"}`}
      {query.isSuccess && query.data?.data}
    </div>
  );
}
