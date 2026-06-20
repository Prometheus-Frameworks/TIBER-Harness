/**
 * Loads a skill's on-disk contract artifacts (prompt, schemas, fixtures) from
 * the skill's own directory. Keeping these as plain files — rather than inline
 * TypeScript — makes the skill contract auditable and editable without touching
 * runtime code.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { JsonSchema, SkillFixture } from '../core/types.ts';

export interface SkillAssets {
  prompt: string;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  fixtures: SkillFixture[];
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

/** Resolve and load the four contract files next to a skill's `index.ts`. */
export function loadSkillAssets(moduleUrl: string): SkillAssets {
  const dir = dirname(fileURLToPath(moduleUrl));
  return {
    prompt: readFileSync(join(dir, 'prompt.md'), 'utf8'),
    inputSchema: readJson<JsonSchema>(join(dir, 'input.schema.json')),
    outputSchema: readJson<JsonSchema>(join(dir, 'output.schema.json')),
    fixtures: readJson<SkillFixture[]>(join(dir, 'fixtures.json')),
  };
}
