import Link from "next/link";
import { IdeaBoard, type IdeaRow } from "@/components/founder/IdeaBoard";
import { db } from "@/lib/db";
import { cleanAnswers, MAX_ACTIVE_IDEAS } from "@/lib/founder/ideas";
import { loadFounder } from "@/lib/founder/service";

export const dynamic = "force-dynamic";

const date = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function IdeasPage() {
  const [ideas, f] = await Promise.all([db.founderIdea.findMany({ orderBy: { createdAt: "desc" }, take: 200 }), loadFounder()]);
  const rows: IdeaRow[] = ideas.map((i) => {
    let answers = {};
    try {
      answers = cleanAnswers(JSON.parse(i.answersJson));
    } catch {
      answers = {};
    }
    return { id: i.id, title: i.title, notes: i.notes, status: i.status, answers, created: date(i.createdAt), decisionNote: i.decisionNote };
  });
  const doing = rows.filter((r) => r.status === "DOING").length;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/founder" className="text-xs text-ice/40 hover:text-gold">← Founder dashboard</Link>
        <h1 className="mt-2 font-display text-3xl text-ice">Idea parking lot</h1>
        <p className="mt-2 max-w-2xl text-sm text-ice/60">
          Ideas are easy, and building every one of them is how a business stalls. Save an idea here instead of starting it. Answer seven questions. It stays parked until you decide, at most {MAX_ACTIVE_IDEAS} can be in progress at once, and nothing is ever built automatically.
        </p>
      </div>
      <IdeaBoard ideas={rows} bottleneckTitle={f.bottleneck.primary?.title ?? null} doingCount={doing} max={MAX_ACTIVE_IDEAS} />
    </div>
  );
}
