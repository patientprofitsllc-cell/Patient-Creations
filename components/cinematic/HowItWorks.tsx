import { ChapterArt, ChapterArtType } from "@/components/cinematic/ChapterArt";

const CHAPTERS: { art: ChapterArtType; title: string; sub: string }[] = [
  { art: "rings", title: "Every goal becomes a plan.", sub: "You hand over an objective. The orchestrator turns it into a clear sequence of steps and assigns each one to the right specialist." },
  { art: "lattice", title: "The busywork is handled.", sub: "Meetings, reviews, follow-ups — the work that fills a week runs inside the system, so it never fills your calendar." },
  { art: "network", title: "One surface for every service.", sub: "Booking, payments, delivery, support — your customers get a single, considered place to do everything with you." },
  { art: "wave", title: "The standard customers expect.", sub: "Cinematic, fast, and always on. This is the quality bar your site and software now clear by default." },
  { art: "burst", title: "Your org chart is agents.", sub: "Research, sales, delivery, and QA — coordinated by one orchestrator, working in parallel, visible at a glance." },
  { art: "ascend", title: "It starts the moment you say go.", sub: "No hiring, no onboarding, no waiting for Monday. Approve the build and the team is already at work." },
  { art: "vision", title: "You describe it. It takes form.", sub: "Bring the outcome you want. The agents assemble it — the way a clear picture resolves out of scattered detail." },
  { art: "infinity", title: "It keeps working after you log off.", sub: "Delivery updates, cross-sells, and follow-ups continue on their own, and report back to you when you return." },
];

export function HowItWorks() {
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2">
      {CHAPTERS.map((c, i) => (
        <div key={c.title} className="flex gap-5">
          <div className="w-16 flex-none sm:w-20">
            <ChapterArt type={c.art} className="w-full" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold/70">Chapter {i + 1}</p>
            <h3 className="mt-2 font-display text-xl text-ice">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ice/50">{c.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
