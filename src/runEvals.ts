/**
 * Eval runner — the `npm test` entrypoint.
 *
 * Runs every skill fixture through the MockProvider, applies the full
 * validation pipeline, asserts each fixture's declared expectations, writes a
 * local report, prints a summary, and exits non-zero if anything failed.
 *
 * CI-safe by construction: only the MockProvider is used, no network, no keys.
 */

import { MockProvider } from './providers/MockProvider.ts';
import { assertCiSafe } from './core/providerRegistry.ts';
import { runSkill } from './core/runSkill.ts';
import { skills } from './skills/index.ts';
import { writeReport, type EvalReport } from './reports/writeReport.ts';
import { checkExpectations, type CheckedResult } from './core/expectations.ts';

async function main(): Promise<void> {
  const provider = new MockProvider();
  assertCiSafe(provider);

  const results: CheckedResult[] = [];

  for (const skill of skills) {
    for (const fixture of skill.fixtures) {
      // Hand the canned response to the mock for this fixture.
      provider.register(fixture.id, fixture.mockResponse);
      const result = await runSkill(skill, fixture, provider);
      const { ok, mismatches } = checkExpectations(result, fixture.expect);
      results.push({ ...result, expectationsMet: ok, mismatches });
    }
  }

  const passed = results.filter((r) => r.expectationsMet).length;
  const failed = results.length - passed;

  const report: EvalReport = {
    generatedAt: new Date().toISOString(),
    provider: provider.name,
    total: results.length,
    passed,
    failed,
    results,
  };

  const { jsonPath, markdownPath } = writeReport(report);

  // Console summary.
  for (const r of results) {
    const tag = r.expectationsMet ? 'PASS' : 'FAIL';
    const codes = r.verdict.findings.map((f) => f.code).join(', ') || '—';
    console.log(
      `[${tag}] ${r.skill}/${r.fixtureId} :: stage=${r.stage} promotion_ready=${r.verdict.promotionReady} findings=${codes}`,
    );
    if (!r.expectationsMet) {
      for (const m of r.mismatches) console.log(`        ↳ ${m}`);
    }
  }

  console.log('');
  console.log(`Provider: ${provider.name} (network=${provider.requiresNetwork})`);
  console.log(`Report:   ${markdownPath}`);
  console.log(`          ${jsonPath}`);
  console.log(`Result:   ${passed}/${results.length} passed, ${failed} failed`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Eval runner crashed:', err);
  process.exitCode = 1;
});
