"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
exports.default = (theme, colorScheme) => {
    const dottedColorScheme = colorScheme.replace(/-/g, '.');
    const themePart = theme !== 'generic' ? `${theme}.` : '';
    const basePath = (0, path_1.resolve)((0, path_1.join)(__dirname, '..', 'data', 'scss'));
    const bundlePath = (0, path_1.join)(basePath, 'bundles', `dx.${themePart}${dottedColorScheme}.scss`);
    const indexPath = (0, path_1.join)(basePath, 'widgets', theme);
    return {
        file: bundlePath,
        options: {
            loadPaths: [indexPath],
        },
    };
};
