import { TaskEditParameters } from "../../../Dialogs/DialogParameters/TaskEditParameters";
import { BaseArguments } from "../BaseArguments";

export class TaskEditDialogShowingArguments extends BaseArguments {
    hiddenFields: string[];
    readOnlyFields: string[];

    constructor(params: TaskEditParameters) {
        super(params.id);
        this.values = {
            start: params.start,
            end: params.end,
            title: params.title,
            progress: params.progress
        };
        this.hiddenFields = params.hiddenFields;
        this.readOnlyFields = params.readOnlyFields;
    }
}
