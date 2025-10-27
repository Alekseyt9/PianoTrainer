import { warmupGroup } from './warmup.js';
import { intervalsGroup } from './intervals.js';
import { whiteKeysGroup } from './white-keys.js';
import { starterScalesGroup } from './starter-scales.js';
import { patternsGroup } from './patterns.js';

export { warmupGroup, intervalsGroup, whiteKeysGroup, starterScalesGroup, patternsGroup };

export const exerciseGroups = [warmupGroup, intervalsGroup, whiteKeysGroup, starterScalesGroup, patternsGroup];
export const exercises = exerciseGroups.flatMap(group => group.exercises);
