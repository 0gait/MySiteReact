import { IPoint, IRectangle } from './interfaces';
import { Point } from './point';
export declare class Segment<T extends Point = Point> {
    startPoint: T;
    endPoint: T;
    get length(): number;
    get xLength(): number;
    get yLength(): number;
    get center(): Point;
    constructor(startPoint: T, endPoint: T);
    isIntersected<AnotherT extends Point>(segment: Segment<AnotherT>): boolean;
    containsPoint(point: IPoint, accuracy?: number): boolean;
    isIntersectedByRect(rect: IRectangle): boolean;
    private intersectCore;
}
//# sourceMappingURL=segment.d.ts.map