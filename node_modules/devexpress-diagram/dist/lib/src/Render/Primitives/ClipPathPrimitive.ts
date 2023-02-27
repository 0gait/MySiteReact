import { svgNS } from "../RenderHelper";
import { SvgPrimitive } from "./Primitive";
import { ITextMeasurer } from "../Measurer/ITextMeasurer";

export class ClipPathPrimitive extends SvgPrimitive<SVGClipPathElement> {
    constructor(
        public id: string,
        children: SvgPrimitive<SVGElement>[]) {
        super();

        this.children = children;
    }
    protected createMainElement(): SVGClipPathElement {
        const element = document.createElementNS(svgNS, "clipPath");
        element.setAttribute("id", this.id);
        return element;
    }
    applyElementProperties(element: SVGClipPathElement, measurer: ITextMeasurer) {
        if(this.id)
            element.setAttribute("id", this.id);
        super.applyElementProperties(element, measurer);
    }
}
