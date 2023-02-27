import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { Shape } from "../../Model/Shapes/Shape";
import { ResizeEventSource, DiagramMouseEvent } from "../Event";
import { MouseHandlerDraggingState } from "./MouseHandlerDraggingState";
import { MouseHandler } from "../MouseHandler";
import { History } from "../../History/History";
import { Selection } from "../../Selection/Selection";
import { DiagramModel } from "../../Model/Model";
import { ModelUtils } from "../../Model/ModelUtils";
import { Connector } from "../../Model/Connectors/Connector";
import { ItemKey } from "../../Model/DiagramItem";
import { IVisualizerManager } from "../Visualizers/VisualizersManager";
import { ShapeMinDimension } from "../../Model/Shapes/Descriptions/ShapeDescription";
import { DiagramSettings } from "../../Settings";
import { DiagramModelOperation } from "../../ModelOperationSettings";

export class MouseHandlerResizeShapeState extends MouseHandlerDraggingState {
    startPoint: Point;
    lockH: boolean;
    lockV: boolean;
    sideH: boolean;
    sideV: boolean;

    shapes: Shape[];
    connectors: Connector[];
    startShapeSizes: Size[];
    startShapePositions: Point[];
    startConnectorPoints: Point[][];
    startRectangle: Rectangle;

    startScrollLeft = 0;
    startScrollTop = 0;

    rotation = 0;

    resizeEventSource: ResizeEventSource;

    constructor(handler: MouseHandler, history: History,
        protected model: DiagramModel,
        protected selection: Selection,
        protected visualizerManager: IVisualizerManager,
        protected settings: DiagramSettings) {
        super(handler, history);
    }

    finish() {
        this.visualizerManager.resetResizeInfo();
        this.visualizerManager.resetExtensionLines();
        super.finish();
    }

    onMouseDown(evt: DiagramMouseEvent) {
        const source = parseInt(evt.source.value);
        this.resizeEventSource = source;
        this.startPoint = evt.modelPoint;

        this.lockH = source === ResizeEventSource.ResizeBox_S || source === ResizeEventSource.ResizeBox_N;
        this.lockV = source === ResizeEventSource.ResizeBox_E || source === ResizeEventSource.ResizeBox_W;
        this.sideH = source === ResizeEventSource.ResizeBox_E || source === ResizeEventSource.ResizeBox_NE || source === ResizeEventSource.ResizeBox_SE;
        this.sideV = source === ResizeEventSource.ResizeBox_SE || source === ResizeEventSource.ResizeBox_S || source === ResizeEventSource.ResizeBox_SW;

        this.shapes = this.selection.getSelectedShapes();
        if(this.shapes.length === 0) {
            this.handler.switchToDefaultState();
            return;
        }
        this.shapes.forEach(shape => {
            this.handler.addInteractingItem(shape, DiagramModelOperation.ResizeShape);
            this.handler.addInteractingItem(shape, DiagramModelOperation.MoveShape);
        });

        this.connectors = this.selection.getSelectedConnectors();
        this.startRectangle = ModelUtils.createRectangle(this.shapes);
        this.startShapeSizes = this.shapes.map(shape => shape.size.clone());
        this.startShapePositions = this.shapes.map(shape => shape.position.clone());
        this.startConnectorPoints = this.connectors.map(c => c.points.map(p => p.clone()));

        super.onMouseDown(evt);
    }
    onMouseMove(evt: DiagramMouseEvent) {
        super.onMouseMove(evt);

        const shapes = this.selection.getSelectedShapes();
        this.visualizerManager.setExtensionLines(shapes);
    }
    onApplyChanges(evt: DiagramMouseEvent) {
        const rectangle = ModelUtils.createRectangle(this.shapes);
        const minWidth = this.shapes.length === 1 ? this.shapes[0].getMinWidth(this.settings.shapeMinWidth) : ShapeMinDimension;
        const minHeight = this.shapes.length === 1 ? this.shapes[0].getMinHeight(this.settings.shapeMinHeight) : ShapeMinDimension;
        const maxWidth = this.shapes.length === 1 ? this.shapes[0].getMaxWidth(this.settings.shapeMaxWidth) : undefined;
        const maxHeight = this.shapes.length === 1 ? this.shapes[0].getMaxHeight(this.settings.shapeMaxHeight) : undefined;
        const size = this.getSize(evt, rectangle.createPosition(), this.startRectangle.createSize(),
            minWidth, minHeight, maxWidth, maxHeight, this.handler.lockAspectRatioOnShapeResize(evt));
        const pos = this.getPosition(evt, size, this.startRectangle.createSize(), this.startRectangle.createPosition());
        const ratioX = size.width / this.startRectangle.width;
        const ratioY = size.height / this.startRectangle.height;

        this.shapes.forEach((shape, index) => {
            let shapeWidth = this.startShapeSizes[index].width * (shape.allowResizeHorizontally ? ratioX : 1);
            shapeWidth = this.getNormalizedSize(shapeWidth, shape.getMinWidth(this.settings.shapeMinWidth), shape.getMaxWidth(this.settings.shapeMaxWidth));
            let shapeHeight = this.startShapeSizes[index].height * (shape.allowResizeVertically ? ratioY : 1);
            shapeHeight = this.getNormalizedSize(shapeHeight, shape.getMinHeight(this.settings.shapeMinHeight), shape.getMaxHeight(this.settings.shapeMaxHeight));
            const shapeLeft = shape.allowResizeHorizontally ? (pos.x + (this.startShapePositions[index].x - this.startRectangle.x) * ratioX) : this.startShapePositions[index].x;
            const shapeTop = shape.allowResizeVertically ? (pos.y + (this.startShapePositions[index].y - this.startRectangle.y) * ratioY) : this.startShapePositions[index].y;
            ModelUtils.setShapeSize(this.history, this.model, shape, new Point(shapeLeft, shapeTop), new Size(shapeWidth, shapeHeight));
        });
        this.connectors.forEach((connector, index) => {
            const startPtIndex = connector.beginItem ? 1 : 0;
            const endPtIndex = connector.endItem ? (connector.points.length - 2) : (connector.points.length - 1);
            for(let i = startPtIndex; i <= endPtIndex; i++) {
                const connectorPtPos = new Point(
                    pos.x + (this.startConnectorPoints[index][i].x - this.startRectangle.x) * ratioX,
                    pos.y + (this.startConnectorPoints[index][i].y - this.startRectangle.y) * ratioY,
                );
                ModelUtils.moveConnectorPoint(this.history, connector, i, connectorPtPos);
            }
        });

        const shapes = this.selection.getSelectedShapes(false, true);
        shapes.forEach(shape => {
            ModelUtils.updateShapeAttachedConnectors(this.history, this.model, shape);
        });

        this.tryUpdateModelSize();
        this.visualizerManager.setResizeInfo(this.shapes);
    }
    tryUpdateModelSize() {
        this.handler.tryUpdateModelSize((offsetLeft, offsetTop) => {
            this.startShapePositions.forEach(pt => {
                pt.x += offsetLeft;
                pt.y += offsetTop;
            });
            this.startConnectorPoints.forEach(connector => {
                connector.forEach(pt => {
                    pt.x += offsetLeft;
                    pt.y += offsetTop;
                });
            });
            this.startRectangle.x += offsetLeft;
            this.startRectangle.y += offsetTop;
            this.startPoint.x += offsetLeft;
            this.startPoint.y += offsetTop;
        });
    }

