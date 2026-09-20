import { createHash } from "crypto";

/** A short fingerprint of a spoken line's exact words. Stored with each recording, so a recording whose words later change is caught. Server and test use only. */
export const textSha = (text: string): string => createHash("sha1").update(text).digest("hex").slice(0, 12);
