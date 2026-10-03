/**
 * A headline whose words rise in one after another. Words in `shimmer` get the gold sweep. Server-rendered text, so the
 * headline is in the page immediately for search engines and screen readers.
 */
export function WordRise({ text, shimmer = [], className = "" }: { text: string; shimmer?: string[]; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={`word-rise ${className}`}>
      {words.map((w, i) => (
        <span key={i} style={{ ["--i" as string]: i }} className={shimmer.includes(w.replace(/[.,!?]/g, "")) ? "text-shimmer" : undefined}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
