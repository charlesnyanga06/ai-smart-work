// Deterministic mock AI generators. Simulated latency for realistic UX.
export function delay(ms = 900) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateEmail(prompt: string, tone: string) {
  await delay();
  const greetings: Record<string, string> = {
    Formal: "Dear Recipient,",
    Casual: "Hey there,",
    Friendly: "Hi friend,",
    "Follow-up": "Hi again,",
  };
  const closings: Record<string, string> = {
    Formal: "Kind regards,\n[Your Name]",
    Casual: "Cheers,\n[Your Name]",
    Friendly: "Talk soon,\n[Your Name]",
    "Follow-up": "Looking forward to your reply,\n[Your Name]",
  };
  const g = greetings[tone] ?? greetings.Formal;
  const c = closings[tone] ?? closings.Formal;
  return `${g}\n\nI hope this message finds you well. I am reaching out regarding: "${prompt}".\n\nBased on our recent conversations, I wanted to share a concise update and outline the next steps so we can align quickly. Please let me know your availability this week for a brief follow-up — I'd love to hear your thoughts and adjust the plan accordingly.\n\nA few key points:\n• Context: ${prompt}\n• Proposed next step: Schedule a 20-minute sync\n• Timeline: This or next week\n\nThank you for your time and consideration.\n\n${c}`;
}

export async function summarizeMeeting(notes: string) {
  await delay(1100);
  const first = notes.split(/[.\n]/).find((s) => s.trim().length > 0)?.trim() || "the meeting";
  return {
    summary: `The team discussed ${first.toLowerCase()} and aligned on priorities for the upcoming sprint. Key stakeholders reviewed progress, surfaced blockers, and agreed on a plan to move forward this week.`,
    keyPoints: [
      "Reviewed current project status and blockers",
      "Aligned on quarterly goals and priorities",
      "Discussed resource allocation for upcoming work",
      "Agreed on communication cadence and next check-in",
    ],
    actionItems: [
      { task: "Draft the updated project brief", owner: "Alex", due: "Friday" },
      { task: "Share design mockups with stakeholders", owner: "Priya", due: "Wednesday" },
      { task: "Schedule follow-up review meeting", owner: "Jordan", due: "Next Monday" },
    ],
    deadlines: [
      { label: "Draft due", date: "Friday" },
      { label: "Design review", date: "Wednesday" },
      { label: "Follow-up sync", date: "Next Monday" },
    ],
  };
}

export async function planTasks(idea: string) {
  await delay(900);
  const priorities: Array<"High" | "Medium" | "Low"> = ["High", "High", "Medium", "Medium", "Low"];
  const templates = [
    "Define scope and success criteria",
    "Research and gather references",
    "Draft first version and outline",
    "Review with team and iterate",
    "Finalize and publish",
  ];
  return templates.map((t, i) => ({
    id: crypto.randomUUID(),
    title: `${t} for "${idea}"`,
    priority: priorities[i],
    due: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
    done: false,
  }));
}

export async function researchTopic(topic: string) {
  await delay(1000);
  return {
    summary: `${topic} is an evolving area with active research and practical applications. Recent developments emphasize accessibility, scalability, and responsible use, while established best practices continue to shape how teams adopt it. Understanding the fundamentals, current trends, and common pitfalls provides a strong foundation for decision-making.`,
    keyFacts: [
      `${topic} has seen significant growth over the past 12 months.`,
      "Leading organizations invest in structured frameworks and governance.",
      "Community resources and open documentation lower the barrier to entry.",
      "Long-term success depends on iteration, measurement, and feedback.",
    ],
    sources: [
      { title: "Comprehensive overview article", url: "https://example.com/overview" },
      { title: "Peer-reviewed research paper", url: "https://example.com/research" },
      { title: "Industry report and benchmarks", url: "https://example.com/report" },
      { title: "Official documentation", url: "https://example.com/docs" },
    ],
  };
}

export async function chatReply(message: string) {
  await delay(700);
  return `Great question about "${message}". Here's a thoughtful take:\n\n• Start by clarifying the goal so the outcome is easy to measure.\n• Break the problem into two or three concrete steps you can act on today.\n• Reflect at the end of the week to see what worked and adjust.\n\nIf you'd like, share more context and I can tailor a specific plan.`;
}
