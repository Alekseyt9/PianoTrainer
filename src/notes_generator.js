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
    const noteTitle = document.createElementNS(xmlns, 'title');
    noteTitle.textContent = name;
    note.appendChild(noteTitle);
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

    if (y === startY + distY * 5)
    {
        lines.push(drawUnderline(y, color));
    }

    const topY = startY + distY * 10;
    if (y > topY)
    {     
        let ycur = topY + distY;
        const c = Math.ceil((y - topY) / distY - 0.5);
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

function getRandomElementFromArray(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function recenterNotesOnStaff() {
    const svgWidth = svgN.clientWidth || svgN.getBoundingClientRect().width;
    const centerX = svgWidth / 2;
    const underlineHalfWidth = 30;

    const adjustElement = (element) => {
        const tagName = element.tagName.toLowerCase();
        if (tagName === 'ellipse') {
            element.setAttribute('cx', centerX);
        } else if (tagName === 'line') {
            element.setAttribute('x1', centerX - underlineHalfWidth);
            element.setAttribute('x2', centerX + underlineHalfWidth);
        }
    };

    if (currentNotes) {
        currentNotes.forEach(adjustElement);
    }

    if (pressedKeyMap && typeof pressedKeyMap === 'object') {
        Object.values(pressedKeyMap).forEach(noteGroup => {
            if (Array.isArray(noteGroup)) {
                noteGroup.forEach(adjustElement);
            }
        });
    }

    repositionHintElements();
}

function createSamplePointer(noteElement, label) {
    if (!noteElement) {
        return null;
    }

    const targetId = noteElement.getAttribute('id');
    const pointer = document.createElementNS(xmlns, 'polygon');
    pointer.classList.add('note-pointer');
    pointer.setAttribute('data-target-id', targetId);
    pointer.style.fill = 'var(--hint-pointer-fill)';
    pointer.style.stroke = 'var(--hint-pointer-stroke)';
    pointer.style.strokeWidth = '1.5px';
    svgN.appendChild(pointer);

    const tooltipGroup = document.createElementNS(xmlns, 'g');
    tooltipGroup.classList.add('note-tooltip');
    tooltipGroup.setAttribute('data-target-id', targetId);

    const tooltipRect = document.createElementNS(xmlns, 'rect');
    const tooltipText = document.createElementNS(xmlns, 'text');
    tooltipText.textContent = label;

    tooltipGroup.appendChild(tooltipRect);
    tooltipGroup.appendChild(tooltipText);
    svgN.appendChild(tooltipGroup);

    positionSamplePointer(pointer, tooltipGroup, noteElement);

    return { pointer, tooltip: tooltipGroup };
}

function positionSamplePointer(pointer, tooltipGroup, noteElement) {
    if (!pointer || !tooltipGroup || !noteElement) {
        return;
    }

    const cx = parseFloat(noteElement.getAttribute('cx'));
    const cy = parseFloat(noteElement.getAttribute('cy'));
    const pointerHeight = 22;
    const pointerWidth = 24;
    const baseY = cy - 20;
    const tipY = baseY - pointerHeight;

    pointer.setAttribute('points', `${cx},${tipY} ${cx - pointerWidth / 2},${baseY} ${cx + pointerWidth / 2},${baseY}`);

    const tooltipText = tooltipGroup.querySelector('text');
    const tooltipRect = tooltipGroup.querySelector('rect');

    const textY = tipY - 18;
    if (tooltipText) {
        tooltipText.setAttribute('x', cx);
        tooltipText.setAttribute('y', textY);
        tooltipText.setAttribute('text-anchor', 'middle');
        tooltipText.setAttribute('dominant-baseline', 'middle');
        tooltipText.setAttribute('font-size', '14');
        tooltipText.setAttribute('font-weight', '600');
        tooltipText.style.fill = 'var(--hint-tooltip-text)';
    }

    if (tooltipRect && tooltipText) {
        const bbox = tooltipText.getBBox();
        const paddingX = 12;
        const paddingY = 6;
        tooltipRect.setAttribute('x', bbox.x - paddingX);
        tooltipRect.setAttribute('y', bbox.y - paddingY);
        tooltipRect.setAttribute('width', bbox.width + paddingX * 2);
        tooltipRect.setAttribute('height', bbox.height + paddingY * 2);
        tooltipRect.setAttribute('rx', 10);
        tooltipRect.setAttribute('ry', 10);
        tooltipRect.style.fill = 'var(--hint-tooltip-bg)';
        tooltipRect.style.stroke = 'var(--hint-pointer-stroke)';
        tooltipRect.style.strokeWidth = '1.5px';
    }
}

var currentNotes;
var currentHint = null;
var currentNoteMeta = null;
var staffHintsEnabled = true;

function removeHintElements() {
    if (currentHint) {
        if (currentHint.pointer) {
            currentHint.pointer.remove();
        }
        if (currentHint.tooltip) {
            currentHint.tooltip.remove();
        }
    }
    currentHint = null;
}

function applyHintToCurrentNote() {
    removeHintElements();
    if (!staffHintsEnabled || !currentNotes || !currentNotes.length || !currentNoteMeta) {
        return;
    }

    const hint = createSamplePointer(currentNotes[0], currentNoteMeta.name);
    if (hint) {
        currentHint = hint;
    }
}

function repositionHintElements() {
    if (!currentHint || !currentNotes || !currentNotes.length) {
        return;
    }

    positionSamplePointer(currentHint.pointer, currentHint.tooltip, currentNotes[0]);
}

function cleanSampleNote()
{
    removeHintElements();
    if (currentNotes)
    {
        currentNotes.forEach(x => x.remove());  
        currentNotes = null;
    }
    currentNoteMeta = null;
}

function generateSampleNote()
{
    cleanSampleNote();
    const hMeta = getHighlightedKeysMetadata();
    if (!hMeta.length) {
        return;
    }

    const nMeta = getRandomElementFromArray(hMeta);
    if (nMeta && typeof nMeta.y === 'number'){
        currentNotes = createNote(nMeta.y, nMeta.name, nMeta.midiNum);
        currentNoteMeta = nMeta;
        applyHintToCurrentNote();
    }
}

function setStaffHintsEnabled(enabled) {
    staffHintsEnabled = Boolean(enabled);
    if (staffHintsEnabled) {
        applyHintToCurrentNote();
    } else {
        removeHintElements();
    }
}

function getStaffHintsEnabled() {
    return staffHintsEnabled;
}

window.setStaffHintsEnabled = setStaffHintsEnabled;
window.getStaffHintsEnabled = getStaffHintsEnabled;
