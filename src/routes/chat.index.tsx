import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { useChatThreads } from "@/lib/chat-store";

export const Route = createFileRoute("/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const { threads, hydrated, createThread } = useChatThreads();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    const target = threads[0]?.id ?? createThread();
    navigate({ to: "/chat/$threadId", params: { threadId: target }, replace: true });
  }, [hydrated, threads, createThread, navigate]);

  return (
    <div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">
      Loading chat…
    </div>
  );
}
