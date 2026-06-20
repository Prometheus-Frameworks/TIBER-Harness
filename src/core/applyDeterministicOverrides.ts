/**
 * The authoritative backstop. After the per-skill validator proposes a verdict,
 * this layer scans the trusted input and the model output for universal,
 * cross-cutting safety violations and can ONLY ever flip `promotionReady`
 * from true to false — never the reverse.
 *
 * This is the concrete enforcement of "Model output is advisory. Validators are
 * authoritative.": even if a skill validator (or the model) said promotion was
 * fine, a single block-severity finding here forces it closed.
 */

import type { Finding, SkillVerdict } from './types.ts';
import {
  collectStrings,
  detectFantasyAdvice,
  detectPromptInjection,
} from './detectors.ts';

/** Merge findings, de-duplicating by code. */
function mergeFindings(base: Finding[], extra: Finding[]): Finding[] {
  const seen = new Set(base.map((f) => f.code));
  const merged = [...base];
  for (const f of extra) {
    if (!seen.has(f.code)) {
      merged.push(f);
      seen.add(f.code);
    }
  }
  return merged;
}

export function applyDeterministicOverrides(
  input: unknown,
  output: unknown,
  verdict: SkillVerdict,
): SkillVerdict {
  // Scan everything the model produced AND everything it was given. Embedded
  // instructions can live in either the input artifact or the model echo.
  const texts = [...collectStrings(input), ...collectStrings(output)];

  const overrideFindings: Finding[] = [
    ...detectPromptInjection(texts),
    ...detectFantasyAdvice(texts),
  ];

  const findings = mergeFindings(verdict.findings, overrideFindings);
  const hasBlock = findings.some((f) => f.severity === 'block');

  return {
    ...verdict,
    findings,
    // Fail closed: any block finding forces promotion closed. A passing
    // verdict can be revoked here; a failing one can never be revived.
    promotionReady: verdict.promotionReady && !hasBlock,
  };
}
