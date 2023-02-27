import { DiagramControl } from "../Diagram";
import { DiagramCommand } from "../Commands/CommandManager";
import { IBar, IBarListener } from "./IBar";
import { BatchUpdatableObject } from "@devexpress/utils/lib/class/batch-updatable";
import { ISelectionChangesListener, Selection } from "../Selection/Selection";

export class BarManager extends BatchUpdatableObject implements IBarListener, ISelectionChangesListener, IBarManager {
    private bars: IBar[] = [];
    private control: DiagramControl;
    constructor(control: DiagramControl) {
        super();
        this.control = control;
    }
    clean() {
        this.bars.forEach(bar => bar.onChanged.remove(this));
        this.bars = [];
    }
    registerBar(bar: IBar) {
        this.bars.push(bar);
        bar.onChanged.add(this);
        this.updateBarItemsState(bar);
    }
    updateItemsState(queryCommands?: DiagramCommand[]) {
        if(this.isUpdateLocked())
            return;
        for(let i = 0, bar: IBar; bar = this.bars[i]; i++)
            this.updateBarItemsState(bar, queryCommands);
    }
    updateBarItemsState(bar: IBar, queryCommands?: DiagramCommand[]) {
        if(this.isUpdateLocked())
            return;
        this.control.permissionsProvider.beginUpdateUI();
        if(bar.isVisible()) {
            let commandKeys: DiagramCommand[];
            if(queryCommands) {
                const knownCommandKeys = bar.getCommandKeys().reduce((hash, cmd) => {
                    hash[cmd] = true;
                    return hash;
                }, {});
                commandKeys = queryCommands.filter(cmd => knownCommandKeys[cmd]);
            }
            else
                commandKeys = bar.getCommandKeys();
            const length = commandKeys.length;
            for(let j = 0; j < length; j++)
                this.updateBarItem(bar, commandKeys[j]);
        }
        this.control.permissionsProvider.endUpdateUI();
    }
    private updateBarItem(bar: IBar, commandKey: DiagramCommand) {
        const command = this.control.commandManager.getCommand(commandKey);
        if(command) {
            const commandState = command.getState();
            bar.setItemVisible(commandKey, commandState.visible);
            if(commandState.visible) {
                bar.setItemEnabled(commandKey, commandState.enabled);
                if(!commandState.denyUpdateValue) {
                    const itemValue = this.getItemValue(commandState.value);
                    if(commandState.items)
                        bar.setItemSubItems(commandKey, commandState.items);
                    bar.setItemValue(commandKey, itemValue, this.getDefaultItemValue(commandState.defaultValue));
                }
            }
        }
    }
    setEnabled(enabled) {
        for(let i = 0, bar: IBar; bar = this.bars[i]; i++)
            bar.setEnabled(enabled);
    }
    notifyBarCommandExecuted(commandID: DiagramCommand, parameter: any) {
        const executeResult = this.control.commandManager.getCommand(commandID).execute(parameter);
        if(!executeResult)
            this.updateItemsState([commandID]);
    }
    notifyBarUpdateRequested() {
        this.updateItemsState();
    }

    notifySelectionChanged(_selection: Selection) {
        this.updateItemsState();
    }

    onUpdateUnlocked(occurredEvents: number) { }
    private getItemValue(value: any): any {
        return value;
    }
    private getDefaultItemValue(value: any): any {
        return value;
    }
}

export interface IBarManager {
    updateItemsState(queryCommands?: DiagramCommand[]);
}
