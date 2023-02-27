export declare abstract class ConstInterval {
    abstract get start(): number;
    abstract get length(): number;
    abstract get end(): number;
    get center(): number;
    isNormalized(): boolean;
    isCollapsed(): boolean;
    equals(obj: ConstInterval): boolean;
    static isCollapsed(intervals: ConstInterval[]): boolean;
    containsInterval(interval: ConstInterval): boolean;
    containsIntervalWithoutEnd(interval: ConstInterval): boolean;
    contains(pos: number): boolean;
    containsWithIntervalEnd(val: number): boolean;
    containsWithoutIntervalEndAndStart(pos: number): boolean;
}
//# sourceMappingURL=const.d.ts.map