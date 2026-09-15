/*
  Warnings:

  - Added the required column `passed` to the `PerceptionReport` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PerceptionReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "firstImpression" INTEGER NOT NULL,
    "clarity" INTEGER NOT NULL,
    "trust" INTEGER NOT NULL,
    "premiumFeel" INTEGER NOT NULL,
    "emotionalImpact" INTEGER NOT NULL,
    "visualHierarchy" INTEGER NOT NULL,
    "desire" INTEGER NOT NULL,
    "friction" INTEGER NOT NULL,
    "conversionConfidence" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PerceptionReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PerceptionReport" ("clarity", "conversionConfidence", "createdAt", "desire", "emotionalImpact", "firstImpression", "friction", "id", "notes", "premiumFeel", "projectId", "trust", "visualHierarchy") SELECT "clarity", "conversionConfidence", "createdAt", "desire", "emotionalImpact", "firstImpression", "friction", "id", "notes", "premiumFeel", "projectId", "trust", "visualHierarchy" FROM "PerceptionReport";
DROP TABLE "PerceptionReport";
ALTER TABLE "new_PerceptionReport" RENAME TO "PerceptionReport";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
