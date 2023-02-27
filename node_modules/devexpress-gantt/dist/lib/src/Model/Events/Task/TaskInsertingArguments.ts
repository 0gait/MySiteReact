import { BaseArguments } from "../BaseArguments";

export class TaskInsertingArguments extends BaseArguments {

    constructor(key: any, data: Record<string, any>) {
        super(key);
        this.values = data ?? { };
    }
    public get start(): Date { return this.values.start; }
    public get end(): Date { return this.values.end; }
    public get title(): string { return this.values.title; }
    public get progress(): number { return this.values.progress; }
    public get parentId(): string { return this.values.parentId; }
    public get color(): string { return this.values.color; }
}
