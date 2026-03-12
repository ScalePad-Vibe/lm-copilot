/**
 * ScalePad API call abstraction.
 *
 * POC mode: simulates a 1.5s API call and returns mock data.
 * PRODUCTION: uncomment the real fetch block and remove the mock logic.
 */

export interface ApiResponse {
  success: boolean;
  affected: number;
  timestamp: string;
  error?: string;
}

export async function callScalePadApi(
  endpoint: string,
  apiKey: string,
  payload: Record<string, unknown>
): Promise<ApiResponse> {
  // --- POC: simulate response ---
  await new Promise((r) => setTimeout(r, 1500));

  // Randomly fail ~10% of calls to test error UI
  if (Math.random() < 0.1) {
    return {
      success: false,
      affected: 0,
      timestamp: new Date().toISOString(),
      error: "Simulated API error — could not reach ScalePad endpoint.",
    };
  }

  return {
    success: true,
    affected: Math.floor(Math.random() * 50) + 5,
    timestamp: new Date().toISOString(),
  };

  // --- PRODUCTION: uncomment below ---
  // const res = await fetch(`https://api.scalepad.com${endpoint}`, {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${apiKey}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(payload),
  // });
  // if (!res.ok) {
  //   return { success: false, affected: 0, timestamp: new Date().toISOString(), error: res.statusText };
  // }
  // return await res.json();
}

/** Mask an API key for display: show first 4 and last 4 chars */
export function maskApiKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}${"•".repeat(Math.min(key.length - 8, 16))}${key.slice(-4)}`;
}
