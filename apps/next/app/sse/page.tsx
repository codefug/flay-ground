"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSubscription } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { TrpcProvider, useTRPC } from "../trpc-client";

export default function SsePage() {
  return (
    <TrpcProvider>
      <Demo />
    </TrpcProvider>
  );
}

/**
 * tRPC 구독 status를 사람이 읽을 수 있게 바꾼다.
 * pending은 "대기 중"이 아니라 "연결되어 데이터를 받는 중"이라는 뜻이다.
 */
function statusLabel(status: string) {
  switch (status) {
    case "pending":
      return "연결됨 (수신 중)";
    case "connecting":
      return "연결 시도 중";
    case "error":
      return "에러";
    default:
      return "유휴";
  }
}

function Demo() {
  const trpc = useTRPC();

  // 일반 query — splitLink의 httpBatchLink를 탄다
  const health = useQuery(trpc.health.queryOptions());
  // 초기 목록은 query로 받고, 이후 갱신은 SSE 구독으로 받는다
  const initial = useQuery(trpc.chat.list.queryOptions());

  const [streamed, setStreamed] = useState<
    Array<{ id: string; author: string; text: string }>
  >([]);
  const [text, setText] = useState("");

  const subscription = useSubscription(
    trpc.chat.onAdd.subscriptionOptions(undefined, {
      // tracked()로 보낸 이벤트는 { id, data } 형태로 도착한다
      onData: (event) => {
        const message = event.data;
        setStreamed((prev) =>
          // 재연결 시 같은 메시지가 다시 올 수 있어 id로 중복을 막는다
          prev.some((m) => m.id === message.id) ? prev : [...prev, message]
        );
      },
    })
  );

  const send = useMutation(trpc.chat.send.mutationOptions());

  // 초기 목록 + 스트림으로 받은 것 합치기 (id 기준 중복 제거)
  const messages = [...(initial.data ?? []), ...streamed].filter(
    (message, index, all) => all.findIndex((m) => m.id === message.id) === index
  );

  return (
    <main style={{ padding: 32, display: "grid", gap: 24, maxWidth: 640 }}>
      <div>
        <h1>tRPC BFF over SSE</h1>
        <p>
          BFF: <strong>{health.data?.bff ?? "..."}</strong> / downstream:{" "}
          <strong>{health.data?.domain ?? "..."}</strong>
        </p>
        <p>구독 상태: {statusLabel(subscription.status)}</p>
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
}
