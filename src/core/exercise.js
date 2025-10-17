import { exercises } from '../data/exercises.js';

let currentExercise = exercises[0] || null;
let currentIndex = 0;
const listeners = new Set();

export function initExercise() {
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
    if (!step || !Array.isArray(step.notes)) {
        return { correct: false, finished: false };
    }

    const match = step.notes.map(Number).includes(Number(midiNumber));
    if (!match) {
        return { correct: false, finished: false };
    }

    currentIndex += 1;
    let finished = false;
    if (currentIndex >= exercise.steps.length) {
        finished = true;
        advanceToNextExercise();
    }
    notify();
    return { correct: true, finished };
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
}

function getSnapshot() {
    return {
        exercise: currentExercise,
        index: currentIndex
    };
}
