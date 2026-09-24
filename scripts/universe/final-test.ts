import { createUniverse } from "@/lib/universe/commands";
import { createPatientCreationsDomain } from "@/lib/universe/domains/patientCreations";
import { renderMessage } from "@/lib/universe/protocol";
import { InMemoryStore } from "@/lib/universe/store/memoryStore";

// The final test from the build spec, run against the REAL Patient Creations records and the real public pages, with an
// in-memory store so that nothing is written to the database. It reads, it reasons, and it prints the whole chain.
//
//   npx tsx scripts/universe/final-test.ts
//
// Set NODE_OPTIONS=--use-system-ca if this machine cannot verify TLS certificates for the live site.

const OBJECTIVE = "Analyze Patient Creations and identify the most important areas that should be investigated to improve the business.";

async function main() {
  const store = new InMemoryStore();
  const domain = createPatientCreationsDomain();
  const u = createUniverse({ store, domain, deps: {}, probeTimeoutMs: 20_000, snapshotTimeoutMs: 12_000, agentTimeoutMs: 30_000 });
  const started = Date.now();
  const r = await u.run("ASK_MASTER", { text: OBJECTIVE });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  if (r.kind !== "mission") throw new Error(`Not a mission: ${JSON.stringify(r)}`);
  const m = r.result;

  console.log("=".repeat(100));
  console.log("REQUEST:", OBJECTIVE);
  console.log(`STATUS: ${m.status}   TIME: ${seconds}s   ERRORS: ${m.errors.length ? m.errors.join(" | ") : "none"}`);
  console.log("\nROUTE MASTER CHOSE:", m.route.intent);
  console.log("  " + m.route.steps.map((s) => s.join(" + ")).join("  ->  "));
  console.log("  Why:", m.route.reason);
  console.log("  Skipped:", m.route.skipped.length ? m.route.skipped.map((s) => s.agent).join(", ") : "none (the full chain was needed)");

  console.log("\n" + "=".repeat(100) + "\nTHE CHAIN, AGENT BY AGENT\n");
  for (const msg of m.messages) console.log(renderMessage(msg) + "\n" + "-".repeat(100));

  console.log("\nDISAGREEMENTS");
  if (!m.decision.disagreements.length) console.log("  none");
  for (const d of m.decision.disagreements) {
    console.log(`  - ${d.topic} [${d.resolution}]`);
    for (const p of d.positions) console.log(`      ${p.agent} (${p.stance}): ${p.text.slice(0, 200)}`);
    console.log(`      rule: ${d.rule}${d.decidedFor ? ` -> decided for: ${d.decidedFor.slice(0, 120)}` : ""}`);
  }

  console.log("\n" + "=".repeat(100) + "\nFINAL REPORT\n");
  console.log(m.report);

  console.log("\n" + "=".repeat(100) + "\nACTIONS EXECUTED AND VERIFIED");
  for (const e of m.executed) console.log(`  ${e.ok ? (e.verified ? "OK, verified " : "OK, NOT verified") : "NOT DONE      "}  ${e.action}: ${e.detail.slice(0, 110)}`);

  console.log("\nAUDIT TRAIL (" + store.activity.length + " steps)");
  for (const a of store.activity) console.log(`  ${a.status.padEnd(9)} ${a.agent.padEnd(11)} ${String(a.durationMs).padStart(6)}ms  ${a.task}${a.handoff ? `  -> ${a.handoff}` : ""}${a.error ? `  ERROR: ${a.error}` : ""}`);

  console.log("\nMEMORY AFTER THE RUN");
  for (const e of store.memory) console.log(`  ${e.level}/${e.kind}: ${e.content.slice(0, 160)}`);

  const facts = m.facts;
  const fabricated = facts.filter((f) => f.label === "FACT" && !f.source);
  console.log("\nCHECKS");
  console.log(`  facts read: ${facts.filter((f) => f.label === "FACT").length}, unknown: ${facts.filter((f) => f.label === "UNKNOWN").length}, conflicting: ${facts.filter((f) => f.label === "CONFLICTING").length}`);
  console.log(`  facts with no source (must be 0): ${fabricated.length}`);
  console.log(`  every finding cites evidence: ${m.claims.every((c) => c.evidence.length > 0 || c.severity === "experiment")}`);
  console.log(`  tasks created: ${store.tasks.length} (in the in-memory store; nothing was written to the database)`);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
