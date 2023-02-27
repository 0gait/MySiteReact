import { FilterPrimitive } from "./FilterPrimitive";
import { svgNS } from "../RenderHelper";

export class ShadowFilterPrimitive extends FilterPrimitive {
    createChildElements(parent: SVGFilterElement) {
        const feGaussianBlur = document.createElementNS(svgNS, "feGaussianBlur");
        feGaussianBlur.setAttribute("in", "SourceGraphic");
        feGaussianBlur.setAttribute("stdDeviation", "4.6");
        parent.appendChild(feGaussianBlur);

        const feOffset = document.createElementNS(svgNS, "feOffset");
        feOffset.setAttribute("dx", "0");
        feOffset.setAttribute("dy", "0");
        parent.appendChild(feOffset);

        const feMerge = document.createElementNS(svgNS, "feMerge");
        parent.appendChild(feMerge);

        const feMergeNode1 = document.createElementNS(svgNS, "feMergeNode");
        feMerge.appendChild(feMergeNode1);
        const feMergeNode2 = document.createElementNS(svgNS, "feMergeNode");
        feMergeNode2.setAttribute("in", "SourceGraphic");
        feMerge.appendChild(feMergeNode2);
    }
}
