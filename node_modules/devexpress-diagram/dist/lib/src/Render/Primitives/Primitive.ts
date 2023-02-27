import { StyleBase } from "../../Model/Style";
import { RenderUtils } from "../Utils";
import { ITextMeasurer } from "../Measurer/ITextMeasurer";
import { PrimitiveObject } from "./PrimitiveObject";

export abstract class SvgPrimitive<T extends SVGElement> extends PrimitiveObject {
    protected children: SvgPrimitive<SVGElement>[] = [];

    constructor(
        style?: StyleBase,
        public className?: string,
        public clipPathId?: string,
        public onApplyProperties?: (SVGElement) => void) {
        super(style);
    }

    protected abstract createMainElement(): T;

    createElement(insertInDOM: (el: T) => void): T {
        const el = this.createMainElement();
        this.createChildElements(el);
        insertInDOM(el);
        this.createCustomContent(el);
        return el;
    }
    createChildElements(parent: T) {
        for(let i = 0; i < this.children.length; i++)
            this.children[i].createElement(el => parent.appendChild(el));
    }
    applyElementProperties(element: T, measurer: ITextMeasurer) {
        this.applyElementStyleProperties(element);

        if(this.className)
            element.setAttribute("class", this.className);
        if(typeof this.clipPathId === "string")
            if(this.clipPathId)
                element.setAttribute("clip-path", RenderUtils.getUrlPathById(this.clipPathId));
            else
                element.removeAttribute("clip-path");

        if(this.onApplyProperties)
            this.onApplyProperties(element);

        this.applyChildrenProperties(element, measurer);
    }
    protected applyChildrenProperties(element: T, measurer: ITextMeasurer) {
        for(let i = 0; i < this.children.length; i++)
            this.children[i].applyElementProperties(<SVGElement>element.childNodes[i], measurer);
    }
    protected applyElementStyleProperties(element: T) {
        this.applyElementStylePropertiesCore(element);
    }
    protected applyElementStylePropertiesCore(element: T, reverseTextAnchor: boolean = false) {
        if(this.style)
            RenderUtils.applyStyleToElement(this.style, element, reverseTextAnchor);
    }
    createCustomContent(parent: T) {
    }
    destroyCustomContent(parent: T) {
    }

    dispose() {
        if(this.children)
            this.children.forEach(primitive => primitive.dispose());

    }
}
