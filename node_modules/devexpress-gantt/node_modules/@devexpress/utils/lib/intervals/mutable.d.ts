import { ConstInterval } from './const';
export declare abstract class MutableInterval extends ConstInterval {
    abstract set start(val: number);
    abstract set length(val: number);
    abstract set end(val: number);
    abstract expand(interval: ConstInterval): this;
    normalizeLength(): this;
}
//# sourceMappingURL=mutable.d.ts.map