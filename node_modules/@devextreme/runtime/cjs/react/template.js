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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_dom_1 = __importDefault(require("react-dom"));
var React = __importStar(require("react"));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
exports.renderTemplate = function (template, model, _component) {
    var TemplateProp = template;
    var container = model.container ? model.container : model.item;
    if (typeof TemplateProp !== 'string' || !(template instanceof Element)) {
        react_dom_1.default.render(
        /* eslint-disable react/jsx-props-no-spreading */
        React.createElement(TemplateProp, __assign({}, model)), container ? model.container : model.item);
    }
};
exports.hasTemplate = function (name, props, _component) {
    var value = props[name];
    return !!value && typeof value !== 'string';
};
exports.getTemplate = function (TemplateProp, RenderProp, ComponentProp) {
    if (TemplateProp) {
        return TemplateProp.defaultProps ? function (props) { return React.createElement(TemplateProp, __assign({}, props)); } : TemplateProp;
    }
    if (RenderProp) {
        return function (props) { return RenderProp.apply(void 0, __spread(('data' in props ? [props.data, props.index] : [props]))); };
    }
    if (ComponentProp) {
        return function (props) { return React.createElement(ComponentProp, __assign({}, props)); };
    }
    return '';
};
