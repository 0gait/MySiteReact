import { SvgPrimitive } from "./Primitives/Primitive";
import { ITextMeasurer } from "./Measurer/ITextMeasurer";
import { Diagnostics } from "../Diagnostics";

const RAF_CHANGES_LIMIT = 2000;

export interface IDOMManipulator {
    createElement<TEl extends SVGElement, TPrim extends SvgPrimitive<TEl>>(primitive: TPrim, parent: SVGElement, sibling?: SVGElement): TEl;
    changeChildrenByPrimitives(primitives: SvgPrimitive<SVGElement>[], parent: SVGElement);
    changeByFunc<T>(element: T, func: (el: T) => void);
    changeByPrimitive(element: SVGElement, primitive: SvgPrimitive<SVGElement>);
    cancelAnimation();
}

export class DOMManipulator implements IDOMManipulator {
    private queue: QueueItem[] = [];
    private rafRequested: boolean;
    private rafId: number;

    constructor(public measurer: ITextMeasurer) { }

    createElement<TEl extends SVGElement, TPrim extends SvgPrimitive<TEl>>(primitive: TPrim, parent: SVGElement, sibling?: SVGElement): TEl {
        return primitive.createElement(el => {
            if(parent != null)
                if(sibling !== undefined)
                    parent.insertBefore(el, sibling);
                else
                    parent.appendChild(el);
        });
    }
    changeChildrenByPrimitives(primitives: SvgPrimitive<SVGElement>[], parent: SVGElement) {
        primitives.forEach((primitive, index) => {
            const element = <SVGElement>parent.childNodes[index];
            this.changeByPrimitive(element, primitive);
        });
    }
    changeByFunc<T>(element: T, func: (el: T) => void) {
        this.doChange(element, func);
    }
    changeByPrimitive(element: SVGElement, primitive: SvgPrimitive<SVGElement>) {
        this.doChange(element, primitive);
    }
    cancelAnimation() {
        if(this.rafId !== undefined) {
            cancelAnimationFrame(this.rafId);
            this.queue = [];
        }
    }

    protected doChange<T>(element: T, action: SvgPrimitive<SVGElement> | ((el: T) => void)) {
        if(Diagnostics.optimizeUsingRAF) {
            this.queue.push([element, action]);
            this.requestAnimation();
        }
        else
            this.doChangeSync(element, action);
    }

    protected doChangeSync<T>(element: T, action: SvgPrimitive<SVGElement> | ((el: T) => void)) {
        if(typeof action === "function")
            action(element);
        else
            action.applyElementProperties(<SVGElement><any>element, this.measurer);
    }

    private requestAnimation() {
        if(!this.rafRequested) {
            this.rafRequested = true;
            const func = () => {
                this.queue.splice(0, RAF_CHANGES_LIMIT).forEach(t => this.doChangeSync(t[0], t[1]));
                if(this.queue.length)
                    this.rafId = requestAnimationFrame(func);
                else {
                    this.rafRequested = false;
                    this.rafId = undefined;
                }
            };
            this.rafId = requestAnimationFrame(func);
        }
    }
}

type QueueItem = [any, SvgPrimitive<SVGElement> | ((el: any) => void)];

export class ExportDOMManipulator extends DOMManipulator {
    protected doChange<T>(element: T, action: SvgPrimitive<SVGElement> | ((el: T) => void)) {
        this.doChangeSync(element, action);
    }
}
