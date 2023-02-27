import { CommandBase } from "../CommandBase";
import { SimpleCommandState } from "../SimpleCommandState";

export class UndoCommand extends CommandBase<SimpleCommandState> {
    public getState(): SimpleCommandState {
        const state = new SimpleCommandState(this.isEnabled());
        state.visible = this.control.settings.editing.enabled;
        return state;
    }
    public execute(): boolean {
        return super.execute();
    }
    protected executeInternal(): boolean {
        this.history.undo();
        return true;
    }
    isEnabled(): boolean {
        return super.isEnabled() && this.history.canUndo();
    }
}
