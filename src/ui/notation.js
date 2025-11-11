import { getNotationSvg } from '../core/context.js';
import { startY, distY } from '../core/consts.js';
import { getThemeColor } from './theme.js';
import {
    getStaffRowHeight,
    getTotalNotationHeight,
    getStaffSystemHeight,
    STAFF_LEFT_MARGIN,
    STAFF_RIGHT_MARGIN
} from '../core/layout.js';

let notationResizeObserver;
let manualScrollCleanup = null;
const ROW_LABEL_CLASS = 'staff-row-label';
const ROW_LABEL_OFFSET = 8;

export function initNotation() {
    const notationSvg = getNotationSvg();
    if (!notationSvg) {
        return;
    }

    notationSvg.innerHTML = '';
    notationSvg.setAttribute('data-staff-rows', '1');
    refreshStaffWidth();
    observeNotationResize(notationSvg);
    preventNotationManualScroll();
}

function drawStaffSystem(svg, offsetY, width, color) {
    for (let i = 0; i < 11; i++) {
        if (i === 5) {
            continue;
        }

        const line = svg.ownerDocument.createElementNS(svg.namespaceURI, 'line');
        const rightLimit = Math.max(STAFF_RIGHT_MARGIN, width - STAFF_RIGHT_MARGIN);
        line.setAttribute('x1', STAFF_LEFT_MARGIN.toString());
        line.setAttribute('y1', offsetY + i * distY);
        line.setAttribute('x2', rightLimit.toString());
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
    const labelColor = getThemeColor('--notation-row-label-color', '#94a3b8');

    Array.from(notationSvg.querySelectorAll('line.staff-line')).forEach(line => line.remove());
    Array.from(notationSvg.querySelectorAll(`text.${ROW_LABEL_CLASS}`)).forEach(element => element.remove());
    for (let row = 0; row < rowCount; row++) {
        const offset = startY + row * getStaffRowHeight();
        drawStaffSystem(notationSvg, offset, width, staffColor);
    }
    renderRowLabels(notationSvg, rowCount, labelColor);
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

function renderRowLabels(svg, rowCount, textColor) {
    if (!svg) {
        return;
    }
    const normalizedRows = Math.max(1, Number(rowCount) || 1);
    const systemHeight = getStaffSystemHeight();
    const rowHeight = getStaffRowHeight();
    const labelX = Math.max(2, STAFF_LEFT_MARGIN - ROW_LABEL_OFFSET);

    for (let row = 0; row < normalizedRows; row++) {
        const centerY = startY + row * rowHeight + systemHeight / 2;
        const text = svg.ownerDocument.createElementNS(svg.namespaceURI, 'text');
        text.setAttribute('x', labelX.toString());
        text.setAttribute('y', centerY.toString());
        text.setAttribute('fill', textColor);
        text.setAttribute('class', ROW_LABEL_CLASS);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('dominant-baseline', 'middle');
        text.textContent = String(row + 1);
        text.setAttribute('pointer-events', 'none');
        svg.appendChild(text);
    }
}

function preventNotationManualScroll() {
    if (manualScrollCleanup) {
        manualScrollCleanup();
        manualScrollCleanup = null;
    }
    if (typeof document === 'undefined') {
        return;
    }
    const scrollArea = document.getElementById('notation-scroll-area');
    const container = document.getElementById('notation-container');
    const targets = [scrollArea, container].filter(Boolean);
    if (!targets.length) {
        return;
    }

    const blockScroll = event => {
        event.preventDefault();
    };

    const capture = true;
    targets.forEach(target => {
        target.addEventListener('wheel', blockScroll, { passive: false, capture: true });
        target.addEventListener('touchmove', blockScroll, { passive: false, capture: true });
    });

    manualScrollCleanup = () => {
        targets.forEach(target => {
            target.removeEventListener('wheel', blockScroll, capture);
            target.removeEventListener('touchmove', blockScroll, capture);
        });
    };
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
