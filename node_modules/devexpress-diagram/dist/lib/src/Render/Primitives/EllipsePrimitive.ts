import { svgNS } from "../RenderHelper";
import { SvgPrimitive } from "./Primitive";
import { Style } from "../../Model/Style";
import { ITextMeasurer } from "../Measurer/ITextMeasurer";

export class EllipsePrimitive extends SvgPrimitive<SVGEllipseElement> {
    constructor(
        public cx: number | string,
        public cy: number | string,
        public rx: number | string,
        public ry: number | string,
        style?: Style,
        className?: string,
        onApplyProperties?: (SVGElement) => void) {
        super(style, className, undefined, onApplyProperties);

    }
    protected createMainElement(): SVGEllipseElement {
        return document.createElementNS(svgNS, "ellipse");
    }
    applyElementProperties(element: SVGEllipseElement, measurer: ITextMeasurer) {
        this.setUnitAttribute(element, "cx", this.cx);
        this.setUnitAttribute(element, "cy", this.cy);
        this.setUnitAttribute(element, "rx", this.rx);
        this.setUnitAttribute(element, "ry", this.ry);
        this.setPositionCorrectionAttribute(element);

        super.applyElementProperties(element, measurer);
    }
}
