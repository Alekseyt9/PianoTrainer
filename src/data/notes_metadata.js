import { shiftY, startY } from '../core/consts.js';

const semitoneDefinitions = [
    { index: 0, natural: 'C', names: ['C'], isWhite: true },
    { index: 1, natural: 'C', names: ['C#', 'Db'], isWhite: false },
    { index: 2, natural: 'D', names: ['D'], isWhite: true },
    { index: 3, natural: 'D', names: ['D#', 'Eb'], isWhite: false },
    { index: 4, natural: 'E', names: ['E'], isWhite: true },
    { index: 5, natural: 'F', names: ['F'], isWhite: true },
    { index: 6, natural: 'F', names: ['F#', 'Gb'], isWhite: false },
    { index: 7, natural: 'G', names: ['G'], isWhite: true },
    { index: 8, natural: 'G', names: ['G#', 'Ab'], isWhite: false },
    { index: 9, natural: 'A', names: ['A'], isWhite: true },
    { index: 10, natural: 'A', names: ['A#', 'Bb'], isWhite: false },
    { index: 11, natural: 'B', names: ['B'], isWhite: true }
];

const midiToNote = new Map();
const nameToNote = new Map();
const sharpNameMap = semitoneDefinitions.map(definition => {
    const preferred = definition.names.find(name => !name.includes('b'));
    return preferred ?? definition.names[0];
});
const flatNameMap = semitoneDefinitions.map(definition => {
    const preferred = definition.names.find(name => name.includes('b'));
    return preferred ?? definition.names[0];
});

export function normalizeNoteName(value) {
    if (typeof value !== 'string') {
        return null;
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }
    const match = trimmed.match(/^([A-Ga-g])([#b\u266F\u266D]?)(\d)$/);
    if (!match) {
        return null;
    }
    const letter = match[1].toUpperCase();
    let accidental = match[2] || '';
    if (accidental === '\u266F') {
        accidental = '#';
    } else if (accidental === '\u266D') {
        accidental = 'b';
    } else if (accidental !== '#' && accidental !== 'b') {
        accidental = '';
    }
    const octave = match[3];
    return `${letter}${accidental}${octave}`;
}

function createNotesMeta() {
    const notesMeta = [];
    const naturalPositions = new Map();
    let y = 12 * shiftY + startY;

    for (let octave = 1; octave <= 7; octave++) {
        for (const definition of semitoneDefinitions) {
            const midiNum = 24 + (octave - 1) * 12 + definition.index;
            const aliases = definition.names.map(name => `${name}${octave}`);
            const note = {
                name: aliases[0],
                midiNum,
                octave,
                isWhite: definition.isWhite,
                aliases: aliases.slice(1)
            };

            const naturalKey = `${definition.natural}${octave}`;
            if (definition.isWhite) {
                if (octave >= 2 && octave <= 5) {
                    note.y = y;
                    naturalPositions.set(naturalKey, y);
                    y -= shiftY * 0.5;
                }
            } else if (naturalPositions.has(naturalKey)) {
                note.y = naturalPositions.get(naturalKey);
            }

            notesMeta.push(note);
            midiToNote.set(midiNum, note);
            aliases.forEach(alias => {
                const canonicalAlias = normalizeNoteName(alias);
                if (canonicalAlias) {
                    nameToNote.set(canonicalAlias, note);
                }
            });
            const canonicalName = normalizeNoteName(note.name);
            if (canonicalName) {
                nameToNote.set(canonicalName, note);
            }
        }
    }

    return notesMeta;
}

export const notesMeta = createNotesMeta();

export function findNoteByMidi(midiNumber) {
    return midiToNote.get(Number(midiNumber)) || null;
}

export function findNoteByName(name) {
    const canonical = normalizeNoteName(name);
    if (!canonical) {
        return null;
    }
    return nameToNote.get(canonical) || null;
}

export function getMidiNumberByName(name) {
    const note = findNoteByName(name);
    return note ? note.midiNum : null;
}

export function getNoteName(midiNumber) {
    const note = findNoteByMidi(midiNumber);
    return note ? note.name : null;
}

export function getPreferredNoteName(midiNumber, preference = 'sharp') {
    const numeric = Number(midiNumber);
    if (!Number.isFinite(numeric)) {
        return null;
    }
    const index = ((numeric % 12) + 12) % 12;
    const octave = Math.floor(numeric / 12) - 1;
    const names = preference === 'flat' ? flatNameMap : sharpNameMap;
    const baseName = names[index] ?? sharpNameMap[index] ?? 'C';
    return `${baseName}${octave}`;
}

export function getAllNotesMeta() {
    return notesMeta.slice();
}

export function getAccidentalPair(midiNumber) {
    const note = findNoteByMidi(midiNumber);
    if (!note) {
        return null;
    }
    const names = [note.name, ...(Array.isArray(note.aliases) ? note.aliases : [])];
    const pair = {
        sharp: null,
        flat: null
    };
    names.forEach(name => {
        const canonical = normalizeNoteName(name);
        if (!canonical) {
            return;
        }
        if (canonical.includes('#')) {
            pair.sharp = canonical;
        } else if (canonical.includes('b')) {
            pair.flat = canonical;
        }
    });
    if (!pair.sharp && !pair.flat) {
        return null;
    }
    return pair;
}

export function normalizeStepNoteNames(step) {
    if (!step) {
        return [];
    }
    if (typeof step === 'string') {
        return step.trim().split(/\s+/).filter(Boolean);
    }
    if (Array.isArray(step)) {
        return step.flatMap(item => normalizeStepNoteNames(item));
    }
    if (typeof step === 'object') {
        if (typeof step.notes === 'string') {
            return step.notes.trim().split(/\s+/).filter(Boolean);
        }
        if (Array.isArray(step.notes)) {
            return step.notes.map(value => String(value)).map(value => value.trim()).filter(Boolean);
        }
    }
    return [];
}

export function getStepMidiNumbers(step) {
    return normalizeStepNoteNames(step)
        .map(getMidiNumberByName)
        .filter(midi => typeof midi === 'number');
}

export function getStepNoteMetas(step) {
    return normalizeStepNoteNames(step)
        .map(name => {
            const note = findNoteByName(name);
            if (!note || typeof note.midiNum !== 'number') {
                return null;
            }
            return {
                ...note,
                displayName: name
            };
        })
        .filter(Boolean);
}
