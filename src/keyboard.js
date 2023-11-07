
function createKeyboard() {
    svgK.innerHTML = '';  

    const oStart = 1;
    const oCount = 4;

    const keyboardWidth = svgK.clientWidth;
    const whiteKeyWidth = keyboardWidth / (7 * oCount); 
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = whiteKeyWidth * 2.4; 
    const whiteKeyHeight = whiteKeyWidth * 4; 

    svgK.setAttribute('height', whiteKeyHeight);

    for (let octave = oStart; octave <= oCount; octave++) {
        let whiteKeyX = (octave - oStart) * whiteKeyWidth * 7;
        noteNumber = 24 + (octave * 12);
        
        for (let i = 0; i < 7; i++) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', whiteKeyX);
            rect.setAttribute('y', 0);
            rect.setAttribute('width', whiteKeyWidth);
            rect.setAttribute('height', whiteKeyHeight);
            rect.setAttribute('fill', 'white');
            rect.setAttribute('stroke', 'black');
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
            noteNumber += (i == 2 || i == 6) ? 1 : 2;  
        }

        blackKeyX = ((octave-oStart) * whiteKeyWidth * 7) + whiteKeyWidth - (blackKeyWidth / 2);
        noteNumber = 25 + (octave * 12);  

        for (let i = 0; i < 7; i++) {
            if (i !== 2 && i !== 6) {
                const blackRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                blackRect.setAttribute('x', blackKeyX);
                blackRect.setAttribute('y', 0);
                blackRect.setAttribute('width', blackKeyWidth);
                blackRect.setAttribute('height', blackKeyHeight);
                blackRect.setAttribute('fill', 'black');
                blackRect.setAttribute('stroke', 'black');
                blackRect.setAttribute('class', 'key black-key');
                blackRect.setAttribute('data-note-number', noteNumber);
                svgK.appendChild(blackRect);
                noteNumber += 2;

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
                noteNumber++;  
            }

            blackKeyX += whiteKeyWidth;
        }
    }
}

function handleKeyDown(keyElement) {
    var noteNumber = keyElement.getAttribute('data-note-number');
    noteOn(noteNumber);
}

function handleKeyUp(keyElement) {
    var noteNumber = keyElement.getAttribute('data-note-number');
    noteOff(noteNumber);
}

createKeyboard();  