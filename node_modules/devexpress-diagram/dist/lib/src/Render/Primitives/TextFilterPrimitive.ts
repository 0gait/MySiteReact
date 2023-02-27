import { svgNS } from "../RenderHelper";
import { FilterPrimitive } from "./FilterPrimitive";
import { DiagramModel } from "../../Model/Model";
import { ColorUtils } from "@devexpress/utils/lib/utils/color";

export class TextFilterPrimitive extends FilterPrimitive {
    constructor(
        public id: string,
        public x: number | string = "-0.05",
        public y: number | string = "-0.05",
        public width: number | string = "1.1",
        public height: number | string = "1.1") {
        super(id, x, y, width, height);

    }
    createChildElements(parent: SVGFilterElement) {
        const feFlood = document.createElementNS(svgNS, "feFlood");
        parent.appendChild(feFlood);

        const feComposite = document.createElementNS(svgNS, "feComposite");
        feComposite.setAttribute("in", "SourceGraphic");
        feComposite.setAttribute("operator", "atop");
        parent.appendChild(feComposite);
    }
}

export class TextFloodFilterPrimitive extends TextFilterPrimitive {
    constructor(
        public id: string,
        public floodColor: number,
        public x: number | string = "-0.05",
        public y: number | string = "-0.05",
        public width: number | string = "1.1",
        public height: number | string = "1.1") {
        super(id, x, y, width, height);

    }
    applyChildrenProperties(element: SVGFilterElement) {
        for(let child: Node, i = 0; child = element.childNodes[i]; i++)
            if(child.nodeName && child.nodeName.toUpperCase() === "FEFLOOD") {
                this.prepareFEFloodNode(<SVGFEFloodElement>child);
                break;
            }

    }
    protected prepareFEFloodNode(node: SVGFEFloodElement) {
        const colorHash = ColorUtils.colorToHash(this.floodColor);
        node.setAttribute("flood-color", colorHash);
        node.setAttribute("class", "text-filter-flood");
        if(this.floodColor !== DiagramModel.defaultPageColor)
            node.style.setProperty("flood-color", colorHash);
        else
            node.style.setProperty("flood-color", "");
    }
}
