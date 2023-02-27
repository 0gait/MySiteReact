import { isDefined } from "@devexpress/utils/lib/utils/common";
import { IHistory } from "../../../Model/History/IHistory";
import { ModelManipulator } from "../../../Model/Manipulators/ModelManipulator";
import { ViewVisualModel } from "../../../Model/VisualModel/VisualModel";
import { DateRange } from "../../../Model/WorkingTime/DateRange";
import { ValidationSettings } from "../ValidationSettings";

export class ValidationControllerSettings {
    getViewModel: () => ViewVisualModel;
    getHistory: () => IHistory;
    getModelManipulator: () => ModelManipulator;
    getRange: () => DateRange;
    getValidationSettings: () => ValidationSettings;
    updateOwnerInAutoParentMode: () => void;
    getIsValidateDependenciesRequired: () => boolean;

    static parse(settings: any): ValidationControllerSettings {
        const result = new ValidationControllerSettings();
        if(settings) {
            if(isDefined(settings.getViewModel))
                result.getViewModel = settings.getViewModel;
            if(isDefined(settings.getHistory))
                result.getHistory = settings.getHistory;
            if(isDefined(settings.getModelManipulator))
                result.getModelManipulator = settings.getModelManipulator;
            if(isDefined(settings.getRange))
                result.getRange = settings.getRange;
            if(isDefined(settings.getValidationSettings))
                result.getValidationSettings = settings.getValidationSettings;
            if(isDefined(settings.updateOwnerInAutoParentMode))
                result.updateOwnerInAutoParentMode = settings.updateOwnerInAutoParentMode;
            if(isDefined(settings.getIsValidateDependenciesRequired))
                result.getIsValidateDependenciesRequired = settings.getIsValidateDependenciesRequired;
        }
        return result;
    }
}
