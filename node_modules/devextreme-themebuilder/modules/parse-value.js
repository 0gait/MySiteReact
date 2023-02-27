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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.color = void 0;
const sass = __importStar(require("sass-embedded"));
const color = (value) => {
    const getHex = (colorValue) => colorValue.toString(16).padStart(2, '0');
    const alpha = Math.round(255 * value.alpha);
    if (alpha === 0) {
        return 'transparent';
    }
    const hexRed = getHex(value.red);
    const hexGreen = getHex(value.green);
    const hexBlue = getHex(value.blue);
    const hexAlpha = alpha === 255 ? '' : getHex(alpha);
    return `#${hexRed}${hexGreen}${hexBlue}${hexAlpha}`;
};
exports.color = color;
const parse = (value) => {
    let result = value.toString();
    if (value instanceof sass.SassColor) {
        result = (0, exports.color)(value);
    }
    return result;
};
exports.parse = parse;
