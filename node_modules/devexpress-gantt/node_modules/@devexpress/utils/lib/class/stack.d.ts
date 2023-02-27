export declare class Stack<T> {
    private list;
    private _count;
    last: T | undefined;
    push(val: T): void;
    pop(): T | undefined;
    peek(): T | undefined;
    get count(): number;
    getPrevious(): T;
}
//# sourceMappingURL=stack.d.ts.map