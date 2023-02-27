import { DiagramItem } from "../../Model/DiagramItem";
import { ChangeStylePropertyCommandBase } from "./ChangeStylePropertyCommandBase";
import { ChangeStyleTextHistoryItem } from "../../History/StyleProperties/ChangeStyleTextHistoryItem";
import { TextStyle } from "../../Model/Style";

export abstract class ChangeStyleTextPropertyCommand extends ChangeStylePropertyCommandBase {
    getValue(): any {
        return this.control.selection.inputPosition.getCurrentTextStylePropertyValue(this.getStyleProperty());
    }
    getStyleObj(item: DiagramItem): any {
        return item.styleText;
    }
    getDefaultStyleObj(): any {
        return new TextStyle();
    }
    createHistoryItem(item: DiagramItem, styleProperty: string, styleValue: string) {
        return new ChangeStyleTextHistoryItem(item.key, styleProperty, styleValue);
    }
    updateInputPosition(value: string) {
        this.control.selection.inputPosition.setTextStylePropertyValue(this.getStyleProperty(), value);
    }
}
