// Based on https://github.com/chrisdavies/xferno by Chris Davies
/* eslint-disable @typescript-eslint/ban-types */
export function equal(a, b) {
    if (a === b) {
        return true;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((x, i) => x === b[i]);
    }
    if (typeof a === 'object' && typeof b === 'object') {
        const aEntries = Object.entries(a);
        const bEntries = Object.entries(b);
        return (aEntries.length === bEntries.length
            && aEntries.every(([ka, va], i) => {
                const [kb, vb] = bEntries[i];
                return ka === kb && va === vb;
            }));
    }
    return false;
}
