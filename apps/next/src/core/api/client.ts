/**
 * downstream(express 도메인 API) 호출 계층.
 * BFF는 여기를 통해서만 도메인 서버와 통신한다 — 브라우저는 express를 직접 호출하지 않는다.
 */
const DOWNSTREAM_URL =
  process.env.DOWNSTREAM_API_URL ?? "http://localhost:3002";

interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  /** 있으면 Authorization 헤더로 붙인다 */
  token?: string;
}

export const request = async <T>(
  path: string,
  { token, headers, ...init }: RequestOptions = {}
): Promise<T> => {
  const response = await fetch(`${DOWNSTREAM_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
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
};

/**
 * 도메인 SSE 스트림을 그대로 열어 ReadableStream으로 돌려준다.
 * 구독 프로시저가 이걸 파싱해서 tRPC 이벤트로 다시 내보낸다.
 */
export const requestStream = async ({
  path,
  lastEventId,
  signal,
}: {
  path: string;
  lastEventId?: string;
  signal?: AbortSignal;
}): Promise<ReadableStream<Uint8Array>> => {
  const response = await fetch(`${DOWNSTREAM_URL}${path}`, {
    headers: {
      Accept: "text/event-stream",
      ...(lastEventId ? { "Last-Event-ID": lastEventId } : {}),
    },
    signal,
  });

  if (!response.body) {
    throw new Error(`Downstream ${path} returned no body`);
  }

  return response.body;
};
