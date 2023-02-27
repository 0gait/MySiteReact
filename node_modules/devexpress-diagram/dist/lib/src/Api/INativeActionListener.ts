import { INativeItem } from "./INativeItem";

export interface INativeActionListener {
    notifyItemClick(item: INativeItem);
    notifyItemDblClick(item: INativeItem);
    notifySelectionChanged(items: INativeItem[]);

    notifyToolboxItemDragStart?();
    notifyToolboxItemDragEnd?();
}
