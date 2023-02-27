"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compiler_1 = __importDefault(require("./compiler"));
const widgets_handler_1 = __importDefault(require("./widgets-handler"));
const pre_compiler_1 = require("./pre-compiler");
const bundle_resolver_1 = __importDefault(require("./bundle-resolver"));
const post_compiler_1 = require("./post-compiler");
const bootstrap_extractor_1 = __importDefault(require("./bootstrap-extractor"));
// eslint-disable-next-line import/extensions
const dx_theme_builder_metadata_1 = require("../data/metadata/dx-theme-builder-metadata");
class CompileManager {
    constructor() {
        this.compiler = new compiler_1.default();
    }
    compile(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const bundleOptions = (0, bundle_resolver_1.default)(config.themeName, config.colorScheme);
            const { items, widgets, isBootstrap, bootstrapVersion, data, } = config;
            const widgetsHandler = new widgets_handler_1.default(widgets, bundleOptions.file, dx_theme_builder_metadata_1.dependencies);
            const widgetsLists = yield widgetsHandler.getIndexContent();
            this.compiler.indexFileContent = widgetsLists.indexContent;
            let modifiedVariables = items;
            try {
                if (isBootstrap) {
                    const bootstrapExtractor = new bootstrap_extractor_1.default(data, bootstrapVersion);
                    modifiedVariables = yield bootstrapExtractor.extract();
                }
                const compileData = yield this.compiler.compile(bundleOptions.file, modifiedVariables, bundleOptions.options);
                let css = compileData.result.css.toString();
                let swatchSelector = null;
                if (config.makeSwatch) {
                    const swatchSass = (0, pre_compiler_1.createSassForSwatch)(config.outColorScheme, css);
                    const swatchResult = yield this.compiler.compileString(swatchSass.sass, [], bundleOptions.options);
                    css = (0, post_compiler_1.fixSwatchCss)(swatchResult.result.css, swatchSass.selector, config.colorScheme);
                    swatchSelector = swatchSass.selector;
                }
                if (config.assetsBasePath) {
                    css = (0, post_compiler_1.addBasePath)(css, config.assetsBasePath);
                }
                css = yield (0, post_compiler_1.autoPrefix)(css);
                if (!config.noClean) {
                    css = yield (0, post_compiler_1.cleanCss)(css);
                }
                if (config.removeExternalResources) {
                    css = (0, post_compiler_1.removeExternalResources)(css);
                }
                css = (0, post_compiler_1.addInfoHeader)(css, dx_theme_builder_metadata_1.version);
                return {
                    compiledMetadata: compileData.changedVariables,
                    css,
                    widgets: widgetsLists.widgets,
                    unusedWidgets: widgetsLists.unusedWidgets,
                    swatchSelector,
                    version: dx_theme_builder_metadata_1.version,
                };
            }
            catch (e) {
                const { span, message } = e;
                const { url, start } = span;
                const { line, column } = start;
                throw new Error(`Compilation failed.\nbundle: ${bundleOptions.file},\nfile: ${url}:${line}:${column},\n${message}`);
            }
        });
    }
}
exports.default = CompileManager;
