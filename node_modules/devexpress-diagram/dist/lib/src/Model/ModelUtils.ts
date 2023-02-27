import { UnitConverter } from "@devexpress/utils/lib/class/unit-converter";
import { Metrics } from "@devexpress/utils/lib/geometry/metrics";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Vector } from "@devexpress/utils/lib/geometry/vector";
import { MathUtils } from "@devexpress/utils/lib/utils/math";

import { DiagramUnit } from "../Enums";
import { AddConnectionHistoryItem, SetConnectionPointIndexHistoryItem } from "../History/Common/AddConnectionHistoryItem";
import { AddConnectorHistoryItem } from "../History/Common/AddConnectorHistoryItem";
import { AddConnectorPointHistoryItem } from "../History/Common/AddConnectorPointHistoryItem";
import { AddShapeHistoryItem } from "../History/Common/AddShapeHistoryItem";
import { ChangeConnectorPointsHistoryItem, ReplaceConnectorPointsHistoryItem } from "../History/Common/ChangeConnectorPointsHistoryItem";
import { ChangeShapeParametersHistoryItem } from "../History/Common/ChangeShapeParametersHistoryItem";
import { DeleteConnectionHistoryItem } from "../History/Common/DeleteConnectionHistoryItem";
import { DeleteConnectorHistoryItem } from "../History/Common/DeleteConnectorHistoryItem";
import { DeleteShapeHistoryItem } from "../History/Common/DeleteShapeHistoryItem";
import { InsertToContainerHistoryItem } from "../History/Common/InsertToContainerHistoryItem";
import { MoveConnectorPointHistoryItem, MoveConnectorRightAnglePointsHistoryItem } from "../History/Common/MoveConnectorPointHistoryItem";
import { MoveShapeHistoryItem } from "../History/Common/MoveShapeHistoryItem";
import { RemoveFromContainerHistoryItem } from "../History/Common/RemoveFromContainerHistoryItem";
import { ResizeShapeHistoryItem } from "../History/Common/ResizeShapeHistoryItem";
import { SetSelectionHistoryItem } from "../History/Common/SetSelectionHistoryItem";
import { History } from "../History/History";
import { ModelResizeHistoryItem } from "../History/Page/ModelResizeHistoryItem";
import { UpdatePositionsOnPageResizeHistoryItem } from "../History/Page/UpdatePositionsOnPageResizeHistoryItem";
import { ChangeConnectorPropertyHistoryItem } from "../History/Properties/ChangeConnectorPropertyHistoryItem";
import { ChangeConnectorTextHistoryItem } from "../History/Properties/ChangeConnectorTextHistoryItem";
import { ChangeCustomDataHistoryItem } from "../History/Properties/ChangeCustomDataHistoryItem";
import { ChangeLockedHistoryItem } from "../History/Properties/ChangeLockedHistoryItem";
import { ChangeStyleHistoryItem } from "../History/StyleProperties/ChangeStyleHistoryItem";
import { ChangeStyleTextHistoryItem } from "../History/StyleProperties/ChangeStyleTextHistoryItem";
import { Graph } from "../Layout/Graph";
import { GraphInfo } from "../Layout/GraphInfo";
import { GraphLayout } from "../Layout/GraphLayout";
import { LayoutSettings } from "../Layout/LayoutSettings";
import { NodeInfo } from "../Layout/NodeLayout";
import { Edge } from "../Layout/Structures";
import { Selection } from "../Selection/Selection";
import { GeometryUtils, ObjectUtils } from "../Utils";
import { Connector, ConnectorPosition } from "./Connectors/Connector";
import { ConnectorLineOption } from "./Connectors/ConnectorProperties";
import { ConnectorRenderPoint } from "./Connectors/ConnectorRenderPoint";
import { ConnectorRenderPointsContext } from "./Connectors/Routing/ConnectorRenderPointsContext";
import { DiagramItem, ItemKey } from "./DiagramItem";
import { DiagramModel } from "./Model";
import { Shape } from "./Shapes/Shape";

export class ModelUtils {
    static setShapePosition(history: History, model: DiagramModel, shape: Shape, newPosition: Point,
        includeChildren: boolean = true): void {
        if(!shape.position.equals(newPosition)) {
            const delta = newPosition.clone().offset(-shape.position.x, -shape.position.y);
            history.addAndRedo(new MoveShapeHistoryItem(shape.key, newPosition));

            if(includeChildren)
                shape.children.forEach(child => {
                    if(child instanceof Shape) {
                        const childPosition = child.position.clone().offset(delta.x, delta.y);
                        ModelUtils.setShapePosition(history, model, child, childPosition);
                    }
                });
        }
    }
    static setShapeSize(history: History, model: DiagramModel, shape: Shape, newPosition: Point, newSize: Size): void {
        if(!shape.size.equals(newSize) || !shape.position.equals(newPosition))
            history.addAndRedo(new ResizeShapeHistoryItem(shape.key, newPosition, newSize));
    }
    static addConnectorPoint(history: History, connectorKey: string, pointIndex: number, position: Point): void {
        history.addAndRedo(new AddConnectorPointHistoryItem(connectorKey, pointIndex, position));
    }
    static deleteConnectorCustomPoints(history: History, connector: Connector): void {
        if(connector.points.length > 2) {
            const oldContext = connector.tryCreateRenderPointsContext();
            if(connector.properties.lineOption === ConnectorLineOption.Straight || !oldContext)
                history.addAndRedo(new ReplaceConnectorPointsHistoryItem(connector.key,
                    [
                        connector.points[0].clone(),
                        connector.points[connector.points.length - 1].clone()
                    ]));

            else {
                const beginPoint = connector.points[0].clone();
                const lastPoint = connector.points[connector.points.length - 1].clone();
                history.addAndRedo(new ChangeConnectorPointsHistoryItem(connector.key,
                    [beginPoint, lastPoint],
                    new ConnectorRenderPointsContext(
                        [
                            new ConnectorRenderPoint(beginPoint.x, beginPoint.y, 0),
                            new ConnectorRenderPoint(lastPoint.x, lastPoint.y, 1)
                        ],
                        false,
                        oldContext.actualRoutingMode)));
            }
        }
    }
    static deleteConnectorUnnecessaryPoints(history: History, connector: Connector): void {
        const oldRenderPoints = connector.getRenderPoints(true).map(p => p.clone());
        if(connector.properties.lineOption === ConnectorLineOption.Straight) {
            const unnecessaryPoints = ModelUtils.createUnnecessaryRenderPoints(
                oldRenderPoints.filter(p => !p.skipped).map(p => p.clone()),
                connector.skippedRenderPoints,
                removedPoint => ModelUtils.findFirstPointIndex(oldRenderPoints, p => p.equals(removedPoint)));
            if(Object.keys(unnecessaryPoints).length)
                history.addAndRedo(new ReplaceConnectorPointsHistoryItem(
                    connector.key,
                    ModelUtils.createNecessaryPoints(
                        connector.points.map(p => p.clone()),
                        unnecessaryPoints)));
        }
        else {
            const oldContext = connector.tryCreateRenderPointsContext(true);
            const newRenderPoints = oldRenderPoints.filter(p => !p.skipped).map(p => p.clone());
            const unnecessaryPoints = ModelUtils.createUnnecessaryRightAngleRenderPoints(
                newRenderPoints,
                connector.skippedRenderPoints,
                removedPoint => ModelUtils.findFirstPointIndex(oldRenderPoints, p => p.equals(removedPoint)));
            if(Object.keys(unnecessaryPoints).length) {
                const newPoints = ModelUtils.createNecessaryPoints(
                    connector.points.map(p => p.clone()),
                    unnecessaryPoints);
                const newRenderContext = new ConnectorRenderPointsContext(
                    ModelUtils.validateRenderPointIndexes(newPoints, newRenderPoints, 0),
                    oldContext.lockCreateRenderPoints,
                    oldContext.actualRoutingMode);
                history.addAndRedo(new ChangeConnectorPointsHistoryItem(connector.key, newPoints, newRenderContext));
            }
        }
    }

