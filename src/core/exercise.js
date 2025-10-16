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
    const finished = currentIndex >= exercise.steps.length;
    if (finished) {
        currentIndex = 0;
    }
    notify();
    return { correct: true, finished };
}

function notify() {
    const snapshot = getSnapshot();
    listeners.forEach(listener => listener(snapshot));
}

function getSnapshot() {
    return {
        exercise: currentExercise,
        index: currentIndex
    };
}
