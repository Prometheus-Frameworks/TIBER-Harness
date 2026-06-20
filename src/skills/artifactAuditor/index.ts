import type { SkillDefinition } from '../../core/types.ts';
import { loadSkillAssets } from '../loadSkill.ts';
import { validate } from './validate.ts';

const assets = loadSkillAssets(import.meta.url);

const artifactAuditor: SkillDefinition = {
  name: 'artifact_auditor',
  ...assets,
  validate,
};

export default artifactAuditor;
