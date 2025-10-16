import { getNotationSvg } from '../core/context.js';
import { shiftY, startY } from '../core/consts.js';

export function initNotation() {
    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return;
    }

    notationSvg.innerHTML = '';
    drawStaff(notationSvg, startY, 'black');
}

function drawStaff(svg, offsetY, color) {
    const width = svg.clientWidth || svg.getBoundingClientRect().width;
    for (let i = 0; i < 11; i++) {
        if (i === 5) {
            continue;
        }

        const line = svg.ownerDocument.createElementNS(svg.namespaceURI, 'line');
        line.setAttribute('x1', '70');
        line.setAttribute('y1', offsetY + i * shiftY);
        line.setAttribute('x2', (width - 70).toString());
        line.setAttribute('y2', offsetY + i * shiftY);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
    }
}
