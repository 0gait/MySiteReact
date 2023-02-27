import { svgNS } from "../RenderHelper";
import { Style } from "../../Model/Style";
import { RectanglePrimitive } from "./RectaglePrimitive";
import { ITextMeasurer } from "../Measurer/ITextMeasurer";

export class RoundedRectanglePrimitive extends RectanglePrimitive {
    constructor(
        public x: number | string,
        public y: number | string,
        public width: number | string,
        public height: number | string,
        public rx: number = 0,
        public ry: number = 0,
        style?: Style,
        className?: string,
        clipPathId?: string,
        onApplyProperties?: (SVGElement) => void) {
        super(x, y, width, height, style, className, clipPathId, onApplyProperties);
    }
    protected createMainElement(): SVGRectElement {
        return document.createElementNS(svgNS, "rect");
    }
    applyElementProperties(element: SVGRectElement, measurer: ITextMeasurer) {
        this.setUnitAttribute(element, "rx", this.rx);
        this.setUnitAttribute(element, "ry", this.ry);

        super.applyElementProperties(element, measurer);
    }
}
