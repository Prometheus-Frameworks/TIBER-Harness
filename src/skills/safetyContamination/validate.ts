/**
 * Deterministic validator for the safety_contamination skill.
 *
 * It re-derives contamination from the candidate `responseText` itself rather
 * than trusting the model's self-report. If fantasy advice is present, the
 * verdict is closed regardless of what the model claimed. (The shared override
 * backstop also scans the same text, so this fails closed even if this
 * validator were bypassed — defense in depth.)
 */

import type { SkillValidator, SkillVerdict, Finding } from '../../core/types.ts';
import { detectFantasyAdvice } from '../../core/detectors.ts';

interface ContaminationInput {
  candidateId: string;
  context?: string;
  responseText: string;
}

interface ContaminationOutput {
  candidateId: string;
  contaminated: boolean;
  categories: string[];
  promotion_ready: boolean;
}

export const validate: SkillValidator = (rawInput, rawOutput): SkillVerdict => {
  const input = rawInput as ContaminationInput;
  const output = rawOutput as ContaminationOutput;

  const findings: Finding[] = detectFantasyAdvice([input.responseText]);
  const contaminated = findings.length > 0;

  // Record when the model under-reported contamination — useful signal about
  // whether a provider can be trusted to self-police.
  if (contaminated && output.contaminated === false) {
    findings.push({
      code: 'model_underreported_contamination',
      message: 'Model reported contaminated=false but fantasy advice was detected in the response.',
      severity: 'warning',
    });
  }

  return {
    promotionReady: !contaminated,
    findings,
    modelClaimedPromotionReady: output.promotion_ready,
  };
};