    getDraggingElementKeys(): ItemKey[] {
        return this.shapes.map(shape => shape.key);
    }
    private getNormalizedSize(value: number, minValue: number, maxValue: number): number {
        if(minValue !== undefined)
            value = Math.max(value, minValue);
        if(maxValue !== undefined)
            value = Math.min(value, maxValue);
        return value;

    }
    private getSize(evt: DiagramMouseEvent, position: Point, startSize: Size,
        minWidth: number, minHeight: number, maxWidth: number, maxHeight: number,
        lockAspectRatio: boolean): Size {
        const absDeltaX = evt.modelPoint.x - (this.startScrollLeft - evt.scrollX) - this.startPoint.x;
        const absDeltaY = evt.modelPoint.y - (this.startScrollTop - evt.scrollY) - this.startPoint.y;
        let deltaX = absDeltaX * Math.cos(this.rotation) - (-absDeltaY) * Math.sin(this.rotation);
        let deltaY = -(absDeltaX * Math.sin(this.rotation) + (-absDeltaY) * Math.cos(this.rotation));
        let newWidth: number;
        let newHeight: number;
        deltaY = !this.sideV && deltaY > 0 ? Math.min(startSize.height + 1, deltaY) : deltaY;
        deltaX = !this.sideH && deltaX > 0 ? Math.min(startSize.width + 1, deltaX) : deltaX;
        if(!this.lockH && !this.lockV && lockAspectRatio)
            if(Math.abs(deltaX) > Math.abs(deltaY)) {
                newWidth = this.getNormalizedSize(this.sideH ? (startSize.width + deltaX) : (startSize.width - deltaX), minWidth, maxWidth);
                newHeight = startSize.height * (newWidth / startSize.width);
            }
            else {
                newHeight = this.getNormalizedSize(this.sideV ? (startSize.height + deltaY) : (startSize.height - deltaY), minHeight, maxHeight);
                newWidth = startSize.width * (newHeight / startSize.height);
            }

        else {
            deltaX = this.lockH ? 0 : deltaX;
            deltaY = this.lockV ? 0 : deltaY;
            newWidth = this.getNormalizedSize(this.sideH ? (startSize.width + deltaX) : (startSize.width - deltaX), minWidth, maxWidth);
            newHeight = this.getNormalizedSize(this.sideV ? (startSize.height + deltaY) : (startSize.height - deltaY), minHeight, maxHeight);
        }

        if(!this.lockH)
            newWidth = this.getSnappedPosition(evt, position.x + newWidth, true) - position.x;
        if(!this.lockV)
            newHeight = this.getSnappedPosition(evt, position.y + newHeight, false) - position.y;
        return new Size(newWidth, newHeight);
    }
    private getPosition(evt: DiagramMouseEvent, size: Size, startSize: Size, startPosition: Point): Point {
        let x = startPosition.x;
        let y = startPosition.y;
        if(this.resizeEventSource === ResizeEventSource.ResizeBox_N ||
            this.resizeEventSource === ResizeEventSource.ResizeBox_NE ||
            this.resizeEventSource === ResizeEventSource.ResizeBox_NW) {
            y += startSize.height - size.height;
            const snappedY = this.getSnappedPosition(evt, y, false);
            size.height += y - snappedY;
            y = snappedY;
        }
        if(this.resizeEventSource === ResizeEventSource.ResizeBox_W ||
            this.resizeEventSource === ResizeEventSource.ResizeBox_NW ||
            this.resizeEventSource === ResizeEventSource.ResizeBox_SW) {
            x += startSize.width - size.width;
            const snappedX = this.getSnappedPosition(evt, x, true);
            size.width += x - snappedX;
            x = snappedX;
        }
        return new Point(x, y);
    }
    private getSnappedPosition(evt: DiagramMouseEvent, pos: number, isHorizontal: boolean): number {
        return this.handler.getSnappedPositionOnResizeShape(evt, pos, isHorizontal);
    }
}
