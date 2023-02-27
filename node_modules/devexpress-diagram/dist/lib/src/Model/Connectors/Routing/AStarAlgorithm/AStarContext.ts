import { SortedQueues } from "./SortedQueues";
import { UniqueAStarNodePositions } from "./UniqueAStarNodePositions";
import { AStarNode } from "./AStarNode";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { RoutingGrid } from "../RoutingGrid";
import { ConnectorProhibitedSegments } from "../ConnectorProhibitedSegments";
import { IAStarMetrics, RightAngleTurnDirection } from "./AStarMetrics";
import { Segment } from "@devexpress/utils/lib/geometry/segment";
import { RightAngleConnectorRoutingMathOperations } from "../Strategy/RightAngleConnectorRoutingMathOperations";
import { IConnectorRoutingContext } from "../Strategy/RightAngleConnectorRoutingContext";
import { DiagramItem } from "../../../DiagramItem";
import { ConnectionPoint } from "../../../ConnectionPoint";
import { GeometryUtils } from "../../../../Utils";

export interface IAStarContext<TPoint extends Point> {
    shouldStartContinue: boolean;
    shouldFinish: boolean;
    path: TPoint[];
    start(): void;
    startContinue(): void;
    endContinue(): void;
    finishWithPath(): void;
    finishWithoutPath(): void;
}

export abstract class AStarContextBase<TPoint extends Point> implements IAStarContext<TPoint> {
    generalSet: SortedQueues<AStarNode<TPoint>>;
    updatableSet: UniqueAStarNodePositions<TPoint>;
    currentNode: AStarNode<TPoint>;
    stepsCount: number;
    openNode: AStarNode<TPoint>;
    path: TPoint[];
    prohibitedPoints: { [key: string]: TPoint } = {};

    constructor(readonly startPosition : TPoint,
                readonly targetPosition: TPoint,
                readonly maxStepsCount: number) {
    }

    get shouldStartContinue(): boolean {
        return this.updatableSet.count > 0 && this.stepsCount < this.maxStepsCount;
    }
    get shouldFinish(): boolean {
        return this.currentNode.position.equals(this.targetPosition);
    }

    start(): void {
        this.generalSet = new SortedQueues<AStarNode<TPoint>>(x => x.key);
        this.updatableSet = new UniqueAStarNodePositions<TPoint>();
        const currentNode = new AStarNode<TPoint>(this.startPosition, this.getDistance(this.startPosition, this.targetPosition));
        this.currentNode = currentNode;
        this.generalSet.enqueue(currentNode);
        this.updatableSet.add(currentNode.position, currentNode);
        this.stepsCount = 0;
        this.openNode = undefined;
    }
    startContinue(): void {
        this.currentNode = this.generalSet.dequeueMin();
    }
    endContinue(): void {
        const currentPosition = this.currentNode.position;
        this.updatableSet.remove(currentPosition);
        this.addProhibitedPoint(currentPosition);
        this.getNeighborPoints(currentPosition).forEach(nextPosition => {
            const penalty = this.getPenalty(this.currentNode, nextPosition);
            let openNode = this.updatableSet.getNode(nextPosition);
            if(openNode === undefined) {
                openNode = new AStarNode<TPoint>(nextPosition, this.getDistance(nextPosition, this.targetPosition));
                openNode.parent = this.currentNode;
                openNode.penalty = penalty;
                this.generalSet.enqueue(openNode);
                this.updatableSet.add(nextPosition, openNode);
            }
            else if(openNode.penalty > penalty) {
                const generalSet = this.generalSet;
                generalSet.remove(openNode);
                openNode.parent = this.currentNode;
                openNode.penalty = penalty;
                generalSet.enqueue(openNode);
            }
            this.openNode = openNode;
        });
        this.stepsCount++;
    }

    finishWithPath(): void {
        this.path = this.currentNode.getPath();
    }
    finishWithoutPath(): void {
        this.path = [];
    }

    protected abstract addProhibitedPoint(point: TPoint): void;
    protected abstract getNeighborPoints(point: TPoint) : TPoint[];
    protected abstract getDistance(previousPoint: TPoint, nextPoint : TPoint) : number;
    protected abstract getPenalty(node: AStarNode<TPoint>, nextPoint : TPoint) : number;
}

export class AStarContext extends AStarContextBase<Point> {
    constructor(readonly routingContext: IConnectorRoutingContext<Point>,
                readonly startPosition : Point,
                readonly targetPosition: Point,
                readonly prohibitedSegments : ConnectorProhibitedSegments<Point>,
                readonly grid: RoutingGrid<Point>,
                readonly metrics: IAStarMetrics<Point, RightAngleTurnDirection>) {
        super(startPosition, targetPosition, 10000);
    }
    protected addProhibitedPoint(point: Point): void {
        this.prohibitedPoints[point.toString()] = point;
    }
    protected getNeighborPoints(point: Point) : Point[] {
        return this.grid.getNeighborPoints(point).filter(p => this.allowPoint(p));
    }
    protected getDistance(startPoint: Point, endPoint: Point): number {
        return this.metrics.distance(startPoint, endPoint);
    }
    protected getPenalty(node: AStarNode<Point>, nextPoint : Point): number {
        const parent = node.parent;
        const currentPosition = node.position;
        const turnDirection = this.getTurnDirection(parent ? GeometryUtils.createAngle(parent.position, currentPosition, nextPoint) : 0);
        const distance = this.getDistance(currentPosition, nextPoint);
        const middlePosition = new Segment(currentPosition, nextPoint).center;
        return node.penalty + this.metrics.penalty(distance, middlePosition, turnDirection, this.getIntersectedItems(middlePosition));
    }

    private allowPoint(p: Point): boolean {
        return this.prohibitedPoints[p.toString()] === undefined && (!this.prohibitedSegments || this.prohibitedSegments.allowPoint(p));
    }
    private getTurnDirection(angle: number): RightAngleTurnDirection {
        return RightAngleConnectorRoutingMathOperations.getTurnDirection(angle);
    }
    private getIntersectedItems(position: Point): DiagramItem[] {
        const margin = this.routingContext.shapeMargins;
        return this.routingContext.getIntersectedItems(position, (p, i) => this.hasIntersectedItem(p, i, margin));
    }
    private hasIntersectedItem(point: Point, item: DiagramItem, margin: number) : boolean {
        if(!this.isIntersectedWithExtendedRectangle(point, item, margin))
            return false;
        if(this.hasOneShapeConnection(item))
            return true;
        return !this.itemContainsConnectionPoints(item);
    }
    private isIntersectedWithExtendedRectangle(point: Point, item: DiagramItem, margin: number) : boolean {
        return item.rectangle.clone().inflate(margin).containsPoint(point);
    }
    private itemContainsConnectionPoints(item: DiagramItem) : boolean {
        const rectangle = item.rectangle;
        return rectangle.containsPoint(this.routingContext.beginPoint) && rectangle.containsPoint(this.routingContext.endPoint);
    }
    private hasOneShapeConnection(item: DiagramItem): boolean {
        const connectionPoints = item.getConnectionPoints();
        return this.isConnectionPoint(connectionPoints, this.routingContext.beginPoint) &&
            this.isConnectionPoint(connectionPoints, this.routingContext.endPoint);
    }
    private isConnectionPoint(connectionPoints: ConnectionPoint[], point: Point): boolean {
        return connectionPoints.filter(p => p.equals(point)).length > 0;
    }
}
