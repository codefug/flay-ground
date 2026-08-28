"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "@/core/trpc/client/client";
import { useChatMessages } from "@/domain/chat/hooks/use-chat-messages";

const STATUS_LABEL: Record<string, string> = {
  pending: "연결됨 (수신 중)",
  connecting: "연결 시도 중",
  error: "에러",
  idle: "유휴",
};

export const ChatPanel = () => {
  const trpc = useTRPC();
  const [text, setText] = useState("");

  // 일반 query — splitLink의 httpBatchLink를 탄다
  const health = useQuery(trpc.health.get.queryOptions());
  const { messages, status } = useChatMessages();
  const send = useMutation(trpc.chat.send.mutationOptions());

  return (
    <main style={{ padding: 32, display: "grid", gap: 24, maxWidth: 640 }}>
      <div>
        <h1>tRPC BFF over SSE</h1>
        <p>
          BFF: <strong>{health.data?.bff ?? "..."}</strong> / downstream:{" "}
          <strong>{health.data?.domain ?? "..."}</strong>
        </p>
        <p>구독 상태: {STATUS_LABEL[status] ?? status}</p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!text.trim()) return;
          send.mutate({ author: "me", text });
          setText("");
        }}
        style={{ display: "flex", gap: 8 }}
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="메시지를 입력하세요"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" disabled={send.isPending}>
          보내기
        </button>
      </form>

      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <strong>{message.author}</strong>: {message.text}
          </li>
        ))}
      </ul>
    </main>
  );
};
