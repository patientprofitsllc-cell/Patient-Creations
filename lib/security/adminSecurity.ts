import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/** The signed-in admin's user row, checked against the password they just typed. null if it doesn't match. */
export async function adminWithPassword(userId: string | undefined, password: unknown) {
  if (!userId || typeof password !== "string" || !password) return null;
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") return null;
  return (await bcrypt.compare(password, user.passwordHash)) ? user : null;
}

export const uid = (session: { user?: unknown }) => (session.user as { id?: string } | undefined)?.id;
