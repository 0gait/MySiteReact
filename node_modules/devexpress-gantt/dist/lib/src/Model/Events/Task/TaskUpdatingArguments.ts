import { ITaskUpdateValues } from "../../Entities/ITaskUpdateValues";
import { Task } from "../../Entities/Task";
import { BaseArguments } from "../BaseArguments";

export class TaskUpdatingArguments extends BaseArguments {
    newValues: ITaskUpdateValues;

    constructor(task: Task, newValues: ITaskUpdateValues) {
        super(task.id);
        this.values = task;
        this.createNewValues(newValues);
    }
    createNewValues(newValues: ITaskUpdateValues): void {
        this.newValues = { };
        for(const key in newValues)
            if(Object.prototype.hasOwnProperty.call(newValues, key)) {
                this.newValues[key] = newValues[key];
                Object.defineProperty(this, key, {
                    get: () => { return this.newValues[key]; }
                });
            }
    }
}
