import type { SkillDefinition } from '../core/types.ts';
import artifactAuditor from './artifactAuditor/index.ts';
import safetyContamination from './safetyContamination/index.ts';

/** All skills the harness evaluates. Add new skills here. */
export const skills: SkillDefinition[] = [artifactAuditor, safetyContamination];
