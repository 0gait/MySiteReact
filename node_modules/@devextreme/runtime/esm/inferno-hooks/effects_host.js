let counter = 0;
let queue = [];
const addEffectHook = (effect) => { queue.push(effect); };
const decrement = () => { counter--; if (counter === 0)
    callEffects(); };
const increment = () => { counter++; };
const callEffects = () => {
    queue.forEach((effect) => {
        effect();
    });
    queue = [];
};
export const EffectsHost = {
    increment, decrement, addEffectHook,
};
