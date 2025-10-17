import { xmlns, startY, distY } from '../core/consts.js';
import { getNotationSvg } from '../core/context.js';
import { getPressedKeyMap } from '../core/state.js';
import { findNoteByMidi } from '../data/notes_metadata.js';
import { getThemeColor } from './theme.js';

const NOTE_SPACING = 70;
const CHORD_OFFSET = 16;

export function getNoteCx({ stepIndex, chordIndex = 0, chordSize = 1, totalSteps }) {
    if (typeof stepIndex !== 'number' || typeof totalSteps !== 'number' || totalSteps < 1) {
        return getNotationCenterX();
    }

    const stepX = getStepX(stepIndex, totalSteps);
    return stepX + getChordOffset(chordIndex, chordSize);
}

let hintsEnabled = false;
let exerciseSnapshot = { exercise: null, index: 0 };
let exerciseElements = [];

export function createVisualNote(meta, { color, cx } = {}) {
    if (!meta || typeof meta.y !== 'number') {
        return [];
    }
    const strokeColor = color ?? getThemeColor('--playback-note-stroke', '#4b5563');
    const options = { stroke: strokeColor };
    if (typeof cx === 'number') {
        options.cx = cx;
    }
    return createNote(meta.y, meta.name, meta.midiNum, options);
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
    const windowSize = Math.max(1, Number(exercise.displayWindow) || steps.length);
    const chunkStart = Math.floor(currentIndex / windowSize) * windowSize;
    const chunkEnd = Math.min(chunkStart + windowSize, steps.length);
    const visibleSteps = steps.slice(chunkStart, chunkEnd);
    const totalSteps = visibleSteps.length;

    const completedColor = getThemeColor('--exercise-note-completed', '#6b7280');
    const currentColor = getThemeColor('--exercise-note-current', '#1f2937');
    const upcomingColor = getThemeColor('--exercise-note-upcoming', '#9ca3af');

    visibleSteps.forEach((step, localIndex) => {
        const globalIndex = chunkStart + localIndex;

        if (!hintsEnabled && globalIndex > currentIndex) {
            return;
        }

        const completed = globalIndex < currentIndex;
        const isCurrent = globalIndex === currentIndex;
        const strokeColor = completed
            ? completedColor
            : isCurrent
                ? currentColor
                : upcomingColor;

        (step.notes || []).forEach((midiNumber, chordIndex) => {
            const meta = findNoteByMidi(midiNumber);
            if (!meta || typeof meta.y !== 'number') {
                return;
            }

            const cx = getNoteCx({
                stepIndex: localIndex,
                chordIndex,
                chordSize: step.notes.length,
                totalSteps
            });
            const noteElements = createNote(meta.y, meta.name, meta.midiNum, {
                cx,
                stroke: strokeColor,
                strokeWidth: isCurrent ? 3.2 : 2.6,
                opacity: completed ? 0.9 : isCurrent ? 1 : 0.9
            });

            const [noteElement] = noteElements;
            if (noteElement && noteElement.tagName && noteElement.tagName.toLowerCase() === 'ellipse') {
                noteElement.setAttribute('data-step-index', String(globalIndex));
                noteElement.setAttribute('data-chord-index', String(chordIndex));
            }

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
    note.setAttribute('rx', '16');
    note.setAttribute('ry', '11');
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

function getStepX(stepIndex, totalSteps) {
    const centerX = getNotationCenterX();
    const baseX = centerX - ((totalSteps - 1) * NOTE_SPACING) / 2;
    return baseX + stepIndex * NOTE_SPACING;
}

function getChordOffset(chordIndex = 0, chordSize = 1) {
    if (!chordSize || chordSize <= 1) {
        return 0;
    }
    return (chordIndex - ((chordSize - 1) / 2)) * CHORD_OFFSET;
}







