import { getKeyboardSvg } from '../core/context.js';
import { noteOn, noteOff } from '../core/playback.js';
import { rebuildNotationCenter } from './notes_generator.js';

let keyboardRange = { start: 2, end: 5 };

export function initKeyboard() {
    rebuildKeyboardPreservingState();
}

export function getKeyboardRange() {
    return { ...keyboardRange };
}

export function setKeyboardRange(start, end) {
    const MIN_OCTAVE = 1;
    const MAX_OCTAVE = 7;

    let newStart = Math.max(MIN_OCTAVE, Math.min(MAX_OCTAVE, Number(start) || keyboardRange.start));
    let newEnd = Math.max(MIN_OCTAVE, Math.min(MAX_OCTAVE, Number(end) || keyboardRange.end));

    if (newStart > newEnd) {
        newEnd = newStart;
    }

    if (keyboardRange.start === newStart && keyboardRange.end === newEnd) {
        return getKeyboardRange();
    }

    keyboardRange = { start: newStart, end: newEnd };
    rebuildKeyboardPreservingState();
    return getKeyboardRange();
}

export function rebuildKeyboardPreservingState() {
    const keyboardSvg = getKeyboardSvg();
    if (!keyboardSvg) {
        return;
    }

    const highlighted = Array.from(keyboardSvg.querySelectorAll('.key.highlight'))
        .map(key => Number(key.getAttribute('data-note-number')));
    const active = Array.from(keyboardSvg.querySelectorAll('.key.active'))
        .map(key => Number(key.getAttribute('data-note-number')));

    renderKeyboard();

    highlighted.forEach(noteNumber => {
        const key = keyboardSvg.querySelector(`[data-note-number="${noteNumber}"]`);
        if (key) {
            key.classList.add('highlight');
        }
    });

    active.forEach(noteNumber => {
        const key = keyboardSvg.querySelector(`[data-note-number="${noteNumber}"]`);
        if (key) {
            key.classList.add('active');
        }
    });

    rebuildNotationCenter();
}

function renderKeyboard() {
    const keyboardSvg = getKeyboardSvg();
    if (!keyboardSvg) {
        return;
    }

    keyboardSvg.innerHTML = '';

    const octaveCount = keyboardRange.end - keyboardRange.start + 1;
    if (octaveCount <= 0) {
        return;
    }

    const keyboardWidth = keyboardSvg.clientWidth || keyboardSvg.getBoundingClientRect().width;
    const whiteKeyWidth = keyboardWidth / (7 * octaveCount);
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = whiteKeyWidth * 2.4;
    const whiteKeyHeight = whiteKeyWidth * 4;

    keyboardSvg.setAttribute('height', whiteKeyHeight);

    const defs = keyboardSvg.ownerDocument.createElementNS(keyboardSvg.namespaceURI, 'defs');
    defs.appendChild(createGradient('whiteKeyGradient', [
        { offset: '0%', color: '#fdfdfd' },
        { offset: '55%', color: '#f0f0f0' },
        { offset: '100%', color: '#d7d7d7' }
    ]));
    defs.appendChild(createGradient('blackKeyGradient', [
        { offset: '0%', color: '#2f3035' },
        { offset: '40%', color: '#18191c' },
        { offset: '100%', color: '#050506' }
    ]));
    keyboardSvg.appendChild(defs);

    for (let octave = keyboardRange.start; octave <= keyboardRange.end; octave++) {
        let whiteKeyX = (octave - keyboardRange.start) * whiteKeyWidth * 7;
        let noteNumber = 24 + (octave * 12);

        for (let i = 0; i < 7; i++) {
            const rect = keyboardSvg.ownerDocument.createElementNS(keyboardSvg.namespaceURI, 'rect');
            rect.setAttribute('x', whiteKeyX);
            rect.setAttribute('y', 0);
            rect.setAttribute('width', whiteKeyWidth);
            rect.setAttribute('height', whiteKeyHeight);
            rect.setAttribute('rx', Math.max(4, whiteKeyWidth * 0.08));
            rect.setAttribute('ry', Math.max(4, whiteKeyWidth * 0.08));
            rect.setAttribute('fill', 'url(#whiteKeyGradient)');
            rect.setAttribute('stroke', '#33373d');
            rect.setAttribute('class', 'key white-key');
            rect.setAttribute('data-note-number', noteNumber);
            rect.addEventListener('mousedown', event => noteOnFromKeyboard(event.target));
            rect.addEventListener('mouseup', event => noteOffFromKeyboard(event.target));
            rect.addEventListener('mouseleave', event => noteOffFromKeyboard(event.target));
            keyboardSvg.appendChild(rect);

            whiteKeyX += whiteKeyWidth;
            noteNumber += (i === 2 || i === 6) ? 1 : 2;
        }

        let blackKeyX = ((octave - keyboardRange.start) * whiteKeyWidth * 7) + whiteKeyWidth - (blackKeyWidth / 2);
        let blackNoteNumber = 25 + (octave * 12);

        for (let i = 0; i < 7; i++) {
            if (i !== 2 && i !== 6) {
                const blackRect = keyboardSvg.ownerDocument.createElementNS(keyboardSvg.namespaceURI, 'rect');
                blackRect.setAttribute('x', blackKeyX);
                blackRect.setAttribute('y', 0);
                blackRect.setAttribute('width', blackKeyWidth);
                blackRect.setAttribute('height', blackKeyHeight);
                blackRect.setAttribute('rx', Math.max(3, whiteKeyWidth * 0.06));
                blackRect.setAttribute('ry', Math.max(3, whiteKeyWidth * 0.06));
                blackRect.setAttribute('fill', 'url(#blackKeyGradient)');
                blackRect.setAttribute('stroke', '#202125');
                blackRect.setAttribute('class', 'key black-key');
                blackRect.setAttribute('data-note-number', blackNoteNumber);
                blackRect.addEventListener('mousedown', event => noteOnFromKeyboard(event.target));
                blackRect.addEventListener('mouseup', event => noteOffFromKeyboard(event.target));
                blackRect.addEventListener('mouseleave', event => noteOffFromKeyboard(event.target));
                keyboardSvg.appendChild(blackRect);
                blackNoteNumber += 2;
            } else {
                blackNoteNumber += 1;
            }

            blackKeyX += whiteKeyWidth;
        }
    }
}

function noteOnFromKeyboard(element) {
    const noteNumber = Number(element.getAttribute('data-note-number'));
    noteOn(noteNumber);
}

function noteOffFromKeyboard(element) {
    const noteNumber = Number(element.getAttribute('data-note-number'));
    noteOff(noteNumber);
}

function createGradient(id, stops) {
    const keyboardSvg = getKeyboardSvg();
    const gradient = keyboardSvg.ownerDocument.createElementNS(keyboardSvg.namespaceURI, 'linearGradient');
    gradient.setAttribute('id', id);
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('y2', '100%');

    stops.forEach(stopConfig => {
        const stop = keyboardSvg.ownerDocument.createElementNS(keyboardSvg.namespaceURI, 'stop');
        stop.setAttribute('offset', stopConfig.offset);
        stop.setAttribute('stop-color', stopConfig.color);
        if (typeof stopConfig.opacity === 'number') {
            stop.setAttribute('stop-opacity', stopConfig.opacity.toString());
        }
        gradient.appendChild(stop);
    });

    return gradient;
}

window.addEventListener('resize', () => {
    rebuildKeyboardPreservingState();
});
