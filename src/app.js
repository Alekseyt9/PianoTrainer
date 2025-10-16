import { initContext } from './core/context.js';
import { registerScoreHandler } from './core/playback.js';
import { initMIDI } from './core/midi.js';
import { initNotation, refreshStaffWidth } from './ui/notation.js';
import { initKeyboard } from './ui/keyboard.js';
import { renderExerciseSteps, setHintsEnabled } from './ui/notes_generator.js';
import { initPanel, updateMidiStatus, incrementScore, getHintsEnabled, setCurrentExerciseTitle } from './ui/panel.js';
import { initExerciseList } from './ui/exercise_list.js';
import { initExercise, onExerciseChange } from './core/exercise.js';

document.addEventListener('DOMContentLoaded', () => {
    const notationElement = document.getElementById('notation');
    const keyboardElement = document.getElementById('keyboard');

    initContext({
        notationElement,
        keyboardElement
    });

    initNotation();
    refreshStaffWidth();
    window.addEventListener('resize', refreshStaffWidth);
    initKeyboard();
    initPanel();
    initExerciseList();

    setHintsEnabled(getHintsEnabled());

    initExercise();
    onExerciseChange(({ exercise, index }) => {
        renderExerciseSteps(exercise, index);
        setCurrentExerciseTitle(exercise ? exercise.title : 'None');
    });

    registerScoreHandler(() => incrementScore());

    initMIDI({
        onStatusChange: updateMidiStatus
    });
});
