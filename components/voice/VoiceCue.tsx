"use client";

import { useEffect } from "react";
import { setCueOverride } from "@/lib/voice/cueOverride";

/** Renders nothing. Tells the voice guide which line belongs to this page, for as long as the page is open. */
export function VoiceCue({ id }: { id: string }) {
  useEffect(() => {
    setCueOverride(id);
    return () => setCueOverride(null);
  }, [id]);
  return null;
}
