import { getKeyboardSvg } from '../core/context.js';
import { findNoteByMidi } from '../data/notes_metadata.js';

let mouseDown = false;
let selectionChangedCallback = null;

export function initHighlightControls({ onSelectionChanged } = {}) {
    selectionChangedCallback = typeof onSelectionChanged === 'function' ? onSelectionChanged : null;

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    const keyboardSvg = getKeyboardSvg();
    if (!keyboardSvg) {
        return;
    }

    keyboardSvg.addEventListener('mouseover', handleMouseOver);
    keyboardSvg.addEventListener('contextmenu', event => event.preventDefault());
}

function handleMouseDown(event) {
    if (event.buttons === 2) {
        mouseDown = true;
        toggleKeyHighlight(event);
    }
}

function handleMouseUp() {
    mouseDown = false;
}

function handleMouseOver(event) {
    if (mouseDown && event.target.classList.contains('key')) {
        toggleKeyHighlight(event);
    }
}

function toggleKeyHighlight(event) {
    const key = event.target;
    if (!(key instanceof Element) || !key.classList.contains('key')) {
        return;
    }

    key.classList.toggle('highlight');
    notifySelectionChanged();
}

function notifySelectionChanged() {
    if (selectionChangedCallback) {
        selectionChangedCallback(getHighlightedNotesMetadata());
    }
}

export function getHighlightedNotesMetadata() {
    const keyboardSvg = getKeyboardSvg();
    if (!keyboardSvg) {
        return [];
    }

    const keys = keyboardSvg.querySelectorAll('.key.highlight');
    return Array.from(keys)
        .map(key => {
            const noteNumber = Number(key.getAttribute('data-note-number'));
            return findNoteByMidi(noteNumber);
        })
        .filter(note => note && note.isWhite && typeof note.y === 'number');
}
