import { create } from "zustand";

/**
 * ⚠️ 문제가 있는 Store 예시
 *
 * 이 store는 모듈 레벨에서 싱글톤으로 생성되므로,
 * SSR 환경에서 모든 요청이 같은 인스턴스를 공유합니다.
 *
 * 문제점:
 * 1. 서버 사이드에서 여러 요청이 같은 상태를 공유
 * 2. 한 사용자의 요청이 다른 사용자의 상태를 변경할 수 있음
 * 3. 시크릿 모드와 일반 브라우저가 같은 서버 인스턴스를 공유
 */

interface ProblematicState {
  count: number;
  serverCount: number; // 서버에서만 조작되는 카운터
  userAgent: string;
  timestamp: string;
  requestId: string; // 각 요청마다 생성되는 ID (문제를 보여주기 위함)
  increment: () => void;
  decrement: () => void;
  incrementServer: () => void;
  decrementServer: () => void;
  setUserAgent: (ua: string) => void;
  reset: () => void;
}

// 모듈 레벨에서 싱글톤으로 생성 - 이것이 문제!
export const useProblematicStore = create<ProblematicState>((set) => ({
  count: 0,
  serverCount: 0, // 서버에서 조작되는 카운터
  userAgent: "",
  timestamp: new Date().toISOString(),
  requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // 요청 ID
  increment: () =>
    set((state) => ({
      count: state.count + 1,
      timestamp: new Date().toISOString(),
    })),
  decrement: () =>
    set((state) => ({
      count: state.count - 1,
      timestamp: new Date().toISOString(),
    })),
  incrementServer: () =>
    set((state) => ({
      serverCount: state.serverCount + 1,
      timestamp: new Date().toISOString(),
      requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    })),
  decrementServer: () =>
    set((state) => ({
      serverCount: state.serverCount - 1,
      timestamp: new Date().toISOString(),
      requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    })),
  setUserAgent: (ua: string) =>
    set({
      userAgent: ua,
      timestamp: new Date().toISOString(),
    }),
  reset: () =>
    set({
      count: 0,
      serverCount: 0,
      userAgent: "",
      timestamp: new Date().toISOString(),
      requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }),
}));
