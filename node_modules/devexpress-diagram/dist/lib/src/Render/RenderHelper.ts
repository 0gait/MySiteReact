import { Diagnostics } from "../Diagnostics";

export const svgNS = "http://www.w3.org/2000/svg";

export class RenderHelper {
    public static addEventListener: (element: Element | Window | Document, eventName: string, handler: () => void) => void = (element: Element | Window | Document, eventName: string, handler: () => void) => {
        element.addEventListener(eventName, handler);
    }
    public static removeEventListener: (element: Element | Window | Document, eventName: string, handler: () => void) => void = (element: Element | Window | Document, eventName: string, handler: () => void) => {
        element.removeEventListener(eventName, handler);
    }

    static createSvgElement(parent?: HTMLElement, forExport: boolean = false): SVGSVGElement {
        const svgElement = document.createElementNS(svgNS, "svg");
        svgElement.className.baseVal = "dxdi-canvas" + (forExport ? " export" : "");
        parent && parent.appendChild(svgElement);
        return svgElement;
    }
    static createMainElement(parent?: HTMLElement, forMeasurer: boolean = false): HTMLDivElement {
        const element = document.createElement("div");
        element.setAttribute("class", "dxdi-control" + (forMeasurer ? " measurer" : ""));
        if(Diagnostics.optimizeLayers)
            element.style.transform = "translateZ(0)";
        parent && parent.appendChild(element);
        return element;
    }
}
