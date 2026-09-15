import NextAuth from "next-auth";
import { authOptions } from "@/lib/security/authOptions";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
