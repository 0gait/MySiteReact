import { SimpleCommandBase } from "../SimpleCommandBase";
import { SimpleCommandState } from "../CommandStates";

export class ChangeGridSizeCommand extends SimpleCommandBase {
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
    getValue(): number {
        return this.getModelUnit(this.control.settings.gridSize);
    }
    executeCore(state: SimpleCommandState, parameter: number) {
        this.control.settings.gridSize = this.getModelUnitTwipsValue(parameter);
        return true;
    }
    getItems(): any[] {
        return this.control.settings.gridSizeItems.map(s => {
            return { value: this.getModelUnit(s), text: this.getViewUnitText(s) };
        });
    }
}

export class ChangeGridSizeItemsCommand extends SimpleCommandBase {
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
    getValue(): number[] {
        return this.control.settings.gridSizeItems.map(s => this.getModelUnit(s));
    }
    executeCore(state: SimpleCommandState, parameter: number[]) {
        this.control.settings.gridSizeItems = parameter.map(s => this.getModelUnitTwipsValue(s));
        return true;
    }
}
