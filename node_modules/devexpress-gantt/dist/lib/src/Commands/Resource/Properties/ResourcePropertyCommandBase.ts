import { CommandBase } from "../../CommandBase";
import { SimpleCommandState } from "../../SimpleCommandState";

export class ResourcePropertyCommandBase extends CommandBase<SimpleCommandState> {
    public getState(): SimpleCommandState {
        return new SimpleCommandState(this.isEnabled());
    }
    isEnabled(): boolean {
        return super.isEnabled() && this.control.settings.editing.allowResourceUpdate;
    }
}
