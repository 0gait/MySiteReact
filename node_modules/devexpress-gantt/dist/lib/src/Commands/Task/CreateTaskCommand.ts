import { TaskInsertingArguments } from "../../Model/Events/Task/TaskInsertingArguments";
import { CreateTaskHistoryItem } from "../../Model/History/HistoryItems/Task/CreateTaskHistoryItem";
import { SimpleCommandState } from "../SimpleCommandState";
import { TaskCommandBase } from "./TaskCommandBase";

export class CreateTaskCommand extends TaskCommandBase {
    public execute(data: Record<string, any>): boolean {
        return super.execute(data);
    }
    protected executeInternal(data: Record<string, any>): boolean {
        data ??= { };
        if(!data.parentId) {
            const item = this.control.viewModel.findItem(this.control.currentSelectedTaskID);
            const selectedTask = item && item.task;
            if(selectedTask)
                data.parentId = selectedTask.parentId;
        }
        const referenceItem = this.control.viewModel.findItem(data.parentId) || this.control.viewModel.items[0];
        const referenceTask = referenceItem && referenceItem.task;
        if(!data.start)
            data.start = referenceTask ? new Date(referenceTask.start.getTime()) : new Date(this.control.range.start.getTime());
        if(!data.end)
            data.end = referenceTask ? new Date(referenceTask.end.getTime()) : new Date(this.control.range.end.getTime());
        data.title ??= "New task";
        data.progress ??= 0;
        const args = new TaskInsertingArguments(null, data);
        this.modelManipulator.dispatcher.notifyTaskCreating(args);
        if(!args.cancel) {
            this.history.addAndRedo(new CreateTaskHistoryItem(this.modelManipulator, args));
            const parentItem = this.control.viewModel.findItem(data.parentId);
            super.updateParent(parentItem);
        }
        return !args.cancel;
    }
    getState(): SimpleCommandState {
        const state = super.getState();
        state.visible = state.visible && this.control.settings.editing.allowTaskInsert;
        return state;
    }
}
