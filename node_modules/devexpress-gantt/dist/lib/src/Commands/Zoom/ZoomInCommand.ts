import { CommandBase } from "../CommandBase";
import { SimpleCommandState } from "../SimpleCommandState";

export class ZoomInCommand extends CommandBase<SimpleCommandState> {
    public getState(): SimpleCommandState {
        return new SimpleCommandState(true);
    }
    public execute(): boolean {
        return super.execute();
    }
    protected executeInternal(): boolean {
        this.control.zoomIn();
        return true;
    }
}
