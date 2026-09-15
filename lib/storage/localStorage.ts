import { mkdir, writeFile } from "fs/promises";
import path from "path";

const STORAGE_ROOT = path.join(process.cwd(), ".storage");

/**
 * Filesystem-backed storage for local/dev use. Swap for an S3-compatible
 * client behind this same signature to go live — callers don't change.
 */
export async function saveFile(relativePath: string, contents: string | Buffer): Promise<string> {
  const fullPath = path.join(STORAGE_ROOT, relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, contents);
  return relativePath;
}

export function storageRoot() {
  return STORAGE_ROOT;
}
