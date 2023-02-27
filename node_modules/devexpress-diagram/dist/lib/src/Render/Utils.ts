import { MouseEventElementType, MouseEventSource, DiagramEvent } from "../Events/Event";
import { ItemKey } from "../Model/DiagramItem";
import { StyleBase } from "../Model/Style";
import { MathUtils } from "@devexpress/utils/lib/utils/math";

export class RenderUtils {
    static updateSvgElementSize(svgElement: SVGElement, width: number, height: number, forExport?: boolean) {
        svgElement.style.width = width + "px";
        svgElement.style.height = height + "px";
        svgElement.setAttribute("viewBox", "0 0 " + width + " " + height);
        if(forExport) {
            svgElement.setAttribute("width", width.toString());
            svgElement.setAttribute("height", height.toString());
        }
    }
    static removeElement(element: Element) {
        element && element.parentNode && element.parentNode.removeChild(element);
    }
    static removeContent(element: Element) {
        while(element && element.firstChild)
            element.removeChild(element.firstChild);
    }
    static setElementEventData(element: SVGElement, type: MouseEventElementType, key?: ItemKey, value?: any) {
        if(type === MouseEventElementType.Undefined) return;

        element.setAttribute("data-type", type.toString());
        if(key !== undefined)
            element.setAttribute("data-key", key.toString());
        if(value !== undefined)
            element.setAttribute("data-value", value.toString());
    }
    static getElementEventData(element: HTMLElement): MouseEventSource {
        if(element.getAttribute && element.getAttribute("data-type"))
            return new MouseEventSource(
                parseInt(element.getAttribute("data-type")),
                element.getAttribute("data-key"),
                element.getAttribute("data-value")
            );

        const className = element.getAttribute && element.getAttribute("class");
        if(className === "dxdi-page" || className === "dxdi-main")
            return new MouseEventSource(MouseEventElementType.Document);
    }
    private static getHtmlElementStylePropertyName(propertyName: string) {
        switch(propertyName) {
            case "fill":
                return "color";
            case "text-anchor":
                return "text-align";
        }
        return propertyName;
    }
    private static getTextAnchorValue(propertyValue: string, reverseTextAnchor: boolean = false): string {
        if(reverseTextAnchor) {
            if(propertyValue === "start")
                return "end";
            if(propertyValue === "end")
                return "start";
        }
        return propertyValue;
    }
    private static getStrokeDasharrayValue(propertyValue: string, strokeWidth: number): string {
        if(strokeWidth) {
            const dashArray = propertyValue && propertyValue.toString();
            const dashArrayParts = dashArray ? dashArray.split(/[\s,]+/) : [];
            return dashArrayParts.map(v => parseInt(v) / 2 * strokeWidth).join(",");
        }
        return propertyValue;
    }
    static applyStyleToElement(style: StyleBase, element: HTMLElement | SVGElement, reverseTextAnchor: boolean = false) {
        const defaultStyle = style.getDefaultInstance();
        style.forEach(propertyName => {
            let propertyValue = style[propertyName];
            const elPropertyName = (element instanceof HTMLElement) ? this.getHtmlElementStylePropertyName(propertyName) : propertyName;
            if(propertyValue !== undefined && propertyValue !== "" && propertyValue !== defaultStyle[propertyName]) {
                switch(propertyName) {
                    case "text-anchor":
                        propertyValue = this.getTextAnchorValue(propertyValue, reverseTextAnchor);
                        break;
                    case "stroke-dasharray":
                        propertyValue = this.getStrokeDasharrayValue(propertyValue, parseInt(style["stroke-width"]));
                        break;
                }
                element.style.setProperty(elPropertyName, propertyValue);
            }
            else
                element.style.setProperty(elPropertyName, "");
        });
    }
    static generateSvgElementId(prefix: string) {
        return prefix + "_" + MathUtils.generateGuid();
    }
    static getUrlPathById(id: string) {
        return "url(#" + id + ")";
    }
}

export function raiseEvent<T extends DiagramEvent>(evt: Event, _evt: T, raiseFunc: (_evt: T) => void) {
    raiseFunc(_evt);
    if(_evt.preventDefault)
        evt.preventDefault();
}
