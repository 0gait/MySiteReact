import { Task } from "../../Entities/Task";
import { BaseArguments } from "../BaseArguments";


export class TaskRemovingArguments extends BaseArguments {
    constructor(task: Task) {
        super(task.id);
        this.values = task;
    }
}
