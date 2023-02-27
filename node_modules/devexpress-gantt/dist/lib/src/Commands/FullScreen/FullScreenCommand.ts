import { CommandBase } from "../CommandBase";
import { SimpleCommandState } from "../SimpleCommandState";

export class ToggleFullScreenCommand extends CommandBase<SimpleCommandState> {
    private isInFullScreenMode: boolean = false;
    private fullScreenTempVars: any = {};

    public getState(): SimpleCommandState {
        const state = new SimpleCommandState(true);
        state.value = this.control.fullScreenModeHelper.isInFullScreenMode;
        return state;
    }
    public execute(): boolean {
        return super.execute();
    }
    protected executeInternal(): boolean {
        this.control.fullScreenModeHelper.toggle();
        return true;
    }
}
