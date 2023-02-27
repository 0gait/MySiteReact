import { SimpleCommandState } from "../CommandStates";
import { ModelUtils } from "../../Model/ModelUtils";
import { SimpleCommandBase } from "../SimpleCommandBase";

export class UnbindDocumentCommand extends SimpleCommandBase {
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
    executeCore(state: SimpleCommandState): boolean {
        this.permissionsProvider.lockPermissions();
        this.control.deleteDocumentDataSource();

        ModelUtils.deleteAllItems(this.control.history, this.control.model, this.control.selection);
        this.control.history.clear();
        this.permissionsProvider.unlockPermissions();
        return true;
    }
}
