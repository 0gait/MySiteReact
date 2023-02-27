import { SimpleCommandState } from "../CommandStates";
import { StylePropertyCommandBase } from "./StylePropertyCommandBase";
import { DiagramItem } from "../../Model/DiagramItem";

export abstract class ChangeStylePropertyCommandBase extends StylePropertyCommandBase {
    executeCore(state: SimpleCommandState, parameter: string) {
        this.control.history.beginTransaction();
        const items = this.control.selection.getSelectedItems();
        parameter = this.processParameter(parameter);
        items.forEach(item => {
            const styleProperty = this.getStyleProperty();
            this.control.history.addAndRedo(this.createHistoryItem(item, styleProperty, parameter));
        });
        this.updateInputPosition(parameter);
        this.control.history.endTransaction();
        return true;
    }
    getDefaultValue(): any {
        return this.getDefaultStyleObj()[this.getStyleProperty()];
    }
    abstract createHistoryItem(item: DiagramItem, styleProperty: string, styleValue: string);
    abstract updateInputPosition(value: string);
    protected processParameter(parameter: string) {
        return parameter;
    }
}
