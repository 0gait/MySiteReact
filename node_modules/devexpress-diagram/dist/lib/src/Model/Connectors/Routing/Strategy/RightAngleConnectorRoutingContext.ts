import { Point } from "@devexpress/utils/lib/geometry/point";
import { Segment } from "@devexpress/utils/lib/geometry/segment";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Vector } from "@devexpress/utils/lib/geometry/vector";

import { ConnectionPointSide, DiagramItem } from "../../../DiagramItem";
import { ConnectorRenderPoint } from "../../ConnectorRenderPoint";
import { RightAngleConnectorRoutingMathOperations } from "./RightAngleConnectorRoutingMathOperations";
import { IConnectorRoutingModel } from "../ConnectorRoutingModel";
import { ConnectorRenderSegment } from "../ConnectorRenderSegment";
import { RoutingGrid } from "../RoutingGrid";
import { ModelUtils } from "../../../ModelUtils";
import { AStarMetrics, IAStarMetrics, IntersectedShapeMetrics, IntersectedShapesMetrics, RightAngleTurnDirection, TurnDirectionMetrics } from "../AStarAlgorithm/AStarMetrics";
import { AStarContext, IAStarContext } from "../AStarAlgorithm/AStarContext";
import { AStarCalculator } from "../AStarAlgorithm/AStarCalculator";
import { ConnectorProhibitedSegments } from "../ConnectorProhibitedSegments";
import { GeometryUtils } from "../../../../Utils";

export interface IConnectorRoutingContext<TPoint extends Point> {
    points: TPoint[];
    renderSegments: ConnectorRenderSegment<TPoint>[];
    endPoint: TPoint;
    beginPoint: TPoint;
    shapeMargins : number;

    setup() : void;
    createRoutedPoints(startInfo: Point | Segment<Point>, targetInfo: Point | Segment<Point>, prohibitedSegments : ConnectorProhibitedSegments<TPoint>) : TPoint[];
    getIntersectedItems(point: TPoint, predicate : (p: TPoint, item: DiagramItem) => boolean): DiagramItem[];
    validateRenderPoints(result: ConnectorRenderPoint[]) : void;
}

export class CuttingItemsContext {
    cuttingItemKeys: string[] = [];

    get isEmpty() : boolean {
        return this.cuttingItemKeys.length === 0;
    }

    registerShape(key: string, rect: Rectangle, segments: Segment<ConnectorRenderPoint>[]) : boolean {
        if(GeometryUtils.areSegmentsCutRectangle(segments, rect)) {
            this.cuttingItemKeys.push(key);
            return true;
        }
        return false;
    }
}

export class IntersectingItemsByPointsContext<TPoint extends Point> {
    items: { [key: string]: { point: TPoint, items: DiagramItem[] } } = {};

    getOrAddItems(point: TPoint, getItems?: (point: TPoint) => DiagramItem[]): DiagramItem[] {
        if(point) {
            const key = point.toString();
            const item = this.items[key];
            if(item !== undefined)
                return item.items;
            if(getItems) {
                const items = getItems(point);
                this.items[key] = { point, items };
                return items;
            }
        }
        return undefined;
    }
}

export class RightAngleConnectorRoutingContext implements IConnectorRoutingContext<Point> {
    readonly beginConnectionSide : ConnectionPointSide;
    readonly endConnectionSide : ConnectionPointSide;
    readonly intersectedItemsByPointsContext : IntersectingItemsByPointsContext<Point>;
    readonly ignorableItemKeys: { [ key: string ] : boolean };

    beginConnectionSegment : Segment<Point> | Point;
    endConnectionSegment : Segment<Point> | Point;
    cuttingShapesContext: CuttingItemsContext;
    supportSegments: Segment<ConnectorRenderPoint>[];
    renderSegments: ConnectorRenderSegment<Point>[];
    isInvalidRenderSegments: boolean;
    routingGrid: RoutingGrid<Point>;
    metrics: IAStarMetrics<Point, RightAngleTurnDirection>;

