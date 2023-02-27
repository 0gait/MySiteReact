import { SimpleCommandState } from "../SimpleCommandState";
import { TaskCommandBase } from "./TaskCommandBase";

export class TaskAddContextItemCommand extends TaskCommandBase {
    getState(): SimpleCommandState {
        const state = super.getState();
        state.visible = state.visible && this.control.settings.editing.allowTaskInsert;
        return state;
    }
    public execute(): boolean {
        return false;
    }
}
