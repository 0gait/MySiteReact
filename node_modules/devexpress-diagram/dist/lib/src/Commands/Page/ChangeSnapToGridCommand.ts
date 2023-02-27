import { SimpleCommandBase } from "../SimpleCommandBase";
import { SimpleCommandState } from "../CommandStates";

export class ChangeSnapToGridCommand extends SimpleCommandBase {
    executeCore(state: SimpleCommandState, parameter?: any): boolean {
        const newValue = parameter === undefined ? !this.control.settings.snapToGrid : !!parameter;
        if(this.control.settings.snapToGrid !== newValue) {
            this.control.settings.snapToGrid = newValue;
            return true;
        }
        return false;
    }
    getValue(): boolean {
        return this.control.settings.snapToGrid;
    }
}
