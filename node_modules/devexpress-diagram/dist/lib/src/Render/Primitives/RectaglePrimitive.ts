import { svgNS } from "../RenderHelper";
import { SvgPrimitive } from "./Primitive";
import { Style } from "../../Model/Style";
import { ITextMeasurer } from "../Measurer/ITextMeasurer";

export class RectanglePrimitive extends SvgPrimitive<SVGRectElement> {
    constructor(
        public x: number | string,
        public y: number | string,
        public width: number | string,
        public height: number | string,
        style?: Style,
        className?: string,
        clipPathId?: string,
        onApplyProperties?: (SVGElement) => void) {
        super(style, className, clipPathId, onApplyProperties);
    }
    protected createMainElement(): SVGRectElement {
        return document.createElementNS(svgNS, "rect");
    }
    applyElementProperties(element: SVGRectElement, measurer: ITextMeasurer) {
        this.setUnitAttribute(element, "x", this.x);
        this.setUnitAttribute(element, "y", this.y);
        this.setUnitAttribute(element, "width", this.width);
        this.setUnitAttribute(element, "height", this.height);
        this.setPositionCorrectionAttribute(element);

        super.applyElementProperties(element, measurer);
    }
}
