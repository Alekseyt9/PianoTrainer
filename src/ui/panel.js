import { getKeyboardRange, setKeyboardRange } from './keyboard.js';
import { setHintsEnabled, areHintsEnabled } from './notes_generator.js';

const SETTINGS_STORAGE_KEY = 'pianoTrainerSettings';
const AVAILABLE_THEMES = ['midnight', 'light', 'aurora', 'sunrise', 'citrus'];

let midiContainerElement = null;
let midiValueElement = null;
let scoreElement = null;
let themeSelectElement = null;
let exerciseLabelElement = null;
let settings = {};
let score = 0;

export function initPanel({ onThemeChange } = {}) {
    settings = loadPersistedSettings();

    const rangeStartSelect = document.getElementById('range-start');
    const rangeEndSelect = document.getElementById('range-end');
    const hintsToggle = document.getElementById('toggle-hints');
    themeSelectElement = document.getElementById('theme-select');
    midiContainerElement = document.getElementById('status-midi');
    midiValueElement = document.getElementById('status-midi-value');
    scoreElement = document.getElementById('status-score-value');
    exerciseLabelElement = document.getElementById('status-exercise-value');

    const range = getKeyboardRange();
    if (rangeStartSelect && rangeEndSelect) {
        rangeStartSelect.value = String(range.start);
        rangeEndSelect.value = String(range.end);
        rangeStartSelect.addEventListener('change', () => {
            setKeyboardRange(rangeStartSelect.value, rangeEndSelect.value);
        });
        rangeEndSelect.addEventListener('change', () => {
            setKeyboardRange(rangeStartSelect.value, rangeEndSelect.value);
        });
    }

    const initialHints = settings.hints ?? true;
    setHintsEnabled(initialHints);
    if (hintsToggle) {
        hintsToggle.checked = initialHints;
        hintsToggle.addEventListener('change', (event) => {
            const enabled = Boolean(event.target.checked);
            setHintsEnabled(enabled);
            persistSettings({ hints: enabled });
        });
    }

    const initialTheme = AVAILABLE_THEMES.includes(settings.theme) ? settings.theme : 'midnight';
    applyTheme(initialTheme);
    if (themeSelectElement) {
        themeSelectElement.value = initialTheme;
        themeSelectElement.addEventListener('change', (event) => {
            const theme = event.target.value;
            applyTheme(theme);
            persistSettings({ theme });
            onThemeChange?.(theme);
        });
    }

    initialiseTimer();
    updateScore(0);
    updateMidiStatus('pending', 'Waiting');
}

export function updateMidiStatus(state, text) {
    if (midiContainerElement) {
        midiContainerElement.classList.remove('connected', 'error', 'pending');
        if (state) {
            midiContainerElement.classList.add(state);
        }
    }

    if (midiValueElement) {
        midiValueElement.textContent = text || '';
    }
}

export function incrementScore() {
    updateScore(score + 1);
}

export function getCurrentTheme() {
    return themeSelectElement ? themeSelectElement.value : 'midnight';
}

export function getHintsEnabled() {
    return areHintsEnabled();
}

export function setCurrentExerciseTitle(title) {
    if (exerciseLabelElement) {
        exerciseLabelElement.textContent = title || 'Note Hunt';
    }
}

function updateScore(value) {
    score = value;
    if (scoreElement) {
        scoreElement.textContent = String(score);
    }
}

function applyTheme(theme) {
    const normalized = AVAILABLE_THEMES.includes(theme) ? theme : 'midnight';
    AVAILABLE_THEMES.forEach(name => document.body.classList.remove(`theme-${name}`));
    if (normalized !== 'midnight') {
        document.body.classList.add(`theme-${normalized}`);
    } else {
        document.body.classList.add('theme-midnight');
    }
    if (themeSelectElement) {
        themeSelectElement.value = normalized;
    }
}

function initialiseTimer() {
    const timeValue = document.getElementById('status-time-value');
    if (!timeValue) {
        return;
    }

    const startTime = Date.now();
    const updateTimer = () => {
        const elapsedMs = Date.now() - startTime;
        const totalSeconds = Math.floor(elapsedMs / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        timeValue.textContent = `${minutes}:${seconds}`;
    };

    updateTimer();
    setInterval(updateTimer, 1000);
}

function loadPersistedSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!saved) {
            return {};
        }
        return JSON.parse(saved);
    } catch (error) {
        console.warn('Unable to parse settings', error);
        return {};
    }
}

function persistSettings(patch) {
    try {
        settings = { ...settings, ...patch };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.warn('Unable to persist settings', error);
    }
}


