import { xmlns, startY, distY } from '../core/consts.js';
import { getNotationSvg } from '../core/context.js';
import { getPressedKeyMap, setPressedKey } from '../core/state.js';
import { getStepNoteMetas, findNoteByMidi, getStepMidiNumbers, getPreferredNoteName } from '../data/notes_metadata.js';
import { getThemeColor } from './theme.js';
import { getRowOffset, getStaffRowHeight, STAFF_LEFT_MARGIN, STAFF_RIGHT_MARGIN } from '../core/layout.js';
import { computeExerciseWindow, getRowLayout } from '../core/exercise_layout.js';
import { setStaffRowCount } from './notation.js';
import { updateRowProgress } from './stats_panel.js';

const NOTE_SPACING = 48;
const UNDERLINE_HALF_WIDTH = 16;
const DEFAULT_ACCIDENTAL_PREFERENCE = 'sharp';
const DEFAULT_ROW_CAPACITY = 20;
const NOTATION_SCROLL_AREA_ID = 'notation-scroll-area';
let lastKnownNotationWidth = 0;
let lastKnownRowCapacity = DEFAULT_ROW_CAPACITY;
let configuredRowCapacity = null;
let lastAutoScrollRowIndex = null;
let lastAutoScrollExerciseId = null;

export function getCurrentRowCapacity() {
    return lastKnownRowCapacity || getTargetRowCapacity();
}

export function resolveStepPosition(exercise, currentIndex, midiNumber) {
    const notationSvg = getNotationSvg();
    const { visibleSteps } = computeExerciseWindow(exercise, currentIndex);
    if (!visibleSteps.length) {
        return { cx: getNotationCenterX(), offsetY: 0 };
    }

    const clampedIndex = Math.max(0, Math.min(visibleSteps.length - 1, currentIndex));
    const step = visibleSteps[clampedIndex];
    const chord = getStepMidiNumbers(step);
    if (!chord.length) {
        return { cx: getNotationCenterX(), offsetY: 0 };
    }

    const normalized = Number(midiNumber);
    const chordIndex = chord.findIndex(value => value === normalized);
    const rowCapacity = computeRowCapacity(notationSvg);
    const { rowIndex, indexInRow, stepsInRow } = getRowLayout(clampedIndex, visibleSteps.length, rowCapacity);
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

export function createVisualNote(meta, { color, cx, offsetY, label } = {}) {
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
    const noteLabel = label ?? meta.displayName ?? meta.name;
    return createNote(meta.y, noteLabel, meta.midiNum, options);
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

    const notationSvg = getNotationSvg();
    const steps = Array.isArray(exercise?.steps) ? exercise.steps : [];

    if (!notationSvg) {
        updateRowProgress({
            rowsCompleted: 0,
            totalRows: 0,
            completedNotes: 0,
            totalNotes: 0
        });
        return;
    }

    if (!exercise || !steps.length) {
        setStaffRowCount(1);
        updateRowProgress({
            rowsCompleted: 0,
            totalRows: 1,
            completedNotes: 0,
            totalNotes: 0
        });
        resetAutoScrollState();
        return;
    }

    const rowCapacity = computeRowCapacity(notationSvg);
    const totalSteps = steps.length;
    const rowCount = Math.max(1, Math.ceil(totalSteps / rowCapacity));
    setStaffRowCount(rowCount);

    const clampedIndex = Math.max(0, Math.min(totalSteps, currentIndex));
    const rowsCompleted = Math.max(0, Math.min(rowCount, Math.floor(clampedIndex / rowCapacity)));
    const currentRowIndex = rowCount > 0
        ? Math.min(rowCount - 1, rowsCompleted === rowCount ? rowCount - 1 : Math.floor(clampedIndex / rowCapacity))
        : 0;
    const currentRowStart = currentRowIndex * rowCapacity;
    const currentRowTotalSteps = Math.min(rowCapacity, Math.max(0, totalSteps - currentRowStart));
    let notesCompletedInRow = Math.max(0, clampedIndex - currentRowStart);
    if (rowsCompleted === rowCount && currentRowTotalSteps > 0) {
        notesCompletedInRow = currentRowTotalSteps;
    } else {
        notesCompletedInRow = Math.min(notesCompletedInRow, currentRowTotalSteps);
    }

    updateRowProgress({
        rowsCompleted,
        totalRows: rowCount,
        completedNotes: notesCompletedInRow,
        totalNotes: currentRowTotalSteps
    });
    autoScrollRowIntoView({
        rowIndex: currentRowIndex,
        rowCount,
        exerciseId: exercise?.id ?? null
    });

    const completedColor = getThemeColor('--playback-note-stroke', '#4b5563');
    const upcomingColor = getThemeColor('--exercise-note-upcoming', '#9ca3af');

    steps.forEach((step, localIndex) => {
        const globalIndex = localIndex;

        if (!hintsEnabled && globalIndex > currentIndex) {
            return;
        }

        const completed = globalIndex < currentIndex;
        const strokeColor = completed ? completedColor : upcomingColor;
        const strokeWidth = completed ? 2 : 1.5;
        const noteOpacity = completed ? 1 : 0.9;

        const noteMetas = getStepNoteMetas(step);
        const { rowIndex, indexInRow, stepsInRow } = getRowLayout(localIndex, totalSteps, rowCapacity);
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
                fill: 'none',
                strokeWidth,
                opacity: noteOpacity,
                offsetY
            });

            const [noteElement] = noteElements;
            if (noteElement && noteElement.tagName && noteElement.tagName.toLowerCase() === 'ellipse') {
                noteElement.setAttribute('data-step-index', String(globalIndex));
                noteElement.setAttribute('data-chord-index', String(chordIndex));
                noteElement.setAttribute('data-row-index', String(rowIndex));
                noteElement.setAttribute('data-offset-y', String(offsetY));
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

    const exercise = exerciseSnapshot.exercise;
    const preference = exercise?.accidentalPreference ?? DEFAULT_ACCIDENTAL_PREFERENCE;
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
        const { cx, offsetY } = resolveStepPosition(exercise, exerciseSnapshot.index, normalized);
        const label = getPreferredNoteName(normalized, preference) ?? meta.name;
        const visualElements = createVisualNote(meta, {
            color: playbackColor,
            cx,
            offsetY,
            label
        });
        setPressedKey(normalized, visualElements);
    });

    renderExerciseSteps(exerciseSnapshot.exercise, exerciseSnapshot.index, { preserveSnapshot: true });
}

