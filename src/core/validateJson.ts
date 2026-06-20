/**
 * Deterministic JSON parse gate. Fails closed: any parse error yields
 * `{ ok: false }` and the caller must treat the run as rejected.
 *
 * Model output is untrusted text. This is the first boundary that turns a
 * string into structured data — and the first place a malformed model can be
 * caught without ever influencing a promotion decision.
 */

export interface JsonParseResult {
  ok: boolean;
  value?: unknown;
  error?: string;
}

/** Strip a single fenced code block (```json ... ```), if present. */
function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*\n([\s\S]*?)\n```$/;
  const match = trimmed.match(fence);
  return match && match[1] !== undefined ? match[1].trim() : trimmed;
}

export function validateJson(raw: string): JsonParseResult {
  if (typeof raw !== 'string' || raw.trim() === '') {
    return { ok: false, error: 'empty or non-string provider output' };
  }
  const candidate = stripCodeFence(raw);
  try {
    const value = JSON.parse(candidate);
    return { ok: true, value };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `invalid JSON: ${message}` };
  }
}
