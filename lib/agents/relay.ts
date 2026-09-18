import { db } from "@/lib/db";

// The customer-facing side of the agent team: as a project moves through the
// pipeline, the agent doing the work posts a plain-language note on the
// customer's private status page. Posting is best-effort; a failure here must
// never stop production, so errors are logged and swallowed.

export type RelayPhase =
  | "PAID"
  | "RESEARCH"
  | "STRATEGY"
  | "CONCEPT"
  | "GENERATION"
  | "BUILD"
  | "AUTOMATION"
  | "QA"
  | "REVISION"
  | "PERCEPTION"
  | "DELIVERED"
  | "EXCEPTION";

const NOTES: Record<RelayPhase, { agent: string; message: string }> = {
  PAID: {
    agent: "Coordinator Agent",
    message:
      "Your order is in and I've briefed the team. Each step will show up right here as it happens, and you can message me on this page any time.",
  },
  RESEARCH: {
    agent: "Research Agent",
    message: "I'm studying your market and audience so the build starts from real information, not guesses.",
  },
  STRATEGY: {
    agent: "Strategy Agent",
    message: "Research is done. I'm turning it into a clear plan: your offer, your message, and what the build needs to achieve.",
  },
  CONCEPT: {
    agent: "Creative Director Agent",
    message: "The plan is set. Our creative and design agents are shaping the look, the feel, and the customer journey.",
  },
  GENERATION: {
    agent: "Content Agent",
    message: "Design direction is locked. I'm writing your copy and briefing the images and video.",
  },
  BUILD: {
    agent: "Build Agent",
    message: "Content is ready. Your build is being assembled now.",
  },
  AUTOMATION: {
    agent: "Automation Agent",
    message: "The build is assembled. I'm setting up the search, marketing, and tracking around it.",
  },
  QA: {
    agent: "QA Agent",
    message: "Everything is built. I'm now checking that it all works properly before you ever see it.",
  },
  REVISION: {
    agent: "QA Agent",
    message: "I found something to polish, so it's going back for a fix. I'll re-check it once it's done.",
  },
  PERCEPTION: {
    agent: "Review Agent",
    message: "It works. A second review now checks that it looks and feels premium and is clear to your customers.",
  },
  DELIVERED: {
    agent: "Coordinator Agent",
    message:
      "Your project passed every check and has been delivered. Look for the access details in your email and portal, and tell me here if you'd like anything adjusted.",
  },
  EXCEPTION: {
    agent: "Coordinator Agent",
    message: "One step needs a manual check from our team. They've been notified and will update you on this page.",
  },
};

export async function postAgentUpdate(projectId: string, agentName: string, message: string) {
  try {
    await db.projectUpdate.create({ data: { projectId, message, authorName: agentName, notifyEmail: false } });
  } catch (err) {
    console.error(`relay: could not post update for project ${projectId}`, err);
  }
}

/** Posts the standard note for a pipeline phase, from the agent responsible for it. */
export async function announce(projectId: string, phase: RelayPhase) {
  const note = NOTES[phase];
  await postAgentUpdate(projectId, note.agent, note.message);
}
