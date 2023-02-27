const getContainer = (props) => {
    const container = props.container || props.item;
    return (container === null || container === void 0 ? void 0 : container.get) ? container === null || container === void 0 ? void 0 : container.get(0) : container;
};
export const renderTemplate = (template, model, component) => {
    const childView = component.viewContainerRef.createEmbeddedView(template, {
        $implicit: model.item,
        index: model.index,
    });
    const container = getContainer(model);
    if (container) {
        childView.rootNodes.forEach((element) => {
            component.renderer.appendChild(container, element);
        });
    }
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const hasTemplate = (name, props, _component) => {
    const value = props[name];
    return !!value && typeof value !== 'string';
};
