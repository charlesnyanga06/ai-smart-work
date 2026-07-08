import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  MessageSquare,
  Mic,
  Plus,
  Send,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatReply } from "@/lib/mock-ai";
import { useChatThreads } from "@/lib/chat-store";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat/$threadId")({
  component: ChatThread,
});

function ChatThread() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const {
    threads,
    hydrated,
    createThread,
    deleteThread,
    appendMessage,
    toggleFavorite,
  } = useChatThreads();

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = threads.find((t) => t.id === threadId);

  useEffect(() => {
    if (!hydrated) return;
    if (!active) {
      const target = threads[0]?.id ?? createThread();
      navigate({ to: "/chat/$threadId", params: { threadId: target }, replace: true });
    }
  }, [hydrated, active, threads, createThread, navigate]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, sending]);

  const send = async () => {
    if (!input.trim() || !active) return;
    const text = input.trim();
    setInput("");
    appendMessage(active.id, { role: "user", content: text });
    setSending(true);
    try {
      const reply = await chatReply(text);
      appendMessage(active.id, { role: "assistant", content: reply });
    } finally {
      setSending(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const startNew = () => {
    const id = createThread();
    navigate({ to: "/chat/$threadId", params: { threadId: id } });
  };

  const remove = (id: string) => {
    deleteThread(id);
    if (id === threadId) {
      const remaining = threads.filter((t) => t.id !== id);
      const next = remaining[0]?.id;
      if (next) navigate({ to: "/chat/$threadId", params: { threadId: next }, replace: true });
    }
  };

  const voiceInput = () => {
    const w = window as unknown as {
      webkitSpeechRecognition?: new () => any;
      SpeechRecognition?: new () => any;
    };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) {
      toast.info("Voice input isn't supported in this browser.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.onresult = (e: any) => setInput((prev) => (prev ? prev + " " : "") + e.results[0][0].transcript);
    rec.onerror = () => toast.error("Voice input failed. Try again.");
    rec.start();
    toast("Listening…");
  };

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-4 lg:grid-cols-[280px_1fr]">
      {/* Threads sidebar */}
      <Card className="hidden shadow-card lg:flex lg:flex-col">
        <div className="flex items-center justify-between p-3">
          <div className="text-sm font-semibold">Conversations</div>
          <Button size="sm" variant="ghost" onClick={startNew} className="gap-1">
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>
        <div className="border-t" />
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {threads.map((t) => {
              const isActive = t.id === threadId;
              return (
                <div
                  key={t.id}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                    isActive ? "bg-secondary" : "hover:bg-muted/60",
                  )}
                >
                  <Link
                    to="/chat/$threadId"
                    params={{ threadId: t.id }}
                    className="min-w-0 flex-1"
                  >
                    <div className="truncate font-medium">
                      {t.title || "New conversation"}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {t.messages.length} messages ·{" "}
                      {formatDistanceToNow(new Date(t.updatedAt), { addSuffix: true })}
                    </div>
                  </Link>
                  <button
                    onClick={() => toggleFavorite(t.id)}
                    className="rounded p-1 opacity-60 hover:opacity-100"
                    aria-label="Favorite"
                  >
                    <Star
                      className={cn(
                        "h-3.5 w-3.5",
                        t.favorite ? "fill-warning text-warning" : "text-muted-foreground",
                      )}
                    />
                  </button>
                  <button
                    onClick={() => remove(t.id)}
                    className="rounded p-1 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat */}
      <Card className="flex flex-col shadow-card">
        <div className="flex items-center justify-between border-b p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <MessageSquare className="h-4 w-4 text-primary" />
            {active?.title || "AI Chat Assistant"}
          </div>
          <Button size="sm" variant="ghost" onClick={startNew} className="gap-1 lg:hidden">
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {!active || active.messages.length === 0 ? (
              <div className="grid place-items-center py-10 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-brand shadow-elegant">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">How can I help you today?</h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Ask about workplace questions, brainstorm ideas, draft messages, or plan your
                  week.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {[
                    "Suggest an agenda for a team sync",
                    "Help me prioritize this week",
                    "Draft a concise status update",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="rounded-full border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground transition hover:bg-secondary/70"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              active.messages.map((m) => (
                <div key={m.id} className={cn("flex gap-3", m.role === "user" && "justify-end")}>
                  {m.role === "assistant" ? (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg gradient-brand text-white">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  ) : null}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                      m.role === "user"
                        ? "gradient-brand text-white shadow-elegant"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {sending ? (
              <div className="flex gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg gradient-brand text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl bg-secondary px-4 py-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:240ms]" />
                </div>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-3">
          <div className="mx-auto flex max-w-3xl flex-col gap-2">
            <div className="flex items-end gap-2 rounded-xl border bg-background p-2 shadow-card focus-within:ring-2 focus-within:ring-ring">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Ask anything…"
                className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button size="icon" variant="ghost" onClick={voiceInput} aria-label="Voice input">
                <Mic className="h-4 w-4" />
              </Button>
              <Button size="icon" onClick={send} disabled={!input.trim() || sending}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <AiDisclaimer className="mt-0" />
          </div>
        </div>
      </Card>
    </div>
  );
}


