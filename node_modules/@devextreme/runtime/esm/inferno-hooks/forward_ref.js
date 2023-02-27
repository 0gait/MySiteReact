import { forwardRef as infernoForwardRef, } from 'inferno';
export function forwardRef(render) {
    const result = infernoForwardRef(render);
    Object.defineProperty(render, 'defaultProps', {
        get: () => result.defaultProps,
    });
    return result;
}
