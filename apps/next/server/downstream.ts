/**
 * downstream(express 도메인 API) 호출 계층.
 * BFF는 여기를 통해서만 도메인 서버와 통신한다 —
 * 브라우저는 express를 직접 호출하지 않는다.
 */
const DOWNSTREAM_URL =
  process.env.DOWNSTREAM_API_URL ?? "http://localhost:3002";

export type ChatMessage = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

async function request<T>(
  path: string,
  init?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...rest } = init ?? {};

  const response = await fetch(`${DOWNSTREAM_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...rest.headers,
    },
    // BFF는 항상 최신 도메인 상태를 봐야 한다
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Downstream ${path} failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

export const downstream = {
  health: () => request<{ status: string; timestamp: string }>("/health"),

  listMessages: () => request<ChatMessage[]>("/api/chat/messages"),

  sendMessage: (input: { author: string; text: string }) =>
    request<ChatMessage>("/api/chat/messages", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  login: (userId: string) =>
    request<{ accessToken: string; refreshToken: string; expiresIn: number }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ userId }) }
    ),

  protected: (token: string) =>
    request<{ message: string; userId: string }>("/api/protected", { token }),

  /**
   * 도메인 SSE 스트림을 그대로 열어 ReadableStream으로 돌려준다.
   * BFF 구독 프로시저가 이걸 파싱해서 tRPC 이벤트로 다시 내보낸다.
   */
  chatStream: async (opts: { lastEventId?: string; signal?: AbortSignal }) => {
    const response = await fetch(`${DOWNSTREAM_URL}/api/chat/stream`, {
      headers: {
        Accept: "text/event-stream",
        ...(opts.lastEventId ? { "Last-Event-ID": opts.lastEventId } : {}),
      },
      signal: opts.signal,
    });

    if (!response.body) {
      throw new Error("Downstream chat stream returned no body");
    }

    return response.body;
  },
};
