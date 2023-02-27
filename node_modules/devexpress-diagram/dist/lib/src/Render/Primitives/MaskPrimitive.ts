import { svgNS } from "../RenderHelper";
import { SvgPrimitive } from "./Primitive";
import { ITextMeasurer } from "../Measurer/ITextMeasurer";

export class MaskPrimitive extends SvgPrimitive<SVGMaskElement> {
    constructor(
        public id: string,
        children: SvgPrimitive<SVGElement>[],
        className?: string,
        public x?: number | string,
        public y?: number | string,
        public width?: number | string,
        public height?: number | string) {
        super(null, className);

        this.children = children;
    }
    protected createMainElement(): SVGMaskElement {
        const element = document.createElementNS(svgNS, "mask");
        element.setAttribute("id", this.id);
        return element;
    }
    applyElementProperties(element: SVGMaskElement, measurer: ITextMeasurer) {
        if(this.id)
            element.setAttribute("id", this.id);

        this.setUnitAttribute(element, "x", this.x);
        this.setUnitAttribute(element, "y", this.y);
        this.setUnitAttribute(element, "width", this.width);
        this.setUnitAttribute(element, "height", this.height);
        this.setPositionCorrectionAttribute(element);

        super.applyElementProperties(element, measurer);
    }
}
