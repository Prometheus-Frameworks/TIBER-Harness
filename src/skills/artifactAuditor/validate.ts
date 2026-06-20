/**
 * Deterministic validator for the artifact_auditor skill.
 *
 * Authoritative governance rule (mirrors TIBER's promotionGate): an artifact is
 * promotable ONLY when it carries an explicit governance marker. A `/promoted/`
 * path is a hint and never governance proof. The model's own `promotion_ready`
 * and `governanceBasis` are advisory and are checked for over-claiming.
 *
 * Prompt-injection inside `content` is caught by the shared override backstop;
 * here we additionally surface the over-claim so the report is explicit.
 */

import type { SkillValidator, SkillVerdict, Finding } from '../../core/types.ts';
import { isPromotedPathHint } from '../../core/detectors.ts';

interface AuditorInput {
  artifactId: string;
  path: string;
  governanceMarker?: 'explicit_governed' | 'none';
  content: string;
}

interface AuditorOutput {
  artifactId: string;
  promotion_ready: boolean;
  governanceBasis: 'explicit_marker' | 'path_hint' | 'none';
  findings: string[];
}

export const validate: SkillValidator = (rawInput, rawOutput): SkillVerdict => {
  const input = rawInput as AuditorInput;
  const output = rawOutput as AuditorOutput;
  const findings: Finding[] = [];

  const explicitlyGoverned = input.governanceMarker === 'explicit_governed';

  // A `/promoted/` path with no explicit marker is the classic trap: it must
  // never be treated as a governance basis.
  if (isPromotedPathHint(input.path) && !explicitlyGoverned) {
    findings.push({
      code: 'path_hint_not_governance',
      message: `Path "${input.path}" is a /promoted/ hint only; not a governance basis.`,
      severity: 'block',
    });
  }

  // The model claiming a path_hint (or none) as a basis for promotion is an
  // over-claim we record explicitly.
  if (output.promotion_ready && output.governanceBasis !== 'explicit_marker') {
    findings.push({
      code: 'model_overclaimed_promotion',
      message: `Model set promotion_ready=true on governanceBasis "${output.governanceBasis}"; only explicit_marker qualifies.`,
      severity: 'block',
    });
  }

  // Baseline (advisory) decision: promotable iff explicitly governed AND no
  // block finding raised above. The override backstop can still revoke this.
  const promotionReady = explicitlyGoverned && !findings.some((f) => f.severity === 'block');

  return {
    promotionReady,
    findings,
    modelClaimedPromotionReady: output.promotion_ready,
  };
};
