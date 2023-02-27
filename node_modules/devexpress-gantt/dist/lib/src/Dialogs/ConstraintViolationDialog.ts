import { DialogBase } from "./DialogBase";
import { ConstraintViolationDialogParameters } from "./DialogParameters/ConstraintViolationDialogParameters";

export class ConstraintViolationDialogCommand extends DialogBase<ConstraintViolationDialogParameters> {
    applyParameters(newParameters: ConstraintViolationDialogParameters, oldParameters: ConstraintViolationDialogParameters): boolean {
        oldParameters.callback(newParameters);
        return true;
    }
    createParameters(options: ConstraintViolationDialogParameters): ConstraintViolationDialogParameters {
        return options;
    }
    getDialogName(): string {
        return "ConstraintViolation";
    }
}
