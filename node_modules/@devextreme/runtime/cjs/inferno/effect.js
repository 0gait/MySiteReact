"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InfernoEffect = /** @class */ (function () {
    function InfernoEffect(effect, dependency) {
        this.dependency = dependency;
        this.effect = effect;
        this.destroy = effect();
    }
    InfernoEffect.prototype.update = function (dependency) {
        var currentDependency = this.dependency;
        if (dependency) {
            this.dependency = dependency;
        }
        if (!dependency || dependency.some(function (d, i) { return currentDependency[i] !== d; })) {
            this.dispose();
            this.destroy = this.effect();
        }
    };
    InfernoEffect.prototype.dispose = function () {
        if (this.destroy) {
            this.destroy();
        }
    };
    return InfernoEffect;
}());
exports.InfernoEffect = InfernoEffect;
