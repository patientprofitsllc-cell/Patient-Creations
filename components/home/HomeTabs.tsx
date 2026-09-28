"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export interface HomeTab {
  /** Also the URL hash it answers to, e.g. a link to "/#business-cards" opens this tab. */
  id: string;
  label: string;
  blurb: string;
  panel: ReactNode;
}

/**
 * The four-tab bar a first-time visitor lands on: one clear choice instead of a long scroll of everything at once.
 * Content for a tab is built server-side (it reads the database) and handed in as `panel`; this part only switches
 * which one shows. Follows the standard tabs pattern (role="tablist", arrow-key navigation, one tab stop) and opens
 * on whichever tab matches the page's URL hash, so a link like "/#business-cards" lands straight on that tab.
 */
export function HomeTabs({ tabs, initial }: { tabs: HomeTab[]; initial?: string }) {
  const [active, setActive] = useState(() => (initial && tabs.some((t) => t.id === initial) ? initial : tabs[0]?.id));
  const baseId = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const fromHashRef = useRef(false);

  // A link elsewhere on the site (or a bookmark) can open straight to one tab: /#business-cards, /#websites, and so on.
  useEffect(() => {
    const openFromHash = (scroll: boolean) => {
      const id = window.location.hash.replace("#", "");
      if (id && tabs.some((t) => t.id === id)) {
        fromHashRef.current = true;
        setActive(id);
        if (scroll) panelRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
      }
    };
    openFromHash(false);
    window.addEventListener("hashchange", () => openFromHash(true));
    return () => window.removeEventListener("hashchange", () => openFromHash(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function select(id: string, focus = false) {
    setActive(id);
    fromHashRef.current = false;
    if (typeof window !== "undefined") window.history.replaceState(null, "", `#${id}`);
    if (focus) tabRefs.current[id]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const move = (delta: number) => {
      const next = tabs[(i + delta + tabs.length) % tabs.length];
      select(next.id, true);
    };
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      select(tabs[0].id, true);
    } else if (e.key === "End") {
      e.preventDefault();
      select(tabs[tabs.length - 1].id, true);
    }
  }

  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <section aria-label="What Patient Creations builds" className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
      <div role="tablist" aria-label="Choose what you're here for" className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {tabs.map((t, i) => {
          const on = t.id === activeTab.id;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[t.id] = el;
              }}
              id={`${baseId}-tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={`${baseId}-panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => select(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`flex min-h-[64px] flex-col items-center justify-center rounded-2xl border px-2 py-3 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:min-h-[76px] sm:px-4 ${
                on ? "border-gold bg-gold/10 shadow-gold-glow" : "border-white/10 bg-white/[0.02] hover:border-gold/40"
              }`}
            >
              <span className={`text-sm font-semibold leading-tight sm:text-base ${on ? "text-ice" : "text-ice/80"}`}>{t.label}</span>
              <span className="mt-1 hidden text-xs text-ice/40 sm:block">{t.blurb}</span>
            </button>
          );
        })}
      </div>

      {tabs.map((t) => (
        <div
          key={t.id}
          ref={t.id === activeTab.id ? panelRef : undefined}
          id={`${baseId}-panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${t.id}`}
          hidden={t.id !== activeTab.id}
          tabIndex={0}
          className="scroll-mt-24"
        >
          {t.id === activeTab.id && t.panel}
        </div>
      ))}
    </section>
  );
}
