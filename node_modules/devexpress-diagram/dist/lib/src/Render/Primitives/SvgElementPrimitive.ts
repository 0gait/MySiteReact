import { svgNS } from "../RenderHelper";
import { SvgPrimitive } from "./Primitive";
import { ITextMeasurer } from "../Measurer/ITextMeasurer";

export class SvgElementPrimitive extends SvgPrimitive<SVGSVGElement> {
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        public createContent: (container: any, data: any) => void,
        public destroyContent: (container: any) => void,
        public data?: any,
        className?: string,
        onApplyProperties?: (SVGElement) => void) {
        super(null, className, undefined, onApplyProperties);
    }
    protected createMainElement(): SVGSVGElement {
        return document.createElementNS(svgNS, "svg");
    }
    applyElementProperties(element: SVGSVGElement, measurer: ITextMeasurer) {
        this.setUnitAttribute(element, "x", this.x);
        this.setUnitAttribute(element, "y", this.y);
        this.setUnitAttribute(element, "width", this.width);
        this.setUnitAttribute(element, "height", this.height);
        this.setPositionCorrectionAttribute(element);

        super.applyElementProperties(element, measurer);
    }
    createCustomContent(parent: SVGSVGElement) {
        if(this.createContent)
            this.createContent(parent, this.data);
    }
    destroyCustomContent(parent: SVGSVGElement) {
        if(this.destroyContent)
            this.destroyContent(parent);
    }
}
