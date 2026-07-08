import { useEffect, useState } from "react";
import { loadJSON, saveJSON } from "./storage";

export type Priority = "High" | "Medium" | "Low";

export type Task = {
  id: string;
  title: string;
  priority: Priority;
  due: string; // ISO
  done: boolean;
  createdAt: string;
};

const KEY = "aiwph.tasks";

function seed(): Task[] {
  const now = Date.now();
  return [
    {
      id: crypto.randomUUID(),
      title: "Prepare weekly project update",
      priority: "High",
      due: new Date(now + 86400000).toISOString(),
      done: false,
      createdAt: new Date(now).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "Review Q3 analytics dashboard",
      priority: "Medium",
      due: new Date(now + 2 * 86400000).toISOString(),
      done: false,
      createdAt: new Date(now).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "Reply to client onboarding email",
      priority: "High",
      due: new Date(now + 3600000 * 6).toISOString(),
      done: true,
      createdAt: new Date(now - 86400000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "Draft product launch checklist",
      priority: "Low",
      due: new Date(now + 5 * 86400000).toISOString(),
      done: false,
      createdAt: new Date(now).toISOString(),
    },
  ];
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const existing = loadJSON<Task[] | null>(KEY, null);
    if (!existing || existing.length === 0) {
      const s = seed();
      saveJSON(KEY, s);
      setTasks(s);
    } else {
      setTasks(existing);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveJSON(KEY, tasks);
  }, [tasks, hydrated]);

  return {
    tasks,
    hydrated,
    addTask: (t: Omit<Task, "id" | "createdAt">) =>
      setTasks((prev) => [
        { ...t, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
        ...prev,
      ]),
    addMany: (items: Omit<Task, "createdAt">[]) =>
      setTasks((prev) => [
        ...items.map((t) => ({ ...t, createdAt: new Date().toISOString() })),
        ...prev,
      ]),
    toggle: (id: string) =>
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))),
    remove: (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id)),
  };
}
