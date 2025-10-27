import { xmlns, startY, distY } from '../core/consts.js';
import { getNotationSvg } from '../core/context.js';
import { getPressedKeyMap, setPressedKey } from '../core/state.js';
import { getStepNoteMetas, findNoteByMidi, getStepMidiNumbers } from '../data/notes_metadata.js';
import { getThemeColor } from './theme.js';
import { getRowOffset, STEPS_PER_ROW } from '../core/layout.js';
import { computeExerciseWindow, getRowLayout } from '../core/exercise_layout.js';

const NOTE_SPACING = 60;
const UNDERLINE_HALF_WIDTH = 22;

export function resolveStepPosition(exercise, currentIndex, midiNumber) {
    const { visibleSteps, chunkStart } = computeExerciseWindow(exercise, currentIndex);
    if (!visibleSteps.length) {
        return { cx: getNotationCenterX(), offsetY: 0 };
    }

    const localIndex = currentIndex - chunkStart;
    if (localIndex < 0 || localIndex >= visibleSteps.length) {
        return { cx: getNotationCenterX(), offsetY: 0 };
    }

    const step = visibleSteps[localIndex];
    const chord = getStepMidiNumbers(step);
    if (!chord.length) {
        return { cx: getNotationCenterX(), offsetY: 0 };
    }

    const normalized = Number(midiNumber);
    const chordIndex = chord.findIndex(value => value === normalized);
    const { rowIndex, indexInRow, stepsInRow } = getRowLayout(localIndex, visibleSteps.length);
    const offsetY = getRowOffset(rowIndex);
    const chordSize = chord.length;
    const resolvedChordIndex = chordIndex === -1 ? Math.floor((chordSize - 1) / 2) : chordIndex;
    const cx = getNoteCx({
        stepIndex: indexInRow,
        chordIndex: resolvedChordIndex,
        chordSize,
        totalSteps: stepsInRow
    });

    return { cx, offsetY };
}



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

