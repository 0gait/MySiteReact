import { SimpleCommandState } from "../CommandStates";
import { ModelUtils } from "../../Model/ModelUtils";
import { SimpleCommandBase } from "../SimpleCommandBase";

export class DeleteCommand extends SimpleCommandBase {
    isEnabled(): boolean {
        const items = this.control.selection.getSelectedItems();
        return super.isEnabled() && items.length && (items.length > 1 || this.permissionsProvider.canDeleteItems(items));
    }
    executeCore(state: SimpleCommandState) {
        const items = this.control.selection.getSelectedItems(true, true);
        this.permissionsProvider.beginDeleteItems(items);
        ModelUtils.deleteSelection(this.control.history, this.control.model, this.control.selection);
        this.permissionsProvider.endDeleteItems();
        return true;
    }
    protected get isPermissionsRequired(): boolean { return true; }
}
