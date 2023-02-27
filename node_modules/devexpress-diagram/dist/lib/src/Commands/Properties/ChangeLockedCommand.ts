import { SimpleCommandState } from "../CommandStates";
import { ModelUtils } from "../../Model/ModelUtils";
import { SimpleCommandBase } from "../SimpleCommandBase";

export abstract class ChangeLockedCommand extends SimpleCommandBase {
    isEnabled(): boolean {
        const items = this.control.selection.getSelectedItems(true);
        let enabled = false;
        items.forEach(item => { if(item.locked !== this.getLockState()) enabled = true; });
        return super.isEnabled() && enabled;
    }
    executeCore(state: SimpleCommandState, parameter: any) {
        ModelUtils.changeSelectionLocked(this.control.history, this.control.model, this.control.selection, this.getLockState());
        return true;
    }

    abstract getLockState(): boolean;
}
