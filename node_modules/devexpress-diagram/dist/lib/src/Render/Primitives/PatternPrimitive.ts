import { svgNS } from "../RenderHelper";
import { SvgPrimitive } from "./Primitive";
import { ITextMeasurer } from "../Measurer/ITextMeasurer";
import { StyleBase } from "../../Model/Style";

export class PatternPrimitive extends SvgPrimitive<SVGPatternElement> {
    constructor(
        public id: string,
        children: SvgPrimitive<SVGElement>[],
        public x?: number | string,
        public y?: number | string,
        public width?: number | string,
        public height?: number | string,
        style?: StyleBase) {
        super(style);

        this.children = children;
    }
    protected createMainElement(): SVGPatternElement {
        const element = document.createElementNS(svgNS, "pattern");
        element.setAttribute("patternUnits", "userSpaceOnUse");
        element.setAttribute("id", this.id);
        return element;
    }
    applyElementProperties(element: SVGPatternElement, measurer: ITextMeasurer) {
        this.setUnitAttribute(element, "x", this.x);
        this.setUnitAttribute(element, "y", this.y);
        this.setUnitAttribute(element, "width", this.width);
        this.setUnitAttribute(element, "height", this.height);
        this.setPositionCorrectionAttribute(element);

        super.applyElementProperties(element, measurer);
    }
}
