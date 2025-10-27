import { STEPS_PER_ROW } from './layout.js';

export function computeExerciseWindow(exercise, currentIndex) {
    const steps = Array.isArray(exercise?.steps) ? exercise.steps : [];
    const windowSize = Math.max(1, Number(exercise?.displayWindow) || steps.length || 1);
    const chunkStart = Math.floor(currentIndex / windowSize) * windowSize;
    const chunkEnd = Math.min(chunkStart + windowSize, steps.length);
    const visibleSteps = steps.slice(chunkStart, chunkEnd);

    return {
        steps,
        visibleSteps,
        chunkStart,
        chunkEnd,
        windowSize
    };
}

export function getRowLayout(localIndex, visibleLength) {
    const rowIndex = Math.max(0, Math.floor(localIndex / STEPS_PER_ROW));
    const indexInRow = localIndex % STEPS_PER_ROW;
    const remaining = Math.max(0, visibleLength - rowIndex * STEPS_PER_ROW);
    const stepsInRow = Math.max(1, Math.min(STEPS_PER_ROW, remaining));
    return {
        rowIndex,
        indexInRow,
        stepsInRow
    };
}
