import { SimpleCommandState } from "../CommandStates";
import { SimpleCommandBase } from "../SimpleCommandBase";

export class UndoCommand extends SimpleCommandBase {
    executeCore(state: SimpleCommandState): boolean {
        this.control.beginUpdateCanvas();
        this.permissionsProvider.lockPermissions();
        this.control.history.undo();
        this.permissionsProvider.unlockPermissions();
        this.control.endUpdateCanvas();
        return true;
    }
    isEnabled(): boolean {
        return super.isEnabled() && this.control.history.canUndo();
    }
}
