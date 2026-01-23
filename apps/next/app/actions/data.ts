"use server";

export async function serverActionFetchData(id: number) {
  // 시뮬레이션을 위한 약간의 지연
  await new Promise((resolve) => setTimeout(resolve, 10));
  
  return {
    id,
    data: `Server Action Data ${id}`,
    timestamp: Date.now(),
  };
}
