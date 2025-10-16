let svgNotation = null;
let svgKeyboard = null;

export function initContext({ notationElement, keyboardElement }) {
    svgNotation = notationElement;
    svgKeyboard = keyboardElement;
}

export function getNotationSvg() {
    return svgNotation;
}

export function getKeyboardSvg() {
    return svgKeyboard;
}
