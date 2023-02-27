import { SimpleCommandState } from "../CommandStates";
import { Exporter } from "../../ImportAndExport/Exporter";
import { ModelUtils } from "../../Model/ModelUtils";
import { ClipboardCommand } from "./ClipboardCommand";

export class CutSelectionCommand extends ClipboardCommand {
    isEnabled(): boolean {
        const items = this.control.selection.getSelectedItems();
        return super.isEnabled() && items.length && (items.length > 1 || this.permissionsProvider.canDeleteItems(items));
    }
    executeCore(state: SimpleCommandState) {
        const exporter = new Exporter();
        const items = this.control.selection.getSelectedItems(true, true);
        const data = exporter.exportItems(items);
        this.permissionsProvider.beginDeleteItems(items);
        this.setClipboardData(data);
        ModelUtils.deleteSelection(this.control.history, this.control.model, this.control.selection);
        this.permissionsProvider.endDeleteItems();
        return true;
    }
    protected get isPermissionsRequired(): boolean { return true; }
}
