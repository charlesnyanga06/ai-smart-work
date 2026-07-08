import { useEffect, useState } from "react";
import { loadJSON, saveJSON } from "./storage";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type ChatThread = {
  id: string;
  title: string;
  favorite: boolean;
  messages: ChatMessage[];
  updatedAt: string;
};

const KEY = "aiwph.chat.threads";

function seedThread(): ChatThread {
  return {
    id: crypto.randomUUID(),
    title: "New conversation",
    favorite: false,
    messages: [],
    updatedAt: new Date().toISOString(),
  };
}

export function useChatThreads() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const existing = loadJSON<ChatThread[] | null>(KEY, null);
    if (!existing || existing.length === 0) {
      const s = [seedThread()];
      saveJSON(KEY, s);
      setThreads(s);
    } else {
      setThreads(existing);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveJSON(KEY, threads);
  }, [threads, hydrated]);

  return {
    threads,
    hydrated,
    createThread: () => {
      const t = seedThread();
      setThreads((prev) => [t, ...prev]);
      return t.id;
    },
    deleteThread: (id: string) =>
      setThreads((prev) => {
        const filtered = prev.filter((t) => t.id !== id);
        return filtered.length ? filtered : [seedThread()];
      }),
    toggleFavorite: (id: string) =>
      setThreads((prev) =>
        prev.map((t) => (t.id === id ? { ...t, favorite: !t.favorite } : t)),
      ),
    renameThread: (id: string, title: string) =>
      setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t))),
    appendMessage: (id: string, msg: Omit<ChatMessage, "id" | "createdAt">) =>
      setThreads((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                title:
                  t.messages.length === 0 && msg.role === "user"
                    ? msg.content.slice(0, 40)
                    : t.title,
                messages: [
                  ...t.messages,
                  {
                    ...msg,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                  },
                ],
                updatedAt: new Date().toISOString(),
              }
            : t,
        ),
      ),
  };
}
