import { Component, findDOMfromVNode } from 'inferno';
import { InfernoEffectHost } from './effect_host';
const areObjectsEqual = (firstObject, secondObject) => {
    const bothAreObjects = firstObject instanceof Object && secondObject instanceof Object;
    if (!bothAreObjects) {
        return firstObject === secondObject;
    }
    const firstObjectKeys = Object.keys(firstObject);
    const secondObjectKeys = Object.keys(secondObject);
    if (firstObjectKeys.length !== secondObjectKeys.length) {
        return false;
    }
    const hasDifferentElement = firstObjectKeys.some((key) => firstObject[key] !== secondObject[key]);
    return !hasDifferentElement;
};
export class BaseInfernoComponent extends Component {
    constructor() {
        super(...arguments);
        this._pendingContext = this.context;
    }
    componentWillReceiveProps(_, context) {
        this._pendingContext = context !== null && context !== void 0 ? context : {};
    }
    shouldComponentUpdate(nextProps, nextState) {
        return (!areObjectsEqual(this.props, nextProps)
            || !areObjectsEqual(this.state, nextState)
            || !areObjectsEqual(this.context, this._pendingContext));
    }
}
export class InfernoComponent extends BaseInfernoComponent {
    constructor() {
        super(...arguments);
        this._effects = [];
    }
    createEffects() {
        return [];
    }
    updateEffects() { }
    componentWillMount() {
        InfernoEffectHost.lock();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    componentWillUpdate(_nextProps, _nextState, _context) {
        InfernoEffectHost.lock();
    }
    componentDidMount() {
        InfernoEffectHost.callbacks.push(() => { this._effects = this.createEffects(); });
        InfernoEffectHost.callEffects();
    }
    componentDidUpdate() {
        InfernoEffectHost.callbacks.push(() => this.updateEffects());
        InfernoEffectHost.callEffects();
    }
    destroyEffects() {
        this._effects.forEach((e) => e.dispose());
    }
    componentWillUnmount() {
        this.destroyEffects();
    }
}
export class InfernoWrapperComponent extends InfernoComponent {
    constructor() {
        super(...arguments);
        this.vDomElement = null;
    }
    vDomUpdateClasses() {
        const el = this.vDomElement;
        const currentClasses = el.className.length
            ? el.className.split(' ')
            : [];
        const addedClasses = currentClasses.filter((className) => el.dxClasses.previous.indexOf(className) < 0);
        const removedClasses = el.dxClasses.previous.filter((className) => currentClasses.indexOf(className) < 0);
        addedClasses.forEach((value) => {
            const indexInRemoved = el.dxClasses.removed.indexOf(value);
            if (indexInRemoved > -1) {
                el.dxClasses.removed.splice(indexInRemoved, 1);
            }
            else {
                el.dxClasses.added.push(value);
            }
        });
        removedClasses.forEach((value) => {
            const indexInAdded = el.dxClasses.added.indexOf(value);
            if (indexInAdded > -1) {
                el.dxClasses.added.splice(indexInAdded, 1);
            }
            else {
                el.dxClasses.removed.push(value);
            }
        });
    }
    componentDidMount() {
        const el = findDOMfromVNode(this.$LI, true);
        this.vDomElement = el;
        super.componentDidMount();
        el.dxClasses = el.dxClasses || {
            removed: [], added: [], previous: [],
        };
        el.dxClasses.previous = (el === null || el === void 0 ? void 0 : el.className.length) ? el.className.split(' ')
            : [];
    }
    componentDidUpdate() {
        super.componentDidUpdate();
        const el = this.vDomElement;
        if (el !== null) {
            el.dxClasses.added.forEach((className) => el.classList.add(className));
            el.dxClasses.removed.forEach((className) => el.classList.remove(className));
            el.dxClasses.previous = el.className.length
                ? el.className.split(' ')
                : [];
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        const shouldUpdate = super.shouldComponentUpdate(nextProps, nextState);
        if (shouldUpdate) {
            this.vDomUpdateClasses();
        }
        return shouldUpdate;
    }
}
