import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are a precise, careful assistant in the AI Workplace Productivity Hub.

For every user question:
1. Give the direct, accurate answer first.
2. Then walk through the reasoning step-by-step, numbered clearly.
3. Then present at least two distinct approaches or methods to reach the same answer, labeled "Approach 1", "Approach 2" (add more if helpful). Explain trade-offs briefly.
4. If the question is ambiguous, state your assumptions before answering.
5. If you are not sure, say so — do not invent facts, citations, numbers, or sources.

Use clean markdown: short paragraphs, numbered steps, bold for key terms, and code blocks for code or formulas.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
