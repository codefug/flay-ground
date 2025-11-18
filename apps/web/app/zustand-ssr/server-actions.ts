"use server";

import { useProblematicStore } from "../store/problematic-store";

/**
 * 서버 액션들
 *
 * 이 액션들은 서버에서 실행되므로,
 * 싱글톤 store를 직접 조작합니다.
 *
 * 문제: 모든 요청이 같은 store 인스턴스를 공유하므로,
 * 한 사용자가 호출한 액션이 다른 사용자에게도 영향을 줍니다!
 */
export async function incrementServerCount() {
  useProblematicStore.getState().incrementServer();
  return { success: true };
}

export async function decrementServerCount() {
  useProblematicStore.getState().decrementServer();
  return { success: true };
}

export async function resetServerCount() {
  useProblematicStore.getState().reset();
  return { success: true };
}
