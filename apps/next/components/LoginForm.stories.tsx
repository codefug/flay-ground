import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { trpcMsw } from "@/mocks/handlers";
import { LoginForm } from "./LoginForm";

const meta = {
  title: "Components/LoginForm",
  component: LoginForm,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 상태 - MSW 핸들러가 자동으로 적용됨
export const Default: Story = {};

// 로그인 성공 상태
export const LoginSuccess: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcMsw.hello.query(() => ({
          message: "Hello from Mocked API!",
          data: {
            framework: "Express (Storybook Mock)",
            version: "4.x",
          },
        })),
        trpcMsw.login.mutation(({ input }) => ({
          accessToken: `storybook-access-token-${input.userId}`,
          refreshToken: `storybook-refresh-token-${input.userId}`,
          expiresIn: 900,
        })),
      ],
    },
  },
};

// 로그인 에러 상태
export const LoginError: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcMsw.hello.query(() => ({
          message: "Hello from Mocked API!",
          data: {
            framework: "Express (Storybook Mock)",
            version: "4.x",
          },
        })),
        trpcMsw.login.mutation(() => {
          throw new Error("Authentication failed: Invalid credentials");
        }),
      ],
    },
  },
};

// 로딩 상태
export const LoginLoading: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcMsw.hello.query(() => ({
          message: "Hello from Mocked API!",
          data: {
            framework: "Express (Storybook Mock)",
            version: "4.x",
          },
        })),
        trpcMsw.login.mutation(async ({ input }) => {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          return {
            accessToken: `delayed-token-${input.userId}`,
            refreshToken: `delayed-refresh-${input.userId}`,
            expiresIn: 900,
          };
        }),
      ],
    },
  },
};