function clearExerciseElements() {
    exerciseElements.forEach(element => element.remove());
    exerciseElements = [];
}

function getNotationScrollElement() {
    if (typeof document === 'undefined') {
        return null;
    }
    return document.getElementById(NOTATION_SCROLL_AREA_ID);
}

function resetAutoScrollState(exerciseId = null) {
    lastAutoScrollRowIndex = null;
    lastAutoScrollExerciseId = exerciseId;
}

function autoScrollRowIntoView({ rowIndex, rowCount, exerciseId }) {
    const scrollContainer = getNotationScrollElement();
    if (!scrollContainer || typeof rowIndex !== 'number' || typeof rowCount !== 'number') {
        return;
    }

    const normalizedRow = Math.max(0, Math.min(rowCount - 1, rowIndex));
    const exerciseChanged = exerciseId && exerciseId !== lastAutoScrollExerciseId;
    if (!exerciseChanged && lastAutoScrollRowIndex === normalizedRow) {
        return;
    }

    const rowHeight = getStaffRowHeight();
    const rowOffset = startY + getRowOffset(normalizedRow);
    const hasNextRow = normalizedRow < rowCount - 1;
    const rowsToCover = hasNextRow ? 2 : 1;
    const desiredBottom = rowOffset + rowHeight * rowsToCover;
    const viewportHeight = scrollContainer.clientHeight || scrollContainer.offsetHeight || 0;
    const maxScrollTop = Math.max(0, scrollContainer.scrollHeight - viewportHeight);

    let targetTop = Math.max(0, Math.min(rowOffset, maxScrollTop));
    if (viewportHeight > 0) {
        const candidateTop = Math.max(0, desiredBottom - viewportHeight);
        const cappedTop = Math.min(rowOffset, candidateTop);
        targetTop = Math.max(0, Math.min(cappedTop, maxScrollTop));
    }

    const distance = Math.abs((scrollContainer.scrollTop || 0) - targetTop);
    const behavior = exerciseChanged || distance < rowHeight * 0.35 ? 'auto' : 'smooth';
    if (typeof scrollContainer.scrollTo === 'function') {
        scrollContainer.scrollTo({ top: targetTop, behavior });
    } else {
        scrollContainer.scrollTop = targetTop;
    }

    lastAutoScrollRowIndex = normalizedRow;
    lastAutoScrollExerciseId = exerciseId ?? null;
}

