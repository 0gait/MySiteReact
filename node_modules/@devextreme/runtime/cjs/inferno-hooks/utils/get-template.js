"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var inferno_1 = require("inferno");
exports.getTemplate = function (TemplateProp) { return (TemplateProp && TemplateProp.defaultProps
    ? function (props) { return inferno_1.normalizeProps(inferno_1.createComponentVNode(2, TemplateProp, __assign({}, props))); }
    : TemplateProp); };
