import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { ChapterArt } from "@/components/cinematic/ChapterArt";

const FLEET = [
  { art: "lattice" as const, name: "A software product", body: "A subscription app with live billing: recurring revenue that compounds." },
  { art: "burst" as const, name: "A build studio", body: "Ship sites and apps for clients while the agents handle intake to invoice." },
  { art: "wave" as const, name: "A rental portfolio", body: "Listing films and copy that keep every unit's calendar full." },
  { art: "network" as const, name: "A lead engine", body: "Prospects sourced and scored on their own, wherever the next customer is." },
  { art: "ascend" as const, name: "A product brand", body: "Launch and scale a brand on the same rails, like Humble$cents." },
  { art: "infinity" as const, name: "Then all of them", body: "One operator, several machines. That is how the wealth compounds." },
];

export default function FleetPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-32">
        <section className="mx-auto max-w-4xl px-6 pb-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70">One Machine Becomes Many</p>
          <h1 className="mt-4 font-display text-4xl text-ice sm:text-5xl">The fleet.</h1>
          <p className="mx-auto mt-4 max-w-xl text-ice/50">
            The same system, re-skinned, becomes the next business you own. This is how one operator runs several.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-28">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FLEET.map((f) => (
              <div key={f.name} className="glass-panel rounded-2xl p-6">
                <div className="mb-5 flex aspect-[16/10] items-center justify-center rounded-xl border border-gold/10 bg-charcoal">
                  <ChapterArt type={f.art} className="h-3/4 w-3/4" />
                </div>
                <h3 className="font-display text-xl text-ice">{f.name}</h3>
                <p className="mt-2 text-sm text-ice/50">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
