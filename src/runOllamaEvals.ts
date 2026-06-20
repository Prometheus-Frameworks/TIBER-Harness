/**
 * Ollama eval runner — the `npm run eval:ollama` entrypoint (LOCAL ONLY).
 *
 * Runs every existing skill fixture through a locally running Ollama model
 * instead of the MockProvider, applies the exact same deterministic pipeline,
 * and writes a local report tagged with the provider and model. This is an
 * opt-in stress-test path, not a CI gate:
 *
 *   - It is never run in CI. It requires `TIBER_HARNESS_ALLOW_NETWORK=1`
 *     (loopback HTTP is still a network call) and a `OLLAMA_MODEL`.
 *   - Each fixture's `expect` block was calibrated against the MockProvider's
 *     canned response, so a live model legitimately diverges from it. We report
 *     the divergence for human comparison against the baseline, but DO NOT exit
 *     non-zero on it. We exit non-zero only on operational failures (missing
 *     opt-in/model, Ollama unreachable, etc.).
 *
 * The model's output stays advisory: validateJson, validateSchema, the skill
 * validators, and applyDeterministicOverrides decide every verdict, identically
 * to the mock path.
 */

import { OllamaProvider } from './providers/OllamaProvider.ts';
import { assertCiSafe } from './core/providerRegistry.ts';
import { runSkill } from './core/runSkill.ts';
import { skills } from './skills/index.ts';
import { writeReport, type EvalReport } from './reports/writeReport.ts';
import { checkExpectations, type CheckedResult } from './core/expectations.ts';

const DEFAULT_HOST = 'http://127.0.0.1:11434';

/** Resolve config from the environment, failing clearly on any gap. */
function resolveConfig(): { host: string; model: string } {
  if (process.env.TIBER_HARNESS_ALLOW_NETWORK !== '1') {
    throw new Error(
      'eval:ollama is a network provider path and is disabled by default.\n' +
        'Set TIBER_HARNESS_ALLOW_NETWORK=1 to opt in locally (it is never set in CI).',
    );
  }

  const model = process.env.OLLAMA_MODEL?.trim();
  if (!model) {
    throw new Error(
      'OLLAMA_MODEL is required for eval:ollama and was empty.\n' +
        'Set it to an already-installed local model, e.g. OLLAMA_MODEL=llama3.1.\n' +
        '(This harness never pulls or installs models.)',
    );
  }

  const host = process.env.OLLAMA_HOST?.trim() || DEFAULT_HOST;
  return { host, model };
}

async function main(): Promise<void> {
  const { host, model } = resolveConfig();

  const provider = new OllamaProvider({ host, model });
  // Enforces the network opt-in the same way the mock path is kept CI-safe.
  assertCiSafe(provider);

  console.log(`Provider: ${provider.name} (model=${provider.model}, host=${host})`);
  console.log('Running existing fixtures through the local model…\n');

  const results: CheckedResult[] = [];

  for (const skill of skills) {
    for (const fixture of skill.fixtures) {
      // No canned response is registered: the live model produces the raw output.
      const result = await runSkill(skill, fixture, provider);
      const { ok, mismatches } = checkExpectations(result, fixture.expect);
      results.push({ ...result, expectationsMet: ok, mismatches });
    }
  }

  // For the Ollama path, "passed" means "matched the mock-calibrated baseline".
  const matched = results.filter((r) => r.expectationsMet).length;
  const diverged = results.length - matched;

  const report: EvalReport = {
    generatedAt: new Date().toISOString(),
    provider: provider.name,
    model: provider.model,
    total: results.length,
    passed: matched,
    failed: diverged,
    results,
  };

  const { jsonPath, markdownPath } = writeReport(report);

  // Console summary. BASE = matches the MockProvider baseline; DIFF = diverges.
  for (const r of results) {
    const tag = r.expectationsMet ? 'BASE' : 'DIFF';
    const codes = r.verdict.findings.map((f) => f.code).join(', ') || '—';
    console.log(
      `[${tag}] ${r.skill}/${r.fixtureId} :: stage=${r.stage} promotion_ready=${r.verdict.promotionReady} findings=${codes}`,
    );
    if (!r.expectationsMet) {
      for (const m of r.mismatches) console.log(`        ↳ vs baseline: ${m}`);
    }
  }

  console.log('');
  console.log(`Provider: ${provider.name} (model=${provider.model}, network=${provider.requiresNetwork})`);
  console.log(`Report:   ${markdownPath}`);
  console.log(`          ${jsonPath}`);
  console.log(
    `Result:   ${matched}/${results.length} match the MockProvider baseline, ${diverged} diverge ` +
      '(divergence is informational, not a failure).',
  );
}

main().catch((err) => {
  // Operational failures (no opt-in, no model, Ollama unreachable, etc.) are
  // real failures and must exit non-zero with a clear message.
  console.error(`eval:ollama failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});
