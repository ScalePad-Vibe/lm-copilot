/**
 * ScalePad API — shared utilities
 *
 * Lightweight helpers used across the application.
 * For full API integration logic, see:
 *   - src/lib/api-client.ts      — proxy call + pagination
 *   - src/lib/initiative-api.ts  — initiatives CRUD + deploy
 *   - src/lib/goal-api.ts        — goals CRUD + deploy
 */

/** Shape returned by a ScalePad write operation (POC / legacy). */
export interface ApiResponse {
  success: boolean;
  affected: number;
  timestamp: string;
  error?: string;
}

/**
 * Mask an API key for safe display.
 * Shows the first 4 and last 4 characters with dots in between.
 *
 * @example maskApiKey("sk_live_abcd1234efgh5678") → "sk_l••••••••5678"
 */
export function maskApiKey(key: string): string {
  if (!key || key.length <= 8) return "••••••••";
  const dots = "•".repeat(Math.min(key.length - 8, 16));
  return `${key.slice(0, 4)}${dots}${key.slice(-4)}`;
}
