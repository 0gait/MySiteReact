import { SimpleCommandState } from "../CommandStates";
import { SimpleCommandBase } from "../SimpleCommandBase";

export class ToggleSimpleViewCommand extends SimpleCommandBase {
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
    getValue(): boolean {
        return this.control.settings.simpleView;
    }
    executeCore(state: SimpleCommandState, parameter?: boolean | undefined): boolean {
        if(typeof parameter === "boolean")
            this.control.settings.simpleView = parameter;
        else if(parameter === undefined)
            this.control.settings.simpleView = !state.value;
        this.control.updateLayout(true);
        return true;
    }
}
