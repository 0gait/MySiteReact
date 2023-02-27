import { render } from 'inferno';
import { createElement } from 'inferno-create-element';
const getContainer = (props) => { var _a, _b; return ((_a = props.container) === null || _a === void 0 ? void 0 : _a.get(0)) || ((_b = props.item) === null || _b === void 0 ? void 0 : _b.get(0)); };
export function renderTemplate(template, props, _component) {
    setTimeout(() => {
        render(createElement(template, props), getContainer(props));
    }, 0);
}
export const hasTemplate = (name, properties, _component) => {
    const value = properties[name];
    return !!value && typeof value !== 'string';
};
