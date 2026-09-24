import { db } from "@/lib/db";
import { aiEnabled, callModel } from "@/lib/ai/callModel";
import { createUniverse } from "@/lib/universe/commands";
import { createPatientCreationsDomain } from "@/lib/universe/domains/patientCreations";
import { prismaStore } from "@/lib/universe/store/prismaStore";
import type { Deps } from "@/lib/universe/types";

// The Agent Universe as it runs in this app: the real database for memory, and Patient Creations as the business it serves.
// A new domain object is made for each run, so the data it reads is fresh and shared only within that run.

export const PC_DOMAIN_ID = "patient-creations";

const deps = (): Deps => ({
  // Writing is only offered when the owner has deliberately turned AI on. Otherwise SPEAKER cleans and checks the text it is given.
  writeCopy: aiEnabled()
    ? async (system, prompt) => {
        const r = await callModel({ agentKey: "universe-speaker", system, prompt, maxTokens: 700 });
        if (r.mocked) throw new Error("No writing model is available.");
        return r.text;
      }
    : undefined,
  notifyOwner: async (title, body) => {
    const n = await db.notification.create({ data: { audience: "admin", title: title.slice(0, 160), body: body.slice(0, 1500) } });
    return n.id;
  },
});

export function patientCreationsUniverse() {
  return createUniverse({ store: prismaStore, domain: createPatientCreationsDomain(), deps: deps(), probeTimeoutMs: 8_000, snapshotTimeoutMs: 7_000, agentTimeoutMs: 15_000 });
}
