  
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

    let und = drawUnderlines(y, color);

    return [note, ...und];
}

function drawUnderlines(y, color)
{
    let lines = [];

    if (y < startY){
        let ycur = startY - distY;
        const c = Math.ceil((startY - y) / distY - 0.5);
        for (let i=0; i<c; i++)
        {
            lines.push(drawUnderline(ycur, color));
            ycur -= distY;
        }
    }

    if (y == startY + distY * 5)
    {
        lines.push(drawUnderline(y, color));
    }

    const topy = distY * 11 + distY;
    if (y > topy)
    {     
        let ycur = topy + distY;
        const c = Math.ceil((y - topy) / distY - 0.5);
        for (let i=0; i<c; i++)
        {
            lines.push(drawUnderline(ycur, color));
            ycur += distY;
        }
    }

    return lines;
}

function drawUnderline(y, color)
{
    const svgWidth = svgN.clientWidth || svgN.getBoundingClientRect().width;
    const centerX = svgWidth / 2;

    const line = document.createElementNS(xmlns, 'line');
    line.setAttribute('x1', centerX - 30);
    line.setAttribute('y1', y);
    line.setAttribute('x2', centerX + 30);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '1');
    svgN.appendChild(line);

    return line;
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

function getRandomElementFromArray(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

var currentNotes;

function cleanSampleNote()
{
    if (currentNotes)
    {
        currentNotes.forEach(x => x.remove());  
        currentNotes = null;
    }
}

function generateSampleNote()
{
    cleanSampleNote();
    var hMeta = getHighlightedKeysMetadata();
    var nMeta = getRandomElementFromArray(hMeta);
    if (nMeta){
        currentNotes = createNote(nMeta.y, nMeta.name, nMeta.midiNum);
    }
}
