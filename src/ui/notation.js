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
        line.setAttribute('x1', '0');
        line.setAttribute('y1', offsetY + i * shiftY);
        line.setAttribute('x2', width.toString());
        line.setAttribute('y2', offsetY + i * shiftY);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '1');
        line.classList.add('staff-line');
        svg.appendChild(line);
    }
}

export function refreshStaffWidth() {
    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return;
    }

    const width = notationSvg.clientWidth || notationSvg.getBoundingClientRect().width;
    Array.from(notationSvg.querySelectorAll('line.staff-line')).forEach(line => {
        line.setAttribute('x1', '0');
        line.setAttribute('x2', width.toString());
    });
}
