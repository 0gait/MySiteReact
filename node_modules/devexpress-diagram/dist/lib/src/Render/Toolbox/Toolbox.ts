import { EventDispatcher, HtmlFocusUtils, EventUtils } from "../../Utils";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { EvtUtils } from "@devexpress/utils/lib/utils/evt";
import { SetAbsoluteX, SetAbsoluteY } from "../../Utils/Data";
import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { IReadOnlyChangesListener } from "../../Settings";
import { IShapeDescriptionManager } from "../../Model/Shapes/Descriptions/ShapeDescriptionManager";
import { Browser } from "@devexpress/utils/lib/browser";
import { RenderHelper } from "../RenderHelper";
import { NOT_VALID_CSSCLASS } from "../CanvasItemsManager";
import { ITextMeasurer } from "../Measurer/ITextMeasurer";

export interface IToolboxDragListener {
    notifyToolboxDragStart(evt: MouseEvent);
    notifyToolboxDragEnd(evt: MouseEvent);
    notifyToolboxDraggingMouseMove(evt: MouseEvent);
}

export interface IToolboxClickListener {
    notifyToolboxClick(shapeType: string);
}

const TOOLBOX_CSSCLASS = "dxdi-toolbox";
const DRAG_CAPTURED_CSSCLASS = "dxdi-tb-drag-captured";
const START_DRAG_CSSCLASS = "dxdi-tb-start-drag-flag";
const TOUCH_DRAGTIMEOUT_MS = 800;

export abstract class Toolbox implements IReadOnlyChangesListener {
    private dragStartPoint: Point;
    private dragStartShapeType: string;
    private mouseDownShapeType: string;
    private touchDownPoint: Point; 
    measurer: ITextMeasurer;
    private mainElement: HTMLDivElement;

    private mouseDownEventName: string;
    private mouseMoveEventName: string;
    private mouseUpEventName: string;

    private onElementMouseDownHandler: any;
    private onElementMouseUpHandler: any;
    private onMouseDownHandler: any;
    private onMouseMoveHandler: any;
    private onMouseUpHandler: any;
    private onDragStartHandler: any;
    private onTouchMoveHandler: any;

    private dragPrepareTimeout: number = -1;
    private dragPrepareEvent: MouseEvent;

    protected dragState: number = DragState.None;
    private emulateDragEvents = Browser.WebKitTouchUI;

    draggingObject: ToolboxDraggingObject;
    onDragOperation: EventDispatcher<IToolboxDragListener> = new EventDispatcher();
    onClickOperation: EventDispatcher<IToolboxClickListener> = new EventDispatcher();

    constructor(parent: HTMLElement,
        protected readOnly: boolean,
        protected allowDragging: boolean,
        protected shapeDescriptionManager: IShapeDescriptionManager,
        protected shapeTypes: string[],
        protected getAllowedShapeTypes: (shapes: string[]) => string[]) {
        if(!parent) return;

        this.mainElement = this.createMainElement(parent);
        this.attachHandlers(this.mainElement);
    }

    clean(removeElement?: (element: HTMLElement) => void) {
        this.detachHandlers(this.mainElement);
        if(removeElement)
            removeElement(this.mainElement);
    }

    private createMainElement(parent: HTMLElement): HTMLDivElement {
        const element = document.createElement("div");
        element.setAttribute("class", TOOLBOX_CSSCLASS);
        element.draggable = true;
        if(this.emulateDragEvents)
            element.tabIndex = 0;
        parent.appendChild(element);
        return element;
    }
    private attachHandlers(element: HTMLElement) {
        this.onElementMouseDownHandler = this.onElementMouseDown.bind(this);
        this.onElementMouseUpHandler = this.onElementMouseUp.bind(this);
        this.onMouseDownHandler = this.onMouseDown.bind(this);
        this.onMouseMoveHandler = this.onMouseMove.bind(this);
        this.onMouseUpHandler = this.onMouseUp.bind(this);

        this.onDragStartHandler = this.onDragStart.bind(this);
        this.onTouchMoveHandler = this.onTouchMove.bind(this);

        if(!this.emulateDragEvents)
            RenderHelper.addEventListener(element, "dragstart", this.onDragStartHandler);

        if(EventUtils.isPointerEvents()) {
            this.mouseDownEventName = "pointerdown";
            this.mouseMoveEventName = "pointermove";
            this.mouseUpEventName = "pointerup";
        }
        else {
            this.mouseDownEventName = Browser.TouchUI ? "touchstart" : "mousedown";
            this.mouseMoveEventName = Browser.TouchUI ? "touchmove" : "mousemove";
            this.mouseUpEventName = Browser.TouchUI ? "touchend" : "mouseup";
        }

        RenderHelper.addEventListener(element, "touchmove", this.onTouchMoveHandler);
        RenderHelper.addEventListener(element, this.mouseDownEventName, this.onElementMouseDownHandler);
        RenderHelper.addEventListener(element, this.mouseUpEventName, this.onElementMouseUpHandler);
        RenderHelper.addEventListener(element, this.mouseDownEventName, this.onMouseDownHandler);
        RenderHelper.addEventListener(document, this.mouseMoveEventName, this.onMouseMoveHandler);
        RenderHelper.addEventListener(document, this.mouseUpEventName, this.onMouseUpHandler);
    }
    private detachHandlers(element: HTMLElement) {
        if(!this.emulateDragEvents)
            RenderHelper.removeEventListener(element, "dragstart", this.onDragStartHandler);
        RenderHelper.removeEventListener(element, "touchmove", this.onTouchMoveHandler);
        RenderHelper.removeEventListener(element, this.mouseDownEventName, this.onElementMouseDownHandler);
        RenderHelper.removeEventListener(element, this.mouseUpEventName, this.onElementMouseUpHandler);
        RenderHelper.removeEventListener(element, this.mouseDownEventName, this.onMouseDownHandler);
        RenderHelper.removeEventListener(document, this.mouseMoveEventName, this.onMouseMoveHandler);
        RenderHelper.removeEventListener(document, this.mouseUpEventName, this.onMouseUpHandler);
    }

