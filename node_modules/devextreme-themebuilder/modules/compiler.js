"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportType = void 0;
const sass = __importStar(require("sass-embedded"));
// eslint-disable-next-line import/extensions
const dx_theme_builder_metadata_1 = require("../data/metadata/dx-theme-builder-metadata");
const parse_value_1 = require("./parse-value");
const post_compiler_1 = require("./post-compiler");
var ImportType;
(function (ImportType) {
    ImportType[ImportType["Index"] = 0] = "Index";
    ImportType[ImportType["Color"] = 1] = "Color";
    ImportType[ImportType["Unknown"] = 2] = "Unknown";
})(ImportType = exports.ImportType || (exports.ImportType = {}));
class Compiler {
    constructor() {
        this.changedVariables = {};
        this.importerCache = {};
        this.meta = dx_theme_builder_metadata_1.metadata;
        this.userItems = [];
        this.compile = (file, items, options) => __awaiter(this, void 0, void 0, function* () { return this.sassCompile(file, items, options, sass.compileAsync); });
        this.compileString = (content, items, options) => __awaiter(this, void 0, void 0, function* () { return this.sassCompile(content, items, options, sass.compileStringAsync); });
        this.sassCompile = (source, items, options, compile) => __awaiter(this, void 0, void 0, function* () {
            this.changedVariables = {};
            this.userItems = items || [];
            let compilerOptions = {
                importers: [{
                        // eslint-disable-next-line spellcheck/spell-checker
                        canonicalize: this.canonicalize,
                        load: this.load,
                    }],
                functions: {
                    'collector($map)': this.collector,
                },
            };
            compilerOptions = Object.assign(Object.assign({}, compilerOptions), options);
            return new Promise((resolve, reject) => {
                compile(source, compilerOptions)
                    .then((data) => {
                    resolve({
                        result: Object.assign(Object.assign({}, data), { css: (0, post_compiler_1.optimizeCss)(data.css) }),
                        changedVariables: this.changedVariables,
                    });
                })
                    .catch((error) => reject(error));
            });
        });
        // eslint-disable-next-line spellcheck/spell-checker
        this.canonicalize = (url) => (url.includes('tb_') ? new URL(`db:${url}`) : null);
        this.load = (url) => {
            const { pathname: path } = url;
            const importType = Compiler.getImportType(path);
            let content = this.importerCache[path];
            if (!content) {
                content = importType === ImportType.Index
                    ? this.indexFileContent
                    : this.getMatchingUserItemsAsString(path.replace('tb_', ''));
                this.importerCache[path] = content;
            }
            return {
                contents: content,
                syntax: 'scss',
            };
        };
        this.collector = (maps) => {
            maps.forEach((map) => {
                map.asList.forEach((value) => {
                    if (value.get(1) === sass.sassNull) {
                        return;
                    }
                    const key = value.get(0);
                    if (!(key instanceof sass.SassString)) {
                        return;
                    }
                    const variableKey = key.text;
                    const variableValue = (0, parse_value_1.parse)(value.get(1));
                    this.changedVariables[variableKey] = variableValue;
                });
            });
            return sass.sassNull;
        };
    }
    getMatchingUserItemsAsString(theme) {
        const meta = theme === 'generic' ? this.meta.generic : this.meta.material;
        const themeKeys = meta.map((item) => item.Key);
        return this.userItems
            .filter((item) => themeKeys.includes(item.key))
            .map((item) => `${item.key}: ${item.value};`)
            .join('');
    }
}
exports.default = Compiler;
Compiler.getImportType = (url) => {
    if (url.endsWith('tb_index'))
        return ImportType.Index;
    if (url.startsWith('tb_'))
        return ImportType.Color;
    return ImportType.Unknown;
};
