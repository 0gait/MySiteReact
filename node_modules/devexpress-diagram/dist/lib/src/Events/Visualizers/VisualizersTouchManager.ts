import { DiagramSettings } from "../../Settings";
import { IEventManager } from "../EventManager";
import { DiagramModel } from "../../Model/Model";
import { Selection, ISelectionChangesListener } from "../../Selection/Selection";
import { VisualizerManager } from "./VisualizersManager";
import { DiagramEvent, DiagramFocusEvent, MouseEventElementType } from "../Event";
import { ItemKey } from "../../Model/DiagramItem";

const SELECTION_CHANGED_EVENT = 1;

export class VisualizerTouchManager extends VisualizerManager implements ISelectionChangesListener {
    constructor(selection: Selection, model: DiagramModel, eventManager: IEventManager, settings: DiagramSettings, readOnly: boolean = settings.readOnly) {
        super(selection, model, eventManager, settings, readOnly);
        selection.onChanged.add(this);
    }

    onBlur(evt: DiagramFocusEvent) {
        setTimeout(() => { this.hideConnections(); }, 1);
    }
    onFocus(evt: DiagramEvent) {
        setTimeout(() => { this.showConnections(); }, 1);
    }

    hideConnections() {
        if(this.readOnly) return;

        this.resetConnectionPoints();
    }
    showConnections() {
        if(this.readOnly) return;

        if(this.needShowConnections()) {
            const shapes = this.selection.getSelectedShapes();
            if(shapes.length === 1)
                this.setConnectionPoints(shapes[0], MouseEventElementType.ShapeConnectionPoint, -1,
                    (!shapes[0].allowResizeHorizontally && !shapes[0].allowResizeVertically) || shapes[0].isLocked);

        }
    }
    needShowConnections() {
        const items = this.selection.getSelectedItems();
        const shapes = this.selection.getSelectedShapes();
        return (items.length === 1 && shapes.length === 1);
    }

    notifySelectionChanged(selection: Selection) {
        if(this.isUpdateLocked())
            this.registerOccurredEvent(SELECTION_CHANGED_EVENT);
        else
            this.raiseSelectionChanged();
    }
    raiseSelectionChanged() {
        if(this.needShowConnections())
            this.showConnections();
        else
            this.hideConnections();
    }
    onUpdateUnlocked(occurredEvents: number) {
        if(occurredEvents & SELECTION_CHANGED_EVENT)
            this.raiseSelectionChanged();
    }

    notifyDragStart(itemKeys: ItemKey[]) {
        this.hideConnections();
    }
    notifyDragEnd(itemKeys: ItemKey[]) {
        this.showConnections();
    }
}
