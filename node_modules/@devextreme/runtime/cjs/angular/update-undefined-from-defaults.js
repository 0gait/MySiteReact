"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function updateUndefinedFromDefaults(componentInstance, changes, defaultEntries) {
    defaultEntries.forEach(function (_a) {
        var key = _a.key, value = _a.value;
        if (changes[key] && changes[key].currentValue === undefined) {
            componentInstance[key] = value;
        }
    });
}
exports.updateUndefinedFromDefaults = updateUndefinedFromDefaults;
