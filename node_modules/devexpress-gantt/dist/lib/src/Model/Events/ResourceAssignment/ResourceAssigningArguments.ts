import { BaseArguments } from "../BaseArguments";

export class ResourceAssigningArguments extends BaseArguments {

    constructor(resourceId: string, taskId: string) {
        super(null);
        this.values = {
            resourceId: resourceId,
            taskId: taskId
        };
    }
    public get resourceId(): string { return this.values.resourceId; }
    public get taskId(): string { return this.values.taskId; }
}