    constructor(readonly routingModel: IConnectorRoutingModel,
        readonly points: Point[],
        readonly supportRenderPoints: ConnectorRenderPoint[],
        readonly beginConnectionShape: DiagramItem,
        readonly endConnectionShape: DiagramItem,
        beginConnectionPointIndex: number,
        endConnectionPointIndex: number) {
        this.beginConnectionSide = this.getConnectionSide(this.beginConnectionShape, beginConnectionPointIndex, this.beginPoint);
        this.endConnectionSide = this.getConnectionSide(this.endConnectionShape, endConnectionPointIndex, this.endPoint);
        this.ignorableItemKeys = {};
        this.cuttingShapesContext = new CuttingItemsContext();
        this.intersectedItemsByPointsContext = new IntersectingItemsByPointsContext();
        this.isInvalidRenderSegments = true;
    }
    get shapeMargins(): number {
        return this.routingModel.shapeMargins;
    }
    get beginPoint() : Point {
        return this.points[0];
    }
    get endPoint() : Point {
        return this.points[this.points.length - 1];
    }
    get hasIntersecting(): boolean {
        return !this.cuttingShapesContext.isEmpty;
    }
    get shouldCreateRenderPoints() : boolean {
        return this.isInvalidRenderSegments ||
            (!this.isSmallPath &&
            (this.hasIntersecting || this.isReversedStartConnection || this.isReversedEndConnection));
    }
    get beginPathPoint() : Point {
        return this.beginConnectionSegment instanceof Segment ? this.beginConnectionSegment.startPoint : this.beginConnectionSegment;
    }
    get endPathPoint() : Point {
        return this.endConnectionSegment instanceof Segment ? this.endConnectionSegment.endPoint : this.endConnectionSegment;
    }
    private get isReversedStartConnection(): boolean {
        if(!this.beginConnectionShape || this.beginConnectionSide === ConnectionPointSide.Undefined)
            return false;
        const beginConnectionSegment = this.beginConnectionSegment;
        return !(beginConnectionSegment instanceof Point) &&
            this.isReversedConnectionSegment(
                this.supportSegments[0],
                beginConnectionSegment
            );
    }
    private get isReversedEndConnection(): boolean {
        if(!this.endConnectionShape || this.endConnectionSide === ConnectionPointSide.Undefined)
            return false;
        const endConnectionSegment = this.endConnectionSegment;
        return !(endConnectionSegment instanceof Point) &&
            this.isReversedConnectionSegment(
                this.supportSegments[this.supportSegments.length - 1],
                endConnectionSegment
            );
    }
    private isReversedConnectionSegment(supportSegment: Segment<Point>, connectionSegment: Segment<Point>) : boolean {
        return Vector.scalarProduct(Vector.fromSegment(supportSegment), Vector.fromPoints(connectionSegment.startPoint, connectionSegment.endPoint)) <= 0;
    }
    private get isSmallPath() : boolean {
        const doubleMargins = 2 * this.routingModel.shapeMargins;
        return Math.abs(this.beginPathPoint.x - this.endPathPoint.x) < doubleMargins &&
                Math.abs(this.beginPathPoint.y - this.endPathPoint.y) < doubleMargins;
    }

    initialize(container: DiagramItem) : void {
        this.processContainers(container);
        this.processSupportSegments();
        this.processIntersection();
        this.processConnections();
        this.processRenderSegments();
    }
    setup() : void {
        this.processRoutingGrid();
        this.processRoutingMetrics();
    }
    createRoutedPoints(startInfo: Point | Segment<Point>, targetInfo: Point | Segment<Point>, prohibitedSegments : ConnectorProhibitedSegments<Point>) : Point[] {
        const startPathPoint = startInfo instanceof Point ? startInfo : startInfo.endPoint;
        const targetPathPoint = targetInfo instanceof Point ? targetInfo : targetInfo.startPoint;
        const context = this.createAStarContext(startPathPoint, targetPathPoint, prohibitedSegments);
        AStarCalculator.calculate(context);
        const result = context.path;
        this.addConnectionRoutedPoints(result, startInfo, targetInfo);
        RightAngleConnectorRoutingMathOperations.unionPoints(result);
        return result;
    }
    getIntersectedItems(point: Point, predicate : (p: Point, item: DiagramItem) => boolean): DiagramItem[] {
        return this.intersectedItemsByPointsContext.getOrAddItems(
            point,
            p => this.routingModel
                .getItems(this.beginConnectionShape, this.endConnectionShape)
                .filter(s => !this.isIgnorableItem(s) && predicate(p, s)));
    }
    validateRenderPoints(result: ConnectorRenderPoint[]) {
        if(this.isInvalidRenderSegments) {
            RightAngleConnectorRoutingMathOperations.unionPoints(result);
            ModelUtils.validateRenderPointIndexes(this.points, result, 0);
        }
        ModelUtils.skipUnnecessaryRightAngleRenderPoints(result);
    }

