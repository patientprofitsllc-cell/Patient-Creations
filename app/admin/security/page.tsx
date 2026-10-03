import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { SecurityForms } from "@/components/auth/SecurityForms";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/security/authOptions";
import { DEVICE_COOKIE, MAX_FAILS, failures, findUserByDevice, hasPin, usesDefaultPassword } from "@/lib/security/ownerPin";

// The owner's sign-in settings: a quick PIN for trusted devices, the password, and the device list.
export default async function SecurityPage() {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id ?? "";
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return null;
  const [pinOn, fails, defaultPw, deviceUser] = await Promise.all([
    hasPin(user.id),
    failures(user.id),
    usesDefaultPassword(user.passwordHash),
    findUserByDevice(cookies().get(DEVICE_COOKIE)?.value),
  ]);
  return (
    <SecurityForms
      email={user.email}
      pinOn={pinOn}
      locked={fails >= MAX_FAILS}
      defaultPassword={defaultPw}
      thisDeviceTrusted={deviceUser === user.id}
    />
  );
}
