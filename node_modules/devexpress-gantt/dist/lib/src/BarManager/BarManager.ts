import { IBar } from "./IBar";
import { GanttClientCommand } from "../Commands/ClientCommand";
import { CommandManager } from "../Commands/CommandManager";

export class BarManager {
    private bars: IBar[];
    private commandManager: CommandManager;

    constructor(commandManager: CommandManager, bars: IBar[]) {
        this.commandManager = commandManager;
        this.bars = bars;
    }
    updateContextMenu(): void {
        for(let i = 0, bar: IBar; bar = this.bars[i]; i++)
            if(bar.isContextMenu()) {
                bar.updateItemsList();
                const commandKeys = bar.getCommandKeys();
                for(let j = 0; j < commandKeys.length; j++)
                    this.updateBarItem(bar, commandKeys[j]);
            }
    }
    updateItemsState(queryCommands: GanttClientCommand[]): void {
        const anyQuerySended: boolean = !!queryCommands.length;

        for(let i = 0, bar: IBar; bar = this.bars[i]; i++)
            if(bar.isVisible()) {
                const commandKeys = bar.getCommandKeys();
                for(let j = 0; j < commandKeys.length; j++) {
                    if(anyQuerySended && !queryCommands.filter(q => q == commandKeys[j]).length)
                        continue;
                    this.updateBarItem(bar, commandKeys[j]);
                }
                bar.completeUpdate();
            }

    }
    private updateBarItem(bar: IBar, commandKey: GanttClientCommand) {
        const command = this.commandManager.getCommand(commandKey);
        if(command) {
            const commandState = command.getState();
            bar.setItemVisible(commandKey, commandState.visible);
            if(commandState.visible) {
                bar.setItemEnabled(commandKey, commandState.enabled);
                bar.setItemValue(commandKey, commandState.value);
            }
        }
    }
}
