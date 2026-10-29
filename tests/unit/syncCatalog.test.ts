import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { spawnSync } from "child_process";

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

describe("the deploy-time catalog sync", () => {
  it("runs before every build, and a failure to run never stops the build", () => {
    const pkg = JSON.parse(read("package.json"));
    expect(pkg.scripts.build).toBe("(tsx scripts/sync-catalog.ts || node scripts/catalog-sync-fallback.cjs) && next build");
  });

  it("the fallback keeps the build going by default and stops it only when CATALOG_SYNC_STRICT=1", () => {
    const run = (env: Record<string, string>) =>
      spawnSync(process.execPath, [join(process.cwd(), "scripts/catalog-sync-fallback.cjs")], { env: { ...process.env, CATALOG_SYNC_STRICT: "", ...env }, encoding: "utf8" });
    const lenient = run({});
    expect(lenient.status).toBe(0);
    expect(lenient.stdout).toContain("sync-catalog: could not run");
    expect(run({ CATALOG_SYNC_STRICT: "0" }).status).toBe(0);
    const strict = run({ CATALOG_SYNC_STRICT: "1" });
    expect(strict.status).toBe(1);
    expect(strict.stdout).toContain("failing the build");
  });

  it("a database failure only fails the sync step in strict mode, and a crash is never an unhandled rejection", () => {
    const script = read("scripts/sync-catalog.ts");
    expect(script).toMatch(/CATALOG_SYNC_STRICT === "1"\) process\.exitCode = 1/);
    expect(script).toMatch(/db = new PrismaClient\(\);/); // constructed inside the try, so its errors are caught
    expect(script).toMatch(/run\(\)\.catch\(/);
    expect(script).not.toMatch(/void run\(\)/);
  });

  it("only touches products and their tiers: never users, orders, or inventory", () => {
    const seed = read("prisma/seed.ts");
    const body = /export async function syncCatalog\(db: Db\) \{([\s\S]*?)\n\}\n/.exec(seed)?.[1] ?? "";
    expect(body).not.toBe("");
    const tables = [...body.matchAll(/db\.(\w+)\./g)].map((m) => m[1]);
    expect(new Set(tables)).toEqual(new Set(["product", "productVariant"]));
    expect(read("scripts/sync-catalog.ts")).not.toMatch(/db\.(user|order|inventoryItem)/);
  });

  it("only changes prices on the production deploy, never from a deploy preview or branch deploy", () => {
    const script = read("scripts/sync-catalog.ts");
    expect(script).toMatch(/process\.env\.CONTEXT/);
    expect(script).toMatch(/context && context !== "production"/);
  });

  it("skips without a Postgres database and swallows connection errors", () => {
    const script = read("scripts/sync-catalog.ts");
    expect(script).toMatch(/postgres\(ql\)\?/);
    expect(script).toMatch(/catch \(e\)/);
  });
});
