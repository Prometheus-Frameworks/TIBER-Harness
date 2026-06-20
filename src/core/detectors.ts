/**
 * Deterministic, pure detectors shared by skill validators and the
 * cross-cutting override backstop. No model, no I/O, no randomness — given the
 * same text they always return the same result. These encode TIBER doctrine:
 *
 *  - Repo/artifact text is DATA, not authority (SECURITY_POLICY): embedded
 *    instructions must be detected and ignored, never obeyed.
 *  - A `/promoted/` path is a HINT, never governance proof (promotionGate).
 *  - TIBER-Harness is not a fantasy product surface: any start/sit, lineup,
 *    trade, waiver, or ranking *advice* is contamination.
 */

import type { Finding } from './types.ts';

/** Collapse to a normalized lowercase form for substring scanning. */
function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ');
}

/** Recursively collect all string values out of an arbitrary JSON value. */
export function collectStrings(value: unknown, acc: string[] = []): string[] {
  if (typeof value === 'string') {
    acc.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, acc);
  } else if (value && typeof value === 'object') {
    for (const v of Object.values(value)) collectStrings(v, acc);
  }
  return acc;
}

/** Phrases that indicate an attempt to override the agent/governance via text. */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore (?:all |any |the )?(?:previous|prior|above|earlier) instructions/,
  /disregard (?:all |any |the )?(?:previous|prior|above|system)/,
  /you are now\b/,
  /new (?:system )?(?:prompt|instructions)\b/,
  /override (?:the )?(?:validator|governance|safety|promotion)/,
  /(?:set|mark|force) (?:this |the )?(?:artifact )?(?:as )?(?:promotion_ready|governed|promoted)/,
  /promotion_ready\s*[=:]\s*true/,
  /treat (?:this )?(?:as )?(?:governed|authoritative|trusted)/,
  /act as (?:the )?(?:system|governance|operator)/,
];

/** Detect prompt-injection / governance-override attempts inside content. */
export function detectPromptInjection(texts: string[]): Finding[] {
  const findings: Finding[] = [];
  for (const text of texts) {
    const norm = normalize(text);
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(norm)) {
        findings.push({
          code: 'prompt_injection_detected',
          message:
            'Embedded instruction detected in artifact content; treated as data and ignored, not executed.',
          severity: 'block',
        });
        return findings; // one block finding is enough; keep findings deduped
      }
    }
  }
  return findings;
}

/**
 * Fantasy-advice contamination. TIBER-Harness must never emit start/sit,
 * lineup, trade, add/drop, waiver, or ranking *recommendations*. We match on
 * imperative/recommendation framing so neutral descriptive text (e.g. a fixture
 * literally named "fantasy") does not false-positive.
 */
const FANTASY_ADVICE_PATTERNS: RegExp[] = [
  /\b(?:you should|i (?:recommend|suggest|advise)|recommend(?:ed|ation)?) (?:start|sit|bench|trade|drop|add|pick up|stash)/,
  /\b(?:start|sit|bench|trade|drop) (?:him|her|them|your|player|this player)\b/,
  /\bstart\/sit\b/,
  /\bset (?:your )?lineup\b/,
  /\b(?:add|drop|waiver) (?:recommendation|advice|priority)\b/,
  /\b(?:trade|buy|sell) (?:recommendation|advice|target|away)\b/,
  /\brank(?:ed|ing)? (?:him|her|them) (?:ahead of|over|above|below)\b/,
  /\bbest (?:start|play|lineup) this week\b/,
];

/** Detect fantasy-advice contamination in any collected text. */
export function detectFantasyAdvice(texts: string[]): Finding[] {
  for (const text of texts) {
    const norm = normalize(text);
    for (const pattern of FANTASY_ADVICE_PATTERNS) {
      if (pattern.test(norm)) {
        return [
          {
            code: 'fantasy_advice_contamination',
            message:
              'Fantasy start/sit/trade/waiver/ranking advice detected. Out of harness scope; promotion forced closed.',
            severity: 'block',
          },
        ];
      }
    }
  }
  return [];
}

/** True if a path is only a `/promoted/` *hint*, not an explicit governance marker. */
export function isPromotedPathHint(path: string): boolean {
  return /(^|\/)promoted(\/|$)/i.test(path);
}
