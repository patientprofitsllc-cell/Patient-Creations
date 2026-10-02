import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

describe("the deploy-time catalog sync", () => {
  it("runs before every build, and a failure to run never stops the build", () => {
    const pkg = JSON.parse(read("package.json"));
    expect(pkg.scripts.build).toMatch(/^\(tsx scripts\/sync-catalog\.ts \|\| echo .*\) && next build$/);
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
