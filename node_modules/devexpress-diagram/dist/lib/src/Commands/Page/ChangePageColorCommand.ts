import { ChangePagePropertyCommand } from "./ChangePagePropertyCommand";
import { HistoryItem } from "../../History/HistoryItem";
import { ChangePageColorHistoryItem } from "../../History/Page/ChangePageColorHistoryItem";
import { DiagramModel } from "../../Model/Model";
import { ColorUtils } from "@devexpress/utils/lib/utils/color";

export class ChangePageColorCommand extends ChangePagePropertyCommand<string> {
    getValue(): string {
        return ColorUtils.colorToHash(this.control.model.pageColor);
    }
    getDefaultValue(): any {
        return ColorUtils.colorToHash(DiagramModel.defaultPageColor);
    }
    createHistoryItems(parameter: string): HistoryItem[] {
        return [new ChangePageColorHistoryItem(ColorUtils.fromString(parameter))];
    }
}
