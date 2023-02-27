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
var effect_host_1 = require("./effect_host");
var areObjectsEqual = function (firstObject, secondObject) {
    var bothAreObjects = firstObject instanceof Object && secondObject instanceof Object;
    if (!bothAreObjects) {
        return firstObject === secondObject;
    }
    var firstObjectKeys = Object.keys(firstObject);
    var secondObjectKeys = Object.keys(secondObject);
    if (firstObjectKeys.length !== secondObjectKeys.length) {
        return false;
    }
    var hasDifferentElement = firstObjectKeys.some(function (key) { return firstObject[key] !== secondObject[key]; });
    return !hasDifferentElement;
};
var BaseInfernoComponent = /** @class */ (function (_super) {
    __extends(BaseInfernoComponent, _super);
    function BaseInfernoComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._pendingContext = _this.context;
        return _this;
    }
    BaseInfernoComponent.prototype.componentWillReceiveProps = function (_, context) {
        this._pendingContext = context !== null && context !== void 0 ? context : {};
    };
    BaseInfernoComponent.prototype.shouldComponentUpdate = function (nextProps, nextState) {
        return (!areObjectsEqual(this.props, nextProps)
            || !areObjectsEqual(this.state, nextState)
            || !areObjectsEqual(this.context, this._pendingContext));
    };
    return BaseInfernoComponent;
}(inferno_1.Component));
exports.BaseInfernoComponent = BaseInfernoComponent;
var InfernoComponent = /** @class */ (function (_super) {
    __extends(InfernoComponent, _super);
    function InfernoComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._effects = [];
        return _this;
    }
    InfernoComponent.prototype.createEffects = function () {
        return [];
    };
    InfernoComponent.prototype.updateEffects = function () { };
    InfernoComponent.prototype.componentWillMount = function () {
        effect_host_1.InfernoEffectHost.lock();
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    InfernoComponent.prototype.componentWillUpdate = function (_nextProps, _nextState, _context) {
        effect_host_1.InfernoEffectHost.lock();
    };
    InfernoComponent.prototype.componentDidMount = function () {
        var _this = this;
        effect_host_1.InfernoEffectHost.callbacks.push(function () { _this._effects = _this.createEffects(); });
        effect_host_1.InfernoEffectHost.callEffects();
    };
    InfernoComponent.prototype.componentDidUpdate = function () {
        var _this = this;
        effect_host_1.InfernoEffectHost.callbacks.push(function () { return _this.updateEffects(); });
        effect_host_1.InfernoEffectHost.callEffects();
    };
    InfernoComponent.prototype.destroyEffects = function () {
        this._effects.forEach(function (e) { return e.dispose(); });
    };
    InfernoComponent.prototype.componentWillUnmount = function () {
        this.destroyEffects();
    };
    return InfernoComponent;
}(BaseInfernoComponent));
exports.InfernoComponent = InfernoComponent;
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
        _super.prototype.componentDidUpdate.call(this);
        var el = this.vDomElement;
        if (el !== null) {
            el.dxClasses.added.forEach(function (className) { return el.classList.add(className); });
            el.dxClasses.removed.forEach(function (className) { return el.classList.remove(className); });
            el.dxClasses.previous = el.className.length
                ? el.className.split(' ')
                : [];
        }
    };
    InfernoWrapperComponent.prototype.shouldComponentUpdate = function (nextProps, nextState) {
        var shouldUpdate = _super.prototype.shouldComponentUpdate.call(this, nextProps, nextState);
        if (shouldUpdate) {
            this.vDomUpdateClasses();
        }
        return shouldUpdate;
    };
    return InfernoWrapperComponent;
}(InfernoComponent));
exports.InfernoWrapperComponent = InfernoWrapperComponent;
