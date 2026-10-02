export const CALENDLY_URL = "https://calendly.com/patientprofitsllc/30min";

/** The booking link with the buyer's name and email filled in, so the invite matches the order. */
export function kickoffUrlFor(name: string | null | undefined, email: string): string {
  const q = new URLSearchParams({ email });
  if (name?.trim()) q.set("name", name.trim());
  return `${CALENDLY_URL}?${q.toString()}`;
}
