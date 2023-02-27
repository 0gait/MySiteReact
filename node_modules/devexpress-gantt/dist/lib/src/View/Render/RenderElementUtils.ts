import { GridElementInfo } from "../Helpers/GridElementInfo";

export class RenderElementUtils {

    static create(info: GridElementInfo, index: number, parent: HTMLElement, dictionary?: any): HTMLElement {
        const element = document.createElement("DIV");
        info.assignToElement(element);
        parent.appendChild(element);
        if(dictionary)
            if(dictionary instanceof Array && index !== null)
                dictionary[index] = element;
            else
                dictionary[info.id] = element;

        for(const key in info.attr)
            if(Object.prototype.hasOwnProperty.call(info.attr, key))
                element.setAttribute(key, info.attr[key]);


        for(const key in info.style)
            if(Object.prototype.hasOwnProperty.call(info.style, key))
                element.style[key] = info.style[key];


        return element;
    }

    static remove(info: GridElementInfo, index: number, parent: HTMLElement, dictionary: any): void {
        let element;
        if(dictionary instanceof Array && index !== null) {
            element = dictionary[index];
            delete dictionary[index];
        }
        else {
            element = dictionary[info.id];
            delete dictionary[info.id];
        }
        if(element && element.parentNode == parent)
            parent.removeChild(element);
    }

    static recreate(oldRenderedElementsInfo: Array<any>, newRenderedelementsInfo: Array<any>,
        removeAction: (info: any) => void, createAction: (info: any) => void): void {

        oldRenderedElementsInfo
            .filter(info => { return newRenderedelementsInfo.indexOf(info) === -1; })
            .forEach((info) => { removeAction(info); });
        newRenderedelementsInfo
            .filter(info => { return oldRenderedElementsInfo.indexOf(info) === -1; })
            .forEach(info => { createAction(info); });
    }
}
