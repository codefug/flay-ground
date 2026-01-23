"use client";

import { useQuery } from "@tanstack/react-query";
import { serverActionFetchData } from "../actions/data";

interface IndependentDataItemProps {
  id: number;
}

export function IndependentDataItemServerAction({ id }: IndependentDataItemProps) {
  const query = useQuery({
    queryKey: ["independent-server-action", id],
    queryFn: () => serverActionFetchData(id),
  });

  return (
    <div
      style={{
        padding: "8px",
        margin: "4px 0",
        background: query.isLoading
          ? "#fff3cd"
          : query.isError
            ? "#f8d7da"
            : "#d4edda",
        borderRadius: "4px",
        fontSize: "12px",
        border: `1px solid ${query.isLoading ? "#ffc107" : query.isError ? "#dc3545" : "#28a745"}`,
      }}
    >
      {query.isLoading && "로딩 중..."}
      {query.isError &&
        `에러: ${query.error instanceof Error ? query.error.message : "Unknown error"}`}
      {query.isSuccess && query.data?.data}
    </div>
  );
}
