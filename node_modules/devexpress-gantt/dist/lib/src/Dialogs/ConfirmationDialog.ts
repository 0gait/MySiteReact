import { DialogBase } from "./DialogBase";
import { ConfirmationDialogParameters } from "./DialogParameters/ConfirmationDialogParameters";

export class ConfirmationDialog extends DialogBase<ConfirmationDialogParameters> {
    applyParameters(_newParameters: ConfirmationDialogParameters, oldParameters: ConfirmationDialogParameters): boolean {
        this.history.beginTransaction();
        oldParameters.callback();
        this.history.endTransaction();
        this.control.barManager.updateItemsState([]);
        return true;
    }
    createParameters(options: ConfirmationDialogParameters) {
        return options;
    }
    getDialogName() {
        return "Confirmation";
    }
}