    render(filter?: (shapeType: string) => boolean): boolean {
        if(this.mainElement.childNodes)
            this.mainElement.innerHTML = "";
        let shapeTypes = this.shapeTypes;
        shapeTypes = this.getAllowedShapeTypes ? this.getAllowedShapeTypes(shapeTypes) : shapeTypes;
        shapeTypes = filter ? shapeTypes.filter(filter) : shapeTypes;
        if(shapeTypes.length)
            this.createElements(this.mainElement, shapeTypes);
        return !!shapeTypes.length;
    }

    protected abstract createElements(element: HTMLElement, shapeTypes: string[]);

    protected createDraggingObject(shapeType: string): ToolboxDraggingObject {
        const evt = new DiagramDraggingEvent();
        evt.data = shapeType;
        evt.onFinishDragging = this.resetDragState.bind(this);
        evt.onCaptured = this.capture.bind(this);
        return new ToolboxDraggingObject(evt);
    }

    protected getDragShapeType(element: Element): string {
        while(element && !DomUtils.hasClassName(element, TOOLBOX_CSSCLASS)) {
            if(element.getAttribute && element.getAttribute("data-tb-type"))
                return element.getAttribute("data-tb-type");
            element = <Element>element.parentNode;
        }
        return undefined;
    }
    getTouchPointFromEvent(evt: MouseEvent): Point {
        let touchPosition;
        const touches = evt["touches"];
        if(touches && touches.length > 0)
            touchPosition = new Point(touches[0].clientX, touches[0].clientY);
        else if(evt.clientX && evt.clientY)
            touchPosition = new Point(evt.clientX, evt.clientY);
        return touchPosition;
    }
    private onElementMouseDown(evt: MouseEvent) {
        this.mouseDownShapeType = this.getDragShapeType(EvtUtils.getEventSource(evt));
        this.touchDownPoint = this.getTouchPointFromEvent(evt);
    }
    private onElementMouseUp(evt: MouseEvent) {
        const shapeType = this.getDragShapeType(EvtUtils.getEventSource(evt));
        if(shapeType && shapeType === this.mouseDownShapeType)
            this.onClickOperation.raise("notifyToolboxClick", shapeType);
        this.mouseDownShapeType = undefined;
        this.touchDownPoint = undefined;
    }
    private onMouseDown(evt: MouseEvent) {
        this.setDragState(DragState.Prepare, evt);
        if(Browser.TouchUI && EventUtils.isMousePointer(evt))
            this.setDragState(DragState.Start, evt);
    }
    private onDragStart(evt: MouseEvent) {
        this.setDragState(DragState.Start, evt);
        evt.preventDefault();
    }
    private onTouchMove(evt: TouchEvent) {
        if(this.draggingObject)
            evt.preventDefault();
    }

