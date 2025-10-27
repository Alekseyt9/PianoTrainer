import { getNotationSvg } from '../core/context.js';
import { startY, distY } from '../core/consts.js';
import { getThemeColor } from './theme.js';
import { getStaffRowHeight, getTotalNotationHeight } from '../core/layout.js';

let notationResizeObserver;

export function initNotation() {
    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return;
    }

    notationSvg.innerHTML = '';
    notationSvg.setAttribute('data-staff-rows', '1');
    refreshStaffWidth();
    observeNotationResize(notationSvg);
}

function drawStaffSystem(svg, offsetY, width, color) {
    for (let i = 0; i < 11; i++) {
        if (i === 5) {
            continue;
        }

        const line = svg.ownerDocument.createElementNS(svg.namespaceURI, 'line');
        line.setAttribute('x1', '0');
        line.setAttribute('y1', offsetY + i * distY);
        line.setAttribute('x2', width.toString());
        line.setAttribute('y2', offsetY + i * distY);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '1');
        line.classList.add('staff-line');
        svg.appendChild(line);
    }
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

    const width = getSvgWidth(notationSvg);
    if (!width) {
        return;
    }

    const rowAttr = notationSvg.getAttribute('data-staff-rows');
    const rowCount = Math.max(1, Number(rowAttr) || 1);
    const totalHeight = getTotalNotationHeight(rowCount);
    updateNotationViewBox(notationSvg, width, totalHeight);
    notationSvg.setAttribute('height', totalHeight);

    const staffColor = getThemeColor('--notation-staff-line-color', '#000000');

    Array.from(notationSvg.querySelectorAll('line.staff-line')).forEach(line => line.remove());
    for (let row = 0; row < rowCount; row++) {
        const offset = startY + row * getStaffRowHeight();
        drawStaffSystem(notationSvg, offset, width, staffColor);
    }
}

function updateNotationViewBox(svg, width, height) {
    const roundedWidth = Math.round(width);
    const roundedHeight = Math.round(height);
    if (!width || !height) {
        return;
    }

    const currentViewBox = svg.viewBox ? svg.viewBox.baseVal : null;
    if (
        currentViewBox &&
        currentViewBox.width === roundedWidth &&
        currentViewBox.height === roundedHeight
    ) {
        return;
    }

    svg.setAttribute('viewBox', `0 0 ${roundedWidth} ${roundedHeight}`);
}

function getSvgWidth(svg) {
    const rect = svg.getBoundingClientRect();
    if (rect && rect.width) {
        return rect.width;
    }
    if (svg.clientWidth) {
        return svg.clientWidth;
    }
    const parent = svg.parentElement;
    if (parent) {
        const parentRect = parent.getBoundingClientRect();
        if (parentRect && parentRect.width) {
            return parentRect.width;
        }
    }
    return 0;
}

export function setStaffRowCount(rowCount) {
    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return;
    }
    const normalized = Math.max(1, Number(rowCount) || 1);
    const current = Number(notationSvg.getAttribute('data-staff-rows')) || 1;
    if (current === normalized) {
        return;
    }
    notationSvg.setAttribute('data-staff-rows', String(normalized));
    refreshStaffWidth();
}