    processContainers(container: DiagramItem) {
        if(container)
            this.registerIgnorableShape(container);
        if(this.beginConnectionShape) {
            const beginShapeContainer = this.beginConnectionShape.container;
            if(beginShapeContainer)
                this.registerIgnorableShape(beginShapeContainer);
        }
        if(this.endConnectionShape) {
            const endShapeContainer = this.endConnectionShape.container;
            if(endShapeContainer)
                this.registerIgnorableShape(endShapeContainer);
        }
    }
    processSupportSegments() : void {
        this.supportSegments = this.createSupportSegments();
    }
    processIntersection(): void {
        const shapes = this.routingModel.getItems(this.beginConnectionShape, this.endConnectionShape);
        if(shapes)
            shapes.forEach(s => {
                const key = s.key;
                const rect = s.rectangle;
                if(!this.cuttingShapesContext.registerShape(key, rect, this.supportSegments)) {
                    if((!this.isConnectedByStart(s) && rect.containsPoint(this.beginPoint)) ||
                        !this.isConnectedByEnd(s) && rect.containsPoint(this.endPoint))
                        this.registerIgnorableShape(s);
                }
                else if(this.ignorableItemKeys[key] !== undefined)
                    delete this.ignorableItemKeys[key];
            });
    }
    processConnections(): void {
        let beginShapeContainsEndConnection = false;
        let endShapeContainsBeginConnection = false;
        if(this.beginConnectionShape !== this.endConnectionShape) {
            beginShapeContainsEndConnection = this.shapeContainsOtherConnection(this.beginConnectionShape, this.endConnectionShape, this.endPoint);
            endShapeContainsBeginConnection = this.shapeContainsOtherConnection(this.endConnectionShape, this.beginConnectionShape, this.beginPoint);
            if(beginShapeContainsEndConnection)
                this.registerIgnorableShape(this.beginConnectionShape);
            if(endShapeContainsBeginConnection)
                this.registerIgnorableShape(this.endConnectionShape);
        }
        const shapeMargins = this.routingModel.shapeMargins;
        this.beginConnectionSegment = this.createBeginConnectionSegment(shapeMargins, beginShapeContainsEndConnection);
        this.endConnectionSegment = this.createEndConnectionSegment(shapeMargins, endShapeContainsBeginConnection);
    }
    processRenderSegments() {
        this.isInvalidRenderSegments = false;
        this.renderSegments = this.createRenderSegments();
        for(let i = 0; i < this.renderSegments.length - 1; i++) {
            const renderSegment = this.renderSegments[i];
            const nextRenderSegment = this.renderSegments[i + 1];
            if(renderSegment.endPoint.equals(nextRenderSegment.startPoint)) {
                this.isInvalidRenderSegments = true;
                return;
            }
        }
    }
    createGridPoints(): Point[] {
        const result : Point[] = [];
        this.renderSegments.forEach(s => s.createGridPoints().forEach(p => result.push(p)));
        return result;
    }

