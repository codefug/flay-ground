import type { Preview } from "@storybook/nextjs-vite";
import { initialize, mswLoader } from "msw-storybook-addon";
import React from "react";
import { handlers } from "../mocks/handlers";
import { TRPCReactProvider } from "../trpc/client";

// NEXT_PUBLIC_MSW 환경 변수로 MSW 활성화 여부 제어
// Storybook에서는 기본적으로 MSW를 활성화 (환경 변수가 명시적으로 false가 아닌 경우)
const shouldUseMSW = process.env.NEXT_PUBLIC_MSW !== "false";

// MSW 초기화
if (shouldUseMSW) {
  initialize({
    onUnhandledRequest: "bypass",
  });
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // 전역 MSW 핸들러 설정 (MSW가 활성화된 경우에만)
    ...(shouldUseMSW && {
      msw: {
        handlers,
      },
    }),
  },
  decorators: [
    (Story) => (
      <TRPCReactProvider>
        <Story />
      </TRPCReactProvider>
    ),
  ],
  loaders: shouldUseMSW ? [mswLoader] : [],
};

export default preview;
