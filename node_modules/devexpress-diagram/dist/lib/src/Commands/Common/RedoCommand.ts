import { SimpleCommandState } from "../CommandStates";
import { SimpleCommandBase } from "../SimpleCommandBase";

export class RedoCommand extends SimpleCommandBase {
    executeCore(state: SimpleCommandState): boolean {
        this.control.beginUpdateCanvas();
        this.permissionsProvider.lockPermissions();
        this.control.history.redo();
        this.permissionsProvider.unlockPermissions();
        this.control.endUpdateCanvas();
        return true;
    }
    isEnabled(): boolean {
        return super.isEnabled() && this.control.history.canRedo();
    }
}
