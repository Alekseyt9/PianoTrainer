import { distY, startY } from './consts.js';

const STAFF_GAP_MULTIPLIER = 6;
const SYSTEM_LINE_COUNT = 10;
export const STAFF_LEFT_MARGIN = 48;
export const STAFF_RIGHT_MARGIN = 48;

export function getStaffSystemHeight() {
    return distY * SYSTEM_LINE_COUNT;
}

export function getStaffGap() {
    return distY * STAFF_GAP_MULTIPLIER;
}

export function getStaffRowHeight() {
    return getStaffSystemHeight() + getStaffGap();
}

export function getRowOffset(rowIndex) {
    return rowIndex * getStaffRowHeight();
}

export function getTotalNotationHeight(rowCount = 1) {
    const rows = Math.max(1, Number(rowCount) || 1);
    const systemHeight = getStaffSystemHeight();
    const contentHeight = startY + (rows - 1) * getStaffRowHeight() + systemHeight;
    return contentHeight + startY;
}
