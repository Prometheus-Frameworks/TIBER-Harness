import type { SkillDefinition } from '../../core/types.ts';
import { loadSkillAssets } from '../loadSkill.ts';
import { validate } from './validate.ts';

const assets = loadSkillAssets(import.meta.url);

const safetyContamination: SkillDefinition = {
  name: 'safety_contamination',
  ...assets,
  validate,
};

export default safetyContamination;
