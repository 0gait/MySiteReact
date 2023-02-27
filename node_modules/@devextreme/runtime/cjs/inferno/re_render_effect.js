"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inferno_1 = require("inferno");
var effect_1 = require("./effect");
exports.createReRenderEffect = function () { return new effect_1.InfernoEffect(function () {
    inferno_1.rerender();
}, []); };
