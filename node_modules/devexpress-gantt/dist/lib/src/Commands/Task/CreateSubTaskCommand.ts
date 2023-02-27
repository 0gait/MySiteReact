import { TaskInsertingArguments } from "../../Model/Events/Task/TaskInsertingArguments";
import { CreateTaskHistoryItem } from "../../Model/History/HistoryItems/Task/CreateTaskHistoryItem";
import { SimpleCommandState } from "../SimpleCommandState";
import { TaskCommandBase } from "./TaskCommandBase";

export class CreateSubTaskCommand extends TaskCommandBase {
    public execute(parentId: string): boolean {
        return super.execute(parentId);
    }
    protected executeInternal(parentId: string): boolean {
        parentId = parentId || this.control.currentSelectedTaskID;
        const selectedItem = this.control.viewModel.findItem(parentId);
        if(selectedItem.selected) {
            const data = {
                start: new Date(selectedItem.task.start.getTime()),
                end: new Date(selectedItem.task.end.getTime()),
                title: "New task",
                progress: 0,
                parentId: parentId
            };
            const args = new TaskInsertingArguments(null, data);
            this.modelManipulator.dispatcher.notifyTaskCreating(args);
            if(!args.cancel) {
                this.history.addAndRedo(new CreateTaskHistoryItem(this.modelManipulator, args));
                const parentItem = this.control.viewModel.findItem(data.parentId);
                super.updateParent(parentItem);
            }
            return !args.cancel;
        }
        return false;
    }
    isEnabled(): boolean {
        const gantt = this.control;
        const selectedItem = gantt.viewModel.findItem(gantt.currentSelectedTaskID);
        return super.isEnabled() && !!selectedItem && selectedItem.selected;
    }
    getState(): SimpleCommandState {
        const state = super.getState();
        const gantt = this.control;
        state.visible = state.visible && gantt.settings.editing.allowTaskInsert;
        return state;
    }
}
