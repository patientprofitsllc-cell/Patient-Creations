import type { Metadata } from "next";
import { OwnerSetupForm } from "@/components/auth/OwnerSetupForm";
import { setupEnabled } from "@/lib/security/ownerSetup";

export const metadata: Metadata = { title: "Owner setup", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Creates or resets the owner account. Only works while OWNER_SETUP_KEY is set in Netlify; otherwise it says it's off.
export default function OwnerSetupPage() {
  const on = setupEnabled();
  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center bg-pc-bg px-6 py-16 text-pc-cream">
      <h1 className="text-3xl font-light tracking-tight">Owner setup</h1>
      {on ? (
        <OwnerSetupForm />
      ) : (
        <p className="mt-6 max-w-sm text-center text-sm text-pc-mute">Owner setup is turned off. To use it, add a long secret named OWNER_SETUP_KEY in your Netlify environment variables, redeploy, and come back.</p>
      )}
    </main>
  );
}
