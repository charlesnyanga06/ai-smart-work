import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Copy, FileText, ListChecks, Sparkles, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AiDisclaimer } from "@/components/ai-disclaimer";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { summarizeMeeting } from "@/lib/mock-ai";

type Result = Awaited<ReturnType<typeof summarizeMeeting>>;

export const Route = createFileRoute("/notes")({
  component: NotesPage,
});

function NotesPage() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const run = async () => {
    if (!notes.trim()) {
      toast.error("Paste your meeting notes to summarize.");
      return;
    }
    setLoading(true);
    try {
      const r = await summarizeMeeting(notes.trim());
      setResult(r);
    } finally {
      setLoading(false);
    }
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const isText = f.type.startsWith("text/") || /\.(txt|md)$/i.test(f.name);
    if (!isText) {
      toast.info(
        "For this demo, upload plain text or markdown files. PDF/DOCX support is coming soon.",
      );
      return;
    }
    const text = await f.text();
    setNotes(text);
    toast.success(`Loaded ${f.name}`);
  };

  const copyAll = async () => {
    if (!result) return;
    const text = [
      "Summary:",
      result.summary,
      "",
      "Key points:",
      ...result.keyPoints.map((k) => `• ${k}`),
      "",
      "Action items:",
      ...result.actionItems.map((a) => `• ${a.task} — ${a.owner} (${a.due})`),
    ].join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Copied summary");
  };

  return (
    <div>
      <PageHeader
        title="AI Meeting Notes"
        description="Paste raw notes and get a clean summary with owners and deadlines."
        icon={<FileText className="h-5 w-5" />}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="shadow-card lg:col-span-2">
          <CardContent className="space-y-4 p-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Meeting notes</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fileRef.current?.click()}
                  className="gap-1"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload
                </Button>
                <input
                  type="file"
                  ref={fileRef}
                  className="hidden"
                  accept=".txt,.md,text/*"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste your raw meeting notes here…"
                rows={16}
              />
            </div>
            <Button onClick={run} disabled={loading} className="gap-1.5">
              <Sparkles className="h-4 w-4" />
              {loading ? "Summarizing…" : "Summarize meeting"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-3">
          {!result ? (
            <Card className="shadow-card">
              <CardContent className="grid place-items-center gap-2 p-16 text-center text-muted-foreground">
                <div className="grid h-12 w-12 place-items-center rounded-xl gradient-soft">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm">
                  Your summary, action items, and deadlines will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="shadow-card">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle>Summary</CardTitle>
                  <Button size="sm" variant="ghost" onClick={copyAll}>
                    <Copy className="mr-1 h-3.5 w-3.5" /> Copy all
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{result.summary}</p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-primary" /> Key points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {result.keyPoints.map((k, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{k}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-accent" /> Action items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.actionItems.map((a, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{a.task}</div>
                        <div className="text-xs text-muted-foreground">Owner: {a.owner}</div>
                      </div>
                      <Badge variant="secondary">{a.due}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-warning" /> Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {result.deadlines.map((d, i) => (
                    <Badge key={i} variant="outline" className="gap-1 py-1">
                      {d.label} · <span className="font-semibold">{d.date}</span>
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              <AiDisclaimer />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
