import { findNoteByMidi } from '../data/notes_metadata.js';
import { getKeyboardSvg, getNotationSvg } from './context.js';
import { setPressedKey, getPressedKey, deletePressedKey } from './state.js';
import { createVisualNote, getNoteCx, removeVisualNote } from '../ui/notes_generator.js';
import { getCurrentExercise, getCurrentIndex, handleNoteInput } from './exercise.js';
import { getThemeColor } from '../ui/theme.js';

let onScoreIncrement = null;

export function registerScoreHandler(handler) {
    onScoreIncrement = typeof handler === 'function' ? handler : null;
}

export function noteOn(noteNumber) {
    const keyboardSvg = getKeyboardSvg();
    if (!keyboardSvg) {
        return;
    }

    const keyElement = keyboardSvg.querySelector(`[data-note-number="${noteNumber}"]`);
    if (keyElement) {
        keyElement.classList.add('active');
    }

    const noteMeta = findNoteByMidi(noteNumber);
    if (!noteMeta) {
        return;
    }

    const targetCx = resolveCurrentStepCx(noteNumber);
    const playbackColor = getThemeColor('--playback-note-stroke', '#4b5563');
    const visualElements = createVisualNote(noteMeta, {
        color: playbackColor,
        cx: targetCx
    });
    setPressedKey(noteNumber, visualElements);

    const result = handleNoteInput(noteNumber);
    if (result.correct) {
        onScoreIncrement?.();
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

    const elements = getPressedKey(noteNumber);
    if (elements) {
        removeVisualNote(elements);
        deletePressedKey(noteNumber);
    }
}

function resolveCurrentStepCx(noteNumber) {
    const notationSvg = getNotationSvg();
    const currentIndex = getCurrentIndex();

    if (notationSvg) {
        const selector = `ellipse[data-step-index="${currentIndex}"][data-midi-num="${Number(noteNumber)}"]`;
        const noteElement = notationSvg.querySelector(selector);
        if (noteElement) {
            const cxAttr = noteElement.getAttribute('cx');
            const cx = cxAttr != null ? Number(cxAttr) : NaN;
            if (!Number.isNaN(cx)) {
                return cx;
            }
        }
    }

    const exercise = getCurrentExercise();
    if (!exercise || !Array.isArray(exercise.steps) || !exercise.steps.length) {
        return undefined;
    }

    const step = exercise.steps[currentIndex];
    if (!step || !Array.isArray(step.notes) || !step.notes.length) {
        return undefined;
    }

    const chord = step.notes.map(Number);
    const normalizedNote = Number(noteNumber);
    const chordIndex = chord.findIndex(n => n === normalizedNote);
    const windowSize = Math.max(1, Number(exercise.displayWindow) || exercise.steps.length);
    const chunkStart = Math.floor(currentIndex / windowSize) * windowSize;
    const chunkEnd = Math.min(chunkStart + windowSize, exercise.steps.length);
    const visibleSteps = Math.max(1, chunkEnd - chunkStart);
    const localStepIndex = currentIndex - chunkStart;

    if (chordIndex === -1) {
        const centerIndex = (chord.length - 1) / 2;
        return getNoteCx({
            stepIndex: localStepIndex,
            chordIndex: centerIndex,
            chordSize: chord.length,
            totalSteps: visibleSteps
        });
    }

    return getNoteCx({
        stepIndex: localStepIndex,
        chordIndex,
        chordSize: chord.length,
        totalSteps: visibleSteps
    });
}