    static fixConnectorBeginEndConnectionIndex(history: History, connector: Connector): void {
        if(connector.beginItem && connector.beginConnectionPointIndex === -1) {
            const beginConnectionPointIndex = connector.beginItem.getNearestConnectionPoint(connector.points[0]);
            history.addAndRedo(new SetConnectionPointIndexHistoryItem(connector, beginConnectionPointIndex, ConnectorPosition.Begin));
        }
        if(connector.endItem && connector.endConnectionPointIndex === -1) {
            const endConnectionPointIndex = connector.endItem.getNearestConnectionPoint(connector.points[connector.points.length - 1]);
            history.addAndRedo(new SetConnectionPointIndexHistoryItem(connector, endConnectionPointIndex, ConnectorPosition.End));
        }
    }

    static skipUnnecessaryRenderPoints(points: ConnectorRenderPoint[]): void {
        const clonedPoints = points.map(p => p.clone());
        ModelUtils.removeUnnecessaryRenderPoints(clonedPoints);
        points.forEach(p => p.skipped = clonedPoints.some(cp => cp.skipped && cp.equals(p)));
        points[0].skipped = false;
        points[points.length - 1].skipped = false;
    }
    static skipUnnecessaryRightAngleRenderPoints(points: ConnectorRenderPoint[]): void {
        const clonedPoints = points.map(p => p.clone());
        ModelUtils.removeUnnecessaryRightAngleRenderPoints(clonedPoints);
        points.forEach(p => p.skipped = clonedPoints.some(cp => cp.skipped && cp.equals(p)));
        points[0].skipped = false;
        points[points.length - 1].skipped = false;
    }

    static removeUnnecessaryRenderPoints(points: ConnectorRenderPoint[]) : void {
        GeometryUtils.removeUnnecessaryPoints(points,
            (pt, index) => ModelUtils.removeUnnecessaryPoint(points, pt, index),
            pt => pt !== undefined && !pt.skipped
        );
        points[0].skipped = false;
        points[points.length - 1].skipped = false;
    }
    static removeUnnecessaryRightAngleRenderPoints(points: ConnectorRenderPoint[]) : void {
        GeometryUtils.removeUnnecessaryRightAnglePoints(points,
            (p, index) => ModelUtils.removeUnnecessaryPoint(points, p, index),
            p => p !== undefined && !p.skipped
        );
        points[0].skipped = false;
        points[points.length - 1].skipped = false;
    }

    static createUnnecessaryRenderPoints(renderPointsWithoutSkipped: ConnectorRenderPoint[], skippedRenderPoints: ConnectorRenderPoint[], getPosition : (removedPoint : ConnectorRenderPoint) => number, predicate : (p: ConnectorRenderPoint) => boolean = _ => true) : {[key: number] : ConnectorRenderPoint} {
        const result : {[key: number] : ConnectorRenderPoint} = {};
        GeometryUtils.removeUnnecessaryPoints(renderPointsWithoutSkipped, (removedPoint, removedIndex) => {
            return ModelUtils.collectNotSkippedRenderPoints(result, renderPointsWithoutSkipped, removedPoint, removedIndex, getPosition, predicate);
        });
        ModelUtils.collectSkippedRenderPoints(result, skippedRenderPoints, getPosition, predicate);
        return result;
    }
    static createUnnecessaryRightAngleRenderPoints(renderPointsWithoutSkipped: ConnectorRenderPoint[], skippedRenderPoints: ConnectorRenderPoint[], getPosition : (removedPoint : ConnectorRenderPoint) => number, predicate : (p: ConnectorRenderPoint) => boolean = _ => true) : {[key: number] : ConnectorRenderPoint} {
        const result : {[key: number] : ConnectorRenderPoint} = {};
        GeometryUtils.removeUnnecessaryRightAnglePoints(renderPointsWithoutSkipped, (removedPoint, removedIndex) => {
            return ModelUtils.collectNotSkippedRenderPoints(result, renderPointsWithoutSkipped, removedPoint, removedIndex, getPosition, predicate);
        });
        ModelUtils.collectSkippedRenderPoints(result, skippedRenderPoints, getPosition, predicate);
        return result;
    }

    static createNecessaryPoints(points: Point[], unnecessaryPoints: {[key: number] : ConnectorRenderPoint}) : Point[] {
        const result: Point[] = [];
        const lastPointIndex = points.length - 1;
        points.forEach((p, index) => {
            if(index === 0 || index === lastPointIndex || this.isNecessaryPoint(p, index, unnecessaryPoints))
                result.push(p.clone());
        });
        return result;
    }
    static isNecessaryPoint(point: Point, pointIndex: number, unnecessaryPoints: {[key: number] : ConnectorRenderPoint}) : boolean {
        return !Object.keys(unnecessaryPoints).some(key => {
            const unnecessaryPoint = unnecessaryPoints[key];
            return unnecessaryPoint.pointIndex === pointIndex && GeometryUtils.areDuplicatedPoints(point, unnecessaryPoint);
        });
    }

    private static collectSkippedRenderPoints(targetRenderPoints : {[key: number] : ConnectorRenderPoint}, skippedRenderPoints: ConnectorRenderPoint[], getPosition : (removedPoint : Point) => number, predicate : (p: ConnectorRenderPoint) => boolean = _ => true) : void {
        skippedRenderPoints && skippedRenderPoints.forEach(skippedPoint => {
            if(predicate(skippedPoint)) {
                const positionIndex = getPosition(skippedPoint);
                if(targetRenderPoints[positionIndex] === undefined)
                    targetRenderPoints[positionIndex] = skippedPoint;
            }
        });
    }
    private static collectNotSkippedRenderPoints(
        targetRenderPoints : {[key: number] : ConnectorRenderPoint},
        sourceRenderPoints : ConnectorRenderPoint[],
        removedPoint: ConnectorRenderPoint,
        removedIndex: number,
        getPosition : (removedPoint : Point) => number,
        predicate : (p: Point) => boolean = _ => true) : boolean {
        if(!predicate(removedPoint))
            return false;
        const positionIndex = getPosition(removedPoint);
        if(targetRenderPoints[positionIndex] === undefined) {
            targetRenderPoints[positionIndex] = removedPoint;
            removedPoint.skipped = true;
            sourceRenderPoints.splice(removedIndex, 1);
        }
        return true;
    }

