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
Object.defineProperty(exports, "__esModule", { value: true });
var NUMBER_STYLES = new Set([
    'animationIterationCount',
    'borderImageOutset',
    'borderImageSlice',
    'border-imageWidth',
    'boxFlex',
    'boxFlexGroup',
    'boxOrdinalGroup',
    'columnCount',
    'fillOpacity',
    'flex',
    'flexGrow',
    'flexNegative',
    'flexOrder',
    'flexPositive',
    'flexShrink',
    'floodOpacity',
    'fontWeight',
    'gridColumn',
    'gridRow',
    'lineClamp',
    'lineHeight',
    'opacity',
    'order',
    'orphans',
    'stopOpacity',
    'strokeDasharray',
    'strokeDashoffset',
    'strokeMiterlimit',
    'strokeOpacity',
    'strokeWidth',
    'tabSize',
    'widows',
    'zIndex',
    'zoom',
]);
var isNumeric = function (value) {
    if (typeof value === 'number')
        return true;
    return !Number.isNaN(Number(value));
};
var getNumberStyleValue = function (style, value) { return (NUMBER_STYLES.has(style) ? value : value + "px"); };
function normalizeStyles(styles) {
    if (!(styles instanceof Object)) {
        return undefined;
    }
    return Object
        .entries(styles)
        .reduce(function (acc, _a) {
        var _b = __read(_a, 2), key = _b[0], value = _b[1];
        acc[key] = isNumeric(value)
            ? getNumberStyleValue(key, value)
            : value;
        return acc;
    }, {});
}
exports.normalizeStyles = normalizeStyles;
