import { ChangePagePropertyCommand } from "./ChangePagePropertyCommand";
import { ChangeUnitsHistoryItem } from "../../History/Page/ChangeUnitsHistoryItem";
import { HistoryItem } from "../../History/HistoryItem";
import { SimpleCommandState } from "../CommandStates";
import { SimpleCommandBase } from "../SimpleCommandBase";
import { DiagramLocalizationService } from "../../LocalizationService";
import { DiagramUnit } from "../../Enums";

export class ChangeUnitsCommand extends ChangePagePropertyCommand<DiagramUnit> {
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
    getValue(): DiagramUnit {
        return this.control.model.units;
    }
    createHistoryItems(parameter: DiagramUnit): HistoryItem[] {
        return [new ChangeUnitsHistoryItem(parameter)];
    }
    getItems(): any[] {
        return Object.keys(DiagramLocalizationService.unitItems).map(key => {
            return { value: parseInt(key), text: DiagramLocalizationService.unitItems[key] };
        });
    }
}

export class ChangeViewUnitsCommand extends SimpleCommandBase {
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
    getValue(): DiagramUnit {
        return this.control.settings.viewUnits;
    }
    executeCore(state: SimpleCommandState, parameter: DiagramUnit): boolean {
        this.control.settings.viewUnits = parameter;
        return true;
    }
    getItems(): any[] {
        return Object.keys(DiagramLocalizationService.unitItems).map(key => {
            return { value: parseInt(key), text: DiagramLocalizationService.unitItems[key] };
        });
    }
}
