import { createFileRoute } from "@tanstack/react-router";
import { streamText, type ModelMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are a precise, careful assistant in the AI Workplace Productivity Hub.

For every user question:
1. Give the direct, accurate answer first (concise, one short paragraph).
2. Then walk through the reasoning step-by-step, numbered clearly under a "Step-by-step" heading.
3. Then present at least two distinct methods to reach the same answer under an "Alternative approaches" heading, labeled "Approach 1", "Approach 2" (add more if helpful). Briefly note trade-offs.
4. If the question is ambiguous, state your assumptions before answering.
5. If you're not sure, say so — do not invent facts, citations, numbers, or sources.

Use clean markdown: short paragraphs, numbered steps, **bold** for key terms, and code blocks for code or formulas.`;

type ChatBody = {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const modelMessages: ModelMessage[] = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: modelMessages,
        });

        return result.toTextStreamResponse();
      },
    },
  },
});

