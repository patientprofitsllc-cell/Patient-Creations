import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/security/authOptions";

export class ForbiddenError extends Error {}
export class UnauthorizedError extends Error {}

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new UnauthorizedError("Not signed in");
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if ((session.user as { role?: string }).role !== "ADMIN") {
    throw new ForbiddenError("Admin access required");
  }
  return session;
}

/**
 * Operations the spec explicitly forbids agents/automation from touching
 * without explicit server-side, human-triggered authorization.
 */
export const RESTRICTED_OPERATIONS = [
  "refunds",
  "payment_changes",
  "production_credentials",
  "secret_management",
  "destructive_database_operations",
] as const;

export function assertNotAgentAccessible(operation: (typeof RESTRICTED_OPERATIONS)[number]) {
  if (RESTRICTED_OPERATIONS.includes(operation)) {
    throw new ForbiddenError(`Operation "${operation}" requires explicit human/admin authorization`);
  }
}
