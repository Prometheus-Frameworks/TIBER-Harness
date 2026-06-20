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
 * lineup, trade, add/drop, waiver, or ranking *recommendations*.
 *
 * Detection is per-sentence and split into two tiers so we catch concrete
 * advice (including named-player imperatives like "START Josh Allen" or
 * "Buy Puka") without false-positiving neutral descriptive text or an explicit
 * "no recommendation is provided" disclaimer:
 *
 *  - STRONG signals — imperative/recommendation framing or an advice verb
 *    aimed at a named player. A disclaimer can NEVER rescue these.
 *  - WEAK signals — bare advice keywords ("start/sit", "lineup recommendation").
 *    Real advice, but suppressible by an explicit "none provided" disclaimer in
 *    the same sentence (so "No start/sit, trade, or lineup recommendation is
 *    provided" stays clean).
 */
const STRONG_ADVICE_PATTERNS: RegExp[] = [
  /\b(?:you should|i (?:recommend|suggest|advise)|recommend(?:ed|ation|ing|s)?) (?:start|sit|bench|trad(?:e|ing)|drop|add|pick up|stash|buy(?:ing)?|sell(?:ing)?)/,
  /\b(?:start|sit|bench|trade|drop|buy|sell|stash|fade) (?:him|her|them|your|player|this player)\b/,
];

const WEAK_ADVICE_PATTERNS: RegExp[] = [
  /\bstart\/sit\b/,
  /\bset (?:your )?lineup\b/,
  /\b(?:add|drop|waiver) (?:recommendation|advice|priority)\b/,
  /\b(?:trade|buy|sell) (?:recommendation|advice|target|away)\b/,
  /\b(?:lineup|ranking) recommendation\b/,
  /\brank(?:ed|ing)? (?:him|her|them) (?:ahead of|over|above|below)\b/,
  /\bbest (?:start|play|lineup) this week\b/,
];

/**
 * Advice verbs that, when aimed directly at a Capitalized player name, are
 * unambiguous fantasy advice — e.g. "START Josh Allen", "Buy Puka",
 * "Sell Josh Allen", "trading for Puka Nacua". Verb case is matched explicitly
 * (lower / Title / UPPER) so the trailing `[A-Z][a-z]+` name class can stay
 * case-sensitive (a `/i` flag would make `[A-Z]` match lowercase too).
 */
const NAMED_PLAYER_VERB_STEMS = [
  'start', 'sit', 'bench', 'trade', 'trading', 'buy', 'buying', 'sell', 'selling',
  'drop', 'add', 'stash', 'fade', 'flex', 'target', 'roster', 'rostering', 'acquire',
];
const NAMED_PLAYER_VERB_ALT = NAMED_PLAYER_VERB_STEMS.flatMap((stem) => [
  stem,
  stem.charAt(0).toUpperCase() + stem.slice(1),
  stem.toUpperCase(),
]).join('|');
const NAMED_PLAYER_ADVICE = new RegExp(
  `\\b(?:${NAMED_PLAYER_VERB_ALT})\\b\\s+(?:for\\s+|away\\s+|up\\s+|on\\s+)?[A-Z][a-z]+`,
);

/**
 * An explicit "no/without ... recommendation/advice ... provided/given" clause.
 * Only such a clause can suppress a WEAK keyword match. It cannot suppress a
 * STRONG signal, so "you should start Josh (no recommendation provided)" is
 * still flagged.
 */
const NO_ADVICE_DISCLAIMER =
  /\b(?:no|without)\b[^.!?]*\b(?:recommendation|advice|suggestion|call)s?\b[^.!?]*\b(?:provided|given|offered|made|included|present|here|intended)\b/;

/** Split into sentences so a disclaimer in one sentence can't mask advice in another. */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function sentenceIsContaminated(sentence: string): boolean {
  const norm = normalize(sentence);
  // STRONG signals are decisive; a disclaimer cannot rescue them.
  if (STRONG_ADVICE_PATTERNS.some((p) => p.test(norm))) return true;
  if (NAMED_PLAYER_ADVICE.test(sentence)) return true;
  // WEAK signals are advice unless the sentence explicitly disclaims providing any.
  if (WEAK_ADVICE_PATTERNS.some((p) => p.test(norm))) {
    return !NO_ADVICE_DISCLAIMER.test(norm);
  }
  return false;
}

/** Detect fantasy-advice contamination in any collected text. */
export function detectFantasyAdvice(texts: string[]): Finding[] {
  for (const text of texts) {
    for (const sentence of splitSentences(text)) {
      if (sentenceIsContaminated(sentence)) {
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
