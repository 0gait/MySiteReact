import { CommandBase } from "../CommandBase";
import { SimpleCommandState } from "../SimpleCommandState";

export class RedoCommand extends CommandBase<SimpleCommandState> {
    public getState(): SimpleCommandState {
        const state = new SimpleCommandState(this.isEnabled());
        state.visible = this.control.settings.editing.enabled;
        return state;
    }
    public execute(): boolean {
        return super.execute();
    }
    protected executeInternal(): boolean {
        this.history.redo();
        return true;
    }
    isEnabled(): boolean {
        return super.isEnabled() && this.history.canRedo();
    }
}
