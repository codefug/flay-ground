"use client";

import { useTRPC } from "@/trpc/client/client";
import { useQuery } from "@tanstack/react-query";

export function ItemsClient() {
  const trpc = useTRPC();
  const { data: items, isPending, isError } = useQuery(trpc.items.list.queryOptions());

  if (isPending) return <p data-testid="client-loading">Loading...</p>;
  if (isError) return <p data-testid="client-error">Error loading items</p>;

  return (
    <ul data-testid="client-items">
      {items.map((item) => (
        <li key={item.id} data-testid={`client-item-${item.id}`}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
