
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
    console.log("Web MIDI is not supported in this browser.");
}

function onMIDISuccess(midiAccess) {
    const inputs = midiAccess.inputs.values();
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = onMIDIMessage;
    }
}

function onMIDIFailure() {
    console.log("Could not access your MIDI devices.");
}

function onMIDIMessage(message) {
    const command = message.data[0];
    const noteNumber = message.data[1];
    const velocity = (message.data.length > 2) ? message.data[2] : 0;

    switch (command) {
        case 144: 
            if (velocity > 0) {
                noteOn(noteNumber);
            } else {
                noteOff(noteNumber);
            }
            break;
            
        case 128: 
            noteOff(noteNumber);
            break;
    }
}

function noteOn(noteNumber) {
    const key = document.querySelector(`[data-note-number="${noteNumber}"]`);
    if (key) {
        key.classList.add('active');
    }

    var keyM = meta.find(x => x.midiNum == noteNumber);
    if (keyM){
        var notes = createNote(keyM.y, keyM.name, noteNumber, 'gray');
        pressedKeyMap[noteNumber] = notes;        
    }

    if (currentNotes && keyM.midiNum == currentNotes[0].getAttribute("midiNum"))
    {
        cleanSampleNote();
    }
}

function noteOff(noteNumber) {
    const key = document.querySelector(`[data-note-number="${noteNumber}"]`);
    if (key) {
        key.classList.remove('active');
    }

    var keyM = meta.find(x => x.midiNum == noteNumber);
    if (keyM){
        var notesOld = pressedKeyMap[noteNumber];
        if (!notesOld)
        {
            return;
        }

        notesOld.forEach(x => x.remove());  
        delete pressedKeyMap[noteNumber];
    }

    if (currentNotes == null)
    {
        generateSampleNote();
    }
}
