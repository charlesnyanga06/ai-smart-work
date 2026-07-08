import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ListChecks, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AiDisclaimer } from "@/components/ai-disclaimer";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { planTasks } from "@/lib/mock-ai";
import { useTasks, type Priority } from "@/lib/tasks-store";
import { format, isPast } from "date-fns";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

function TasksPage() {
  const { tasks, addTask, addMany, toggle, remove } = useTasks();
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [due, setDue] = useState<string>(new Date(Date.now() + 86400000).toISOString().slice(0, 10));

  const runPlan = async () => {
    if (!idea.trim()) {
      toast.error("Describe your goal or project.");
      return;
    }
    setLoading(true);
    try {
      const generated = await planTasks(idea.trim());
      addMany(generated);
      setIdea("");
      toast.success(`Added ${generated.length} tasks`);
    } finally {
      setLoading(false);
    }
  };

  const addManual = () => {
    if (!title.trim()) {
      toast.error("Enter a task title.");
      return;
    }
    addTask({
      title: title.trim(),
      priority,
      due: new Date(due).toISOString(),
      done: false,
    });
    setTitle("");
    toast.success("Task added");
  };

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length || 1;
  const pct = Math.round((done / total) * 100);

  const buckets = {
    High: tasks.filter((t) => t.priority === "High"),
    Medium: tasks.filter((t) => t.priority === "Medium"),
    Low: tasks.filter((t) => t.priority === "Low"),
  };

  return (
    <div>
      <PageHeader
        title="AI Task Planner"
        description="Turn ideas into prioritized tasks. Track progress at a glance."
        icon={<ListChecks className="h-5 w-5" />}
      />

      {/* Productivity dashboard */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Completed
            </div>
            <div className="mt-1 text-2xl font-bold">
              {done} <span className="text-base font-medium text-muted-foreground">/ {tasks.length}</span>
            </div>
            <Progress value={pct} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              High priority
            </div>
            <div className="mt-1 text-2xl font-bold">{buckets.High.filter((t) => !t.done).length}</div>
            <div className="text-xs text-muted-foreground">open tasks</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Overdue
            </div>
            <div className="mt-1 text-2xl font-bold text-destructive">
              {tasks.filter((t) => !t.done && isPast(new Date(t.due))).length}
            </div>
            <div className="text-xs text-muted-foreground">need attention</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Plan with AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. Launch a new landing page next week."
              rows={4}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button onClick={runPlan} disabled={loading} className="w-full gap-1.5">
              <Sparkles className="h-4 w-4" />
              {loading ? "Planning…" : "Generate tasks"}
            </Button>

            <div className="my-4 h-px bg-border" />

            <div className="space-y-2">
              <Label>Add manually</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
              />
              <div className="grid grid-cols-2 gap-2">
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
              </div>
              <Button variant="outline" onClick={addManual} className="w-full gap-1">
                <Plus className="h-4 w-4" /> Add task
              </Button>
            </div>
            <AiDisclaimer />
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Your tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {(["High", "Medium", "Low"] as const).map((p) => (
              <div key={p}>
                <div className="mb-2 flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      p === "High"
                        ? "bg-destructive"
                        : p === "Medium"
                          ? "bg-warning"
                          : "bg-muted-foreground"
                    }`}
                  />
                  <div className="text-sm font-semibold">{p} priority</div>
                  <Badge variant="secondary" className="ml-auto">
                    {buckets[p].length}
                  </Badge>
                </div>
                {buckets[p].length === 0 ? (
                  <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
                    No {p.toLowerCase()} priority tasks
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {buckets[p].map((t) => {
                      const dueDate = new Date(t.due);
                      const overdue = isPast(dueDate) && !t.done;
                      return (
                        <li
                          key={t.id}
                          className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                        >
                          <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} />
                          <div className="min-w-0 flex-1">
                            <div
                              className={`truncate text-sm ${
                                t.done ? "text-muted-foreground line-through" : "font-medium"
                              }`}
                            >
                              {t.title}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CalendarDays className="h-3 w-3" />
                              <span className={overdue ? "text-destructive" : ""}>
                                {overdue ? "Overdue · " : ""}
                                {format(dueDate, "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={() => remove(t.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

