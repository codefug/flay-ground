import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // 시뮬레이션을 위한 약간의 지연
  await new Promise((resolve) => setTimeout(resolve, 10));

  return NextResponse.json({
    id: Number(id),
    data: `Route Handler Data ${id}`,
    timestamp: Date.now(),
  });
}
