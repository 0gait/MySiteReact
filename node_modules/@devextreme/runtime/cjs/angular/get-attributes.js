"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
function getStyleObject(styleText) {
    var style = {
        toString: function () { return styleText; },
    };
    styleText.split(';').forEach(function (definition) {
        var _a = __read(definition.split(':'), 2), name = _a[0], value = _a[1];
        if (name && value) {
            style[name.trim()] = value.trim();
        }
    });
    return style;
}
function processStyleAttribute(attributes) {
    if (attributes.style) {
        var styleText = attributes.style.replace(/display: contents[; ]*/, '');
        if (!styleText) {
            delete attributes.style;
            return attributes;
        }
        var style = getStyleObject(styleText);
        return __assign(__assign({}, attributes), { style: style });
    }
    return attributes;
}
function getAttributes(element) {
    var attributes = {};
    Array
        .from(element.nativeElement.attributes)
        .filter(function (_a) {
        var name = _a.name;
        return !name.startsWith('ng-reflect');
    })
        .forEach(function (_a) {
        var name = _a.name, value = _a.value;
        attributes[name] = value;
    });
    return processStyleAttribute(attributes);
}
exports.getAttributes = getAttributes;
