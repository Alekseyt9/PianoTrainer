import { exercises } from '../data/exercises/index.js';
import {
    getStepNoteMetas,
    getAccidentalPair,
    normalizeNoteName
} from '../data/notes_metadata.js';
import { getCurrentRowCapacity } from '../ui/notes_generator.js';

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
        return { correct: false, finished: false, mistake: false };
    }

    const step = exercise.steps[currentIndex];
    const expectedDetails = getExpectedNoteDetails(step);
    if (!expectedDetails.length) {
        return { correct: false, finished: false, mistake: false };
    }
    const expectedNotes = expectedDetails.map(detail => detail.midi);

    if (chordState.stepIndex !== currentIndex) {
        chordState = createChordState(currentIndex);
    }

    const normalizedInput = Number(midiNumber);
    const matchedDetail = expectedDetails.find(detail =>
        matchesExpectedAccidental(detail, normalizedInput)
    );
    const match = Boolean(matchedDetail);
    if (!match) {
        const previousIndex = currentIndex;
        const capacityValue = Number(getCurrentRowCapacity());
        const normalizedCapacity = Number.isFinite(capacityValue) && capacityValue > 0 ? capacityValue : 1;
        const rowStart = Math.max(0, Math.floor(previousIndex / normalizedCapacity) * normalizedCapacity);
        currentIndex = rowStart;
        chordState = createChordState(currentIndex);
        if (rowStart !== previousIndex) {
            notify();
        }
        return {
            correct: false,
            finished: false,
            mistake: true,
            rowReset: rowStart !== previousIndex,
            resetIndex: currentIndex
        };
    }

    chordState.pressed.add(normalizedInput);
    const allPressed = expectedNotes.every(note => chordState.pressed.has(note));
    if (!allPressed) {
        return { correct: false, finished: false, mistake: false };
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
    return { correct: true, finished, mistake: false };
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

function getExpectedNoteDetails(step) {
    const metas = getStepNoteMetas(step);
    if (!Array.isArray(metas)) {
        return [];
    }
    return metas
        .map(meta => {
            if (!meta || typeof meta.midiNum !== 'number') {
                return null;
            }
            const canonical = normalizeNoteName(meta.displayName || meta.name);
            return canonical ? { midi: meta.midiNum, name: canonical } : null;
        })
        .filter(Boolean);
}

function matchesExpectedAccidental(detail, midiNumber) {
    if (!detail || detail.midi !== midiNumber) {
        return false;
    }
    const name = detail.name;
    if (!name) {
        return true;
    }
    const hasSharp = name.includes('#');
    const hasFlat = name.includes('b');
    if (!hasSharp && !hasFlat) {
        return true;
    }
    const pair = getAccidentalPair(midiNumber);
    if (!pair) {
        return false;
    }
    if (hasSharp) {
        return pair.sharp === name;
    }
    if (hasFlat) {
        return pair.flat === name;
    }
    return false;
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
