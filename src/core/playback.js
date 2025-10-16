import { findNoteByMidi } from '../data/notes_metadata.js';
import { getKeyboardSvg } from './context.js';
import { setPressedKey, getPressedKey, deletePressedKey } from './state.js';
import {
    createVisualNote,
    removeVisualNote,
    clearSampleNote,
    generateSampleNoteFromSelection,
    isSampleMatch,
    hasActiveSample,
    areHintsEnabled
} from '../ui/notes_generator.js';
import { getHighlightedNotesMetadata } from '../ui/highlight.js';

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

    const visualElements = createVisualNote(noteMeta, { color: areHintsEnabled() ? 'gray' : 'gray' });
    setPressedKey(noteNumber, visualElements);

    if (isSampleMatch(noteNumber)) {
        clearSampleNote();
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

    if (!hasActiveSample()) {
        const highlightedMeta = getHighlightedNotesMetadata();
        if (highlightedMeta.length) {
            generateSampleNoteFromSelection(highlightedMeta);
        }
    }
}
