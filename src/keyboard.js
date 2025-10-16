
let keyboardRange = { start: 2, end: 5 };

function createKeyboard() {
    svgK.innerHTML = '';  

    const oStart = keyboardRange.start;
    const oEnd = keyboardRange.end; // inclusive upper bound of the rendered octaves
    const octaveCount = oEnd - oStart + 1;

    if (octaveCount <= 0) {
        return;
    }

    const defs = document.createElementNS(xmlns, 'defs');
    const createGradient = (id, stops) => {
        const gradient = document.createElementNS(xmlns, 'linearGradient');
        gradient.setAttribute('id', id);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('x2', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('y2', '100%');
        stops.forEach(stopConfig => {
            const stop = document.createElementNS(xmlns, 'stop');
            stop.setAttribute('offset', stopConfig.offset);
            stop.setAttribute('stop-color', stopConfig.color);
            if (typeof stopConfig.opacity === 'number') {
                stop.setAttribute('stop-opacity', stopConfig.opacity.toString());
            }
            gradient.appendChild(stop);
        });
        return gradient;
    };

    defs.appendChild(createGradient('whiteKeyGradient', [
        { offset: '0%', color: '#fdfdfd' },
        { offset: '55%', color: '#f0f0f0' },
        { offset: '100%', color: '#d7d7d7' }
    ]));

    defs.appendChild(createGradient('blackKeyGradient', [
        { offset: '0%', color: '#2f3035' },
        { offset: '40%', color: '#18191c' },
        { offset: '100%', color: '#050506' }
    ]));

    svgK.appendChild(defs);

    const keyboardWidth = svgK.clientWidth;
    const whiteKeyWidth = keyboardWidth / (7 * octaveCount); 
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = whiteKeyWidth * 2.4; 
    const whiteKeyHeight = whiteKeyWidth * 4; 

    svgK.setAttribute('height', whiteKeyHeight);

    for (let octave = oStart; octave <= oEnd; octave++) {
        let whiteKeyX = (octave - oStart) * whiteKeyWidth * 7;
        let noteNumber = 24 + (octave * 12);
        
        for (let i = 0; i < 7; i++) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', whiteKeyX);
            rect.setAttribute('y', 0);
            rect.setAttribute('width', whiteKeyWidth);
            rect.setAttribute('height', whiteKeyHeight);
            rect.setAttribute('rx', Math.max(4, whiteKeyWidth * 0.08));
            rect.setAttribute('ry', Math.max(4, whiteKeyWidth * 0.08));
            rect.setAttribute('fill', 'url(#whiteKeyGradient)');
            rect.setAttribute('stroke', '#33373d');
            rect.setAttribute('class', 'key white-key');
            rect.setAttribute('data-note-number', noteNumber);
            svgK.appendChild(rect);

            rect.addEventListener('mousedown', function(event) {
                handleKeyDown(event.target);
            });
            rect.addEventListener('mouseup', function(event) {
                handleKeyUp(event.target);
            });
            rect.addEventListener('mouseleave', function(event) {
                handleKeyUp(event.target);
            });

            whiteKeyX += whiteKeyWidth;
            noteNumber += (i === 2 || i === 6) ? 1 : 2;  
        }

        let blackKeyX = ((octave-oStart) * whiteKeyWidth * 7) + whiteKeyWidth - (blackKeyWidth / 2);
        let blackNoteNumber = 25 + (octave * 12);  

        for (let i = 0; i < 7; i++) {
            if (i !== 2 && i !== 6) {
                const blackRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                blackRect.setAttribute('x', blackKeyX);
                blackRect.setAttribute('y', 0);
                blackRect.setAttribute('width', blackKeyWidth);
                blackRect.setAttribute('height', blackKeyHeight);
                blackRect.setAttribute('rx', Math.max(3, whiteKeyWidth * 0.06));
                blackRect.setAttribute('ry', Math.max(3, whiteKeyWidth * 0.06));
                blackRect.setAttribute('fill', 'url(#blackKeyGradient)');
                blackRect.setAttribute('stroke', '#202125');
                blackRect.setAttribute('class', 'key black-key');
                blackRect.setAttribute('data-note-number', blackNoteNumber);
                svgK.appendChild(blackRect);
                blackNoteNumber += 2;

                blackRect.addEventListener('mousedown', function(event) {
                    handleKeyDown(event.target);
                });
                blackRect.addEventListener('mouseup', function(event) {
                    handleKeyUp(event.target);
                });
                blackRect.addEventListener('mouseleave', function(event) {
                    handleKeyUp(event.target);
                });

            } else {
                blackNoteNumber++;  
            }

            blackKeyX += whiteKeyWidth;
        }
    }
}

function handleKeyDown(keyElement) {
    const noteNumber = Number(keyElement.getAttribute('data-note-number'));
    noteOn(noteNumber);
}

function handleKeyUp(keyElement) {
    const noteNumber = Number(keyElement.getAttribute('data-note-number'));
    noteOff(noteNumber);
}

function rebuildKeyboardPreservingState() {
    const highlightedNotes = Array.from(svgK.querySelectorAll('.key.highlight'))
        .map(key => Number(key.getAttribute('data-note-number')));
    const activeNotes = Array.from(svgK.querySelectorAll('.key.active'))
        .map(key => Number(key.getAttribute('data-note-number')));

    createKeyboard();

    highlightedNotes.forEach(noteNumber => {
        const key = svgK.querySelector(`[data-note-number="${noteNumber}"]`);
        if (key) {
            key.classList.add('highlight');
        }
    });

    activeNotes.forEach(noteNumber => {
        const key = svgK.querySelector(`[data-note-number="${noteNumber}"]`);
        if (key) {
            key.classList.add('active');
        }
    });

    if (typeof recenterNotesOnStaff === 'function') {
        recenterNotesOnStaff();
    }
}

function setKeyboardRange(start, end) {
    const MIN_OCTAVE = 1;
    const MAX_OCTAVE = 7;
    let newStart = Math.max(MIN_OCTAVE, Math.min(MAX_OCTAVE, Number(start) || MIN_OCTAVE));
    let newEnd = Math.max(MIN_OCTAVE, Math.min(MAX_OCTAVE, Number(end) || MAX_OCTAVE));

    if (newStart > newEnd) {
        newEnd = newStart;
    }

    if (keyboardRange.start === newStart && keyboardRange.end === newEnd) {
        return keyboardRange;
    }

    keyboardRange = { start: newStart, end: newEnd };
    rebuildKeyboardPreservingState();

    if (typeof generateSampleNote === 'function') {
        generateSampleNote();
    }

    return keyboardRange;
}

function getKeyboardRange() {
    return { ...keyboardRange };
}

createKeyboard();  

window.addEventListener('resize', () => {
    rebuildKeyboardPreservingState();
});

window.setKeyboardRange = setKeyboardRange;
window.getKeyboardRange = getKeyboardRange;
