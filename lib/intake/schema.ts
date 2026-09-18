import { z } from "zod";
import { WEBSITE_GOALS } from "@/lib/site/offer";

// Everything the intake wizard can save. Every field is optional and length
// limited, because customers fill it in over several sessions and skip what
// they don't have. All of it is untrusted text: it's only ever stored, then
// escaped when rendered.
const text = (max: number) => z.string().trim().max(max);

export const GOAL_VALUES = WEBSITE_GOALS.map((g) => g.value) as [string, ...string[]];
export const FONT_STYLES = ["Modern", "Classic", "Bold", "Friendly", "Elegant", "No preference"] as const;

export const intakePatchSchema = z
  .object({
    businessName: text(120),
    businessType: text(80),
    phone: text(40),
    existingWebsite: text(200),
    description: text(1500),
    address: text(300),
    hours: text(600),
    services: text(3000),
    pricing: text(3000),
    bookingUrl: text(300),
    socialUrls: text(1200),
    logoUrl: text(300),
    colors: text(200),
    fontStyle: z.enum(FONT_STYLES),
    styleNotes: text(1500),
    mediaLinks: text(2000),
    goal: z.enum(GOAL_VALUES),
    goalNotes: text(800),
  })
  .partial()
  .strict();

export type IntakePatch = z.infer<typeof intakePatchSchema>;

export interface IntakeFields {
  businessName: string;
  businessType: string;
  phone: string;
  goal: string | null;
}

const REQUIRED: { key: keyof IntakeFields; label: string }[] = [
  { key: "businessName", label: "Business name" },
  { key: "businessType", label: "Business type" },
  { key: "phone", label: "Phone number" },
  { key: "goal", label: "What you want visitors to do" },
];

/** The labels of required fields that are still empty. Empty list means ready to submit. */
export function missingRequired(intake: IntakeFields): string[] {
  return REQUIRED.filter(({ key }) => !String(intake[key] ?? "").trim()).map(({ label }) => label);
}

/** Splits a "one per line" (or comma separated) text block into clean entries. */
export function lines(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(/\r?\n|,/)
    .map((l) => l.trim())
    .filter(Boolean);
}
