"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inferno_1 = require("inferno");
function forwardRef(render) {
    var result = inferno_1.forwardRef(render);
    Object.defineProperty(render, 'defaultProps', {
        get: function () { return result.defaultProps; },
    });
    return result;
}
exports.forwardRef = forwardRef;
