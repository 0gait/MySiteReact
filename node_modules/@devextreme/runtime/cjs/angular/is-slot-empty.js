"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
function isSlotEmpty(slot) {
    if (slot === null || slot === void 0 ? void 0 : slot.nativeElement) {
        var nativeEl = slot.nativeElement;
        var children = nativeEl.parentElement ? __spread(nativeEl.parentElement.childNodes) : [];
        var startIndex_1 = children.indexOf(nativeEl);
        var endIndex = children
            .findIndex(function (node, index) { var _a, _b; return index > startIndex_1 && ((_b = (_a = node) === null || _a === void 0 ? void 0 : _a.classList) === null || _b === void 0 ? void 0 : _b.contains('dx-slot-end')); });
        return !children
            .slice(startIndex_1 + 1, endIndex - 1)
            // nodeType == 8 is comment DOM node.
            // If slot content contains only commented node it's empty.
            .some(function (node) { return node.nodeType !== 8; });
    }
    return false;
}
exports.isSlotEmpty = isSlotEmpty;
