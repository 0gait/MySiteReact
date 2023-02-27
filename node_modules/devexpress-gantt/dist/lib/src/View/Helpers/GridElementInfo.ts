import { Point } from "@devexpress/utils/lib/geometry/point";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Margins } from "@devexpress/utils/lib/geometry/margins";

export class GridElementInfo {
    private static id: number = 0;
    id: number = GridElementInfo.id++;
    position: Point = new Point(undefined, undefined);
    size: Size = new Size(0, 0);
    margins: Margins = new Margins(undefined, undefined, undefined, undefined);
    className: string;
    attr: { [name: string]: any} = {};
    style: { [name: string]: any} = {};
    additionalInfo: Record<string, any> = {};

    constructor(className?: string, position?: Point, size?: Size) {
        if(className)
            this.className = className;
        if(position)
            this.setPosition(position);
        if(size)
            this.setSize(size);
    }

    setSize(size: Size): void {
        this.size.width = size.width;
        this.size.height = size.height;
    }
    setPosition(position: Point): void {
        this.position.x = position.x;
        this.position.y = position.y;
    }
    assignToElement(element: HTMLElement): void {
        this.assignPosition(element);
        this.assignSize(element);
        this.assignMargins(element);
        if(this.className)
            element.className = this.className;
    }
    assignPosition(element: HTMLElement): void {
        if(this.position.x != null)
            element.style.left = this.position.x + "px";
        if(this.position.y != null)
            element.style.top = this.position.y + "px";
    }
    assignSize(element: HTMLElement): void {
        if(this.size.width)
            element.style.width = this.size.width + "px";
        if(this.size.height)
            element.style.height = this.size.height + "px";
    }
    assignMargins(element: HTMLElement): void {
        if(this.margins.left)
            element.style.marginLeft = this.margins.left + "px";
        if(this.margins.top)
            element.style.marginTop = this.margins.top + "px";
        if(this.margins.right)
            element.style.marginRight = this.margins.right + "px";
        if(this.margins.bottom)
            element.style.marginBottom = this.margins.bottom + "px";
    }
    setAttribute(name: string, value: any): void {
        this.attr[name] = value;
    }
}
