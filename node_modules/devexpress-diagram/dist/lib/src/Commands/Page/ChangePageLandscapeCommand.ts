import { ChangePagePropertyCommand } from "./ChangePagePropertyCommand";
import { ChangePageLandscapeHistoryItem } from "../../History/Page/ChangePageLandscapeHistoryItem";
import { HistoryItem } from "../../History/HistoryItem";

export class ChangePageLandscapeCommand extends ChangePagePropertyCommand<boolean> {
    getValue(): boolean {
        return this.control.model.pageLandscape;
    }
    createHistoryItems(parameter: boolean): HistoryItem[] {
        return [new ChangePageLandscapeHistoryItem(parameter)];
    }
}
