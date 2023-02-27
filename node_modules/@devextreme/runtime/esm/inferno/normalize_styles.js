const NUMBER_STYLES = new Set([
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
const isNumeric = (value) => {
    if (typeof value === 'number')
        return true;
    return !Number.isNaN(Number(value));
};
const getNumberStyleValue = (style, value) => (NUMBER_STYLES.has(style) ? value : `${value}px`);
const uppercasePattern = /[A-Z]/g;
const kebabCase = (str) => str.replace(uppercasePattern, '-$&').toLowerCase();
export function normalizeStyles(styles) {
    if (!(styles instanceof Object)) {
        return undefined;
    }
    return Object
        .entries(styles)
        .reduce((acc, [key, value]) => {
        acc[kebabCase(key)] = isNumeric(value)
            ? getNumberStyleValue(key, value)
            : value;
        return acc;
    }, {});
}
