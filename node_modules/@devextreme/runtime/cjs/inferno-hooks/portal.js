"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inferno_1 = require("inferno");
exports.Portal = function (_a) {
    var container = _a.container, children = _a.children;
    if (container) {
        return inferno_1.createPortal(children, container);
    }
    return null;
};
