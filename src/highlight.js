
let mouseDown = false;

document.addEventListener('mousedown', (event) => {
    if (event.buttons == 2) {  
        mouseDown = true;
        toggleKeyHighlight(event);
    }
});

document.addEventListener('mouseup', () => {
    mouseDown = false;
});

svgK.addEventListener('mouseover', (event) => {
    if (mouseDown && event.target.classList.contains('key')) {
        toggleKeyHighlight(event);
    }
});

function toggleKeyHighlight(event) {
    const key = event.target;
    if (key.classList.contains('highlight')) {
        key.classList.remove('highlight');
    } else {
        key.classList.add('highlight');
    }
}

svgK.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});