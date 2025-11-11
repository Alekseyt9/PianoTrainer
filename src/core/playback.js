import { findNoteByMidi, getPreferredNoteName } from '../data/notes_metadata.js';
import { getKeyboardSvg, getNotationSvg } from './context.js';
import { setPressedKey, getPressedKey, deletePressedKey } from './state.js';
import { createVisualNote, removeVisualNote, resolveStepPosition } from '../ui/notes_generator.js';
import { getCurrentExercise, getCurrentIndex, handleNoteInput, handleNoteRelease } from './exercise.js';
import { getThemeColor } from '../ui/theme.js';
import { recordCorrectAttempt, recordErrorAttempt, isInputLocked } from '../ui/stats_panel.js';

let onScoreIncrement = null;
const DEFAULT_ACCIDENTAL_PREFERENCE = 'sharp';

export function registerScoreHandler(handler) {
    onScoreIncrement = typeof handler === 'function' ? handler : null;
}

export function noteOn(noteNumber) {
    const keyboardSvg = getKeyboardSvg();
    const keyElement = keyboardSvg
        ? keyboardSvg.querySelector(`[data-note-number="${noteNumber}"]`)
        : null;
    if (keyElement) {
        keyElement.classList.add('active');
    }

    if (isInputLocked()) {
        return;
    }

    const noteMeta = findNoteByMidi(noteNumber);
    if (!noteMeta) {
        return;
    }

    const exercise = getCurrentExercise();
    const preference = exercise?.accidentalPreference ?? DEFAULT_ACCIDENTAL_PREFERENCE;
    const { cx: targetCx, offsetY, displayName } = resolveCurrentStepPosition(noteNumber);
    const playbackColor = getThemeColor('--playback-note-stroke', '#4b5563');
    const label =
        displayName ||
        getPreferredNoteName(noteNumber, preference) ||
        noteMeta.name;
    const visualElements = createVisualNote(noteMeta, {
        color: playbackColor,
        cx: targetCx,
        offsetY,
        label
    });
    setPressedKey(noteNumber, visualElements);

    const result = handleNoteInput(noteNumber);
    if (result.correct) {
        recordCorrectAttempt(exercise ? exercise.id : null);
        onScoreIncrement?.();
    } else if (result.mistake) {
        recordErrorAttempt(exercise ? exercise.id : null);
        const elements = getPressedKey(noteNumber);
        if (elements) {
            removeVisualNote(elements);
            deletePressedKey(noteNumber);
        }
    }
}

export function noteOff(noteNumber) {
    const keyboardSvg = getKeyboardSvg();
    if (keyboardSvg) {
        const keyElement = keyboardSvg.querySelector(`[data-note-number="${noteNumber}"]`);
        if (keyElement) {
            keyElement.classList.remove('active');
        }
    }

    handleNoteRelease(noteNumber);

    const elements = getPressedKey(noteNumber);
    if (elements) {
        removeVisualNote(elements);
        deletePressedKey(noteNumber);
    }
}

function resolveCurrentStepPosition(noteNumber) {
    const notationSvg = getNotationSvg();
    const currentIndex = getCurrentIndex();

    if (notationSvg) {
        const normalized = Number(noteNumber);
        const selector = `ellipse[data-step-index="${currentIndex}"][data-midi-num="${normalized}"]`;
        const noteElement = notationSvg.querySelector(selector);
        if (noteElement) {
            const cxAttr = noteElement.getAttribute('cx');
            const offsetAttr = noteElement.getAttribute('data-offset-y');
            const labelAttr = noteElement.getAttribute('data-display-name');
            const cx = cxAttr != null ? Number(cxAttr) : NaN;
            const offsetY = offsetAttr != null ? Number(offsetAttr) : 0;
            if (!Number.isNaN(cx)) {
                return {
                    cx,
                    offsetY,
                    displayName: labelAttr || undefined
                };
            }
        }
    }

    const exercise = getCurrentExercise();
    if (!exercise) {
        return { cx: undefined, offsetY: 0, displayName: undefined };
    }

    const { cx, offsetY } = resolveStepPosition(exercise, currentIndex, noteNumber);
    return { cx, offsetY, displayName: undefined };
}
