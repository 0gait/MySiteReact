import { svgNS } from "../RenderHelper";
import { SvgPrimitive } from "./Primitive";
import { Style } from "../../Model/Style";
import { ITextMeasurer } from "../Measurer/ITextMeasurer";

export class ImagePrimitive extends SvgPrimitive<SVGImageElement> {
    constructor(
        public x: number | string,
        public y: number | string,
        public width: number | string,
        public height: number | string,
        public url: string,
        public preserveAspectRatio: string = "none",
        style?: Style,
        className?: string) {
        super(style, className);
    }
    protected createMainElement(): SVGImageElement {
        return document.createElementNS(svgNS, "image");
    }
    applyElementProperties(element: SVGImageElement, measurer: ITextMeasurer) {
        this.setUnitAttribute(element, "x", this.x);
        this.setUnitAttribute(element, "y", this.y);
        this.setUnitAttribute(element, "width", this.width);
        this.setUnitAttribute(element, "height", this.height);
        this.setPositionCorrectionAttribute(element);

        element.setAttribute("href", this.url);
        element.setAttribute("preserveAspectRatio", this.preserveAspectRatio);

        super.applyElementProperties(element, measurer);
    }
}