export function createVisualNote(meta, { color, cx, offsetY } = {}) {
    if (!meta || typeof meta.y !== 'number') {
        return [];
    }
    const strokeColor = color ?? getThemeColor('--playback-note-stroke', '#4b5563');
    const options = { stroke: strokeColor };
    if (typeof cx === 'number') {
        options.cx = cx;
    }
    if (typeof offsetY === 'number') {
        options.offsetY = offsetY;
    }
    const label = meta.displayName || meta.name;
    return createNote(meta.y, label, meta.midiNum, options);
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

    const { visibleSteps, chunkStart } = computeExerciseWindow(exercise, currentIndex);
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

        const noteMetas = getStepNoteMetas(step);
        const { rowIndex, indexInRow, stepsInRow } = getRowLayout(localIndex, totalSteps);
        const offsetY = getRowOffset(rowIndex);

        noteMetas.forEach((meta, chordIndex) => {
            if (!meta || typeof meta.y !== 'number') {
                return;
            }

            const cx = getNoteCx({
                stepIndex: indexInRow,
                chordIndex,
                chordSize: noteMetas.length,
                totalSteps: stepsInRow
            });
            const noteElements = createNote(meta.y, meta.displayName || meta.name, meta.midiNum, {
                cx,
                stroke: strokeColor,
                strokeWidth: isCurrent ? 2.6 : 2.2,
                opacity: completed ? 0.85 : isCurrent ? 1 : 0.9,
                offsetY
            });

            const [noteElement] = noteElements;
            if (noteElement && noteElement.tagName && noteElement.tagName.toLowerCase() === 'ellipse') {
                noteElement.setAttribute('data-step-index', String(globalIndex));
                noteElement.setAttribute('data-chord-index', String(chordIndex));
                noteElement.setAttribute('data-row-index', String(rowIndex));
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

    const playbackColor = getThemeColor('--playback-note-stroke', '#4b5563');
    const pressedEntries = Array.from(getPressedKeyMap().entries());

    pressedEntries.forEach(([, elements]) => {
        if (elements) {
            removeVisualNote(elements);
        }
    });

    pressedEntries.forEach(([noteNumber]) => {
        const normalized = Number(noteNumber);
        const meta = findNoteByMidi(normalized);
        if (!meta) {
            setPressedKey(normalized, []);
            return;
        }
        const { cx, offsetY } = resolveStepPosition(exerciseSnapshot.exercise, exerciseSnapshot.index, normalized);
        const visualElements = createVisualNote(meta, {
            color: playbackColor,
            cx,
            offsetY
        });
        setPressedKey(normalized, visualElements);
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
        opacity = 1,
        offsetY = 0
    } = options;

    const absoluteY = y + offsetY;

    const note = notationSvg.ownerDocument.createElementNS(xmlns, 'ellipse');
    note.setAttribute('cx', cx);
    note.setAttribute('cy', absoluteY);
    note.setAttribute('rx', '12');
    note.setAttribute('ry', '8');
    note.setAttribute('fill', 'none');
    note.setAttribute('stroke', stroke);
    note.setAttribute('stroke-width', strokeWidth);
    note.setAttribute('opacity', opacity);
    note.setAttribute('name', name);
    note.setAttribute('data-midi-num', midiNum);
    note.setAttribute('data-base-y', y);
    note.setAttribute('data-offset-y', offsetY);
    note.setAttribute('id', generateRandomId());

    const noteTitle = notationSvg.ownerDocument.createElementNS(xmlns, 'title');
    noteTitle.textContent = name;
    note.appendChild(noteTitle);
    notationSvg.appendChild(note);

    const underlines = drawUnderlines(y, stroke, cx, opacity, offsetY);
    const elements = [note, ...underlines];

    const accidentalSymbol = resolveAccidentalSymbol(name);
    if (accidentalSymbol) {
        const accidental = notationSvg.ownerDocument.createElementNS(xmlns, 'text');
        accidental.setAttribute('x', cx - 18);
        accidental.setAttribute('y', absoluteY + 1);
        accidental.setAttribute('font-size', '20');
        accidental.setAttribute('font-family', 'Arial, sans-serif');
        accidental.setAttribute('fill', stroke);
        accidental.setAttribute('opacity', opacity);
        accidental.setAttribute('text-anchor', 'middle');
        accidental.setAttribute('dominant-baseline', 'middle');
        accidental.setAttribute('data-base-y', y);
        accidental.setAttribute('data-offset-y', offsetY);
        accidental.textContent = accidentalSymbol;
        notationSvg.appendChild(accidental);
        elements.push(accidental);
    }

    return elements;
}

function drawUnderlines(y, stroke, centerX, opacity = 1, offsetY = 0) {
    const lines = [];
    const baseStartY = startY;
    const absoluteStartY = baseStartY + offsetY;
    const absoluteY = y + offsetY;
    const absoluteMiddle = baseStartY + distY * 5 + offsetY;
    const absoluteTop = baseStartY + distY * 10 + offsetY;

    if (absoluteY < absoluteStartY) {
        let currentAbsolute = absoluteStartY - distY;
        let currentBase = currentAbsolute - offsetY;
        const count = Math.ceil((absoluteStartY - absoluteY) / distY - 0.5);
        for (let i = 0; i < count; i++) {
            lines.push(drawUnderline(currentAbsolute, currentBase, stroke, centerX, opacity, offsetY));
            currentAbsolute -= distY;
            currentBase -= distY;
        }
    }

    if (absoluteY === absoluteMiddle) {
        lines.push(drawUnderline(absoluteY, y, stroke, centerX, opacity, offsetY));
    }

    if (absoluteY > absoluteTop) {
        let currentAbsolute = absoluteTop + distY;
        let currentBase = currentAbsolute - offsetY;
        const count = Math.ceil((absoluteY - absoluteTop) / distY - 0.5);
        for (let i = 0; i < count; i++) {
            lines.push(drawUnderline(currentAbsolute, currentBase, stroke, centerX, opacity, offsetY));
            currentAbsolute += distY;
            currentBase += distY;
        }
    }

    return lines;
}

function drawUnderline(y, baseY, stroke, centerX, opacity, offsetY) {
    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return null;
    }

    const line = notationSvg.ownerDocument.createElementNS(xmlns, 'line');
    line.setAttribute('x1', centerX - UNDERLINE_HALF_WIDTH);
    line.setAttribute('y1', y);
    line.setAttribute('x2', centerX + UNDERLINE_HALF_WIDTH);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', stroke);
    line.setAttribute('stroke-width', '1');
    line.setAttribute('opacity', opacity);
    line.setAttribute('data-base-y', baseY);
    line.setAttribute('data-offset-y', offsetY);
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
    return 0;
}

function resolveAccidentalSymbol(name) {
    if (typeof name !== 'string') {
        return null;
    }
    const match = name.trim().match(/^[A-Ga-g]([#b\u266F\u266D])/);
    if (!match) {
        return null;
    }
    const accidental = match[1];
    if (accidental === '#' || accidental === '\u266F') {
        return '\u266F';
    }
    if (accidental === 'b' || accidental === '\u266D') {
        return '\u266D';
    }
    return null;
}
