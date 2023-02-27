"use strict";
/* eslint no-param-reassign: ["error", { "props": false }] */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commands_1 = __importDefault(require("./commands"));
const themes_1 = __importDefault(require("./themes"));
const logger_1 = require("./logger");
const DEFAULT_OUT_COLOR_SCHEME = 'custom-scheme';
const extname = (filename) => filename.substring(filename.lastIndexOf('.'));
const getBootstrapConfig = (fileName, configVersion) => {
    const extension = extname(fileName);
    let bootstrap = false;
    let version = 0;
    if (extension === '.scss') {
        bootstrap = true;
        version = 4;
    }
    else if (extension === '.less') {
        bootstrap = true;
        version = 3;
    }
    if (version === 4 && (configVersion === 4 || configVersion === 5)) {
        version = configVersion;
    }
    return { isBootstrap: bootstrap, bootstrapVersion: version };
};
const getOutParameters = (command, themeName, config) => {
    var _a, _b, _c;
    let outputFile = (_a = config.outputFile) !== null && _a !== void 0 ? _a : '';
    let outColorScheme = (_b = config.outputColorScheme) !== null && _b !== void 0 ? _b : '';
    let fileFormat = ((_c = config.outputFormat) !== null && _c !== void 0 ? _c : '') || extname(outputFile).substr(1);
    const makeSwatch = !!config.makeSwatch;
    const base = !!config.base;
    const isColorSchemeValid = outColorScheme && /^[\w\-.]+$/.test(outColorScheme);
    if (!isColorSchemeValid) {
        (0, logger_1.log)(`'--output-color-scheme' is not valid. '${DEFAULT_OUT_COLOR_SCHEME}' will be used.`);
    }
    if (!outColorScheme || !isColorSchemeValid) {
        outColorScheme = DEFAULT_OUT_COLOR_SCHEME;
    }
    if (!fileFormat) {
        switch (command) {
            case commands_1.default.BUILD_THEME:
                fileFormat = 'css';
                break;
            case commands_1.default.BUILD_VARS:
                fileFormat = 'less';
                break;
            case commands_1.default.BUILD_META:
                fileFormat = 'json';
                break;
            default:
                fileFormat = 'css';
                break;
        }
    }
    if (!outputFile) {
        outputFile = `dx.${themeName}.${outColorScheme}.${fileFormat}`;
    }
    return {
        outputFile,
        fileFormat,
        outColorScheme,
        makeSwatch,
        base,
    };
};
const getThemeAndColorScheme = (config) => {
    let themeName = 'generic';
    let colorScheme = 'light';
    let foundTheme = null;
    if (config.baseTheme) {
        const dotIndex = config.baseTheme.indexOf('.');
        const passedThemeName = config.baseTheme.substr(0, dotIndex);
        const passedColorScheme = config.baseTheme.substr(dotIndex + 1).replace(/\./g, '-');
        foundTheme = themes_1.default.find((t) => t.name === passedThemeName
            && t.colorScheme === passedColorScheme);
        if (!foundTheme) {
            (0, logger_1.log)(`The base theme with name ${config.baseTheme} does not exist.`);
        }
    }
    else if (config.themeId) {
        foundTheme = themes_1.default.find((t) => t.themeId === parseInt(config.themeId.toString(), 10));
        if (!foundTheme) {
            (0, logger_1.log)(`The theme with ID ${config.themeId} does not exist.`);
        }
    }
    if (foundTheme) {
        themeName = foundTheme.name;
        colorScheme = foundTheme.colorScheme;
    }
    return {
        themeName,
        colorScheme,
    };
};
const processItemKeys = (config, processor) => {
    var _a;
    if ((_a = config.items) === null || _a === void 0 ? void 0 : _a.length) {
        config.items.forEach((item) => {
            item.key = processor(item.key);
        });
    }
};
const normalizePath = (path) => path + (!path.endsWith('/') ? '/' : '');
const parseConfig = (config) => {
    var _a;
    const { command } = config;
    const metadataFilePath = (_a = config.inputFile) !== null && _a !== void 0 ? _a : '';
    const themeInfo = getThemeAndColorScheme(config);
    const bootstrapConfig = getBootstrapConfig(metadataFilePath, config.bootstrapVersion);
    const output = getOutParameters(command, themeInfo.themeName, config);
    delete config.baseTheme;
    delete config.outputColorScheme;
    delete config.outputFormat;
    delete config.outputFile;
    delete config.inputFile;
    delete config.themeId;
    if (config.lessPath) {
        config.lessPath = normalizePath(config.lessPath);
    }
    if (config.scssPath) {
        config.scssPath = normalizePath(config.scssPath);
    }
    if (config.widgets) {
        config.widgets = config.widgets.map((w) => w.toLowerCase());
    }
    [
        (key) => key.replace(/@treelist/, '@datagrid'),
        (key) => key.replace(/@/, '$'),
        (key) => key.toLowerCase().replace(/_/g, '-'),
    ].forEach((processor) => {
        processItemKeys(config, processor);
    });
    Object.assign(config, {
        data: config.data !== undefined ? config.data : {},
        fileFormat: output.fileFormat,
        themeName: themeInfo.themeName,
        colorScheme: themeInfo.colorScheme,
        outColorScheme: output.outColorScheme,
        isBootstrap: bootstrapConfig.isBootstrap,
        bootstrapVersion: bootstrapConfig.bootstrapVersion,
        out: output.outputFile,
        makeSwatch: output.makeSwatch,
        base: output.base,
    });
};
exports.default = parseConfig;
