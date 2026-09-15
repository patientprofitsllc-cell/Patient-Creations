import { db } from "@/lib/db";

// The Project Bible: the single structured source of truth every agent
// reads instead of independently inventing conflicting requirements.
export interface CreativeBibleData {
  customer: Record<string, unknown>;
  business: Record<string, unknown>;
  objective: Record<string, unknown>;
  audience: Record<string, unknown>;
  offer: Record<string, unknown>;
  brand: Record<string, unknown>;
  voice: Record<string, unknown>;
  design: Record<string, unknown>;
  technology: Record<string, unknown>;
  requirements: Record<string, unknown>;
  content: Record<string, unknown>;
  assets: Record<string, unknown>;
  references: Record<string, unknown>;
  decisions: Record<string, unknown>;
  constraints: Record<string, unknown>;
  qaResults: unknown[];
  deployment: Record<string, unknown>;
  delivery: Record<string, unknown>;
  revisionHistory: unknown[];
}

const emptySection = {};

export function buildInitialBible(input: {
  customerName: string;
  customerEmail: string;
  productName: string;
  productCategory: string;
  intake?: Record<string, unknown>;
}): CreativeBibleData {
  const intake = input.intake ?? {};
  return {
    customer: { name: input.customerName, email: input.customerEmail },
    business: { productPurchased: input.productName, category: input.productCategory },
    objective: intake.objective ? { statement: intake.objective } : emptySection,
    audience: intake.audience ? { description: intake.audience } : emptySection,
    offer: emptySection,
    brand: intake.brand ? { name: intake.brand } : emptySection,
    voice: emptySection,
    design: emptySection,
    technology: emptySection,
    requirements: intake.requirements ? { notes: intake.requirements } : emptySection,
    content: emptySection,
    assets: emptySection,
    references: intake.references ? { notes: intake.references } : emptySection,
    decisions: emptySection,
    constraints: emptySection,
    qaResults: [],
    deployment: emptySection,
    delivery: emptySection,
    revisionHistory: [],
  };
}

export async function createBible(projectId: string, data: CreativeBibleData) {
  return db.creativeBible.create({
    data: {
      projectId,
      customerJson: JSON.stringify(data.customer),
      businessJson: JSON.stringify(data.business),
      objectiveJson: JSON.stringify(data.objective),
      audienceJson: JSON.stringify(data.audience),
      offerJson: JSON.stringify(data.offer),
      brandJson: JSON.stringify(data.brand),
      voiceJson: JSON.stringify(data.voice),
      designJson: JSON.stringify(data.design),
      technologyJson: JSON.stringify(data.technology),
      requirementsJson: JSON.stringify(data.requirements),
      contentJson: JSON.stringify(data.content),
      assetsJson: JSON.stringify(data.assets),
      referencesJson: JSON.stringify(data.references),
      decisionsJson: JSON.stringify(data.decisions),
      constraintsJson: JSON.stringify(data.constraints),
    },
  });
}

export async function loadBible(projectId: string): Promise<CreativeBibleData | null> {
  const row = await db.creativeBible.findUnique({ where: { projectId } });
  if (!row) return null;
  return {
    customer: JSON.parse(row.customerJson),
    business: JSON.parse(row.businessJson),
    objective: JSON.parse(row.objectiveJson),
    audience: JSON.parse(row.audienceJson),
    offer: JSON.parse(row.offerJson),
    brand: JSON.parse(row.brandJson),
    voice: JSON.parse(row.voiceJson),
    design: JSON.parse(row.designJson),
    technology: JSON.parse(row.technologyJson),
    requirements: JSON.parse(row.requirementsJson),
    content: JSON.parse(row.contentJson),
    assets: JSON.parse(row.assetsJson),
    references: JSON.parse(row.referencesJson),
    decisions: JSON.parse(row.decisionsJson),
    constraints: JSON.parse(row.constraintsJson),
    qaResults: JSON.parse(row.qaResultsJson),
    deployment: JSON.parse(row.deploymentJson),
    delivery: JSON.parse(row.deliveryJson),
    revisionHistory: JSON.parse(row.revisionHistoryJson),
  };
}

export async function mergeBibleSection(
  projectId: string,
  section: keyof CreativeBibleData,
  value: unknown,
) {
  const column = `${section}Json` as const;
  const jsonColumn = `${section}Json`;
  await db.creativeBible.update({
    where: { projectId },
    data: { [jsonColumn]: JSON.stringify(value) } as any,
  });
}
