import { createFileRoute } from "@tanstack/react-router";
import { Copy, Mail, RotateCw, Sparkles, Star, StarOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AiDisclaimer } from "@/components/ai-disclaimer";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "@/lib/mock-ai";
import { loadJSON, saveJSON } from "@/lib/storage";

const tones = ["Formal", "Casual", "Friendly", "Follow-up"] as const;
type Tone = (typeof tones)[number];

const FAV_KEY = "aiwph.email.favorites";

export const Route = createFileRoute("/email")({
  component: EmailPage,
});

function EmailPage() {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState<Tone>("Formal");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(loadJSON<string[]>(FAV_KEY, []));
  }, []);

  const run = async () => {
    if (!prompt.trim()) {
      toast.error("Enter a prompt describing your email.");
      return;
    }
    setLoading(true);
    try {
      const text = await generateEmail(prompt.trim(), tone);
      setOutput(text);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const toggleFav = () => {
    const next = favorites.includes(prompt)
      ? favorites.filter((f) => f !== prompt)
      : [prompt, ...favorites].slice(0, 20);
    setFavorites(next);
    saveJSON(FAV_KEY, next);
  };

  const isFav = favorites.includes(prompt);

  return (
    <div>
      <PageHeader
        title="Email Generator"
        description="Turn a short prompt into a polished, ready-to-send email."
        icon={<Mail className="h-5 w-5" />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardContent className="space-y-4 p-5">
            <div>
              <Label className="mb-2 block">What is this email about?</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Follow up with a client about the design revisions and propose a call next week."
                rows={5}
              />
            </div>

            <div>
              <Label className="mb-2 block">Tone</Label>
              <div className="flex flex-wrap gap-2">
                {tones.map((t) => (
                  <Button
                    key={t}
                    variant={tone === t ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTone(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={run} disabled={loading} className="gap-1.5">
                <Sparkles className="h-4 w-4" />
                {loading ? "Generating…" : "Generate email"}
              </Button>
              {prompt ? (
                <Button variant="outline" onClick={toggleFav} className="gap-1.5">
                  {isFav ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                  {isFav ? "Unfavorite" : "Save prompt"}
                </Button>
              ) : null}
            </div>

            {favorites.length > 0 ? (
              <div className="pt-2">
                <Label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">
                  Favorite prompts
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {favorites.map((f) => (
                    <button
                      key={f}
                      onClick={() => setPrompt(f)}
                      className="rounded-full border bg-secondary px-3 py-1 text-xs text-secondary-foreground transition hover:bg-secondary/70"
                    >
                      {f.length > 40 ? f.slice(0, 40) + "…" : f}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <Label>Generated email</Label>
              {output ? (
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={copy}>
                    <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button size="sm" variant="ghost" onClick={run} disabled={loading}>
                    <RotateCw className="mr-1 h-3.5 w-3.5" /> Regenerate
                  </Button>
                </div>
              ) : null}
            </div>
            <Textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              placeholder="Your generated email will appear here. You can edit it before copying."
              rows={16}
              className="font-sans text-sm"
            />
            {output ? <AiDisclaimer /> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
