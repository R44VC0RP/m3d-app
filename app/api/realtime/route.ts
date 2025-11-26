import { handle } from "@upstash/realtime";
import { realtime } from "@/lib/realtime";

// Match timeout to realtime config (5 minutes)
export const maxDuration = 300;

export const GET = handle({ realtime });

