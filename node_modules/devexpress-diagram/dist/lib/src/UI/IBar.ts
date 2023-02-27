import { DiagramCommand } from "../Commands/CommandManager";
import { EventDispatcher } from "../Utils";

export interface IBar {
    getCommandKeys(): DiagramCommand[];
    onChanged: EventDispatcher<IBarListener>;
    setItemValue(key: DiagramCommand, value: any, defaultValue?: any);
    setItemEnabled(key: DiagramCommand, enabled: boolean);
    setItemVisible(key: DiagramCommand, visible: boolean);
    setItemSubItems(key: DiagramCommand, subItems: any[]);
    setEnabled(enabled: boolean);

    isVisible(): boolean;
}

export interface IBarListener {
    notifyBarCommandExecuted(commandID: DiagramCommand, parameter: any);
    notifyBarUpdateRequested();
}
