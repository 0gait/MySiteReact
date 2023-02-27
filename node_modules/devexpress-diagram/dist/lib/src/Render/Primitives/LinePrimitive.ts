import { svgNS } from "../RenderHelper";
import { SvgPrimitive } from "./Primitive";
import { Style } from "../../Model/Style";
import { ITextMeasurer } from "../Measurer/ITextMeasurer";

export class LinePrimitive extends SvgPrimitive<SVGLineElement> {
    constructor(
        public x1: number | string,
        public y1: number | string,
        public x2: number | string,
        public y2: number | string,
        style?: Style,
        className?: string,
        clipPathId?: string,
        onApplyProperties?: (SVGElement) => void) {
        super(style, className, clipPathId, onApplyProperties);

    }
    protected createMainElement(): SVGLineElement {
        return document.createElementNS(svgNS, "line");
    }
    applyElementProperties(element: SVGLineElement, measurer: ITextMeasurer) {
        this.setUnitAttribute(element, "x1", this.x1);
        this.setUnitAttribute(element, "y1", this.y1);
        this.setUnitAttribute(element, "x2", this.x2);
        this.setUnitAttribute(element, "y2", this.y2);
        this.setPositionCorrectionAttribute(element);

        super.applyElementProperties(element, measurer);
    }
}
