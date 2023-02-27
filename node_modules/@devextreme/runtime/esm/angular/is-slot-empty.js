export function isSlotEmpty(slot) {
    if (slot === null || slot === void 0 ? void 0 : slot.nativeElement) {
        const nativeEl = slot.nativeElement;
        const children = nativeEl.parentElement ? [...nativeEl.parentElement.childNodes] : [];
        const startIndex = children.indexOf(nativeEl);
        const endIndex = children
            .findIndex((node, index) => { var _a, _b; return index > startIndex && ((_b = (_a = node) === null || _a === void 0 ? void 0 : _a.classList) === null || _b === void 0 ? void 0 : _b.contains('dx-slot-end')); });
        return !children
            .slice(startIndex + 1, endIndex - 1)
            // nodeType == 8 is comment DOM node.
            // If slot content contains only commented node it's empty.
            .some((node) => node.nodeType !== 8);
    }
    return false;
}
