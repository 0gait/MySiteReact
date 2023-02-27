"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSassForSwatch = void 0;
const SWATCH_SELECTOR_PREFIX = '.dx-swatch-';
function createSassForSwatch(outColorScheme, sass) {
    const unchangedParts = [];
    const importRegex = /@import .*?;\n/g;
    const fontFaceRegex = /@font-face\s*{.*?}\n/gs;
    const replaceHandler = (substring) => {
        unchangedParts.push(substring);
        return '';
    };
    let source = sass.toString();
    source = source
        .replace(importRegex, replaceHandler)
        .replace(fontFaceRegex, replaceHandler);
    const selector = SWATCH_SELECTOR_PREFIX + outColorScheme;
    const cleanSass = source.replace('@charset "UTF-8";', '');
    return {
        sass: `${unchangedParts.join('')}${selector} { ${cleanSass} };`,
        selector,
    };
}
exports.createSassForSwatch = createSassForSwatch;
