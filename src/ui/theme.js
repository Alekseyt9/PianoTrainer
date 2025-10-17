export function getThemeColor(variableName, fallback = '') {
    if (typeof window === 'undefined' || !document || !document.body) {
        return fallback;
    }

    const styles = window.getComputedStyle(document.body);
    if (!styles) {
        return fallback;
    }

    const value = styles.getPropertyValue(variableName);
    if (!value) {
        return fallback;
    }

    const trimmed = value.trim();
    return trimmed || fallback;
}
