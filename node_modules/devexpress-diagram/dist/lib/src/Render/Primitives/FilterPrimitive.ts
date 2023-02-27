import { svgNS } from "../RenderHelper";
import { SvgPrimitive } from "./Primitive";
import { ITextMeasurer } from "../Measurer/ITextMeasurer";

export class FilterPrimitive extends SvgPrimitive<SVGFilterElement> {
    constructor(
        public id: string,
        public x?: number | string,
        public y?: number | string,
        public width?: number | string,
        public height?: number | string) {
        super();

    }
    protected createMainElement(): SVGFilterElement {
        const element = document.createElementNS(svgNS, "filter");
        element.setAttribute("id", this.id);
        return element;
    }
    applyElementProperties(element: SVGFilterElement, measurer: ITextMeasurer) {
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