    private static removeUnnecessaryPoint(points: ConnectorRenderPoint[], point: ConnectorRenderPoint, removedIndex: number) : boolean {
        if(point.pointIndex === -1) {
            points.splice(removedIndex, 1);
            return true;
        }
        point.skipped = true;
        return false;
    }

    static validateRenderPointIndexes(points: Point[], renderPoints: ConnectorRenderPoint[], startIndex: number): ConnectorRenderPoint[] {
        const result = renderPoints.map((rp, i) => new ConnectorRenderPoint(
            rp.x, rp.y,
            i >= startIndex && rp.pointIndex >= 0 ? this.findFirstPointIndex(points, p => p.equals(rp)) : rp.pointIndex,
            rp.skipped));
        result[0].skipped = false;
        result[result.length - 1].skipped = false;
        return result;
    }
    static findFirstPointIndex<T>(points: T[], predicate: (point: T) => boolean) : number {
        if(!points || !predicate)
            return -1;
        for(let i = 0; i < points.length; i++)
            if(predicate(points[i]))
                return i;
        return -1;
    }
    static moveConnectorRightAnglePoints(history: History, connector: Connector,
        firstPoint: Point, firstPointIndex: number,
        lastPoint: Point, lastPointIndex: number): void {
        if(!GeometryUtils.areDuplicatedPoints(connector.points[firstPointIndex], firstPoint) ||
            !GeometryUtils.areDuplicatedPoints(connector.points[lastPointIndex], lastPoint))
            history.addAndRedo(new MoveConnectorRightAnglePointsHistoryItem(
                connector.key, firstPointIndex, firstPoint, lastPointIndex, lastPoint));
    }
    static moveConnectorPoint(history: History, connector: Connector, pointIndex: number, newPosition: Point): boolean {
        if(!connector.points[pointIndex].equals(newPosition)) {
            history.addAndRedo(new MoveConnectorPointHistoryItem(connector.key, pointIndex, newPosition));
            return true;
        }
        return false;
    }
    static updateConnectorAttachedPoints(history: History, model: DiagramModel, connector: Connector): boolean {
        history.beginTransaction();
        const beginContainer = connector.beginItem && model.findItemCollapsedContainer(connector.beginItem);
        const beginAttachedToContainer = beginContainer && (!connector.endItem || !model.isContainerItem(beginContainer, connector.endItem));
        const endContainer = connector.endItem && model.findItemCollapsedContainer(connector.endItem);
        const endAttachedToContainer = endContainer && (!connector.beginItem || !model.isContainerItem(endContainer, connector.beginItem));
        let changed = false;
        if(beginAttachedToContainer)
            changed = this.updateConnectorBeginPoint(history, connector, beginContainer,
                (endAttachedToContainer && endContainer) || connector.endItem,
                index => beginContainer.getConnectionPointIndexForItem(connector.beginItem, index)
            ) || changed;
        else
            changed = this.updateConnectorBeginPoint(history, connector, connector.beginItem,
                (endAttachedToContainer && endContainer) || connector.endItem) || changed;

        if(endAttachedToContainer)
            changed = this.updateConnectorEndPoint(history, connector, endContainer,
                index => endContainer.getConnectionPointIndexForItem(connector.beginItem, index)
            ) || changed;
        else
            changed = this.updateConnectorEndPoint(history, connector, connector.endItem) || changed;
        history.endTransaction();
        return changed;
    }
    private static updateConnectorBeginPoint(history: History, connector: Connector, beginItem: DiagramItem, endItem: DiagramItem, getConnectionPointIndex?: (index: number) => number): boolean {
        if(beginItem) {
            const connectionPointIndex = getConnectionPointIndex !== undefined ?
                getConnectionPointIndex(connector.beginConnectionPointIndex) : connector.beginConnectionPointIndex;
            let targetPoint = connector.points[1];
            if(endItem && connector.points.length === 2)
                if(connector.endConnectionPointIndex !== -1)
                    targetPoint = endItem.getConnectionPointPosition(connector.endConnectionPointIndex, Point.zero());
                else
                    targetPoint = endItem.rectangle.center;

            const newPoint = beginItem.getConnectionPointPosition(connectionPointIndex, targetPoint);
            return this.moveConnectorPoint(history, connector, 0, newPoint.clone());
        }
    }
    private static updateConnectorEndPoint(history: History, connector: Connector, endItem: DiagramItem, getConnectionPointIndex?: (index: number) => number): boolean {
        if(endItem) {
            const connectionPointIndex = getConnectionPointIndex !== undefined ?
                getConnectionPointIndex(connector.endConnectionPointIndex) : connector.endConnectionPointIndex;
            const newPoint = endItem.getConnectionPointPosition(connectionPointIndex, connector.points[connector.points.length - 2]);
            return this.moveConnectorPoint(history, connector, connector.points.length - 1, newPoint);
        }
    }
    static updateContainerConnectorsAttachedPoints(history: History, model: DiagramModel, rootContainer: Shape, container: Shape = rootContainer): void {
        history.beginTransaction();
        const children = model.getChildren(container);
        children.forEach(child => {
            if(child instanceof Shape) {
                child.attachedConnectors.forEach(connector => {
                    const beginItemInContainer = connector.beginItem && model.isContainerItem(container, connector.beginItem);
                    const endItemInContainer = connector.endItem && model.isContainerItem(container, connector.endItem);
                    if(beginItemInContainer && !endItemInContainer) {
                        const collapsedContainer = model.findItemTopCollapsedContainer(connector.beginItem);
                        const endCollapsedContainer = connector.endItem && model.findItemTopCollapsedContainer(connector.endItem);
                        if(!collapsedContainer)
                            this.updateConnectorBeginPoint(history, connector, connector.beginItem,
                                endCollapsedContainer || connector.endItem);
                        else
                            this.updateConnectorBeginPoint(history, connector, collapsedContainer,
                                endCollapsedContainer || connector.endItem,
                                index => rootContainer.getConnectionPointIndexForItem(connector.beginItem, index)
                            );

                    }
                    if(endItemInContainer && !beginItemInContainer) {
                        const collapsedContainer = model.findItemTopCollapsedContainer(connector.endItem);
                        if(!collapsedContainer)
                            this.updateConnectorEndPoint(history, connector, connector.endItem);
                        else
                            this.updateConnectorEndPoint(history, connector, collapsedContainer,
                                index => rootContainer.getConnectionPointIndexForItem(connector.endItem, index)
                            );

                    }
                });
                this.updateContainerConnectorsAttachedPoints(history, model, rootContainer, child);
            }
        });
        history.endTransaction();
    }
    static getConnectorsWithoutBeginItemInfo(model: DiagramModel): { point: Point, connector: Connector }[] {
        const connectors = model.findConnectorsWithoutBeginItem();
        return connectors.map(c => {
            return {
                connector: c,
                point: c.points[0].clone()
            };
        });
    }
    static getConnectorsWithoutEndItemInfo(model: DiagramModel): { point: Point, connector: Connector }[] {
        const connectors = model.findConnectorsWithoutEndItem();
        return connectors.map(c => {
            return {
                connector: c,
                point: c.points[c.points.length - 1].clone()
            };
        });
    }
    static updateShapeAttachedConnectors(history: History, model: DiagramModel, shape: Shape): void {
        shape.attachedConnectors.forEach(connector => {
            this.tryRemoveConnectorIntermediatePoints(history, connector);
            this.updateConnectorAttachedPoints(history, model, connector);
        });
    }

