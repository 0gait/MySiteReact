import { ResourceCollection } from "../Model/Collections/ResourceCollection";
import { TaskEditDialogShowingArguments } from "../Model/Events/Dialogs/TaskEditDialogShowingArguments";
import { ResourceAssigningArguments } from "../Model/Events/ResourceAssignment/ResourceAssigningArguments";
import { AssignResourceHistoryItem } from "../Model/History/HistoryItems/ResourceAssignment/AssignResourceHistoryItem";
import { DeassignResourceHistoryItem } from "../Model/History/HistoryItems/ResourceAssignment/DeassignResourceHistoryItem";
import { Task } from "../Model/Entities/Task";
import { DialogBase } from "./DialogBase";
import { TaskEditParameters } from "./DialogParameters/TaskEditParameters";
import { SimpleCommandState } from "../Commands/SimpleCommandState";
import { isDefined } from "@devexpress/utils/lib/utils/common";
import { ITaskUpdateValues } from "../Model/Entities/ITaskUpdateValues";

export class TaskEditDialogCommand extends DialogBase<TaskEditParameters> {
    onBeforeDialogShow(params: TaskEditParameters): boolean {
        return this.modelManipulator.dispatcher.raiseTaskTaskEditDialogShowing(
            params,
            (args: TaskEditDialogShowingArguments) => {
                const newValues = args.values;
                params.start = newValues.start;
                params.end = newValues.end;
                params.progress = newValues.progress;
                params.title = newValues.title;
                params.readOnlyFields = args.readOnlyFields;
                params.hiddenFields = args.hiddenFields;
            }
        );
    }
    applyParameters(newParameters: TaskEditParameters, oldParameters: TaskEditParameters): boolean {
        this.history.beginTransaction();
        const updated = this.getUpdatedTaskData(newParameters, oldParameters);
        if(Object.keys(updated).length > 0)
            setTimeout(() => this.control.commandManager.updateTaskCommand.execute(oldParameters.id, updated), 0);

        for(let i = 0; i < newParameters.assigned.length; i++) {
            const resource = oldParameters.assigned.getItemById(newParameters.assigned.getItem(i).internalId);
            if(!resource) {
                const resourceId = newParameters.assigned.getItem(i).internalId;
                const taskId = oldParameters.id;
                const args = new ResourceAssigningArguments(resourceId, taskId);
                this.modelManipulator.dispatcher.notifyResourceAssigning(args);
                if(!args.cancel)
                    this.history.addAndRedo(new AssignResourceHistoryItem(this.modelManipulator, args.resourceId, args.taskId));
            }
        }
        for(let i = 0; i < oldParameters.assigned.length; i++) {
            const assigned = oldParameters.assigned.getItem(i);
            const resource = newParameters.assigned.getItemById(assigned.internalId);
            if(!resource) {
                const assignment = this.control.viewModel.assignments.items.filter(assignment => assignment.resourceId === assigned.internalId && assignment.taskId === oldParameters.id)[0];
                if(this.modelManipulator.dispatcher.fireResourceUnassigning(assignment))
                    this.history.addAndRedo(new DeassignResourceHistoryItem(this.modelManipulator, assignment.internalId));
            }
        }

        this.history.endTransaction();
        return false;
    }
    getUpdatedTaskData(newParameters: TaskEditParameters, oldParameters: TaskEditParameters): ITaskUpdateValues {
        const updated: ITaskUpdateValues = { };
        if(isDefined(newParameters.title) && oldParameters.title !== newParameters.title)
            updated.title = newParameters.title;
        if(isDefined(newParameters.progress) && oldParameters.progress !== newParameters.progress)
            updated.progress = newParameters.progress;
        if(isDefined(newParameters.start) && oldParameters.start !== newParameters.start)
            updated.start = newParameters.start;
        if(isDefined(newParameters.end) && oldParameters.end !== newParameters.end)
            updated.end = newParameters.end;
        return updated;
    }
    createParameters(options: Task): TaskEditParameters {
        options = options || this.control.viewModel.tasks.getItemById(this.control.currentSelectedTaskID);
        const param = new TaskEditParameters();
        param.id = options.internalId;
        param.title = options.title;
        param.progress = options.progress;
        param.start = options.start;
        param.end = options.end;
        param.assigned = this.control.viewModel.getAssignedResources(options);
        param.resources = new ResourceCollection();
        param.resources.addRange(this.control.viewModel.resources.items);
        param.showResourcesDialogCommand = this.control.commandManager.showResourcesDialog;
        param.showTaskEditDialogCommand = this.control.commandManager.showTaskEditDialog;
        param.enableEdit = this.isTaskEditEnabled();
        param.enableRangeEdit = this.isTaskRangeEditEnabled(options);
        param.isValidationRequired = this.control.isValidateDependenciesRequired();
        param.getCorrectDateRange = (taskId: any, startDate: Date, endDate: Date) => { return this.control.validationController.getCorrectDateRange(taskId, startDate, endDate); };

        return param;
    }
    isTaskEditEnabled(): boolean {
        const settings = this.control.settings;
        return settings.editing.enabled && settings.editing.allowTaskUpdate;
    }
    isTaskRangeEditEnabled(task: Task): boolean {
        return !this.control.viewModel.isTaskToCalculateByChildren(task.internalId);
    }
    isEnabled(): boolean {
        const gantt = this.control;
        const selectedItem = gantt.viewModel.findItem(gantt.currentSelectedTaskID);
        return (!!selectedItem && selectedItem.selected) || this.isApiCall;
    }
    getState(): SimpleCommandState {
        const state = super.getState();
        state.visible = state.visible && !this.control.taskEditController.dependencyId;
        return state;
    }
    getDialogName(): string {
        return "TaskEdit";
    }
}
