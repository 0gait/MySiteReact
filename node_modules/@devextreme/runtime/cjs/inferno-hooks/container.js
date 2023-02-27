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
var recorder_1 = require("./recorder");
var effects_host_1 = require("./effects_host");
var HookContainer = /** @class */ (function (_super) {
    __extends(HookContainer, _super);
    function HookContainer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // eslint-disable-next-line react/state-in-constructor
        _this.state = {};
        return _this;
    }
    HookContainer.prototype.componentWillMount = function () {
        effects_host_1.EffectsHost.increment();
    };
    HookContainer.prototype.componentDidMount = function () {
        if (this.recorder) {
            this.recorder.componentDidMount();
        }
        effects_host_1.EffectsHost.decrement();
    };
    HookContainer.prototype.shouldComponentUpdate = function (nextProps, nextState, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context) {
        if (!this.recorder) {
            return true;
        }
        var result = this.recorder.shouldComponentUpdate(nextProps, nextState, context);
        if (result) {
            effects_host_1.EffectsHost.increment();
        }
        return result;
    };
    HookContainer.prototype.componentDidUpdate = function () {
        if (this.recorder) {
            this.recorder.componentDidUpdate();
        }
        effects_host_1.EffectsHost.decrement();
    };
    HookContainer.prototype.componentWillUnmount = function () {
        this.dispose();
    };
    HookContainer.prototype.getHook = function (dependencies, fn) {
        if (!this.recorder) {
            this.recorder = recorder_1.createRecorder(this);
        }
        return this.recorder.getHook(dependencies, fn);
    };
    HookContainer.prototype.getContextValue = function (consumer) {
        return this.context[consumer.id];
    };
    HookContainer.prototype.dispose = function () {
        if (this.recorder) {
            this.recorder.dispose();
        }
        this.state = {};
        this.recorder = undefined;
    };
    HookContainer.prototype.render = function () {
        return this.recorder
            ? this.recorder.renderResult
            : recorder_1.renderChild(this, this.props, this.context);
    };
    return HookContainer;
}(inferno_1.Component));
exports.HookContainer = HookContainer;
