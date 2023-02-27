// Based on https://github.com/chrisdavies/xferno by Chris Davies
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { equal } from './shallow-equal';
import { currentComponent } from './recorder';
export function useState(initialState) {
    return currentComponent.current.getHook(0, (hook) => {
        if (hook.isNew) {
            currentComponent.current.state[hook.id] = initialState instanceof Function
                ? initialState()
                : initialState;
            const component = currentComponent.current;
            hook.$setState = (setter) => {
                const state = component.state[hook.id];
                const nextState = typeof setter === 'function' ? setter(component.state[hook.id]) : setter;
                if (state === nextState) {
                    return undefined;
                }
                return component.setState((s) => {
                    s[hook.id] = nextState;
                    return s;
                });
            };
        }
        hook.value = [currentComponent.current.state[hook.id], hook.$setState];
    });
}
export function useEffect(fn, dependencies) {
    return currentComponent.current.getHook(dependencies, (hook, addEffectHook) => {
        hook.effect = fn;
        if (hook.isNew) {
            addEffectHook(() => {
                var _a, _b, _c;
                if (hook.isNew) {
                    hook.dispose = (_a = hook.effect) === null || _a === void 0 ? void 0 : _a.call(hook);
                    hook.dependencies = dependencies;
                }
                else if (hook.dependencies === undefined || !equal(hook.dependencies, hook.newDeps)) {
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
export function useMemo(fn, dependencies) {
    return currentComponent.current.getHook(dependencies, (hook) => {
        if (hook.isNew || !equal(hook.dependencies, dependencies) || hook.dependencies === undefined) {
            hook.value = fn();
            hook.dependencies = dependencies;
        }
    });
}
export function useCallback(fn, dependencies) {
    return currentComponent.current.getHook(dependencies, (hook) => {
        if (hook.isNew || !equal(hook.dependencies, dependencies) || hook.dependencies === undefined) {
            hook.value = fn;
            hook.dependencies = dependencies;
        }
    });
}
export function useImperativeHandle(ref, init, dependencies) {
    return currentComponent.current.getHook(dependencies, (hook) => {
        if ((hook.isNew
            || !equal(hook.dependencies, dependencies)
            || hook.dependencies === undefined) && ref) {
            ref.current = init();
            hook.dependencies = dependencies;
        }
    });
}
export function useContext(consumer) {
    return currentComponent.current.getContextValue(consumer) || consumer.defaultValue;
}
export function useRef(initialValue) {
    return currentComponent.current.getHook(0, (hook) => {
        if (hook.isNew) {
            const ref = { current: initialValue || null };
            hook.value = ref;
            hook.dispose = () => { ref.current = null; };
        }
    });
}
