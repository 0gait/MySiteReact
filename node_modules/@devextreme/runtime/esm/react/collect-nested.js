var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from 'react';
// eslint-disable-next-line
export function __collectChildren(children) {
    return React.Children.toArray(children).filter((child) => React.isValidElement(child) && typeof child.type !== 'string').reduce((acc, child) => {
        const _a = child.props, { children: childChildren, __defaultNestedValues } = _a, childProps = __rest(_a, ["children", "__defaultNestedValues"]);
        const collectedChildren = __collectChildren(childChildren);
        const childPropsValue = Object.keys(childProps).length
            ? childProps
            : __defaultNestedValues;
        const allChild = Object.assign(Object.assign({}, childPropsValue), collectedChildren);
        return Object.assign(Object.assign({}, acc), { [child.type.propName]: acc[child.type.propName]
                ? [...acc[child.type.propName], allChild]
                : [allChild] });
    }, {});
}
