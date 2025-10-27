import { distY, startY } from './consts.js';

export const STAFF_ROW_COUNT = 10;
export const STEPS_PER_ROW = 4;

const STAFF_GAP_MULTIPLIER = 6;
const SYSTEM_LINE_COUNT = 10;

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

export function getTotalNotationHeight(rowCount = STAFF_ROW_COUNT) {
    const systemHeight = getStaffSystemHeight();
    const contentHeight = startY + (Math.max(0, rowCount - 1) * getStaffRowHeight()) + systemHeight;
    return contentHeight + startY;
}
