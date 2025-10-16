import { initContext } from './core/context.js';
import { registerScoreHandler } from './core/playback.js';
import { initMIDI } from './core/midi.js';
import { initNotation } from './ui/notation.js';
import { initKeyboard } from './ui/keyboard.js';
import { initHighlightControls, getHighlightedNotesMetadata } from './ui/highlight.js';
import {
    generateSampleNoteFromSelection,
    setHintsEnabled
} from './ui/notes_generator.js';
import { initPanel, updateMidiStatus, incrementScore, getHintsEnabled } from './ui/panel.js';

document.addEventListener('DOMContentLoaded', () => {
    const notationElement = document.getElementById('notation');
    const keyboardElement = document.getElementById('keyboard');

    initContext({
        notationElement,
        keyboardElement
    });

    initNotation();
    initKeyboard();
    initPanel();

    setHintsEnabled(getHintsEnabled());

    initHighlightControls({
        onSelectionChanged: (metadata) => {
            generateSampleNoteFromSelection(metadata);
        }
    });

    const initialHighlights = getHighlightedNotesMetadata();
    if (initialHighlights.length) {
        generateSampleNoteFromSelection(initialHighlights);
    }

    registerScoreHandler(() => incrementScore());

    initMIDI({
        onStatusChange: updateMidiStatus
    });
});