function createNote(y, name, midiNum, options = {}) {
    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return [];
    }

    const {
        cx = getNotationCenterX(),
        stroke = '#374151',
        strokeWidth = 1.6,
        opacity = 1,
        offsetY = 0
    } = options;

    const absoluteY = y + offsetY;

    const note = notationSvg.ownerDocument.createElementNS(xmlns, 'ellipse');
    note.setAttribute('cx', cx);
    note.setAttribute('cy', absoluteY);
    note.setAttribute('rx', '7');
    note.setAttribute('ry', '5');
    note.setAttribute('fill', 'none');
    note.setAttribute('stroke', stroke);
    note.setAttribute('stroke-width', strokeWidth);
    note.setAttribute('opacity', opacity);
    note.setAttribute('name', name);
    note.setAttribute('data-midi-num', midiNum);
    note.setAttribute('data-base-y', y);
    note.setAttribute('data-offset-y', offsetY);
    note.setAttribute('id', generateRandomId());

    notationSvg.appendChild(note);

    const underlines = drawUnderlines(y, stroke, cx, opacity, offsetY);
    const elements = [note, ...underlines];

    const accidentalSymbol = resolveAccidentalSymbol(name);
    if (accidentalSymbol) {
        const accidental = notationSvg.ownerDocument.createElementNS(xmlns, 'text');
        accidental.setAttribute('x', cx - 12);
        accidental.setAttribute('y', absoluteY + 1);
        accidental.setAttribute('font-size', '14');
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

function getTargetRowCapacity() {
    if (typeof configuredRowCapacity === 'number' && configuredRowCapacity > 0) {
        return configuredRowCapacity;
    }
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return DEFAULT_ROW_CAPACITY;
    }
    try {
        const styles = window.getComputedStyle(document.documentElement);
        if (styles) {
            const raw = styles.getPropertyValue('--notation-row-capacity');
            const parsed = Number.parseInt(raw, 10);
            if (Number.isFinite(parsed) && parsed > 0) {
                configuredRowCapacity = parsed;
                return configuredRowCapacity;
            }
        }
    } catch (error) {
        // ignore inability to read CSS variable and fall back to default
    }
    configuredRowCapacity = DEFAULT_ROW_CAPACITY;
    return configuredRowCapacity;
}

function computeRowCapacity(notationSvg) {
    const targetCapacity = getTargetRowCapacity();
    let width = getNotationWidth(notationSvg);
    if (width <= 0) {
        return lastKnownRowCapacity || targetCapacity;
    }
    if (lastKnownNotationWidth && width < lastKnownNotationWidth) {
        const shrink = lastKnownNotationWidth - width;
        if (shrink < NOTE_SPACING) {
            width = lastKnownNotationWidth;
        }
    }
    const contentWidth = Math.max(0, width - (STAFF_LEFT_MARGIN + STAFF_RIGHT_MARGIN));
    const padding = NOTE_SPACING * 0.6;
    const effectiveWidth = Math.max(NOTE_SPACING, contentWidth - padding);
    const capacity = Math.max(1, Math.floor((effectiveWidth + NOTE_SPACING * 0.25) / NOTE_SPACING));
    const normalizedCapacity = Math.max(1, Math.min(capacity, targetCapacity));
    lastKnownNotationWidth = width;
    lastKnownRowCapacity = normalizedCapacity;
    return normalizedCapacity;
}

function getNotationWidth(notationSvg) {
    if (!notationSvg) {
        return 0;
    }
    const rect = notationSvg.getBoundingClientRect?.();
    if (rect && rect.width) {
        return rect.width;
    }
    if (notationSvg.clientWidth) {
        return notationSvg.clientWidth;
    }
    const parent = notationSvg.parentElement;
    if (parent) {
        const parentRect = parent.getBoundingClientRect?.();
        if (parentRect && parentRect.width) {
            return parentRect.width;
        }
        if (parent.clientWidth) {
            return parent.clientWidth;
        }
    }
    const viewBox = notationSvg.viewBox?.baseVal;
    if (viewBox && viewBox.width) {
        return viewBox.width;
    }
    const attrWidth = Number(notationSvg.getAttribute('width'));
    if (attrWidth) {
        return attrWidth;
    }
    return 0;
}

function getNotationCenterX() {
    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return 0;
    }
    const rect = notationSvg.getBoundingClientRect?.();
    const svgWidth = rect?.width || notationSvg.clientWidth || 0;
    const contentWidth = Math.max(0, svgWidth - (STAFF_LEFT_MARGIN + STAFF_RIGHT_MARGIN));
    return STAFF_LEFT_MARGIN + contentWidth / 2;
}

function generateRandomId() {
    return `note-${Math.random().toString(36).slice(2, 11)}`;
}

function getStepX(stepIndex, totalSteps) {
    if (typeof stepIndex !== 'number' || stepIndex < 0) {
        return getNotationCenterX();
    }
    const leftMargin = STAFF_LEFT_MARGIN + NOTE_SPACING * 0.5;
    return leftMargin + stepIndex * NOTE_SPACING;
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

