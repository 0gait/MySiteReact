import { ConfirmationType } from "../DialogEnums";
import { DialogParametersBase } from "./DialogParametersBase";

export class ConfirmationDialogParameters extends DialogParametersBase {
    type: ConfirmationType;
    message: string;
    callback: () => void;
    constructor(type, callback) {
        super();
        this.type = type;
        this.callback = callback;
    }
    clone() {
        const result = new ConfirmationDialogParameters(this.type, this.callback);
        result.message = this.message;
        return result;
    }
}
