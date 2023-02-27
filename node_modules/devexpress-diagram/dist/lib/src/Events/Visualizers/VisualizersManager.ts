import { IReadOnlyChangesListener, DiagramSettings } from "../../Settings";
import { ConnectionTargetVisualizer } from "./ConnectionTargetVisualizer";
import { ContainerTargetVisualizer } from "./ContainerTargetVisualizer";
import { ExtensionLinesVisualizer, ExtensionLineType } from "./ExtensionLinesVisualizer";
import { IVisualizersListener, IEventManager } from "../EventManager";
import { DiagramModel } from "../../Model/Model";
import { Selection } from "../../Selection/Selection";
import { DiagramMouseEvent, DiagramEvent, MouseEventElementType, DiagramFocusEvent, IMouseOperationsListener } from "../Event";
import { DiagramItem, ItemKey } from "../../Model/DiagramItem";
import { ConnectionPointInfo, ConnectionPointsVisualizer } from "./ConnectionPointsVisualizer";
import { Shape } from "../../Model/Shapes/Shape";
import { EventDispatcher } from "../../Utils";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Segment } from "@devexpress/utils/lib/geometry/segment";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { CanvasSelectionManager } from "../../Render/CanvasSelectionManager";
import { ModelUtils } from "../../Model/ModelUtils";
import { ResizeInfoVisualizer } from "./ResizeInfoVisualizer";
import { SelectionRectVisualizer } from "./SelectionRectVisualizer";
import { BatchUpdatableObject } from "@devexpress/utils/lib/class/batch-updatable";
import { DiagramLocalizationService } from "../../LocalizationService";

