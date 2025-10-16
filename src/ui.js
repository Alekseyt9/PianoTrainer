function initInterface() {
    const infoToggle = document.getElementById('info-toggle');
    const infoPanel = document.getElementById('info-panel');
    const rangeStartSelect = document.getElementById('range-start');
    const rangeEndSelect = document.getElementById('range-end');
    const scoreValue = document.getElementById('status-score-value');
    const timeValue = document.getElementById('status-time-value');
    const midiContainer = document.getElementById('status-midi');
    const midiValue = document.getElementById('status-midi-value');

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
