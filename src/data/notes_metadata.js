import { noteNames, shiftY, startY } from '../core/consts.js';

function createNotesMeta() {
    const notesMeta = [];
    let y = 12 * shiftY + startY;

    for (let octave = 1; octave <= 7; octave++) {
        for (let i = 0; i < 12; i++) {
            const noteName = `${noteNames[i]}${octave}`;
            const midiNum = 24 + (octave - 1) * 12 + i;
            const isWhite = !noteName.includes('#');

            const note = {
                name: noteName,
                midiNum,
                octave,
                isWhite
            };
            notesMeta.push(note);

            if (octave >= 2 && octave <= 5 && isWhite) {
                note.y = y;
                y -= shiftY * 0.5;
            }
        }
    }

    return notesMeta;
}

export const notesMeta = createNotesMeta();

export function findNoteByMidi(midiNumber) {
    return notesMeta.find(note => note.midiNum === Number(midiNumber));
}

export function getNoteName(midiNumber) {
    return noteNames[(Number(midiNumber) - 12) % 12];
}

export function getAllNotesMeta() {
    return notesMeta.slice();
}