export class VisualizerManager extends BatchUpdatableObject implements IReadOnlyChangesListener,
    IMouseOperationsListener, IVisualizerManager {
    protected connectionPointsVisualizer: ConnectionPointsVisualizer;
    protected connectionTargetVisualizer: ConnectionTargetVisualizer;
    protected containerTargetVisualizer: ContainerTargetVisualizer;
    protected extensionLinesVisualizer: ExtensionLinesVisualizer;
    protected resizeInfoVisualizer: ResizeInfoVisualizer;
    protected selectionRectangleVisualizer: SelectionRectVisualizer;

    onVisualizersUpdate: EventDispatcher<IVisualizersListener> = new EventDispatcher();

    constructor(
        protected selection: Selection,
        protected model: DiagramModel,
        protected eventManager: IEventManager,
        protected settings: DiagramSettings,
        protected readOnly: boolean = settings.readOnly) {
        super();
        this.connectionPointsVisualizer = new ConnectionPointsVisualizer(this.onVisualizersUpdate);
        this.connectionPointsVisualizer = new ConnectionPointsVisualizer(this.onVisualizersUpdate);
        this.connectionTargetVisualizer = new ConnectionTargetVisualizer(this.onVisualizersUpdate);
        this.containerTargetVisualizer = new ContainerTargetVisualizer(this.onVisualizersUpdate);
        this.extensionLinesVisualizer = new ExtensionLinesVisualizer(this.onVisualizersUpdate);
        this.resizeInfoVisualizer = new ResizeInfoVisualizer(this.onVisualizersUpdate);
        this.selectionRectangleVisualizer = new SelectionRectVisualizer(this.onVisualizersUpdate);
    }
    initialize(model: DiagramModel) {
        this.model = model;
    }

    onMouseDown(evt: DiagramMouseEvent) {
    }
    onMouseUp(evt: DiagramMouseEvent) {
    }
    onMouseEnter(evt: DiagramEvent) {
    }
    onMouseLeave(evt: DiagramEvent) {
        this.resetConnectionPoints();
        this.resetConnectionTarget();
        this.resetExtensionLines();
        this.resetContainerTarget();
        this.resetResizeInfo();
        this.resetSelectionRectangle();
    }
    onBlur(evt: DiagramFocusEvent) {
    }
    onFocus(evt: DiagramEvent) {
    }

    updateConnections(item: DiagramItem, type: MouseEventElementType, value: any) {
        let pointIndex = -1;
        if(value && type === MouseEventElementType.ShapeConnectionPoint)
            pointIndex = parseInt(value);
        const preventShowOutside = item && ((!item.allowResizeHorizontally && !item.allowResizeVertically) || item.isLocked);
        this.setConnectionPoints(item, type, pointIndex, preventShowOutside);
    }
    setConnectionPoints(item: DiagramItem, type: MouseEventElementType, pointIndex: number, preventShowOutside?: boolean) {
        if(!this.eventManager.isFocused()) return;

        if(item && (type === MouseEventElementType.Shape || type === MouseEventElementType.ShapeResizeBox ||
            type === MouseEventElementType.ShapeConnectionPoint) && item !== undefined) {
            const key = item.key;
            const isSelected = this.selection.hasKey(key);
            const points = item.getConnectionPoints();
            this.connectionPointsVisualizer.setPoints(key,
                points.map(pt => new ConnectionPointInfo(pt, item.getConnectionPointSide(pt))),
                pointIndex, isSelected && !preventShowOutside && item.rectangle
            );
        }
        else
            this.connectionPointsVisualizer.reset();
    }
    setConnectionPointIndex(index: number) {
        this.connectionPointsVisualizer.setPointIndex(index);
    }
    updateConnectionPoints() {
        const item = this.model.findItem(this.connectionPointsVisualizer.getKey());
        if(item !== undefined)
            this.connectionPointsVisualizer.update();
        else
            this.connectionPointsVisualizer.reset();
    }
    resetConnectionPoints() {
        this.connectionPointsVisualizer.reset();
    }

    setConnectionTarget(item: DiagramItem, type: MouseEventElementType) {
        if(item && (type === MouseEventElementType.Shape ||
            type === MouseEventElementType.ShapeConnectionPoint))
            this.connectionTargetVisualizer.setTargetRect(item.key, item.rectangle, item.strokeWidth);

        else
            this.connectionTargetVisualizer.reset();
    }
    resetConnectionTarget() {
        this.connectionTargetVisualizer.reset();
    }

    setContainerTarget(item: DiagramItem, type: MouseEventElementType) {
        if(item && !item.isLocked && (type === MouseEventElementType.Shape) && item.enableChildren)
            this.containerTargetVisualizer.setTargetRect(item.key, item.rectangle, item.strokeWidth);
        else
            this.containerTargetVisualizer.reset();
    }
    resetContainerTarget() {
        this.containerTargetVisualizer.reset();
    }

    setExtensionLines(items: DiagramItem[]) {
        if(!this.eventManager.isFocused()) return;

        this.extensionLinesVisualizer.reset();

        const rect = ModelUtils.createRectangle(items.filter(item => item));
        this.addPageExtensionLines(rect);

        this.model.items.forEach(item => {
            if(items.indexOf(item) > -1) return;

            if(item instanceof Shape)
                this.addShapeExtensionLines(item, rect);
        });
    }
    protected addPageExtensionLines(rect: Rectangle) {
        const horPages = Math.round(this.model.size.width / this.model.pageWidth);
        const verPages = Math.round(this.model.size.height / this.model.pageHeight);

        for(let i = 0; i < horPages; i++)
            for(let j = 0; j < verPages; j++) {
                const center = new Point(
                    i * this.model.pageWidth + this.model.pageWidth / 2,
                    j * this.model.pageHeight + this.model.pageHeight / 2
                );

                if(Math.abs(rect.center.x - center.x) < this.settings.gridSize / 2) {
                    const segment = new Segment(new Point(rect.center.x, 0), new Point(rect.center.x, this.model.size.height));
                    this.extensionLinesVisualizer.addSegment(ExtensionLineType.HorizontalCenterToPageCenter, segment, "");
                }
                if(Math.abs(rect.center.y - center.y) < this.settings.gridSize / 2) {
                    const segment = new Segment(new Point(0, rect.center.y), new Point(this.model.size.width, rect.center.y));
                    this.extensionLinesVisualizer.addSegment(ExtensionLineType.VerticalCenterToPageCenter, segment, "");
                }
                if(Math.abs(rect.x - center.x) < this.settings.gridSize / 2) {
                    const segment = new Segment(new Point(rect.x, 0), new Point(rect.x, this.model.size.height));
                    this.extensionLinesVisualizer.addSegment(ExtensionLineType.LeftToPageCenter, segment, "");
                }
                if(Math.abs(rect.y - center.y) < this.settings.gridSize / 2) {
                    const segment = new Segment(new Point(0, rect.y), new Point(this.model.size.width, rect.y));
                    this.extensionLinesVisualizer.addSegment(ExtensionLineType.TopToPageCenter, segment, "");
                }
                if(Math.abs(rect.right - center.x) < this.settings.gridSize / 2) {
                    const segment = new Segment(new Point(rect.right, 0), new Point(rect.right, this.model.size.height));
                    this.extensionLinesVisualizer.addSegment(ExtensionLineType.RightToPageCenter, segment, "");
                }
                if(Math.abs(rect.bottom - center.y) < this.settings.gridSize / 2) {
                    const segment = new Segment(new Point(0, rect.bottom), new Point(this.model.size.width, rect.bottom));
                    this.extensionLinesVisualizer.addSegment(ExtensionLineType.BottomToPageCenter, segment, "");
                }
            }

    }
    protected addShapeExtensionLines(shape: Shape, rect: Rectangle) {
        const sRect = shape.rectangle;
        const lwCor = shape.strokeWidth - CanvasSelectionManager.extensionLineWidth;
        let showDistance = true;

        let x1nc; let y1nc; let x2nc; let y2nc; let x1; let y1; let x2; let y2;
        if(rect.right < sRect.x) {
            x1nc = rect.right;
            x2nc = sRect.x;
            x1 = x1nc + lwCor + CanvasSelectionManager.extensionLineOffset;
            x2 = x2nc - CanvasSelectionManager.extensionLineOffset;
        }
        else if(rect.x > sRect.right) {
            x1nc = rect.x;
            x2nc = sRect.right;
            x1 = x1nc - CanvasSelectionManager.extensionLineOffset;
            x2 = x2nc + lwCor + CanvasSelectionManager.extensionLineOffset;
        }
        if(rect.bottom < sRect.y) {
            y1nc = rect.bottom;
            y2nc = sRect.y;
            y1 = y1nc + lwCor + CanvasSelectionManager.extensionLineOffset;
            y2 = y2nc - CanvasSelectionManager.extensionLineOffset;
        }
        else if(rect.y > sRect.bottom) {
            y1nc = rect.y;
            y2nc = sRect.bottom;
            y1 = y1nc - CanvasSelectionManager.extensionLineOffset;
            y2 = y2nc + lwCor + CanvasSelectionManager.extensionLineOffset;
        }
        if(x1 !== undefined && x2 !== undefined) {
            const distanceText = this.getViewUnitText(Math.abs(x1nc - x2nc));
            if(rect.center.y === sRect.center.y) {
                const segment = new Segment(new Point(x1, rect.center.y), new Point(x2, sRect.center.y));
                this.extensionLinesVisualizer.addSegment(
                    x1 > x2 ? ExtensionLineType.VerticalCenterAfter : ExtensionLineType.VerticalCenterBefore,
                    segment, showDistance ? distanceText : ""
                );
                showDistance = false;
            }
            if(rect.y === sRect.y) {
                const segment = new Segment(new Point(x1, rect.y), new Point(x2, sRect.y));
                this.extensionLinesVisualizer.addSegment(
                    x1 > x2 ? ExtensionLineType.TopToTopAfter : ExtensionLineType.TopToTopBefore,
                    segment, showDistance ? distanceText : ""
                );
            }
            if(rect.bottom === sRect.bottom) {
                const segment = new Segment(new Point(x1, rect.bottom + lwCor), new Point(x2, sRect.bottom + lwCor));
                this.extensionLinesVisualizer.addSegment(
                    x1 > x2 ? ExtensionLineType.BottomToBottomAfter : ExtensionLineType.BottomToBottomBefore,
                    segment, showDistance ? distanceText : ""
                );
            }
            if(rect.y === sRect.bottom) {
                const segment = new Segment(new Point(x1, rect.y), new Point(x2, sRect.bottom + lwCor));
                this.extensionLinesVisualizer.addSegment(
                    x1 > x2 ? ExtensionLineType.TopToBottomAfter : ExtensionLineType.TopToBottomBefore,
                    segment, showDistance ? distanceText : ""
                );
            }
            if(rect.bottom === sRect.y) {
                const segment = new Segment(new Point(x1, rect.bottom + lwCor), new Point(x2, sRect.y));
                this.extensionLinesVisualizer.addSegment(
                    x1 > x2 ? ExtensionLineType.BottomToTopAfter : ExtensionLineType.BottomToTopBefore,
                    segment, showDistance ? distanceText : ""
                );
            }
        }
        if(y1 !== undefined && y2 !== undefined) {
            const distanceText = this.getViewUnitText(Math.abs(y1nc - y2nc));
            if(rect.center.x === sRect.center.x) {
                const segment = new Segment(new Point(rect.center.x, y1), new Point(sRect.center.x, y2));
                this.extensionLinesVisualizer.addSegment(
                    y1 > y2 ? ExtensionLineType.HorizontalCenterBelow : ExtensionLineType.HorizontalCenterAbove,
                    segment, showDistance ? distanceText : ""
                );
                showDistance = false;
            }
            if(rect.x === sRect.x) {
                const segment = new Segment(new Point(rect.x, y1), new Point(sRect.x, y2));
                this.extensionLinesVisualizer.addSegment(
                    y1 > y2 ? ExtensionLineType.LeftToLeftBelow : ExtensionLineType.LeftToLeftAbove,
                    segment, showDistance ? distanceText : ""
                );
            }
            if(rect.right === sRect.right) {
                const segment = new Segment(new Point(rect.right + lwCor, y1), new Point(sRect.right + lwCor, y2));
                this.extensionLinesVisualizer.addSegment(
                    y1 > y2 ? ExtensionLineType.RightToRightBelow : ExtensionLineType.RightToRightAbove,
                    segment, showDistance ? distanceText : ""
                );
            }
            if(rect.x === sRect.right) {
                const segment = new Segment(new Point(rect.x, y1), new Point(sRect.right + lwCor, y2));
                this.extensionLinesVisualizer.addSegment(
                    y1 > y2 ? ExtensionLineType.LeftToRightBelow : ExtensionLineType.LeftToRightAbove,
                    segment, showDistance ? distanceText : ""
                );
            }
            if(rect.right === sRect.x) {
                const segment = new Segment(new Point(rect.right + lwCor, y1), new Point(sRect.x, y2));
                this.extensionLinesVisualizer.addSegment(
                    y1 > y2 ? ExtensionLineType.RightToLeftBelow : ExtensionLineType.RightToLeftAbove,
                    segment, showDistance ? distanceText : ""
                );
            }
        }
    }
    resetExtensionLines() {
        this.extensionLinesVisualizer.reset();
    }
    setResizeInfo(items: DiagramItem[]) {
        const rect = ModelUtils.createRectangle(items);
        const point = new Point(rect.center.x, rect.bottom + CanvasSelectionManager.resizeInfoOffset);
        const text = this.getViewUnitText(rect.width) + " x " + this.getViewUnitText(rect.height);
        this.resizeInfoVisualizer.set(point, text);
    }
    resetResizeInfo() {
        this.resizeInfoVisualizer.reset();
    }
    setSelectionRectangle(rect: Rectangle) {
        this.selectionRectangleVisualizer.setRectangle(rect);
    }
    resetSelectionRectangle() {
        this.selectionRectangleVisualizer.reset();
    }
    getViewUnitText(value: number) {
        return ModelUtils.getUnitText(this.settings.viewUnits, DiagramLocalizationService.unitItems,
            DiagramLocalizationService.formatUnit, value);
    }

    notifyReadOnlyChanged(readOnly: boolean) {
        this.readOnly = readOnly;

        if(this.readOnly) {
            this.resetConnectionPoints();
            this.resetConnectionTarget();
            this.resetExtensionLines();
            this.resetContainerTarget();
            this.resetResizeInfo();
            this.resetSelectionRectangle();
        }
    }
    notifyDragStart(itemKeys: ItemKey[]) { }
    notifyDragEnd(itemKeys: ItemKey[]) { }
    notifyDragScrollStart() {}
    notifyDragScrollEnd() {}

    onUpdateUnlocked(occurredEvents: number) { }
}

export interface IVisualizerManager {
    resetConnectionTarget();
    resetConnectionPoints();
    resetExtensionLines();
    resetContainerTarget();
    resetResizeInfo();
    resetSelectionRectangle();

    setConnectionTarget(item: DiagramItem, type: MouseEventElementType);
    setConnectionPoints(item: DiagramItem, type: MouseEventElementType, pointIndex: number, preventShowOutside?: boolean);
    setConnectionPointIndex(index: number);
    setExtensionLines(items: DiagramItem[]);
    setContainerTarget(item: DiagramItem, type: MouseEventElementType);
    setResizeInfo(items: DiagramItem[]);
    setSelectionRectangle(rect: Rectangle);
    updateConnections(item: DiagramItem, type: MouseEventElementType, value: any);
}
