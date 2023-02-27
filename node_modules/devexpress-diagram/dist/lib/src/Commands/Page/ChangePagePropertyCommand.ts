import { SimpleCommandState } from "../CommandStates";
import { HistoryItem } from "../../History/HistoryItem";
import { ModelUtils } from "../../Model/ModelUtils";
import { SimpleCommandBase } from "../SimpleCommandBase";

export abstract class ChangePagePropertyCommand<TValue> extends SimpleCommandBase {
    executeCore(state: SimpleCommandState, parameter: TValue) {
        this.control.history.beginTransaction();
        const items = this.createHistoryItems(parameter);
        items.forEach(item => { this.control.history.addAndRedo(item); });
        ModelUtils.tryUpdateModelRectangle(this.control.history);
        this.control.history.endTransaction();
        return true;
    }
    abstract getValue(): TValue;
    abstract createHistoryItems(parameter: TValue): HistoryItem[];

    getItems(): any[] {
        return null;
    }
}
