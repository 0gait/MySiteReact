"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var inferno_1 = require("inferno");
var container_1 = require("./container");
var InfernoWrapperComponent = /** @class */ (function (_super) {
    __extends(InfernoWrapperComponent, _super);
    function InfernoWrapperComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.vDomElement = null;
        return _this;
    }
    InfernoWrapperComponent.prototype.vDomUpdateClasses = function () {
        var el = this.vDomElement;
        var currentClasses = el.className.length
            ? el.className.split(' ')
            : [];
        var addedClasses = currentClasses.filter(function (className) { return el.dxClasses.previous.indexOf(className) < 0; });
        var removedClasses = el.dxClasses.previous.filter(function (className) { return currentClasses.indexOf(className) < 0; });
        addedClasses.forEach(function (value) {
            var indexInRemoved = el.dxClasses.removed.indexOf(value);
            if (indexInRemoved > -1) {
                el.dxClasses.removed.splice(indexInRemoved, 1);
            }
            else {
                el.dxClasses.added.push(value);
            }
        });
        removedClasses.forEach(function (value) {
            var indexInAdded = el.dxClasses.added.indexOf(value);
            if (indexInAdded > -1) {
                el.dxClasses.added.splice(indexInAdded, 1);
            }
            else {
                el.dxClasses.removed.push(value);
            }
        });
    };
    InfernoWrapperComponent.prototype.componentDidMount = function () {
        var el = inferno_1.findDOMfromVNode(this.$LI, true);
        this.vDomElement = el;
        _super.prototype.componentDidMount.call(this);
        el.dxClasses = el.dxClasses || {
            removed: [], added: [], previous: [],
        };
        el.dxClasses.previous = (el === null || el === void 0 ? void 0 : el.className.length) ? el.className.split(' ')
            : [];
    };
    InfernoWrapperComponent.prototype.componentDidUpdate = function () {
        var el = this.vDomElement;
        if (el !== null) {
            el.dxClasses.added.forEach(function (className) { return el.classList.add(className); });
            el.dxClasses.removed.forEach(function (className) { return el.classList.remove(className); });
            el.dxClasses.previous = el.className.length
                ? el.className.split(' ')
                : [];
        }
        _super.prototype.componentDidUpdate.call(this);
    };
    InfernoWrapperComponent.prototype.shouldComponentUpdate = function (nextProps, nextState, context) {
        var shouldUpdate = _super.prototype.shouldComponentUpdate.call(this, nextProps, nextState, context);
        if (shouldUpdate) {
            this.vDomUpdateClasses();
        }
        return shouldUpdate;
    };
    return InfernoWrapperComponent;
}(container_1.HookContainer));
exports.InfernoWrapperComponent = InfernoWrapperComponent;
