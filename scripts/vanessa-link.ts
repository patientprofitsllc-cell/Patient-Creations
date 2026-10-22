// Makes a private link to send a customer so they can talk with Vanessa (the AI discovery-call agent).
//   npx tsx scripts/vanessa-link.ts            a link that works for 14 days
//   npx tsx scripts/vanessa-link.ts --days 3   a link that works for 3 days
// The link is signed with NEXTAUTH_SECRET from .env, so it only works on a site that has the same secret.
import { signVanessaToken, vanessaUrl } from "../lib/site/vanessaAccess";

try {
  process.loadEnvFile(".env"); // Node reads the .env file itself; no extra package needed
} catch {
  /* no .env here: the secret must already be in the environment */
}

const i = process.argv.indexOf("--days");
const days = i > -1 ? Number(process.argv[i + 1]) : 14;
if (!Number.isFinite(days) || days < 1 || days > 60) {
  console.error("Use --days with a number from 1 to 60.");
  process.exit(1);
}
const base = process.env.VANESSA_LINK_BASE || "https://patientcreations.com";
console.log(vanessaUrl(base, signVanessaToken("owner", days * 24 * 60 * 60)));
console.log(`Works for ${days} day${days === 1 ? "" : "s"}.`);
