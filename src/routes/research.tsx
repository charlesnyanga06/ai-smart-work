import { createFileRoute } from "@tanstack/react-router";
import { Download, ExternalLink, FileText, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AiDisclaimer } from "@/components/ai-disclaimer";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { researchTopic } from "@/lib/mock-ai";

type Result = Awaited<ReturnType<typeof researchTopic>>;

export const Route = createFileRoute("/research")({
  component: ResearchPage,
});

function ResearchPage() {
  const [topicA, setTopicA] = useState("");
  const [topicB, setTopicB] = useState("");
  const [resultA, setResultA] = useState<Result | null>(null);
  const [resultB, setResultB] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!topicA.trim()) {
      toast.error("Enter a topic to research.");
      return;
    }
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        researchTopic(topicA.trim()),
        topicB.trim() ? researchTopic(topicB.trim()) : Promise.resolve(null as Result | null),
      ]);
      setResultA(a);
      setResultB(b);
    } finally {
      setLoading(false);
    }
  };

  const exportText = (fmt: "txt" | "md") => {
    if (!resultA) return;
    const build = (label: string, r: Result) =>
      [
        `# ${label}`,
        "",
        r.summary,
        "",
        "## Key facts",
        ...r.keyFacts.map((k) => `- ${k}`),
        "",
        "## Sources",
        ...r.sources.map((s) => `- ${s.title} — ${s.url}`),
      ].join("\n");
    const content = [build(topicA, resultA), resultB ? "\n\n" + build(topicB, resultB) : ""].join("");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research.${fmt}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported as .${fmt}`);
  };

  return (
    <div>
      <PageHeader
        title="AI Research Assistant"
        description="Get concise summaries with sources. Compare topics side-by-side."
        icon={<Search className="h-5 w-5" />}
      />

      <Card className="mb-6 shadow-card">
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Topic</Label>
              <Input
                value={topicA}
                onChange={(e) => setTopicA(e.target.value)}
                placeholder="e.g. Zero-trust security"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Compare with (optional)</Label>
              <Input
                value={topicB}
                onChange={(e) => setTopicB(e.target.value)}
                placeholder="e.g. Traditional perimeter security"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={run} disabled={loading} className="gap-1.5">
              <Sparkles className="h-4 w-4" />
              {loading ? "Researching…" : "Research"}
            </Button>
            {resultA ? (
              <>
                <Button variant="outline" onClick={() => exportText("md")} className="gap-1">
                  <Download className="h-4 w-4" /> Export .md
                </Button>
                <Button variant="outline" onClick={() => exportText("txt")} className="gap-1">
                  <FileText className="h-4 w-4" /> Export .txt
                </Button>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {resultA ? (
        <div className={`grid gap-4 ${resultB ? "lg:grid-cols-2" : ""}`}>
          <ResultCard title={topicA} data={resultA} />
          {resultB ? <ResultCard title={topicB} data={resultB} /> : null}
        </div>
      ) : (
        <Card className="shadow-card">
          <CardContent className="grid place-items-center gap-2 p-16 text-center text-muted-foreground">
            <div className="grid h-12 w-12 place-items-center rounded-xl gradient-soft">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm">Your research summary will appear here.</p>
          </CardContent>
        </Card>
      )}

      {resultA ? <AiDisclaimer /> : null}
    </div>
  );
}

function ResultCard({ title, data }: { title: string; data: Result }) {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="capitalize">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{data.summary}</p>
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Key facts
          </div>
          <ul className="space-y-1.5 text-sm">
            {data.keyFacts.map((k, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{k}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Suggested sources
          </div>
          <ul className="space-y-1.5">
            {data.sources.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  {s.title}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
