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
exports.buildTheme = void 0;
const config_normalizer_1 = __importDefault(require("./config-normalizer"));
const compile_manager_1 = __importDefault(require("./compile-manager"));
const buildTheme = (config) => __awaiter(void 0, void 0, void 0, function* () {
    (0, config_normalizer_1.default)(config);
    const compileManager = new compile_manager_1.default();
    return compileManager.compile(config);
});
exports.buildTheme = buildTheme;
// compatibility default export
exports.default = { buildTheme: exports.buildTheme };
