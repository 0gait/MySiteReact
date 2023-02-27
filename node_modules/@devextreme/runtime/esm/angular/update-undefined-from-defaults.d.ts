export declare type DefaultEntries = {
    key: string;
    value: unknown;
}[];
export declare function updateUndefinedFromDefaults(componentInstance: Record<string, unknown>, changes: Record<string, {
    currentValue: unknown;
}>, defaultEntries: DefaultEntries): void;
