import { normalizeProps, createComponentVNode, } from 'inferno';
export const getTemplate = (TemplateProp) => (TemplateProp && TemplateProp.defaultProps
    ? (props) => normalizeProps(createComponentVNode(2, TemplateProp, Object.assign({}, props)))
    : TemplateProp);
