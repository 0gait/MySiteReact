import { SimpleCommandState } from "../CommandStates";
import { ItemKey } from "../../Model/DiagramItem";
import { SimpleCommandBase } from "../SimpleCommandBase";

export class SelectAllCommand extends SimpleCommandBase {
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
    executeCore(state: SimpleCommandState, parameter?: any): boolean {
        const itemKeys: ItemKey[] = [];
        this.control.model.iterateItems(i => itemKeys.push(i.key));
        this.control.selection.set(itemKeys);
        return true;
    }
}
