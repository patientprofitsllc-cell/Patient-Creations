// The confirmation page knows which product was bought, but the address only holds an order number. The page
// registers the right thank you here, and the guide uses it in place of the general one.

let current: string | null = null;
const listeners = new Set<() => void>();

export function setCueOverride(id: string | null): void {
  if (current === id) return;
  current = id;
  listeners.forEach((l) => l());
}
export const getCueOverride = (): string | null => current;
export function subscribeCueOverride(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