    static updateMovingShapeConnections(history: History, shape: Shape,
        beginPointsInfo: { point: Point, connector: Connector }[],
        endPointsInfo: { point: Point, connector: Connector }[],
        resetTargetCallback: () => void,
        updateTargetCallback: (shape: Shape, connectionPointIndex: number) => void, beforeAttachConnectorCallback: (connector: Connector) => void): void {
        resetTargetCallback();
        beginPointsInfo.forEach(pi => {
            const connectionPointIndex = this.getMovingShapeConnectionPointIndex(shape, pi.point);
            if(shape.rectangle.containsPoint(pi.point) || connectionPointIndex > -1) {
                updateTargetCallback(shape, connectionPointIndex);
                if(connectionPointIndex !== pi.connector.beginConnectionPointIndex && pi.connector.beginItem)
                    history.addAndRedo(new DeleteConnectionHistoryItem(pi.connector, ConnectorPosition.Begin));
                beforeAttachConnectorCallback(pi.connector);
                history.addAndRedo(new AddConnectionHistoryItem(pi.connector, shape, connectionPointIndex,
                    ConnectorPosition.Begin));
            }
            else if(pi.connector.beginItem) {
                history.addAndRedo(new DeleteConnectionHistoryItem(pi.connector, ConnectorPosition.Begin));
                history.addAndRedo(new MoveConnectorPointHistoryItem(pi.connector.key, 0, pi.point));
            }
        });
        endPointsInfo.forEach(pi => {
            const connectionPointIndex = this.getMovingShapeConnectionPointIndex(shape, pi.point);
            if(shape.rectangle.containsPoint(pi.point) || connectionPointIndex > -1) {
                updateTargetCallback(shape, connectionPointIndex);
                if(connectionPointIndex !== pi.connector.endConnectionPointIndex && pi.connector.endItem)
                    history.addAndRedo(new DeleteConnectionHistoryItem(pi.connector, ConnectorPosition.End));
                beforeAttachConnectorCallback(pi.connector);
                history.addAndRedo(new AddConnectionHistoryItem(pi.connector, shape, connectionPointIndex,
                    ConnectorPosition.End));
            }
            else if(pi.connector.endItem) {
                history.addAndRedo(new DeleteConnectionHistoryItem(pi.connector, ConnectorPosition.End));
                history.addAndRedo(new MoveConnectorPointHistoryItem(pi.connector.key, pi.connector.points.length - 1, pi.point));
            }
        });
    }
    private static connectionPointActionSize: number = UnitConverter.pixelsToTwips(8);
    private static getMovingShapeConnectionPointIndex(shape: Shape, point: Point): number {
        let connectionPointIndex = -1;
        shape.getConnectionPoints().forEach((pt, index) => {
            if(Metrics.euclideanDistance(point, pt) < this.connectionPointActionSize)
                connectionPointIndex = index;
        });
        return connectionPointIndex;
    }
    static shouldRemoveConnectorIntermediatePoints(connector: Connector, shapes: DiagramItem[]) : boolean {
        if(connector.properties.lineOption !== ConnectorLineOption.Orthogonal || connector.points.length === 2 || !shapes || !shapes.length)
            return false;
        let index = 0;
        let shape;
        while(shape = shapes[index]) {
            if(this.isShapeIntersectConnectorCustomPoints(shape, connector))
                return true;
            index++;
        }
        return false;
    }
    static tryRemoveConnectorIntermediatePoints(history: History, connector: Connector): void {
        if(this.shouldRemoveConnectorIntermediatePoints(connector, [connector.beginItem, connector.endItem]))
            this.deleteConnectorCustomPoints(history, connector);
    }
    static isShapeIntersectConnectorCustomPoints(shape: DiagramItem, connector: Connector) : boolean {
        if(!shape)
            return false;
        const customRenderPoints = connector.getCustomRenderPoints(true);
        if(!customRenderPoints.length)
            return false;
        const offset = Connector.minOffset - UnitConverter.pixelsToTwips(1);
        return GeometryUtils.areIntersectedSegments(
            GeometryUtils.createSegments(customRenderPoints),
            GeometryUtils.createSegmentsFromRectangle(shape.rectangle.clone().inflate(offset, offset))
        );
    }
    static getSnappedPos(model: DiagramModel, gridSize: number, pos: number, isHorizontal: boolean): number {
        const snapOffset = isHorizontal ? model.snapStartPoint.x : model.snapStartPoint.y;
        return Math.round((pos - snapOffset) / gridSize) * gridSize + snapOffset;
    }

