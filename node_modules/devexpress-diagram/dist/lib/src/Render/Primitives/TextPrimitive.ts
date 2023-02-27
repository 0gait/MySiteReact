import { UnitConverter } from "@devexpress/utils/lib/class/unit-converter";
import { svgNS } from "../RenderHelper";
import { SvgPrimitive } from "./Primitive";
import { TextStyle } from "../../Model/Style";
import { RenderUtils } from "../Utils";
import { ITextMeasurer, TextOwner } from "../Measurer/ITextMeasurer";
import { wordsByLines, textToParagraphs, LINE_HEIGHT, textToWords } from "../../Utils/TextUtils";

export enum TextAngle { Angle0deg = 0, Angle90deg = 90, Angle180deg = 180, Angle270deg = 270 }

export class TextPrimitive extends SvgPrimitive<SVGTextElement> {
    filterId: string;
    private textSegmens: string[];

    private renderHelper: TextPrimitiveRenderHelper;

    static readonly baselineCorrection = 0.35;

    constructor(
        public x: number,
        public y: number,
        public text: string,
        public owner: TextOwner,
        public textWidth?: number,
        public textHeight?: number,
        public textSpacing?: number,
        style?: TextStyle,
        public reverseTextAhchor?: boolean,
        clipPathId?: string,
        filterId?: string,
        public angle?: TextAngle,
        onApplyProperties?: (SVGElement) => void) {
        super(style, "", clipPathId, onApplyProperties);

        this.filterId = filterId;

        this.textSegmens = textToParagraphs(this.text);
        this.renderHelper = this.createRenderHelper();

        if(this.textWidth !== undefined && this.textWidth !== undefined) {
            this.x = this.renderHelper.getTextX(this.x);
            this.y = this.renderHelper.getTextY(this.y);
        }
    }

    protected createMainElement(): SVGTextElement {
        return document.createElementNS(svgNS, "text");
    }
    applyElementProperties(element: SVGTextElement, measurer: ITextMeasurer) {
        this.setUnitAttribute(element, "x", this.x);
        this.setUnitAttribute(element, "y", this.y);

        if(this.filterId)
            element.setAttribute("filter", RenderUtils.getUrlPathById(this.filterId));

        super.applyElementProperties(element, measurer);

        if(element.getAttribute("appliedText") !== this.text || element.getAttribute("appliedSize") !== (this.fitToSize && this.fitToSize.toString())) {
            this.createTSpanElements(element, measurer);
            element.setAttribute("appliedText", this.text);
            element.setAttribute("appliedSize", (this.fitToSize && this.fitToSize.toString()));
        }
        else
            this.prepareTSpanElements(element);

        this.renderHelper.prepareMainElement(element, this.x, this.y);
    }
    private createTSpanElements(element: SVGTextElement, measurer: ITextMeasurer) {
        RenderUtils.removeContent(element);

        this.textSegmens.forEach((txt, index) => {
            if(!txt && this.textSegmens.length > 1) {
                const span = this.createTSpanElement(element);
                span.textContent = " ";
            }
            else if(this.fitToSize) {
                const words = textToWords(txt);
                const lines = wordsByLines(UnitConverter.twipsToPixels(this.fitToSize), words, () => measurer.measureWords(words, this.style, this.owner));
                lines.forEach(line => {
                    const span = this.createTSpanElement(element);
                    span.textContent = line;
                });
                if(!lines.length) {
                    const span = this.createTSpanElement(element);
                    span.textContent = " ";
                }
            }
            else {
                const tSpan = this.createTSpanElement(element);
                tSpan.textContent = txt;
            }
        });

        const firstTSpan = <SVGTSpanElement>element.firstChild;
        if(firstTSpan) this.prepareFirstTSpanElement(firstTSpan, element.childNodes.length);
    }

    protected createTSpanElement(parent: SVGTextElement): SVGTSpanElement {
        const tSpan = document.createElementNS(svgNS, "tspan");
        parent.appendChild(tSpan);

        this.prepareTSpanElement(tSpan);

        return tSpan;
    }
    protected prepareTSpanElements(element: SVGTextElement) {
        for(let i = 0; i < element.childNodes.length; i++) {
            const tSpan = <SVGTSpanElement>element.childNodes[i];
            this.prepareTSpanElement(tSpan);
        }
        const firstTSpan = <SVGTSpanElement>element.firstChild;
        if(firstTSpan) this.prepareFirstTSpanElement(firstTSpan, element.childNodes.length);
    }
    private prepareTSpanElement(tSpan: SVGTSpanElement) {
        this.renderHelper.prepareTSpanElement(tSpan, this.x, this.y);
    }
    protected prepareFirstTSpanElement(tSpan: SVGTSpanElement, lineCount: number) {
        this.renderHelper.prepareFirstTSpanElement(tSpan, lineCount);
    }
    protected applyElementStyleProperties(element: SVGTextElement) {
        this.applyElementStylePropertiesCore(element, this.reverseTextAhchor);
    }

