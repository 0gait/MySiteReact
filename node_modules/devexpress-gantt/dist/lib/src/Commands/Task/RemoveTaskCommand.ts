import { ConfirmationType } from "../../Dialogs/DialogEnums";
import { ConfirmationDialogParameters } from "../../Dialogs/DialogParameters/ConfirmationDialogParameters";
import { TaskRemovingArguments } from "../../Model/Events/Task/TaskRemovingArguments";
import { RemoveDependencyHistoryItem } from "../../Model/History/HistoryItems/Dependency/RemoveDependencyHistoryItem";
import { DeassignResourceHistoryItem } from "../../Model/History/HistoryItems/ResourceAssignment/DeassignResourceHistoryItem";
import { RemoveTaskHistoryItem } from "../../Model/History/HistoryItems/Task/RemoveTaskHistoryItem";
import { SimpleCommandState } from "../SimpleCommandState";
import { TaskCommandBase } from "./TaskCommandBase";

export class RemoveTaskCommand extends TaskCommandBase {
    public execute(id: string, confirmRequired: boolean = true, isApiCall: boolean = false, isUpdateParentTaskRequired: boolean = true, historyItem?: RemoveTaskHistoryItem, pendingDependencyIds?: string[]): boolean {
        this.isApiCall = isApiCall;
        this.isUpdateParentTaskRequired = isUpdateParentTaskRequired;
        if(confirmRequired) {
            this.control.commandManager.showConfirmationDialog.execute(new ConfirmationDialogParameters(ConfirmationType.TaskDelete,
                () => { this.executeInternal(id, historyItem, pendingDependencyIds); }));
            return false;
        }
        return super.execute(id, historyItem, pendingDependencyIds);
    }
    protected executeInternal(id: string, historyItem?: RemoveTaskHistoryItem, pendingDependencyIds?: string[]): boolean {
        const pendingDependencyKeys = pendingDependencyIds || [];
        id = id || this.control.currentSelectedTaskID;
        const item = this.control.viewModel.findItem(id);
        const task = item ? item.task : this.control.viewModel.tasks.getItemById(id);
        const args = new TaskRemovingArguments(task);
        this.modelManipulator.dispatcher.notifyTaskRemoving(args);
        if(args.cancel)
            return false;

        const history = this.history;
        const viewModel = this.control.viewModel;

        history.beginTransaction();
        viewModel.beginUpdate();
        const isRecursiveCall = !!historyItem;
        const removeTaskHistoryItem = new RemoveTaskHistoryItem(this.modelManipulator, id);
        const childTasks = viewModel.tasks.items.filter(t => t.parentId === id);
        const childIds = childTasks.map(t => t.internalId);
        const dependencies = viewModel.dependencies.items.filter(d => {
            return pendingDependencyKeys.indexOf(d.internalId) === -1 && (d.predecessorId === id || d.successorId === id) && !childIds.some(k => d.predecessorId === k || d.successorId === k);
        });
        if(dependencies.length) {
            if(!this.control.settings.editing.allowDependencyDelete) return false;
            dependencies.forEach(d => {
                removeTaskHistoryItem.add(new RemoveDependencyHistoryItem(this.modelManipulator, d.internalId));
                pendingDependencyKeys.push(d.internalId);
            });
        }
        const assignments = viewModel.assignments.items.filter(a => a.taskId === id);
        assignments.forEach(a => {
            if(this.modelManipulator.dispatcher.fireResourceUnassigning(a))
                removeTaskHistoryItem.add(new DeassignResourceHistoryItem(this.modelManipulator, a.internalId));
        });
        childTasks.reverse().forEach(t => new RemoveTaskCommand(this.control).execute(t.internalId, false, true, false, removeTaskHistoryItem, pendingDependencyKeys));
        if(!isRecursiveCall)
            history.addAndRedo(removeTaskHistoryItem);
        else
            historyItem.add(removeTaskHistoryItem);

        if(this.isUpdateParentTaskRequired) {
            const parent = this.control.viewModel.findItem(task.parentId);
            super.updateParent(parent);
        }

        history.endTransaction();
        viewModel.endUpdate();
        return true;
    }

    isEnabled(): boolean {
        const gantt = this.control;
        const selectedItem = gantt.viewModel.findItem(gantt.currentSelectedTaskID);
        const result = super.isEnabled() && (!!selectedItem && selectedItem.selected || this.isApiCall);
        return result;
    }
    getState(): SimpleCommandState {
        const state = super.getState();
        const gantt = this.control;
        state.visible = state.visible && gantt.settings.editing.allowTaskDelete;
        return state;
    }
    private isUpdateParentTaskRequired: boolean;
}
