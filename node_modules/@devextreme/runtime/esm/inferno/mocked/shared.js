export const ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';
export function isNullOrUndef(o) {
    return o === void 0 || o === null;
}
export function isInvalid(o) {
    return o === null || o === false || o === true || o === void 0;
}
export function isFunction(o) {
    return typeof o === 'function';
}
export function isNull(o) {
    return o === null;
}
export function throwError(message) {
    if (!message) {
        message = ERROR_MSG;
    }
    throw new Error(`Inferno Error: ${message}`);
}
