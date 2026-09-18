import { describe, expect, it } from "vitest";
import { intakePatchSchema, lines, missingRequired } from "@/lib/intake/schema";

describe("missingRequired", () => {
  const complete = { businessName: "Ace Barbers", businessType: "Barbershop", phone: "555-555-0142", goal: "BOOK" };

  it("is empty when every required field is present", () => {
    expect(missingRequired(complete)).toEqual([]);
  });

  it("lists each empty required field by its customer-facing label", () => {
    expect(missingRequired({ ...complete, goal: null })).toEqual(["What you want visitors to do"]);
    expect(missingRequired({ businessName: " ", businessType: "", phone: "", goal: null })).toHaveLength(4);
  });
});

describe("intakePatchSchema", () => {
  it("accepts a partial save", () => {
    expect(intakePatchSchema.safeParse({ hours: "Mon to Fri 9 to 5" }).success).toBe(true);
    expect(intakePatchSchema.safeParse({}).success).toBe(true);
  });

  it("rejects unknown fields so a client can't write other columns", () => {
    expect(intakePatchSchema.safeParse({ status: "COMPLETE" }).success).toBe(false);
    expect(intakePatchSchema.safeParse({ token: "x" }).success).toBe(false);
    expect(intakePatchSchema.safeParse({ orderId: "x" }).success).toBe(false);
  });

  it("rejects oversized text and invalid enums", () => {
    expect(intakePatchSchema.safeParse({ description: "x".repeat(1501) }).success).toBe(false);
    expect(intakePatchSchema.safeParse({ goal: "STEAL" }).success).toBe(false);
    expect(intakePatchSchema.safeParse({ fontStyle: "Comic" }).success).toBe(false);
    expect(intakePatchSchema.safeParse({ goal: "BOOK", fontStyle: "Bold" }).success).toBe(true);
  });
});

describe("lines", () => {
  it("splits on newlines and commas and drops blanks", () => {
    expect(lines("Haircut\n\n Beard trim ,Kids cut\r\n")).toEqual(["Haircut", "Beard trim", "Kids cut"]);
    expect(lines(null)).toEqual([]);
  });
});
