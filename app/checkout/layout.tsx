import { Providers } from "@/components/shared/Providers";

// The checkout form reads the signed-in user (to skip account creation), so the
// session provider lives here rather than on every public page, where it would
// add JavaScript and a session request to each visit for no benefit.
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
