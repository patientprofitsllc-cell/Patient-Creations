import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { PinPad } from "@/components/auth/PinPad";
import { DEVICE_COOKIE, MAX_FAILS, failures, findUserByDevice, hasPin } from "@/lib/security/ownerPin";

export const metadata: Metadata = { title: "Owner sign-in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// The owner's PIN keypad. It only appears on a device trusted by an earlier email + password sign-in.
export default async function PinPage() {
  const userId = await findUserByDevice(cookies().get(DEVICE_COOKIE)?.value).catch(() => null);
  const ready = userId ? await hasPin(userId).catch(() => false) : false;
  const fails = userId && ready ? await failures(userId).catch(() => 0) : 0;

  let note: string | null = null;
  if (!userId || !ready) note = "This device isn't set up for PIN sign-in. Sign in with your email and password, then set a PIN on the Security page.";
  else if (fails >= MAX_FAILS) note = "PIN sign-in is locked after too many wrong tries. Sign in once with your email and password to unlock it.";

  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center bg-[#06070d] px-6 py-16 text-pc-cream">
      {/* The animated celestial logo: lines draw in, stars twinkle, the mark rises. */}
      <img src="/assets/brand/celestial.svg" alt="Patient Creations" width={220} height={220} className="h-[220px] w-[220px] rounded-3xl" />
      <h1 className="mt-4 text-2xl font-light tracking-tight">Owner sign-in</h1>
      {note ? (
        <div className="mt-8 max-w-xs text-center">
          <p className="text-sm text-pc-mute">{note}</p>
          <Link href="/auth/login" className="mt-6 inline-flex min-h-[48px] items-center rounded-xl bg-pc-sand px-6 font-semibold text-pc-ink">
            Sign in with email
          </Link>
        </div>
      ) : (
        <PinPad triesLeft={MAX_FAILS - fails} />
      )}
    </main>
  );
}
