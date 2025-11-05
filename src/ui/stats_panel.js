const COOLDOWN_DURATION_MS = 3000;
const DEFAULT_COUNTDOWN_LABEL = '3';

let correctCount = 0;
let errorCount = 0;
let activeExerciseId = null;
let correctValueElement = null;
let errorValueElement = null;
let rowsProgressElement = null;
let notesProgressElement = null;
let overlayElement = null;
let overlayTimerElement = null;
let cooldownTimeoutId = null;
let cooldownIntervalId = null;
let cooldownEndsAt = 0;

export function initStatsPanel() {
    correctValueElement = document.getElementById('stats-correct-value');
    errorValueElement = document.getElementById('stats-error-value');
    rowsProgressElement = document.getElementById('stats-rows-progress-value');
    notesProgressElement = document.getElementById('stats-notes-progress-value');
    overlayElement = document.getElementById('error-overlay');
    overlayTimerElement = document.getElementById('error-overlay-timer');

    syncCounters();
    resetProgressDisplay();
    hideOverlay();
}

export function resetStats(exerciseId) {
    activeExerciseId = exerciseId ?? null;
    correctCount = 0;
    errorCount = 0;
    stopCooldown();
    syncCounters();
    resetProgressDisplay();
}

export function recordCorrectAttempt(exerciseId) {
    if (!isSameExercise(exerciseId)) {
        return;
    }
    correctCount += 1;
    updateCorrectDisplay();
}

export function recordErrorAttempt(exerciseId) {
    if (!isSameExercise(exerciseId)) {
        return;
    }
    errorCount += 1;
    updateErrorDisplay();
    startCooldown();
}

export function isInputLocked() {
    return cooldownTimeoutId !== null;
}

function isSameExercise(exerciseId) {
    if (!exerciseId || !activeExerciseId) {
        return Boolean(activeExerciseId) === Boolean(exerciseId);
    }
    return String(exerciseId) === String(activeExerciseId);
}

function syncCounters() {
    updateCorrectDisplay();
    updateErrorDisplay();
}

function resetProgressDisplay() {
    updateRowProgress({
        rowsCompleted: 0,
        totalRows: 0,
        completedNotes: 0,
        totalNotes: 0
    });
}

function updateCorrectDisplay() {
    if (correctValueElement) {
        correctValueElement.textContent = String(correctCount);
    }
}

function updateErrorDisplay() {
    if (errorValueElement) {
        errorValueElement.textContent = String(errorCount);
    }
}

function startCooldown() {
    stopCooldown();
    showOverlay();
    cooldownEndsAt = Date.now() + COOLDOWN_DURATION_MS;
    updateOverlayCountdown(COOLDOWN_DURATION_MS);
    cooldownIntervalId = window.setInterval(() => {
        const remaining = cooldownEndsAt - Date.now();
        if (remaining <= 0) {
            stopCooldown();
            return;
        }
        updateOverlayCountdown(remaining);
    }, 100);
    cooldownTimeoutId = window.setTimeout(() => {
        stopCooldown();
    }, COOLDOWN_DURATION_MS);
}

function stopCooldown() {
    if (cooldownTimeoutId !== null) {
        clearTimeout(cooldownTimeoutId);
        cooldownTimeoutId = null;
    }
    if (cooldownIntervalId !== null) {
        clearInterval(cooldownIntervalId);
        cooldownIntervalId = null;
    }
    cooldownEndsAt = 0;
    hideOverlay();
}

function showOverlay() {
    if (overlayElement) {
        overlayElement.removeAttribute('hidden');
    }
    updateOverlayCountdown(COOLDOWN_DURATION_MS);
}

function hideOverlay() {
    if (overlayElement) {
        overlayElement.setAttribute('hidden', '');
    }
    if (overlayTimerElement) {
        overlayTimerElement.textContent = DEFAULT_COUNTDOWN_LABEL;
    }
}

function updateOverlayCountdown(milliseconds) {
    if (!overlayTimerElement) {
        return;
    }
    const remainingSeconds = Math.max(1, Math.ceil(milliseconds / 1000));
    overlayTimerElement.textContent = String(remainingSeconds);
}

export function updateRowProgress({
    rowsCompleted = 0,
    totalRows = 0,
    completedNotes = 0,
    totalNotes = 0
} = {}) {
    if (rowsProgressElement) {
        rowsProgressElement.textContent = formatProgress(rowsCompleted, totalRows);
    }
    if (notesProgressElement) {
        notesProgressElement.textContent = formatProgress(completedNotes, totalNotes);
    }
}

function formatProgress(completed, total) {
    const normalizedTotal = Math.max(0, Number(total) || 0);
    const normalizedCompleted = Math.max(0, Math.min(Number(completed) || 0, normalizedTotal));
    return `${normalizedCompleted} / ${normalizedTotal}`;
}