    private get fitToSize() { return this.renderHelper.fitToSize; }
    private createRenderHelper() {
        switch(this.angle) {
            case TextAngle.Angle90deg:
                return new TextPrimitive90degRenderHelper(this);
            case TextAngle.Angle180deg:
                return new TextPrimitive180degRenderHelper(this);
            case TextAngle.Angle270deg:
                return new TextPrimitive270degRenderHelper(this);
            default:
                return new TextPrimitiveRenderHelper(this);
        }
    }
}

export class TextPrimitiveRenderHelper {
    constructor(public primitive: TextPrimitive) {
    }

    get textWidth(): number { return this.primitive.textWidth; }
    get textHeight(): number { return this.primitive.textHeight; }
    get fitToSize(): number { return this.textWidth; }
    get textAnchor(): string { return this.primitive.style["text-anchor"]; }
    get textSpacing(): number { return this.primitive.textSpacing; }
    get angle(): number { return undefined; }
    get needRotation(): boolean { return false; }

    prepareMainElement(element: SVGTextElement, x: number, y: number) {
        if(this.needRotation)
            element.setAttribute("transform", "rotate(" + this.angle + ", " +
                UnitConverter.twipsToPixels(x) + ", " + UnitConverter.twipsToPixels(y) + ")");

    }
    prepareTSpanElement(tSpan: SVGTSpanElement, x: number, y: number) {
        this.primitive.setUnitAttribute(tSpan, "x", x);
        tSpan.setAttribute("dy", LINE_HEIGHT + "em");
    }
    prepareFirstTSpanElement(tSpan: SVGTSpanElement, lineCount: number) {
        const dy = -((lineCount - 1) / 2) + TextPrimitive.baselineCorrection;
        tSpan.setAttribute("dy", dy.toFixed(2) + "em");
    }
    getTextX(x: number): number {
        if(!this.textAnchor || this.textAnchor === "middle")
            return x + this.textWidth / 2;
        else if(this.textAnchor === "end")
            return x + this.textWidth - this.textSpacing;
        else if(this.textAnchor === "start")
            return x + this.textSpacing;
        return x;
    }
    getTextY(y: number): number {
        return y + this.textHeight / 2;
    }
    protected setUnitAttribute(element: SVGElement, key: string, value: number | string) {
        this.primitive.setUnitAttribute(element, key, value);
    }
}

export class TextPrimitive90degRenderHelper extends TextPrimitiveRenderHelper {
    constructor(primitive: TextPrimitive) {
        super(primitive);
    }

    get fitToSize(): number { return this.textHeight; }
    get angle(): number { return 90; }
    get needRotation(): boolean { return true; }

    getTextX(x: number): number {
        return x + this.textWidth / 2;
    }
    getTextY(y: number): number {
        if(!this.textAnchor || this.textAnchor === "middle")
            return y + this.textHeight / 2;
        else if(this.textAnchor === "end")
            return y + this.textHeight - this.textSpacing;
        else if(this.textAnchor === "start")
            return y + this.textSpacing;
        return y;
    }
}

export class TextPrimitive180degRenderHelper extends TextPrimitiveRenderHelper {
    constructor(primitive: TextPrimitive) {
        super(primitive);
    }

    get angle(): number { return 180; }
    get needRotation(): boolean { return true; }

    getTextX(x: number): number {
        if(!this.textAnchor || this.textAnchor === "middle")
            return x + this.textWidth / 2;
        else if(this.textAnchor === "start")
            return x + this.textWidth - this.textSpacing;
        else if(this.textAnchor === "end")
            return x + this.textSpacing;
        return x;
    }
}

export class TextPrimitive270degRenderHelper extends TextPrimitive90degRenderHelper {
    constructor(primitive: TextPrimitive) {
        super(primitive);
    }

    get angle(): number { return 270; }

    getTextY(y: number): number {
        if(!this.textAnchor || this.textAnchor === "middle")
            return y + this.textHeight / 2;
        else if(this.textAnchor === "start")
            return y + this.textHeight - this.textSpacing;
        else if(this.textAnchor === "end")
            return y + this.textSpacing;
        return y;
    }
}
