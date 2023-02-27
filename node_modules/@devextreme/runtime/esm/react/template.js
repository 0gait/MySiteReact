import ReactDOM from 'react-dom';
import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const renderTemplate = (template, model, _component) => {
    const TemplateProp = template;
    const container = model.container ? model.container : model.item;
    if (typeof TemplateProp !== 'string' || !(template instanceof Element)) {
        ReactDOM.render(
        /* eslint-disable react/jsx-props-no-spreading */
        React.createElement(TemplateProp, Object.assign({}, model)), container ? model.container : model.item);
    }
};
export const hasTemplate = (name, props, _component) => {
    const value = props[name];
    return !!value && typeof value !== 'string';
};
export const getTemplate = (TemplateProp, RenderProp, ComponentProp) => {
    if (TemplateProp) {
        return TemplateProp.defaultProps ? (props) => React.createElement(TemplateProp, Object.assign({}, props)) : TemplateProp;
    }
    if (RenderProp) {
        return (props) => RenderProp(...('data' in props ? [props.data, props.index] : [props]));
    }
    if (ComponentProp) {
        return (props) => React.createElement(ComponentProp, Object.assign({}, props));
    }
    return '';
};