    private processRoutingGrid() {
        this.routingGrid = this.createGrid();
    }
    private processRoutingMetrics() {
        this.metrics = this.createAStarMetrics();
    }
    private createAStarMetrics() : IAStarMetrics<Point, RightAngleTurnDirection> {
        return new AStarMetrics(
            new TurnDirectionMetrics(this.routingModel.penaltyDescription),
            new IntersectedShapesMetrics(new IntersectedShapeMetrics(this.routingModel.penaltyDescription, this.routingModel.shapeMargins)));
    }
    private createAStarContext(start : Point, target: Point, prohibitedSegments : ConnectorProhibitedSegments<Point>) : IAStarContext<Point> {
        return new AStarContext(this, start, target, prohibitedSegments, this.routingGrid, this.metrics);
    }
    private addConnectionRoutedPoints(path : Point[], startInfo: Point | Segment<Point>, targetInfo: Point | Segment<Point>) : void {
        if(startInfo instanceof Segment)
            path.splice(0, 0, startInfo.startPoint);
        if(targetInfo instanceof Segment)
            path.push(targetInfo.endPoint);
    }
    private createSupportSegments() : Segment<ConnectorRenderPoint>[] {
        return this.supportRenderPoints.length <= 1 ? [] : GeometryUtils.createSegments(this.supportRenderPoints).filter(s => !this.isCustomSegment(s, this.supportRenderPoints[0], this.supportRenderPoints[this.supportRenderPoints.length - 1]));
    }
    private isCustomSegment(segment: Segment<ConnectorRenderPoint>, startSegmentsPoint: ConnectorRenderPoint, endSegmentsPoint: ConnectorRenderPoint) : boolean {
        const startRenderPoint = segment.startPoint;
        if(startRenderPoint.equals(startSegmentsPoint))
            return false;
        const endRenderPoint = segment.endPoint;
        if(endRenderPoint.equals(endSegmentsPoint))
            return false;
        return endRenderPoint.pointIndex - startRenderPoint.pointIndex === 1;
    }
    private createRenderSegments() : ConnectorRenderSegment<Point>[] {
        const unionRoutingSegments = RightAngleConnectorRoutingMathOperations.createUnionSegments(this.supportSegments, (ep, sp) => this.shouldCreateSegment(ep, sp));
        const lastIndex = unionRoutingSegments.length - 1;
        return unionRoutingSegments.map((s, i) =>
            new ConnectorRenderSegment(
                i > 0 ? new Point(s.startPoint.x, s.startPoint.y) : this.beginConnectionSegment,
                i < lastIndex ? new Point(s.endPoint.x, s.endPoint.y) : this.endConnectionSegment,
                s.startPoint.pointIndex,
                this.createPreviousCustomSegment(s.startPoint)
            )
        );
    }
    private createPreviousCustomSegment(startRoutingPoint: ConnectorRenderPoint) : Segment<Point> {
        const previuosPointIndex = startRoutingPoint.pointIndex - 1;
        return previuosPointIndex >= 0 ? new Segment(this.points[previuosPointIndex].clone(), new Point(startRoutingPoint.x, startRoutingPoint.y)) : undefined;
    }
    private shouldCreateSegment(prevEndPoint : ConnectorRenderPoint, startNextPoint: ConnectorRenderPoint) : boolean {
        return !prevEndPoint.equals(startNextPoint) || startNextPoint.pointIndex > 0;
    }
    private isPathNormal(connectionSide: ConnectionPointSide): boolean {
        if(connectionSide === ConnectionPointSide.Undefined)
            return true;
        return RightAngleConnectorRoutingMathOperations.isSegmentNormal(new Segment(this.beginPoint, this.endPoint),
            connectionSide === ConnectionPointSide.East || connectionSide === ConnectionPointSide.West);
    }
    private registerIgnorableShape(shape: DiagramItem) {
        this.ignorableItemKeys[shape.key] = true;
    }
    private isConnectedByStart(shape: DiagramItem) : boolean {
        return this.beginConnectionShape && this.beginConnectionShape.key === shape.key && this.beginConnectionSide !== ConnectionPointSide.Undefined;
    }
    private isConnectedByEnd(shape: DiagramItem) : boolean {
        return this.endConnectionShape && this.endConnectionShape.key === shape.key && this.endConnectionSide !== ConnectionPointSide.Undefined;
    }
    private getConnectionSide(shape: DiagramItem, index: number, point: Point) : ConnectionPointSide {
        return shape ? shape.getConnectionPointSideByIndex(index, point) : ConnectionPointSide.Undefined;
    }
    private shapeContainsOtherConnection(targetShape: DiagramItem, otherShape: DiagramItem, otherPoint: Point) : boolean {
        if(!targetShape)
            return false;
        const targetRectangle = targetShape.rectangle;
        return targetRectangle.containsPoint(otherPoint) &&
            (!otherShape || !otherShape.rectangle.equals(targetRectangle));
    }
    private createBeginConnectionSegment(offset: number, beginShapeContainsEndConnection: boolean): Segment<Point> | Point {
        if(this.beginConnectionSide === ConnectionPointSide.Undefined)
            return this.createBeginConnectionSegmentCore(offset);
        if(!beginShapeContainsEndConnection || !this.routingModel.shouldReverseConnections) {
            let segment = this.createBeginConnectionSegmentCore(offset);
            if(segment instanceof Point || !this.routingModel.shouldResizeConnections)
                return segment;
            const startPoint = segment.startPoint;
            let endPoint = segment.endPoint;
            let currentOffset = offset;
            while(this.hasIntersectedItemsByPoint(endPoint, startPoint, this.beginConnectionShape)) {
                currentOffset = currentOffset / 2;
                segment = <Segment> this.createBeginConnectionSegmentCore(currentOffset);
                endPoint = segment.endPoint;
            }
            return segment;
        }
        if(!this.endConnectionShape)
            return this.createBeginConnectionSegmentCore(-offset);
        if(this.isPathNormal(this.endConnectionSide))
            return this.createBeginConnectionSegmentCore(-offset);
        const reversedSegment = <Segment> this.createBeginConnectionSegmentCore(-2 * offset);
        if(this.isEndConnectionRectanleLineIntersected(reversedSegment, false, true))
            return this.createBeginConnectionSegmentCore(offset);
        return this.createBeginConnectionSegmentCore(-offset);
    }
    private hasIntersectedItemsByPoint(point : Point, secondPoint : Point, connectionItem : DiagramItem) : boolean {
        const intersectedItems = this.getIntersectedItems(point, (p, s) => s.rectangle.containsPoint(p) && !s.rectangle.containsPoint(secondPoint) && s.key !== connectionItem.key);
        return intersectedItems !== undefined && intersectedItems.length > 0;
    }

