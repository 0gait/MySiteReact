import { SimpleCommandState } from "../CommandStates";
import { Exporter } from "../../ImportAndExport/Exporter";
import { ClipboardCommand } from "./ClipboardCommand";

export class CopySelectionCommand extends ClipboardCommand {
    isEnabled(): boolean {
        return super.isEnabled() && !this.control.selection.isEmpty(true);
    }
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
    executeCore(state: SimpleCommandState) {
        const exporter = new Exporter();
        const data = exporter.exportItems(this.control.selection.getSelectedItems(true, true));
        this.setClipboardData(data);
        return true;
    }
}
