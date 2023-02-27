import { SimpleCommandState } from "../CommandStates";
import { ChangeZindexHistoryItem } from "../../History/Properties/ChangeZindexHistoryItem";
import { DiagramItem } from "../../Model/DiagramItem";
import { SimpleCommandBase } from "../SimpleCommandBase";

export class BringToFrontCommand extends SimpleCommandBase {
    isEnabled(): boolean {
        const items = this.control.selection.getSelectedItems();
        return super.isEnabled() && items.length > 0 && this.needBringToFront(items);
    }
    executeCore(state: SimpleCommandState, parameter: any) {
        this.control.history.beginTransaction();
        const items = this.control.selection.getSelectedItems();
        items.forEach(item => {
            const newZIndex = this.control.model.getIntersectItemsMaxZIndex(item) + 1;
            this.control.history.addAndRedo(new ChangeZindexHistoryItem(item, newZIndex));
        });
        this.control.history.endTransaction();
        return true;
    }
    private needBringToFront(items: DiagramItem[]) {
        for(let i = 0; i < items.length; i++) {
            const zIndex = this.control.model.getIntersectItemsMaxZIndex(items[i]);
            if(zIndex > items[i].zIndex)
                return true;
            if(zIndex === items[i].zIndex) {
                let result = false;
                const sameZIndexItems = this.control.model.getIntersectItems(items[i]).filter(item => item.zIndex === items[i].zIndex);
                sameZIndexItems.forEach(item => {
                    if(this.control.model.getItemIndex(item) > this.control.model.getItemIndex(items[i])) {
                        result = true;
                        return;
                    }
                });
                return result;
            }
        }
        return false;
    }
}
