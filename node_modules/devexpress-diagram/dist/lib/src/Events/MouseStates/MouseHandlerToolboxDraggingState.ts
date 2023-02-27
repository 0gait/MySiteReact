import { MouseHandler } from "../MouseHandler";
import { DiagramDraggingEvent } from "../../Render/Toolbox/Toolbox";
import { DiagramMouseEvent, MouseEventElementType } from "../Event";
import { IShapeDescriptionManager } from "../../Model/Shapes/Descriptions/ShapeDescriptionManager";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { AddShapeHistoryItem } from "../../History/Common/AddShapeHistoryItem";
import { SetSelectionHistoryItem } from "../../History/Common/SetSelectionHistoryItem";
import { MouseHandlerDraggingState } from "./MouseHandlerDraggingState";
import { History } from "../../History/History";
import { Selection } from "../../Selection/Selection";
import { DeleteShapeHistoryItem } from "../../History/Common/DeleteShapeHistoryItem";
import { ModelUtils } from "../../Model/ModelUtils";
import { DiagramModel } from "../../Model/Model";
import { MouseHandlerCancellableState } from "./MouseHandlerStateBase";
import { ItemKey } from "../../Model/DiagramItem";
import { IVisualizerManager } from "../Visualizers/VisualizersManager";
import { Shape } from "../../Model/Shapes/Shape";
import { DiagramModelOperation } from "../../ModelOperationSettings";

const NON_DOCUMENT_TIMER = 500;
const LOCK_UPDATEPAGESIZE_TIMER = 300;

export class MouseHandlerBeforeToolboxDraggingState extends MouseHandlerCancellableState {
    dragging: DiagramDraggingEvent;
    nonPageAreaTimer: number;
    savedEvt: DiagramMouseEvent;
    isModelEmpty: boolean;

    constructor(handler: MouseHandler,
        protected history: History,
        protected model: DiagramModel,
        protected selection: Selection,
        protected visualizerManager: IVisualizerManager,
        protected shapeDescriptionManager: IShapeDescriptionManager) {
        super(handler);
        this.isModelEmpty = model.items.length === 0;
    }

    cancelChanges() {
        this.tryRemoveTimer();
    }
    onDragStart(evt: DiagramDraggingEvent) {
        this.dragging = evt;
    }
    onDragEnd(evt: DiagramMouseEvent) {
        this.cancelChanges();
        this.handler.switchToDefaultState();
    }
    onMouseMove(evt: DiagramMouseEvent) {
        if(evt.source.type > MouseEventElementType.Background) {
            this.tryRemoveTimer();
            this.switchToDraggingState(evt, false);
        }
        else if(evt.source.type === MouseEventElementType.Background && !this.isModelEmpty) {
            this.savedEvt = evt;
            if(this.nonPageAreaTimer === undefined)
                this.nonPageAreaTimer = setTimeout(() => this.switchToDraggingState(this.savedEvt, true), NON_DOCUMENT_TIMER);
        }
        else if(this.nonPageAreaTimer !== undefined)
            this.tryRemoveTimer();
    }

    switchToDraggingState(evt: DiagramMouseEvent, skipLockUpdatePageSize: boolean) {
        this.handler.switchState(
            new MouseHandlerToolboxDraggingState(this.handler, this.history, this.model, this.selection,
                this.visualizerManager, this.shapeDescriptionManager, skipLockUpdatePageSize)
        );
        this.handler.state.onDragStart(this.dragging);
        this.handler.state.onMouseMove(evt);
    }
    tryRemoveTimer() {
        if(this.nonPageAreaTimer !== undefined) {
            clearTimeout(this.nonPageAreaTimer);
            delete this.nonPageAreaTimer;
        }
    }
    finish() {
        this.tryRemoveTimer();
    }
}
export class MouseHandlerToolboxDraggingState extends MouseHandlerDraggingState {
    startPoint: Point;
    startShapePosition: Point;
    dragging: DiagramDraggingEvent;
    shapeKey: ItemKey;
    deleteHistoryItem: DeleteShapeHistoryItem;
    updatePageSizeTimer: number;

    connectorsWithoutBeginItemInfo: any[];
    connectorsWithoutEndItemInfo: any[];

    constructor(handler: MouseHandler, history: History,
        protected model: DiagramModel,
        protected selection: Selection,
        protected visualizerManager: IVisualizerManager,
        protected shapeDescriptionManager: IShapeDescriptionManager,
        skipLockUpdatePageSize: boolean) {
        super(handler, history);

        if(!skipLockUpdatePageSize)
            this.updatePageSizeTimer = setTimeout(() => {
                this.processAndRemoveUpdatePageSizeTimer();
            }, LOCK_UPDATEPAGESIZE_TIMER);

    }

    cancelChanges() {
        this.tryRemoveUpdatePageSizeTimer();
        super.cancelChanges();
    }
    tryRemoveUpdatePageSizeTimer() {
        if(this.updatePageSizeTimer !== undefined) {
            clearTimeout(this.updatePageSizeTimer);
            delete this.updatePageSizeTimer;
        }
    }
    processAndRemoveUpdatePageSizeTimer() {
        if(this.updatePageSizeTimer !== undefined) {
            this.handler.tryUpdateModelSize();
            delete this.updatePageSizeTimer;
        }
    }

