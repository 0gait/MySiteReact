import { SimpleCommandBase } from "../SimpleCommandBase";
import { SimpleCommandState } from "../CommandStates";

export class ChangeShowGridCommand extends SimpleCommandBase {
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
    executeCore(state: SimpleCommandState, parameter?: any): boolean {
        const newValue = parameter === undefined ? !this.control.settings.showGrid : !!parameter;
        if(this.control.settings.showGrid !== newValue) {
            this.control.settings.showGrid = newValue;
            return true;
        }
        return false;
    }
    getValue(): boolean {
        return this.control.settings.showGrid;
    }
}
