import { SimpleCommandState } from "../CommandStates";
import { SimpleCommandBase } from "../SimpleCommandBase";

export class ToggleReadOnlyCommand extends SimpleCommandBase {
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
    getValue(): boolean {
        return this.control.settings.readOnly;
    }
    executeCore(state: SimpleCommandState, parameter?: boolean | undefined): boolean {
        if(typeof parameter === "boolean")
            this.control.settings.readOnly = parameter;
        else if(parameter === undefined)
            this.control.settings.readOnly = !state.value;
        return true;
    }
}
