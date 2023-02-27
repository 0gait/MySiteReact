function getStyleObject(styleText) {
    const style = {
        toString: () => styleText,
    };
    styleText.split(';').forEach((definition) => {
        const [name, value] = definition.split(':');
        if (name && value) {
            style[name.trim()] = value.trim();
        }
    });
    return style;
}
function processStyleAttribute(attributes) {
    if (attributes.style) {
        const styleText = attributes.style.replace(/display: contents[; ]*/, '');
        if (!styleText) {
            delete attributes.style;
            return attributes;
        }
        const style = getStyleObject(styleText);
        return Object.assign(Object.assign({}, attributes), { style });
    }
    return attributes;
}
export function getAttributes(element) {
    const attributes = {};
    Array
        .from(element.nativeElement.attributes)
        .filter(({ name }) => !name.startsWith('ng-reflect'))
        .forEach(({ name, value }) => {
        attributes[name] = value;
    });
    return processStyleAttribute(attributes);
}
