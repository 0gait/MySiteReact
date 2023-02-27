import { BaseArguments } from "../BaseArguments";

export class ResourceInsertingArguments extends BaseArguments {

    constructor(text: string, color: string = "") {
        super(null);
        this.values = {
            text: text,
            color: color
        };
    }
    public get text(): string { return this.values.text; }
    public get color(): string { return this.values.color; }
}
