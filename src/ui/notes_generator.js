import { xmlns, startY, distY } from '../core/consts.js';
import { getNotationSvg } from '../core/context.js';
import { getPressedKeyMap } from '../core/state.js';
import { findNoteByMidi } from '../data/notes_metadata.js';

const NOTE_SPACING = 90;
const CHORD_OFFSET = 18;

let hintsEnabled = false;
let exerciseSnapshot = { exercise: null, index: 0 };
let exerciseElements = [];

export function createVisualNote(meta, { color = 'gray' } = {}) {
    if (!meta || typeof meta.y !== 'number') {
        return [];
    }
    return createNote(meta.y, meta.name, meta.midiNum, {
        stroke: color
    });
}

export function removeVisualNote(elements) {
    if (!elements) {
        return;
    }
    elements.forEach(element => element.remove());
}

export function setHintsEnabled(enabled) {
    hintsEnabled = Boolean(enabled);
    renderExerciseSteps(exerciseSnapshot.exercise, exerciseSnapshot.index, { preserveSnapshot: true });
}

export function areHintsEnabled() {
    return hintsEnabled;
}

export function renderExerciseSteps(exercise, currentIndex, { preserveSnapshot = false } = {}) {
    if (!preserveSnapshot) {
        exerciseSnapshot = { exercise, index: currentIndex };
    }

    clearExerciseElements();

    if (!exercise || !exercise.steps || !exercise.steps.length) {
        return;
    }

    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return;
    }

    const steps = exercise.steps;
    const baseX = getNotationCenterX() - ((steps.length - 1) * NOTE_SPACING) / 2;

    steps.forEach((step, stepIndex) => {
        if (!hintsEnabled && stepIndex > currentIndex) {
            return;
        }

        const stepX = baseX + stepIndex * NOTE_SPACING;
        const completed = stepIndex < currentIndex;
        const isCurrent = stepIndex === currentIndex;
        const strokeColor = completed
            ? '#6b7280'
            : isCurrent
                ? '#1f2937'
                : '#9ca3af';

        (step.notes || []).forEach((midiNumber, chordIndex) => {
            const meta = findNoteByMidi(midiNumber);
            if (!meta || typeof meta.y !== 'number') {
                return;
            }

            const offset = (chordIndex - ((step.notes.length - 1) / 2)) * CHORD_OFFSET;
            const cx = stepX + offset;
            const noteElements = createNote(meta.y, meta.name, meta.midiNum, {
                cx,
                stroke: strokeColor,
                strokeWidth: isCurrent ? 3.2 : 2.6,
                opacity: completed ? 0.9 : isCurrent ? 1 : 0.9
            });

            exerciseElements.push(...noteElements);
        });
    });
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

    getPressedKeyMap().forEach(elements => {
        if (Array.isArray(elements)) {
            elements.forEach(adjustElement);
        }
    });

    renderExerciseSteps(exerciseSnapshot.exercise, exerciseSnapshot.index, { preserveSnapshot: true });
}

function clearExerciseElements() {
    exerciseElements.forEach(element => element.remove());
    exerciseElements = [];
}

function createNote(y, name, midiNum, options = {}) {
    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return [];
    }

    const {
        cx = getNotationCenterX(),
        stroke = '#374151',
        strokeWidth = 2,
        opacity = 1
    } = options;

    const note = notationSvg.ownerDocument.createElementNS(xmlns, 'ellipse');
    note.setAttribute('cx', cx);
    note.setAttribute('cy', y);
    note.setAttribute('rx', '20');
    note.setAttribute('ry', '14');
    note.setAttribute('fill', 'none');
    note.setAttribute('stroke', stroke);
    note.setAttribute('stroke-width', strokeWidth);
    note.setAttribute('opacity', opacity);
    note.setAttribute('name', name);
    note.setAttribute('data-midi-num', midiNum);
    note.setAttribute('id', generateRandomId());

    const noteTitle = notationSvg.ownerDocument.createElementNS(xmlns, 'title');
    noteTitle.textContent = name;
    note.appendChild(noteTitle);
    notationSvg.appendChild(note);

    const underlines = drawUnderlines(y, stroke, cx, opacity);
    return [note, ...underlines];
}

function drawUnderlines(y, stroke, centerX, opacity = 1) {
    const lines = [];

    if (y < startY) {
        let currentY = startY - distY;
        const count = Math.ceil((startY - y) / distY - 0.5);
        for (let i = 0; i < count; i++) {
            lines.push(drawUnderline(currentY, stroke, centerX, opacity));
            currentY -= distY;
        }
    }

    if (y === startY + distY * 5) {
        lines.push(drawUnderline(y, stroke, centerX, opacity));
    }

    const topY = startY + distY * 10;
    if (y > topY) {
        let currentY = topY + distY;
        const count = Math.ceil((y - topY) / distY - 0.5);
        for (let i = 0; i < count; i++) {
            lines.push(drawUnderline(currentY, stroke, centerX, opacity));
            currentY += distY;
        }
    }

    return lines;
}

function drawUnderline(y, stroke, centerX, opacity) {
    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return null;
    }

    const line = notationSvg.ownerDocument.createElementNS(xmlns, 'line');
    line.setAttribute('x1', centerX - 30);
    line.setAttribute('y1', y);
    line.setAttribute('x2', centerX + 30);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', stroke);
    line.setAttribute('stroke-width', '1');
    line.setAttribute('opacity', opacity);
    notationSvg.appendChild(line);
    return line;
}

function getNotationCenterX() {
    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return 0;
    }
    const svgWidth = notationSvg.clientWidth || notationSvg.getBoundingClientRect().width;
    return svgWidth / 2;
}

function generateRandomId() {
    return `note-${Math.random().toString(36).slice(2, 11)}`;
}







