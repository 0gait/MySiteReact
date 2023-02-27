import { _CI, _HI, _M, _MCCC, _ME, _MFCC, _MP, _MR, EMPTY_OBJ, render, _RFC as renderFunctionalComponent, } from 'inferno';
import { isFunction, isInvalid, isNull, isNullOrUndef, throwError, } from './shared';
function isSameInnerHTML(dom, innerHTML) {
    const tempdom = document.createElement('i');
    tempdom.innerHTML = innerHTML;
    return tempdom.innerHTML === dom.innerHTML;
}
function findLastDOMFromVNode(vNode) {
    let flags;
    let children;
    while (vNode) {
        flags = vNode.flags;
        if (flags & 2033 /* DOMRef */) {
            return vNode.dom;
        }
        children = vNode.children;
        if (flags & 8192 /* Fragment */) {
            vNode = vNode.childFlags === 2 /* HasVNodeChildren */ ? children : children[children.length - 1];
        }
        else if (flags & 4 /* ComponentClass */) {
            vNode = children.$LI;
        }
        else {
            vNode = children;
        }
    }
    return null;
}
function isSamePropsInnerHTML(dom, props) {
    return Boolean(props && props.dangerouslySetInnerHTML && props.dangerouslySetInnerHTML.__html && isSameInnerHTML(dom, props.dangerouslySetInnerHTML.__html));
}
function hydrateComponent(vNode, parentDOM, dom, context, isSVG, isClass, lifecycle) {
    const type = vNode.type;
    const ref = vNode.ref;
    const props = vNode.props || EMPTY_OBJ;
    let currentNode;
    if (isClass) {
        const instance = _CI(vNode, type, props, context, isSVG, lifecycle);
        const input = instance.$LI;
        currentNode = hydrateVNode(input, parentDOM, dom, instance.$CX, isSVG, lifecycle);
        _MCCC(ref, instance, lifecycle);
    }
    else {
        const input = _HI(renderFunctionalComponent(vNode, context));
        currentNode = hydrateVNode(input, parentDOM, dom, context, isSVG, lifecycle);
        vNode.children = input;
        _MFCC(vNode, lifecycle);
    }
    return currentNode;
}
function hydrateChildren(parentVNode, parentNode, currentNode, context, isSVG, lifecycle) {
    const childFlags = parentVNode.childFlags;
    const children = parentVNode.children;
    const props = parentVNode.props;
    const flags = parentVNode.flags;
    if (childFlags !== 1 /* HasInvalidChildren */) {
        if (childFlags === 2 /* HasVNodeChildren */) {
            if (isNull(currentNode)) {
                _M(children, parentNode, context, isSVG, null, lifecycle);
            }
            else {
                currentNode = hydrateVNode(children, parentNode, currentNode, context, isSVG, lifecycle);
                currentNode = currentNode ? currentNode.nextSibling : null;
            }
        }
        else if (childFlags === 16 /* HasTextChildren */) {
            if (isNull(currentNode)) {
                parentNode.appendChild(document.createTextNode(children));
            }
            else if (parentNode.childNodes.length !== 1 || currentNode.nodeType !== 3) {
                parentNode.textContent = children;
            }
            else if (currentNode.nodeValue !== children) {
                currentNode.nodeValue = children;
            }
            currentNode = null;
        }
        else if (childFlags & 12 /* MultipleChildren */) {
            let prevVNodeIsTextNode = false;
            for (let i = 0, len = children.length; i < len; ++i) {
                const child = children[i];
                if (isNull(currentNode) || (prevVNodeIsTextNode && (child.flags & 16 /* Text */) > 0)) {
                    _M(child, parentNode, context, isSVG, currentNode, lifecycle);
                }
                else {
                    currentNode = hydrateVNode(child, parentNode, currentNode, context, isSVG, lifecycle);
                    currentNode = currentNode ? currentNode.nextSibling : null;
                }
                prevVNodeIsTextNode = (child.flags & 16 /* Text */) > 0;
            }
        }
        // clear any other DOM nodes, there should be only a single entry for the root
        if ((flags & 8192 /* Fragment */) === 0) {
            let nextSibling = null;
            while (currentNode) {
                nextSibling = currentNode.nextSibling;
                parentNode.removeChild(currentNode);
                currentNode = nextSibling;
            }
        }
    }
    else if (!isNull(parentNode.firstChild) && !isSamePropsInnerHTML(parentNode, props)) {
        parentNode.textContent = ''; // dom has content, but VNode has no children remove everything from DOM
        if (flags & 448 /* FormElement */) {
            // If element is form element, we need to clear defaultValue also
            parentNode.defaultValue = '';
        }
    }
}
function hydrateElement(vNode, parentDOM, dom, context, isSVG, lifecycle) {
    const props = vNode.props;
    const className = vNode.className;
    const flags = vNode.flags;
    const ref = vNode.ref;
    isSVG = isSVG || (flags & 32 /* SvgElement */) > 0;
    if (dom.nodeType !== 1) {
        _ME(vNode, null, context, isSVG, null, lifecycle);
        parentDOM.replaceChild(vNode.dom, dom);
    }
    else {
        vNode.dom = dom;
        hydrateChildren(vNode, dom, dom.firstChild, context, isSVG, lifecycle);
        if (!isNull(props)) {
            _MP(vNode, flags, props, dom, isSVG);
        }
        if (isNullOrUndef(className)) {
            if (dom.className !== '') {
                dom.removeAttribute('class');
            }
        }
        else if (isSVG) {
            dom.setAttribute('class', className);
        }
        else {
            dom.className = className;
        }
        _MR(ref, dom, lifecycle);
    }
    return vNode.dom;
}
function hydrateText(vNode, parentDOM, dom) {
    if (dom.nodeType !== 3) {
        parentDOM.replaceChild((vNode.dom = document.createTextNode(vNode.children)), dom);
    }
    else {
        const text = vNode.children;
        if (dom.nodeValue !== text) {
            dom.nodeValue = text;
        }
        vNode.dom = dom;
    }
    return vNode.dom;
}
function hydrateFragment(vNode, parentDOM, dom, context, isSVG, lifecycle) {
    const children = vNode.children;
    if (vNode.childFlags === 2 /* HasVNodeChildren */) {
        hydrateText(children, parentDOM, dom);
        return children.dom;
    }
    hydrateChildren(vNode, parentDOM, dom, context, isSVG, lifecycle);
    return findLastDOMFromVNode(children[children.length - 1]);
}
function hydrateVNode(vNode, parentDOM, currentDom, context, isSVG, lifecycle) {
    const flags = (vNode.flags |= 16384 /* InUse */);
    if (flags & 14 /* Component */) {
        return hydrateComponent(vNode, parentDOM, currentDom, context, isSVG, (flags & 4 /* ComponentClass */) > 0, lifecycle);
    }
    if (flags & 481 /* Element */) {
        return hydrateElement(vNode, parentDOM, currentDom, context, isSVG, lifecycle);
    }
    if (flags & 16 /* Text */) {
        return hydrateText(vNode, parentDOM, currentDom);
    }
    if (flags & 512 /* Void */) {
        return (vNode.dom = currentDom);
    }
    if (flags & 8192 /* Fragment */) {
        return hydrateFragment(vNode, parentDOM, currentDom, context, isSVG, lifecycle);
    }
    throwError();
    return null;
}
export function hydrate(input, parentDOM, callback) {
    let dom = parentDOM.firstChild;
    if (isNull(dom)) {
        render(input, parentDOM, callback);
    }
    else {
        const lifecycle = [];
        if (!isInvalid(input)) {
            dom = hydrateVNode(input, parentDOM, dom, {}, false, lifecycle);
        }
        // clear any other DOM nodes, there should be only a single entry for the root
        while (dom && (dom = dom.nextSibling)) {
            parentDOM.removeChild(dom);
        }
        if (lifecycle.length > 0) {
            let listener;
            while ((listener = lifecycle.shift()) !== undefined) {
                listener();
            }
        }
    }
    parentDOM.$V = input;
    if (isFunction(callback)) {
        callback();
    }
}
