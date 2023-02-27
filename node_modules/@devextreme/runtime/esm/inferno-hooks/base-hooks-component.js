import { findDOMfromVNode } from 'inferno';
import { HookContainer } from './container';
export class InfernoWrapperComponent extends HookContainer {
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
        const el = this.vDomElement;
        if (el !== null) {
            el.dxClasses.added.forEach((className) => el.classList.add(className));
            el.dxClasses.removed.forEach((className) => el.classList.remove(className));
            el.dxClasses.previous = el.className.length
                ? el.className.split(' ')
                : [];
        }
        super.componentDidUpdate();
    }
    shouldComponentUpdate(nextProps, nextState, context) {
        const shouldUpdate = super.shouldComponentUpdate(nextProps, nextState, context);
        if (shouldUpdate) {
            this.vDomUpdateClasses();
        }
        return shouldUpdate;
    }
}
