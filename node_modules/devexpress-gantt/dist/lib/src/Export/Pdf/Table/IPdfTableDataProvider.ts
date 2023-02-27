export interface IPdfTableValueProvider {
    assign(source: any);
    hasValue(): boolean;
    getValue(): any;
}
