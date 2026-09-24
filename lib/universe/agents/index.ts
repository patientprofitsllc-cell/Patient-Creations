import { divide } from "@/lib/universe/agents/divider";
import { gather } from "@/lib/universe/agents/gatherer";
import { organize } from "@/lib/universe/agents/organizer";
import { perspectives } from "@/lib/universe/agents/perspective";
import { look } from "@/lib/universe/agents/look";
import { image } from "@/lib/universe/agents/image";
import { feelings } from "@/lib/universe/agents/feelings";
import { think } from "@/lib/universe/agents/thinking";
import { logic } from "@/lib/universe/agents/logic";
import { speakCopy, speakFindings, type Style } from "@/lib/universe/agents/speaker";
import type { AgentId, AgentOutput, RunState } from "@/lib/universe/types";

export type AgentFn = (state: RunState) => AgentOutput | Promise<AgentOutput>;

/**
 * The ten working agents. MASTER is not in this table: it is the orchestrator itself, and decides rather than analyzes.
 * Every entry takes the shared run state and returns a standard AgentOutput. None knows which business it is working for.
 */
export function agentTable(opts: { probeTimeoutMs?: number; style?: Style } = {}): Record<Exclude<AgentId, "MASTER">, AgentFn> {
  return {
    DIVIDER: divide,
    GATHERER: (s) => gather(s, opts.probeTimeoutMs),
    ORGANIZER: organize,
    PERSPECTIVE: perspectives,
    LOOK: look,
    IMAGE: image,
    FEELINGS: feelings,
    THINKING: think,
    LOGIC: logic,
    SPEAKER: (s) => (s.route.intent === "copy" ? speakCopy(s) : speakFindings(s, opts.style)),
  };
}
