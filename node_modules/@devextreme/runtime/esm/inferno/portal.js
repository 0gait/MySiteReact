import { createPortal } from 'inferno';
export const Portal = ({ container, children }) => {
    if (container) {
        return createPortal(children, container);
    }
    return null;
};
