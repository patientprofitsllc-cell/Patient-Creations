/** The private intake wizard link. The token is the only credential, so it is never guessable. */
export function intakeUrlFor(token: string): string {
  const base = process.env.APP_BASE_URL ?? "http://localhost:3000";
  return `${base}/intake/${token}`;
}
