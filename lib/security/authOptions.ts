import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { notifyOwnerOfPinLock } from "@/lib/alerts/ownerAlerts";
import { rateLimit } from "@/lib/security/rateLimit";
import { DEVICE_COOKIE, checkPin, readCookie, resetFailures } from "@/lib/security/ownerPin";

type ReqLike = { headers?: Record<string, string | string[] | undefined> } | undefined;
const header = (req: ReqLike, name: string) => {
  const v = req?.headers?.[name];
  return Array.isArray(v) ? v[0] : v;
};

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/auth/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        // A password sign-in unlocks the owner's PIN after too many wrong tries.
        if (user.role === "ADMIN") await resetFailures(user.id).catch(() => {});
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
    // The owner's 4-digit PIN. Only works on a device trusted by an earlier password sign-in (see lib/security/ownerPin).
    CredentialsProvider({
      id: "owner-pin",
      name: "Owner PIN",
      credentials: { pin: { label: "PIN", type: "password" } },
      async authorize(credentials, req) {
        const ip = String(header(req as ReqLike, "x-forwarded-for") ?? "local").split(",")[0].trim();
        if (!rateLimit(`owner-pin:${ip}`, 10, 15 * 60_000).allowed) return null;
        const token = readCookie(header(req as ReqLike, "cookie"), DEVICE_COOKIE);
        const result = await checkPin(token, credentials?.pin, (email) => notifyOwnerOfPinLock(email, ip));
        return result.ok ? result.user : null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string | undefined;
        (session.user as { id?: string }).id = token.uid as string | undefined;
      }
      return session;
    },
  },
};
