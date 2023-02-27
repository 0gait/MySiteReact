"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inferno_1 = require("inferno");
var inferno_create_element_1 = require("inferno-create-element");
var getContainer = function (props) { var _a, _b; return ((_a = props.container) === null || _a === void 0 ? void 0 : _a.get(0)) || ((_b = props.item) === null || _b === void 0 ? void 0 : _b.get(0)); };
function renderTemplate(template, props, _component) {
    setTimeout(function () {
        inferno_1.render(inferno_create_element_1.createElement(template, props), getContainer(props));
    }, 0);
}
exports.renderTemplate = renderTemplate;
exports.hasTemplate = function (name, properties, _component) {
    var value = properties[name];
    return !!value && typeof value !== 'string';
};
