export function computeExerciseWindow(exercise, currentIndex) {
    const steps = Array.isArray(exercise?.steps) ? exercise.steps : [];
    const windowSize = steps.length || 1;
    return {
        steps,
        visibleSteps: steps,
        chunkStart: 0,
        chunkEnd: steps.length,
        windowSize
    };
}

export function getRowLayout(localIndex, visibleLength, rowCapacity = visibleLength) {
    const capacity = Math.max(1, Number(rowCapacity) || visibleLength || 1);
    const rowIndex = Math.max(0, Math.floor(localIndex / capacity));
    const indexInRow = localIndex % capacity;
    const remaining = Math.max(0, visibleLength - rowIndex * capacity);
    const stepsInRow = Math.max(1, Math.min(capacity, remaining));
    return {
        rowIndex,
        indexInRow,
        stepsInRow,
        rowCapacity: capacity
    };
}
