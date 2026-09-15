const GOLD = "#E0C48A";
const DEEP = "#C39B52";

export type ChapterArtType =
  | "rings"
  | "lattice"
  | "network"
  | "burst"
  | "wave"
  | "ascend"
  | "vision"
  | "infinity";

/**
 * Original thin-gold-linework vector icons — one per "how it works" chapter
 * and fleet entry. Deterministic (no Math.random()) so server and client
 * render identically; the "vision" scatter uses a fixed seeded pattern
 * instead of true randomness for the same reason.
 */
export function ChapterArt({ type, className }: { type: ChapterArtType; className?: string }) {
  const g = { stroke: "url(#g)", fill: "none" } as const;
  const defs = (
    <defs>
      <radialGradient id="halo" cx="50%" cy="42%" r="60%">
        <stop offset="0" stopColor="rgba(224,196,138,.16)" />
        <stop offset="1" stopColor="transparent" />
      </radialGradient>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={GOLD} />
        <stop offset="1" stopColor={DEEP} />
      </linearGradient>
    </defs>
  );

  return (
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {defs}
      <rect x={-200} y={-200} width={800} height={800} fill="url(#halo)" />
      {type === "rings" && (
        <>
          {[150, 110, 70].map((r, i) => (
            <circle key={r} cx={200} cy={200} r={r} {...g} strokeWidth={1.4 - i * 0.2} opacity={1 - i * 0.15} />
          ))}
          <circle cx={200} cy={50} r={5} fill={GOLD} />
          <circle cx={200} cy={200} r={4} fill={GOLD} />
          <path d="M200 200 L200 90" {...g} strokeWidth={0.8} opacity={0.5} />
        </>
      )}
      {type === "lattice" &&
        [0, 1, 2].flatMap((r) =>
          [0, 1, 2].map((c) => {
            const on = (r + c) % 2 === 0;
            const x = 110 + c * 90;
            const y = 110 + r * 90;
            return (
              <rect
                key={`${r}-${c}`}
                x={x - 32}
                y={y - 32}
                width={64}
                height={64}
                rx={12}
                {...g}
                strokeWidth={on ? 1.4 : 0.7}
                opacity={on ? 1 : 0.5}
                fill={on ? "rgba(224,196,138,.06)" : "none"}
              />
            );
          }),
        )}
      {type === "network" && (
        <>
          <path
            d="M200 200 L200 90 M200 200 L110 180 M200 200 L290 180 M200 200 L150 300 M200 200 L250 300"
            {...g}
            strokeWidth={0.8}
            opacity={0.55}
          />
          {[
            [200, 90],
            [110, 180],
            [290, 180],
            [150, 300],
            [250, 300],
            [200, 200],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 5 ? 7 : 5} {...g} strokeWidth={1.4} fill={i === 5 ? GOLD : "none"} />
          ))}
        </>
      )}
      {type === "burst" && (
        <>
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const x = 200 + Math.cos(a) * 150;
            const y = 200 + Math.sin(a) * 150;
            return <path key={i} d={`M200 200 L${x.toFixed(0)} ${y.toFixed(0)}`} {...g} strokeWidth={0.9} opacity={0.5} />;
          })}
          <circle cx={200} cy={200} r={26} {...g} strokeWidth={1.4} fill="rgba(224,196,138,.06)" />
        </>
      )}
      {type === "wave" &&
        [0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M40 ${150 + i * 30} C 130 ${110 + i * 30}, 270 ${190 + i * 30}, 360 ${150 + i * 30}`}
            {...g}
            strokeWidth={1.4 - i * 0.2}
            opacity={1 - i * 0.18}
          />
        ))}
      {type === "ascend" && (
        <>
          {[0, 1, 2, 3, 4].map((i) => {
            const h = 60 + i * 40;
            const x = 90 + i * 55;
            return (
              <rect
                key={i}
                x={x}
                y={300 - h}
                width={30}
                height={h}
                rx={6}
                {...g}
                strokeWidth={1.2}
                fill={i === 4 ? "rgba(224,196,138,.08)" : "none"}
              />
            );
          })}
          <path d="M90 90 L 320 90" {...g} strokeWidth={0.7} opacity={0.4} />
        </>
      )}
      {type === "vision" && (
        <>
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i * 2.399963) % (Math.PI * 2); // golden-angle seed, deterministic scatter
            const r = 40 + ((i * 37) % 130);
            const x = 200 + Math.cos(a) * r;
            const y = 200 + Math.sin(a) * r * 0.9;
            const opacity = 0.3 + ((i * 13) % 50) / 100;
            const radius = 0.6 + ((i * 7) % 20) / 10;
            return <circle key={i} cx={x.toFixed(0)} cy={y.toFixed(0)} r={radius.toFixed(1)} fill={GOLD} opacity={opacity.toFixed(2)} />;
          })}
          <circle cx={200} cy={200} r={150} {...g} strokeWidth={0.6} opacity={0.3} />
        </>
      )}
      {type === "infinity" && (
        <>
          <path
            d="M120 200 C120 150 170 150 200 200 C230 250 280 250 280 200 C280 150 230 150 200 200 C170 250 120 250 120 200 Z"
            {...g}
            strokeWidth={1.6}
          />
          <circle cx={200} cy={200} r={5} fill={GOLD} />
        </>
      )}
    </svg>
  );
}
