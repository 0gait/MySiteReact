import { CommandBase } from "./CommandBase";
import { SimpleCommandState } from "./CommandStates";
import { ModelUtils } from "../Model/ModelUtils";
import { DiagramLocalizationService } from "../LocalizationService";

export abstract class SimpleCommandBase extends CommandBase<SimpleCommandState> {
    getState(): SimpleCommandState {
        return new SimpleCommandState(this.isEnabled(), this.getValue(), this.getDefaultValue(), this.getItems(), this.isVisible());
    }
    isVisible(): boolean {
        return true;
    }
    isEnabled(): boolean {
        return !this.control.settings.readOnly || this.isEnabledInReadOnlyMode();
    }
    isEnabledInReadOnlyMode(): boolean {
        return false;
    }
    getValue(): any {
        return undefined;
    }
    getDefaultValue(): any {
        return undefined;
    }
    getItems(): any[] {
        return undefined;
    }

    getModelUnit(value: number) {
        return ModelUtils.getlUnitValue(this.control.model.units, value);
    }
    getModelUnitText(value: number) {
        return ModelUtils.getUnitText(this.control.model.units, DiagramLocalizationService.unitItems,
            DiagramLocalizationService.formatUnit, value);
    }
    getModelUnitTwipsValue(value: number) {
        return ModelUtils.getTwipsValue(this.control.model.units, value);
    }
    getViewUnit(value: number) {
        return ModelUtils.getlUnitValue(this.control.settings.viewUnits, value);
    }
    getViewUnitText(value: number) {
        return ModelUtils.getUnitText(this.control.settings.viewUnits, DiagramLocalizationService.unitItems,
            DiagramLocalizationService.formatUnit, value);
    }
    getViewUnitTwipsValue(value: number) {
        return ModelUtils.getTwipsValue(this.control.settings.viewUnits, value);
    }
}
