    
let notes = [];

function createNote(y, name, midiNum, color = 'black') {
    const svgWidth = svgN.clientWidth || svgN.getBoundingClientRect().width;
    const centerX = svgWidth / 2;

    const note = document.createElementNS(xmlns, 'ellipse');
    note.setAttribute('cx', centerX);  
    note.setAttribute('cy', y);
    note.setAttribute('rx', '20'); 
    note.setAttribute('ry', '14');
    note.setAttribute('fill', 'none');
    note.setAttribute('stroke', color);
    note.setAttribute('stroke-width', '2');
    note.setAttribute('name', name);
    note.setAttribute('id', generateRandomId());
    note.setAttribute('midiNum', midiNum);
    svgN.appendChild(note);
    return note;
}

function generateRandomId() {
    return 'note-' + Math.random().toString(36).substr(2, 9);
}

function animate() {
    notes.forEach(note => {
        const cx = parseFloat(note.getAttribute('cx')) - 2; 
        if (cx > 10) {  
            note.setAttribute('cx', cx);
        }
    });
    requestAnimationFrame(animate);
}

function generateNotes() {
    //var hMeta = getHighlightedKeysMetadata();

    let staffLines = [];
    for (let i = 1*12; i < 5*12; i++)
    {
        var n = meta[i];
        if (!n.isWhite)
            continue;
        const note = createNote(n.y, n.name);
        notes.push(note);
    }
}

function getRandomElementFromArray(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

var currentNote;

function generateSampleNote()
{
    if (currentNote)
    {
        currentNote.remove();
        currentNote = null;
    }

    var hMeta = getHighlightedKeysMetadata();
    var nMeta = getRandomElementFromArray(hMeta);
    currentNote = createNote(nMeta.y, nMeta.name, nMeta.midiNum);
}


//generateNotes();
//animate();