interface SseEvent<T> {
  id?: string;
  data: T;
}

const parseFrame = <T>(frame: string): SseEvent<T> | null => {
  let id: string | undefined;
  const dataLines: string[] = [];

  for (const line of frame.split("\n")) {
    // 주석 프레임(": ping")은 무시한다
    if (!line || line.startsWith(":")) continue;

    if (line.startsWith("id:")) {
      id = line.slice(3).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (dataLines.length === 0) return null;

  try {
    return { id, data: JSON.parse(dataLines.join("\n")) as T };
  } catch {
    // 깨진 프레임 하나 때문에 스트림 전체를 죽이지 않는다
    return null;
  }
};

/**
 * downstream SSE 바이트 스트림을 { id, data } 이벤트로 파싱하는 async generator.
 */
export async function* parseSseStream<T>(
  stream: ReadableStream<Uint8Array>,
  signal?: AbortSignal
): AsyncGenerator<SseEvent<T>> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  // 구독이 끊기면 downstream 연결도 같이 닫는다
  signal?.addEventListener("abort", () => void reader.cancel(), { once: true });

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // 이벤트는 빈 줄로 구분된다. 마지막 조각은 다음 청크와 이어붙인다
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        const event = parseFrame<T>(frame);
        if (event) yield event;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
