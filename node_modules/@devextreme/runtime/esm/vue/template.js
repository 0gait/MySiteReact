import Vue from 'vue';
const getSlot = (component, slotName) => component.$parent.$scopedSlots[slotName];
const mountTemplate = (component, data, name, placeholder) => new Vue({
    el: placeholder,
    name,
    parent: component,
    render: (createElement) => {
        const content = getSlot(component, name)(data);
        if (!content) {
            return createElement('div');
        }
        return content[0];
    },
});
export const renderTemplate = (template, model, component) => {
    const placeholder = document.createElement('div');
    model.container.appendChild(placeholder);
    mountTemplate(component, model.item, template, placeholder);
};
export const hasTemplate = (name, _props, component) => !!component.$parent.$slots[name];
