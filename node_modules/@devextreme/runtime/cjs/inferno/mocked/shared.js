"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';
function isNullOrUndef(o) {
    return o === void 0 || o === null;
}
exports.isNullOrUndef = isNullOrUndef;
function isInvalid(o) {
    return o === null || o === false || o === true || o === void 0;
}
exports.isInvalid = isInvalid;
function isFunction(o) {
    return typeof o === 'function';
}
exports.isFunction = isFunction;
function isNull(o) {
    return o === null;
}
exports.isNull = isNull;
function throwError(message) {
    if (!message) {
        message = exports.ERROR_MSG;
    }
    throw new Error("Inferno Error: " + message);
}
exports.throwError = throwError;