    static tryUpdateModelRectangle(history: History, processPoints?: (offsetLeft: number, offsetTop: number) => void): void {
        const offset = history.modelManipulator.getModelSizeUpdateOffset();
        if(!offset.isEmpty()) {
            history.addAndRedo(new ModelResizeHistoryItem(offset));
            if(offset.left || offset.top) {
                history.addAndRedo(new UpdatePositionsOnPageResizeHistoryItem(new Vector(offset.left, offset.top)));
                if(processPoints !== undefined)
                    processPoints(offset.left, offset.top);
            }
            history.modelManipulator.raiseModelRectangleChanged(history.modelManipulator.model.getRectangle(true));
        }
    }
    static deleteItems(history: History, model: DiagramModel, selection: Selection, items: DiagramItem[], deleteLocked?: boolean): void {
        history.beginTransaction();
        const itemsHash = {};
        items.forEach(item => itemsHash[item.key] = item);
        const selectionKeys = selection.getKeys().filter(key => !itemsHash[key]);
        history.addAndRedo(new SetSelectionHistoryItem(selection, selectionKeys));
        this.deleteItemsCore(history, model, items, deleteLocked);
        this.tryUpdateModelRectangle(history);
        history.endTransaction();
    }
    private static deleteItemsCore(history: History, model: DiagramModel, items: DiagramItem[], deleteLocked?: boolean) {
        items.sort(function(a, b) {
            const v1 = (a instanceof Connector) ? 0 : 1;
            const v2 = (b instanceof Connector) ? 0 : 1;
            return v1 - v2;
        });

        items.forEach(item => {
            if(item.container)
                this.removeFromContainer(history, model, item);
            if(item instanceof Shape) {
                const children = model.getChildren(item);
                if(children.length) {
                    children.forEach(child => {
                        history.addAndRedo(new RemoveFromContainerHistoryItem(child));
                        this.updateAttachedConnectorsContainer(history, model, child);
                    });
                    this.deleteItemsCore(history, model, children.filter(child => !child.locked || deleteLocked), deleteLocked);
                }

                if(model.findItem(item.key))
                    this.deleteShape(history, item);
            }
            if(item instanceof Connector)
                if(model.findItem(item.key))
                    this.deleteConnector(history, item);

        });
    }
    static detachConnectors(history: History, shape: Shape): void {
        history.beginTransaction();
        while(shape.attachedConnectors.length > 0) {
            const connector = shape.attachedConnectors[0];
            history.addAndRedo(new DeleteConnectionHistoryItem(connector,
                connector.beginItem === shape ? ConnectorPosition.Begin : ConnectorPosition.End));
        }
        history.endTransaction();
    }
    static deleteShape(history: History, shape: Shape): void {
        const allowed = history.modelManipulator.permissionsProvider.canDeleteItems([shape]);

        history.beginTransaction();
        this.detachConnectors(history, shape);
        history.addAndRedo(new DeleteShapeHistoryItem(shape.key, allowed));
        history.endTransaction();
    }
    static deleteConnector(history: History, connector: Connector): void {
        history.beginTransaction();
        if(connector.beginItem)
            history.addAndRedo(new DeleteConnectionHistoryItem(connector, ConnectorPosition.Begin));
        if(connector.endItem)
            history.addAndRedo(new DeleteConnectionHistoryItem(connector, ConnectorPosition.End));
        history.addAndRedo(new DeleteConnectorHistoryItem(connector.key));
        history.endTransaction();
    }
    static deleteAllItems(history: History, model: DiagramModel, selection: Selection): void {
        this.deleteItems(history, model, selection, model.items.slice(), true);
    }
    static deleteSelection(history: History, model: DiagramModel, selection: Selection): void {
        this.deleteItems(history, model, selection, selection.getSelectedItems());
    }
    static changeSelectionLocked(history: History, model: DiagramModel, selection: Selection, locked: boolean): void {
        history.beginTransaction();
        const items = selection.getSelectedItems(true);
        items.forEach(item => {
            history.addAndRedo(new ChangeLockedHistoryItem(item, locked));
        });
        ModelUtils.updateSelection(history, selection);
        history.endTransaction();
    }
    private static copyStylesToItem(history: History, model: DiagramModel, fromItem: DiagramItem, newItemKey: ItemKey): void {
        const toItem = model.findItem(newItemKey);
        fromItem.styleText.forEach(propertyName => {
            if(fromItem.styleText[propertyName] !== toItem.styleText[propertyName])
                history.addAndRedo(
                    new ChangeStyleTextHistoryItem(newItemKey, propertyName, fromItem.styleText[propertyName])
                );
        });
        fromItem.style.forEach(propertyName => {
            if(fromItem.style[propertyName] !== toItem.style[propertyName])
                history.addAndRedo(
                    new ChangeStyleHistoryItem(newItemKey, propertyName, fromItem.style[propertyName])
                );
        });
    }
    static updateSelection(history: History, selection: Selection): void {
        history.addAndRedo(new SetSelectionHistoryItem(selection, selection.getKeys(), true));
    }
    private static cloneShapeToOffset(history: History, model: DiagramModel, shape: Shape, dx: number, dy: number): ItemKey {
        history.beginTransaction();
        const newPosition = shape.position.clone().offset(dx, dy);
        const addHistoryItem = new AddShapeHistoryItem(shape.description, newPosition, shape.text);
        history.addAndRedo(addHistoryItem);
        const newKey = addHistoryItem.shapeKey;
        history.addAndRedo(new ResizeShapeHistoryItem(newKey, newPosition, shape.size.clone()));
        history.addAndRedo(new ChangeCustomDataHistoryItem(newKey, ObjectUtils.cloneObject(shape.customData)));
        history.addAndRedo(new ChangeShapeParametersHistoryItem(newKey, shape.parameters.clone()));
        this.copyStylesToItem(history, model, shape, newKey);
        history.endTransaction();
        return newKey;
    }
    private static applyOffsetToConnectorRenderPointsContext(context: ConnectorRenderPointsContext | undefined, dx: number, dy: number) : ConnectorRenderPointsContext {
        return context && context.renderPoints ? new ConnectorRenderPointsContext(context.renderPoints.map(p => p.clone().offset(dx, dy)), true, context.actualRoutingMode) : undefined;
    }
    private static cloneConnectorToOffset(history: History, model: DiagramModel, connector: Connector, beginItemKey: ItemKey,
        endItemKey: ItemKey, dx: number, dy: number): ItemKey {
        history.beginTransaction();
        const newPoints = connector.points.map(p => p.clone().offset(dx, dy));
        const addHistoryItem = new AddConnectorHistoryItem(newPoints, undefined, this.applyOffsetToConnectorRenderPointsContext(connector.tryCreateRenderPointsContext(), dx, dy));
        history.addAndRedo(addHistoryItem);
        const newKey = addHistoryItem.connectorKey;
        const newConnector = model.findConnector(newKey);
        connector.properties.forEach(propertyName => {
            if(connector.properties[propertyName] !== newConnector.properties[propertyName])
                history.addAndRedo(new ChangeConnectorPropertyHistoryItem(newKey, propertyName, connector.properties[propertyName]));
        });
        if(beginItemKey) {
            const from = model.findShape(beginItemKey);
            history.addAndRedo(new AddConnectionHistoryItem(newConnector, from, connector.beginConnectionPointIndex, ConnectorPosition.Begin));
        }
        if(endItemKey) {
            const to = model.findShape(endItemKey);
            history.addAndRedo(new AddConnectionHistoryItem(newConnector, to, connector.endConnectionPointIndex, ConnectorPosition.End));
        }
        const newTexts = connector.texts.clone();
        newTexts.forEach(connectorText => {
            history.addAndRedo(
                new ChangeConnectorTextHistoryItem(newConnector, connectorText.position, connectorText.value)
            );
        });
        this.copyStylesToItem(history, model, connector, newKey);
        history.endTransaction();
        return newKey;
    }
    static cloneSelectionToOffset(history: History, model: DiagramModel, onItemAdded: (itemKey: ItemKey) => void, selection: Selection, dx: number, dy: number): void {
        history.beginTransaction();
        const newShapes: { [key: string]: ItemKey } = {};
        const ids = [];
        selection.getSelectedShapes().forEach(shape => {
            const newKey = this.cloneShapeToOffset(history, model, shape, dx, dy);
            newShapes[shape.key] = newKey;
            ids.push(newKey);
            if(onItemAdded)
                onItemAdded(newKey);
        });
        selection.getSelectedConnectors().forEach(connector => {
            const beginItemKey = connector.beginItem ? newShapes[connector.beginItem.key] : null;
            const endItemKey = connector.endItem ? newShapes[connector.endItem.key] : null;
            const newKey = this.cloneConnectorToOffset(history, model, connector, beginItemKey, endItemKey, dx, dy);
            ids.push(newKey);
            if(onItemAdded)
                onItemAdded(newKey);
        });
        history.addAndRedo(new SetSelectionHistoryItem(selection, ids));
        ModelUtils.tryUpdateModelRectangle(history);
        history.endTransaction();
    }
    static findContainerByEventKey(model: DiagramModel, selection: Selection, key: ItemKey): Shape {
        const container = model.findContainer(key);
        if(container && !container.isLocked)
            return container;
        else {
            const shape = model.findShape(key);
            if(shape && shape.container && !selection.hasKey(shape.key))
                return ModelUtils.findContainerByEventKey(model, selection, shape.container.key);
        }
    }
    static canInsertToContainer(model: DiagramModel, item: DiagramItem, container: Shape): boolean {
        if(item === container)
            return false;
        if(item instanceof Shape)
            if(model.findChild(item, container.key))
                return false;

        return true;
    }
    static canInsertSelectionToContainer(model: DiagramModel, selection: Selection, container: Shape): boolean {
        let result = true;
        selection.getSelectedItems().forEach(item => {
            if(item === container) {
                result = false;
                return;
            }
            if(item instanceof Shape)
                if(model.findChild(item, container.key)) {
                    result = false;
                    return;
                }

        });
        return result;
    }
    static insertToContainer(history: History, model: DiagramModel, item: DiagramItem, container: Shape): void {
        if(!container.enableChildren) throw Error("Inpossible to add children to non-container shape.");
        if(!this.canInsertToContainer(model, item, container)) return;

        const oldContainer = item.container;
        if(oldContainer !== container) {
            history.beginTransaction();
            if(oldContainer) {
                history.addAndRedo(new RemoveFromContainerHistoryItem(item));
                item.attachedConnectors.forEach(connector => {
                    if(connector.container)
                        history.addAndRedo(new RemoveFromContainerHistoryItem(connector));
                });
            }
            history.addAndRedo(new InsertToContainerHistoryItem(item, container));
            this.updateAttachedConnectorsContainer(history, model, item);
            history.endTransaction();
        }
    }
    static removeFromContainer(history: History, model: DiagramModel, item: DiagramItem): void {
        if(item.container) {
            history.beginTransaction();
            history.addAndRedo(new RemoveFromContainerHistoryItem(item));
            this.updateAttachedConnectorsContainer(history, model, item);
            history.endTransaction();
        }
    }
    static insertSelectionToContainer(history: History, model: DiagramModel, selection: Selection, container: Shape): void {
        history.beginTransaction();
        const selectedItems = selection.getSelectedItems();
        const items = selectedItems.filter(item => !item.container || selectedItems.indexOf(item.container) === -1);
        items.forEach(item => {
            this.insertToContainer(history, model, item, container);
        });
        history.endTransaction();
    }
    static removeSelectionFromContainer(history: History, model: DiagramModel, selection: Selection): void {
        history.beginTransaction();
        selection.getSelectedItems().forEach(item => {
            if(item.container && !selection.hasKey(item.container.key)) {
                history.addAndRedo(new RemoveFromContainerHistoryItem(item));
                this.updateAttachedConnectorsContainer(history, model, item);
            }
        });
        history.endTransaction();
    }
    static getConnectorContainer(connector: Connector): Shape {
        if(connector.beginItem && connector.endItem) {
            const beginItemContainers = {};
            let containerForBeginItem = connector.beginItem.container;
            while(containerForBeginItem) {
                beginItemContainers[containerForBeginItem.key] = true;
                containerForBeginItem = containerForBeginItem.container;
            }
            let containerForEndItem = connector.endItem.container;
            while(containerForEndItem) {
                if(beginItemContainers[containerForEndItem.key] !== undefined)
                    return containerForEndItem;
                containerForEndItem = containerForEndItem.container;
            }
        }
    }
    static updateAttachedConnectorsContainer(history: History, model: DiagramModel, item: DiagramItem): void {
        history.beginTransaction();
        item.attachedConnectors.forEach(connector => {
            this.updateConnectorContainer(history, model, connector);
        });
        history.endTransaction();
    }
    static updateConnectorContainer(history: History, model: DiagramModel, connector: Connector): void {
        const container = this.getConnectorContainer(connector);
        if(container)
            history.addAndRedo(
                new InsertToContainerHistoryItem(connector, container)
            );

        else if(connector.container)
            history.addAndRedo(
                new RemoveFromContainerHistoryItem(connector)
            );

    }
    static updateNewShapeProperties(history: History, selection: Selection, itemKey: ItemKey): void {
        const style = selection.inputPosition.getDefaultStyle();
        style.forEach(propertyName => {
            history.addAndRedo(
                new ChangeStyleHistoryItem(itemKey, propertyName, selection.inputPosition.getDefaultStylePropertyValue(propertyName))
            );
        });
        const textStyle = selection.inputPosition.getDefaultTextStyle();
        textStyle.forEach(propertyName => {
            history.addAndRedo(
                new ChangeStyleTextHistoryItem(itemKey, propertyName, selection.inputPosition.getDefaultTextStylePropertyValue(propertyName))
            );
        });
    }
    static updateNewConnectorProperties(history: History, selection: Selection, itemKey: ItemKey): void {
        const connectorProperties = selection.inputPosition.getDefaultConnectorProperties();
        connectorProperties.forEach(propertyName => {
            history.addAndRedo(
                new ChangeConnectorPropertyHistoryItem(itemKey, propertyName, selection.inputPosition.getDefaultConnectorPropertyValue(propertyName))
            );
        });
        const style = selection.inputPosition.getDefaultStyle();
        style.forEach(propertyName => {
            history.addAndRedo(
                new ChangeStyleHistoryItem(itemKey, propertyName, selection.inputPosition.getDefaultStylePropertyValue(propertyName))
            );
        });
        const textStyle = selection.inputPosition.getDefaultTextStyle();
        textStyle.forEach(propertyName => {
            history.addAndRedo(
                new ChangeStyleTextHistoryItem(itemKey, propertyName, selection.inputPosition.getDefaultTextStylePropertyValue(propertyName))
            );
        });
    }
    static applyLayout(history: History, model: DiagramModel, container: Shape, graph: Graph<NodeInfo>,
        layout: GraphLayout, nonGraphItems: DiagramItem[], settings: LayoutSettings, snapToGrid: boolean, gridSize: number,
        skipPointIndices: boolean): Rectangle {
        history.beginTransaction();
        const occupiedRectangles = this.getOccupiedRectangles(nonGraphItems, container);

        layout = this.offsetLayoutToFreeSpace(layout, container && container.clientRectangle, occupiedRectangles,
            settings.containerPadding);
        if(snapToGrid)
            this.adjustLayoutToSnapGrid(model, layout, gridSize);
        if(container)
            this.resizeContainerOnLayout(history, model, layout, container, settings.containerPadding);

        this.applyLayoutToNodes(history, model, layout, graph.edges.map(e => model.findConnector(e.key)));
        this.applyLayoutToConnectors(history, model, layout, graph.edges.map(e => model.findConnector(e.key)), skipPointIndices);
        history.endTransaction();
        return layout.getRectangle(true);
    }
    static getNonGraphItems(model: DiagramModel, container: Shape, nodeKeyMap: {[nodeKey: string]: any},
        shapes: DiagramItem[], connectors: DiagramItem[]): DiagramItem[] {
        const allItems = container ? model.getChildren(container) : model.items.filter(item => !item.container);
        return allItems.filter(item => {
            if(item instanceof Connector)
                return (!item.beginItem || !nodeKeyMap[item.beginItem.key]) && (!item.endItem || !nodeKeyMap[item.endItem.key]) &&
                    connectors.indexOf(item) === -1;

            if(item instanceof Shape)
                return !nodeKeyMap[item.key] &&
                    shapes.indexOf(item) === -1;

        });
    }
    static getOccupiedRectangles(nonGraphItems: DiagramItem[], container: Shape): Rectangle[] {
        const occupiedRectangles = nonGraphItems.map(i => i.rectangle);
        if(container && occupiedRectangles.length) {
            const rect = container.clientRectangle;
            occupiedRectangles.push(new Rectangle(rect.right, rect.y, 1, 1));
            occupiedRectangles.push(new Rectangle(rect.right, rect.bottom, 1, 1));
        }
        return occupiedRectangles;
    }
    static offsetLayoutToFreeSpace(layout: GraphLayout, containerRect: Rectangle,
        occupiedRectangles: Rectangle[], spacing: number): GraphLayout {
        const graphItemRect = layout.getRectangle(true);
        const freePoint = GeometryUtils.findFreeSpace(occupiedRectangles,
            graphItemRect.createSize().offset(spacing, spacing).nonNegativeSize(), false, containerRect);
        if(freePoint) {
            const x = freePoint.x + spacing;
            const y = freePoint.y + spacing;
            return layout.offsetNodes(x, y);
        }
        const maxX = occupiedRectangles && occupiedRectangles.length ?
            occupiedRectangles.reduce((max, rect) => rect.right > max ? rect.right : max, 0) :
            (containerRect ? containerRect.x : 0);
        const minY = containerRect ? containerRect.y : Math.max(0, graphItemRect.y);
        return layout.offsetNodes(maxX + spacing, minY + spacing);
    }
    static resizeContainerOnLayout(history: History, model: DiagramModel, layout: GraphLayout,
        container: Shape, spacing: number): void {
        const layoutRect = layout.getRectangle(true);
        const nonLayoutRectangles = container.children
            .filter(item => {
                if(item instanceof Shape)
                    return layout.nodeKeys.indexOf(item.key) === -1;
                if(item instanceof Connector && item.beginItem && item.endItem)
                    return layout.nodeKeys.indexOf(item.beginItem.key) === -1 && layout.nodeKeys.indexOf(item.endItem.key) === -1;
                return false;
            })
            .map(item => item.rectangle);
        const right = nonLayoutRectangles.map(rect => rect.right).reduce((prev, cur) => Math.max(prev, cur), layoutRect.right);
        const bottom = nonLayoutRectangles.map(rect => rect.bottom).reduce((prev, cur) => Math.max(prev, cur), layoutRect.bottom);
        const width = container.rectangle.width + right + spacing - container.rectangle.right;
        const height = container.rectangle.height + bottom + spacing - container.rectangle.bottom;
        ModelUtils.setShapeSize(history, model, container, container.position, new Size(width, height));
        ModelUtils.updateShapeAttachedConnectors(history, model, container);
    }
    private static applyLayoutToNodes(history: History, model: DiagramModel, layout: GraphLayout, connectors: Connector[]) {
        const connectorsSet = connectors.reduce((acc, c) => acc[c.key] = true && acc, {});
        layout.forEachNode((nl, nk) => {
            const shape = model.findShape(nk);
            this.applyLayoutToNode(history, model, shape, nl.position, connectorsSet);
        });
    }
    private static applyLayoutToNode(history: History, model: DiagramModel, shape: Shape, position: Point, connectorsSet: {[key: string]: any}) {
        const delta = position.clone().offset(-shape.position.x, -shape.position.y);
        ModelUtils.setShapePosition(history, model, shape, position, false);
        if(delta.x !== 0 || delta.y !== 0) {
            shape.attachedConnectors
                .filter(c => !connectorsSet[c.key])
                .forEach(connector => {
                    this.updateConnectorAttachedPoints(history, model, connector);
                    const beginPointIndex = connector.beginItem ? 1 : 0;
                    const endPointIndex = connector.endItem ? (connector.points.length - 2) : (connector.points.length - 1);
                    for(let i = beginPointIndex; i <= endPointIndex; i++)
                        this.moveConnectorPoint(history, connector, i, connector.points[i].offset(delta.x, delta.y));
                });
            model.getChildren(shape).forEach(child => {
                if(child instanceof Shape) {
                    const childPosition = child.position.clone().offset(delta.x, delta.y);
                    this.applyLayoutToNode(history, model, child, childPosition, connectorsSet);
                }
            });
        }
    }
    private static applyLayoutToConnectors(history: History, model: DiagramModel, layout: GraphLayout, connectors: Connector[],
        skipPointIndices: boolean) {
        connectors.filter(c => c.beginItem || c.endItem).forEach(connector => {
            const edgeLayout = layout.edgeToPosition[connector.key];
            if(connector.beginItem && connector.endItem && !skipPointIndices && edgeLayout) {
                const beginIndex = connector.beginItem.getConnectionPointIndexForSide(edgeLayout.beginIndex);
                if(beginIndex !== connector.beginConnectionPointIndex)
                    history.addAndRedo(new SetConnectionPointIndexHistoryItem(connector, beginIndex, ConnectorPosition.Begin));
                const endIndex = connector.endItem.getConnectionPointIndexForSide(edgeLayout.endIndex);
                if(endIndex !== connector.endConnectionPointIndex)
                    history.addAndRedo(new SetConnectionPointIndexHistoryItem(connector, endIndex, ConnectorPosition.End));
            }
            this.updateConnectorAttachedPoints(history, model, connector);
            if(edgeLayout)
                this.deleteConnectorCustomPoints(history, connector);
        });
    }
    static adjustLayoutToSnapGrid(model: DiagramModel, layout: GraphLayout, gridSize: number): void {
        layout.nodeKeys.forEach(key => {
            layout.nodeToLayout[key].position.x = this.getSnappedPos(model, gridSize, layout.nodeToLayout[key].position.x, true);
            layout.nodeToLayout[key].position.y = this.getSnappedPos(model, gridSize, layout.nodeToLayout[key].position.y, false);
        });
    }
    static getGraphInfoByItems(model: DiagramModel, shapes: DiagramItem[], connectors: DiagramItem[], isDatabinding: boolean = true): GraphInfo[] {
        const itemsByContainerKey: {[key: string]: DiagramItem[]} = {};
        const items = [].concat(shapes).concat(connectors);
        items.forEach(item => {
            const containerKey = item.container && item.container.key;
            if(!itemsByContainerKey[containerKey])
                itemsByContainerKey[containerKey] = [];
            itemsByContainerKey[containerKey].push(item);
        });
        const result = [];
        for(const key in itemsByContainerKey) {
            if(!Object.prototype.hasOwnProperty.call(itemsByContainerKey, key)) continue;

            const container = key && model.findContainer(key);
            if(!container || (container.expanded && !model.findItemCollapsedContainer(container))) {
                const containerKey = container && container.key;
                const graph = this.getGraphByItems(model, itemsByContainerKey[key], containerKey, !isDatabinding);

                let allowCreateInfo = false;
                if(graph.nodes.length > 1)
                    allowCreateInfo = true;
                else if(graph.nodes.length)
                    if(isDatabinding)
                        allowCreateInfo = true;
                    else
                    if(container && itemsByContainerKey[container.container && container.container.key])
                        allowCreateInfo = true;


                if(allowCreateInfo)
                    result.push(new GraphInfo(container, graph));
            }
        }
        return result.sort((a: GraphInfo, b: GraphInfo) => b.level - a.level);
    }
    private static getGraphByItems(model: DiagramModel, items: DiagramItem[], containerKey: ItemKey, skipLocked: boolean): Graph<Shape> {
        const graph = new Graph<Shape>([], []);
        const knownIds: {[key: string]: boolean} = {};
        items.forEach(item => {
            this.extendByConnectedComponents(item, graph, containerKey, knownIds, skipLocked);
        });
        graph.nodes.sort((a, b) => model.getItemIndex(model.findItem(a)) - model.getItemIndex(model.findItem(b)));
        graph.edges.sort((a, b) => model.getItemIndex(model.findItem(a.key)) - model.getItemIndex(model.findItem(b.key)));
        graph.edges = graph.edges.filter(e => graph.getNode(e.from) && graph.getNode(e.to));
        return graph;
    }
    private static extendByConnectedComponents<T extends DiagramItem>(item: T, graph: Graph<Shape>, containerKey: ItemKey,
        knownIds: {[key: string]: boolean}, skipLocked: boolean) {
        if(!item || (skipLocked && item.locked) || knownIds[item.key]) return;

        knownIds[item.key] = true;
        if(item instanceof Connector && (item.container && item.container.key) === containerKey &&
            item.beginItem && (!item.beginItem.locked || !skipLocked) && item.endItem && (!item.endItem.locked || !skipLocked) &&
            item.beginItem !== item.endItem) {
            graph.addEdge(new Edge(item.key, item.beginItem && item.beginItem.key, item.endItem && item.endItem.key));
            this.extendByConnectedComponents(item.beginItem, graph, containerKey, knownIds, skipLocked);
            this.extendByConnectedComponents(item.endItem, graph, containerKey, knownIds, skipLocked);
        }
        else if(item instanceof Shape && (item.container && item.container.key) === containerKey) {
            graph.addNode(item);
            item.attachedConnectors.forEach(c => this.extendByConnectedComponents(c, graph, containerKey, knownIds, skipLocked));
        }
    }
    static getlUnitValue(units: DiagramUnit, twipsValue: number): number {
        switch(units) {
            case DiagramUnit.Cm:
                return UnitConverter.twipsToCentimeters(twipsValue);
            case DiagramUnit.In:
                return UnitConverter.twipsToInches(twipsValue);
            case DiagramUnit.Px:
                return UnitConverter.twipsToPixels(twipsValue);
        }
    }
    static getUnitText(units: DiagramUnit, unitItems: {[key: number]: string},
        formatUnit: (value: number) => string, twipsValue: number, fractionDigits: number = 2): string {
        const unitItemText = unitItems[units] ? " " + unitItems[units] : "";
        const unitValue = this.getlUnitValue(units, twipsValue);
        switch(units) {
            case DiagramUnit.Cm:
                return formatUnit(+unitValue.toFixed(fractionDigits)) + unitItemText;
            case DiagramUnit.In:
                return formatUnit(+unitValue.toFixed(fractionDigits)) + unitItemText;
            case DiagramUnit.Px:
                return formatUnit(+unitValue.toFixed(0)) + unitItemText;
        }
    }
    static getTwipsValue(units: DiagramUnit, value: number): number {
        switch(units) {
            case DiagramUnit.Cm:
                return UnitConverter.centimetersToTwips(value);
            case DiagramUnit.In:
                return UnitConverter.inchesToTwips(value);
            case DiagramUnit.Px:
                return UnitConverter.pixelsToTwips(value);
        }
    }


    static getGuidItemKey(): ItemKey {
        return MathUtils.generateGuid();
    }
    static createSelectedItems(selection: Selection): { [key: string] : DiagramItem } {
        const result : { [key: string] : DiagramItem } = {};
        selection.getSelectedItems(true).forEach(i => result[i.key] = i);
        return result;
    }
    static canMoveConnector(selectedItems : { [key: string] : DiagramItem }, connector: Connector): boolean {
        const beginItem = connector.beginItem;
        const endItem = connector.endItem;
        if(!beginItem && !endItem)
            return !connector.isLocked;
        if(!selectedItems[connector.key])
            return false;
        if(beginItem === endItem)
            return !!selectedItems[beginItem.key];
        if(!beginItem)
            return !!selectedItems[endItem.key];
        if(!endItem)
            return !!selectedItems[beginItem.key];
        return !!selectedItems[beginItem.key] && !!selectedItems[endItem.key];
    }
    static createRectangle(items: DiagramItem[]): Rectangle {
        return GeometryUtils.getCommonRectangle(items.map(i => i.rectangle));
    }
}
