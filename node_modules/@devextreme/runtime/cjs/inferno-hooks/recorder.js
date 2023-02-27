"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var effects_host_1 = require("./effects_host");
var shallow_equal_1 = require("./shallow-equal");
exports.currentComponent = {};
function renderChild(component, _a, context) {
    var renderFn = _a.renderFn, renderProps = _a.renderProps, renderRef = _a.renderRef;
    var prevRecorder = exports.currentComponent.current;
    exports.currentComponent.current = component;
    exports.currentComponent.current.context = context;
    var props = renderProps;
    try {
        return renderFn(props || {}, renderRef || {});
    }
    finally {
        exports.currentComponent.current = prevRecorder;
    }
}
exports.renderChild = renderChild;
function createRecorder(component) {
    var nextId = 0;
    var hookInstances = [];
    var effects = [];
    var shouldUpdate = true;
    component.state = {};
    function nextHook() {
        var id = nextId;
        nextId += 1;
        var hook = hookInstances[id];
        if (!hook) {
            hook = {
                id: id,
            };
            hookInstances[id] = hook;
            hook.isNew = true;
        }
        else {
            hook.isNew = false;
        }
        return hook;
    }
    var addEffectHook = function (effect) { effects.push(effect); };
    var addHooksToQueue = function () {
        effects.forEach(function (effect) {
            effects_host_1.EffectsHost.addEffectHook(effect);
        });
    };
    var recorder = {
        renderResult: undefined,
        getHook: function (_dependencies, fn) {
            var hook = nextHook();
            var value = hook.value;
            fn(hook, addEffectHook);
            shouldUpdate = shouldUpdate || !shallow_equal_1.equal(hook.value, value);
            return hook.value;
        },
        shouldComponentUpdate: function (nextProps, nextState, context) {
            shouldUpdate = !shallow_equal_1.equal(component.props.renderProps, nextProps.renderProps);
            component.state = nextState;
            nextId = 0;
            var renderResult = renderChild(component, nextProps, context);
            if (shouldUpdate) {
                recorder.renderResult = renderResult;
            }
            return shouldUpdate;
        },
        componentDidMount: addHooksToQueue,
        componentDidUpdate: addHooksToQueue,
        dispose: function () {
            hookInstances.forEach(function (hook) { return hook && hook.dispose && hook.dispose(); });
        },
    };
    return recorder;
}
exports.createRecorder = createRecorder;
