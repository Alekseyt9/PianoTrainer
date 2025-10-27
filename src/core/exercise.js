import { exercises } from '../data/exercises/index.js';
import { getStepMidiNumbers } from '../data/notes_metadata.js';

let currentExercise = exercises[0] || null;
let currentIndex = 0;
let chordState = createChordState(currentIndex);
const listeners = new Set();

export function initExercise() {
    chordState = createChordState(currentIndex);
    notify();
}

export function onExerciseChange(listener) {
    if (typeof listener === 'function') {
        listeners.add(listener);
        listener(getSnapshot());
    }
    return () => listeners.delete(listener);
}

export function loadExerciseById(id) {
    const found = exercises.find(ex => ex.id === id);
    if (found) {
        currentExercise = found;
        currentIndex = 0;
        chordState = createChordState(currentIndex);
        notify();
    }
}

export function getCurrentExercise() {
    return currentExercise;
}

export function getCurrentIndex() {
    return currentIndex;
}

export function handleNoteInput(midiNumber) {
    const exercise = currentExercise;
    if (!exercise || !exercise.steps || !exercise.steps.length) {
        return { correct: false, finished: false };
    }

    const step = exercise.steps[currentIndex];
    const expectedNotes = getStepMidiNumbers(step);
    if (!expectedNotes.length) {
        return { correct: false, finished: false };
    }

    if (chordState.stepIndex !== currentIndex) {
        chordState = createChordState(currentIndex);
    }

    const normalizedInput = Number(midiNumber);
    const match = expectedNotes.includes(normalizedInput);
    if (!match) {
        chordState = createChordState(currentIndex);
        return { correct: false, finished: false };
    }

    chordState.pressed.add(normalizedInput);
    const allPressed = expectedNotes.every(note => chordState.pressed.has(note));
    if (!allPressed) {
        return { correct: false, finished: false };
    }

    chordState = createChordState(currentIndex + 1);
    currentIndex += 1;
    let finished = false;
    if (currentIndex >= exercise.steps.length) {
        finished = true;
        advanceToNextExercise();
    } else {
        notify();
    }
    return { correct: true, finished };
}

export function handleNoteRelease(midiNumber) {
    if (!chordState || !(chordState.pressed instanceof Set)) {
        return;
    }
    const normalized = Number(midiNumber);
    if (Number.isNaN(normalized)) {
        return;
    }
    if (chordState.pressed.has(normalized)) {
        chordState.pressed.delete(normalized);
    }
}

function createChordState(stepIndex) {
    return {
        stepIndex,
        pressed: new Set()
    };
}

function notify() {
    const snapshot = getSnapshot();
    listeners.forEach(listener => listener(snapshot));
}

function advanceToNextExercise() {
    if (!currentExercise || !exercises.length) {
        return;
    }

    const currentIndexInList = exercises.findIndex(ex => ex.id === currentExercise.id);
    const nextExercise = exercises[(currentIndexInList + 1) % exercises.length];
    currentExercise = nextExercise;
    currentIndex = 0;
    chordState = createChordState(currentIndex);
    notify();
}

function getSnapshot() {
    return {
        exercise: currentExercise,
        index: currentIndex
    };
}
