import { SimpleCommandState } from "../CommandStates";
import { StylePropertyCommandBase } from "./StylePropertyCommandBase";
import { ChangeStyleTextHistoryItem } from "../../History/StyleProperties/ChangeStyleTextHistoryItem";
import { DiagramItem } from "../../Model/DiagramItem";
import { TextStyle } from "../../Model/Style";

export abstract class ToggleStyleTextPropertyCommand extends StylePropertyCommandBase {
    getValue(): any {
        const value = this.control.selection.inputPosition.getCurrentTextStylePropertyValue(this.getStyleProperty());
        return value === this.getStylePropertyValue();
    }

    executeCore(state: SimpleCommandState) {
        this.control.history.beginTransaction();
        const styleProperty = this.getStyleProperty();
        const styleValue = state.value ? TextStyle.defaultInstance[styleProperty] : this.getStylePropertyValue();
        const items = this.control.selection.getSelectedItems();
        items.forEach(item => {
            this.control.history.addAndRedo(new ChangeStyleTextHistoryItem(item.key, styleProperty, styleValue));
        });
        this.control.selection.inputPosition.setTextStylePropertyValue(this.getStyleProperty(), styleValue);
        this.control.history.endTransaction();
        return true;
    }
    getStyleObj(item: DiagramItem): any {
        return item.styleText;
    }
    getDefaultStyleObj(): any {
        return new TextStyle();
    }
    abstract getStylePropertyValue(): string;
}
