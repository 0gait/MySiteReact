import { Component } from 'inferno';
let contextId = 0;
export const createContext = function (defaultValue) {
    const id = contextId++;
    return {
        id,
        defaultValue,
        Provider: class extends Component {
            getChildContext() {
                return Object.assign(Object.assign({}, this.context), { [id]: this.props.value || defaultValue });
            }
            render() {
                return this.props.children;
            }
        },
    };
};
