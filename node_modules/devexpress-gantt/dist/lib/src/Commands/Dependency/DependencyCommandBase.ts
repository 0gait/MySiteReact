import { CommandBase } from "../CommandBase";
import { SimpleCommandState } from "../SimpleCommandState";

export class DependencyCommandBase extends CommandBase<SimpleCommandState> {
    public getState(): SimpleCommandState {
        return new SimpleCommandState(this.isEnabled());
    }
}
