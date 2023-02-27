import { CommandBase } from "../CommandBase";
import { SimpleCommandState } from "../SimpleCommandState";

export class ExpandAllCommand extends CommandBase<SimpleCommandState> {
    public getState(): SimpleCommandState {
        return new SimpleCommandState(this.isEnabled());
    }
    public execute(): boolean {
        return super.execute();
    }
    protected executeInternal(): boolean {
        this.control.expandAll();
        return true;
    }
    isEnabled(): boolean {
        return true;
    }
}
