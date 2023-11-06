    
let notes = [];

function createNote(y, name) {
    const note = document.createElementNS(xmlns, 'ellipse');
    note.setAttribute('cx', '200');  
    note.setAttribute('cy', y);
    note.setAttribute('rx', '20'); 
    note.setAttribute('ry', '14');
    note.setAttribute('fill', 'none');
    note.setAttribute('stroke', 'black');
    note.setAttribute('stroke-width', '2');
    note.setAttribute('name', name);
    svgN.appendChild(note);
    return note;
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

const keys = document.querySelectorAll('.key');
keys.forEach(key => key.addEventListener('mousedown', keyPressHandler));

function keyPressHandler(event) {
    const key = event.target;
    const noteNumber = key.dataset.noteNumber;

    var keyM = meta.find(x => x.midiNum == noteNumber);
    createNote(keyM.y, keyM.name); 
}

//generateNotes();
//animate();