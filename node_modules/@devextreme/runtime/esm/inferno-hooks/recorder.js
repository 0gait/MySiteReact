import { EffectsHost } from './effects_host';
import { equal } from './shallow-equal';
export const currentComponent = {};
export function renderChild(component, { renderFn, renderProps, renderRef, }, context) {
    const prevRecorder = currentComponent.current;
    currentComponent.current = component;
    currentComponent.current.context = context;
    const props = renderProps;
    try {
        return renderFn(props || {}, renderRef || {});
    }
    finally {
        currentComponent.current = prevRecorder;
    }
}
export function createRecorder(component) {
    let nextId = 0;
    const hookInstances = [];
    const effects = [];
    let shouldUpdate = true;
    component.state = {};
    function nextHook() {
        const id = nextId;
        nextId += 1;
        let hook = hookInstances[id];
        if (!hook) {
            hook = {
                id,
            };
            hookInstances[id] = hook;
            hook.isNew = true;
        }
        else {
            hook.isNew = false;
        }
        return hook;
    }
    const addEffectHook = (effect) => { effects.push(effect); };
    const addHooksToQueue = () => {
        effects.forEach((effect) => {
            EffectsHost.addEffectHook(effect);
        });
    };
    const recorder = {
        renderResult: undefined,
        getHook(_dependencies, fn) {
            const hook = nextHook();
            const value = hook.value;
            fn(hook, addEffectHook);
            shouldUpdate = shouldUpdate || !equal(hook.value, value);
            return hook.value;
        },
        shouldComponentUpdate(nextProps, nextState, context) {
            shouldUpdate = !equal(component.props.renderProps, nextProps.renderProps);
            component.state = nextState;
            nextId = 0;
            const renderResult = renderChild(component, nextProps, context);
            if (shouldUpdate) {
                recorder.renderResult = renderResult;
            }
            return shouldUpdate;
        },
        componentDidMount: addHooksToQueue,
        componentDidUpdate: addHooksToQueue,
        dispose() {
            hookInstances.forEach((hook) => hook && hook.dispose && hook.dispose());
        },
    };
    return recorder;
}