    onMouseMove(evt: DiagramMouseEvent) {
        super.onMouseMove(evt);

        const shape = this.model.findShape(this.shapeKey);
        if(shape) {
            this.visualizerManager.setExtensionLines([shape]);

            const container = ModelUtils.findContainerByEventKey(this.model, this.selection, evt.source.key);
            if(container && this.allowInsertToContainer(evt, shape, container))
                this.visualizerManager.setContainerTarget(container, evt.source.type);
            else
                this.visualizerManager.resetContainerTarget();
        }
    }

    getDraggingElementKeys(): ItemKey[] {
        return this.shapeKey === undefined ? [] : [this.shapeKey];
    }
    onApplyChanges(evt: DiagramMouseEvent) {
        if(evt.source.type === MouseEventElementType.Undefined) {
            this.dragging.onCaptured(false);
            if(this.shapeKey !== undefined && !this.deleteHistoryItem) {
                const shape = this.model.findShape(this.shapeKey);
                ModelUtils.detachConnectors(this.history, shape);
                ModelUtils.removeFromContainer(this.history, this.model, shape);

                this.deleteHistoryItem = new DeleteShapeHistoryItem(this.shapeKey, true);
                this.history.addAndRedo(this.deleteHistoryItem);
            }
        }
        else {
            this.dragging.onCaptured(true);
            if(this.shapeKey === undefined) {
                this.startPoint = evt.modelPoint;
                this.shapeKey = this.insertToolboxItem(evt);
                const shape = this.model.findShape(this.shapeKey);
                if(shape)
                    this.handler.addInteractingItem(shape, DiagramModelOperation.AddShape);
            }
            if(this.deleteHistoryItem) {
                this.history.undoTransactionTo(this.deleteHistoryItem);
                delete this.deleteHistoryItem;
            }
            const pos = this.getPosition(evt, this.startShapePosition);
            const shape = this.model.findShape(this.shapeKey);
            ModelUtils.setShapePosition(this.history, this.model, shape, pos);

            ModelUtils.updateMovingShapeConnections(this.history, shape,
                this.connectorsWithoutBeginItemInfo, this.connectorsWithoutEndItemInfo,
                () => {
                    this.visualizerManager.resetConnectionTarget();
                    this.visualizerManager.resetConnectionPoints();
                },
                (shape, connectionPointIndex) => {
                    this.visualizerManager.setConnectionTarget(shape, MouseEventElementType.Shape);
                    this.visualizerManager.setConnectionPoints(shape, MouseEventElementType.Shape, connectionPointIndex, true);
                },
                (connector) => this.handler.addInteractingItem(connector)
            );
            ModelUtils.updateShapeAttachedConnectors(this.history, this.model, shape);

            const container = ModelUtils.findContainerByEventKey(this.model, this.selection, evt.source.key);
            if(shape && container && this.allowInsertToContainer(evt, shape, container))
                ModelUtils.insertToContainer(this.history, this.model, shape, container);
            else
                ModelUtils.removeFromContainer(this.history, this.model, shape);

            if(this.updatePageSizeTimer === undefined)
                this.handler.tryUpdateModelSize((offsetLeft, offsetTop) => {
                    this.connectorsWithoutBeginItemInfo.forEach(pi => {
                        pi.point.x += offsetLeft;
                        pi.point.y += offsetTop;
                    });
                    this.connectorsWithoutEndItemInfo.forEach(pi => {
                        pi.point.x += offsetLeft;
                        pi.point.y += offsetTop;
                    });
                });

        }
    }
    onFinishWithChanges() {
        if(!this.deleteHistoryItem)
            this.history.addAndRedo(new SetSelectionHistoryItem(this.selection, [this.shapeKey]));
    }
    onDragStart(evt: DiagramDraggingEvent) {
        this.dragging = evt;

        this.connectorsWithoutBeginItemInfo = ModelUtils.getConnectorsWithoutBeginItemInfo(this.model);
        this.connectorsWithoutEndItemInfo = ModelUtils.getConnectorsWithoutEndItemInfo(this.model);
    }
    onDragEnd(evt: DiagramMouseEvent) {
        if(this.shapeKey !== undefined && evt.source.type === MouseEventElementType.Undefined)
            this.cancelChanges();
        this.handler.switchToDefaultState();
    }
    finish() {
        this.visualizerManager.resetExtensionLines();
        this.visualizerManager.resetContainerTarget();
        this.visualizerManager.resetConnectionTarget();
        this.visualizerManager.resetConnectionPoints();
        this.processAndRemoveUpdatePageSizeTimer();

        this.dragging.onFinishDragging();
        super.finish();
    }

    insertToolboxItem(evt: DiagramMouseEvent): ItemKey {
        const description = this.shapeDescriptionManager.get(this.dragging.data);
        this.startShapePosition = this.getSnappedPoint(evt,
            new Point(evt.modelPoint.x - description.defaultSize.width / 2, evt.modelPoint.y - description.defaultSize.height / 2)
        );
        const historyItem = new AddShapeHistoryItem(description, this.startShapePosition);
        this.history.addAndRedo(historyItem);
        ModelUtils.updateNewShapeProperties(this.history, this.selection, historyItem.shapeKey);
        return historyItem.shapeKey;
    }

    private allowInsertToContainer(evt: DiagramMouseEvent, item: Shape, container: Shape): boolean {
        if(this.handler.canMultipleSelection(evt))
            return false;
        return container && container.expanded && ModelUtils.canInsertToContainer(this.model, item, container);
    }
    private getPosition(evt: DiagramMouseEvent, basePoint: Point): Point {
        return this.getSnappedPoint(evt, new Point(
            basePoint.x + evt.modelPoint.x - this.startPoint.x,
            basePoint.y + evt.modelPoint.y - this.startPoint.y));
    }
}
