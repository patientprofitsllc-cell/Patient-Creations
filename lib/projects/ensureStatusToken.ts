import { db } from "@/lib/db";
import { generateStatusToken } from "@/lib/projects/statusToken";

/** Backfills a status token for any project created before this feature existed. */
export async function ensureStatusToken(projectId: string, existingToken: string | null): Promise<string> {
  if (existingToken) return existingToken;
  const token = generateStatusToken();
  await db.project.update({ where: { id: projectId }, data: { statusToken: token } });
  return token;
}
