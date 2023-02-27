import { svgNS } from "../RenderHelper";
import { SvgPrimitive } from "./Primitive";
import { ITextMeasurer } from "../Measurer/ITextMeasurer";

export class GroupPrimitive extends SvgPrimitive<SVGGElement> {
    constructor(
        children: SvgPrimitive<SVGElement>[],
        className?: string,
        public zIndex?: number,
        clipPathId?: string,
        onApplyProperties?: (SVGElement) => void,
        public onBeforeDispose?: () => void
    ) {
        super(null, className, clipPathId, onApplyProperties);

        this.children = children;
    }
    protected createMainElement(): SVGGElement {
        return document.createElementNS(svgNS, "g");
    }
    applyElementProperties(element: SVGGElement, measurer: ITextMeasurer) {
        if(this.zIndex || this.zIndex === 0)
            element.style.setProperty("z-index", this.zIndex.toString());

        super.applyElementProperties(element, measurer);
    }
    dispose() {
        if(this.onBeforeDispose)
            this.onBeforeDispose();
        super.dispose();
    }
}
