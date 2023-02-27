"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var counter = 0;
var queue = [];
var addEffectHook = function (effect) { queue.push(effect); };
var decrement = function () { counter--; if (counter === 0)
    callEffects(); };
var increment = function () { counter++; };
var callEffects = function () {
    queue.forEach(function (effect) {
        effect();
    });
    queue = [];
};
exports.EffectsHost = {
    increment: increment, decrement: decrement, addEffectHook: addEffectHook,
};
