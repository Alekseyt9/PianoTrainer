
function drawStaff(startY, color) {
    const w = svgN.clientWidth;

    for (let i = 0; i < 5; i++) {
        const line = document.createElementNS(xmlns, 'line');
        line.setAttribute('x1', '70');
        line.setAttribute('y1', startY + i * shiftY);
        line.setAttribute('x2', (w - 70).toString());
        line.setAttribute('y2', startY + i * shiftY);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '1');
        svgN.appendChild(line);
    }
}

drawStaff(startY, 'black');
drawStaff(startY + shiftY*5 + distY, 'black');