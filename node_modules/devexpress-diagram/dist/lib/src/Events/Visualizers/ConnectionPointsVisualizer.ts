import { EventDispatcher } from "../../Utils";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { IVisualizersListener } from "../EventManager";
import { ItemKey, ConnectionPointSide } from "../../Model/DiagramItem";

export class ConnectionPointInfo {
    public allowed: boolean = true;
    constructor(public point: Point, public side: ConnectionPointSide) {
    }
}

export class ConnectionPointsVisualizer {
    protected key: ItemKey;
    protected points: ConnectionPointInfo[];
    protected pointIndex: number;
    protected outsideRectangle: Rectangle;

    constructor(protected dispatcher: EventDispatcher<IVisualizersListener>) {}

    getKey() {
        return this.key;
    }
    setPoints(key: ItemKey, points: ConnectionPointInfo[], pointIndex: number, outsideRectangle: Rectangle) {
        if(this.key !== key || this.pointIndex !== pointIndex) {
            this.key = key;
            this.points = points;
            this.pointIndex = pointIndex;
            this.outsideRectangle = outsideRectangle;
            this.raiseShow();
        }
    }
    setPointIndex(pointIndex: number) {
        if(0 <= pointIndex && pointIndex < this.points.length && this.pointIndex !== pointIndex) {
            this.pointIndex = pointIndex;
            this.raiseShow();
        }
    }
    update() {
        this.raiseShow();
    }
    reset() {
        if(this.key !== "-1") {
            this.key = "-1";
            this.points = [];
            this.pointIndex = -1;
            this.outsideRectangle = undefined;
            this.raiseHide();
        }
    }

    raiseShow() {
        this.dispatcher.raise1(l => l.notifyConnectionPointsShow(this.key, this.points, this.pointIndex, this.outsideRectangle));
    }
    raiseHide() {
        this.dispatcher.raise1(l => l.notifyConnectionPointsHide());
    }
}
