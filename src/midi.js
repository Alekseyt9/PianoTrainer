
if (navigator.requestMIDIAccess) {
    if (typeof updateMidiStatus === 'function') {
        updateMidiStatus('pending', 'Подключение...');
    }
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
    console.log("Web MIDI is not supported in this browser.");
    if (typeof updateMidiStatus === 'function') {
        updateMidiStatus('error', 'Не поддерживается');
    }
}

function onMIDISuccess(midiAccess) {
    if (typeof updateMidiStatus === 'function') {
        updateMidiStatus('connected', 'Подключено');
    }
    const inputs = midiAccess.inputs.values();
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = onMIDIMessage;
    }
}

function onMIDIFailure() {
    console.warn("Could not access your MIDI devices. Ensure the page is served over HTTPS and your browser supports Web MIDI.");
    if (typeof updateMidiStatus === 'function') {
        updateMidiStatus('error', 'Ошибка доступа');
    }
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

    const keyMeta = meta.find(note => note.midiNum === noteNumber);
    if (keyMeta){
        const notes = createNote(keyMeta.y, keyMeta.name, noteNumber, 'gray');
        pressedKeyMap[noteNumber] = notes;        
    }

    if (currentNotes && keyMeta && noteNumber === Number(currentNotes[0].getAttribute("midiNum")))
    {
        cleanSampleNote();
        if (typeof incrementTrainerScore === 'function') {
            incrementTrainerScore();
        }
    }
}

function noteOff(noteNumber) {
    const key = document.querySelector(`[data-note-number="${noteNumber}"]`);
    if (key) {
        key.classList.remove('active');
    }

    const keyMeta = meta.find(note => note.midiNum === noteNumber);
    if (keyMeta){
        const notesOld = pressedKeyMap[noteNumber];
        if (!notesOld)
        {
            return;
        }

        notesOld.forEach(x => x.remove());  
        delete pressedKeyMap[noteNumber];
    }

    if (currentNotes === null || currentNotes === undefined)
    {
        generateSampleNote();
    }
}
