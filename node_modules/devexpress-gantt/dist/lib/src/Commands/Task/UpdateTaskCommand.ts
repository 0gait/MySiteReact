import { isDefined } from "@devexpress/utils/lib/utils/common";
import { ConstraintViolationOption } from "../../Dialogs/DialogEnums";
import { ConstraintViolationDialogParameters } from "../../Dialogs/DialogParameters/ConstraintViolationDialogParameters";
import { ITaskUpdateValues } from "../../Model/Entities/ITaskUpdateValues";
import { Task } from "../../Model/Entities/Task";
import { RemoveDependencyHistoryItem } from "../../Model/History/HistoryItems/Dependency/RemoveDependencyHistoryItem";
import { UpdateTaskHistoryItem } from "../../Model/History/HistoryItems/Task/UpdateTaskHistoryItem";
import { DateUtils } from "../../View/Utils/DateUtils";
import { TaskCommandBase } from "./TaskCommandBase";

export class UpdateTaskCommand extends TaskCommandBase {
    public execute(id: string, newValues: ITaskUpdateValues): boolean {
        return super.execute(id, newValues);
    }
    protected executeInternal(id: string, newValues: ITaskUpdateValues): boolean {
        const task = this.control.viewModel.tasks.getItemById(id);
        if(!task) return false;
        const success = this.control.modelManipulator.dispatcher.raiseTaskUpdating(
            task,
            newValues,
            (changedNewValues) => {
                newValues.title = changedNewValues.title;
                newValues.progress = changedNewValues.progress;
                newValues.start = changedNewValues.start;
                newValues.end = changedNewValues.end;
                newValues.color = changedNewValues.color;
            });

        if(success) {
            if(isDefined(newValues.start) && isDefined(newValues.end) && newValues.end.getTime() < newValues.start.getTime())
                newValues.end = newValues.start;
            if(isDefined(newValues["progress"]))
                newValues["progress"] = Math.max(Math.min(newValues["progress"], 100), 0);

            const updated = this.filterChangedValues(newValues, task);
            this.processDependecyValidation(updated, task);
        }

        return success;
    }

    isEnabled(): boolean {
        return super.isEnabled() && this.control.settings.editing.allowTaskUpdate;
    }
    protected filterChangedValues(newValues: Record<string, any>, task: Task): ITaskUpdateValues {
        if(!newValues)
            return null;
        const result = { };
        for(const key in task) {
            if(!Object.prototype.hasOwnProperty.call(task, key))
                continue;
            if(isDefined(newValues[key]) && task[key] !== newValues[key])
                result[key] = newValues[key];
        }
        return result;
    }
    protected processDependecyValidation(newValues: ITaskUpdateValues, task: Task): void {
        const callback = (parameters: ConstraintViolationDialogParameters) => {
            this.onAfterValidationCallback(newValues, task, parameters);
        };

        const validationRequired = this.control.isValidateDependenciesRequired();
        if(validationRequired) {
            let validationErrors = [];
            const startChanged = isDefined(newValues.start) && newValues.start !== task.start;
            const endChanged = isDefined(newValues.end) && newValues.end !== task.end;
            if(startChanged && validationRequired)
                validationErrors = validationErrors.concat(this.control.validationController.checkStartDependencies(task.internalId, newValues.start));
            if(endChanged && validationRequired)
                validationErrors = validationErrors.concat(this.control.validationController.checkEndDependencies(task.internalId, newValues.end));
            if(validationErrors.length > 0)
                this.control.commandManager.showConstraintViolationDialog.execute(new ConstraintViolationDialogParameters(validationErrors, callback));
            else
                callback(null);
        }
        else
            callback(null);
    }
    onAfterValidationCallback(updated: ITaskUpdateValues, task: Task, parameters?: ConstraintViolationDialogParameters): void {
        const canUpdateStartEnd = !parameters || parameters.option !== ConstraintViolationOption.DoNothing;
        if(!canUpdateStartEnd) {
            delete updated.start;
            delete updated.end;
        }

        if(Object.keys(updated).length > 0) {
            this.history.beginTransaction();

            if(parameters?.option === ConstraintViolationOption.RemoveDependency)
                parameters.validationErrors.forEach(ve => this.history.addAndRedo(new RemoveDependencyHistoryItem(this.modelManipulator, ve.dependencyId)));

            const moveRelatedTaskRequired = this.control.isValidateDependenciesRequired();
            const id = task.internalId;
            const oldStart = task.start;
            const oldEnd = task.end;
            this.history.addAndRedo(new UpdateTaskHistoryItem(this.modelManipulator, id, updated));

            if(isDefined(updated["start"]) && moveRelatedTaskRequired)
                this.control.validationController.moveStartDependTasks(id, oldStart);
            if(isDefined(updated["end"]) && moveRelatedTaskRequired)
                this.control.validationController.moveEndDependTasks(id, oldEnd);

            this.processAutoParentUpdate(id, updated, oldStart, oldEnd);
            this.history.endTransaction();

            if(parameters?.option === ConstraintViolationOption.RemoveDependency || parameters?.option === ConstraintViolationOption.KeepDependency)
                this.control.updateBarManager();
            this.control.updateViewDataRange();
        }
    }

    protected processAutoParentUpdate(id: string, newValues: ITaskUpdateValues, oldStart: Date, oldEnd: Date): void {
        const hasNewStart = isDefined(newValues.start);
        const hasNewEnd = isDefined(newValues.end);
        const needRecalculateParents = isDefined(newValues.progress) || hasNewStart || hasNewEnd;

        const startDelta = hasNewStart ? newValues.start.getTime() - oldStart.getTime() : null;
        const endDelta = hasNewEnd ? newValues.end.getTime() - oldEnd.getTime() : null;
        const startCrossedDST = hasNewStart && DateUtils.getTimezoneOffsetDiff(oldStart, newValues.start) !== 0;
        const endCrossedDST = hasNewEnd && DateUtils.getTimezoneOffsetDiff(oldEnd, newValues.end) !== 0;
        const taskCrossedDSTPoint = (startCrossedDST || endCrossedDST) && Math.abs(endDelta - startDelta) === DateUtils.msPerHour;

        const isMove = startDelta !== 0 && (startDelta === endDelta || taskCrossedDSTPoint);

        if(needRecalculateParents)
            if(isMove)
                this.validationController.correctParentsOnChildMoving(id, startDelta);
            else
                this.validationController.updateParentsIfRequired(id);
        else
            this.control.updateOwnerInAutoParentMode();

    }
}
