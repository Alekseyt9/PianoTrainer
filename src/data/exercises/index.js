import { warmupGroup as rawWarmupGroup } from './warmup.js';
import { intervalsGroup as rawIntervalsGroup } from './intervals.js';
import { whiteKeysGroup as rawWhiteKeysGroup } from './white-keys.js';
import { starterScalesGroup as rawStarterScalesGroup } from './starter-scales.js';
import { patternsGroup as rawPatternsGroup } from './patterns.js';
import { normalizeStepNoteNames, getMidiNumberByName, getPreferredNoteName } from '../notes_metadata.js';

const DEFAULT_ACCIDENTAL_PREFERENCE = 'sharp';
const MIN_EXERCISE_STEPS = 100;
const ACCIDENTAL_PREFERENCE_MAP = new Map([
    ['accidentals-flat-walk', 'flat'],
    ['accidentals-mixed-chords', 'flat'],
    ['accidentals-sharp-ladder', 'sharp'],
    ['scale-f-fragment', 'flat'],
    ['scale-g-fragment', 'sharp'],
    ['warmup-skip', 'sharp']
]);

function cloneDeep(value) {
    return JSON.parse(JSON.stringify(value));
}

function collectNoteNames(step) {
    return normalizeStepNoteNames(step);
}

function determinePreference(exercise) {
    const explicit = exercise.accidentalPreference;
    if (explicit === 'flat' || explicit === 'sharp') {
        return explicit;
    }
    const mapped = ACCIDENTAL_PREFERENCE_MAP.get(exercise.id);
    if (mapped) {
        return mapped;
    }

    const noteNames = exercise.steps.flatMap(collectNoteNames);
    const hasSharp = noteNames.some(name => name.includes('#'));
    const hasFlat = noteNames.some(name => name.includes('b'));

    if (hasFlat && !hasSharp) {
        return 'flat';
    }
    if (hasSharp && !hasFlat) {
        return 'sharp';
    }
    if (hasFlat && hasSharp) {
        return DEFAULT_ACCIDENTAL_PREFERENCE;
    }
    return DEFAULT_ACCIDENTAL_PREFERENCE;
}

function convertStep(step, preference) {
    if (typeof step !== 'string') {
        return step;
    }
    const noteNames = normalizeStepNoteNames(step);
    if (!noteNames.length) {
        return step.trim();
    }
    const midiNumbers = noteNames
        .map(getMidiNumberByName)
        .filter(midi => typeof midi === 'number');
    if (!midiNumbers.length) {
        return step.trim();
    }
    const converted = midiNumbers.map(midi => getPreferredNoteName(midi, preference));
    return converted.join(' ');
}

function ensureMinimumSteps(steps, minimum = MIN_EXERCISE_STEPS) {
    if (!Array.isArray(steps) || !steps.length) {
        return steps;
    }
    const base = steps.slice();
    const result = steps.slice();
    let index = 0;
    while (result.length < Math.max(1, minimum)) {
        result.push(base[index % base.length]);
        index += 1;
    }
    return result;
}

function normalizeExercise(exercise) {
    const clone = cloneDeep(exercise);
    const preference = determinePreference(clone);
    clone.accidentalPreference = preference;
    const convertedSteps = clone.steps.map(step => convertStep(step, preference));
    clone.steps = ensureMinimumSteps(convertedSteps);
    return clone;
}

function normalizeGroup(group) {
    const clone = cloneDeep(group);
    clone.exercises = (clone.exercises || []).map(normalizeExercise);
    return clone;
}

export const warmupGroup = normalizeGroup(rawWarmupGroup);
export const intervalsGroup = normalizeGroup(rawIntervalsGroup);
export const whiteKeysGroup = normalizeGroup(rawWhiteKeysGroup);
export const starterScalesGroup = normalizeGroup(rawStarterScalesGroup);
export const patternsGroup = normalizeGroup(rawPatternsGroup);

export const exerciseGroups = [warmupGroup, intervalsGroup, whiteKeysGroup, starterScalesGroup, patternsGroup];
export const exercises = exerciseGroups.flatMap(group => group.exercises);
