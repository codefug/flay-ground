/**
 * Server Action - IP 주소 조회
 *
 * Server Actions에서는 headers() 함수를 사용하여
 * 요청 헤더에 접근할 수 있습니다.
 */
"use server";

import { headers } from "next/headers";

const EXPRESS_API_URL = process.env.EXPRESS_API_URL || "http://localhost:3002";

/**
 * Server Action에서 직접 IP 주소를 가져옵니다
 * Next.js의 headers() 함수를 사용하여 요청 헤더에 접근
 */
export async function getIpFromHeaders() {
  const headersList = await headers();

  const ip = headersList.get("x-forwarded-for") ||
             headersList.get("x-real-ip") ||
             "IP not available";

  return {
    ip,
    forwarded: headersList.get("x-forwarded-for"),
    realIp: headersList.get("x-real-ip"),
    userAgent: headersList.get("user-agent"),
  };
}

/**
 * Express API를 통해 IP 주소를 가져옵니다
 * Server Action에서 Express 백엔드 API를 호출
 */
export async function getIpFromExpress() {
  try {
    const response = await fetch(`${EXPRESS_API_URL}/api/ip`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch IP from Express");
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      `Failed to fetch IP: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
