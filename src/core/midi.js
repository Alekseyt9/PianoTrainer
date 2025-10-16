import { noteOn, noteOff } from './playback.js';

export function initMIDI({ onStatusChange } = {}) {
    if (!navigator.requestMIDIAccess) {
        onStatusChange?.('error', 'Не поддерживается');
        console.warn('Web MIDI is not supported in this browser.');
        return;
    }

    onStatusChange?.('pending', 'Подключение...');
    navigator.requestMIDIAccess()
        .then(access => onMIDISuccess(access, onStatusChange))
        .catch(() => onMIDIFailure(onStatusChange));
}

function onMIDISuccess(midiAccess, onStatusChange) {
    onStatusChange?.('connected', 'Подключено');
    const inputs = midiAccess.inputs.values();
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = onMIDIMessage;
    }
}

function onMIDIFailure(onStatusChange) {
    onStatusChange?.('error', 'Ошибка доступа');
    console.warn('Could not access your MIDI devices. Ensure the page is served over HTTPS and your browser supports Web MIDI.');
}

function onMIDIMessage(message) {
    const [command, noteNumber, velocity = 0] = message.data;

    switch (command) {
        case 144: // Note on
            if (velocity > 0) {
                noteOn(noteNumber);
            } else {
                noteOff(noteNumber);
            }
            break;
        case 128: // Note off
            noteOff(noteNumber);
            break;
        default:
            break;
    }
}
