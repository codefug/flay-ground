/**
 * Server Action - 데이터 페칭
 *
 * ⚠️ 주의: Server Actions는 순차 실행됩니다.
 * 병렬 처리가 필요한 경우 Route Handler를 사용하세요.
 *
 * @see PERFORMANCE_TEST.md - 성능 테스트 문서
 * @see app/api/data/route.ts - Route Handler 구현 (병렬 실행 가능)
 */
"use server";

const EXPRESS_API_URL = process.env.EXPRESS_API_URL || "http://localhost:3002";

export async function serverActionFetchData(id: number) {
  const response = await fetch(`${EXPRESS_API_URL}/api/data?id=${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
}

