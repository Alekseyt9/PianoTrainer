const pressedKeyMap = new Map();

export function setPressedKey(noteNumber, elements) {
    if (elements && elements.length) {
        pressedKeyMap.set(Number(noteNumber), elements);
    } else {
        pressedKeyMap.delete(Number(noteNumber));
    }
}

export function getPressedKey(noteNumber) {
    return pressedKeyMap.get(Number(noteNumber));
}

export function deletePressedKey(noteNumber) {
    pressedKeyMap.delete(Number(noteNumber));
}

export function getPressedKeyMap() {
    return pressedKeyMap;
}
