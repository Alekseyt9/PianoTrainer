const SETTINGS_STORAGE_KEY = 'pianoTrainerSettings';
const AVAILABLE_THEMES = ['midnight', 'aurora', 'sunrise', 'citrus'];

function loadPersistedSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!saved) {
            return {};
        }
        return JSON.parse(saved);
    } catch (_) {
        return {};
    }
}

function initInterface() {
    const infoToggle = document.getElementById('info-toggle');
    const infoPanel = document.getElementById('info-panel');
    const rangeStartSelect = document.getElementById('range-start');
    const rangeEndSelect = document.getElementById('range-end');
    const scoreValue = document.getElementById('status-score-value');
    const timeValue = document.getElementById('status-time-value');
    const midiContainer = document.getElementById('status-midi');
    const midiValue = document.getElementById('status-midi-value');
    const hintsToggle = document.getElementById('toggle-hints');
    const themeSelect = document.getElementById('theme-select');

    let settings = loadPersistedSettings();

    const saveSettings = (patch) => {
        settings = { ...settings, ...patch };
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            console.warn('Unable to persist settings', error);
        }
    };

    const applyThemeClass = (theme) => {
        if (!document.body) {
            return;
        }
        AVAILABLE_THEMES.forEach(name => {
            document.body.classList.remove(`theme-${name}`);
        });
        document.body.classList.add(`theme-${theme}`);
    };

    const setTheme = (theme, { persist = true } = {}) => {
        const normalized = AVAILABLE_THEMES.includes(theme) ? theme : 'midnight';
        applyThemeClass(normalized);
        if (themeSelect) {
            themeSelect.value = normalized;
        }
        if (persist) {
            saveSettings({ theme: normalized });
        }
    };

    const setHints = (enabled, { persist = true } = {}) => {
        const normalized = Boolean(enabled);
        if (hintsToggle) {
            hintsToggle.checked = normalized;
        }
        if (typeof setStaffHintsEnabled === 'function') {
            setStaffHintsEnabled(normalized);
        }
        if (persist) {
            saveSettings({ hints: normalized });
        }
    };

    if (infoToggle && infoPanel) {
        infoToggle.addEventListener('click', () => {
            const isHidden = infoPanel.hasAttribute('hidden');
            infoPanel.toggleAttribute('hidden', !isHidden);
            infoToggle.setAttribute('aria-expanded', String(isHidden));
        });
    }

    const syncRangeControls = (range) => {
        if (!rangeStartSelect || !rangeEndSelect || !range) {
            return;
        }
        rangeStartSelect.value = String(range.start);
        rangeEndSelect.value = String(range.end);
    };

    const applyRange = () => {
        if (typeof setKeyboardRange !== 'function') {
            return;
        }
        const updatedRange = setKeyboardRange(rangeStartSelect.value, rangeEndSelect.value);
        syncRangeControls(updatedRange);
    };

    if (rangeStartSelect && rangeEndSelect) {
        const initialRange = typeof getKeyboardRange === 'function'
            ? getKeyboardRange()
            : { start: 1, end: 4 };

        syncRangeControls(initialRange);

        rangeStartSelect.addEventListener('change', applyRange);
        rangeEndSelect.addEventListener('change', applyRange);
    }

    if (hintsToggle) {
        hintsToggle.addEventListener('change', (event) => {
            setHints(event.target.checked);
        });
    }

    if (themeSelect) {
        themeSelect.addEventListener('change', (event) => {
            setTheme(event.target.value);
        });
    }

    setTheme(settings.theme || 'midnight', { persist: false });
    setHints(settings.hints !== false, { persist: false });

    let score = 0;
    const updateScore = () => {
        if (scoreValue) {
            scoreValue.textContent = String(score);
        }
    };

    window.incrementTrainerScore = () => {
        score += 1;
        updateScore();
    };

    updateScore();

    if (timeValue) {
        const startTime = Date.now();
        const updateTimer = () => {
            const elapsedMs = Date.now() - startTime;
            const totalSeconds = Math.floor(elapsedMs / 1000);
            const minutes = Math.floor(totalSeconds / 60)
                .toString()
                .padStart(2, '0');
            const seconds = (totalSeconds % 60).toString().padStart(2, '0');
            timeValue.textContent = `${minutes}:${seconds}`;
        };
        updateTimer();
        setInterval(updateTimer, 1000);
    }

    const setMidiStatus = (state, text) => {
        if (midiContainer) {
            midiContainer.classList.remove('connected', 'error', 'pending');
            if (state) {
                midiContainer.classList.add(state);
            }
        }
        if (midiValue) {
            midiValue.textContent = text || '';
        }
    };

    window.updateMidiStatus = setMidiStatus;
    setMidiStatus('pending', 'Ожидание');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInterface);
} else {
    initInterface();
}
