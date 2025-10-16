import { xmlns, startY, distY } from '../core/consts.js';
import { getNotationSvg } from '../core/context.js';
import { getPressedKeyMap } from '../core/state.js';

let currentSample = null;
let hintsEnabled = false;

export function createVisualNote(meta, { color = 'gray' } = {}) {
    if (!meta || typeof meta.y !== 'number') {
        return [];
    }
    return createNote(meta.y, meta.name, meta.midiNum, color);
}

export function removeVisualNote(elements) {
    if (!elements) {
        return;
    }
    elements.forEach(element => element.remove());
}

export function setHintsEnabled(enabled) {
    hintsEnabled = Boolean(enabled);
    if (!hintsEnabled) {
        removeHint();
    } else {
        applyHint();
    }
}

export function areHintsEnabled() {
    return hintsEnabled;
}

export function generateSampleNoteFromSelection(selectionMeta = []) {
    clearSampleNote();
    if (!selectionMeta.length) {
        return;
    }
    const meta = selectionMeta[Math.floor(Math.random() * selectionMeta.length)];
    if (meta && typeof meta.y === 'number') {
        const elements = createNote(meta.y, meta.name, meta.midiNum);
        currentSample = { meta, elements };
        applyHint();
    }
}

export function clearSampleNote() {
    removeHint();
    if (currentSample && currentSample.elements) {
        currentSample.elements.forEach(element => element.remove());
    }
    currentSample = null;
}

export function hasActiveSample() {
    return Boolean(currentSample);
}

export function isSampleMatch(midiNumber) {
    return currentSample && currentSample.meta && currentSample.meta.midiNum === Number(midiNumber);
}

export function rebuildNotationCenter() {
    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return;
    }

    const centerX = getNotationCenterX();
    const underlineHalfWidth = 30;

    const adjustElement = (element) => {
        if (!element) {
            return;
        }
        const tagName = element.tagName.toLowerCase();
        if (tagName === 'ellipse') {
            element.setAttribute('cx', centerX);
        } else if (tagName === 'line') {
            element.setAttribute('x1', centerX - underlineHalfWidth);
            element.setAttribute('x2', centerX + underlineHalfWidth);
        }
    };

    if (currentSample && currentSample.elements) {
        currentSample.elements.forEach(adjustElement);
    }

    getPressedKeyMap().forEach(elements => {
        if (Array.isArray(elements)) {
            elements.forEach(adjustElement);
        }
    });

    positionHint();
}

function createNote(y, name, midiNum, color = 'black') {
    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return [];
    }

    const centerX = getNotationCenterX();
    const note = notationSvg.ownerDocument.createElementNS(xmlns, 'ellipse');
    note.setAttribute('cx', centerX);
    note.setAttribute('cy', y);
    note.setAttribute('rx', '20');
    note.setAttribute('ry', '14');
    note.setAttribute('fill', 'none');
    note.setAttribute('stroke', color);
    note.setAttribute('stroke-width', '2');
    note.setAttribute('name', name);
    note.setAttribute('data-midi-num', midiNum);
    note.setAttribute('id', generateRandomId());

    const noteTitle = notationSvg.ownerDocument.createElementNS(xmlns, 'title');
    noteTitle.textContent = name;
    note.appendChild(noteTitle);
    notationSvg.appendChild(note);

    const underlines = drawUnderlines(y, color);
    return [note, ...underlines];
}

function drawUnderlines(y, color) {
    const lines = [];

    if (y < startY) {
        let currentY = startY - distY;
        const count = Math.ceil((startY - y) / distY - 0.5);
        for (let i = 0; i < count; i++) {
            lines.push(drawUnderline(currentY, color));
            currentY -= distY;
        }
    }

    if (y === startY + distY * 5) {
        lines.push(drawUnderline(y, color));
    }

    const topY = startY + distY * 10;
    if (y > topY) {
        let currentY = topY + distY;
        const count = Math.ceil((y - topY) / distY - 0.5);
        for (let i = 0; i < count; i++) {
            lines.push(drawUnderline(currentY, color));
            currentY += distY;
        }
    }

    return lines;
}

function drawUnderline(y, color) {
    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return null;
    }

    const centerX = getNotationCenterX();
    const line = notationSvg.ownerDocument.createElementNS(xmlns, 'line');
    line.setAttribute('x1', centerX - 30);
    line.setAttribute('y1', y);
    line.setAttribute('x2', centerX + 30);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '1');
    notationSvg.appendChild(line);
    return line;
}

