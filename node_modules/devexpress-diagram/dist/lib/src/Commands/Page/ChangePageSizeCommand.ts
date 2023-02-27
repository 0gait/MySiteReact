import { ChangePagePropertyCommand } from "./ChangePagePropertyCommand";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { ChangePageSizeHistoryItem } from "../../History/Page/ChangePageSizeHistoryItem";
import { HistoryItem } from "../../History/HistoryItem";
import { SimpleCommandBase } from "../SimpleCommandBase";
import { SimpleCommandState } from "../CommandStates";

export class ChangePageSizeCommand extends ChangePagePropertyCommand<Size> {
    getValue(): Size {
        return this.getModelUnitSize(this.control.model.pageSize);
    }
    createHistoryItems(parameter: any): HistoryItem[] {
        return [new ChangePageSizeHistoryItem(
            new Size(
                this.getModelUnitTwipsValue(parameter.width),
                this.getModelUnitTwipsValue(parameter.height)
            )
        )];
    }
    getItems(): any[] {
        return this.control.settings.pageSizeItems.map(i => {
            return {
                value: this.getModelUnitSize(i.size),
                text: i.text.replace("{width}", this.getViewUnitText(i.size.width)).replace("{height}", this.getViewUnitText(i.size.height))
            };
        });
    }
    getModelUnitSize(size: Size): Size {
        return new Size(this.getModelUnit(size.width), this.getModelUnit(size.height));
    }
}

export class ChangePageSizeItemsCommand extends SimpleCommandBase {
    isEnabled(): boolean {
        return true;
    }
    getValue(): any[] {
        return this.control.settings.pageSizeItems.map(i => {
            return {
                size: new Size(
                    this.getModelUnit(i.width),
                    this.getModelUnit(i.height)
                ),
                text: i.text
            };
        });
    }
    executeCore(state: SimpleCommandState, parameter: any[]) {
        this.control.settings.pageSizeItems = parameter.map(i => {
            return {
                size: new Size(
                    this.getModelUnitTwipsValue(i.width),
                    this.getModelUnitTwipsValue(i.height)
                ),
                text: i.text
            };
        });
        return true;
    }
}
