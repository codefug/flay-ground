"use client";

import { useQuery } from "@tanstack/react-query";
import { useSubscription } from "@trpc/tanstack-react-query";
import { useMemo, useState } from "react";
import { useTRPC } from "@/core/trpc/client/client";
import type { ChatMessage } from "../schema";

/**
 * 초기 목록은 query로 받고, 이후 갱신은 SSE 구독으로 받는다.
 * 구독 status가 'pending'이면 "대기 중"이 아니라 "연결되어 수신 중"이라는 뜻이다.
 */
export const useChatMessages = () => {
  const trpc = useTRPC();
  const initial = useQuery(trpc.chat.list.queryOptions());
  const [streamed, setStreamed] = useState<ChatMessage[]>([]);

  const subscription = useSubscription(
    trpc.chat.onAdd.subscriptionOptions(undefined, {
      // tracked()로 보낸 이벤트는 { id, data } 형태로 도착한다
      onData: (event) => {
        const message = event.data;
        setStreamed((prev) =>
          // 재연결 시 같은 메시지가 다시 올 수 있어 id로 중복을 막는다
          prev.some((item) => item.id === message.id)
            ? prev
            : [...prev, message]
        );
      },
    })
  );

  const messages = useMemo(() => {
    const merged = new Map<string, ChatMessage>();
    for (const message of [...(initial.data ?? []), ...streamed]) {
      merged.set(message.id, message);
    }
    return [...merged.values()];
  }, [initial.data, streamed]);

  return {
    messages,
    status: subscription.status,
    isLoading: initial.isLoading,
  };
};
