import { ResourceCollection } from "../../Model/Collections/ResourceCollection";
import { DateRange } from "../../Model/WorkingTime/DateRange";
import { ResourcesDialogCommand } from "../ResourcesDialog";
import { TaskEditDialogCommand } from "../TaskEditDialog";
import { DialogParametersBase } from "./DialogParametersBase";

export class TaskEditParameters extends DialogParametersBase {
    id: string;
    title: string;
    progress: number;
    start: Date;
    end: Date;
    assigned: ResourceCollection;
    resources: ResourceCollection;
    showResourcesDialogCommand: ResourcesDialogCommand;
    showTaskEditDialogCommand: TaskEditDialogCommand;
    enableEdit: boolean = true;
    enableRangeEdit: boolean = true;
    isValidationRequired: boolean = false;
    getCorrectDateRange: (taskId: any, startDate: Date, endDate: Date) => DateRange;


    hiddenFields: string[] = [];
    readOnlyFields: string[] = [];

    clone(): TaskEditParameters {
        const clone = new TaskEditParameters();
        clone.id = this.id;
        clone.title = this.title;
        clone.progress = this.progress;
        clone.start = this.start;
        clone.end = this.end;
        clone.assigned = new ResourceCollection();
        clone.assigned.addRange(this.assigned.items);
        clone.resources = new ResourceCollection();
        clone.resources.addRange(this.resources.items);
        clone.showResourcesDialogCommand = this.showResourcesDialogCommand;
        clone.showTaskEditDialogCommand = this.showTaskEditDialogCommand;
        clone.enableEdit = this.enableEdit;
        clone.enableRangeEdit = this.enableRangeEdit;
        clone.hiddenFields = this.hiddenFields.slice();
        clone.readOnlyFields = this.readOnlyFields.slice();
        clone.isValidationRequired = this.isValidationRequired;
        clone.getCorrectDateRange = this.getCorrectDateRange;

        return clone;
    }
}
