"use client";

import { useEffect, useState } from "react";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    // 개발 환경에서만 MSW 활성화
    if (process.env.NODE_ENV !== "development") {
      setMswReady(true);
      return;
    }

    async function initMSW() {
      if (typeof window !== "undefined") {
        try {
          const { worker } = await import("@/mocks/browser");
          await worker.start({
            onUnhandledRequest: "bypass",
            serviceWorker: {
              url: "/mockServiceWorker.js",
            },
          });
          console.log("✅ MSW worker started successfully");
          setMswReady(true);
        } catch (error) {
          console.error("❌ Failed to start MSW worker:", error);
          setMswReady(true); // 에러가 있어도 앱은 계속 실행
        }
      }
    }

    initMSW();
  }, []);

  // MSW가 준비될 때까지 children을 렌더링하지 않음
  if (!mswReady) {
    return null;
  }

  return <>{children}</>;
}