    private createEndConnectionSegment(offset: number, endShapeContainsBeginConnection : boolean): Segment<Point> | Point {
        if(this.endConnectionSide === ConnectionPointSide.Undefined)
            return this.createEndConnectionSegmentCore(offset);
        if(!endShapeContainsBeginConnection || !this.routingModel.shouldReverseConnections) {
            let segment = this.createEndConnectionSegmentCore(offset);
            if(segment instanceof Point || !this.routingModel.shouldResizeConnections)
                return segment;
            const endPoint = segment.endPoint;
            let startPoint = segment.startPoint;
            let currentOffset = offset;
            while(this.hasIntersectedItemsByPoint(startPoint, endPoint, this.endConnectionShape)) {
                currentOffset = currentOffset / 2;
                segment = <Segment> this.createEndConnectionSegmentCore(currentOffset);
                startPoint = segment.startPoint;
            }
            return segment;
        }
        if(!this.beginConnectionShape)
            return this.createEndConnectionSegmentCore(-offset);
        if(this.isPathNormal(this.beginConnectionSide))
            return this.createEndConnectionSegmentCore(-offset);
        const reversedSegment = <Segment> this.createEndConnectionSegmentCore(-2 * offset);
        if(this.isBeginConnectionRectanleLineIntersected(reversedSegment, true, false))
            return this.createEndConnectionSegmentCore(offset);
        return this.createEndConnectionSegmentCore(-offset);
    }
    private createBeginConnectionSegmentCore(offset: number): Segment<Point> | Point {
        return RightAngleConnectorRoutingMathOperations.createBeginConnectionSegment(this.beginConnectionSide, this.beginPoint, offset, (x, y) => new Point(x, y));
    }
    private createEndConnectionSegmentCore(offset: number): Segment<Point> | Point {
        return RightAngleConnectorRoutingMathOperations.createEndConnectionSegment(this.endConnectionSide, this.endPoint, offset, (x, y) => new Point(x, y));
    }
    private isBeginConnectionRectanleLineIntersected(segment : Segment<Point>, excludeBeginPoint : boolean, excludeEndPoint: boolean) : boolean {
        return RightAngleConnectorRoutingMathOperations.isConnectionRectanleLineIntersected(this.beginConnectionShape.rectangle, segment, this.beginConnectionSide, excludeBeginPoint, excludeEndPoint, (x, y) => new Point(x, y));
    }
    private isEndConnectionRectanleLineIntersected(segment : Segment<Point>, excludeBeginPoint : boolean, excludeEndPoint: boolean) : boolean {
        return RightAngleConnectorRoutingMathOperations.isConnectionRectanleLineIntersected(this.endConnectionShape.rectangle, segment, this.endConnectionSide, excludeBeginPoint, excludeEndPoint, (x, y) => new Point(x, y));
    }
    private isIgnorableItem(item: DiagramItem) : boolean {
        return this.ignorableItemKeys[item.key] !== undefined;
    }
    private createExtendedShapesBounds() : Rectangle[] {
        return this.routingModel.getItems(this.beginConnectionShape, this.endConnectionShape).map(i => i.rectangle.clone().inflate(this.routingModel.shapeMargins));
    }
    private createGrid() : RoutingGrid<Point> {
        return RoutingGrid.create(
            this.createGridPoints(),
            this.createExtendedShapesBounds(),
            (x, y) => new Point(x, y));
    }
}
