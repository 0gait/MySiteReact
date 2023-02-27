import { GanttClientCommand } from "../Commands/ClientCommand";

export interface IBar {
    getCommandKeys(): GanttClientCommand[];
    setItemValue(key: GanttClientCommand, value: any);
    setItemEnabled(key: GanttClientCommand, enabled: boolean);
    setItemVisible(key: GanttClientCommand, visible: boolean);
    setItemSubItems(key: GanttClientCommand, subItems: any[]);
    setEnabled(enabled: boolean);
    getItem(key: GanttClientCommand): any;
    isVisible(): boolean;
    isContextMenu(): boolean;

    updateItemsList();
    completeUpdate();
}
