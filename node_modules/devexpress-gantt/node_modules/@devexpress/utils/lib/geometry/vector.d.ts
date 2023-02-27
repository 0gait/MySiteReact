import { Point } from './point';
import { Segment } from './segment';
export declare class Vector {
    x: number;
    y: number;
    get length(): number;
    constructor(x?: number, y?: number);
    static fromPoints(begin: Point, end: Point): Vector;
    static fromSegment(segment: Segment): Vector;
    normalize(): Vector;
    negative(): this;
    static get axisX(): Vector;
    static get axisY(): Vector;
    static angleBetween(a: Vector, b: Vector): number;
    static scalarProduct(a: Point | Vector, b: Point | Vector): number;
}
//# sourceMappingURL=vector.d.ts.map