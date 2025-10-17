import { getNotationSvg } from '../core/context.js';
import { shiftY, startY } from '../core/consts.js';

let notationResizeObserver;

export function initNotation() {
    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return;
    }

    notationSvg.innerHTML = '';
    updateNotationViewBox(notationSvg);
    drawStaff(notationSvg, startY, 'black');
    refreshStaffWidth();
    observeNotationResize(notationSvg);
}

function drawStaff(svg, offsetY, color) {
    const width = getStaffWidth(svg);
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

function getStaffWidth(svg) {
    const viewBox = svg.viewBox && svg.viewBox.baseVal;
    if (viewBox && viewBox.width) {
        return viewBox.width;
    }

    const { width } = svg.getBoundingClientRect();
    if (width) {
        return width;
    }

    return svg.clientWidth || 0;
}

function observeNotationResize(svg) {
    if (typeof ResizeObserver === 'undefined') {
        return;
    }

    if (notationResizeObserver) {
        notationResizeObserver.disconnect();
    }

    notationResizeObserver = new ResizeObserver(() => {
        refreshStaffWidth();
    });

    notationResizeObserver.observe(svg);
}

export function refreshStaffWidth() {
    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return;
    }

    updateNotationViewBox(notationSvg);
    const width = getStaffWidth(notationSvg);
    if (!width) {
        return;
    }

    Array.from(notationSvg.querySelectorAll('line.staff-line')).forEach(line => {
        line.setAttribute('x1', '0');
        line.setAttribute('x2', width.toString());
    });
}

function updateNotationViewBox(svg) {
    const rect = svg.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    if (!width || !height) {
        return;
    }

    const currentViewBox = svg.viewBox ? svg.viewBox.baseVal : null;
    if (
        currentViewBox &&
        currentViewBox.width === width &&
        currentViewBox.height === height
    ) {
        return;
    }

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
}
