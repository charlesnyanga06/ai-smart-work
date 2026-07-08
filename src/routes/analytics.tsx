import { createFileRoute } from "@tanstack/react-router";
import { Activity, BarChart3, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/lib/tasks-store";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

const weekly = [
  { day: "Mon", tasks: 6, aiUses: 12 },
  { day: "Tue", tasks: 8, aiUses: 14 },
  { day: "Wed", tasks: 5, aiUses: 9 },
  { day: "Thu", tasks: 9, aiUses: 18 },
  { day: "Fri", tasks: 11, aiUses: 22 },
  { day: "Sat", tasks: 3, aiUses: 5 },
  { day: "Sun", tasks: 2, aiUses: 4 },
];

const timeSaved = [
  { week: "W1", hours: 2.4 },
  { week: "W2", hours: 3.1 },
  { week: "W3", hours: 3.8 },
  { week: "W4", hours: 4.2 },
];

function AnalyticsPage() {
  const { tasks } = useTasks();
  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length || 1;
  const pct = Math.round((done / total) * 100);

  return (
    <div>
      <PageHeader
        title="Productivity Analytics"
        description="Track how much you get done and where AI helps most."
        icon={<BarChart3 className="h-5 w-5" />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Completed tasks" value={String(done)} hint="all time" icon={CheckCircle2} tone="success" />
        <Stat label="Completion rate" value={`${pct}%`} hint="this week" icon={TrendingUp} tone="primary" />
        <Stat label="Time saved" value="4.2h" hint="this week" icon={Clock} tone="accent" />
        <Stat label="AI interactions" value="84" hint="last 7 days" icon={Activity} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Weekly activity</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="tasks" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="aiUses" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Time saved with AI</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSaved}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  dot={{ fill: "var(--color-primary)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 shadow-card">
        <CardHeader>
          <CardTitle>Recent projects</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[
            { name: "Launch prep", progress: 78, updates: "12 updates" },
            { name: "Q3 planning", progress: 45, updates: "6 updates" },
            { name: "Website refresh", progress: 92, updates: "23 updates" },
          ].map((p) => (
            <div key={p.name} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{p.name}</div>
                <span className="text-sm text-muted-foreground">{p.progress}%</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full gradient-brand" style={{ width: `${p.progress}%` }} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{p.updates}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
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
    warning: "bg-warning/15 text-warning dark:text-warning",
  };
  return (
    <Card className="shadow-card">
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="mt-1 text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{hint}</div>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
