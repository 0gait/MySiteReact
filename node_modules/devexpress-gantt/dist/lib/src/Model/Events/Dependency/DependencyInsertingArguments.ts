import { DependencyType } from "../../Entities/Enums";
import { BaseArguments } from "../BaseArguments";

export class DependencyInsertingArguments extends BaseArguments {

    constructor(predecessorId: string, successorId: string, type: DependencyType) {
        super(null);
        this.values = {
            predecessorId: predecessorId,
            successorId: successorId,
            type: type
        };
    }
    public get predecessorId(): string { return this.values.predecessorId; }
    public get successorId(): string { return this.values.successorId; }
    public get type(): DependencyType { return this.values.type; }
}