    isLeftButtonPressed(evt: Event) {
        return EvtUtils.isLeftButtonPressed(evt) ||
            (evt.type === "pointermove" && Browser.TouchUI && Browser.MacOSMobilePlatform && EventUtils.isMousePointer(evt));
    }
    private onMouseMove(evt: MouseEvent) {
        if(Browser.TouchUI && Browser.MacOSMobilePlatform) {
            const currentTouchPoint = this.getTouchPointFromEvent(evt);
            if(this.touchDownPoint && currentTouchPoint && this.touchDownPoint.x === currentTouchPoint.x && this.touchDownPoint.y === currentTouchPoint.y)
                return;
        }

        this.setDragState(this.isLeftButtonPressed(evt) ? DragState.Dragging : DragState.None, evt);
        if(EventUtils.isPointerEvents())
            this.raiseDraggingMouseMove(evt);
    }
    private onMouseUp(evt: MouseEvent) {
        this.setDragState(DragState.None, evt);
    }
    private updateDraggingElementPosition(evtX: number, evtY: number) {
        const element = this.draggingObject.element;
        const xPos = evtX - element.offsetWidth / 2;
        const yPos = evtY - element.offsetHeight / 2;
        SetAbsoluteX(element, xPos);
        SetAbsoluteY(element, yPos);
    }
    protected setDragState(newState: DragState, evt: MouseEvent) {
        if(this.readOnly || !this.allowDragging)
            return;
        if(newState === DragState.None && newState === this.dragState)
            return;
        if(this.dragPrepareTimeout > -1) {
            clearTimeout(this.dragPrepareTimeout);
            this.dragPrepareTimeout = -1;
            this.dragPrepareEvent = undefined;
        }
        if(newState - this.dragState > 1 || newState !== DragState.None && newState < this.dragState)
            return;
        this.dragState = newState;
        switch(newState) {
            case DragState.Prepare:
                if(!this.prepareDragging(evt))
                    this.setDragState(DragState.None, evt);
                if(this.emulateDragEvents || !EventUtils.isMousePointer(evt)) {
                    this.dragPrepareTimeout = setTimeout(this.onDragPrepareTimeout.bind(this), TOUCH_DRAGTIMEOUT_MS);
                    this.dragPrepareEvent = evt;
                }
                break;
            case DragState.Start:
                DomUtils.addClassName(document.body, "dxdi-dragging");
                this.startDragging(evt);
                break;
            case DragState.Dragging:
                this.doDragging(evt);
                break;
            case DragState.None:
                this.finishDragging(evt);
                break;
        }
    }
    private resetDragState() {
        this.setDragState(DragState.None, undefined);
    }
    onDragPrepareTimeout() {
        this.dragPrepareTimeout = -1;
        if(this.dragState === DragState.Prepare)
            this.setDragState(DragState.Start, this.dragPrepareEvent);
        this.dragPrepareEvent = undefined;
    }
    prepareDragging(evt: MouseEvent): boolean {
        this.dragStartPoint = new Point(EvtUtils.getEventX(evt), EvtUtils.getEventY(evt));
        this.dragStartShapeType = this.getDragShapeType(EvtUtils.getEventSource(evt));
        if(EventUtils.isMousePointer(evt))
            DomUtils.addClassName(this.mainElement, START_DRAG_CSSCLASS);
        if(this.emulateDragEvents || !EventUtils.isMousePointer(evt))
            HtmlFocusUtils.focusWithPreventScroll(this.mainElement);
        return !!this.dragStartShapeType;
    }
    startDragging(evt: MouseEvent) {
        this.draggingObject = this.createDraggingObject(this.dragStartShapeType);
        if(this.dragStartShapeType) {
            this.raiseDragStart(evt);
            this.draggingObject.element = this.createDraggingElement(this.draggingObject);
            if(this.draggingObject.captured !== undefined)
                this.capture(this.draggingObject.captured, true);
            this.updateDraggingElementPosition(this.dragStartPoint.x, this.dragStartPoint.y);
        }
        else
            DomUtils.addClassName(document.body, NOT_VALID_CSSCLASS);
    }
    doDragging(evt: MouseEvent) {
        if(this.draggingObject.element)
            this.updateDraggingElementPosition(EvtUtils.getEventX(evt), EvtUtils.getEventY(evt));
    }
    finishDragging(evt: MouseEvent) {
        if(this.draggingObject) {
            this.raiseDragEnd(evt);

            const element = this.draggingObject.element;
            if(element)
                element.parentNode.removeChild(element);
            delete this.draggingObject;
        }
        this.dragStartPoint = undefined;
        this.dragStartShapeType = undefined;
        DomUtils.removeClassName(this.mainElement, START_DRAG_CSSCLASS);
        DomUtils.removeClassName(document.body, NOT_VALID_CSSCLASS);
        setTimeout(() => DomUtils.removeClassName(document.body, "dxdi-dragging"), 500); 
    }

    capture(captured: boolean, forced?: boolean) {
        if(this.draggingObject && (this.draggingObject.captured !== captured || forced)) {
            this.draggingObject.captured = captured;
            if(this.draggingObject.element)
                DomUtils.toggleClassName(this.draggingObject.element, DRAG_CAPTURED_CSSCLASS, captured);
        }
    }
    protected abstract createDraggingElement(dragginObject: ToolboxDraggingObject): HTMLElement;

    raiseDragStart(evt: MouseEvent) {
        this.onDragOperation.raise("notifyToolboxDragStart", evt);
    }
    raiseDragEnd(evt: MouseEvent) {
        this.onDragOperation.raise("notifyToolboxDragEnd", evt); 
    }
    raiseDraggingMouseMove(evt: MouseEvent) {
        this.onDragOperation.raise("notifyToolboxDraggingMouseMove", evt);
    }

    notifyReadOnlyChanged(readOnly: boolean) {
        this.readOnly = readOnly;
    }
}

enum DragState {
    None = -1,
    Prepare = 0,
    Start = 1,
    Dragging = 2
}

export class ToolboxDraggingObject {
    constructor(evt: DiagramDraggingEvent) {
        this.evt = evt;
    }
    element: HTMLElement;
    evt: DiagramDraggingEvent;
    captured: boolean;
}

export class DiagramDraggingEvent {
    data: string;
    onFinishDragging: () => void;
    onCaptured: (captured: boolean) => void;
}

export interface IShapeToolboxOptions { }
