import { SimpleCommandState } from "../CommandStates";
import { SimpleCommandBase } from "../SimpleCommandBase";
import { AutoZoomMode } from "../../Settings";

export class ChangeZoomLevelCommand extends SimpleCommandBase {
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
    getValue(): any {
        return this.control.view.getZoom();
    }
    executeCore(state: SimpleCommandState, parameter: number) {
        this.control.settings.zoomLevel = parameter;
        this.control.settings.autoZoom = AutoZoomMode.Disabled;
        this.control.updateLayout(true);
        return true;
    }
    getItems(): any[] {
        return this.control.settings.zoomLevelItems.map(l => {
            return { value: l, text: l * 100 + "%" };
        });
    }
}

export class ChangeZoomLevelInPercentageCommand extends ChangeZoomLevelCommand {
    executeCore(state: SimpleCommandState, parameter: number) {
        return super.executeCore(state, parameter / 100);
    }
    getValue(): any {
        return this.control.view.getZoom() * 100;
    }
}

class ChangeZoomLevelExactlyCommand extends ChangeZoomLevelCommand {
    exactValue: number;
    getValue(): boolean {
        return this.control.view.getZoom() === this.exactValue;
    }
    executeCore(state: SimpleCommandState, parameter: number) {
        super.executeCore(state, this.exactValue);
        return true;
    }
    getItems(): any {
        return undefined;
    }
}

export class ChangeZoomLevelTo25Command extends ChangeZoomLevelExactlyCommand {
    exactValue = 0.25;
}
export class ChangeZoomLevelTo50Command extends ChangeZoomLevelExactlyCommand {
    exactValue = 0.5;
}
export class ChangeZoomLevelTo75Command extends ChangeZoomLevelExactlyCommand {
    exactValue = 0.75;
}
export class ChangeZoomLevelTo100Command extends ChangeZoomLevelExactlyCommand {
    exactValue = 1;
}
export class ChangeZoomLevelTo125Command extends ChangeZoomLevelExactlyCommand {
    exactValue = 1.25;
}
export class ChangeZoomLevelTo150Command extends ChangeZoomLevelExactlyCommand {
    exactValue = 1.5;
}
export class ChangeZoomLevelTo200Command extends ChangeZoomLevelExactlyCommand {
    exactValue = 2;
}

export class ChangeZoomLevelItemsCommand extends SimpleCommandBase {
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
    getValue(): number[] {
        return this.control.settings.zoomLevelItems;
    }
    executeCore(state: SimpleCommandState, parameter: number[]) {
        this.control.settings.zoomLevelItems = parameter;
        return true;
    }
}

abstract class FitZoomCommandBase extends SimpleCommandBase {
    isEnabled(): boolean {
        return super.isEnabled() && !!this.control.render;
    }
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
    executeCore(state: SimpleCommandState) {
        const zoomLevel = this.getZoomLevel();
        this.control.settings.zoomLevel = zoomLevel;
        this.control.settings.autoZoom = AutoZoomMode.Disabled;
        this.control.updateLayout(true);
        return true;
    }
    abstract getZoomLevel(): number;
}

export class FitToScreenCommand extends FitZoomCommandBase {
    getZoomLevel(): number {
        return this.control.render.view.getActualAutoZoomLevel(AutoZoomMode.FitContent);
    }
}

export class FitToWidthCommand extends FitZoomCommandBase {
    getZoomLevel(): number {
        return this.control.render.view.getActualAutoZoomLevel(AutoZoomMode.FitToWidth);
    }
}

export class SwitchAutoZoomCommand extends SimpleCommandBase {
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
    getValue(): any {
        return this.control.settings.autoZoom;
    }
    executeCore(state: SimpleCommandState, value: any) {
        value = parseInt(value);
        if(this.control.settings.autoZoom === value)
            return false;
        if(value === AutoZoomMode.Disabled)
            this.control.settings.zoomLevel = this.control.view.getZoom();
        this.control.settings.autoZoom = value;
        this.control.updateLayout(true);
        return true;
    }
}

export class ToggleAutoZoomToContentCommand extends SwitchAutoZoomCommand {
    getValue() {
        return this.control.settings.autoZoom === AutoZoomMode.FitContent;
    }
    executeCore(state: SimpleCommandState, value: any) {
        return super.executeCore(state, AutoZoomMode.FitContent);
    }
}

export class ToggleAutoZoomToWidthCommand extends SwitchAutoZoomCommand {
    getValue() {
        return this.control.settings.autoZoom === AutoZoomMode.FitToWidth;
    }
    executeCore(state: SimpleCommandState, value: any) {
        return super.executeCore(state, AutoZoomMode.FitToWidth);
    }
}

export class ToggleAutoZoomCommand extends SimpleCommandBase { 
    isEnabled(): boolean {
        return super.isEnabled() && !!this.control.render;
    }
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
    getValue() {
        return this.control.settings.autoZoom;
    }
    executeCore(state: SimpleCommandState, value?: boolean) {
        let newValue: AutoZoomMode;
        if(value === undefined)
            newValue = this.control.settings.autoZoom === AutoZoomMode.Disabled ? AutoZoomMode.FitContent : AutoZoomMode.Disabled;
        else
            newValue = value ? AutoZoomMode.FitContent : AutoZoomMode.Disabled;
        if(this.control.settings.autoZoom === newValue)
            return false;
        if(!newValue)
            this.control.settings.zoomLevel = this.control.view.getZoom();
        this.control.settings.autoZoom = newValue;
        this.control.updateLayout(true);
        return true;
    }
}
