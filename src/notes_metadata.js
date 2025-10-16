
function createNotesMeta() {
    const notesMeta = [];

    let y = 12 * shiftY + startY; // starting ledger-line anchor for assigning staff positions

    for (let octave = 1; octave <= 7; octave++) {
        for (let i = 0; i < 12; i++) {
            const noteName = noteNames[i] + octave;
            const midiNum = 24 + (octave - 1) * 12 + i; 
            const isWhite = !(noteName.includes('#')); 

            const note = {
                name: noteName,
                midiNum: midiNum,
                octave: octave,
                isWhite: isWhite
            };
            notesMeta.push(note);

            if (octave >= 2 && octave <= 5)
            {
                if (isWhite){
                    note.y = y;
                    y -= shiftY * 0.5;
                }
            }

        }
    }

    return notesMeta;
}

const meta = createNotesMeta();

function getHighlightedKeysMetadata() {
    const keys = document.querySelectorAll('.key');
    const highlightedKeys = Array.from(keys).filter(key => key.classList.contains('highlight'));

    const highlightedKeysMetadata = highlightedKeys.map(key => {
        const noteNumber = key.getAttribute('data-note-number');
        const midiNum = parseInt(noteNumber, 10);

        const note = meta.find(x => x.midiNum === midiNum);
        return note;
    }).filter(note => note && note.isWhite && typeof note.y === 'number');

    return highlightedKeysMetadata;
}

function getNoteName(midiNumber) {
    return noteNames[(midiNumber - 12) % 12];
}
