
function createNotesMeta() {
    const notesMeta = [];

    for (let octave = 1; octave <= 7; octave++) {
        for (let i = 0; i < 12; i++) {
            const noteName = noteNames[i] + octave;
            const midiNum = 24 + (octave - 1) * 12 + i; 
            const isWhite = !(noteName.includes('#')); 

            notesMeta.push({
                name: noteName,
                midiNum: midiNum,
                octave: octave,
                isWhite: isWhite
            });
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

        return meta.find(x => x.midiNum = midiNum);
    });

    return highlightedKeysMetadata;
}

function getNoteName(midiNumber) {
    return noteNames[(midiNumber - 12) % 12];
}