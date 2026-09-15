// Prisma's SQLite connector does not support native enums, so these fields
// are stored as `String` in the schema and validated at the application
// layer via these union types instead. Values are identical to what a
// Postgres-backed schema would use as real enums.

export type UserRole = "CUSTOMER" | "ADMIN";

export type ProductType = "PRIMARY" | "ORDER_BUMP" | "UPSELL" | "DOWNSELL" | "SUBSCRIPTION";

export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED";

export type PaymentProvider = "STRIPE" | "MOCK" | "MANUAL";

// The processors offered on the checkout payment-method step. Only "stripe"
// (credit/debit card) is wired to a live, automatic charge — "zelle" and
// "apple_pay" create a PENDING order and surface in the admin CRM for
// Trenton to collect manually and mark paid (see lib/payments/paymentMethods.ts).
export type PaymentMethod = "stripe" | "zelle" | "apple_pay";

export type ProjectState =
  | "DRAFT"
  | "PAID"
  | "INTAKE_REQUIRED"
  | "QUEUED"
  | "RESEARCH"
  | "STRATEGY"
  | "CONCEPT"
  | "GENERATION"
  | "BUILD"
  | "AUTOMATION"
  | "QA"
  | "PERCEPTION"
  | "REVISION"
  | "DELIVERY_READY"
  | "DELIVERED"
  | "REVIEW_REQUESTED"
  | "COMPLETED"
  | "EXCEPTION"
  | "CANCELLED";

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "PASSED" | "FAILED" | "SKIPPED";

export type AgentRunStatus = "RUNNING" | "SUCCEEDED" | "FAILED" | "ESCALATED";

export type RevisionStatus = "REQUESTED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";

export type CommissionState =
  | "CLICKED"
  | "LEAD"
  | "CUSTOMER"
  | "PURCHASED"
  | "PENDING"
  | "APPROVED"
  | "PAYABLE"
  | "PAID"
  | "REFUNDED"
  | "REJECTED";

export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "STOPPED";
