import { DiagramItem } from "../../Model/DiagramItem";
import { ChangeStylePropertyCommandBase } from "./ChangeStylePropertyCommandBase";
import { ChangeStyleHistoryItem } from "../../History/StyleProperties/ChangeStyleHistoryItem";
import { Style } from "../../Model/Style";

export abstract class ChangeStylePropertyCommand extends ChangeStylePropertyCommandBase {
    getValue(): any {
        return this.control.selection.inputPosition.getCurrentStylePropertyValue(this.getStyleProperty());
    }
    getStyleObj(item: DiagramItem): any {
        return item.style;
    }
    getDefaultStyleObj(): any {
        return new Style();
    }
    createHistoryItem(item: DiagramItem, styleProperty: string, styleValue: string) {
        return new ChangeStyleHistoryItem(item.key, styleProperty, styleValue);
    }
    updateInputPosition(value: string) {
        this.control.selection.inputPosition.setStylePropertyValue(this.getStyleProperty(), value);
    }
}
