/**
 * Local report output. Writes a machine-readable JSON report and a
 * human-readable Markdown summary into `data/reports/`. No network, no upload —
 * reports stay local (and the directory is gitignored except for `.gitkeep`).
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RunResult } from '../core/types.ts';

export interface EvalReport {
  generatedAt: string;
  provider: string;
  /** Model name, when the provider runs an actual model (e.g. Ollama). */
  model?: string;
  total: number;
  passed: number;
  failed: number;
  results: Array<
    RunResult & {
      expectationsMet: boolean;
      mismatches: string[];
    }
  >;
}

/** Resolve `<repo>/data/reports`. */
function reportsDir(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  // src/reports -> repo root
  return join(here, '..', '..', 'data', 'reports');
}

function toMarkdown(report: EvalReport): string {
  const lines: string[] = [];
  lines.push(`# TIBER-Harness eval report`);
  lines.push('');
  lines.push(`- Generated: ${report.generatedAt}`);
  lines.push(`- Provider: \`${report.provider}\``);
  if (report.model) {
    lines.push(`- Model: \`${report.model}\``);
  }
  lines.push(`- Result: **${report.passed}/${report.total} passed**, ${report.failed} failed`);
  lines.push('');
  lines.push('| skill | fixture | stage | promotion_ready | model_claimed | expectations | findings |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- |');
  for (const r of report.results) {
    const claimed = r.verdict.modelClaimedPromotionReady;
    const claimedStr = claimed === null || claimed === undefined ? '—' : String(claimed);
    const codes = r.verdict.findings.map((f) => f.code).join(', ') || '—';
    lines.push(
      `| ${r.skill} | ${r.fixtureId} | ${r.stage} | ${r.verdict.promotionReady} | ${claimedStr} | ${r.expectationsMet ? '✅' : '❌'} | ${codes} |`,
    );
  }
  lines.push('');
  const failures = report.results.filter((r) => !r.expectationsMet);
  if (failures.length > 0) {
    lines.push('## Mismatches');
    lines.push('');
    for (const r of failures) {
      lines.push(`- **${r.skill}/${r.fixtureId}**: ${r.mismatches.join('; ')}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

export function writeReport(report: EvalReport): { jsonPath: string; markdownPath: string } {
  const dir = reportsDir();
  mkdirSync(dir, { recursive: true });
  const jsonPath = join(dir, 'latest.json');
  const markdownPath = join(dir, 'latest.md');
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  writeFileSync(markdownPath, toMarkdown(report));
  return { jsonPath, markdownPath };
}
