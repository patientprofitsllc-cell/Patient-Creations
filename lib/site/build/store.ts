import { db } from "@/lib/db";
import { generateStatusToken } from "@/lib/projects/statusToken";
import type { BuiltSite } from "@/lib/site/build/config";
import type { QaResult } from "@/lib/site/build/qa";

/** The newest version of a project's website, or null. */
export async function latestBuild(projectId: string) {
  return db.websiteBuild.findFirst({ where: { projectId }, orderBy: { version: "desc" } });
}

/** Saves a new version, retiring an older one that was still waiting for the customer. */
export async function saveBuild(
  projectId: string,
  data: { site: BuiltSite; html: string; qa: QaResult; copyMode: "model" | "template" },
) {
  const previous = await latestBuild(projectId);
  if (previous?.status === "PREVIEW") {
    await db.websiteBuild.update({ where: { id: previous.id }, data: { status: "SUPERSEDED" } });
  }
  const build = await db.websiteBuild.create({
    data: {
      projectId,
      version: (previous?.version ?? 0) + 1,
      status: "PREVIEW",
      siteJson: JSON.stringify(data.site),
      html: data.html,
      qaJson: JSON.stringify(data.qa),
      copyMode: data.copyMode,
    },
  });

  // One stable private preview link per project, reused by every version.
  const project = await db.project.findUniqueOrThrow({ where: { id: projectId }, select: { previewToken: true } });
  if (!project.previewToken) {
    await db.project.update({ where: { id: projectId }, data: { previewToken: generateStatusToken() } });
  }
  return build;
}

export function previewUrlFor(token: string): string {
  const base = process.env.APP_BASE_URL ?? "http://localhost:3000";
  return `${base}/preview/${token}`;
}
