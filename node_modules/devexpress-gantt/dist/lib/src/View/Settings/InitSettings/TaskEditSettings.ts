import { isDefined } from "@devexpress/utils/lib/utils/common";
import { CommandManager } from "../../../Commands/CommandManager";
import { ModelManipulator } from "../../../Model/Manipulators/ModelManipulator";
import { ValidationController } from "../../../Model/Validation/ValidationController";
import { ViewVisualModel } from "../../../Model/VisualModel/VisualModel";
import { RenderHelper } from "../../Render/RenderHelper";
import { Settings } from "../Settings";
import { TooltipSettings } from "./TooltipSettings";

export class TaskEditSettings extends TooltipSettings {
    destroyTemplate: (container: HTMLElement) => void;
    formatDate: (date: Date) => string;
    getRenderHelper: () => RenderHelper;
    getGanttSettings: () => Settings;
    getViewModel: () => ViewVisualModel;
    getCommandManager: () => CommandManager;
    getModelManipulator: () => ModelManipulator;
    getValidationController: () => ValidationController;

    static parse(settings: any): TaskEditSettings {
        const result = new TaskEditSettings();
        if(settings) {
            if(isDefined(settings.getCommandManager))
                result.getCommandManager = settings.getCommandManager;
            if(isDefined(settings.getViewModel))
                result.getViewModel = settings.getViewModel;
            if(isDefined(settings.getGanttSettings))
                result.getGanttSettings = settings.getGanttSettings;
            if(isDefined(settings.getRenderHelper))
                result.getRenderHelper = settings.getRenderHelper;
            if(isDefined(settings.destroyTemplate))
                result.destroyTemplate = settings.destroyTemplate;
            if(isDefined(settings.formatDate))
                result.formatDate = settings.formatDate;
            if(isDefined(settings.getModelManipulator))
                result.getModelManipulator = settings.getModelManipulator;
            if(isDefined(settings.getValidationController))
                result.getValidationController = settings.getValidationController;
        }
        return result;
    }
}
