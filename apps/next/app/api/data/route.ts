/**
 * Route Handler - 데이터 페칭
 *
 * ✓ 병렬 실행 가능: HTTP 요청이므로 Promise.all로 병렬 처리 가능
 * 성능 최적화가 필요한 경우 Route Handler 사용 권장
 *
 * @see PERFORMANCE_TEST.md - 성능 테스트 문서
 * @see app/actions/data.ts - Server Action 구현 (순차 실행)
 */
import { NextResponse } from "next/server";

const EXPRESS_API_URL = process.env.EXPRESS_API_URL || "http://localhost:3002";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const response = await fetch(`${EXPRESS_API_URL}/api/data?id=${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from Express" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

