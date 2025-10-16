import { initContext } from './core/context.js';
import { registerScoreHandler } from './core/playback.js';
import { initMIDI } from './core/midi.js';
import { initNotation } from './ui/notation.js';
import { initKeyboard } from './ui/keyboard.js';
import { renderExerciseSteps, setHintsEnabled } from './ui/notes_generator.js';
import { initPanel, updateMidiStatus, incrementScore, getHintsEnabled } from './ui/panel.js';
import { initExercise, onExerciseChange } from './core/exercise.js';

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

    initExercise();
    onExerciseChange(({ exercise, index }) => {
        renderExerciseSteps(exercise, index);
    });

    registerScoreHandler(() => incrementScore());

    initMIDI({
        onStatusChange: updateMidiStatus
    });
});
