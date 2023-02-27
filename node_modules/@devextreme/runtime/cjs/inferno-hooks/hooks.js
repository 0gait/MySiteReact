"use strict";
// Based on https://github.com/chrisdavies/xferno by Chris Davies
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
var shallow_equal_1 = require("./shallow-equal");
var recorder_1 = require("./recorder");
function useState(initialState) {
    return recorder_1.currentComponent.current.getHook(0, function (hook) {
        if (hook.isNew) {
            recorder_1.currentComponent.current.state[hook.id] = initialState instanceof Function
                ? initialState()
                : initialState;
            var component_1 = recorder_1.currentComponent.current;
            hook.$setState = function (setter) {
                var state = component_1.state[hook.id];
                var nextState = typeof setter === 'function' ? setter(component_1.state[hook.id]) : setter;
                if (state === nextState) {
                    return undefined;
                }
                return component_1.setState(function (s) {
                    s[hook.id] = nextState;
                    return s;
                });
            };
        }
        hook.value = [recorder_1.currentComponent.current.state[hook.id], hook.$setState];
    });
}
exports.useState = useState;
function useEffect(fn, dependencies) {
    return recorder_1.currentComponent.current.getHook(dependencies, function (hook, addEffectHook) {
        hook.effect = fn;
        if (hook.isNew) {
            addEffectHook(function () {
                var _a, _b, _c;
                if (hook.isNew) {
                    hook.dispose = (_a = hook.effect) === null || _a === void 0 ? void 0 : _a.call(hook);
                    hook.dependencies = dependencies;
                }
                else if (hook.dependencies === undefined || !shallow_equal_1.equal(hook.dependencies, hook.newDeps)) {
                    (_b = hook.dispose) === null || _b === void 0 ? void 0 : _b.call(hook);
                    hook.dispose = (_c = hook.effect) === null || _c === void 0 ? void 0 : _c.call(hook);
                    hook.dependencies = hook.newDeps;
                }
            });
        }
        else {
            hook.newDeps = dependencies;
        }
    });
}
exports.useEffect = useEffect;
function useMemo(fn, dependencies) {
    return recorder_1.currentComponent.current.getHook(dependencies, function (hook) {
        if (hook.isNew || !shallow_equal_1.equal(hook.dependencies, dependencies) || hook.dependencies === undefined) {
            hook.value = fn();
            hook.dependencies = dependencies;
        }
    });
}
exports.useMemo = useMemo;
function useCallback(fn, dependencies) {
    return recorder_1.currentComponent.current.getHook(dependencies, function (hook) {
        if (hook.isNew || !shallow_equal_1.equal(hook.dependencies, dependencies) || hook.dependencies === undefined) {
            hook.value = fn;
            hook.dependencies = dependencies;
        }
    });
}
exports.useCallback = useCallback;
function useImperativeHandle(ref, init, dependencies) {
    return recorder_1.currentComponent.current.getHook(dependencies, function (hook) {
        if ((hook.isNew
            || !shallow_equal_1.equal(hook.dependencies, dependencies)
            || hook.dependencies === undefined) && ref) {
            ref.current = init();
            hook.dependencies = dependencies;
        }
    });
}
exports.useImperativeHandle = useImperativeHandle;
function useContext(consumer) {
    return recorder_1.currentComponent.current.getContextValue(consumer) || consumer.defaultValue;
}
exports.useContext = useContext;
function useRef(initialValue) {
    return recorder_1.currentComponent.current.getHook(0, function (hook) {
        if (hook.isNew) {
            var ref_1 = { current: initialValue || null };
            hook.value = ref_1;
            hook.dispose = function () { ref_1.current = null; };
        }
    });
}
exports.useRef = useRef;
