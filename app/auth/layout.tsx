import { Providers } from "@/components/shared/Providers";

// The sign-in form uses the auth client, so the provider lives here and not on
// every public page.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
