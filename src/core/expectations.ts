/**
 * Expectation checking shared by every eval runner.
 *
 * A fixture's `expect` block is calibrated against the deterministic pipeline.
 * For the MockProvider it is a hard pass/fail gate (the canned response is known
 * good/bad). For a real model provider (e.g. Ollama) the same comparison is
 * informational — it tells the operator how the live model's run diverges from
 * the mock-calibrated baseline. Either way the comparison logic is identical, so
 * it lives here once.
 */

import type { FixtureExpectation, RunResult } from './types.ts';

export interface CheckedResult extends RunResult {
  expectationsMet: boolean;
  mismatches: string[];
}

export function checkExpectations(
  result: RunResult,
  expect: FixtureExpectation,
): { ok: boolean; mismatches: string[] } {
  const mismatches: string[] = [];
  if (result.jsonValid !== expect.jsonValid) {
    mismatches.push(`jsonValid expected ${expect.jsonValid}, got ${result.jsonValid}`);
  }
  if (result.schemaValid !== expect.schemaValid) {
    mismatches.push(`schemaValid expected ${expect.schemaValid}, got ${result.schemaValid}`);
  }
  if (result.verdict.promotionReady !== expect.promotionReady) {
    mismatches.push(
      `promotionReady expected ${expect.promotionReady}, got ${result.verdict.promotionReady}`,
    );
  }
  const codes = new Set(result.verdict.findings.map((f) => f.code));
  for (const expected of expect.findingCodes ?? []) {
    if (!codes.has(expected)) {
      mismatches.push(`missing expected finding "${expected}"`);
    }
  }
  return { ok: mismatches.length === 0, mismatches };
}
