/**
 * downstream SSE 바이트 스트림을 { id, data } 이벤트로 파싱하는 async generator.
 * ping 주석 프레임(": ping")은 건너뛴다.
 */
export async function* parseSseStream<T>(
  stream: ReadableStream<Uint8Array>,
  signal?: AbortSignal
): AsyncGenerator<{ id?: string; data: T }> {
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

      // 이벤트는 빈 줄로 구분된다
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

function parseFrame<T>(frame: string): { id?: string; data: T } | null {
  let id: string | undefined;
  const dataLines: string[] = [];

  for (const line of frame.split("\n")) {
    // 주석 프레임(ping)은 무시
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
    // 깨진 프레임은 스트림 전체를 죽이지 않고 버린다
    return null;
  }
}
