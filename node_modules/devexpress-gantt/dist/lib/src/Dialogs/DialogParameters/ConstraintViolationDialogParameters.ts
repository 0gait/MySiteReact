import { ValidationError } from "../../Model/Validation/ValidationError";
import { ConstraintViolationOption } from "../DialogEnums";
import { DialogParametersBase } from "./DialogParametersBase";

export class ConstraintViolationDialogParameters extends DialogParametersBase {
    validationErrors: ValidationError[];
    option: ConstraintViolationOption;
    callback: (parameters: ConstraintViolationDialogParameters) => void;
    constructor(validationErrors: ValidationError[], callback: (parameters: ConstraintViolationDialogParameters) => void) {
        super();
        this.validationErrors = validationErrors;
        this.callback = callback;
    }
    clone(): ConstraintViolationDialogParameters {
        const result = new ConstraintViolationDialogParameters(this.validationErrors, this.callback);
        result.option = this.option;
        return result;
    }
    public get hasCriticalErrors(): boolean {
        return this.validationErrors?.some(ve => ve.critical);
    }
    public get errorsCount(): number {
        return this.validationErrors?.length;
    }
}