function getNotationCenterX() {
    const notationSvg = getNotationSvg();
    const svgWidth = notationSvg.clientWidth || notationSvg.getBoundingClientRect().width;
    return svgWidth / 2;
}

function applyHint() {
    if (!hintsEnabled || !currentSample || !currentSample.meta) {
        return;
    }
    removeHint();
    currentSample.hint = createHint(currentSample.meta);
}

function removeHint() {
    if (currentSample && currentSample.hint) {
        const { pointer, tooltip } = currentSample.hint;
        if (pointer) {
            pointer.remove();
        }
        if (tooltip) {
            tooltip.remove();
        }
        currentSample.hint = null;
    }
}

function createHint(meta) {
    const notationSvg = getNotationSvg();
    if (!notationSvg || !meta) {
        return null;
    }

    const noteElement = notationSvg.querySelector(`[data-midi-num="${meta.midiNum}"]`);
    if (!noteElement) {
        return null;
    }

    const pointer = notationSvg.ownerDocument.createElementNS(xmlns, 'polygon');
    pointer.classList.add('note-pointer');
    pointer.style.fill = 'var(--hint-pointer-fill)';
    pointer.style.stroke = 'var(--hint-pointer-stroke)';
    pointer.style.strokeWidth = '1.5px';
    notationSvg.appendChild(pointer);

    const tooltipGroup = notationSvg.ownerDocument.createElementNS(xmlns, 'g');
    tooltipGroup.classList.add('note-tooltip');

    const tooltipRect = notationSvg.ownerDocument.createElementNS(xmlns, 'rect');
    const tooltipText = notationSvg.ownerDocument.createElementNS(xmlns, 'text');
    tooltipText.textContent = meta.name;

    tooltipGroup.appendChild(tooltipRect);
    tooltipGroup.appendChild(tooltipText);
    notationSvg.appendChild(tooltipGroup);

    positionHintElements({ pointer, tooltipGroup, noteElement });

    return { pointer, tooltip: tooltipGroup, noteElement };
}

function positionHint() {
    if (!currentSample || !currentSample.hint) {
        return;
    }

    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return;
    }

    const noteElement = notationSvg.querySelector(`[data-midi-num="${currentSample.meta.midiNum}"]`);
    if (!noteElement) {
        removeHint();
        return;
    }

    currentSample.hint.noteElement = noteElement;
    positionHintElements({
        pointer: currentSample.hint.pointer,
        tooltipGroup: currentSample.hint.tooltip,
        noteElement
    });
}

function positionHintElements({ pointer, tooltipGroup, noteElement }) {
    if (!pointer || !tooltipGroup || !noteElement) {
        return;
    }

    const cx = parseFloat(noteElement.getAttribute('cx'));
    const cy = parseFloat(noteElement.getAttribute('cy'));
    const pointerHeight = 22;
    const pointerWidth = 24;
    const baseY = cy - 20;
    const tipY = baseY - pointerHeight;

    pointer.setAttribute('points', `${cx},${tipY} ${cx - pointerWidth / 2},${baseY} ${cx + pointerWidth / 2},${baseY}`);

    const tooltipText = tooltipGroup.querySelector('text');
    const tooltipRect = tooltipGroup.querySelector('rect');

    if (tooltipText) {
        tooltipText.setAttribute('x', cx);
        tooltipText.setAttribute('y', tipY - 18);
        tooltipText.setAttribute('text-anchor', 'middle');
        tooltipText.setAttribute('dominant-baseline', 'middle');
        tooltipText.setAttribute('font-size', '14');
        tooltipText.setAttribute('font-weight', '600');
        tooltipText.style.fill = 'var(--hint-tooltip-text)';
    }

    if (tooltipRect && tooltipText) {
        const bbox = tooltipText.getBBox();
        const paddingX = 12;
        const paddingY = 6;
        tooltipRect.setAttribute('x', bbox.x - paddingX);
        tooltipRect.setAttribute('y', bbox.y - paddingY);
        tooltipRect.setAttribute('width', bbox.width + paddingX * 2);
        tooltipRect.setAttribute('height', bbox.height + paddingY * 2);
        tooltipRect.setAttribute('rx', 10);
        tooltipRect.setAttribute('ry', 10);
        tooltipRect.style.fill = 'var(--hint-tooltip-bg)';
        tooltipRect.style.stroke = 'var(--hint-pointer-stroke)';
        tooltipRect.style.strokeWidth = '1.5px';
    }
}

function generateRandomId() {
    return `note-${Math.random().toString(36).slice(2, 11)}`;
}
