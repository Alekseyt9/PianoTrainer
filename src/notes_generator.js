    
let notes = [];

function createNote(y) {
    const note = document.createElementNS(xmlns, 'ellipse');
    note.setAttribute('cx', '500');  
    note.setAttribute('cy', y);
    note.setAttribute('rx', '10'); 
    note.setAttribute('ry', '7');
    note.setAttribute('fill', 'none');
    note.setAttribute('stroke', 'black');
    note.setAttribute('stroke-width', '2');
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
    var hMeta = getHighlightedKeysMetadata();

    staffLines.forEach(y => {
        const note = createNote(y);
        notes.push(note);
    });
}

generateNotes();
animate();