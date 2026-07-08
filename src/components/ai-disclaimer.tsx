import { ShieldCheck } from "lucide-react";

export function AiDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`mt-4 flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground ${className}`}
    >
      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
      <span>
        AI-generated content. Review for accuracy before sharing. Use responsibly and avoid
        submitting sensitive personal data.
      </span>
    </div>
  );
}
