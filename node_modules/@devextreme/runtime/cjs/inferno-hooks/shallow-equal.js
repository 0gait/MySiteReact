"use strict";
// Based on https://github.com/chrisdavies/xferno by Chris Davies
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
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/ban-types */
function equal(a, b) {
    if (a === b) {
        return true;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every(function (x, i) { return x === b[i]; });
    }
    if (typeof a === 'object' && typeof b === 'object') {
        var aEntries = Object.entries(a);
        var bEntries_1 = Object.entries(b);
        return (aEntries.length === bEntries_1.length
            && aEntries.every(function (_a, i) {
                var _b = __read(_a, 2), ka = _b[0], va = _b[1];
                var _c = __read(bEntries_1[i], 2), kb = _c[0], vb = _c[1];
                return ka === kb && va === vb;
            }));
    }
    return false;
}
exports.equal = equal;
