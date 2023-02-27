import { StyleBase } from "../../Model/Style";
import { UnitConverter } from "@devexpress/utils/lib/class/unit-converter";

export abstract class PrimitiveObject {
    constructor(
        public style?: StyleBase) {
    }

    get strokeWidthPx() {
        return this.style ? this.style.strokeWidthPx : 0;
    }
    get strokeOffset() {
        return this.style ? this.style.strokeOffset : 0;
    }

    getUnitVaue(value: number | string): string {
        return typeof value === "number" ? UnitConverter.twipsToPixels(value).toString() : value;
    }
    setUnitAttribute(element: SVGElement, key: string, value: number | string) {
        if(value === undefined || value === null) return;

        element.setAttribute(key, this.getUnitVaue(value));
    }
    protected setPositionCorrectionAttribute(element: SVGElement) {
        const transformAttr = this.strokeWidthPx % 2 === 1 ? "translate(" + this.strokeOffset + ", " + this.strokeOffset + ")" : "";
        element.setAttribute("transform", transformAttr);
    }
}
