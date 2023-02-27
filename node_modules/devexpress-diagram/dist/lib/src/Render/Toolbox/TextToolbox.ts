import { ToolboxDraggingObject, Toolbox } from "./Toolbox";
import { IShapeDescriptionManager } from "../../Model/Shapes/Descriptions/ShapeDescriptionManager";

export class TextToolbox extends Toolbox {
    constructor(parent: HTMLElement, readOnly: boolean, allowDragging: boolean,
        shapeDescriptionManager: IShapeDescriptionManager,
        shapeTypes: string[], getAllowedShapeTypes: (shapes: string[]) => string[]) {
        super(parent, readOnly, allowDragging, shapeDescriptionManager, shapeTypes, getAllowedShapeTypes);
    }

    createElements(element: HTMLElement, shapeTypes: string[]) {
        shapeTypes.forEach(shapeType => {
            const description = this.shapeDescriptionManager.get(shapeType);
            const itemEl = document.createElement("div");
            itemEl.setAttribute("class", "toolbox-text-item");
            itemEl.setAttribute("data-tb-type", shapeType);
            itemEl.textContent = description.getDefaultText() || description.getTitle();
            element.appendChild(itemEl);
        });
    }
    protected createDraggingElement(draggingObject: ToolboxDraggingObject): HTMLElement {
        const element = document.createElement("DIV");
        element.setAttribute("class", "dxdi-toolbox-drag-text-item");
        const shapeDescription = this.shapeDescriptionManager.get(draggingObject.evt.data);
        element.textContent = shapeDescription.getDefaultText() || shapeDescription.getTitle();
        document.body.appendChild(element);
        return element;
    }
}
