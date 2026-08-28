import { EventEmitter } from "node:events";

export type ChatMessage = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

type AppEvents = {
  "chat:add": [ChatMessage];
};

class TypedEmitter extends EventEmitter<AppEvents> {}

/**
 * 데모용 인메모리 이벤트 버스 + 메시지 로그.
 * 실제 서비스라면 Redis pub/sub 같은 외부 브로커로 교체해야
 * 서버 인스턴스가 여러 개여도 스트림이 동작한다.
 */
export const ee = new TypedEmitter();

const messageLog: ChatMessage[] = [];
let seq = 0;

export function addMessage(author: string, text: string): ChatMessage {
  seq += 1;
  const message: ChatMessage = {
    id: String(seq),
    author,
    text,
    createdAt: new Date().toISOString(),
  };

  messageLog.push(message);
  ee.emit("chat:add", message);

  return message;
}

/** lastEventId 이후에 쌓인 메시지들 (재연결 복구용) */
export function messagesAfter(lastEventId: string): ChatMessage[] {
  const index = messageLog.findIndex((message) => message.id === lastEventId);
  return index === -1 ? [] : messageLog.slice(index + 1);
}

export function listMessages(): ChatMessage[] {
  return [...messageLog];
}
