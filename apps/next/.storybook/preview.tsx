import type { Preview } from "@storybook/nextjs-vite";
import { initialize, mswLoader } from "msw-storybook-addon";
import { TRPCReactProvider } from "../trpc/client";

// MSW 초기화
initialize({
  onUnhandledRequest: "bypass",
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <TRPCReactProvider>
        <Story />
      </TRPCReactProvider>
    ),
  ],
  loaders: [mswLoader],
};

export default preview;
