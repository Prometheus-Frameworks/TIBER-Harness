/**
 * runSkill — the single orchestration path every skill run flows through.
 *
 * Pipeline (each stage can only narrow the outcome, never widen it):
 *   1. Validate the trusted input against the skill input schema (config guard).
 *   2. Ask the provider for a completion (untrusted raw string).
 *   3. validateJson — fail closed on malformed output.
 *   4. validateSchema — fail closed on shape mismatch.
 *   5. skill.validate — deterministic, skill-specific verdict (advisory baseline).
 *   6. applyDeterministicOverrides — authoritative cross-cutting backstop.
 *
 * At no point is the model's own promotion claim trusted: it is recorded as
 * `modelClaimedPromotionReady` for the report and then ignored.
 */

import type { ModelProvider, RunResult, SkillDefinition, SkillFixture } from './types.ts';
import { validateJson } from './validateJson.ts';
import { validateSchema } from './validateSchema.ts';
import { applyDeterministicOverrides } from './applyDeterministicOverrides.ts';

/** A rejected run, with promotion forced closed. */
function rejected(
  skill: string,
  fixtureId: string,
  provider: string,
  stage: 'json_invalid' | 'schema_invalid',
  raw: string,
  errors: string[],
  jsonValid: boolean,
): RunResult {
  return {
    skill,
    fixtureId,
    provider,
    stage,
    jsonValid,
    schemaValid: false,
    rawOutput: raw,
    errors,
    verdict: {
      promotionReady: false,
      findings: [
        {
          code: stage === 'json_invalid' ? 'json_parse_failed' : 'schema_validation_failed',
          message:
            stage === 'json_invalid'
              ? 'Provider output was not valid JSON; failing closed.'
              : 'Provider output did not satisfy the skill output schema; failing closed.',
          severity: 'block',
        },
      ],
      modelClaimedPromotionReady: null,
    },
  };
}

export async function runSkill(
  skill: SkillDefinition,
  fixture: SkillFixture,
  provider: ModelProvider,
): Promise<RunResult> {
  // Stage 1: input is trusted fixture data, but a bad schema here is a harness
  // configuration bug we want surfaced loudly rather than silently passed on.
  const inputCheck = validateSchema(fixture.input, skill.inputSchema);
  if (!inputCheck.valid) {
    throw new Error(
      `Fixture "${fixture.id}" input violates ${skill.name} input schema: ${inputCheck.errors.join('; ')}`,
    );
  }

  // Stage 2: untrusted model call.
  const response = await provider.complete({
    prompt: skill.prompt,
    input: fixture.input,
    skill: skill.name,
    fixtureId: fixture.id,
  });
  const raw = response.raw;

  // Stage 3: JSON gate (fail closed).
  const parsed = validateJson(raw);
  if (!parsed.ok) {
    return rejected(skill.name, fixture.id, provider.name, 'json_invalid', raw, [parsed.error ?? 'invalid JSON'], false);
  }

  // Stage 4: schema gate (fail closed).
  const schemaCheck = validateSchema(parsed.value, skill.outputSchema);
  if (!schemaCheck.valid) {
    return rejected(skill.name, fixture.id, provider.name, 'schema_invalid', raw, schemaCheck.errors, true);
  }

  // Stage 5: skill-specific deterministic verdict (advisory baseline).
  const baseVerdict = skill.validate(fixture.input, parsed.value);

  // Stage 6: authoritative override backstop.
  const verdict = applyDeterministicOverrides(fixture.input, parsed.value, baseVerdict);

  return {
    skill: skill.name,
    fixtureId: fixture.id,
    provider: provider.name,
    stage: 'validated',
    jsonValid: true,
    schemaValid: true,
    rawOutput: raw,
    errors: [],
    verdict,
  };
}
