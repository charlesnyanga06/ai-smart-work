import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  ListChecks,
  Mail,
  MessageSquare,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProfile } from "@/lib/profile-store";
import { useTasks } from "@/lib/tasks-store";
import { format, formatDistanceToNow, isPast } from "date-fns";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const quickActions = [
  {
    title: "Draft an email",
    description: "Turn a prompt into a polished email in seconds.",
    icon: Mail,
    url: "/email",
    color: "from-blue-500/15 to-blue-500/5 text-blue-600 dark:text-blue-400",
  },
  {
    title: "Summarize meeting",
    description: "Extract action items and deadlines from notes.",
    icon: FileText,
    url: "/notes",
    color: "from-violet-500/15 to-violet-500/5 text-violet-600 dark:text-violet-400",
  },
  {
    title: "Plan your day",
    description: "Turn an idea into a prioritized task list.",
    icon: ListChecks,
    url: "/tasks",
    color: "from-indigo-500/15 to-indigo-500/5 text-indigo-600 dark:text-indigo-400",
  },
  {
    title: "Research a topic",
    description: "Concise summaries with sources you can trust.",
    icon: Search,
    url: "/research",
    color: "from-fuchsia-500/15 to-fuchsia-500/5 text-fuchsia-600 dark:text-fuchsia-400",
  },
] as const;

const recentActivity = [
  { icon: Mail, label: "Sent follow-up email to design team", time: "12m ago" },
  { icon: FileText, label: "Summarized Q3 planning meeting notes", time: "1h ago" },
  { icon: ListChecks, label: "Completed 4 tasks in Launch Prep", time: "2h ago" },
  { icon: Search, label: "Researched competitive pricing models", time: "Yesterday" },
];

const tips = [
  "Use tone selectors in the email generator to match your audience.",
  "Paste raw meeting notes — the summarizer highlights owners and deadlines.",
  "Star your favorite prompts to reuse them across projects.",
];

function Dashboard() {
  const { tasks } = useTasks();
  const profile = useProfile();
  const upcoming = tasks
    .filter((t) => !t.done)
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
    .slice(0, 4);
  const completed = tasks.filter((t) => t.done).length;
  const total = tasks.length || 1;
  const completionRate = Math.round((completed / total) * 100);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="relative overflow-hidden border-0 shadow-elegant">
        <div className="absolute inset-0 gradient-brand opacity-95" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <CardContent className="relative z-10 flex flex-col gap-4 p-6 text-white sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <Badge className="mb-3 border-0 bg-white/15 text-white backdrop-blur">
              <Sparkles className="mr-1 h-3 w-3" /> Your AI workspace
            </Badge>
            <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
              Welcome back, {profile.name} 👋
            </h2>
            <p className="mt-2 text-sm text-white/80 sm:text-base">
              You have {upcoming.length} tasks coming up and {completed} completed this week.
              Ready to make today productive?
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Link to="/chat">
                <MessageSquare className="mr-1" /> Ask AI
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
            >
              <Link to="/tasks">
                Plan my day <ArrowRight />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tasks completed" value={String(completed)} hint="this week" icon={CheckCircle2} tone="success" />
        <StatCard label="Upcoming" value={String(upcoming.length)} hint="in your queue" icon={Clock} tone="primary" />
        <StatCard label="Completion rate" value={`${completionRate}%`} hint="last 7 days" icon={TrendingUp} tone="accent" />
        <StatCard label="Time saved" value="4.2h" hint="with AI this week" icon={Sparkles} tone="warning" />
      </div>

      {/* Quick actions */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <h3 className="text-lg font-semibold">Quick actions</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((a) => (
            <Link key={a.url} to={a.url} className="group">
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-elegant shadow-card">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${a.color}`}>
                    <a.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{a.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{a.description}</div>
                  </div>
                  <div className="mt-2 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Upcoming tasks */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Upcoming tasks</CardTitle>
              <CardDescription>What needs your attention soon</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/tasks">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">You're all caught up! 🎉</p>
            ) : (
              upcoming.map((t) => {
                const dueDate = new Date(t.due);
                const overdue = isPast(dueDate) && !t.done;
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        t.priority === "High"
                          ? "bg-destructive"
                          : t.priority === "Medium"
                            ? "bg-warning"
                            : "bg-muted-foreground"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{t.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {overdue ? (
                          <span className="text-destructive">Overdue · </span>
                        ) : null}
                        Due {format(dueDate, "MMM d")} · {formatDistanceToNow(dueDate, { addSuffix: true })}
                      </div>
                    </div>
                    <Badge variant="secondary" className="hidden sm:inline-flex">
                      {t.priority}
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Productivity overview */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Productivity overview</CardTitle>
            <CardDescription>Weekly progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Task completion</span>
                <span className="font-semibold">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Focus goal</span>
                <span className="font-semibold">72%</span>
              </div>
              <Progress value={72} className="h-2" />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">AI usage</span>
                <span className="font-semibold">48%</span>
              </div>
              <Progress value={48} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>What you've been up to</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentActivity.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                    <r.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{r.label}</div>
                    <div className="text-xs text-muted-foreground">{r.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> AI tips of the day
            </CardTitle>
            <CardDescription>Get more from your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {tips.map((t, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof CheckCircle2;
  tone: "primary" | "accent" | "success" | "warning";
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground dark:text-warning",
  };
  return (
    <Card className="shadow-card">
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="mt-1 text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{hint}</div>
        </div>
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
