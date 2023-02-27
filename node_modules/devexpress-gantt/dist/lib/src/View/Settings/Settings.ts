import { isDefined } from "@devexpress/utils/lib/utils/common";
import { DateTimeUtils } from "../../Model/WorkingTime/DateTimeUtils";
import { ViewType, TaskTitlePosition } from "../Helpers/Enums";
import { ElementTextHelperCultureInfo } from "../Utils/ElementTextHelperCultureInfo";
import { EditingSettings } from "./EditingSettings";
import { StripLineSettings } from "./StripLineSettings";
import { ValidationSettings } from "./ValidationSettings";
import { ViewTypeRangeSettings } from "./ViewTypeRange";

export class Settings {
    viewType: ViewType = undefined;
    taskTitlePosition: TaskTitlePosition = TaskTitlePosition.Inside;
    showResources: boolean = true;
    showDependencies: boolean = true;

    startDateRange: Date;
    endDateRange: Date;

    areHorizontalBordersEnabled: boolean = true;
    areVerticalBordersEnabled: boolean = true;
    areAlternateRowsEnabled: boolean = true;
    allowSelectTask: boolean = true;

    firstDayOfWeek: number = 0;

    editing: EditingSettings = new EditingSettings();
    validation: ValidationSettings = new ValidationSettings();
    stripLines: StripLineSettings = new StripLineSettings();
    viewTypeRange: ViewTypeRangeSettings = new ViewTypeRangeSettings();

    cultureInfo: ElementTextHelperCultureInfo;

    taskTooltipContentTemplate: (container: HTMLElement, model: any) => void;
    taskProgressTooltipContentTemplate: (container: HTMLElement, model: any, ...args) => void;
    taskTimeTooltipContentTemplate: (container: HTMLElement, model: any, ...args) => void;
    taskContentTemplate: (container: HTMLElement, model: any) => boolean;

    static parse(settings: any): Settings {
        const result = new Settings();
        if(settings) {
            if(isDefined(settings.viewType))
                result.viewType = settings.viewType;
            if(isDefined(settings.taskTitlePosition))
                result.taskTitlePosition = settings.taskTitlePosition;
            if(isDefined(settings.showResources))
                result.showResources = settings.showResources;
            if(isDefined(settings.showDependencies))
                result.showDependencies = settings.showDependencies;
            if(isDefined(settings.areHorizontalBordersEnabled))
                result.areHorizontalBordersEnabled = settings.areHorizontalBordersEnabled;
            if(isDefined(settings.areVerticalBordersEnabled))
                result.areHorizontalBordersEnabled = settings.areHorizontalBordersEnabled;
            if(isDefined(settings.areAlternateRowsEnabled))
                result.areAlternateRowsEnabled = settings.areAlternateRowsEnabled;
            if(isDefined(settings.allowSelectTask))
                result.allowSelectTask = settings.allowSelectTask;
            if(isDefined(settings.firstDayOfWeek))
                result.firstDayOfWeek = settings.firstDayOfWeek;
            if(isDefined(settings.startDateRange))
                result.startDateRange = new Date(settings.startDateRange);
            if(isDefined(settings.endDateRange))
                result.endDateRange = new Date(settings.endDateRange);
            if(isDefined(settings.editing))
                result.editing = EditingSettings.parse(settings.editing);
            if(isDefined(settings.validation))
                result.validation = ValidationSettings.parse(settings.validation);
            if(isDefined(settings.stripLines))
                result.stripLines = StripLineSettings.parse(settings.stripLines);
            if(isDefined(settings.viewTypeRange))
                result.viewTypeRange = ViewTypeRangeSettings.parse(settings.viewTypeRange);
            if(isDefined(settings.taskTooltipContentTemplate))
                result.taskTooltipContentTemplate = settings.taskTooltipContentTemplate;
            if(isDefined(settings.taskProgressTooltipContentTemplate))
                result.taskProgressTooltipContentTemplate = settings.taskProgressTooltipContentTemplate;
            if(isDefined(settings.taskTimeTooltipContentTemplate))
                result.taskTimeTooltipContentTemplate = settings.taskTimeTooltipContentTemplate;
            if(isDefined(settings.taskContentTemplate))
                result.taskContentTemplate = settings.taskContentTemplate;
            if(isDefined(settings.cultureInfo))
                result.cultureInfo = settings.cultureInfo;

        }
        return result;
    }
    equal(settings: Settings): boolean {
        let result = true;
        result = result && this.viewType === settings.viewType;
        result = result && this.taskTitlePosition === settings.taskTitlePosition;
        result = result && this.showResources === settings.showResources;
        result = result && this.showDependencies === settings.showDependencies;
        result = result && this.areHorizontalBordersEnabled === settings.areHorizontalBordersEnabled;
        result = result && this.areAlternateRowsEnabled === settings.areAlternateRowsEnabled;
        result = result && this.allowSelectTask === settings.allowSelectTask;
        result = result && this.editing.equal(settings.editing);
        result = result && this.validation.equal(settings.validation);
        result = result && this.stripLines.equal(settings.stripLines);
        result = result && DateTimeUtils.areDatesEqual(this.startDateRange, settings.startDateRange);
        result = result && DateTimeUtils.areDatesEqual(this.endDateRange, settings.endDateRange);

        return result;
    }
}
