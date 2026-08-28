import { QueryClientProvider } from "@/core/tanstack-query/providers/query-client-provider";
import { ChatPanel } from "./chat-panel";

export default function SsePage() {
  return (
    <QueryClientProvider>
      <ChatPanel />
    </QueryClientProvider>
  );
}
